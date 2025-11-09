// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const findTermsBtn = document.getElementById('findTermsBtn');
  const saveWebhookBtn = document.getElementById('saveWebhookBtn');
  const webhookUrlInput = document.getElementById('webhookUrl');
  const webhookStatus = document.getElementById('webhookStatus');
  const status = document.getElementById('status');
  const linksList = document.getElementById('linksList');
  
  // Load existing webhook URL
  chrome.runtime.sendMessage({ action: 'getN8nWebhook' }, (response) => {
    if (response && response.url) {
      webhookUrlInput.value = response.url;
      webhookStatus.textContent = '✅ Webhook configured';
      webhookStatus.style.color = 'green';
    }
  });
  
  // Save webhook URL
  saveWebhookBtn.addEventListener('click', () => {
    const url = webhookUrlInput.value.trim();
    
    if (!url) {
      webhookStatus.textContent = '❌ Please enter a URL';
      webhookStatus.style.color = 'red';
      return;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      webhookStatus.textContent = '❌ Invalid URL format';
      webhookStatus.style.color = 'red';
      return;
    }
    
    chrome.runtime.sendMessage({
      action: 'setN8nWebhook',
      url: url
    }, (response) => {
      if (response && response.success) {
        webhookStatus.textContent = '✅ Webhook saved successfully!';
        webhookStatus.style.color = 'green';
      } else {
        webhookStatus.textContent = '❌ Failed to save webhook';
        webhookStatus.style.color = 'red';
      }
    });
  });
  
  findTermsBtn.addEventListener('click', async () => {
    status.textContent = 'Searching for terms links...';
    linksList.innerHTML = '';
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'findTerms' }, (response) => {
        if (chrome.runtime.lastError) {
          status.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        
        if (response && response.termsLinks) {
          const links = response.termsLinks;
          
          if (links.length === 0) {
            status.textContent = 'No terms links found on this page';
          } else {
            status.textContent = `Found ${links.length} terms link(s). Check console for details.`;
            
            // Display links in popup
            links.forEach((link, index) => {
              const linkItem = document.createElement('div');
              linkItem.className = 'link-item';
              linkItem.textContent = `${index + 1}. ${link.text}`;
              linkItem.title = link.url;
              
              linkItem.addEventListener('click', () => {
                // Fetch and display the terms page content
                chrome.runtime.sendMessage({
                  action: 'fetchTermsContent',
                  url: link.url,
                  text: link.text
                });
                status.textContent = `Fetching: ${link.text}... Check console!`;
              });
              
              linksList.appendChild(linkItem);
            });
            
            // Log to console
            console.log('=== TERMS LINKS FOUND ===');
            links.forEach((link, index) => {
              console.log(`${index + 1}. ${link.text}`);
              console.log(`   URL: ${link.url}`);
            });
            console.log('=========================');
          }
        }
      });
    } catch (error) {
      status.textContent = 'Error: ' + error.message;
      console.error('Error:', error);
    }
  });
});
