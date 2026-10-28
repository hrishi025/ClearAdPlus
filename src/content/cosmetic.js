(() => {
  const styleId = "clearblock-cosmetic-rules";
  const hostname = location.hostname.toLowerCase().replace(/^www\./, "");
  let hasAppliedRules = false;
  
  // Safe message sending function
  function sendMessageSafely(message, callback) {
    try {
      chrome.runtime.sendMessage(message, callback);
    } catch (error) {
      // Extension context invalidated (e.g., during reload)
      console.debug('Extension context invalidated, message not sent:', message.type);
      if (callback) callback();
    }
  }
  
  function apply() {
    document.getElementById(styleId)?.remove();
    sendMessageSafely({ type: "cosmetic.get", hostname }, (selectors) => {
      if (chrome.runtime.lastError || !Array.isArray(selectors) || selectors.length === 0) return;
      
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `${selectors.join(",")} { display: none !important; }`;
      (document.documentElement || document.head).appendChild(style);
      
      // Increment blocked count once when rules are applied
      if (!hasAppliedRules && selectors.length > 0) {
        hasAppliedRules = true;
        sendMessageSafely({ type: "stats.incrementCount" });
      }
    });
  }
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "clearblock.refresh") apply();
  });
  
  // Reset page count on navigation
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "clearblock.resetPageCount") {
      hasAppliedRules = false;
    }
  });
  
  apply();
})();
