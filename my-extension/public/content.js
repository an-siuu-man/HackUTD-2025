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
    
    // Function to clean and normalize URL (remove hash fragments)
    function normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove hash fragment
            urlObj.hash = '';
            return urlObj.href;
        } catch (error) {
            return url;
        }
    }
    
    // Function to scrape content from a URL
    async function scrapePageContent(url) {
        try {
            // Normalize URL by removing hash fragments
            const cleanUrl = normalizeUrl(url);
            console.log(`Scraping content from: ${cleanUrl}${url !== cleanUrl ? ' (normalized from ' + url + ')' : ''}`);
            
            const response = await fetch(cleanUrl);
            const html = await response.text();
            
            // Parse HTML and extract text content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove script and style elements
            const scripts = doc.querySelectorAll('script, style, noscript');
            scripts.forEach(el => el.remove());
            
            // Try to find the main content area first (better extraction)
            let textContent = '';
            const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];
            
            for (const selector of mainSelectors) {
                const mainElement = doc.querySelector(selector);
                if (mainElement && mainElement.innerText.length > 500) {
                    textContent = mainElement.innerText || mainElement.textContent;
                    console.log(`Found main content in: ${selector}`);
                    break;
                }
            }
            
            // Fallback to full body if main content not found
            if (!textContent) {
                textContent = doc.body.innerText || doc.body.textContent;
            }
            
            // Clean up whitespace
            const cleanedContent = textContent
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log(`Successfully scraped ${cleanedContent.length} characters from ${cleanUrl}`);
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
        
        // Function to send scraped content to external API or process further
        window.sendScrapedDataToAPI = async function(apiUrl) {
            const data = window.getAllScrapedVariables();
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                console.log('✓ Data sent to API:', await response.json());
                return response;
            } catch (error) {
                console.error('✗ Failed to send data:', error);
                throw error;
            }
        };
        
        // Function to export as JSON file
        window.exportScrapedDataAsJSON = function() {
            const data = window.getAllScrapedVariables();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scraped-policies-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
            console.log('✓ Exported scraped data as JSON file');
        };
        
        // Function to process text (example: count words, extract keywords, etc.)
        window.processScrapedText = function(textType) {
            const text = window.getAllScrapedVariables()[textType] || '';
            return {
                characterCount: text.length,
                wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
                sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
                preview: text.substring(0, 200) + '...',
                containsKeywords: {
                    personalData: /personal data|personal information|pii/i.test(text),
                    cookies: /cookie/i.test(text),
                    thirdParty: /third.party|third party/i.test(text),
                    dataRetention: /retain|retention|storage period/i.test(text),
                    gdpr: /gdpr|general data protection/i.test(text)
                }
            };
        };
        
        console.log('✅ Content scraper ready!');
        console.log('');
        console.log('📋 ACCESS SCRAPED CONTENT:');
        console.log('  window.privacyPolicyContent           - Privacy policy text');
        console.log('  window.termsOfServiceContent          - Terms of service text');
        console.log('  window.termsAndConditionsContent      - Terms & conditions text');
        console.log('  window.cookiePolicyContent            - Cookie policy text');
        console.log('  window.getAllScrapedVariables()       - Get all as object');
        console.log('');
        console.log('� EXPORT/SEND DATA:');
        console.log('  window.sendScrapedDataToAPI(url)      - POST to your API');
        console.log('  window.exportScrapedDataAsJSON()      - Download as JSON file');
        console.log('');
        console.log('🔍 PROCESS DATA:');
        console.log('  window.processScrapedText("privacyPolicy")  - Analyze text');
        console.log('  window.showAllScrapedContent()              - Display table');
        console.log('');
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
