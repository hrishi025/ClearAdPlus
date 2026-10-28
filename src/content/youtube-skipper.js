(() => {
  const hostname = location.hostname.toLowerCase().replace(/^www\./, "");
  let enabled = false;
  let scheduled = false;
  let observer = null;

  function getBlockingState() {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ type: "site.blockingState", hostname }, (state) => {
          resolve(Boolean(!chrome.runtime.lastError && state?.enabled));
        });
      } catch (error) {
        // Extension context invalidated
        console.debug('Extension context invalidated, blocking state check failed');
        resolve(false);
      }
    });
  }

  function skipAd() {
    if (!enabled) return;
    const player = document.querySelector(".html5-video-player");
    if (!player?.classList.contains("ad-showing")) return;

    // Prefer YouTube's own visible skip controls. This avoids guessing a
    // player-internal API and adapts to both older and newer button markup.
    const skipButton = player.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern, button[id^='skip-button']");
    if (skipButton instanceof HTMLElement && !skipButton.disabled) skipButton.click();

    // Some skippable ads show no button until a timer completes. Seeking to
    // the end is a fallback only while YouTube explicitly marks the player as
    // showing an ad; it never seeks ordinary video playback.
    const video = player.querySelector("video.html5-main-video");
    if (video && Number.isFinite(video.duration) && video.duration > 0 && video.currentTime < video.duration - 0.25) {
      try { video.currentTime = Math.max(0, video.duration - 0.1); }
      catch { /* A live/non-seekable ad remains under player control. */ }
    }
  }

  function scheduleSkip() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      skipAd();
    }, 150);
  }

  async function refreshState() {
    enabled = await getBlockingState();
    if (enabled) scheduleSkip();
  }

  function start() {
    if (!document.documentElement) {
      document.addEventListener("DOMContentLoaded", start, { once: true });
      return;
    }
    observer = new MutationObserver(scheduleSkip);
    observer.observe(document.documentElement, { childList: true, attributes: true, subtree: true, attributeFilter: ["class"] });
    setInterval(scheduleSkip, 1000);
    void refreshState();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "clearblock.refresh") void refreshState();
  });
  start();
})();
