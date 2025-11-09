"""
Test the chatbot integration with n8n workflow
"""
import requests
import json

def test_chat_endpoint():
    """Test the /chat endpoint that n8n will use"""
    
    url = "http://127.0.0.1:5000/chat"
    
    test_data = {
        "terms_data": """
        Privacy Policy
        
        We collect your personal information including name, email, and browsing history.
        This data may be shared with third-party advertisers.
        
        We use cookies to track your activity across our website and partner sites.
        By using our service, you agree to mandatory arbitration for all disputes.
        
        We reserve the right to modify these terms at any time without notice.
        """,
        "question": "What data does this service collect?"
    }
    
    print("Testing /chat endpoint...")
    print(f"URL: {url}")
    print(f"Question: {test_data['question']}")
    print("-" * 60)
    
    try:
        response = requests.post(url, json=test_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"\nAnswer: {result.get('answer')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure langchain_server.py is running!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_n8n_workflow():
    """Test the complete n8n workflow (if n8n is running)"""
    
    # Replace this with your actual n8n webhook URL
    webhook_url = "http://localhost:5678/webhook-test/chat"
    
    test_data = {
        "snapshot_id": 1,
        "question": "What are the main privacy concerns?"
    }
    
    print("\n" + "=" * 60)
    print("Testing n8n workflow...")
    print(f"URL: {webhook_url}")
    print(f"Snapshot ID: {test_data['snapshot_id']}")
    print(f"Question: {test_data['question']}")
    print("-" * 60)
    
    try:
        response = requests.post(webhook_url, json=test_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"\nAnswer: {result.get('answer')}")
            print(f"Snapshot ID: {result.get('snapshot_id')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to n8n. Make sure:")
        print("   1. n8n is running")
        print("   2. The workflow is activated")
        print("   3. The webhook URL is correct")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("Chatbot Integration Test")
    print("=" * 60)
    
    # Test the Flask endpoint first
    test_chat_endpoint()
    
    # Then test the full n8n workflow (optional)
    print("\n")
    response = input("Do you want to test the n8n workflow? (y/n): ")
    if response.lower() == 'y':
        test_n8n_workflow()
    
    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)
