"""
Test script for langchain_server.py
Tests both analyzer and chatbot workflows
"""

import requests
import json

BASE_URL = "http://localhost:5000"

# Sample terms and conditions for testing
SAMPLE_TERMS = """
Terms and Conditions

1. Data Collection and Usage
We collect your personal information including name, email, browsing history, and location data. 
This data may be shared with third-party advertisers and partners for marketing purposes.

2. Account Termination
We reserve the right to terminate your account at any time without prior notice or explanation.

3. Liability
Our company is not liable for any damages, losses, or issues that arise from using our service.
You agree to indemnify us against all claims.

4. Automatic Renewal
Your subscription will automatically renew each month and you will be charged. 
Cancellation must be done 30 days before renewal.

5. Arbitration
Any disputes must be resolved through binding arbitration. You waive your right to a jury trial.

6. Changes to Terms
We may modify these terms at any time without notifying you. Continued use constitutes acceptance.

7. Data Security
We use industry-standard encryption to protect your data during transmission and storage.

8. Your Rights
You have the right to request deletion of your data at any time by contacting support.
"""

def test_health():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_analyzer():
    """Test the analyzer workflow"""
    print("\n" + "="*60)
    print("TEST 2: Terms Analyzer")
    print("="*60)
    
    payload = {
        "terms_data": SAMPLE_TERMS
    }
    
    response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n📊 SCORE: {result['score']}/100\n")
        
        print("📋 ANALYSIS:")
        for item in result['all_analysis']:
            flag_emoji = {
                'info': 'ℹ️',
                'critical': '🚨',
                'warning': '⚠️',
                'good': '✅'
            }.get(item['flag'], '❓')
            
            print(f"\n{flag_emoji} [{item['flag'].upper()}] {item['title']}")
            print(f"   {item['analysis'][:150]}...")
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_chatbot():
    """Test the chatbot workflow"""
    print("\n" + "="*60)
    print("TEST 3: Chatbot Q&A")
    print("="*60)
    
    # Start a conversation
    conversation_id = None
    
    questions = [
        "What data do you collect?",
        "Can I cancel my subscription anytime?",
        "What happens if there's a dispute?"
    ]
    
    for i, question in enumerate(questions, 1):
        print(f"\n💬 Question {i}: {question}")
        
        payload = {
            "terms_data": SAMPLE_TERMS,
            "message": question
        }
        
        if conversation_id:
            payload["conversation_id"] = conversation_id
        
        response = requests.post(f"{BASE_URL}/api/chatbot", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            conversation_id = result['conversation_id']
            print(f"🤖 Answer: {result['response']}\n")
        else:
            print(f"Error: {response.text}")
            return False
    
    # Test conversation history
    print("\n" + "="*60)
    print("TEST 4: Conversation History")
    print("="*60)
    
    response = requests.post(
        f"{BASE_URL}/api/chatbot/history",
        json={"conversation_id": conversation_id}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Conversation ID: {result['conversation_id']}")
        print(f"Message Count: {result['message_count']}")
        print(f"History: {len(result['history'])} messages stored")
    
    return True

def test_conversation_reset():
    """Test conversation reset"""
    print("\n" + "="*60)
    print("TEST 5: Conversation Reset")
    print("="*60)
    
    # Create a conversation
    payload = {
        "terms_data": SAMPLE_TERMS,
        "message": "Hello"
    }
    
    response = requests.post(f"{BASE_URL}/api/chatbot", json=payload)
    conv_id = response.json()['conversation_id']
    
    # Reset it
    response = requests.post(
        f"{BASE_URL}/api/chatbot/reset",
        json={"conversation_id": conv_id}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def run_all_tests():
    """Run all tests"""
    print("\n" + "🧪 LANGCHAIN SERVER TEST SUITE")
    print("="*60)
    print("Make sure the server is running: python langchain_server.py")
    print("="*60)
    
    tests = [
        ("Health Check", test_health),
        ("Analyzer", test_analyzer),
        ("Chatbot", test_chatbot),
        ("Conversation Reset", test_conversation_reset)
    ]
    
    results = []
    
    try:
        for name, test_func in tests:
            try:
                result = test_func()
                results.append((name, result))
            except requests.exceptions.ConnectionError:
                print(f"\n❌ Cannot connect to server at {BASE_URL}")
                print("Make sure the server is running!")
                return
            except Exception as e:
                print(f"\n❌ Test '{name}' failed with error: {e}")
                results.append((name, False))
        
        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        for name, result in results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{status} - {name}")
        
        passed = sum(1 for _, r in results if r)
        total = len(results)
        print(f"\n{passed}/{total} tests passed")
        
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")

if __name__ == "__main__":
    run_all_tests()
