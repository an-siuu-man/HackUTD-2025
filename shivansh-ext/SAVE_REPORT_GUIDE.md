# Save Report Feature - Integration Guide

## Overview
The "Save Report" button allows users to save analyzed terms and conditions reports to their account via the n8n workflow integration.

## Features
- **One-click Save**: Save analyzed reports directly from the extension side panel
- **User Authentication**: Prompts for User ID on first use and stores it for future saves
- **n8n Workflow Integration**: Connects to the "save-to-account" n8n workflow
- **Visual Feedback**: Shows save status with success/error messages

## Setup Instructions

### 1. Configure the Save Webhook URL

The extension uses a separate webhook URL for saving reports. You can configure it in two ways:

#### Option A: Using Chrome DevTools Console
```javascript
// Set the save webhook URL
chrome.storage.local.set({ 
  saveWebhookUrl: 'http://localhost:5678/webhook/save-to-account' 
});

// Verify it's set
chrome.storage.local.get(['saveWebhookUrl'], (result) => {
  console.log('Save Webhook URL:', result.saveWebhookUrl);
});
```

#### Option B: Default Configuration
If not set, the extension defaults to:
```
http://localhost:5678/webhook/save-to-account
```

### 2. Set Up User ID

The extension needs a user ID to associate saved reports with user accounts. On first save attempt, it will prompt the user to enter their User ID.

To pre-configure the user ID:
```javascript
chrome.storage.local.set({ userId: 'your-user-id-here' });
```

### 3. n8n Workflow Configuration

The "save website" workflow (attached as `save website.json`) should be imported into n8n. This workflow:

1. **Receives POST request** at `/webhook/save-to-account`
2. **Checks if already saved** in `user_saved_websites` table
3. **Updates or inserts** the record based on whether it exists
4. **Returns success response** with the snapshot_id

#### Workflow Endpoints
- **Webhook URL**: `http://localhost:5678/webhook/save-to-account`
- **Method**: POST
- **Required Body**:
  ```json
  {
    "user_id": "string",
    "snapshot_id": "number"
  }
  ```

#### Expected Response
```json
{
  "success": true,
  "message": "Website saved successfully",
  "snapshot_id": 123
}
```

### 4. Database Schema

The workflow requires a Supabase table named `user_saved_websites`:

```sql
CREATE TABLE user_saved_websites (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  snapshot_id INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, snapshot_id)
);
```

## Usage

### For End Users

1. **Analyze a Terms & Conditions page**
   - Navigate to a website with T&C
   - Click on the Terms Finder extension
   - The extension automatically finds and analyzes terms links
   - Click on the score badge to view the analysis

2. **Save the Report**
   - In the side panel, scroll to the bottom
   - Click the "Save Report" button
   - If first time, enter your User ID when prompted
   - Wait for confirmation message

3. **View Saved Reports**
   - Access your saved reports through the main dashboard
   - All saved reports are linked to your user account

## Technical Details

### Data Flow

```
Extension (content.js)
    ↓ (POST request with user_id & snapshot_id)
n8n Webhook (save-to-account)
    ↓ (Check/Update/Insert)
Supabase (user_saved_websites table)
    ↓ (Success response)
Extension (displays confirmation)
```

### Error Handling

The extension handles several error scenarios:

- **No User ID**: Prompts user to enter their ID
- **No Snapshot ID**: Shows error message in the panel
- **Network Error**: Displays "Failed to save" message
- **Server Error**: Shows HTTP status in error message

### Storage Keys

The extension uses Chrome's local storage:

| Key | Type | Description |
|-----|------|-------------|
| `userId` | string | Current user's ID for saving reports |
| `saveWebhookUrl` | string | n8n webhook URL for save operations |
| `n8nWebhookUrl` | string | n8n webhook URL for analysis |

## Troubleshooting

### Save Button Not Working

1. **Check webhook URL**:
   ```javascript
   chrome.storage.local.get(['saveWebhookUrl'], console.log);
   ```

2. **Verify n8n workflow is active**:
   - Open n8n dashboard
   - Ensure "save website" workflow is activated
   - Check webhook node settings

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

### No Snapshot ID Error

This occurs when the analysis data doesn't include a `snapshot_id`. Solutions:

1. **Update n8n analysis workflow** to return `snapshot_id` in response
2. **Temporary ID generation**: Extension creates a temporary ID if none exists
3. **Check analysis response format** in browser console

### User ID Not Persisting

If the extension keeps prompting for User ID:

```javascript
// Check if stored correctly
chrome.storage.local.get(['userId'], (result) => {
  console.log('Stored User ID:', result.userId);
});

// Manually set it again
chrome.storage.local.set({ userId: 'your-user-id' });
```

## Security Considerations

1. **User ID Storage**: Consider implementing proper authentication instead of storing user IDs in local storage
2. **HTTPS**: Use HTTPS URLs for production webhooks
3. **Input Validation**: The n8n workflow should validate user_id and snapshot_id
4. **Rate Limiting**: Implement rate limiting on the webhook to prevent abuse

## Future Enhancements

Potential improvements:

- [ ] OAuth integration for user authentication
- [ ] Batch save multiple reports
- [ ] Offline save queue with sync when online
- [ ] Save confirmation dialog with report preview
- [ ] Export saved reports as PDF
- [ ] Share reports with other users

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Verify n8n workflow is active and properly configured
3. Ensure Supabase credentials are correct in n8n
4. Check network connectivity to localhost:5678

## Credits

Developed for HackUTD 2025 project.
