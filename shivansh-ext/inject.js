// This script runs in the page context (not isolated like content scripts)
// It has access to window and can be called from the console

console.log('🔍 Terms Finder: Injected script loaded');

// Global variable to store fetched terms content
window.termsData = {
  links: [],
  content: [],
  lastUpdated: null
};

// Helper function to check status
window.checkTermsData = function() {
  console.log('\n📊 Terms Data Status:');
  console.log(`Links found: ${window.termsData.links.length}`);
  console.log(`Content fetched: ${window.termsData.content.length}`);
  console.log(`Last updated: ${window.termsData.lastUpdated || 'Never'}`);
  console.log('\n💡 Available commands:');
  console.log('  - fetchTermsContent()   → Find and fetch all terms');
  console.log('  - printTermsData()      → Print all stored content');
  console.log('  - window.termsData      → View raw data object');
  console.log('');
};

// Function to fetch terms content
window.fetchTermsContent = function() {
  console.log('🔄 Fetching terms content...');
  
  // Send message to content script via custom event
  window.postMessage({ type: 'FETCH_TERMS_REQUEST' }, '*');
};

// Helper function to print all stored content
window.printTermsData = function() {
  if (!window.termsData.content || window.termsData.content.length === 0) {
    console.log('❌ No content stored yet. Use fetchTermsContent() first.');
    return;
  }
  
  console.log(`\n📊 Total stored: ${window.termsData.content.length} terms page(s)\n`);
  
  window.termsData.content.forEach((item, i) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[${i + 1}] ${item.linkText}`);
    console.log(`URL: ${item.url}`);
    console.log(`Fetched: ${item.fetchedAt}`);
    console.log(`${'='.repeat(80)}\n`);
    console.log(item.content);
    console.log(`\n${'='.repeat(80)}\n`);
  });
};

// Listen for messages from content script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'TERMS_LINKS_FOUND') {
    window.termsData.links = event.data.links;
    window.termsData.lastUpdated = new Date().toISOString();
    console.log(`✅ Found ${event.data.links.length} terms link(s)`);
  } else if (event.data.type === 'TERMS_CONTENT_RECEIVED') {
    const { content, url, linkText, index } = event.data;
    
    window.termsData.content.push({
      url: url,
      linkText: linkText,
      content: content,
      fetchedAt: new Date().toISOString()
    });
    window.termsData.lastUpdated = new Date().toISOString();
    
    const indexPrefix = index ? `[${index}] ` : '';
    const titleText = linkText ? ` - "${linkText}"` : '';
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${indexPrefix}📋 TERMS PAGE CONTENT${titleText}`);
    console.log(`URL: ${url}`);
    console.log(`${'='.repeat(80)}\n`);
    console.log(content);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${indexPrefix}✅ END OF TERMS PAGE`);
    console.log(`Stored in: window.termsData.content[${window.termsData.content.length - 1}]`);
    console.log(`${'='.repeat(80)}\n`);
  }
});

console.log('✅ Ready! Use checkTermsData() to see available commands');
