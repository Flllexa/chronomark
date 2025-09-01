const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(0, 0, size, size);
    
    // Bookmark lines
    ctx.fillStyle = 'white';
    const lineHeight = Math.max(1, size * 0.125);
    const lineSpacing = size * 0.25;
    const startY = size * 0.25;
    
    // Line 1
    ctx.fillRect(size * 0.25, startY, size * 0.5, lineHeight);
    // Line 2
    ctx.fillRect(size * 0.25, startY + lineSpacing, size * 0.375, lineHeight);
    // Line 3
    ctx.fillRect(size * 0.25, startY + lineSpacing * 2, size * 0.5, lineHeight);
    
    return canvas.toBuffer('image/png');
}

// Create icons
[16, 48, 128].forEach(size => {
    const buffer = createIcon(size);
    fs.writeFileSync(`icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
});
