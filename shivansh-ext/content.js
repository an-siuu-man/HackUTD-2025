// Content script that scans the page for "terms" links
console.log('Terms Finder: Content script loaded');

// Inject script into page context so functions are accessible from console
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

function findTermsLinks() {
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
    
    // Check if the link text or href contains terms-related keywords
    const matchesKeyword = termsKeywords.some(keyword => 
      text.includes(keyword) || href.toLowerCase().includes(keyword)
    );
    
    if (matchesKeyword && href) {
      termsLinks.push({
        text: link.textContent.trim(),
        url: href
      });
      console.log('Found terms link:', link.textContent.trim(), '->', href);
    }
  });
  
  return termsLinks;
}

// Listen for messages from page context
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'FETCH_TERMS_REQUEST') {
    const termsLinks = findTermsLinks();
    
    if (termsLinks.length === 0) {
      console.log('❌ No terms links found on this page');
      return;
    }
    
    console.log(`🔍 Found ${termsLinks.length} terms link(s). Fetching content...`);
    
    // Send to background to fetch content
    chrome.runtime.sendMessage({
      action: 'termsLinksFound',
      links: termsLinks,
      pageUrl: window.location.href,
      autoFetch: true
    });
  }
});

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'findTerms') {
    const termsLinks = findTermsLinks();
    sendResponse({ termsLinks });
    return true;
  } else if (request.action === 'displayContent') {
    // Send content to page context via postMessage
    const { content, url, linkText, index } = request;
    
    window.postMessage({
      type: 'TERMS_CONTENT_RECEIVED',
      content: content,
      url: url,
      linkText: linkText,
      index: index
    }, '*');
    
    sendResponse({ success: true });
    return true;
  }
});



// Auto-find terms links when page loads and fetch their content
window.addEventListener('load', () => {
  const termsLinks = findTermsLinks();
  
  // Send links to page context
  if (termsLinks.length > 0) {
    window.postMessage({
      type: 'TERMS_LINKS_FOUND',
      links: termsLinks
    }, '*');
    
    console.log(`\n🔍 Found ${termsLinks.length} terms link(s). Auto-fetching content...`);
    
    // Send found links to background script to fetch their content
    chrome.runtime.sendMessage({
      action: 'termsLinksFound',
      links: termsLinks,
      pageUrl: window.location.href,
      autoFetch: true
    });
  }
});
