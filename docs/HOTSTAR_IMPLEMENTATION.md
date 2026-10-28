# JioHotstar Ad Blocking Implementation

## Overview
Implemented JioHotstar/JioCinema ad blocking algorithm based on reverse-engineering of [kushwantheswar/jiohotstar-ad-blocker](https://github.com/kushwantheswar/jiohotstar-ad-blocker).

## Features Implemented

### 1. Network-Level Ad Blocking (DNR Rules)
Added three new DNR rules to block JioHotstar ad servers:
- `||pubads.g.doubleclick.net` - Google DoubleClick ads
- `||imasdk.googleapis.com` - Google IMA SDK for video ads
- `||ads.hotstar.com` - Hotstar's own ad servers

These rules block script, xmlhttprequest, and media requests from these domains.

### 2. Video Ad Skipping Algorithm
**File**: `src/content/hotstar-skipper.js`

**Key Mechanisms**:
- **Auto-click Skip Buttons**: Automatically clicks any visible skip ad buttons
- **16x Speed Fast-Forward**: Speeds up ads to 16x playback rate
- **Auto-Mute**: Mutes ad audio during playback
- **Smart Speed Restoration**: Restores user's preferred speed (1.0x default) when main content starts
- **Seek to End**: Automatically seeks to the end of ad videos

**Detection Logic**:
- **Main Content**: Videos with duration > 60 seconds or live streams
- **Ad Content**: Videos with duration ≤ 60 seconds

**Behavior**:
1. Detects user's preferred playback speed during normal content
2. When ad detected (≤60s):
   - Mutes audio
   - Sets playback rate to 16x
   - Seeks to end of video
3. When main content resumes:
   - Restores user's preferred speed
   - Unmutes audio

### 3. Cosmetic Ad Hiding
**File**: `src/content/hotstar-styles.css`

Hides banner ads and sponsor overlays using CSS:
- `[class*="ad-container"]`
- `[class*="ad-timer"]`
- `[class*="ad-badge"]`
- `[class*="AdOverlay"]`
- `.video-ad-overlay`
- `.player-ad-ui`
- `[class*="banner-ad"]`

### 4. Enable/Disable Toggle
**Default**: Enabled

Added toggle in popup UI:
- **Label**: "JioHotstar ad skipping"
- **Description**: "Auto-skip ads on Hotstar/JioCinema"
- **Storage Key**: `hotstarAdBlockEnabled`
- **Default Value**: `true`

### 5. Statistics Tracking
Tracks skipped ads count:
- **Storage Key**: `hotstarAdsSkipped`
- **Incremented When**:
  - Skip button is clicked
  - Ad video is fast-forwarded to end

## Files Modified/Created

### Modified
1. **manifest.json**
   - Added content script for hotstar.com, jiocinema.com, jiohotstar.com
   - Added hotstar-skipper.js and hotstar-styles.css

2. **rules/clearblock-core.json**
   - Added 3 new DNR rules for JioHotstar ad servers

3. **src/popup/popup.html**
   - Added toggle control for JioHotstar ad skipping

4. **src/popup/popup.js**
   - Added event listener for Hotstar skipper toggle
   - Added storage sync for Hotstar settings

### Created
1. **src/content/hotstar-skipper.js**
   - Main ad skipping logic
   - Video speed and mute handling
   - Skip button auto-clicking
   - Banner hiding

2. **src/content/hotstar-styles.css**
   - CSS rules for hiding ad elements

## Performance Considerations

- **Polling Interval**: 150ms (same as original)
- **Minimal Overhead**: Only runs on Hotstar/JioCinema domains
- **Efficient Detection**: Uses video duration to distinguish ads from content
- **Safe Storage**: Graceful error handling for storage operations

## Testing

### Manual Testing Steps
1. Load extension in Chrome
2. Navigate to hotstar.com or jiocinema.com
3. Play a video with ads
4. Verify:
   - Ads are muted
   - Ads play at 16x speed
   - Ads are skipped to end
   - Main content plays at normal speed
   - Audio is unmuted for main content
   - Banner ads are hidden

### Toggle Testing
1. Open extension popup
2. Toggle "JioHotstar ad skipping" off
3. Refresh Hotstar page
4. Verify ads play normally
5. Toggle back on
6. Verify ad skipping resumes

## Limitations

- **Duration-Based Detection**: Relies on video duration (≤60s = ad)
- **Platform-Specific**: Only works on Hotstar/JioCinema
- **Polling**: Uses setInterval for monitoring (150ms)
- **Skip Button Dependency**: Requires visible skip buttons for some ads

## Comparison with Original

### Similarities
- ✅ Same video duration detection logic
- ✅ Same 16x speed for ads
- ✅ Same auto-mute behavior
- ✅ Same CSS hiding rules
- ✅ Same polling interval (150ms)
- ✅ Same storage keys pattern

### Enhancements
- ✅ Integrated into existing Clear Ad Plus extension
- ✅ Added enable/disable toggle
- ✅ Uses shared DNR infrastructure
- ✅ Consistent UI with rest of extension

## Future Improvements

1. **Add Statistics Display**: Show Hotstar ad skip count in popup
2. **Smart Detection**: Improve ad detection beyond duration
3. **Custom Speed**: Allow user to configure ad playback speed
4. **More Platforms**: Extend to other streaming services
5. **Better Performance**: Use MutationObserver instead of polling

## Credits

Algorithm based on [kushwantheswar/jiohotstar-ad-blocker](https://github.com/kushwantheswar/jiohotstar-ad-blocker)
MIT License
