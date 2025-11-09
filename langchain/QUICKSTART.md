# Quick Start Guide

## Start the Server

```powershell
cd langchain
python langchain_server.py
```

Server will run on: `http://localhost:5000`

## Test It

In another terminal:
```powershell
cd langchain
python test_server.py
```

## Two Workflows

### 1. ANALYZER - Get Score & Flags

```bash
POST http://localhost:5000/api/analyze

{
  "terms_data": "Your full terms and conditions text..."
}
```

**Returns:**
```json
{
  "score": 85,
  "all_analysis": [
    {
      "title": "Summary",
      "analysis": "Overview of the terms...",
      "flag": "info"
    },
    {
      "title": "Data Collection Issue",
      "analysis": "Collects extensive personal data...",
      "flag": "critical"
    }
  ]
}
```

**Flags:**
- `info` = Summary (always first)
- `critical` = Serious issues (-15 points)
- `warning` = Moderate concerns (-7 points)
- `good` = User-friendly (+5 points)

---

### 2. CHATBOT - Ask Questions

```bash
POST http://localhost:5000/api/chatbot

{
  "terms_data": "Your terms text...",
  "message": "Can I cancel anytime?",
  "conversation_id": "optional-id"
}
```

**Returns:**
```json
{
  "response": "Based on the terms, you can cancel...",
  "conversation_id": "abc-123"
}
```

**Features:**
- Remembers conversation context
- Last 20 messages stored
- Use same `conversation_id` to continue chat

---

## Next.js Integration Example

```typescript
// In your Next.js app

// 1. Analyze Terms
const analyzeTerms = async (termsText: string) => {
  const res = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ terms_data: termsText })
  });
  return await res.json();
};

// 2. Chatbot
const askQuestion = async (termsText: string, question: string, convId?: string) => {
  const res = await fetch('http://localhost:5000/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      terms_data: termsText,
      message: question,
      conversation_id: convId
    })
  });
  return await res.json();
};

// Usage
const result = await analyzeTerms(policyText);
console.log(`Score: ${result.score}/100`);

const answer = await askQuestion(policyText, "Can I get a refund?");
console.log(answer.response);
```

---

## Files Created

1. **`langchain_server.py`** - Main Flask server
2. **`test_server.py`** - Test suite
3. **`README_SERVER.md`** - Complete documentation
4. **`QUICKSTART.md`** - This file

## Configuration

Edit `langchain_server.py` to change:
- Port (default: 5000)
- Model parameters
- Scoring weights
- CORS origins

## Troubleshooting

**Server won't start:**
- Check `.env` has `NVIDIA_API_KEY`
- Run `pip install -r requirements.txt`

**Tests fail:**
- Make sure server is running first
- Check port 5000 is available

**Need help?**
- See README_SERVER.md for full docs
- Check test_server.py for examples
