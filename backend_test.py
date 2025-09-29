#!/usr/bin/env python3
"""
UPSC AI Companion Backend API Test Suite
Tests all backend endpoints with realistic UPSC preparation data
"""

import requests
import json
import base64
import uuid
from datetime import datetime, timedelta
import time

# Backend URL from frontend .env
BACKEND_URL = "https://upsc-ai-buddy.preview.emergentagent.com/api"

class UPSCBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.user_id = "mock_user"
        self.token = None
        self.session_id = str(uuid.uuid4())
        self.test_results = []
        
    def log_test(self, test_name, success, details="", error=""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if error:
            print(f"   Error: {error}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_auth_verify(self):
        """Test authentication endpoint"""
        try:
            # Test with correct OTP
            response = self.session.post(f"{BACKEND_URL}/auth/verify", json={
                "phone": "+919876543210",
                "otp": "123456"
            })
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user_id" in data:
                    self.token = data["token"]
                    self.log_test("Authentication - Valid OTP", True, 
                                f"Token received: {data['token'][:20]}...")
                else:
                    self.log_test("Authentication - Valid OTP", False, 
                                "Missing token or user_id in response")
            else:
                self.log_test("Authentication - Valid OTP", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test with invalid OTP
            response = self.session.post(f"{BACKEND_URL}/auth/verify", json={
                "phone": "+919876543210",
                "otp": "000000"
            })
            
            if response.status_code == 400:
                self.log_test("Authentication - Invalid OTP", True, 
                            "Correctly rejected invalid OTP")
            else:
                self.log_test("Authentication - Invalid OTP", False, 
                            f"Should have returned 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Authentication", False, error=str(e))

    def test_get_current_user(self):
        """Test get current user endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/me?user_id={self.user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data:
                    self.log_test("Get Current User", True, 
                                f"User data retrieved successfully")
                else:
                    self.log_test("Get Current User", False, 
                                "Missing user data in response")
            else:
                self.log_test("Get Current User", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Get Current User", False, error=str(e))

    def test_chat_system(self):
        """Test chat system endpoints"""
        try:
            # Test sending a UPSC-related message
            chat_request = {
                "session_id": self.session_id,
                "message": "What are the key topics in Indian Polity for UPSC Mains?",
                "mode": "general"
            }
            
            response = self.session.post(f"{BACKEND_URL}/chat/message?user_id={self.user_id}", 
                                       json=chat_request)
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and "message_id" in data:
                    ai_response = data["response"]
                    if len(ai_response) > 10:  # Check if we got a meaningful response
                        self.log_test("Chat - Send Message", True, 
                                    f"AI Response length: {len(ai_response)} chars")
                    else:
                        self.log_test("Chat - Send Message", False, 
                                    f"AI response too short: {ai_response}")
                else:
                    self.log_test("Chat - Send Message", False, 
                                "Missing response or message_id")
            else:
                self.log_test("Chat - Send Message", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test getting chat history
            response = self.session.get(f"{BACKEND_URL}/chat/history/{self.session_id}?user_id={self.user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "messages" in data and len(data["messages"]) >= 2:  # User + AI message
                    self.log_test("Chat - Get History", True, 
                                f"Retrieved {len(data['messages'])} messages")
                else:
                    self.log_test("Chat - Get History", False, 
                                f"Expected at least 2 messages, got {len(data.get('messages', []))}")
            else:
                self.log_test("Chat - Get History", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Chat System", False, error=str(e))

    def test_resource_management(self):
        """Test resource management endpoints"""
        try:
            # Test creating a resource
            resource_request = {
                "title": "Indian Constitution - Fundamental Rights",
                "kind": "note",
                "content": "Article 14-32 deal with Fundamental Rights. Key points: Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, Right to Constitutional Remedies."
            }
            
            response = self.session.post(f"{BACKEND_URL}/resources?user_id={self.user_id}", 
                                       json=resource_request)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "title" in data:
                    resource_id = data["id"]
                    self.log_test("Resources - Create", True, 
                                f"Resource created with ID: {resource_id}")
                else:
                    self.log_test("Resources - Create", False, 
                                "Missing id or title in response")
            else:
                self.log_test("Resources - Create", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test getting resources
            response = self.session.get(f"{BACKEND_URL}/resources?user_id={self.user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "resources" in data:
                    self.log_test("Resources - Get All", True, 
                                f"Retrieved {len(data['resources'])} resources")
                else:
                    self.log_test("Resources - Get All", False, 
                                "Missing resources in response")
            else:
                self.log_test("Resources - Get All", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Resource Management", False, error=str(e))

    def test_study_planner(self):
        """Test study planner endpoints"""
        try:
            # Test generating a study plan
            exam_date = (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")
            plan_request = {
                "exam_date": exam_date,
                "hours_per_day": 8,
                "subjects": ["gs1", "gs2", "gs3", "gs4", "essay"],
                "weak_areas": ["Indian Geography", "Current Affairs"]
            }
            
            response = self.session.post(f"{BACKEND_URL}/planner/generate?user_id={self.user_id}", 
                                       json=plan_request)
            
            if response.status_code == 200:
                data = response.json()
                if "plan_id" in data and "message" in data:
                    plan_id = data["plan_id"]
                    self.log_test("Study Planner - Generate", True, 
                                f"Plan created with ID: {plan_id}")
                else:
                    self.log_test("Study Planner - Generate", False, 
                                "Missing plan_id or message in response")
            else:
                self.log_test("Study Planner - Generate", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test getting plan items
            response = self.session.get(f"{BACKEND_URL}/planner/items?user_id={self.user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "items" in data:
                    items = data["items"]
                    self.log_test("Study Planner - Get Items", True, 
                                f"Retrieved {len(items)} plan items")
                    
                    # Test logging study progress if we have items
                    if items:
                        item_id = items[0]["id"]
                        log_request = {
                            "plan_item_id": item_id,
                            "minutes": 120,
                            "status": "done"
                        }
                        
                        response = self.session.post(f"{BACKEND_URL}/planner/log?user_id={self.user_id}", 
                                                   json=log_request)
                        
                        if response.status_code == 200:
                            self.log_test("Study Planner - Log Progress", True, 
                                        "Progress logged successfully")
                        else:
                            self.log_test("Study Planner - Log Progress", False, 
                                        f"Status: {response.status_code}")
                else:
                    self.log_test("Study Planner - Get Items", False, 
                                "Missing items in response")
            else:
                self.log_test("Study Planner - Get Items", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Study Planner", False, error=str(e))

    def test_mcq_generation(self):
        """Test MCQ generation endpoint"""
        try:
            mcq_request = {
                "subject": "gs2",
                "topic": "Indian Constitution",
                "count": 5
            }
            
            response = self.session.post(f"{BACKEND_URL}/mcq/generate?user_id={self.user_id}", 
                                       json=mcq_request)
            
            if response.status_code == 200:
                data = response.json()
                if "questions" in data and len(data["questions"]) == 5:
                    questions = data["questions"]
                    # Check if questions have required fields
                    first_q = questions[0]
                    if all(key in first_q for key in ["stem", "options", "answer_index", "explanation"]):
                        self.log_test("MCQ Generation", True, 
                                    f"Generated {len(questions)} MCQs with proper structure")
                    else:
                        self.log_test("MCQ Generation", False, 
                                    "MCQ questions missing required fields")
                else:
                    self.log_test("MCQ Generation", False, 
                                f"Expected 5 questions, got {len(data.get('questions', []))}")
            else:
                self.log_test("MCQ Generation", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("MCQ Generation", False, error=str(e))

    def test_flashcard_system(self):
        """Test flashcard generation and review endpoints"""
        try:
            # Test generating flashcards
            flashcard_request = {
                "subject": "gs1",
                "topic": "Ancient Indian History",
                "count": 10
            }
            
            response = self.session.post(f"{BACKEND_URL}/flashcards/generate?user_id={self.user_id}", 
                                       json=flashcard_request)
            
            if response.status_code == 200:
                data = response.json()
                if "flashcards" in data and "count" in data:
                    count = data["count"]
                    if count == 10:
                        self.log_test("Flashcards - Generate", True, 
                                    f"Generated {count} flashcards")
                    else:
                        self.log_test("Flashcards - Generate", False, 
                                    f"Expected 10 flashcards, got {count}")
                else:
                    self.log_test("Flashcards - Generate", False, 
                                "Missing flashcards or count in response")
            else:
                self.log_test("Flashcards - Generate", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            
            # Test getting flashcards for review
            response = self.session.get(f"{BACKEND_URL}/flashcards/review?user_id={self.user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "flashcards" in data:
                    self.log_test("Flashcards - Get Review", True, 
                                f"Retrieved {len(data['flashcards'])} flashcards for review")
                else:
                    self.log_test("Flashcards - Get Review", False, 
                                "Missing flashcards in response")
            else:
                self.log_test("Flashcards - Get Review", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Flashcard System", False, error=str(e))

    def test_answer_evaluation(self):
        """Test answer evaluation endpoint"""
        try:
            # Create a mock base64 image (small PNG)
            mock_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            
            evaluation_request = {
                "question": "Discuss the significance of the 73rd and 74th Constitutional Amendments in strengthening grassroots democracy in India.",
                "answer_image": mock_image_b64
            }
            
            response = self.session.post(f"{BACKEND_URL}/evaluation/answer?user_id={self.user_id}", 
                                       json=evaluation_request)
            
            if response.status_code == 200:
                data = response.json()
                if all(key in data for key in ["score", "rubric", "suggestions", "ocr_text"]):
                    score = data["score"]
                    self.log_test("Answer Evaluation", True, 
                                f"Answer evaluated with score: {score}")
                else:
                    self.log_test("Answer Evaluation", False, 
                                "Missing required fields in evaluation response")
            else:
                self.log_test("Answer Evaluation", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Answer Evaluation", False, error=str(e))

    def test_analytics_dashboard(self):
        """Test analytics dashboard endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/analytics/dashboard?user_id={self.user_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_study_minutes", "streak_count", "completion_rate", 
                                 "subject_stats", "weekly_minutes"]
                
                if all(field in data for field in required_fields):
                    self.log_test("Analytics Dashboard", True, 
                                f"Dashboard data retrieved with all required fields")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Analytics Dashboard", False, 
                                f"Missing fields: {missing}")
            else:
                self.log_test("Analytics Dashboard", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Analytics Dashboard", False, error=str(e))

    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("Root Endpoint", True, 
                                f"API running - {data['message']}")
                else:
                    self.log_test("Root Endpoint", False, 
                                "Missing message or version in response")
            else:
                self.log_test("Root Endpoint", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Root Endpoint", False, error=str(e))

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting UPSC AI Companion Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Test all endpoints
        self.test_root_endpoint()
        self.test_auth_verify()
        self.test_get_current_user()
        self.test_chat_system()
        self.test_resource_management()
        self.test_study_planner()
        self.test_mcq_generation()
        self.test_flashcard_system()
        self.test_answer_evaluation()
        self.test_analytics_dashboard()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = UPSCBackendTester()
    results = tester.run_all_tests()