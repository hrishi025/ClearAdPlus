// Track blocked requests per page
let pageBlockedCount = 0;

// Safe message sending function
function sendMessageSafely(message) {
  try {
    chrome.runtime.sendMessage(message);
  } catch (error) {
    // Extension context invalidated (e.g., during reload)
    // This is expected and we can ignore it
    console.debug('Extension context invalidated, message not sent:', message.type);
  }
}

// Listen for blocked requests (note: this is a simplified approach)
// In MV3, we can't directly count blocked requests via webRequest
// We'll use a different approach with declarativeNetRequest if needed

// For now, we'll increment counters based on cosmetic rule applications
// and communicate with the background script

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'clearblock.getBlockedCount') {
    sendResponse({
      pageBlocked: pageBlockedCount
    });
  } else if (message.type === 'clearblock.incrementCount') {
    pageBlockedCount++;
    sendMessageSafely({ type: 'stats.incrementCount' });
    sendResponse({ success: true });
  } else if (message.type === 'clearblock.resetPageCount') {
    pageBlockedCount = 0;
    sendMessageSafely({ type: 'stats.resetPageCount' });
    sendResponse({ success: true });
  }
  return true;
});

// Reset page count when page is reloaded
window.addEventListener('beforeunload', () => {
  sendMessageSafely({ type: 'stats.resetPageCount' });
});

// Also reset on navigation
window.addEventListener('popstate', () => {
  sendMessageSafely({ type: 'stats.resetPageCount' });
});
