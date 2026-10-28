# ClearBlock Extension - Loading Instructions

## Quick Start

### Step 1: Locate the Extension
The enhanced ClearBlock extension is located at:
```
C:\Users\user\Documents\Codex\2026-10-27\reverse-engineer-the-adblock-plus-chrome\outputs\clearblock
```

### Step 2: Load in Chrome (Windows)

1. **Open Google Chrome**
2. **Navigate to Extensions**
   - Type `chrome://extensions/` in the address bar
   - OR: Click the three-dot menu → More tools → Extensions

3. **Enable Developer Mode**
   - Look for "Developer mode" toggle in the top-right corner
   - Click it to enable (toggle turns blue when on)

4. **Load Unpacked Extension**
   - Click the "Load unpacked" button (top-left)
   - A file picker dialog will appear
   - Navigate to: `C:\Users\user\Documents\Codex\2026-10-27\reverse-engineer-the-adblock-plus-chrome\outputs\clearblock`
   - Select the `clearblock` folder
   - Click "Select Folder"

5. **Verify Installation**
   - ClearBlock should appear in your extensions list
   - The extension name: "ClearBlock"
   - Version: "0.1.0"
   - Status should show "Enabled"

### Step 3: Test the Extension

1. **Open the Popup**
   - Click the ClearBlock icon in the Chrome toolbar
   - You should see the new modern UI with:
     - Gradient logo with "CB" icon
     - Statistics card showing "Blocked on this page" and "Total blocked"
     - Global blocking toggle
     - This website toggle
     - Rule status section
     - Update filters button

2. **Test Functionality**
   - **Global Toggle**: Turn off global blocking, then turn it back on
   - **Allowlist**: Visit a website (e.g., example.com), click the allowlist toggle
   - **Statistics**: Navigate to different pages and observe counters
   - **Update**: Click "Update filters now" to test the update mechanism

3. **Test Cosmetic Filtering**
   - Visit a website with ads (e.g., a news site)
   - The page should load without visible ads
   - The "Blocked on this page" counter should increment

## File Structure

```
clearblock/
├── manifest.json              # Extension manifest
├── package.json              # NPM configuration
├── README.md                 # Project documentation
├── TESTING.md                # Testing instructions
├── UI_ENHANCEMENTS.md        # UI enhancement details
├── src/
│   ├── background/
│   │   ├── dnr.js           # DNR rule compilation
│   │   ├── service-worker.js # Background service worker
│   │   └── storage.js       # Storage management
│   ├── content/
│   │   ├── cosmetic.js      # Cosmetic filtering
│   │   ├── tracker.js       # Statistics tracking (NEW)
│   │   └── youtube-skipper.js # YouTube ad skipping
│   ├── popup/
│   │   ├── popup.html       # Popup UI (ENHANCED)
│   │   ├── popup.css        # Popup styles (ENHANCED)
│   │   └── popup.js         # Popup logic (ENHANCED)
│   └── shared/
│       └── filter-parser.js # ABP filter parser
├── rules/
│   └── clearblock-core.json # Core DNR rules
├── test/
│   └── filter-parser.test.js # Filter parser tests
└── tools/
    └── compile-rules.js      # Rule compilation tool
```

## New Features in Enhanced UI

### 1. Modern Design
- Purple-to-blue gradient theme
- Professional icons (SVG)
- Rounded corners and shadows
- Improved typography

### 2. Statistics Display
- **Page Counter**: Shows blocked items on current page
- **Total Counter**: Cumulative blocked count
- **Animated Numbers**: Smooth transitions when counts update

### 3. Visual Feedback
- **Health Indicator**: Color-coded status dot (green/warning/red)
- **Loading States**: Spinner animation during updates
- **Hover Effects**: Interactive feedback on buttons and toggles

### 4. Improved Controls
- **Toggle Switches**: Modern toggle design with smooth animations
- **Collapsible Settings**: Clean UI with expandable sections
- **Better Spacing**: Improved layout and whitespace

## Configuration

