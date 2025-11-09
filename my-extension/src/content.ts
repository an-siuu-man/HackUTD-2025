// Content script - detects and flags terms/conditions/privacy links

interface OverlayElement extends HTMLDivElement {
    dataset: DOMStringMap & {
        targetLink?: string;
    };
}

(function() {
    'use strict';
    
    console.log('Terms & Conditions Detector - Content script loaded');
    
    // Target phrases commonly used for T&C and privacy links
    const targetKeywords: string[] = [
        'terms and conditions',
        'terms & conditions',
        'terms of service',
        'terms of use',
        'privacy policy',
        'privacy notice',
        'cookie policy',
        'user agreement',
        'legal notice',
        'service agreement',
        'conditions'
    ];
    const flaggedLinks = new WeakSet<HTMLAnchorElement>();
    const overlays = new Map<HTMLAnchorElement, OverlayElement>();
    
    // Check if link text contains target keywords (must be a word boundary match)
    function containsTargetKeywords(text: string): boolean {
        const lowerText = text.toLowerCase().trim();
        
        // Check if any keyword appears as a whole word or phrase in the text
        return targetKeywords.some(keyword => {
            // Use word boundary regex to match whole words only
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return regex.test(lowerText);
        });
    }
    
    // Create floating cross overlay on a link
    function addFloatingCross(link: HTMLAnchorElement): void {
        if (flaggedLinks.has(link)) {
            return; // Already flagged
        }
        
        // Get link position and dimensions
        const rect = link.getBoundingClientRect();
        
        // Create overlay container
        const overlay = document.createElement('div') as OverlayElement;
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
        function updatePosition(): void {
            const newRect = link.getBoundingClientRect();
            overlay.style.left = `${newRect.left + window.scrollX}px`;
            overlay.style.top = `${newRect.top + window.scrollY}px`;
        }
        
        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition);
        
        // Mark the link as flagged (no visual changes to the link itself, just the overlay)
        flaggedLinks.add(link);
    }
    
    // Scan all links on the page
    function scanLinks(): number {
        const links = document.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>;
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
    function initialize(): void {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', scanLinks);
        } else {
            scanLinks();
        }
    }
    
    // Watch for dynamically added links
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        let hasNewLinks = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
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
})();
