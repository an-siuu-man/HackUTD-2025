// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const findTermsBtn = document.getElementById('findTermsBtn');
  const status = document.getElementById('status');
  const linksList = document.getElementById('linksList');
  
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