### Default Settings
- **Global Blocking**: Enabled
- **Subscription URL**: EasyList (https://easylist.to/easylist/easylist.txt)
- **Allowlisted Domains**: Empty (no sites allowlisted)
- **Statistics**: Start at 0

### Customizing Subscription
1. Open the ClearBlock popup
2. Click "Subscription settings" to expand
3. Enter a custom subscription URL (must be HTTPS)
4. Click "Update list"

### Changing Theme Colors
Edit `src/popup/popup.css` and modify the CSS custom properties:
```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}
```

## Troubleshooting

### Extension Won't Load
**Error**: "Manifest file is missing or unreadable"
- **Solution**: Ensure you selected the `clearblock` folder, not a subfolder

**Error**: "Invalid manifest"
- **Solution**: Check that manifest.json is valid JSON
- **Solution**: Verify Chrome version is 127+ (minimum required)

### Statistics Not Updating
**Issue**: Counters show 0 or don't increment
- **Solution**: Refresh the page after loading the extension
- **Solution**: Check that content scripts are running (check console for errors)
- **Solution**: Ensure global blocking is enabled

### UI Looks Broken
**Issue**: Styles not loading correctly
- **Solution**: Clear Chrome cache and reload extension
- **Solution**: Check browser console for CSS errors
- **Solution**: Verify popup.css file exists in the correct location

### Filters Not Updating
**Issue**: Update button fails
- **Solution**: Check internet connection
- **Solution**: Verify subscription URL is valid and accessible
- **Solution**: Check browser console for error messages

## Development Notes

### Building from Source
If you want to modify the code:

1. **Install Dependencies**
   ```bash
   cd clearblock
   npm install
   ```

2. **Compile Rules**
   ```bash
   npm run compile-rules
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click the reload icon (circular arrow) on ClearBlock
   - Changes will take effect immediately

### Modifying the UI
- **HTML**: Edit `src/popup/popup.html`
- **CSS**: Edit `src/popup/popup.css`
- **JavaScript**: Edit `src/popup/popup.js`
- After changes, reload the extension in Chrome

## Browser Compatibility

### Supported Browsers
- **Chrome**: 127+ (Manifest V3 required)
- **Edge**: 127+ (Chromium-based)
- **Opera**: 113+ (Chromium-based)
- **Brave**: 127+ (Chromium-based)

### Unsupported Browsers
- **Firefox**: Uses different extension format (WebExtensions with different APIs)
- **Safari**: Uses different extension format

## Performance Considerations

### Memory Usage
- **Base extension**: ~2-5MB
- **With EasyList**: ~10-15MB (cached filter rules)
- **Popup UI**: Minimal overhead (~100KB)

### CPU Usage
- **Idle**: Negligible
- **Filter updates**: Brief spike during download/compilation
- **Page load**: Minimal impact from content scripts

### Storage Usage
- **Settings**: ~1KB
- **Filter text**: ~10MB max (configurable)
- **Statistics**: ~100 bytes

## Security Notes

### Permissions Used
- `alarms`: For scheduled filter updates
- `declarativeNetRequest`: For network request blocking
- `storage`: For settings and filter storage
- `tabs`: For determining current tab/domain
- `<all_urls>`: Required for content script injection

### Privacy
- **No telemetry**: Extension does not send usage data
- **Local storage**: All data stored locally in Chrome
- **Subscription downloads**: Filter lists downloaded from configured URL only

## Uninstalling

To remove ClearBlock:
1. Go to `chrome://extensions/`
2. Find ClearBlock in the list
3. Click "Remove"
4. Confirm removal

**Note**: This will also delete all settings and statistics.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console for error messages
3. Check the TESTING.md file for test procedures
4. Review the UI_ENHANCEMENTS.md for implementation details

## Version History

### v0.1.0 (Current)
- Initial release with enhanced UI
- Network request blocking via DNR
- Cosmetic filtering
- Allowlist functionality
- Statistics tracking
- Modern gradient-based UI
- Animated counters
- Health indicator
