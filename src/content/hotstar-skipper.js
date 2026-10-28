(function () {
  'use strict';
  let isEnabled = true;
  let skipped = 0;
  let wasMutedByAd = false;
  let userPreferredSpeed = 1.0;

  function safeStorage(data) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(data);
      }
    } catch (e) {}
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['hotstarAdBlockEnabled', 'hotstarAdsSkipped'], function(res) {
        if (res && res.hotstarAdBlockEnabled !== undefined) isEnabled = res.hotstarAdBlockEnabled;
        if (res && res.hotstarAdsSkipped !== undefined) skipped = res.hotstarAdsSkipped;
      });
      chrome.storage.onChanged.addListener(function(changes) {
        if (changes.hotstarAdBlockEnabled) isEnabled = changes.hotstarAdBlockEnabled.newValue;
      });
    }
  } catch (e) {}

  function processPlayer() {
    if (!isEnabled) return;

    // 1. Auto-click visible Skip Ad buttons
    const skipButtons = document.querySelectorAll(
      'button[class*="skip" i], div[class*="skip" i], [aria-label*="skip" i], .video-ads-skip-button, .ad-skip-button, [data-testid*="skip"], .skip-btn'
    );
    for (let i = 0; i < skipButtons.length; i++) {
      const btn = skipButtons[i];
      if (btn && btn.offsetParent !== null && typeof btn.click === 'function') {
        btn.click();
        skipped++;
        safeStorage({ hotstarAdsSkipped: skipped });
      }
    }

    // 2. Video Speed & Mute Logic
    const videos = document.querySelectorAll('video');
    videos.forEach(function(video) {
      const dur = video.duration;

      // Detect User's Chosen Speed when normal video is playing
      if (dur > 60 && video.playbackRate <= 2.0) {
        userPreferredSpeed = video.playbackRate;
      }

      // MAIN CONTENT (Duration > 60s or Live Stream)
      if (dur > 60 || !Number.isFinite(dur)) {
        if (video.playbackRate > 2.0) {
          video.playbackRate = userPreferredSpeed || 1.0;
        }
        if (wasMutedByAd) {
          video.muted = false;
          wasMutedByAd = false;
        }
      } 
      // AD VIDEO (Duration <= 60s)
      else if (dur > 0 && dur <= 60) {
        wasMutedByAd = true;
        if (!video.muted) video.muted = true;
        video.playbackRate = 16.0;

        if (video.currentTime < dur - 0.2) {
          video.currentTime = dur;
          skipped++;
          safeStorage({ hotstarAdsSkipped: skipped });
        }
      }
    });

    // 3. Hide Banners & Sponsor Overlays
    const banners = document.querySelectorAll('[class*="banner-ad"], [class*="sponsor-card"], [class*="masthead-ad"]');
    banners.forEach(function(el) {
      el.style.display = 'none';
    });
  }

  setInterval(processPlayer, 150);
})();
