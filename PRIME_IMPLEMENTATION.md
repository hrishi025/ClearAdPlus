# Amazon Prime Video Ad Blocking Implementation

## Overview
Implemented Amazon Prime Video ad skipping algorithm based on reverse-engineering of primeadskipper.crx extension.

## Features Implemented

### 1. Ad Detection Algorithm
**File**: `src/content/prime-skipper.js`

**Key Mechanisms**:
- **Ad Indicator Detection**: Monitors specific CSS selectors that indicate ads are playing
- **Auto-Click Skip Buttons**: Automatically clicks skip ad buttons when they become available
- **8x Speed Fast-Forward**: Speeds up ads to 8x playback rate
- **Auto-Mute**: Mutes ad audio during playback
- **Smart Speed Restoration**: Restores user's preferred speed when main content resumes
- **MutationObserver**: Monitors DOM changes for ad indicators

### 2. Ad Indicator Selectors
The extension monitors these CSS selectors to detect ads:
- `.atv-player-ad-time-remaining`
- `.atvwebplayersdk-ad-timer-remaining-time`
- `.atvwebplayersdk-ad-timer-text`
- `.atvwebplayersdk-adtimeindicator-text`
- `.atvwebplayersdk-ad-resume-message`
- `.adSkipButton`
- `.fu4rd6c`
- `.f1cw2swo`
- `.skippable`
- `.atvwebplayersdk-skipelement-button`
- `.atvwebplayersdk-nextupcard-button`

### 3. Skip Button Auto-Clicking
- Detects when skip buttons become skippable
- Clicks buttons after 500ms delay
- Handles multiple button types (adSkipButton, fu4rd6c, f1cw2swo)
- Prevents duplicate clicks with class tracking

### 4. Video Speed Control
**During Ads**:
- Mutes audio
- Sets playback rate to 8x
- Stores previous mute state and speed

**When Ads End**:
- Restores previous mute state
- Restores previous playback speed
- Reverts to normal playback

### 5. Monitoring System
- **MutationObserver**: Watches DOM for ad indicator changes
- **Polling**: 500ms interval to re-assert speed and restore normal playback
- **Max Retries**: 10 attempts to start monitoring
- **Attributes Monitored**: `.atvwebplayersdk-adtimeindicator-text`

### 6. Enable/Disable Toggle
**Default**: Enabled

Added toggle in popup UI:
- **Label**: "Prime Video ad skipping"
- **Description**: "Auto-skip ads on Amazon Prime Video"
- **Storage Key**: `primeAdBlockEnabled`
- **Default Value**: `true`

### 7. Supported Domains
- primevideo.com
- amazon.com
- amazon.co.uk
- amazon.de
- amazon.co.jp

## Files Modified/Created

### Created
1. **src/content/prime-skipper.js**
   - Main ad skipping logic
   - Video speed and mute handling
   - Skip button auto-clicking
   - MutationObserver for ad detection

### Modified
1. **manifest.json**
   - Added content script for Prime Video domains
   - Added prime-skipper.js

2. **src/popup/popup.html**
   - Added toggle control for Prime Video ad skipping

3. **src/popup/popup.js**
   - Added event listener for Prime Video skipper toggle
   - Added storage sync for Prime Video settings

## Technical Details

### Detection Logic
```javascript
function isAdPlaying() {
  return AD_INDICATOR_SELECTORS.some(sel => 
    isAdIndicatorVisible(document.querySelector(sel))
  );
}
```

### Speed Control
```javascript
function speedUpAdVideos() {
  videos.forEach(video => {
    video.dataset.prevMuted = video.muted;
    video.dataset.prevRate = video.playbackRate;
    video.muted = true;
    video.playbackRate = AD_FAST_FORWARD_RATE; // 8x
  });
}
```

### Skip Button Clicking
```javascript
if (newClass.includes('adSkipButton') && newClass.includes('skippable')) {
  setTimeout(() => {
    adSkipButtons[0].click();
  }, 500);
}
```

## Performance Considerations

- **Polling Interval**: 500ms (same as original)
- **MutationObserver**: Monitors body subtree with specific attribute filter
- **Minimal Overhead**: Only runs on Prime Video domains
- **Efficient Detection**: Uses CSS selectors for ad indicators
- **Safe Storage**: Graceful error handling for storage operations

## Testing

### Manual Testing Steps
1. Load extension in Chrome
2. Navigate to primevideo.com
3. Play a video with ads
4. Verify:
   - Ads are muted
   - Ads play at 8x speed
   - Skip buttons are clicked automatically
   - Main content plays at normal speed
   - Audio is unmuted for main content

### Toggle Testing
1. Open extension popup
2. Toggle "Prime Video ad skipping" off
3. Refresh Prime Video page
4. Verify ads play normally
5. Toggle back on
6. Verify ad skipping resumes

## Comparison with Original

### Similarities
- ✅ Same ad indicator selectors
- ✅ Same 8x speed for ads
- ✅ Same auto-mute behavior
- ✅ Same skip button detection logic
- ✅ Same MutationObserver approach
- ✅ Same polling interval (500ms)
- ✅ Same storage keys pattern

### Enhancements
- ✅ Integrated into existing Clear Ad Plus extension
- ✅ Added enable/disable toggle
- ✅ Consistent UI with rest of extension
- ✅ Shared infrastructure with Hotstar skipper

## Limitations

- **Selector-Based Detection**: Relies on specific CSS selectors (may break if Amazon changes UI)
- **Platform-Specific**: Only works on Amazon Prime Video
- **Polling**: Uses setInterval for monitoring (500ms)
- **Skip Button Dependency**: Requires visible skip buttons for some ads

## Future Improvements

1. **Add Statistics Display**: Show Prime Video ad skip count in popup
2. **Smart Detection**: Improve ad detection beyond CSS selectors
3. **Custom Speed**: Allow user to configure ad playback speed
4. **More Platforms**: Extend to other streaming services
5. **Better Performance**: Optimize MutationObserver usage

## Credits

Algorithm based on primeadskipper.crx extension
