// Content script - detects and flags terms/conditions/privacy links
(function () {
    'use strict';
    console.log('Terms & Conditions Detector - Content script loaded');
    // Target keywords to detect in links
    const targetKeywords = [
        'terms of service',
        'terms and conditions',
        'terms & conditions',
        'privacy policy',
        'cookie policy',
        'user agreement',
        'end user license agreement',
        'eula',
        'acceptable use policy',
        'data policy',
        'Policies'
    ];
    const flaggedLinks = new WeakSet();
    const overlays = new Map();
    
    // Storage for scraped content - organized by type
    const scrapedContent = new Map(); // URL -> content text
    
    // Separate storage for each type of document
    let privacyPolicyContent = '';
    let termsOfServiceContent = '';
    let termsAndConditionsContent = '';
    let cookiePolicyContent = '';
    let userAgreementContent = '';
    let eulaContent = '';
    let acceptableUsePolicyContent = '';
    let dataPolicyContent = '';
    
    // Function to determine the type of content based on link text
    function getContentType(linkText) {
        const lowerText = linkText.toLowerCase();
        if (lowerText.includes('privacy')) return 'privacy';
        if (lowerText.includes('cookie')) return 'cookie';
        if (lowerText.includes('terms of service')) return 'tos';
        if (lowerText.includes('terms') || lowerText.includes('conditions')) return 'terms';
        if (lowerText.includes('user agreement')) return 'useragreement';
        if (lowerText.includes('eula') || lowerText.includes('license')) return 'eula';
        if (lowerText.includes('acceptable use')) return 'aup';
        if (lowerText.includes('data policy')) return 'datapolicy';
        return 'other';
    }
    
    // Check if link text contains target keywords (must be a word boundary match)
    function containsTargetKeywords(text) {
        const lowerText = text.toLowerCase().trim();
        // Check if any keyword appears as a whole word or phrase in the text
        return targetKeywords.some(keyword => {
            // Use word boundary regex to match whole words only
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return regex.test(lowerText);
        });
    }
    
    // Function to scrape content from a URL
    async function scrapePageContent(url) {
        try {
            console.log(`Scraping content from: ${url}`);
            const response = await fetch(url);
            const html = await response.text();
            
            // Parse HTML and extract text content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove script and style elements
            const scripts = doc.querySelectorAll('script, style, noscript');
            scripts.forEach(el => el.remove());
            
            // Get text content from body
            const textContent = doc.body.innerText || doc.body.textContent;
            
            // Clean up whitespace
            const cleanedContent = textContent
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log(`Successfully scraped ${cleanedContent.length} characters from ${url}`);
            return cleanedContent;
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            return null;
        }
    }
    // Create floating cross overlay on a link
    function addFloatingCross(link) {
        if (flaggedLinks.has(link)) {
            return; // Already flagged
        }
        // Get link position and dimensions
        const rect = link.getBoundingClientRect();
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.className = 'terms-detector-overlay';
        overlay.innerHTML = '❌';
        overlay.title = 'Warning: Terms, Conditions, or Privacy Policy link detected';
        // Position overlay on top of the link
        overlay.style.cssText = `
            position: absolute;
            left: ${rect.left + window.scrollX}px;
            top: ${rect.top + window.scrollY}px;
            pointer-events: none;
            z-index: 999999;
            font-size: 18px;
            animation: float-bounce 2s ease-in-out infinite;
        `;
        document.body.appendChild(overlay);
        // Store reference to update position on scroll/resize
        link.dataset.termsDetectorOverlay = 'true';
        overlays.set(link, overlay);
        // Update position on scroll and resize
        function updatePosition() {
            const newRect = link.getBoundingClientRect();
            overlay.style.left = `${newRect.left + window.scrollX}px`;
            overlay.style.top = `${newRect.top + window.scrollY}px`;
        }
        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition);
        
        // Automatically scrape content when link is flagged
        const targetUrl = link.href;
        const linkText = link.textContent || '';
        const contentType = getContentType(linkText);
        
        // Check if we already have this content
        if (!scrapedContent.has(targetUrl)) {
            // Scrape the content immediately in the background
            console.log(`Auto-scraping content from: ${targetUrl} (Type: ${contentType})`);
            scrapePageContent(targetUrl).then(content => {
                if (content) {
                    scrapedContent.set(targetUrl, content);
                    
                    // Store in appropriate variable based on type
                    switch(contentType) {
                        case 'privacy':
                            privacyPolicyContent = content;
                            console.log(`✓ Stored in privacyPolicyContent (${content.length} chars)`);
                            break;
                        case 'cookie':
                            cookiePolicyContent = content;
                            console.log(`✓ Stored in cookiePolicyContent (${content.length} chars)`);
                            break;
                        case 'tos':
                            termsOfServiceContent = content;
                            console.log(`✓ Stored in termsOfServiceContent (${content.length} chars)`);
                            break;
                        case 'terms':
                            termsAndConditionsContent = content;
                            console.log(`✓ Stored in termsAndConditionsContent (${content.length} chars)`);
                            break;
                        case 'useragreement':
                            userAgreementContent = content;
                            console.log(`✓ Stored in userAgreementContent (${content.length} chars)`);
                            break;
                        case 'eula':
                            eulaContent = content;
                            console.log(`✓ Stored in eulaContent (${content.length} chars)`);
                            break;
                        case 'aup':
                            acceptableUsePolicyContent = content;
                            console.log(`✓ Stored in acceptableUsePolicyContent (${content.length} chars)`);
                            break;
                        case 'datapolicy':
                            dataPolicyContent = content;
                            console.log(`✓ Stored in dataPolicyContent (${content.length} chars)`);
                            break;
                    }
                    
                    console.log('Preview:', content.substring(0, 200) + '...');
                    
                    // You can also send this to background script or store in chrome.storage
                    // chrome.runtime.sendMessage({ action: 'saveContent', url: targetUrl, content: content, type: contentType });
                }
            }).catch(error => {
                console.error(`Failed to scrape ${targetUrl}:`, error);
            });
        } else {
            console.log(`Content already scraped for: ${targetUrl}`);
        }
        
        // Mark the link as flagged (no visual changes to the link itself, just the overlay)
        flaggedLinks.add(link);
    }
    // Scan all links on the page
    function scanLinks() {
        const links = document.querySelectorAll('a[href]');
        let count = 0;
        links.forEach(link => {
            const text = link.textContent || '';
            // Only check the visible link text, NOT the URL
            // This prevents flagging links that just happen to have "terms" in the URL path
            if (text.trim() && containsTargetKeywords(text)) {
                addFloatingCross(link);
                count++;
                console.log(`Flagged link with text: "${text.trim()}"`);
            }
        });
        console.log(`Total flagged: ${count} links containing terms/conditions/privacy`);
        return count;
    }
    // Initial scan when page loads
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', scanLinks);
        }
        else {
            scanLinks();
        }
    }
    // Watch for dynamically added links
    const observer = new MutationObserver((mutations) => {
        let hasNewLinks = false;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node;
                    if (element.tagName === 'A' || element.querySelectorAll('a[href]').length > 0) {
                        hasNewLinks = true;
                    }
                }
            });
        });
        if (hasNewLinks) {
            setTimeout(scanLinks, 100);
        }
    });
    // Start observing for dynamic content
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    // Initialize
    initialize();
    console.log('Terms & Conditions Detector - Active and monitoring');
    
    // Inject script into page context to expose variables and functions
    const script = document.createElement('script');
    script.textContent = `
        // Individual variables for each type of content
        window.privacyPolicyContent = '';
        window.termsOfServiceContent = '';
        window.termsAndConditionsContent = '';
        window.cookiePolicyContent = '';
        window.userAgreementContent = '';
        window.eulaContent = '';
        window.acceptableUsePolicyContent = '';
        window.dataPolicyContent = '';
        
        // Map to store all content by URL
        window.scrapedDataStore = new Map();
        
        // Helper functions
        window.getScrapedContent = function(url) {
            if (url) {
                return window.scrapedDataStore.get(url);
            }
            return Object.fromEntries(window.scrapedDataStore);
        };
        
        window.getScrapedUrls = function() {
            return Array.from(window.scrapedDataStore.keys());
        };
        
        window.showAllScrapedContent = function() {
            const allContent = Object.fromEntries(window.scrapedDataStore);
            console.table(Object.keys(allContent).map(url => ({
                url,
                length: allContent[url].length,
                preview: allContent[url].substring(0, 100) + '...'
            })));
            return allContent;
        };
        
        window.getAllScrapedVariables = function() {
            return {
                privacyPolicy: window.privacyPolicyContent,
                termsOfService: window.termsOfServiceContent,
                termsAndConditions: window.termsAndConditionsContent,
                cookiePolicy: window.cookiePolicyContent,
                userAgreement: window.userAgreementContent,
                eula: window.eulaContent,
                acceptableUsePolicy: window.acceptableUsePolicyContent,
                dataPolicy: window.dataPolicyContent
            };
        };
        
        console.log('✅ Content scraper ready!');
        console.log('📋 Access scraped content via these variables:');
        console.log('  window.privacyPolicyContent');
        console.log('  window.termsOfServiceContent');
        console.log('  window.termsAndConditionsContent');
        console.log('  window.cookiePolicyContent');
        console.log('  window.userAgreementContent');
        console.log('  window.eulaContent');
        console.log('  window.acceptableUsePolicyContent');
        console.log('  window.dataPolicyContent');
        console.log('');
        console.log('📋 Helper functions:');
        console.log('  window.getAllScrapedVariables() - Get all variables as object');
        console.log('  window.getScrapedContent() - Get all content by URL');
        console.log('  window.showAllScrapedContent() - Display formatted table');
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    
    // Helper to update page context variables
    function updatePageContextVariable(varName, content) {
        const script = document.createElement('script');
        script.textContent = `window.${varName} = ${JSON.stringify(content)};`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }
    
    function updatePageContextStore(url, content) {
        const script = document.createElement('script');
        script.textContent = `window.scrapedDataStore.set(${JSON.stringify(url)}, ${JSON.stringify(content)});`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }
    
    // Update scraped content storage and sync to page context
    const originalSet = scrapedContent.set.bind(scrapedContent);
    scrapedContent.set = function(url, content) {
        originalSet(url, content);
        updatePageContextStore(url, content);
        return scrapedContent;
    };
    
    // Sync typed variables to page context
    function syncTypedVariables() {
        updatePageContextVariable('privacyPolicyContent', privacyPolicyContent);
        updatePageContextVariable('termsOfServiceContent', termsOfServiceContent);
        updatePageContextVariable('termsAndConditionsContent', termsAndConditionsContent);
        updatePageContextVariable('cookiePolicyContent', cookiePolicyContent);
        updatePageContextVariable('userAgreementContent', userAgreementContent);
        updatePageContextVariable('eulaContent', eulaContent);
        updatePageContextVariable('acceptableUsePolicyContent', acceptableUsePolicyContent);
        updatePageContextVariable('dataPolicyContent', dataPolicyContent);
    }
    
    // Watch for changes and sync
    setInterval(syncTypedVariables, 1000);
})();
