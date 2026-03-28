// A collection of scripts to efficiently generate a MacBook Pro wallpaper with gradients
// Linear, radial, multi-color, with advanced color interpolation via Chroma.js
// Bun-native implementation using @napi-rs/canvas for speed and zero build headaches

import { createCanvas } from '@napi-rs/canvas';
import chroma from 'chroma-js';
import * as fs from 'fs';
import * as path from 'path';

const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;
const OUTPUT_PATH = './wallpapers/wallpaper.png';

/**
 * Parse CLI arguments: bun gradient.ts [color1] [color2] [type] [paramX] [paramY] [--output path]
 * Example: bun gradient.ts "#feefe" black radial 0.85 0.53
 *          bun gradient.ts darkgreen black radial
 */
function parseArgs() {
  const argv = Bun.argv.slice(2); // Remove 'bun' and script name
  
  let color1 = argv[0];
  let color2 = argv[1];
  let type = argv[2] || 'linear';
  let paramX = argv[3] ? parseFloat(argv[3]) : Math.random();
  let paramY = argv[4] ? parseFloat(argv[4]) : Math.random();
  let outputPath = OUTPUT_PATH;

  // Handle --output flag if present
  const outputIdx = argv.indexOf('--output');
  if (outputIdx !== -1 && argv[outputIdx + 1]) {
    outputPath = argv[outputIdx + 1];
  }

  // Resolve to absolute path
  outputPath = path.resolve(outputPath);

  return { color1, color2, type, paramX, paramY, outputPath };
}

/**
 * Validate and normalize a color string
 * Supports named colors (black, red, etc), hex (#fff, #ffffff), or random
 */
function validateColor(colorStr: string | undefined): string {
  if (!colorStr) return chroma.random().hex();
  
  try {
    return chroma(colorStr).hex();
  } catch (e) {
    console.warn(`⚠️  Invalid color "${colorStr}", using random color`);
    return chroma.random().hex();
  }
}

/**
 * Add subtle noise to prevent banding in gradients
 * (Makes the wallpaper look more "premium" and less posterized)
 */
function addNoise(ctx: any, width: number, height: number, intensity: number = 8) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    // data[i + 3] is alpha, leave unchanged
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Generate a unique filename by appending (N) if file exists
 * e.g., wallpaper.png → wallpaper (1).png → wallpaper (2).png
 */
function generateUniqueFilename(basePath: string): string {
  // Check if the base file exists
  if (!fs.existsSync(basePath)) {
    return basePath;
  }

  // Parse filename and extension using path module
  const dir = path.dirname(basePath);
  const ext = path.extname(basePath);
  const basename = path.basename(basePath, ext);

  // Find the next available number
  let counter = 1;
  let newPath: string;
  while (true) {
    newPath = path.join(dir, `${basename} (${counter})${ext}`);
    if (!fs.existsSync(newPath)) {
      return newPath;
    }
    counter++;
  }
}

/**
 * Main function: Generate wallpaper with gradient
 */
async function generate() {
  const { color1, color2, type, paramX, paramY, outputPath } = parseArgs();

  // Validate colors
  const c1 = validateColor(color1);
  const c2 = validateColor(color2);

  // Ensure wallpapers directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create canvas
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Create gradient with Canvas API
  let gradient;

  if (type === 'radial') {
    const centerX = paramX * CANVAS_WIDTH;
    const centerY = paramY * CANVAS_HEIGHT;
    const radius = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
  } else if (type === 'conic') {
    const centerX = paramX * CANVAS_WIDTH;
    const centerY = paramY * CANVAS_HEIGHT;
    gradient = ctx.createConicGradient(0, centerX, centerY);
  } else {
    // Default: linear gradient using paramX, paramY as direction
    gradient = ctx.createLinearGradient(0, 0, paramX * CANVAS_WIDTH, paramY * CANVAS_HEIGHT);
  }

  // Pro-level color interpolation using Chroma.js in LCh mode
  // This prevents muddy middle colors that RGB interpolation causes
  const scale = chroma.scale([c1, c2]).mode('lch');

  gradient.addColorStop(0, scale(0).hex());
  gradient.addColorStop(0.5, scale(0.5).hex()); // Midpoint for smoothness
  gradient.addColorStop(1, scale(1).hex());

  // Fill the canvas
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Add noise to prevent banding (dithering effect)
  addNoise(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Generate unique filename (auto-increment if exists)
  const finalPath = generateUniqueFilename(outputPath);

  // Save to PNG using Bun's ultra-fast I/O
  const buffer = await canvas.encode('png');
  await Bun.write(finalPath, buffer);

  // Print results
  console.log(`\n✅ Generated: ${type} wallpaper`);
  console.log(`🎨 Colors: ${c1} → ${c2}`);
  console.log(`📍 Center: (${paramX.toFixed(3)}, ${paramY.toFixed(3)})`);
  console.log(`💾 Saved: ${finalPath}`);
  console.log(`📐 Resolution: ${CANVAS_WIDTH}×${CANVAS_HEIGHT}\n`);
}

// Run
generate().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});