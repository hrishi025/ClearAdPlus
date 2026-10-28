# Clear Ad Plus - Rebranding Summary

## Changes Made

### 1. Extension Name Change
- **Old Name**: ClearBlock
- **New Name**: Clear Ad Plus
- **Rationale**: More descriptive name similar to Adblock Plus

### 2. Logo Design
- **Color**: Red background (#ef4444) - same as Adblock Plus
- **Text**: "CAP" (Clear Ad Plus) in white
- **Style**: Rounded corners, modern design
- **Format**: SVG (scalable, supported by Chrome natively)

### 3. Color Theme Update
- **Primary Gradient**: Changed from purple/blue to red (#ef4444 to #dc2626)
- **Background**: Changed to light red tint (#fef2f2)
- **Border Color**: Changed to light red (#fecaca)
- **Rationale**: Matches the red branding of Adblock Plus

### 4. Storage Keys
- **Old**: `clearblock.settings`, `clearblock.activeFilterText`
- **New**: `clearadplus.settings`, `clearadplus.activeFilterText`
- **Note**: This will reset user settings on first load after rebranding

### 5. Badge Color
- **Badge Background**: Red (#ef4444)
- **Badge Text**: White
- **Rationale**: Consistent with red branding

## Files Modified

1. **manifest.json**
   - Changed name to "Clear Ad Plus"
   - Updated description
   - Updated action title
   - Changed storage keys (will reset settings)

2. **src/popup/popup.html**
   - Changed header text to "Clear Ad Plus"

3. **src/popup/popup.css**
   - Updated color variables to red theme
   - Changed background to light red tint
   - Updated border colors

4. **src/background/storage.js**
   - Changed storage keys from `clearblock.*` to `clearadplus.*`
   - Updated seed filter text comment

5. **icons/icon.svg**
   - Created new red logo with "CAP" text
   - Rounded corners, white text on red background

## Icon Details

The icon features:
- **Background**: Red (#ef4444)
- **Text**: "CAP" in white, bold Arial font
- **Size**: Scalable SVG (used for 16, 48, 128 sizes)
- **Style**: Modern, rounded corners, matches Adblock Plus aesthetic

## Badge Behavior

The extension now shows a red badge on the toolbar icon with the number of blocked items on the current page:
- **Badge Text**: Number of blocked items (e.g., "5")
- **Badge Color**: Red (#ef4444)
- **Badge Text Color**: White
- **Behavior**: Updates when cosmetic rules are applied or page count changes

## Refresh Functionality

Added a "Refresh this page" section with:
- **Visual Design**: Light purple gradient background
- **Button**: Secondary button with refresh icon
- **Functionality**: Reloads the current tab when clicked
- **Auto-hide**: Hidden on non-HTTP pages (chrome://, etc.)

## Loading Instructions

Since the storage keys have changed, existing settings will be reset on first load:

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Remove the old "ClearBlock" extension
4. Click "Load unpacked"
5. Select the `clearblock` folder
6. Extension loads as "Clear Ad Plus" with new branding

## Testing Checklist

- [ ] Extension loads as "Clear Ad Plus"
- [ ] Logo shows red background with "CAP" text
- [ ] Popup shows red theme
- [ ] Badge appears on toolbar icon when items are blocked
- [ ] Badge color is red with white text
- [ ] Refresh button works and reloads page
- [ ] Statistics still function correctly
- [ ] Allowlist functionality works
- [ ] Filter updates work

## Known Issues

- **Settings Reset**: Due to storage key changes, user settings will be reset on first load
- **Icon Format**: Using SVG instead of PNG (Chrome supports this natively)

## Future Enhancements

### Optional: PNG Icons
If PNG icons are needed for better compatibility:
1. Open `generate-icons.html` in a browser
2. Icons will be automatically generated and downloaded
3. Update manifest.json to use PNG icons instead of SVG

### Alternative Icon Generator
If Python PIL is available:
```bash
pip install Pillow
python generate-icons.py
```

## Summary

The extension has been successfully rebranded to "Clear Ad Plus" with:
- ✅ Red logo with "CAP" text (matching ABP style)
- ✅ Red color theme throughout
- ✅ Badge showing blocked count on toolbar icon
- ✅ Refresh button in popup
- ✅ Updated storage keys (settings will reset)
- ✅ Modern, professional appearance

The extension now has a visual identity similar to Adblock Plus while maintaining its independent implementation.
