from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from enum import Enum
from bson import ObjectId
import pydantic
import os
import logging
import uuid
import json
import asyncio
import aiofiles
from pathlib import Path
import ollama
import base64
import re

# Fix MongoDB ObjectId serialization issue with Pydantic/FastAPI
pydantic.json.ENCODERS_BY_TYPE[ObjectId] = str

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="UPSC AI Companion API")
api_router = APIRouter(prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enums
class Subject(str, Enum):
    GS1 = "gs1"
    GS2 = "gs2"
    GS3 = "gs3"
    GS4 = "gs4"
    ESSAY = "essay"
    OPTIONAL = "optional"
    CSAT = "csat"

class ResourceKind(str, Enum):
    PDF = "pdf"
    IMAGE = "image"
    YOUTUBE = "youtube"
    LINK = "link"
    NOTE = "note"
    AI_GENERATED = "ai_generated"

class ResourceStatus(str, Enum):
    UPLOADED = "uploaded"
    PARSED = "parsed"
    INDEXED = "indexed"

class PlanItemStatus(str, Enum):
    PENDING = "pending"
    DONE = "done"
    SKIPPED = "skipped"

class ChatMode(str, Enum):
    GENERAL = "general"
    RAG = "rag"
    PLANNER = "planner"

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Profile(BaseModel):
    user_id: str
    name: str
    exam_date: Optional[str] = None
    optional_subject: Optional[str] = None
    hours_per_day: Optional[int] = 6
    device_token: Optional[str] = None
    streak_count: int = 0
    total_study_minutes: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    folder_id: Optional[str] = None
    kind: ResourceKind
    title: str
    content: Optional[str] = None  # base64 for images, text for notes
    url: Optional[str] = None
    meta: Optional[Dict[str, Any]] = {}
    status: ResourceStatus = ResourceStatus.UPLOADED
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StudyPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    start_date: str
    end_date: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PlanItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plan_id: str
    user_id: str
    date: str
    subject: Subject
    topic: str
    target_minutes: int
    actual_minutes: int = 0
    status: PlanItemStatus = PlanItemStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    mode: ChatMode = ChatMode.GENERAL
    context: Optional[Dict[str, Any]] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MCQSet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    subject: Optional[Subject] = None
    questions: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Flashcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    front: str
    back: str
    subject: Optional[Subject] = None
    ease: float = 2.5
    interval_days: int = 1
    reps: int = 0
    next_review_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnswerEvaluation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question: str
    answer_image: str  # base64
    ocr_text: Optional[str] = None
    score: Optional[int] = None
    rubric: Optional[Dict[str, int]] = {}
    suggestions: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models
class AuthRequest(BaseModel):
    phone: str
    otp: str

class ProfileSetupRequest(BaseModel):
    name: str
    exam_date: Optional[str] = None
    optional_subject: Optional[str] = None
    hours_per_day: Optional[int] = 6

class ChatRequest(BaseModel):
    session_id: str
    message: str
    mode: ChatMode = ChatMode.GENERAL
    context: Optional[Dict[str, Any]] = {}

class ResourceCreateRequest(BaseModel):
    title: str
    kind: ResourceKind
    content: Optional[str] = None
    url: Optional[str] = None
    folder_id: Optional[str] = None

class PlanGenerateRequest(BaseModel):
    exam_date: str
    hours_per_day: int
    subjects: List[Subject]
    weak_areas: Optional[List[str]] = []

class StudyLogRequest(BaseModel):
    plan_item_id: str
    minutes: int
    status: PlanItemStatus

class MCQGenerateRequest(BaseModel):
    subject: Subject
    topic: Optional[str] = None
    count: int = 5

class FlashcardGenerateRequest(BaseModel):
    subject: Subject
    topic: str
    count: int = 10

class EvaluationRequest(BaseModel):
    question: str
    answer_image: str  # base64

# Initialize Ollama client
try:
    ollama_client = ollama.Client()
    # Try to pull mistral if not available
    try:
        ollama_client.show('mistral:7b')
    except:
        logger.info("Pulling Mistral 7B model...")
        ollama_client.pull('mistral:7b')
except Exception as e:
    logger.warning(f"Ollama not available: {e}")
    ollama_client = None

# Helper Functions
def get_ollama_response(prompt: str, context: str = "") -> str:
    """Get response from Ollama Mistral model"""
    if not ollama_client:
        return "Sorry, AI service is currently unavailable. Please try again later."
    
    try:
        full_prompt = f"{context}\n\nUser: {prompt}\n\nAssistant:"
        response = ollama_client.generate(
            model='mistral:7b',
            prompt=full_prompt,
            options={
                'temperature': 0.7,
                'max_tokens': 1000
            }
        )
        return response['response']
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        return "I'm having trouble processing your request. Please try again."

def extract_text_from_image(base64_image: str) -> str:
    """Mock OCR function - would use actual OCR in production"""
    # This is a mock implementation
    return "This is mock extracted text from the image. In production, this would use actual OCR technology like PaddleOCR or Google Vision API."

def generate_study_plan(exam_date: str, hours_per_day: int, subjects: List[Subject]) -> List[Dict]:
    """Generate a simple study plan"""
    from datetime import datetime, timedelta
    
    plan_items = []
    exam_dt = datetime.strptime(exam_date, "%Y-%m-%d")
    days_until_exam = (exam_dt - datetime.now()).days
    
    # Simple algorithm: distribute topics across subjects
    topics_per_subject = {
        Subject.GS1: ["Indian Heritage", "History", "Geography", "Society"],
        Subject.GS2: ["Governance", "Constitution", "Polity", "Social Justice"],
        Subject.GS3: ["Economy", "Environment", "Security", "Technology"],
        Subject.GS4: ["Ethics", "Integrity", "Case Studies", "Applications"],
        Subject.ESSAY: ["Essay Writing", "Current Topics", "Practice"],
        Subject.CSAT: ["Quantitative", "Reasoning", "Comprehension"]
    }
    
    current_date = datetime.now().date()
    for i in range(min(14, days_until_exam)):  # Plan for next 2 weeks
        date_str = (current_date + timedelta(days=i)).isoformat()
        subject = subjects[i % len(subjects)]
        topics = topics_per_subject.get(subject, ["General Study"])
        topic = topics[i % len(topics)]
        
        plan_items.append({
            "date": date_str,
            "subject": subject,
            "topic": topic,
            "target_minutes": hours_per_day * 60 // len(subjects)
        })
    
    return plan_items

# Auth Endpoints
@api_router.post("/auth/verify")
async def verify_auth(request: AuthRequest):
    """Mock authentication - always succeeds"""
    # In real app, verify OTP here
    if request.otp != "123456":  # Mock OTP
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Create or get user
    user_data = {
        "phone": request.phone,
        "created_at": datetime.utcnow()
    }
    
    existing_user = await db.users.find_one({"phone": request.phone})
    if existing_user:
        user_id = existing_user["id"]
    else:
        user_id = str(uuid.uuid4())
        user_data["id"] = user_id
        await db.users.insert_one(user_data)
    
    # Generate mock JWT token
    token = f"mock_jwt_token_{user_id}"
    
    return {"token": token, "user_id": user_id}

@api_router.get("/me")
async def get_current_user(user_id: str = "mock_user"):
    """Get current user profile"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await db.profiles.find_one({"user_id": user_id})
    
    return {
        "user": user,
        "profile": profile
    }

@api_router.post("/profile/setup")
async def setup_profile(request: ProfileSetupRequest, user_id: str = "mock_user"):
    """Setup user profile"""
    profile_data = request.dict()
    profile_data["user_id"] = user_id
    profile_data["updated_at"] = datetime.utcnow()
    
    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": profile_data},
        upsert=True
    )
    
    return {"message": "Profile updated successfully"}

# Chat Endpoints
@api_router.post("/chat/message")
async def send_chat_message(request: ChatRequest, user_id: str = "mock_user"):
    """Send a chat message and get AI response"""
    # Store user message
    user_message = ChatMessage(
        user_id=user_id,
        session_id=request.session_id,
        role="user",
        content=request.message,
        mode=request.mode,
        context=request.context or {}
    )
    await db.chat_messages.insert_one(user_message.dict())
    
    # Generate AI response based on mode
    context = ""
    if request.mode == ChatMode.RAG:
        context = "You are a UPSC preparation assistant. Use the provided context to answer questions."
    elif request.mode == ChatMode.PLANNER:
        context = "You are a study planning assistant for UPSC preparation. Help create and manage study schedules."
    else:
        context = "You are a helpful UPSC preparation assistant. Provide accurate, detailed information about UPSC exams, current affairs, and study strategies."
    
    ai_response = get_ollama_response(request.message, context)
    
    # Store AI response
    ai_message = ChatMessage(
        user_id=user_id,
        session_id=request.session_id,
        role="assistant",
        content=ai_response,
        mode=request.mode,
        context=request.context or {}
    )
    await db.chat_messages.insert_one(ai_message.dict())
    
    return {
        "response": ai_response,
        "message_id": ai_message.id
    }

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str, user_id: str = "mock_user"):
    """Get chat history for a session"""
    messages = await db.chat_messages.find({
        "user_id": user_id,
        "session_id": session_id
    }).sort("created_at", 1).to_list(1000)
    
    return {"messages": messages}

# Resource Endpoints
@api_router.post("/resources")
async def create_resource(request: ResourceCreateRequest, user_id: str = "mock_user"):
    """Create a new resource"""
    resource = Resource(
        user_id=user_id,
        **request.dict()
    )
    
    await db.resources.insert_one(resource.dict())
    
    # Mock processing - set status to indexed after 2 seconds
    asyncio.create_task(mock_process_resource(resource.id))
    
    return resource

async def mock_process_resource(resource_id: str):
    """Mock resource processing"""
    await asyncio.sleep(2)
    await db.resources.update_one(
        {"id": resource_id},
        {"$set": {"status": ResourceStatus.PARSED}}
    )
    await asyncio.sleep(3)
    await db.resources.update_one(
        {"id": resource_id},
        {"$set": {"status": ResourceStatus.INDEXED}}
    )

@api_router.get("/resources")
async def get_resources(user_id: str = "mock_user"):
    """Get user resources"""
    resources = await db.resources.find({"user_id": user_id}).sort("created_at", -1).to_list(1000)
    return {"resources": resources}

# Study Plan Endpoints
@api_router.post("/planner/generate")
async def generate_plan(request: PlanGenerateRequest, user_id: str = "mock_user"):
    """Generate a study plan"""
    # Create study plan
    plan = StudyPlan(
        user_id=user_id,
        name=f"UPSC Study Plan - {datetime.now().strftime('%B %Y')}",
        start_date=datetime.now().date().isoformat(),
        end_date=request.exam_date
    )
    await db.study_plans.insert_one(plan.dict())
    
    # Generate plan items
    plan_items_data = generate_study_plan(request.exam_date, request.hours_per_day, request.subjects)
    
    for item_data in plan_items_data:
        plan_item = PlanItem(
            plan_id=plan.id,
            user_id=user_id,
            **item_data
        )
        await db.plan_items.insert_one(plan_item.dict())
    
    return {"plan_id": plan.id, "message": "Study plan generated successfully"}

@api_router.get("/planner/items")
async def get_plan_items(date: Optional[str] = None, user_id: str = "mock_user"):
    """Get plan items for a date or all items"""
    query = {"user_id": user_id}
    if date:
        query["date"] = date
    
    items = await db.plan_items.find(query).sort("created_at", 1).to_list(1000)
    return {"items": items}

@api_router.post("/planner/log")
async def log_study_progress(request: StudyLogRequest, user_id: str = "mock_user"):
    """Log study progress"""
    await db.plan_items.update_one(
        {"id": request.plan_item_id, "user_id": user_id},
        {"$set": {
            "actual_minutes": request.minutes,
            "status": request.status
        }}
    )
    
    # Update profile stats
    if request.status == PlanItemStatus.DONE:
        await db.profiles.update_one(
            {"user_id": user_id},
            {"$inc": {"total_study_minutes": request.minutes}}
        )
    
    return {"message": "Progress logged successfully"}

# MCQ Endpoints
@api_router.post("/mcq/generate")
async def generate_mcqs(request: MCQGenerateRequest, user_id: str = "mock_user"):
    """Generate MCQ questions"""
    # Mock MCQ generation
    questions = []
    for i in range(request.count):
        questions.append({
            "id": str(uuid.uuid4()),
            "stem": f"Sample MCQ question {i+1} for {request.subject}",
            "options": [f"Option A {i+1}", f"Option B {i+1}", f"Option C {i+1}", f"Option D {i+1}"],
            "answer_index": i % 4,
            "explanation": f"Explanation for question {i+1}"
        })
    
    mcq_set = MCQSet(
        user_id=user_id,
        title=f"{request.subject} MCQs - {request.topic or 'General'}",
        subject=request.subject,
        questions=questions
    )
    
    await db.mcq_sets.insert_one(mcq_set.dict())
    
    return mcq_set

# Flashcard Endpoints
@api_router.post("/flashcards/generate")
async def generate_flashcards(request: FlashcardGenerateRequest, user_id: str = "mock_user"):
    """Generate flashcards"""
    flashcards = []
    
    for i in range(request.count):
        flashcard = Flashcard(
            user_id=user_id,
            front=f"Question about {request.topic} - {i+1}",
            back=f"Answer for {request.topic} question {i+1}",
            subject=request.subject
        )
        flashcards.append(flashcard.dict())
    
    await db.flashcards.insert_many(flashcards)
    
    return {"flashcards": flashcards, "count": len(flashcards)}

@api_router.get("/flashcards/review")
async def get_flashcards_for_review(user_id: str = "mock_user"):
    """Get flashcards due for review"""
    now = datetime.utcnow()
    flashcards = await db.flashcards.find({
        "user_id": user_id,
        "next_review_at": {"$lte": now}
    }).limit(20).to_list(20)
    
    return {"flashcards": flashcards}

# Answer Evaluation Endpoints
@api_router.post("/evaluation/answer")
async def evaluate_answer(request: EvaluationRequest, user_id: str = "mock_user"):
    """Evaluate a mains answer"""
    # Extract text from image (mock)
    ocr_text = extract_text_from_image(request.answer_image)
    
    # Generate evaluation using AI
    evaluation_prompt = f"""
    Question: {request.question}
    
    Answer Text: {ocr_text}
    
    Please evaluate this UPSC Mains answer on a scale of 1-10 based on:
    1. Structure (2 points)
    2. Content Relevance (3 points)
    3. Examples and Facts (2 points)
    4. Language and Clarity (2 points)
    5. Conclusion (1 point)
    
    Provide specific suggestions for improvement.
    """
    
    ai_evaluation = get_ollama_response(evaluation_prompt)
    
    # Parse AI response to extract scores (mock parsing)
    rubric = {
        "structure": 7,
        "relevance": 8,
        "examples": 6,
        "language": 7,
        "conclusion": 6
    }
    total_score = sum(rubric.values())
    
    evaluation = AnswerEvaluation(
        user_id=user_id,
        question=request.question,
        answer_image=request.answer_image,
        ocr_text=ocr_text,
        score=total_score,
        rubric=rubric,
        suggestions=ai_evaluation
    )
    
    await db.evaluations.insert_one(evaluation.dict())
    
    return evaluation

# Analytics Endpoints
@api_router.get("/analytics/dashboard")
async def get_analytics_dashboard(user_id: str = "mock_user"):
    """Get analytics dashboard data"""
    # Get profile for basic stats
    profile = await db.profiles.find_one({"user_id": user_id})
    
    # Get recent study logs
    recent_items = await db.plan_items.find({
        "user_id": user_id,
        "status": PlanItemStatus.DONE
    }).sort("created_at", -1).limit(30).to_list(30)
    
    # Calculate stats
    total_minutes = sum(item.get("actual_minutes", 0) for item in recent_items)
    completion_rate = len([item for item in recent_items if item["status"] == "done"]) / max(len(recent_items), 1) * 100
    
    # Subject-wise breakdown
    subject_stats = {}
    for item in recent_items:
        subject = item["subject"]
        if subject not in subject_stats:
            subject_stats[subject] = {"minutes": 0, "completed": 0, "total": 0}
        subject_stats[subject]["minutes"] += item.get("actual_minutes", 0)
        subject_stats[subject]["total"] += 1
        if item["status"] == "done":
            subject_stats[subject]["completed"] += 1
    
    return {
        "total_study_minutes": total_minutes,
        "streak_count": profile.get("streak_count", 0) if profile else 0,
        "completion_rate": completion_rate,
        "subject_stats": subject_stats,
        "weekly_minutes": [total_minutes // 7] * 7  # Mock weekly data
    }

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "UPSC AI Companion API is running", "version": "1.0.0"}

# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
