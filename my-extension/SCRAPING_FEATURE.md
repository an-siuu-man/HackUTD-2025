# Web Scraping Feature for Terms & Privacy Links

## Overview
The extension now automatically scrapes and stores the full text content of terms and privacy policy pages when users click on flagged links.

## How It Works

### 1. **Click Interception**
When a user clicks on a flagged terms/privacy link:
- The click event is intercepted (navigation prevented by default)
- The extension captures the target URL

### 2. **Background Scraping**
The extension fetches the page content using `fetch()`:
- Downloads the HTML of the target page
- Parses the HTML using DOMParser
- Removes script, style, and noscript tags
- Extracts all visible text content
- Cleans up whitespace for readability

### 3. **Content Storage**
- Scraped content is stored in a Map: `URL -> text content`
- Content is cached to avoid re-scraping the same URL
- Stored in memory (can be enhanced to use chrome.storage for persistence)

### 4. **Access Scraped Data**
You can access the scraped content via the browser console:

```javascript
// Get all scraped content
window.getScrapedContent()

// Get content for a specific URL
window.getScrapedContent('https://example.com/privacy')
```

## Features

✅ **Headless Scraping**: Fetches content in the background without opening new tabs
✅ **Smart Caching**: Avoids re-scraping already fetched URLs
✅ **Clean Text Extraction**: Removes scripts, styles, and excess whitespace
✅ **Console Logging**: Provides feedback about scraping progress
✅ **Preview in Console**: Shows a 200-character preview of scraped content

## Customization Options

### Enable Navigation After Scraping
Uncomment this line in `content.js`:
```javascript
// window.open(targetUrl, '_blank');
```

### Store in Chrome Storage (Persistent)
Uncomment and use this code to save to chrome.storage:
```javascript
chrome.runtime.sendMessage({ 
    action: 'saveContent', 
    url: targetUrl, 
    content: content 
});
```

### Change Text Extraction
Modify the `scrapePageContent()` function to:
- Target specific selectors (e.g., `article`, `main`, `.content`)
- Extract only certain sections
- Apply different text cleaning rules

## Example Usage

1. Navigate to a website with terms/privacy links
2. Click on a flagged link (marked with ❌)
3. Open browser console (F12)
4. Check the logs for scraping progress
5. Access content: `window.getScrapedContent()`

## Technical Details

- **Method**: Fetch API with DOMParser
- **Storage**: In-memory Map (upgradable to chrome.storage)
- **Error Handling**: Try-catch with console error logging
- **CORS**: May fail on some sites with strict CORS policies
