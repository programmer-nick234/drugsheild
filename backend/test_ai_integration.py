#!/usr/bin/env python3
"""
Test script for AI integration endpoints
"""
import requests
import json
import sys

# API base URL
BASE_URL = "http://127.0.0.1:8000/api/health"

# Test data
test_user = {
    "username": "testuser",
    "password": "testpass123",
    "email": "test@example.com"
}

def test_ai_endpoints():
    """Test the AI-powered endpoints"""
    
    # First, let's try to register or login (we'll use basic auth for simplicity)
    session = requests.Session()
    
    print("🔍 Testing AI-powered Drug Risk Analysis...")
    
    # Test drug risk check without authentication first to see the structure
    risk_check_data = {
        "drug_name": "Penicillin",
        "user_allergies": ["Penicillin", "Beta-lactam antibiotics"]
    }
    
    try:
        response = session.post(f"{BASE_URL}/check-drug-risk/", 
                              json=risk_check_data,
                              headers={'Content-Type': 'application/json'})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Drug Risk Analysis Response:")
            print(f"   Risk Level: {result.get('risk_level')}")
            print(f"   Potential Reactions: {result.get('potential_reactions')}")
            print(f"   Recommendations: {result.get('recommendations')}")
            if 'ai_analysis' in result:
                print(f"   AI Analysis: {result.get('ai_analysis')[:100]}...")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n" + "="*50 + "\n")
    
    print("🔍 Testing AI-powered Symptom Analysis...")
    
    # Test symptom analysis
    symptom_data = {
        "symptoms": "I have been experiencing itchy red rash on my arms and difficulty breathing after taking my medication",
        "current_medications": ["Amoxicillin", "Ibuprofen"]
    }
    
    try:
        response = session.post(f"{BASE_URL}/analyze-symptoms/", 
                              json=symptom_data,
                              headers={'Content-Type': 'application/json'})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Symptom Analysis Response:")
            print(f"   Classification: {result.get('classification')}")
            print(f"   Confidence Score: {result.get('confidence_score')}")
            print(f"   AI Analysis: {result.get('ai_analysis', '')[:100]}...")
            print(f"   Recommendations: {result.get('recommendations')}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n" + "="*50 + "\n")
    
    print("🔍 Testing AI Health Chat Assistant...")
    
    # Test health chat
    chat_data = {
        "message": "I'm taking penicillin and I've developed a rash. Should I be concerned?",
        "message_type": "health_question"
    }
    
    try:
        response = session.post(f"{BASE_URL}/chat/", 
                              json=chat_data,
                              headers={'Content-Type': 'application/json'})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat Response:")
            print(f"   Response: {result.get('response', '')[:200]}...")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Testing DrugShield AI Integration\n")
    test_ai_endpoints()
    print("\n✨ Testing Complete!")