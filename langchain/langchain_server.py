"""
Flask server for Terms & Conditions Analysis and Chatbot
Uses NVIDIA's Nemotron model via LangChain
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import os
import json
from dotenv import load_dotenv
from typing import Dict, List, Any
import uuid

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize the NVIDIA AI model
llm = ChatNVIDIA(
    model="nvidia/llama-3.3-nemotron-super-49b-v1.5",
    api_key=os.getenv("NVIDIA_API_KEY"),
    temperature=0.3,
    top_p=0.9,
    max_completion_tokens=4096,
)

# Store conversation history (in production, use Redis or database)
conversation_store = {}

# ============================================================================
# WORKFLOW 1: ANALYZER
# ============================================================================

def analyze_terms_and_conditions(terms_data: str) -> Dict[str, Any]:
    """
    Analyze terms and conditions, generate flags and calculate score
    
    Args:
        terms_data: The terms and conditions text to analyze
        
    Returns:
        Dictionary with score and all_analysis
    """
    
    # Step 1: Generate comprehensive analysis with flags
    analysis_prompt = f"""Analyze these terms and conditions and provide your response ONLY as valid JSON.

TERMS:
{terms_data[:2000]}

Respond with ONLY this JSON structure (no other text):
{{
    "summary": "2-3 sentence overview",
    "findings": [
        {{"title": "Issue name", "analysis": "Explanation", "flag": "critical"}},
        {{"title": "Another issue", "analysis": "Details", "flag": "warning"}},
        {{"title": "Good point", "analysis": "Description", "flag": "good"}}
    ]
}}

Flag definitions:
- critical: Data selling, no refunds, binding arbitration, unclear liability
- warning: Vague terms, data sharing, limited rights
- good: Clear policies, user protections, transparency

Respond with JSON only. No markdown, no explanations."""

    messages = [
        SystemMessage(content="You must respond with ONLY valid JSON. No markdown formatting, no explanations, just raw JSON."),
        HumanMessage(content=analysis_prompt)
    ]
    
    try:
        response = llm.invoke(messages)
        response_text = response.content.strip()
        
        print(f"Raw response: {response_text[:200]}...")  # Debug
        
        # Try multiple parsing strategies
        # Strategy 1: Direct parse
        try:
            analysis_data = json.loads(response_text)
        except json.JSONDecodeError:
            # Strategy 2: Remove markdown code blocks
            if "```" in response_text:
                # Extract content between code blocks
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(1)
                else:
                    # Try to find any JSON object
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        response_text = json_match.group(0)
            
            # Try parsing again
            try:
                analysis_data = json.loads(response_text)
            except json.JSONDecodeError:
                # Strategy 3: Use fallback structure
                print(f"Could not parse JSON. Using fallback with text analysis.")
                return fallback_analysis(terms_data, response_text)
        
        # Validate structure
        if not isinstance(analysis_data, dict) or "findings" not in analysis_data:
            print("Invalid structure. Using fallback.")
            return fallback_analysis(terms_data, response_text)
        
        # Build the all_analysis array
        all_analysis = []
        
        # Add summary as first item with "info" flag
        all_analysis.append({
            "title": "Summary",
            "analysis": analysis_data.get("summary", "Analysis of the provided terms and conditions."),
            "flag": "info"
        })
        
        # Add all findings
        findings = analysis_data.get("findings", [])
        
        # Validate findings
        valid_findings = []
        for finding in findings:
            if isinstance(finding, dict) and "title" in finding and "analysis" in finding and "flag" in finding:
                valid_findings.append(finding)
        
        all_analysis.extend(valid_findings)
        
        # Calculate score based on flags
        score = calculate_score(valid_findings)
        
        return {
            "score": score,
            "all_analysis": all_analysis
        }
        
    except Exception as e:
        print(f"Analysis Error: {e}")
        return fallback_analysis(terms_data, str(e))

def fallback_analysis(terms_data: str, error_info: str = "") -> Dict[str, Any]:
    """
    Fallback analysis using simpler prompts when JSON parsing fails
    """
    print("Using fallback analysis method...")
    
    # Generate simpler analysis
    simple_prompt = f"""Analyze these terms and conditions. List 3-5 key concerns or good points.

TERMS:
{terms_data[:1500]}

For each point, state:
1. What it is
2. Why it matters
3. Is it critical, a warning, or good?

