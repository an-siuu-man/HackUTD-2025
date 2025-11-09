"""
LangChain integration with NVIDIA's Nemotron-Nano-12B-v2-VL model
Uses NVIDIA AI Endpoints for inference
"""

from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the NVIDIA AI Endpoints client
# You need to set NVIDIA_API_KEY environment variable
llm = ChatNVIDIA(
    model="nvidia/nemotron-nano-12b-v2-vl",
    api_key=os.getenv("NVIDIA_API_KEY"),
    temperature=0.7,
    top_p=0.9,
    max_tokens=1024,
)

def simple_chat(user_message: str) -> str:
    """
    Simple chat interaction with the model
    
    Args:
        user_message: The user's input message
        
    Returns:
        The model's response
    """
    messages = [
        HumanMessage(content=user_message)
    ]
    response = llm.invoke(messages)
    return response.content

def chat_with_system_prompt(system_prompt: str, user_message: str) -> str:
    """
    Chat with a system prompt to set context/behavior
    
    Args:
        system_prompt: Instructions for the model's behavior
        user_message: The user's input message
        
    Returns:
        The model's response
    """
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    response = llm.invoke(messages)
    return response.content

def chat_with_prompt_template(template_vars: dict) -> str:
    """
    Use a prompt template for structured interactions
    
    Args:
        template_vars: Dictionary containing variables for the template
        
    Returns:
        The model's response
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI assistant specializing in {specialty}."),
        ("user", "{user_input}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    response = chain.invoke(template_vars)
    return response

def streaming_chat(user_message: str):
    """
    Stream the response token by token
    
    Args:
        user_message: The user's input message
        
    Yields:
        Chunks of the response as they arrive
    """
    messages = [HumanMessage(content=user_message)]
    
    for chunk in llm.stream(messages):
        yield chunk.content

def batch_chat(messages_list: list[str]) -> list[str]:
    """
    Process multiple messages in batch
    
    Args:
        messages_list: List of user messages to process
        
    Returns:
        List of model responses
    """
    batch_messages = [[HumanMessage(content=msg)] for msg in messages_list]
    responses = llm.batch(batch_messages)
    return [response.content for response in responses]

def multi_turn_conversation(conversation_history: list[dict]) -> str:
    """
    Handle multi-turn conversations with history
    
    Args:
        conversation_history: List of dicts with 'role' and 'content' keys
        
    Returns:
        The model's response
    """
    messages = []
    for turn in conversation_history:
        if turn['role'] == 'system':
            messages.append(SystemMessage(content=turn['content']))
        elif turn['role'] == 'user':
            messages.append(HumanMessage(content=turn['content']))
        # You can add AIMessage for assistant responses if needed
    
    response = llm.invoke(messages)
    return response.content

# Example usage
if __name__ == "__main__":
    # Make sure to set your NVIDIA_API_KEY environment variable
    if not os.getenv("NVIDIA_API_KEY"):
        print("Please set NVIDIA_API_KEY environment variable")
        exit(1)
    
    print("=== Simple Chat Example ===")
    response = simple_chat("What is the capital of France?")
    print(f"Response: {response}\n")
    
    print("=== Chat with System Prompt Example ===")
    response = chat_with_system_prompt(
        "You are a helpful coding assistant that explains concepts clearly.",
        "Explain what a REST API is in simple terms."
    )
    print(f"Response: {response}\n")
    
    print("=== Prompt Template Example ===")
    response = chat_with_prompt_template({
        "specialty": "web development",
        "user_input": "What are the benefits of using TypeScript over JavaScript?"
    })
    print(f"Response: {response}\n")
    
    print("=== Streaming Example ===")
    print("Response: ", end="")
    for chunk in streaming_chat("Tell me a short joke."):
        print(chunk, end="", flush=True)
    print("\n")
    
    print("=== Batch Processing Example ===")
    questions = [
        "What is Python?",
        "What is JavaScript?",
        "What is Java?"
    ]
    responses = batch_chat(questions)
    for q, r in zip(questions, responses):
        print(f"Q: {q}")
        print(f"A: {r}\n")
    
    print("=== Multi-turn Conversation Example ===")
    conversation = [
        {"role": "system", "content": "You are a helpful math tutor."},
        {"role": "user", "content": "What is 15 + 27?"},
    ]
    response = multi_turn_conversation(conversation)
    print(f"Response: {response}\n")
