# n8n Integration Guide for Terms Finder Extension

## Overview
The extension now automatically sends extracted terms & conditions content to your n8n workflow (or langchain server) via webhook.

## Data Format Sent to n8n/Webhook

The extension sends a POST request with the following JSON structure:

```json
{
  "url": "https://example.com/terms",
  "terms_data": "The complete text content of the terms and conditions page...",
  "fetchedAt": "2025-11-09T12:34:56.789Z"
}
```

### Fields:
- **url**: The URL of the terms & conditions page that was scraped
- **terms_data**: The complete cleaned text content (HTML stripped, entities decoded)
- **fetchedAt**: ISO 8601 timestamp of when the content was fetched

## Setup Instructions

### Option 1: Using with langchain_server.py

1. **Start your langchain server:**
   ```powershell
   cd langchain
   python langchain_server.py
   ```

2. **In the extension popup, enter the webhook URL:**
   ```
   http://localhost:5000/api/analyze
   ```

3. **Click "Save Webhook URL"**

4. The extension will now automatically send terms content to your langchain server for analysis!

### Option 2: Using with n8n Workflow

1. **Create an n8n workflow:**
   - Add a **Webhook** node as the trigger
   - Set it to **POST** method
   - Copy the webhook URL (e.g., `http://localhost:5678/webhook/terms-analyzer`)

2. **Add processing nodes:**
   - **Function node** to extract `terms_data` from the payload
   - **HTTP Request node** to send to your langchain server:
     ```
     Method: POST
     URL: http://localhost:5000/api/analyze
     Body: {{ { "terms_data": $json.terms_data } }}
     ```
   - **Additional nodes** for further processing, database storage, notifications, etc.

3. **Configure the extension:**
   - Open the extension popup
   - Enter your n8n webhook URL
   - Click "Save Webhook URL"

## Example n8n Workflow Structure

```
1. Webhook Trigger (POST)
   ↓ Receives: { url, terms_data, fetchedAt }
   
2. Function Node (Optional preprocessing)
   ↓ Extract and format data
   
3. HTTP Request to Langchain Server
   ↓ POST to http://localhost:5000/api/analyze
   ↓ Body: { "terms_data": "..." }
   
4. Store in Database (Optional)
   ↓ Save analysis results
   
5. Send Notification (Optional)
   ↓ Email, Slack, Discord, etc.
```

## Testing

1. **Load the extension** in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `shivansh-ext` folder

2. **Configure webhook** in the popup

3. **Visit any website** with terms & conditions links

4. **Open browser console** (F12) to see:
   - Terms links being found
   - Content being fetched
   - Webhook POST requests being sent

5. **Check n8n/langchain logs** to verify data reception

## Troubleshooting

### Extension not sending data?
- Check browser console for error messages
- Verify webhook URL is correctly configured
- Ensure the webhook URL is accessible from your browser

### Webhook not receiving data?
- Check if your server/n8n is running
- Verify CORS is enabled if needed
- Check server logs for incoming requests

### Getting "webhook not configured" message?
- Click the extension icon
- Enter your webhook URL in the popup
- Click "Save Webhook URL"

## Advanced: Manual Configuration

You can also set the webhook URL programmatically from the browser console:

```javascript
chrome.storage.local.set({ n8nWebhookUrl: 'http://localhost:5678/webhook/terms' }, () => {
  console.log('Webhook URL saved!');
});
```

To check current configuration:
```javascript
chrome.storage.local.get(['n8nWebhookUrl'], (result) => {
  console.log('Current webhook URL:', result.n8nWebhookUrl);
});
```

## Security Notes

- The webhook URL is stored locally in the extension
- All data is sent over HTTP/HTTPS as configured
- For production, use HTTPS endpoints
- Consider adding authentication to your webhook if exposed publicly

## Next Steps

1. **Enhance the n8n workflow** with:
   - Database storage of analysis results
   - Notification systems
   - Dashboard integration
   - Batch processing
   - Historical tracking

2. **Extend the extension** to:
   - Support privacy policy detection
   - Add cookie policy scanning
   - Include GDPR compliance checks
