#!/usr/bin/env python3
"""
Targeted UPSC Backend API Test - Tests with proper user flow
"""

import requests
import json
import uuid
from datetime import datetime, timedelta

BACKEND_URL = "http://localhost:8001/api"

def test_with_timeout(name, method, url, data=None, params=None, timeout=15):
    """Test endpoint with timeout"""
    try:
        print(f"Testing {name}...")
        if method.upper() == "GET":
            response = requests.get(url, params=params, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, params=params, timeout=timeout)
        
        print(f"✅ {name}: Status {response.status_code}")
        if response.status_code in [200, 201]:
            result = response.json()
            return True, result
        else:
            print(f"   Error: {response.text[:200]}")
            return False, response.text
            
    except requests.exceptions.Timeout:
        print(f"❌ {name}: Request timed out after {timeout}s")
        return False, "Timeout"
    except Exception as e:
        print(f"❌ {name}: {str(e)}")
        return False, str(e)

def main():
    print("🚀 Testing UPSC AI Companion Backend API - Targeted Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    results = {}
    user_id = None
    
    # 1. Test root endpoint (should be fast)
    print("\n1. Testing Basic Endpoints")
    success, data = test_with_timeout("Root API", "GET", f"{BACKEND_URL}/", timeout=5)
    results["root"] = success
    
    # 2. Test authentication to get a real user_id
    print("\n2. Testing Authentication")
    success, data = test_with_timeout("Auth - Create User", "POST", f"{BACKEND_URL}/auth/verify", {
        "phone": "+919876543210",
        "otp": "123456"
    }, timeout=10)
    
    if success:
        user_id = data.get("user_id")
        print(f"   Created user_id: {user_id}")
        results["auth"] = True
    else:
        results["auth"] = False
        print("   Failed to create user, using mock_user")
        user_id = "mock_user"
    
    # 3. Test user profile with the actual user_id
    print("\n3. Testing User Profile")
    success, data = test_with_timeout("Get User Profile", "GET", f"{BACKEND_URL}/me", 
                                    params={"user_id": user_id}, timeout=10)
    results["profile"] = success
    
    # 4. Test non-AI endpoints first (should be faster)
    print("\n4. Testing Resource Management")
    success, data = test_with_timeout("Create Resource", "POST", f"{BACKEND_URL}/resources", {
        "title": "UPSC Syllabus - General Studies",
        "kind": "note",
        "content": "Comprehensive UPSC GS syllabus covering all four papers"
    }, params={"user_id": user_id}, timeout=10)
    results["resource_create"] = success
    
    success, data = test_with_timeout("Get Resources", "GET", f"{BACKEND_URL}/resources",
                                    params={"user_id": user_id}, timeout=10)
    results["resource_get"] = success
    
    # 5. Test study planner (non-AI)
    print("\n5. Testing Study Planner")
    exam_date = (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")
    success, data = test_with_timeout("Generate Study Plan", "POST", f"{BACKEND_URL}/planner/generate", {
        "exam_date": exam_date,
        "hours_per_day": 6,
        "subjects": ["gs1", "gs2", "gs3"],
        "weak_areas": ["Current Affairs"]
    }, params={"user_id": user_id}, timeout=10)
    results["planner_generate"] = success
    
    success, data = test_with_timeout("Get Plan Items", "GET", f"{BACKEND_URL}/planner/items",
                                    params={"user_id": user_id}, timeout=10)
    results["planner_items"] = success
    
    # 6. Test MCQ generation (non-AI, just mock data)
    print("\n6. Testing MCQ Generation")
    success, data = test_with_timeout("Generate MCQs", "POST", f"{BACKEND_URL}/mcq/generate", {
        "subject": "gs1",
        "topic": "Indian History",
        "count": 3
    }, params={"user_id": user_id}, timeout=10)
    results["mcq"] = success
    
    # 7. Test flashcards (non-AI, just mock data)
    print("\n7. Testing Flashcards")
    success, data = test_with_timeout("Generate Flashcards", "POST", f"{BACKEND_URL}/flashcards/generate", {
        "subject": "gs2",
        "topic": "Indian Polity",
        "count": 5
    }, params={"user_id": user_id}, timeout=10)
    results["flashcard_generate"] = success
    
    success, data = test_with_timeout("Get Flashcards for Review", "GET", f"{BACKEND_URL}/flashcards/review",
                                    params={"user_id": user_id}, timeout=10)
    results["flashcard_review"] = success
    
    # 8. Test analytics
    print("\n8. Testing Analytics")
    success, data = test_with_timeout("Analytics Dashboard", "GET", f"{BACKEND_URL}/analytics/dashboard",
                                    params={"user_id": user_id}, timeout=10)
    results["analytics"] = success
    
    # 9. Test AI-powered endpoints (these might be slower)
    print("\n9. Testing AI-Powered Endpoints (may be slower)")
    session_id = str(uuid.uuid4())
    success, data = test_with_timeout("Chat - Send Message", "POST", f"{BACKEND_URL}/chat/message", {
        "session_id": session_id,
        "message": "What is Article 370?",
        "mode": "general"
    }, params={"user_id": user_id}, timeout=30)  # Longer timeout for AI
    results["chat"] = success
    
    if success:
        success, data = test_with_timeout("Chat - Get History", "GET", f"{BACKEND_URL}/chat/history/{session_id}",
                                        params={"user_id": user_id}, timeout=10)
        results["chat_history"] = success
    else:
        results["chat_history"] = False
    
    # 10. Test answer evaluation (AI-powered)
    print("\n10. Testing Answer Evaluation")
    mock_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    success, data = test_with_timeout("Evaluate Answer", "POST", f"{BACKEND_URL}/evaluation/answer", {
        "question": "Explain the concept of federalism in the Indian Constitution.",
        "answer_image": mock_image
    }, params={"user_id": user_id}, timeout=30)  # Longer timeout for AI
    results["answer_eval"] = success
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 COMPREHENSIVE TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for success in results.values() if success)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    # Categorize results
    basic_tests = ["root", "auth", "profile"]
    crud_tests = ["resource_create", "resource_get", "planner_generate", "planner_items", "mcq", "flashcard_generate", "flashcard_review", "analytics"]
    ai_tests = ["chat", "chat_history", "answer_eval"]
    
    print(f"\n📋 RESULTS BY CATEGORY:")
    
    basic_passed = sum(1 for test in basic_tests if results.get(test, False))
    print(f"Basic Endpoints: {basic_passed}/{len(basic_tests)} passed")
    
    crud_passed = sum(1 for test in crud_tests if results.get(test, False))
    print(f"CRUD Operations: {crud_passed}/{len(crud_tests)} passed")
    
    ai_passed = sum(1 for test in ai_tests if results.get(test, False))
    print(f"AI-Powered Features: {ai_passed}/{len(ai_tests)} passed")
    
    print(f"\n📋 DETAILED RESULTS:")
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {test_name}")
    
    return results

if __name__ == "__main__":
    main()