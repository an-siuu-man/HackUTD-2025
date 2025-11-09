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
      background: white;
      color: #111827;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      vertical-align: middle;
      position: relative;
      animation: fadeIn 0.3s ease;
    `;
    
    // Add hover effect
    badge.addEventListener('mouseenter', () => {
      badge.style.transform = 'scale(1.1)';
      badge.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.1)';
    });
    
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = 'scale(1)';
      badge.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.1)';
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
          let bgColor, textColor;
          if (score >= 80) {
            bgColor = '#22c55e'; // Green
            textColor = 'white';
          } else if (score >= 60) {
            bgColor = '#84cc16'; // Lime
            textColor = 'white';
          } else if (score >= 40) {
            bgColor = '#f59e0b'; // Yellow
            textColor = 'white';
          } else {
            bgColor = '#ef4444'; // Red
            textColor = 'white';
          }
          badge.style.background = bgColor;
          badge.style.color = textColor;
          badge.style.animation = 'pulse 0.5s ease';
          console.log('🎨 Updated badge color to:', bgColor);
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
          <text x="60" y="60" class="score-text">${data.score}</text>
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
      
      <div class="panel-footer">
        <button class="save-report-btn" id="saveReportBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save Report
        </button>
        <div class="save-status" id="saveStatus"></div>
      </div>
    </div>
  `;
  
  // Add close functionality
  document.body.appendChild(panel);
  
  const closeBtn = panel.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    panel.remove();
  });
  
  // Add save report functionality
  const saveBtn = panel.querySelector('#saveReportBtn');
  const saveStatus = panel.querySelector('#saveStatus');
  
  saveBtn.addEventListener('click', async () => {
    try {
      // Disable button during save
      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.6';
      saveStatus.textContent = 'Saving...';
      saveStatus.style.color = '#6b7280';
      
      // Get user_id from storage (assuming user is logged in via extension or can be set)
      const storage = await chrome.storage.local.get(['userId', 'saveWebhookUrl']);
      let userId = storage.userId;
      
      if (!userId) {
        // Prompt for user_id if not set
        const inputUserId = prompt('Please enter your User ID to save this report:');
        if (!inputUserId) {
          saveStatus.textContent = 'Save cancelled';
          saveStatus.style.color = '#f59e0b';
          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          return;
        }
        // Save userId for future use and use it for this request
        await chrome.storage.local.set({ userId: inputUserId });
        userId = inputUserId;
      }
      
      // Get the snapshot_id from the analysis data (we'll need to store it when analysis comes back)
      const snapshotId = data.snapshot_id || data.id;
      
      if (!snapshotId) {
        saveStatus.textContent = 'Error: No snapshot ID found';
        saveStatus.style.color = '#ef4444';
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
        return;
      }
      
      // Get webhook URL from storage or use default
      const webhookUrl = storage.saveWebhookUrl || 'http://localhost:5678/webhook/save-to-account';
      
      console.log('💾 Saving report with:', { userId, snapshotId, webhookUrl });
      
      // Send to n8n save webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          snapshot_id: snapshotId
        })
      });
      
      if (response.ok) {
        try {
          const result = await response.json();
          saveStatus.textContent = result.message || 'Report saved successfully! ✓';
          saveStatus.style.color = '#22c55e';
          
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            window.open('http://localhost:3000/dashboard', '_blank');
            saveStatus.textContent = '';
          }, 1500);
        } catch (jsonError) {
          // If response is not JSON, just show success
          console.warn('Response was not JSON, but request succeeded:', jsonError);
          saveStatus.textContent = 'Report saved successfully! ✓';
          saveStatus.style.color = '#22c55e';
          
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            window.open('http://localhost:3000/dashboard', '_blank');
            saveStatus.textContent = '';
          }, 1500);
        }
      } else {
        const errorText = await response.text();
        console.error('Save failed with status:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Error saving report:', error);
      saveStatus.textContent = 'Failed to save. Check console for details.';
      saveStatus.style.color = '#ef4444';
    } finally {
      saveBtn.disabled = false;
      saveBtn.style.opacity = '1';
    }
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
      background: #f9fafb;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    #terms-finder-side-panel .panel-header {
      padding: 24px;
      background: white;
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
    }
    
    #terms-finder-side-panel .panel-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #111827;
    }
    
    #terms-finder-side-panel .close-btn {
      background: #f3f4f6;
      border: none;
      color: #6b7280;
      font-size: 28px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      line-height: 1;
      padding: 0;
      margin: 0;
    }
    
    #terms-finder-side-panel .close-btn:hover {
      background: #e5e7eb;
      color: #111827;
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
      background: #f3f4f6;
    }
    
    #terms-finder-side-panel .panel-content::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 10px;
    }
    
    #terms-finder-side-panel .panel-content::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
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
      stroke: #e5e7eb;
      stroke-width: 8;
    }
    
    #terms-finder-side-panel .score-fg {
      fill: none;
      stroke: #22c55e;
      stroke-width: 8;
      stroke-linecap: round;
      transition: stroke-dasharray 1s ease;
    }
    
    #terms-finder-side-panel .score-text {
      font-size: 36px;
      font-weight: 700;
      fill: #111827;
      transform: rotate(90deg);
      transform-origin: center;
      text-anchor: middle;
      dominant-baseline: central;
    }
    
    #terms-finder-side-panel .cached-badge {
      margin-top: 12px;
      padding: 6px 12px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    #terms-finder-side-panel .summary-section {
      background: white;
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    #terms-finder-side-panel .summary-section h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
    
    #terms-finder-side-panel .summary-section p {
      margin: 0;
      line-height: 1.6;
      font-size: 14px;
      color: #4b5563;
    }
    
    #terms-finder-side-panel .items-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    #terms-finder-side-panel .analysis-item {
      background: white;
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }
    
    #terms-finder-side-panel .analysis-item:hover {
      background: #fafafa;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      background: #22c55e;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
    }
    
    #terms-finder-side-panel .flag-indicator.flag-warning {
      background: #f59e0b;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
    }
    
    #terms-finder-side-panel .flag-indicator.flag-critical {
      background: #ef4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
    }
    
    #terms-finder-side-panel .item-header h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
      color: #111827;
    }
    
    #terms-finder-side-panel .item-description {
      margin: 0 0 12px 0;
      font-size: 13px;
      line-height: 1.6;
      color: #6b7280;
    }
    
    #terms-finder-side-panel .item-meta {
      display: flex;
      gap: 8px;
    }
    
    #terms-finder-side-panel .category {
      padding: 4px 10px;
      background: #f3f4f6;
      color: #4b5563;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    #terms-finder-side-panel .panel-footer {
      padding: 20px 24px;
      background: white;
      backdrop-filter: blur(10px);
      border-top: 1px solid #e5e7eb;
    }
    
    #terms-finder-side-panel .save-report-btn {
      width: 100%;
      padding: 14px 20px;
      background: #111827;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    #terms-finder-side-panel .save-report-btn:hover:not(:disabled) {
      background: #1f2937;
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
    }
    
    #terms-finder-side-panel .save-report-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    
    #terms-finder-side-panel .save-report-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    #terms-finder-side-panel .save-report-btn svg {
      width: 20px;
      height: 20px;
    }
    
    #terms-finder-side-panel .save-status {
      margin-top: 12px;
      text-align: center;
      font-size: 13px;
      font-weight: 500;
      min-height: 20px;
      transition: all 0.3s ease;
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
