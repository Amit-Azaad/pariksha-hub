const fs = require('fs');
const path = require('path');

// Create simple SVG images that can be used as placeholders
const createSVG = (color1, color2, text, filename) => {
  const svg = `
<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="400" fill="url(#grad)"/>
  <text x="600" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${text}</text>
</svg>`;

  const filePath = path.join(__dirname, 'public', 'images', 'hero_images', filename);
  fs.writeFileSync(filePath, svg);
  console.log(`Created ${filename}`);
};

// Create hero images
const heroData = [
  { color1: '#3B82F6', color2: '#1E40AF', text: 'Welcome to Pariksha Hub!', filename: 'hero_1.svg' },
  { color1: '#10B981', color2: '#047857', text: 'Join our comprehensive test series', filename: 'hero_2.svg' },
  { color1: '#F59E0B', color2: '#D97706', text: 'Get expert notes and shortcuts', filename: 'hero_3.svg' },
  { color1: '#EF4444', color2: '#DC2626', text: 'Practice with thousands of questions', filename: 'hero_4.svg' },
  { color1: '#8B5CF6', color2: '#7C3AED', text: 'Track your progress with analytics', filename: 'hero_5.svg' }
];

heroData.forEach(data => {
  createSVG(data.color1, data.color2, data.text, data.filename);
});

console.log('All hero images created successfully!');
