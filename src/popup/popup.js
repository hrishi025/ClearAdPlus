const $ = (id) => document.getElementById(id);
let currentDomain = null;
let previousPageCount = 0;
let previousTotalCount = 0;

function send(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (response?.error) return reject(new Error(response.error));
      resolve(response);
    });
  });
}

function animateCounter(element, start, end, duration = 500) {
  const startTime = performance.now();
  const diff = end - start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + diff * easeOut);
    
    element.textContent = current.toLocaleString();
    element.classList.add('animate');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end.toLocaleString();
      setTimeout(() => element.classList.remove('animate'), 300);
    }
  }
  
  requestAnimationFrame(update);
}

function updateHealthIndicator(settings) {
  const health = $("health");
  health.classList.remove('warning', 'error');
  
  if (settings.partialImport) {
    health.classList.add('warning');
  }
}

async function showStatus(settings) {
  $("global").checked = settings.globalEnabled;
  $("subscription").value = settings.subscriptionUrl;
  
  updateHealthIndicator(settings);
  
  const detailsText = `${settings.unsupportedFilterCount.toLocaleString()} unsupported/ignored filters.`;
  if (settings.partialImport) {
    $("details").textContent = detailsText + " Import was limited by Chrome's dynamic-rule capacity.";
  } else {
    $("details").textContent = detailsText;
  }
  
  if (currentDomain) {
    $("allowlist").checked = settings.allowlistedDomains.includes(currentDomain);
  }
  
  // Get Hotstar skipper setting
  chrome.storage.local.get(['hotstarAdBlockEnabled'], (result) => {
    if (result && result.hotstarAdBlockEnabled !== undefined) {
      $("hotstar-skipper").checked = result.hotstarAdBlockEnabled;
    } else {
      // Default to enabled
      $("hotstar-skipper").checked = true;
      chrome.storage.local.set({ hotstarAdBlockEnabled: true });
    }
  });
  
  // Get Prime Video skipper setting
  chrome.storage.local.get(['primeAdBlockEnabled'], (result) => {
    if (result && result.primeAdBlockEnabled !== undefined) {
      $("prime-skipper").checked = result.primeAdBlockEnabled;
    } else {
      // Default to enabled
      $("prime-skipper").checked = true;
      chrome.storage.local.set({ primeAdBlockEnabled: true });
    }
  });
  
  // Get actual blocked counts from background
  try {
    const stats = await send({ type: "stats.getBlockedCount" });
    const pageBlocked = stats.pageBlocked || 0;
    const totalBlocked = stats.totalBlocked || 0;
    
    animateCounter($("page-blocked"), previousPageCount, pageBlocked);
    animateCounter($("total-blocked"), previousTotalCount, totalBlocked);
    
    previousPageCount = pageBlocked;
    previousTotalCount = totalBlocked;
  } catch (error) {
    // Fallback to settings if stats API fails
    const pageBlocked = settings.pageBlockedCount || 0;
    const totalBlocked = settings.totalBlockedCount || 0;
    
    animateCounter($("page-blocked"), previousPageCount, pageBlocked);
    animateCounter($("total-blocked"), previousTotalCount, totalBlocked);
    
    previousPageCount = pageBlocked;
    previousTotalCount = totalBlocked;
  }
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    currentDomain = new URL(tab.url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    currentDomain = null;
  }
  
  $("site").textContent = currentDomain ? `Site: ${currentDomain}` : "This page cannot be allowlisted.";
  $("allowlist").disabled = !currentDomain;
  
  // Hide refresh section if on non-HTTP page
  const refreshSection = $("refresh-section");
  if (refreshSection) {
    if (tab && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
      refreshSection.hidden = false;
    } else {
      refreshSection.hidden = true;
    }
  }
  
  try {
    showStatus(await send({ type: "status.get" }));
  } catch (error) {
    console.error(error);
  }
}

$("global").addEventListener("change", async (event) => {
  try {
    showStatus(await send({ type: "settings.globalEnabled", enabled: event.target.checked }));
  } catch (error) {
    $("status").textContent = error.message;
  }
});

$("allowlist").addEventListener("change", async (event) => {
  try {
    showStatus(await send({ type: "allowlist.set", domain: currentDomain, allowlisted: event.target.checked }));
  } catch (error) {
    console.error(error);
  }
});

$("hotstar-skipper").addEventListener("change", async (event) => {
  try {
    chrome.storage.local.set({ hotstarAdBlockEnabled: event.target.checked });
  } catch (error) {
    console.error(error);
  }
});

$("prime-skipper").addEventListener("change", async (event) => {
  try {
    chrome.storage.local.set({ primeAdBlockEnabled: event.target.checked });
  } catch (error) {
    console.error(error);
  }
});

$("update").addEventListener("click", async () => {
  try {
    await send({ type: "subscription.setUrl", url: $("subscription").value });
    await send({ type: "subscription.refresh" });
    showStatus(await send({ type: "status.get" }));
  } catch (error) {
    console.error(error);
  }
});

$("refresh-page").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      await chrome.tabs.reload(tab.id);
      window.close();
    }
  } catch (error) {
    $("status").textContent = `Refresh failed: ${error.message}`;
  }
});

init().catch((error) => {
  $("status").textContent = error.message;
});
