/**
 * Utility functions to detect the context in which the extension is running
 */

export type ExtensionContext = 'popup' | 'tab' | 'unknown';

/**
 * Detects if the extension is running in a popup or a regular tab
 * @returns The context in which the extension is running
 */
export function detectExtensionContext(): ExtensionContext {
    // Check if we're in a Chrome extension context
    if (!window.location.href.startsWith('chrome-extension://')) {
        return 'unknown';
    }

    // Method 1: Check window dimensions
    // Popups typically have smaller, fixed dimensions
    const isSmallWindow = window.innerWidth <= 400 && window.innerHeight <= 600;
    
    // Method 2: Check if window can be resized (popups usually can't)
    const isResizable = window.outerWidth !== window.innerWidth || 
                       window.outerHeight !== window.innerHeight;
    
    // Method 3: Check URL parameters or hash for explicit context
    const urlParams = new URLSearchParams(window.location.search);
    const contextParam = urlParams.get('context');
    
    if (contextParam === 'tab') {
        return 'tab';
    }
    
    if (contextParam === 'popup') {
        return 'popup';
    }
    
    // Method 4: Check if we have access to chrome.extension.getViews
    // This is more reliable but requires permissions
    try {
        if (typeof chrome !== 'undefined' && chrome.extension && chrome.extension.getViews) {
            const views = chrome.extension.getViews({ type: 'popup' });
            const isInPopupView = views.some(view => view === window);
            if (isInPopupView) {
                return 'popup';
            }
        }
    } catch (error) {
        console.debug('Could not access chrome.extension.getViews:', error);
    }
    
    // Fallback: Use window dimensions as primary indicator
    return isSmallWindow ? 'popup' : 'tab';
}

/**
 * Checks if the extension is running in popup mode
 */
export function isPopupContext(): boolean {
    return detectExtensionContext() === 'popup';
}

/**
 * Checks if the extension is running in tab mode
 */
export function isTabContext(): boolean {
    return detectExtensionContext() === 'tab';
}

/**
 * Opens the extension in a new tab
 */
export function openInNewTab(): void {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        const extensionUrl = chrome.runtime.getURL('index.html?context=tab');
        chrome.tabs.create({ url: extensionUrl });
    } else {
        // Fallback for development or when chrome.tabs is not available
        const extensionUrl = `${window.location.origin}${window.location.pathname}?context=tab`;
        window.open(extensionUrl, '_blank');
    }
}

/**
 * Gets the appropriate CSS class for the current context
 */
export function getContextClass(): string {
    const context = detectExtensionContext();
    return `context-${context}`;
}
