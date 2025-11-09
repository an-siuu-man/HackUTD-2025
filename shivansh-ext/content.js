// Content script that scans the page for "terms" links
console.log('Terms Finder: Content script loaded');

// Store analysis results
const analysisCache = new Map(); // url -> analysis data

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
      
      // Add visual indicator icon next to the link
      addIconToLink(link);
    }
  });
  
  return termsLinks;
}

// Function to add a visual score bubble next to terms links
function addIconToLink(link, score = null) {
  // Check if link is valid and icon doesn't already exist
  if (!link || link.querySelector('.terms-finder-badge')) {
    return;
  }
  
  // Some links might not support appendChild (e.g., if they contain only images)
  try {
    // Create badge element
    const badge = document.createElement('span');
    badge.className = 'terms-finder-badge';
    
    if (score !== null) {
      // Show score in a circular badge
      badge.innerHTML = `<span class="score">${score}</span>`;
      badge.title = 'Terms Compliance Score - Click to view details';
    } else {
      // Show loading/analyzing state
      badge.innerHTML = `<span class="loading">...</span>`;
      badge.title = 'Analyzing terms...';
    }
    
    // Style the badge
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      vertical-align: middle;
      position: relative;
      animation: fadeIn 0.3s ease;
    `;
    
    // Add hover effect
    badge.addEventListener('mouseenter', () => {
      badge.style.transform = 'scale(1.1)';
      badge.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
    });
    
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = 'scale(1)';
      badge.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
    });
    
    // Add click handler to open side panel
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get analysis data from cache
      const analysisData = analysisCache.get(link.href);
      
      if (analysisData) {
        openSidePanel(analysisData);
      } else {
        console.log('No analysis data available for:', link.href);
      }
    });
    
    // Append badge to the link
    link.appendChild(badge);
  } catch (error) {
    console.log('Could not add badge to link:', error);
  }
}

// Function to update badge with score
function updateBadgeScore(linkUrl, score) {
  console.log('🔄 updateBadgeScore called with url:', linkUrl, 'score:', score);
  
  // Try multiple times in case the badge hasn't been rendered yet
  const attemptUpdate = (attemptNumber = 0) => {
    const links = document.querySelectorAll('a');
    console.log(`🔍 Attempt ${attemptNumber + 1}: Found`, links.length, 'total links on page');
    
    let badgeFound = false;
    let urlMatched = false;
    
    links.forEach(link => {
      if (link.href === linkUrl) {
        urlMatched = true;
        console.log('✅ Found matching link for URL:', linkUrl);
        
        const badge = link.querySelector('.terms-finder-badge');
        if (badge) {
          badgeFound = true;
          console.log('✅ Found badge, updating with score:', score);
          
          badge.innerHTML = `<span class="score">${score}</span>`;
          badge.title = 'Terms Compliance Score - Click to view details';
          
          // Update color based on score
          let gradient;
          if (score >= 80) {
            gradient = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'; // Green
          } else if (score >= 60) {
            gradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'; // Orange
          } else {
            gradient = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'; // Red/Yellow
          }
          badge.style.background = gradient;
          badge.style.animation = 'pulse 0.5s ease';
          console.log('🎨 Updated badge color to:', gradient);
        } else {
          console.warn('⚠️ No badge found on matching link');
        }
      }
    });
    
    if (!urlMatched) {
      console.warn(`⚠️ Attempt ${attemptNumber + 1}: No link found matching URL:`, linkUrl);
    }
    if (urlMatched && !badgeFound) {
      console.warn(`⚠️ Attempt ${attemptNumber + 1}: Link found but badge missing`);
      
      // Retry up to 5 times with increasing delays
      if (attemptNumber < 5) {
        const delay = (attemptNumber + 1) * 500; // 500ms, 1s, 1.5s, 2s, 2.5s
        console.log(`🔄 Retrying in ${delay}ms...`);
        setTimeout(() => attemptUpdate(attemptNumber + 1), delay);
      }
    }
  };
  
  attemptUpdate();
}

// Function to open side panel with analysis data
function openSidePanel(analysisData) {
  console.log('🎨 Opening side panel with data:', analysisData);
  
  // Remove existing panel if any
  const existingPanel = document.getElementById('terms-finder-side-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // Handle both array and single object
  let data;
  if (Array.isArray(analysisData)) {
    data = analysisData[0];
  } else {
    data = analysisData;
  }
  
  // Normalize field names (handle both 'items' and 'itemList')
  if (data && data.items && !data.itemList) {
    data.itemList = data.items;
  }
  
  // Validate data structure
  if (!data || !data.itemList || !Array.isArray(data.itemList)) {
    console.error('❌ Invalid analysis data structure:', data);
    alert('Unable to display analysis. Data format is invalid.');
    return;
  }
  
  console.log('✅ Data validated, creating panel...');
  
  // Create side panel
  const panel = document.createElement('div');
  panel.id = 'terms-finder-side-panel';
  panel.innerHTML = `
    <div class="panel-header">
      <h2>Terms Analysis</h2>
      <button class="close-btn">&times;</button>
    </div>
    
    <div class="panel-content">
      <div class="score-circle-container">
        <svg class="score-circle" viewBox="0 0 120 120">
          <circle class="score-bg" cx="60" cy="60" r="50"></circle>
          <circle class="score-fg" cx="60" cy="60" r="50" 
                  style="stroke-dasharray: ${(data.score / 100) * 314}px 314px"></circle>
          <text x="60" y="70" class="score-text">${data.score}</text>
        </svg>
        ${data.cached ? '<div class="cached-badge">Cached</div>' : ''}
      </div>
      
      <div class="summary-section">
        <h3>Summary</h3>
        <p>${data.summary || 'No summary available'}</p>
      </div>
      
      <div class="items-section">
        ${(data.itemList || []).map((item, index) => `
          <div class="analysis-item flag-${item.flag || 'warning'}">
            <div class="item-header">
              <span class="flag-indicator flag-${item.flag || 'warning'}"></span>
              <h4>${(item.title || 'Untitled').replace(/\*\*/g, '')}</h4>
            </div>
            <p class="item-description">${item.description || 'No description'}</p>
            <div class="item-meta">
              <span class="category">${item.category || 'general'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add close functionality
  document.body.appendChild(panel);
  
  const closeBtn = panel.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    panel.remove();
  });
  
  // Close on outside click
  panel.addEventListener('click', (e) => {
    if (e.target.id === 'terms-finder-side-panel') {
      panel.remove();
    }
  });
}

// Add CSS animation for the icon
function injectStyles() {
  if (!document.head) {
    // If head doesn't exist yet, wait for it
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
      return;
    }
  }
  
  // Check if styles already injected
  if (document.getElementById('terms-finder-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'terms-finder-styles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    #terms-finder-side-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 420px;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    #terms-finder-side-panel .panel-header {
      padding: 24px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    #terms-finder-side-panel .panel-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    #terms-finder-side-panel .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 32px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      line-height: 1;
    }
    
    #terms-finder-side-panel .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }
    
    #terms-finder-side-panel .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    
    #terms-finder-side-panel .panel-content::-webkit-scrollbar {
      width: 8px;
    }
    
    #terms-finder-side-panel .panel-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }
    
    #terms-finder-side-panel .panel-content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10px;
    }
    
    #terms-finder-side-panel .score-circle-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 32px;
      position: relative;
    }
    
    #terms-finder-side-panel .score-circle {
      width: 140px;
      height: 140px;
      transform: rotate(-90deg);
    }
    
    #terms-finder-side-panel .score-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.2);
      stroke-width: 8;
    }
    
    #terms-finder-side-panel .score-fg {
      fill: none;
      stroke: white;
      stroke-width: 8;
      stroke-linecap: round;
      transition: stroke-dasharray 1s ease;
    }
    
    #terms-finder-side-panel .score-text {
      font-size: 36px;
      font-weight: 700;
      fill: white;
      transform: rotate(90deg);
      transform-origin: center;
    }
    
    #terms-finder-side-panel .cached-badge {
      margin-top: 12px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    #terms-finder-side-panel .summary-section {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    #terms-finder-side-panel .summary-section h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    #terms-finder-side-panel .summary-section p {
      margin: 0;
      line-height: 1.6;
      font-size: 14px;
      opacity: 0.95;
    }
    
    #terms-finder-side-panel .items-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    #terms-finder-side-panel .analysis-item {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.2s ease;
    }
    
    #terms-finder-side-panel .analysis-item:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(-4px);
    }
    
    #terms-finder-side-panel .item-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    #terms-finder-side-panel .flag-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }
    
    #terms-finder-side-panel .flag-indicator.flag-good {
      background: #38ef7d;
      box-shadow: 0 0 8px #38ef7d;
    }
    
    #terms-finder-side-panel .flag-indicator.flag-warning {
      background: #f5576c;
      box-shadow: 0 0 8px #f5576c;
    }
    
    #terms-finder-side-panel .flag-indicator.flag-critical {
      background: #fee140;
      box-shadow: 0 0 8px #fee140;
    }
    
    #terms-finder-side-panel .item-header h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
    }
    
    #terms-finder-side-panel .item-description {
      margin: 0 0 12px 0;
      font-size: 13px;
      line-height: 1.6;
      opacity: 0.9;
    }
    
    #terms-finder-side-panel .item-meta {
      display: flex;
      gap: 8px;
    }
    
    #terms-finder-side-panel .category {
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// Inject styles when script loads
injectStyles();

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
  } else if (request.action === 'analysisComplete') {
    // Received analysis from webhook
    const { url, analysisData } = request;
    
    console.log('📥 Received analysis for:', url);
    console.log('📊 Analysis data:', analysisData);
    
    // Handle both array and single object responses
    let data;
    if (Array.isArray(analysisData)) {
      data = analysisData[0];
    } else {
      data = analysisData;
    }
    
    // Normalize field names (handle both 'items' and 'itemList')
    if (data && data.items && !data.itemList) {
      console.log('🔄 Normalizing: Converting "items" to "itemList"');
      data.itemList = data.items;
    }
    
    // Store in cache (wrap in array for consistency with openSidePanel)
    analysisCache.set(url, Array.isArray(analysisData) ? analysisData : [data]);
    console.log('💾 Stored in cache. Cache size:', analysisCache.size);
    
    // Update badge with score
    if (data && data.score !== undefined) {
      const score = data.score;
      console.log('🎯 Updating badge with score:', score);
      updateBadgeScore(url, score);
    } else {
      console.warn('⚠️ No score found in analysis data');
    }
    
    console.log('✅ Analysis processing complete for:', url);
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
