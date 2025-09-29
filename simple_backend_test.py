#!/usr/bin/env python3
"""
Simple UPSC AI Companion Backend API Test
Tests endpoints individually with timeout handling
"""

import requests
import json
import uuid
from datetime import datetime, timedelta

# Use localhost since external URL was timing out
BACKEND_URL = "http://localhost:8001/api"

def test_endpoint(name, method, url, data=None, params=None, timeout=10):
    """Test a single endpoint with error handling"""
    try:
        if method.upper() == "GET":
            response = requests.get(url, params=params, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, params=params, timeout=timeout)
        
        print(f"✅ {name}: Status {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Response keys: {list(result.keys())}")
            return True, result
        else:
            print(f"   Error: {response.text[:100]}")
            return False, response.text
            
    except requests.exceptions.Timeout:
        print(f"❌ {name}: Request timed out")
        return False, "Timeout"
    except Exception as e:
        print(f"❌ {name}: {str(e)}")
        return False, str(e)

def main():
    print("🚀 Testing UPSC AI Companion Backend API")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 50)
    
    results = {}
    
    # 1. Test root endpoint
    success, data = test_endpoint("Root API", "GET", f"{BACKEND_URL}/")
    results["root"] = success
    
    # 2. Test authentication
    success, data = test_endpoint("Auth - Valid OTP", "POST", f"{BACKEND_URL}/auth/verify", {
        "phone": "+919876543210",
        "otp": "123456"
    })
    results["auth_valid"] = success
    
    success, data = test_endpoint("Auth - Invalid OTP", "POST", f"{BACKEND_URL}/auth/verify", {
        "phone": "+919876543210", 
        "otp": "000000"
    })
    results["auth_invalid"] = (not success)  # Should fail
    
    # 3. Test user profile
    success, data = test_endpoint("Get Current User", "GET", f"{BACKEND_URL}/me", 
                                params={"user_id": "mock_user"})
    results["get_user"] = success
    
    # 4. Test chat system
    session_id = str(uuid.uuid4())
    success, data = test_endpoint("Chat - Send Message", "POST", f"{BACKEND_URL}/chat/message", {
        "session_id": session_id,
        "message": "What are the key topics in Indian Polity for UPSC?",
        "mode": "general"
    }, params={"user_id": "mock_user"})
    results["chat_send"] = success
    
    success, data = test_endpoint("Chat - Get History", "GET", f"{BACKEND_URL}/chat/history/{session_id}",
                                params={"user_id": "mock_user"})
    results["chat_history"] = success
    
    # 5. Test resources
    success, data = test_endpoint("Resources - Create", "POST", f"{BACKEND_URL}/resources", {
        "title": "Indian Constitution - Fundamental Rights",
        "kind": "note",
        "content": "Article 14-32 deal with Fundamental Rights"
    }, params={"user_id": "mock_user"})
    results["resource_create"] = success
    
    success, data = test_endpoint("Resources - Get All", "GET", f"{BACKEND_URL}/resources",
                                params={"user_id": "mock_user"})
    results["resource_get"] = success
    
    # 6. Test study planner
    exam_date = (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d")
    success, data = test_endpoint("Planner - Generate", "POST", f"{BACKEND_URL}/planner/generate", {
        "exam_date": exam_date,
        "hours_per_day": 8,
        "subjects": ["gs1", "gs2", "gs3"],
        "weak_areas": ["Geography"]
    }, params={"user_id": "mock_user"})
    results["planner_generate"] = success
    
    success, data = test_endpoint("Planner - Get Items", "GET", f"{BACKEND_URL}/planner/items",
                                params={"user_id": "mock_user"})
    results["planner_items"] = success
    
    # 7. Test MCQ generation
    success, data = test_endpoint("MCQ - Generate", "POST", f"{BACKEND_URL}/mcq/generate", {
        "subject": "gs2",
        "topic": "Indian Constitution",
        "count": 5
    }, params={"user_id": "mock_user"})
    results["mcq_generate"] = success
    
    # 8. Test flashcards
    success, data = test_endpoint("Flashcards - Generate", "POST", f"{BACKEND_URL}/flashcards/generate", {
        "subject": "gs1",
        "topic": "Ancient History",
        "count": 10
    }, params={"user_id": "mock_user"})
    results["flashcard_generate"] = success
    
    success, data = test_endpoint("Flashcards - Review", "GET", f"{BACKEND_URL}/flashcards/review",
                                params={"user_id": "mock_user"})
    results["flashcard_review"] = success
    
    # 9. Test answer evaluation
    mock_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    success, data = test_endpoint("Answer Evaluation", "POST", f"{BACKEND_URL}/evaluation/answer", {
        "question": "Discuss the 73rd and 74th Constitutional Amendments.",
        "answer_image": mock_image
    }, params={"user_id": "mock_user"})
    results["answer_eval"] = success
    
    # 10. Test analytics
    success, data = test_endpoint("Analytics Dashboard", "GET", f"{BACKEND_URL}/analytics/dashboard",
                                params={"user_id": "mock_user"})
    results["analytics"] = success
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for success in results.values() if success)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    # Show results
    print("\n📋 DETAILED RESULTS:")
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {test_name}")
    
    return results

if __name__ == "__main__":
    main()