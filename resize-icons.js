const fs = require('fs');
const path = require('path');

// Read the logo file
const logoPath = path.join(__dirname, 'icons', 'logo.png');
const outputPath = path.join(__dirname, 'icons');

// Check if logo exists
if (!fs.existsSync(logoPath)) {
  console.error('Logo file not found:', logoPath);
  console.log('Please place your logo as logo.png in the icons folder');
  process.exit(1);
}

// Since we can't use image processing libraries without dependencies,
// we'll create a simple HTML-based solution that works in the browser
console.log('To resize your logo, please use the resize-logo.html file:');
console.log(path.join(__dirname, 'resize-logo.html'));
console.log('');
console.log('Instructions:');
console.log('1. Open resize-logo.html in your browser');
console.log('2. Upload your logo image');
console.log('3. Download the resized versions (16x16, 48x48, 128x128)');
console.log('4. Replace icon16.png, icon48.png, icon128.png in the icons folder');
console.log('5. Reload the extension in Chrome');
