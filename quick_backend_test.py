#!/usr/bin/env python3
"""
Quick Backend Test - Non-AI endpoints only
"""

import requests
import json
import uuid
from datetime import datetime, timedelta

BACKEND_URL = "http://localhost:8001/api"

def quick_test():
    print("🚀 Quick UPSC Backend API Test (Non-AI endpoints)")
    print("=" * 50)
    
    results = {}
    
    # 1. Root endpoint
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        if response.status_code == 200:
            print("✅ Root API: Working")
            results["root"] = True
        else:
            print(f"❌ Root API: Status {response.status_code}")
            results["root"] = False
    except Exception as e:
        print(f"❌ Root API: {e}")
        results["root"] = False
    
    # 2. Authentication
    try:
        response = requests.post(f"{BACKEND_URL}/auth/verify", json={
            "phone": "+919876543210",
            "otp": "123456"
        }, timeout=10)
        if response.status_code == 200:
            data = response.json()
            user_id = data.get("user_id")
            print(f"✅ Authentication: Working (user_id: {user_id[:8]}...)")
            results["auth"] = True
        else:
            print(f"❌ Authentication: Status {response.status_code}")
            results["auth"] = False
            user_id = "mock_user"
    except Exception as e:
        print(f"❌ Authentication: {e}")
        results["auth"] = False
        user_id = "mock_user"
    
    # 3. User profile
    try:
        response = requests.get(f"{BACKEND_URL}/me", params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            print("✅ User Profile: Working")
            results["profile"] = True
        elif response.status_code == 404:
            print("✅ User Profile: Working (404 expected for new user)")
            results["profile"] = True
        else:
            print(f"❌ User Profile: Status {response.status_code}")
            results["profile"] = False
    except Exception as e:
        print(f"❌ User Profile: {e}")
        results["profile"] = False
    
    # 4. Resources
    try:
        response = requests.post(f"{BACKEND_URL}/resources", json={
            "title": "UPSC Test Resource",
            "kind": "note",
            "content": "Test content for UPSC preparation"
        }, params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            print("✅ Create Resource: Working")
            results["resource_create"] = True
        else:
            print(f"❌ Create Resource: Status {response.status_code}")
            results["resource_create"] = False
    except Exception as e:
        print(f"❌ Create Resource: {e}")
        results["resource_create"] = False
    
    try:
        response = requests.get(f"{BACKEND_URL}/resources", params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("resources", []))
            print(f"✅ Get Resources: Working ({count} resources)")
            results["resource_get"] = True
        else:
            print(f"❌ Get Resources: Status {response.status_code}")
            results["resource_get"] = False
    except Exception as e:
        print(f"❌ Get Resources: {e}")
        results["resource_get"] = False
    
    # 5. Study Planner
    try:
        exam_date = (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")
        response = requests.post(f"{BACKEND_URL}/planner/generate", json={
            "exam_date": exam_date,
            "hours_per_day": 6,
            "subjects": ["gs1", "gs2"],
            "weak_areas": ["History"]
        }, params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            print("✅ Generate Study Plan: Working")
            results["planner_generate"] = True
        else:
            print(f"❌ Generate Study Plan: Status {response.status_code}")
            results["planner_generate"] = False
    except Exception as e:
        print(f"❌ Generate Study Plan: {e}")
        results["planner_generate"] = False
    
    try:
        response = requests.get(f"{BACKEND_URL}/planner/items", params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("items", []))
            print(f"✅ Get Plan Items: Working ({count} items)")
            results["planner_items"] = True
        else:
            print(f"❌ Get Plan Items: Status {response.status_code}")
            results["planner_items"] = False
    except Exception as e:
        print(f"❌ Get Plan Items: {e}")
        results["planner_items"] = False
    
    # 6. MCQ Generation (mock data, no AI)
    try:
        response = requests.post(f"{BACKEND_URL}/mcq/generate", json={
            "subject": "gs1",
            "topic": "History",
            "count": 3
        }, params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("questions", []))
            print(f"✅ Generate MCQs: Working ({count} questions)")
            results["mcq"] = True
        else:
            print(f"❌ Generate MCQs: Status {response.status_code}")
            results["mcq"] = False
    except Exception as e:
        print(f"❌ Generate MCQs: {e}")
        results["mcq"] = False
    
    # 7. Flashcards (mock data, no AI)
    try:
        response = requests.post(f"{BACKEND_URL}/flashcards/generate", json={
            "subject": "gs2",
            "topic": "Polity",
            "count": 5
        }, params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = data.get("count", 0)
            print(f"✅ Generate Flashcards: Working ({count} flashcards)")
            results["flashcard_generate"] = True
        else:
            print(f"❌ Generate Flashcards: Status {response.status_code}")
            results["flashcard_generate"] = False
    except Exception as e:
        print(f"❌ Generate Flashcards: {e}")
        results["flashcard_generate"] = False
    
    try:
        response = requests.get(f"{BACKEND_URL}/flashcards/review", params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("flashcards", []))
            print(f"✅ Get Flashcards for Review: Working ({count} flashcards)")
            results["flashcard_review"] = True
        else:
            print(f"❌ Get Flashcards for Review: Status {response.status_code}")
            results["flashcard_review"] = False
    except Exception as e:
        print(f"❌ Get Flashcards for Review: {e}")
        results["flashcard_review"] = False
    
    # 8. Analytics
    try:
        response = requests.get(f"{BACKEND_URL}/analytics/dashboard", params={"user_id": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Analytics Dashboard: Working")
            results["analytics"] = True
        else:
            print(f"❌ Analytics Dashboard: Status {response.status_code}")
            results["analytics"] = False
    except Exception as e:
        print(f"❌ Analytics Dashboard: {e}")
        results["analytics"] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for success in results.values() if success)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    # Test AI endpoints separately (they might fail due to Ollama issues)
    print(f"\n🤖 AI-POWERED ENDPOINTS STATUS:")
    print("Note: These endpoints require Ollama Mistral 7B model")
    
    # Chat endpoint
    try:
        session_id = str(uuid.uuid4())
        response = requests.post(f"{BACKEND_URL}/chat/message", json={
            "session_id": session_id,
            "message": "Hello",
            "mode": "general"
        }, params={"user_id": user_id}, timeout=20)
        if response.status_code == 200:
            data = response.json()
            ai_response = data.get("response", "")
            if "AI service is currently unavailable" in ai_response:
                print("⚠️  Chat System: Backend working, but Ollama unavailable")
                results["chat_backend"] = True
                results["chat_ai"] = False
            else:
                print("✅ Chat System: Fully working with AI")
                results["chat_backend"] = True
                results["chat_ai"] = True
        else:
            print(f"❌ Chat System: Status {response.status_code}")
            results["chat_backend"] = False
            results["chat_ai"] = False
    except Exception as e:
        print(f"❌ Chat System: {e}")
        results["chat_backend"] = False
        results["chat_ai"] = False
    
    # Answer evaluation
    try:
        mock_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        response = requests.post(f"{BACKEND_URL}/evaluation/answer", json={
            "question": "Test question",
            "answer_image": mock_image
        }, params={"user_id": user_id}, timeout=20)
        if response.status_code == 200:
            data = response.json()
            suggestions = data.get("suggestions", "")
            if "having trouble processing" in suggestions:
                print("⚠️  Answer Evaluation: Backend working, but Ollama unavailable")
                results["eval_backend"] = True
                results["eval_ai"] = False
            else:
                print("✅ Answer Evaluation: Fully working with AI")
                results["eval_backend"] = True
                results["eval_ai"] = True
        else:
            print(f"❌ Answer Evaluation: Status {response.status_code}")
            results["eval_backend"] = False
            results["eval_ai"] = False
    except Exception as e:
        print(f"❌ Answer Evaluation: {e}")
        results["eval_backend"] = False
        results["eval_ai"] = False
    
    return results

if __name__ == "__main__":
    quick_test()