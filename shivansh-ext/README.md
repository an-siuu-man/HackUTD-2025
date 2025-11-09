# Terms Finder Chrome Extension

A Chrome extension that automatically finds, analyzes, and saves Terms of Service compliance reports from web pages.

## Features

- **Automatic Scanning**: Scans web pages for "terms" related links
- **AI Analysis**: Analyzes terms and conditions using AI/LLM via n8n workflow
- **Compliance Scoring**: Displays a compliance score (0-100) with detailed analysis
- **Save Reports**: Save analyzed reports to your account with one click
- **Visual Indicators**: Shows score badges next to terms links on pages
- **Side Panel**: Beautiful side panel to view detailed analysis
- **Integration Ready**: Connects with n8n workflows and Supabase backend

## New Features

### 🎉 Save Report Button
- Save analyzed T&C reports directly to your user account
- One-click save operation from the side panel
- Integrated with n8n "save-to-account" workflow
- User authentication with persistent storage

[See detailed Save Report documentation →](./SAVE_REPORT_GUIDE.md)

## Installation Steps

### Step 1: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Navigate to the `shivansh-ext` folder and select it
5. The extension should now appear in your extensions list

### Step 2: Using the Extension

#### Automatic Detection (When Page Loads)
- Just browse to any website
- Open Chrome DevTools (F12 or Right-click > Inspect)
- Go to the "Console" tab
- The extension automatically finds terms links and prints them to the console

#### Manual Search
1. Click the extension icon in your Chrome toolbar
2. Click the "Find Terms Links" button
3. View results in the popup and console
4. Click any found link to fetch its full content (printed to console)

## How It Works

1. **Content Script** (`content.js`): Runs on every webpage and scans for links containing terms-related keywords
2. **Background Script** (`background.js`): Handles logging and fetching terms page content
3. **Popup** (`popup.html`, `popup.js`): Provides a user interface for manual searches

## Output

All output is displayed in the Chrome DevTools Console:
- List of found terms links with their URLs
- Full text content of terms pages when clicked

## Keywords Detected

The extension looks for these keywords in link text and URLs:
- terms
- terms and conditions
- terms of service
- terms of use
- tos

## Files Structure

```plain
shivansh-ext/
├── manifest.json       # Extension configuration
├── content.js          # Scans pages for terms links
├── background.js       # Handles logging and fetching
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
└── README.md           # This file
```

## Troubleshooting

- **Extension not working**: Make sure Developer mode is enabled in chrome://extensions/
- **No output in console**: Open DevTools (F12) and check the Console tab
- **Links not found**: Some websites may structure their links differently; the extension looks for common patterns
- **Save button not working**: Check that n8n workflow is active and webhook URL is configured

## Configuration

### Set Save Webhook URL
```javascript
// Open Chrome DevTools console on any page
chrome.storage.local.set({ 
  saveWebhookUrl: 'http://localhost:5678/webhook/save-to-account' 
});
```

### Set User ID (for saving reports)
```javascript
chrome.storage.local.set({ 
  userId: 'your-user-id-here' 
});
```

### Set Analysis Webhook URL
```javascript
chrome.storage.local.set({ 
  n8nWebhookUrl: 'http://localhost:5678/webhook-test/compliance-analyzer' 
});
```

## Integration

### n8n Workflows Required

1. **Compliance Analyzer** (for analyzing T&C)
   - Webhook endpoint: `/webhook-test/compliance-analyzer`
   - Returns analysis data with score and details

2. **Save to Account** (for saving reports)
   - Webhook endpoint: `/webhook/save-to-account`
   - Import workflow from: `save website.json` (in project root)
   - Saves to Supabase `user_saved_websites` table

See [Save Report Guide](./SAVE_REPORT_GUIDE.md) for detailed integration instructions.

## Development

To modify the extension:
1. Make changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the webpage you're testing on
