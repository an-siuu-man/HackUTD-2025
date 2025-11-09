# Terms Finder Chrome Extension

A Chrome extension that automatically finds and displays Terms of Service links on web pages.

## Features

- Automatically scans web pages for "terms" related links
- Finds links containing: terms, terms and conditions, terms of service, terms of use, TOS
- Prints found links to the browser console
- Click on links in the popup to fetch and print the full terms page content

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

## Development

To modify the extension:
1. Make changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the webpage you're testing on
