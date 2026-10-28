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
  
  updateHealthIndicator(settings);
  
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

function showRefreshButton(settingId) {
  const refreshBtn = document.querySelector(`.refresh-btn-mini[data-setting="${settingId}"]`);
  if (refreshBtn) {
    refreshBtn.classList.remove('hidden');
    setTimeout(() => {
      refreshBtn.classList.add('visible');
    }, 10);
  }
}

function hideAllRefreshButtons() {
  const buttons = document.querySelectorAll('.refresh-btn-mini');
  buttons.forEach(btn => {
    btn.classList.remove('visible');
    btn.classList.add('hidden');
  });
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    if (tab && tab.url) {
      currentDomain = new URL(tab.url).hostname.toLowerCase().replace(/^www\./, "");
    } else {
      currentDomain = null;
    }
  } catch {
    currentDomain = null;
  }
  
  $("site").textContent = currentDomain ? `Site: ${currentDomain}` : "This page cannot be allowlisted.";
  $("allowlist").disabled = !currentDomain;
  
  // Hide all refresh buttons on init
  hideAllRefreshButtons();
  
  try {
    showStatus(await send({ type: "status.get" }));
  } catch (error) {
    console.error(error);
  }
}

$("global").addEventListener("change", async (event) => {
  showRefreshButton('global');
  try {
    showStatus(await send({ type: "settings.globalEnabled", enabled: event.target.checked }));
  } catch (error) {
    $("status").textContent = error.message;
  }
});

$("allowlist").addEventListener("change", async (event) => {
  showRefreshButton('allowlist');
  try {
    showStatus(await send({ type: "allowlist.set", domain: currentDomain, allowlisted: event.target.checked }));
  } catch (error) {
    console.error(error);
  }
});

$("hotstar-skipper").addEventListener("change", async (event) => {
  showRefreshButton('hotstar');
  try {
    chrome.storage.local.set({ hotstarAdBlockEnabled: event.target.checked });
  } catch (error) {
    console.error(error);
  }
});

$("prime-skipper").addEventListener("change", async (event) => {
  showRefreshButton('prime');
  try {
    chrome.storage.local.set({ primeAdBlockEnabled: event.target.checked });
  } catch (error) {
    console.error(error);
  }
});

// Add event listeners for mini refresh buttons
document.querySelectorAll('.refresh-btn-mini').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await chrome.tabs.reload(tab.id);
        window.close();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  });
});

init().catch((error) => {
  $("status").textContent = error.message;
});
