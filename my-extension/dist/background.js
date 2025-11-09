// Background service worker - runs persistently
console.log('Terms & Conditions Detector - Background worker active');
// Keep the service worker alive
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed/updated');
});
// Listen for tab updates
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, _tab) => {
    if (changeInfo.status === 'complete') {
        console.log('Page loaded, content script should be active');
    }
});
// Keep alive mechanism
setInterval(() => {
    console.log('Background worker keepalive');
}, 20000);
