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
              
              // Add SVG icon
              const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              icon.setAttribute('width', '24');
              icon.setAttribute('height', '24');
              icon.setAttribute('viewBox', '0 0 24 24');
              icon.setAttribute('fill', 'none');
              icon.setAttribute('stroke', 'currentColor');
              icon.setAttribute('stroke-width', '2');
              icon.setAttribute('stroke-linecap', 'round');
              icon.setAttribute('stroke-linejoin', 'round');
              
              const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path1.setAttribute('d', 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z');
              
              const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
              polyline.setAttribute('points', '14 2 14 8 20 8');
              
              icon.appendChild(path1);
              icon.appendChild(polyline);
              
              // Add text
              const textSpan = document.createElement('span');
              textSpan.textContent = `${index + 1}. ${link.text}`;
              
              linkItem.appendChild(icon);
              linkItem.appendChild(textSpan);
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
