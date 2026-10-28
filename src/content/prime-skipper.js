(function () {
  'use strict';
  const MAX_TRIES_MONITOR_SKIP = 10;
  const AD_FAST_FORWARD_RATE = 8;
  
  // Ad indicators for Amazon Prime Video
  const AD_INDICATOR_SELECTORS = [
    '.atv-player-ad-time-remaining',
    '.atvwebplayersdk-ad-timer-remaining-time',
    '.atvwebplayersdk-ad-timer-text',
    '.atvwebplayersdk-adtimeindicator-text',
    '.atvwebplayersdk-ad-resume-message',
  ];
  
  let isMonitorActive = null;
  let isEnabled = true;
  let options = { skipAds: true };

  async function initContent() {
    // Load settings from storage
    chrome.storage.local.get(['primeAdBlockEnabled'], (result) => {
      if (result && result.primeAdBlockEnabled !== undefined) {
        isEnabled = result.primeAdBlockEnabled;
        options.skipAds = isEnabled;
      } else {
        // Default to enabled
        isEnabled = true;
        options.skipAds = true;
        chrome.storage.local.set({ primeAdBlockEnabled: true });
      }
      startHelper(options);
    });
    
    // Listen for setting changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.primeAdBlockEnabled) {
        isEnabled = changes.primeAdBlockEnabled.newValue;
        options.skipAds = isEnabled;
        startHelper(options);
      }
    });
  }

  function startMonitoringForSelectors(selectors, numTries) {
    numTries++;
    const monitor = new MutationObserver(() => {
      let selector = selectors.join(', ');
      let elems = document.querySelectorAll(selector);
      for (const elem of elems) {
        const newClass = elem.getAttribute("class");
        if (options.skipAds && newClass && newClass.includes('adSkipButton') && newClass.includes('skippable')) {
          const adSkipButtons = document.getElementsByClassName('adSkipButton skippable');
          if(adSkipButtons.length > 0) {
            setTimeout(() => {
              adSkipButtons[0].click();
            }, 500);
          }
        }
        if (options.skipAds && newClass && newClass.includes('fu4rd6c') && !elem.classList.contains('done')) {
          setTimeout(() => {
            if (elem && !elem.classList.contains('done')) {
              elem.click();
              elem.classList.add('done');
            }
          }, 500);
        }
        if (options.skipAds && newClass && newClass.includes('fu4rd6c') && newClass.includes('f1cw2swo') && !newClass.includes('atvwebplayersdk-nexttitle-button') && !newClass.includes('preventNextClick')) {
          setTimeout(() => {
            if (!newClass.includes('atvwebplayersdk-nexttitle-button') && !newClass.includes('preventNextClick')) {
              elem.classList.add('preventNextClick');
              elem.click();
              elem.classList.add('done');
            }
          }, 500);
        }
      }
      if (options.skipAds && isAdPlaying()) {
        speedUpAdVideos();
      }
    });

    let reactEntry = document.querySelector('body');
    if (!selectors.length) {
      return;
    } else if (reactEntry) {
      if (!isMonitorActive) {
        monitor.observe(reactEntry, {
          attributes: true,
          attributeFilter: ['.atvwebplayersdk-adtimeindicator-text'],
          childList: true,
          subtree: true,
          attributeOldValue: false
        });
        isMonitorActive = true;
      }
    } else {
      if (numTries > MAX_TRIES_MONITOR_SKIP) { return }
      setTimeout(() => {
        startMonitoringForSelectors(selectors, numTries);
      }, 100 * numTries);
    }
  }

  function startHelper(options) {
    let selectors = [];
    if (options.skipAds) { enableSkipAds(selectors); }
    startMonitoringForSelectors(selectors, 0);
  }

  function isAdIndicatorVisible(el) {
    if (!el || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
    return el.textContent.trim().length > 0;
  }

  function isAdPlaying() {
    return AD_INDICATOR_SELECTORS.some(sel => isAdIndicatorVisible(document.querySelector(sel)));
  }

  function enableSkipAds(selectors) {
    AD_INDICATOR_SELECTORS.forEach(sel => selectors.push(sel));
    selectors.push('.adSkipButton');
    selectors.push('.fu4rd6c');
    selectors.push('.f1cw2swo');
    selectors.push('.skippable');
    selectors.push('.atvwebplayersdk-skipelement-button');
    selectors.push('.atvwebplayersdk-nextupcard-button');
  }

  function speedUpAdVideos() {
    let videos = document.querySelectorAll('video:not([class*="tst"])');
    videos.forEach(video => {
      if (video.dataset.skipperActive !== "true") {
        video.dataset.prevMuted = video.muted;
        video.dataset.prevRate = video.playbackRate === AD_FAST_FORWARD_RATE ? 1 : video.playbackRate;
        video.dataset.skipperActive = "true";
      }
      video.muted = true;
      if (video.playbackRate !== AD_FAST_FORWARD_RATE) {
        video.playbackRate = AD_FAST_FORWARD_RATE;
      }
    });
  }

  function restoreVideo(video) {
    video.muted = video.dataset.prevMuted === "true";
    video.playbackRate = parseFloat(video.dataset.prevRate) || 1;
    delete video.dataset.skipperActive;
    delete video.dataset.prevMuted;
    delete video.dataset.prevRate;
  }

  setInterval(() => {
    if (!options || !options.skipAds) return;

    if (isAdPlaying()) {
      // Re-assert speed: player often resets playbackRate between ads in a pod
      speedUpAdVideos();
      return;
    }

    let videos = document.querySelectorAll('video:not([class*="tst"])');
    videos.forEach(video => {
      if (video.dataset.skipperActive === "true") {
        restoreVideo(video);
      } else if (video.playbackRate === AD_FAST_FORWARD_RATE) {
        video.playbackRate = 1;
      }
    });
  }, 500);

  initContent();
})();
