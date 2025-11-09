"""
Check available NVIDIA models for your API key
"""

from langchain_nvidia_ai_endpoints import ChatNVIDIA
import os
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("NVIDIA_API_KEY"):
    print("Please set NVIDIA_API_KEY environment variable")
    exit(1)

print("Checking available models...\n")

# Try to get available models
try:
    # This will show what models are available
    available = ChatNVIDIA.get_available_models()
    
    print("=" * 60)
    print("AVAILABLE MODELS")
    print("=" * 60)
    
    # Filter for Nemotron and Llama models
    nemotron_models = []
    llama_models = []
    other_models = []
    
    for model in available:
        model_id = model.id if hasattr(model, 'id') else str(model)
        
        if 'nemotron' in model_id.lower():
            nemotron_models.append(model_id)
        elif 'llama' in model_id.lower():
            llama_models.append(model_id)
        else:
            other_models.append(model_id)
    
    if nemotron_models:
        print("\n🎯 NEMOTRON MODELS:")
        for m in nemotron_models:
            print(f"  - {m}")
    
    if llama_models:
        print("\n🦙 LLAMA MODELS:")
        for m in llama_models:
            print(f"  - {m}")
    
    if other_models:
        print("\n🤖 OTHER MODELS:")
        for m in other_models[:10]:  # Show first 10
            print(f"  - {m}")
        if len(other_models) > 10:
            print(f"  ... and {len(other_models) - 10} more")
    
    print("\n" + "=" * 60)
    print(f"Total available models: {len(available)}")
    print("=" * 60)
    
except Exception as e:
    print(f"Error getting models: {e}")
    print("\nTrying common working models...\n")
    
    # Test a few common models
    test_models = [
        "meta/llama3-70b-instruct",
        "meta/llama-3.1-8b-instruct",
        "mistralai/mixtral-8x7b-instruct-v0.1",
        "google/gemma-7b",
    ]
    
    print("Testing these models:")
    for model_name in test_models:
        try:
            llm = ChatNVIDIA(model=model_name, api_key=os.getenv("NVIDIA_API_KEY"))
            print(f"✅ {model_name} - WORKS")
        except Exception as e:
            print(f"❌ {model_name} - Error: {str(e)[:50]}")
