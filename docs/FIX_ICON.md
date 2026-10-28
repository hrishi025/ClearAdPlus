# Fix Toolbar Icon - Quick Guide

## Problem
The toolbar icon is showing a generic puzzle piece instead of your logo.

## Solution
Chrome requires properly sized PNG files for each icon size (16x16, 48x48, 128x128).

## Quick Fix (2 minutes)

### Option 1: Use the HTML Tool (Easiest)
1. Double-click this file: `resize-logo.html`
2. Upload your logo image
3. Click "Download 16x16", "Download 48x48", "Download 128x128"
4. Copy the downloaded files to the `icons` folder
5. Rename them to: `icon16.png`, `icon48.png`, `icon128.png`
6. Reload the extension in Chrome

### Option 2: Use Online Tool
1. Go to: https://www.iloveimg.com/resize-image/
2. Upload your logo (from `icons/logo.png`)
3. Resize to 16x16 → download → rename to `icon16.png`
4. Resize to 48x48 → download → rename to `icon48.png`
5. Resize to 128x128 → download → rename to `icon128.png`
6. Place all three in the `icons` folder
7. Reload the extension in Chrome

### Option 3: Use Paint (Windows)
1. Open Paint
2. Open your logo image
3. Resize to 16x16 pixels → Save as `icon16.png`
4. Resize to 48x48 pixels → Save as `icon48.png`
5. Resize to 128x128 pixels → Save as `icon128.png`
6. Place all three in the `icons` folder
7. Reload the extension in Chrome

## Files to Replace
Replace these files in the `icons` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## After Replacing Icons
1. Go to `chrome://extensions/`
2. Find "Clear Ad Plus"
3. Click the reload icon
4. Your logo should now appear in the toolbar

## Why This Happens
Chrome's extension system requires specific icon sizes for different contexts:
- 16x16: Toolbar icon
- 48x48: Extensions page
- 128x128: Chrome Web Store and management page

Using the same image for all sizes (or using the wrong size) causes Chrome to display the generic puzzle piece icon instead.