Be concise."""

    try:
        response = llm.invoke([
            SystemMessage(content="You are a legal analyst. Be concise and clear."),
            HumanMessage(content=simple_prompt)
        ])
        
        analysis_text = response.content
        
        # Parse the response manually
        all_analysis = [{
            "title": "Summary",
            "analysis": "The terms and conditions have been analyzed. See specific findings below.",
            "flag": "info"
        }]
        
        # Try to extract points from the text
        lines = analysis_text.split('\n')
        current_item = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for flag keywords
            flag = "warning"
            if any(word in line.lower() for word in ["critical", "serious", "concerning", "dangerous"]):
                flag = "critical"
            elif any(word in line.lower() for word in ["good", "positive", "clear", "transparent", "protects"]):
                flag = "good"
            
            # Add as finding
            if len(line) > 20:  # Meaningful content
                all_analysis.append({
                    "title": line[:50] + "..." if len(line) > 50 else line,
                    "analysis": line,
                    "flag": flag
                })
        
        # Calculate score
        findings = all_analysis[1:]  # Exclude summary
        score = calculate_score(findings)
        
        return {
            "score": score,
            "all_analysis": all_analysis
        }
        
    except Exception as e:
        print(f"Fallback error: {e}")
        return {
            "score": 50,
            "all_analysis": [
                {
                    "title": "Analysis Error",
                    "analysis": "Unable to analyze the terms. Please try again or check the server logs.",
                    "flag": "warning"
                }
            ]
        }

def calculate_score(findings: List[Dict[str, str]]) -> int:
    """
    Calculate a score out of 100 based on the flags
    
    Scoring logic:
    - Start at 100
    - Subtract 15 for each critical flag
    - Subtract 7 for each warning flag
    - Add 5 for each good flag
    - Minimum score is 0, maximum is 100
    """
    score = 100
    
    for finding in findings:
        flag = finding.get("flag", "").lower()
        
        if flag == "critical":
            score -= 15
        elif flag == "warning":
            score -= 7
        elif flag == "good":
            score += 5
    
    # Ensure score is between 0 and 100
    score = max(0, min(100, score))
    
    return score

# ============================================================================
# WORKFLOW 2: CHATBOT
# ============================================================================

def chatbot_response(terms_data: str, user_message: str, conversation_id: str) -> str:
    """
    Handle chatbot conversation with context awareness
    
    Args:
        terms_data: The terms and conditions document
        user_message: User's question
        conversation_id: Unique ID for this conversation
        
    Returns:
        AI response as string
    """
    
    # Get or create conversation history
    if conversation_id not in conversation_store:
        conversation_store[conversation_id] = []
    
    conversation_history = conversation_store[conversation_id]
    
    # Build the system prompt with terms context
    system_prompt = f"""You are a helpful AI assistant that answers questions about terms and conditions.

You have access to the following terms and conditions document:

{terms_data[:3000]}{"..." if len(terms_data) > 3000 else ""}

Your role:
- Answer questions clearly and concisely
- Reference specific sections when relevant
- Explain complex legal terms in simple language
- If asked about something not in the terms, say so
- Be helpful and user-friendly

Always base your answers on the provided terms and conditions."""

    # Build messages with conversation history
    messages = [SystemMessage(content=system_prompt)]
    
    # Add conversation history (last 10 messages to avoid token limits)
    for msg in conversation_history[-10:]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
    
    # Add current user message
    messages.append(HumanMessage(content=user_message))
    
    try:
        response = llm.invoke(messages)
        assistant_response = response.content
        
        # Store in conversation history
        conversation_history.append({"role": "user", "content": user_message})
        conversation_history.append({"role": "assistant", "content": assistant_response})
        
        # Keep only last 20 messages (10 exchanges)
        if len(conversation_history) > 20:
            conversation_history = conversation_history[-20:]
            conversation_store[conversation_id] = conversation_history
        
        return assistant_response
        
    except Exception as e:
        print(f"Chatbot Error: {e}")
        return f"I apologize, but I encountered an error: {str(e)}"

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Terms Analysis Server is running",
        "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5"
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Analyze terms and conditions
    
    Request body:
    {
        "terms_data": "The full terms and conditions text"
    }
    
    Response:
    {
        "score": 85,
        "all_analysis": [
            {
                "title": "Summary",
                "analysis": "...",
                "flag": "info"
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        terms_data = data.get('terms_data', '')
        
        if not terms_data:
            return jsonify({
                "error": "terms_data is required"
            }), 400
        
        # Perform analysis
        result = analyze_terms_and_conditions(terms_data)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Chatbot endpoint for Q&A about terms
    
    Request body:
    {
        "terms_data": "The full terms and conditions text",
        "message": "User's question",
        "conversation_id": "optional-unique-id"
    }
    
    Response:
    {
        "response": "AI's answer",
        "conversation_id": "unique-id-for-this-conversation"
    }
    """
    try:
        data = request.json
        terms_data = data.get('terms_data', '')
        user_message = data.get('message', '')
        conversation_id = data.get('conversation_id', str(uuid.uuid4()))
        
        if not terms_data:
            return jsonify({
                "error": "terms_data is required"
            }), 400
        
        if not user_message:
            return jsonify({
                "error": "message is required"
            }), 400
        
        # Get chatbot response
        response_text = chatbot_response(terms_data, user_message, conversation_id)
        
        return jsonify({
            "response": response_text,
            "conversation_id": conversation_id
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/chatbot/reset', methods=['POST'])
def reset_conversation():
    """
    Reset a conversation
    
    Request body:
    {
        "conversation_id": "id-to-reset"
    }
    """
    try:
        data = request.json
        conversation_id = data.get('conversation_id', '')
        
        if conversation_id in conversation_store:
            del conversation_store[conversation_id]
        
        return jsonify({
            "message": "Conversation reset successfully"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/chatbot/history', methods=['POST'])
def get_conversation_history():
    """
    Get conversation history
    
    Request body:
    {
        "conversation_id": "id-to-retrieve"
    }
    """
    try:
        data = request.json
        conversation_id = data.get('conversation_id', '')
        
        history = conversation_store.get(conversation_id, [])
        
        return jsonify({
            "conversation_id": conversation_id,
            "history": history,
            "message_count": len(history)
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == '__main__':
    if not os.getenv("NVIDIA_API_KEY"):
        print("❌ ERROR: NVIDIA_API_KEY not set in .env file")
        exit(1)
    
    print("=" * 60)
    print("🚀 Terms & Conditions Analysis Server")
    print("=" * 60)
    print(f"Model: nvidia/llama-3.3-nemotron-super-49b-v1.5")
    print(f"Endpoints:")
    print(f"  - POST /api/analyze     - Analyze terms & conditions")
    print(f"  - POST /api/chatbot     - Ask questions about terms")
    print(f"  - POST /api/chatbot/reset - Reset conversation")
    print(f"  - GET  /health          - Health check")
    print("=" * 60)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
