# LangChain Terms & Conditions Analysis Server

Flask server with two AI-powered workflows:
1. **Analyzer** - Score and flag terms & conditions
2. **Chatbot** - Q&A about terms with conversation context

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create `.env` file with:
```plain
NVIDIA_API_KEY=your_api_key_here
```

### 3. Run the Server
```powershell
python langchain_server.py
```

Server runs on `http://localhost:5000`

### 4. Test the Server
In another terminal:
```powershell
python test_server.py
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "message": "Terms Analysis Server is running",
  "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5"
}
```

---

### 1️⃣ Analyzer Workflow

**Endpoint:** `POST /api/analyze`

Analyzes terms & conditions and returns a score with flagged issues.

**Request:**
```json
{
  "terms_data": "Your full terms and conditions text here..."
}
```

**Response:**
```json
{
  "score": 75,
  "all_analysis": [
    {
      "title": "Summary",
      "analysis": "This document outlines standard terms...",
      "flag": "info"
    },
    {
      "title": "Data Collection Practices",
      "analysis": "The service collects extensive personal data...",
      "flag": "critical"
    },
    {
      "title": "Clear Refund Policy",
      "analysis": "Users can request refunds within 30 days...",
      "flag": "good"
    }
  ]
}
```

**Flag Types:**
- `info` - Summary (always first)
- `critical` - Serious concerns (-15 points each)
- `warning` - Moderate concerns (-7 points each)
- `good` - User-friendly terms (+5 points each)

**Score Calculation:**
- Starts at 100
- `critical` flags: -15 points
- `warning` flags: -7 points
- `good` flags: +5 points
- Range: 0-100

---

### 2️⃣ Chatbot Workflow

**Endpoint:** `POST /api/chatbot`

Natural language Q&A about terms with conversation context.

**Request:**
```json
{
  "terms_data": "Your terms and conditions text...",
  "message": "Can I cancel my subscription anytime?",
  "conversation_id": "optional-unique-id"
}
```

**Response:**
```json
{
  "response": "Based on the terms, you can cancel your subscription...",
  "conversation_id": "abc-123-def"
}
```

**Features:**
- Maintains conversation context
- References specific terms sections
- Explains legal jargon in simple language
- Stores last 20 messages per conversation

---

### Reset Conversation

**Endpoint:** `POST /api/chatbot/reset`

Clear conversation history.

**Request:**
```json
{
  "conversation_id": "abc-123-def"
}
```

---

### Get Conversation History

**Endpoint:** `POST /api/chatbot/history`

Retrieve conversation history.

**Request:**
```json
{
  "conversation_id": "abc-123-def"
}
```

**Response:**
```json
{
  "conversation_id": "abc-123-def",
  "history": [
    {"role": "user", "content": "What data do you collect?"},
    {"role": "assistant", "content": "According to the terms..."}
  ],
  "message_count": 6
}
```

## 🔗 Integration Examples

### cURL Examples

**Analyze Terms:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"terms_data": "Your terms text here..."}'
```

**Ask Question:**
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "terms_data": "Your terms text...",
    "message": "What are my rights?",
    "conversation_id": "my-conv-123"
  }'
```

### JavaScript/TypeScript (Next.js)

```typescript
// Analyze terms
async function analyzeTerms(termsText: string) {
  const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terms_data: termsText })
  });
  
  const data = await response.json();
  return data; // { score, all_analysis }
}

// Chatbot
async function askQuestion(termsText: string, question: string, conversationId?: string) {
  const response = await fetch('http://localhost:5000/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      terms_data: termsText,
      message: question,
      conversation_id: conversationId
    })
  });
  
  const data = await response.json();
  return data; // { response, conversation_id }
}
```

### Python

```python
import requests

# Analyze
response = requests.post('http://localhost:5000/api/analyze', json={
    'terms_data': 'Your terms text...'
})
result = response.json()
print(f"Score: {result['score']}")

# Chatbot
response = requests.post('http://localhost:5000/api/chatbot', json={
    'terms_data': 'Your terms text...',
    'message': 'Can I get a refund?',
    'conversation_id': 'conv-123'
})
result = response.json()
print(f"Answer: {result['response']}")
```

## 🎯 Use Cases

### Analyzer Workflow
- Evaluate privacy policies before signup
- Compare terms between services
- Identify red flags in contracts
- Generate compliance reports

### Chatbot Workflow
- User support for understanding terms
- Interactive terms explanation
- Clarify specific clauses
- Answer "what if" questions

## ⚙️ Configuration

### Model Settings
Edit in `langchain_server.py`:
```python
llm = ChatNVIDIA(
    model="nvidia/llama-3.3-nemotron-super-49b-v1.5",
    temperature=0.3,  # Lower = more consistent
    max_completion_tokens=4096,  # Max response length
)
```

### Score Calculation
Adjust weights in `calculate_score()`:
```python
if flag == "critical":
    score -= 15  # Adjust penalty
elif flag == "warning":
    score -= 7   # Adjust penalty
elif flag == "good":
    score += 5   # Adjust bonus
```

### Conversation Storage
Current: In-memory dictionary (development)

Production options:
- Redis for distributed systems
- Database (PostgreSQL, MongoDB)
- Session storage

## 🧪 Testing

Run the test suite:
```powershell
# Terminal 1: Start server
python langchain_server.py

# Terminal 2: Run tests
python test_server.py
```

Tests include:
- Health check
- Analyzer with sample terms
- Multi-turn chatbot conversation
- Conversation history retrieval
- Conversation reset

## 📊 Example Output

### Analyzer Output
```plain
Score: 65/100

🚨 [CRITICAL] Binding Arbitration Clause
   You waive your right to jury trial...

⚠️ [WARNING] Vague Data Sharing
   Data may be shared with partners...

✅ [GOOD] Clear Cancellation Policy
   Cancel anytime with 24-hour notice...
```

### Chatbot Conversation
```plain
User: What data do you collect?
Bot: According to section 1, we collect name, email, 
     browsing history, and location data...

User: Can I delete my data?
Bot: Yes, section 8 states you have the right to request 
     data deletion by contacting support...
```

## 🚨 Production Considerations

1. **Rate Limiting**: Add rate limiting for API endpoints
2. **Authentication**: Implement API key or JWT auth
3. **Caching**: Cache analysis results for identical terms
4. **Logging**: Add comprehensive logging
5. **Error Handling**: More robust error responses
6. **Conversation Storage**: Use Redis or database
7. **HTTPS**: Enable SSL/TLS in production
8. **CORS**: Configure specific origins

## 📝 Notes

- Conversation history kept for last 20 messages (10 exchanges)
- Terms truncated to 3000 chars for chatbot context (full text still analyzed)
- JSON parsing fallback if model returns invalid JSON
- All timestamps and IDs auto-generated

## 🐛 Troubleshooting

**Error: NVIDIA_API_KEY not set**
- Check `.env` file exists in langchain folder
- Verify key is valid at build.nvidia.com

**Error: Module not found**
- Run `pip install -r requirements.txt`

**Error: Connection refused**
- Make sure server is running on port 5000
- Check firewall settings

**Low scores for good terms**
- Adjust scoring weights in `calculate_score()`
- Model may be overly cautious - review flags

## 🔮 Future Enhancements

- [ ] Streaming responses for real-time updates
- [ ] PDF/document upload support
- [ ] Multi-language support
- [ ] Terms comparison endpoint
- [ ] Export analysis as PDF
- [ ] Webhook notifications
- [ ] Admin dashboard

---

Built with ❤️ using LangChain + NVIDIA AI
