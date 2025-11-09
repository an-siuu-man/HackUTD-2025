// Background service worker
console.log('Terms Finder: Background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.action);
  
  if (request.action === 'termsLinksFound') {
    console.log('✅ Found', request.links.length, 'terms links');
    
    const tabId = sender.tab?.id;
    
    // Automatically fetch content for all found links
    if (request.autoFetch && tabId) {
      console.log('🔄 Auto-fetching content for all terms links...\n');
      request.links.forEach((link, index) => {
        // Add a small delay between fetches to avoid overwhelming the browser
        setTimeout(() => {
          console.log(`⏳ Fetching link ${index + 1}/${request.links.length}: ${link.text}`);
          fetchTermsPage(link.url, link.text, index + 1, tabId);
        }, index * 1500); // 1.5 second delay between each fetch
      });
    }
    sendResponse({ success: true });
  } else if (request.action === 'fetchTermsContent') {
    // Fetch the terms page content
    const tabId = sender.tab?.id;
    fetchTermsPage(request.url, request.text, '', tabId);
    sendResponse({ success: true });
  }
  return true;
});

async function fetchTermsPage(url, linkText = '', index = '', tabId = null) {
  try {
    const indexPrefix = index ? `[${index}] ` : '';
    const titleText = linkText ? ` - "${linkText}"` : '';
    
    console.log(`${indexPrefix}� Fetching: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch: ${response.status} ${response.statusText}`);
      return;
    }
    
    const html = await response.text();
    
    // Simple HTML text extraction using regex (works in service worker)
    // Remove script and style tags with their content
    let cleanedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanedHtml = cleanedHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML tags
    cleanedHtml = cleanedHtml.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    cleanedHtml = cleanedHtml
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-z]+;/g, ' ');
    
    // Clean up whitespace and format
    const cleanedText = cleanedHtml
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n');  // Remove multiple newlines
    
    console.log(`${indexPrefix}✅ Fetched successfully, sending to page console...`);
    
    // Send the content to the content script to display in page console
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'displayContent',
        content: cleanedText,
        url: url,
        linkText: linkText,
        index: index
      });
    }
    
  } catch (error) {
    console.error(`❌ Error fetching terms page (${url}):`, error);
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // Inject content script if needed and find terms
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // This function runs in the page context
        const links = document.querySelectorAll('a');
        const termsLinks = [];
        
        const termsKeywords = [
          'terms',
          'terms and conditions',
          'terms of service',
          'terms of use',
          'tos'
        ];
        
        links.forEach(link => {
          const text = link.textContent.toLowerCase().trim();
          const href = link.href;
          
          const matchesKeyword = termsKeywords.some(keyword => 
            text.includes(keyword) || href.toLowerCase().includes(keyword)
          );
          
          if (matchesKeyword && href) {
            termsLinks.push({
              text: link.textContent.trim(),
              url: href
            });
          }
        });
        
        return termsLinks;
      }
    });
    
    const termsLinks = results[0].result;
    console.log('\n=== TERMS LINKS FOUND (Manual Trigger) ===');
    console.log('Found', termsLinks.length, 'terms links');
    termsLinks.forEach((link, index) => {
      console.log(`${index + 1}. ${link.text} -> ${link.url}`);
    });
    console.log('==========================================\n');
    
  } catch (error) {
    console.error('Error finding terms links:', error);
  }
});
