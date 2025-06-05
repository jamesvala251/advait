const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '../public/icons/logo.jpeg.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons in different sizes
async function generateIcons() {
  try {
    // Generate 192x192 icon
    await sharp(sourceIcon)
      .resize(192, 192)
      .toFile(path.join(outputDir, 'icon-192x192.png'));

    // Generate 512x512 icon
    await sharp(sourceIcon)
      .resize(512, 512)
      .toFile(path.join(outputDir, 'icon-512x512.png'));

    console.log('PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 