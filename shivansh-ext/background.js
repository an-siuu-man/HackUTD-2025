// Background service worker
console.log('Terms Finder: Background script loaded');

// Default webhook URL
const DEFAULT_WEBHOOK_URL = "http://localhost:5678/webhook-test/compliance-analyzer";

// Keep service worker alive and track pending requests
const pendingRequests = new Map(); // url -> { tabId, timestamp }

// Prevent service worker from sleeping
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20000);
keepAlive();

// Log current webhook configuration on startup
chrome.storage.local.get(['n8nWebhookUrl'], (result) => {
  if (result.n8nWebhookUrl) {
    console.log('✅ n8n Webhook URL configured:', result.n8nWebhookUrl);
  } else {
    console.log('⚠️ No webhook URL configured. Using default:', DEFAULT_WEBHOOK_URL);
    // Set default webhook URL
    chrome.storage.local.set({ n8nWebhookUrl: DEFAULT_WEBHOOK_URL }, () => {
      console.log('✅ Default webhook URL set:', DEFAULT_WEBHOOK_URL);
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.action);
  
  if (request.action === 'setN8nWebhook') {
    chrome.storage.local.set({ n8nWebhookUrl: request.url }, () => {
      console.log('✅ n8n webhook URL saved:', request.url);
      sendResponse({ success: true, message: 'Webhook URL saved successfully!' });
    });
    return true;
  } else if (request.action === 'getN8nWebhook') {
    chrome.storage.local.get(['n8nWebhookUrl'], (result) => {
      sendResponse({ url: result.n8nWebhookUrl || '' });
    });
    return true;
  } else if (request.action === 'termsLinksFound') {
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
    
    console.log(`${indexPrefix}🔵 About to call sendToN8n for URL: ${url}`);
    console.log(`${indexPrefix}🔵 TabId: ${tabId}`);
    
    // Store the tabId for this request
    if (tabId) {
      pendingRequests.set(url, { tabId, timestamp: Date.now() });
      console.log(`${indexPrefix}💾 Stored pending request for URL: ${url}, tabId: ${tabId}`);
    }
    
    // Send to n8n webhook (or langchain server)
    await sendToN8n({
      url: url,
      terms_data: cleanedText,
      fetchedAt: new Date().toISOString()
    }, tabId);
    
    console.log(`${indexPrefix}🟢 Completed sendToN8n call`);
    
  } catch (error) {
    console.error(`❌ Error fetching terms page (${url}):`, error);
  }
}

// Function to send data to n8n workflow
async function sendToN8n(data, tabId = null) {
  try {
    // Get the webhook URL from storage
    const storage = await chrome.storage.local.get(['n8nWebhookUrl']);
    const webhookUrl = storage.n8nWebhookUrl;
    
    if (!webhookUrl) {
      console.log('⚠️ n8n webhook URL not configured. Set it in the popup or use chrome.storage.local.set({n8nWebhookUrl: "your-url"})');
      return;
    }
    
    console.log('📤 Sending to n8n webhook:', webhookUrl);
    console.log('📦 Data payload:', JSON.stringify(data, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log('📊 Response status:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ Successfully sent to n8n!');
      const resultText = await response.text();
      if (resultText) {
        console.log('📨 Response:', resultText);
        
        // Parse response and send to content script
        try {
          const analysisData = JSON.parse(resultText);
          console.log('📊 Parsed analysis data:', analysisData);
          
          // Get tabId from parameter or from pendingRequests
          let targetTabId = tabId;
          if (!targetTabId && data.url) {
            const pending = pendingRequests.get(data.url);
            if (pending) {
              targetTabId = pending.tabId;
              console.log('🔄 Retrieved tabId from pendingRequests:', targetTabId);
              // Clean up old request
              pendingRequests.delete(data.url);
            }
          }
          
          // Send analysis back to content script to update UI
          if (targetTabId) {
            console.log('📤 Sending analysis to content script, tabId:', targetTabId, 'url:', data.url);
            
            // First check if tab still exists
            chrome.tabs.get(targetTabId, (tab) => {
              if (chrome.runtime.lastError) {
                console.error('❌ Tab no longer exists:', chrome.runtime.lastError);
                pendingRequests.delete(data.url); // Clean up
                return;
              }
              
              // Send message to content script with retry
              const sendWithRetry = (attempt = 0) => {
                chrome.tabs.sendMessage(targetTabId, {
                  action: 'analysisComplete',
                  url: data.url,
                  analysisData: analysisData
                }, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error(`❌ Attempt ${attempt + 1} - Error sending message to content script:`, chrome.runtime.lastError);
                    
                    // Retry up to 3 times
                    if (attempt < 3) {
                      console.log(`🔄 Retrying in ${(attempt + 1) * 500}ms...`);
                      setTimeout(() => sendWithRetry(attempt + 1), (attempt + 1) * 500);
                    } else {
                      console.error('❌ Failed to send message after 3 attempts');
                      pendingRequests.delete(data.url);
                    }
                  } else {
                    console.log('✅ Message sent to content script successfully', response);
                    pendingRequests.delete(data.url);
                  }
                });
              };
              
              sendWithRetry();
            });
          } else {
            console.warn('⚠️ No tabId available to send analysis to content script');
          }
        } catch (parseError) {
          console.error('Failed to parse webhook response:', parseError);
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send to n8n:', response.status, response.statusText);
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Error sending to n8n:', error);
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
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
