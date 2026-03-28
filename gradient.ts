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
const GRADIENT_TYPES = ['linear', 'radial', 'conic'];

const PALETTES: Record<string, string[]> = {
  nord: ['#2E3440', '#3B4252', '#81A1C1', '#88C0D0', '#8FBCBB', '#A3BE8C', '#B48EAD', '#BF616A', '#D08770', '#EBCB8B'],
  dracula: ['#282A36', '#6272A4', '#8BE9FD', '#50FA7B', '#FFB86C', '#FF79C6', '#BD93F9', '#FF5555', '#F1FA8C'],
  catppuccin: ['#1E1E2E', '#89B4FA', '#CBA6F7', '#F38BA8', '#FAB387', '#F9E2AF', '#A6E3A1', '#94E2D5', '#89DCEB'],
};

/**
 * Sanitize color name for filename (remove #, truncate long hex strings)
 */
function sanitizeColorName(colorStr: string | undefined): string {
  if (!colorStr) return 'random';

  let sanitized = colorStr
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[^a-z0-9]/g, '');

  if (sanitized.length > 6) {
    sanitized = sanitized.substring(0, 6);
  }

  return sanitized;
}

/**
 * Generate filename based on gradient parameters
 */
function generateFilenameFromParams(color1: string, color2: string, type: string, paramX: number, paramY: number): string {
  const c1 = sanitizeColorName(color1);
  const c2 = sanitizeColorName(color2);
  const x = Math.round(paramX * 100);
  const y = Math.round(paramY * 100);
  return `${c1}-${c2}-${type}-${x}-${y}.png`;
}

/**
 * Pick two distinct colors at random from a named palette
 */
function pickFromPalette(paletteName: string): [string, string] {
  const colors = PALETTES[paletteName];
  if (!colors) {
    console.warn(`⚠️  Unknown palette "${paletteName}". Available: ${Object.keys(PALETTES).join(', ')}`);
    return [chroma.random().hex(), chroma.random().hex()];
  }
  const i = Math.floor(Math.random() * colors.length);
  let j = Math.floor(Math.random() * (colors.length - 1));
  if (j >= i) j++;
  return [colors[i], colors[j]];
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const argv = Bun.argv.slice(2);

  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(`
wallpapir — Generate beautiful 4K gradient wallpapers from the terminal

USAGE
  wallpapir [color1] [color2] [type] [x] [y] [--output path] [--palette name] [--multi-monitor]

ARGUMENTS
  color1           Start color — named (e.g. black) or hex (e.g. #ff0000). Defaults to random.
  color2           End color — same format. Defaults to random.
  type             Gradient type: linear, radial, conic. Defaults to linear.
  x, y             Direction/center as 0–1 fractions. Defaults to random.
  --output         Custom output path (e.g. --output ~/Desktop/wall.png)
  --palette        Use a curated palette: nord, dracula, catppuccin
  --multi-monitor  Generate one wallpaper per display (same palette, different styles)

EXAMPLES
  wallpapir
  wallpapir black white radial
  wallpapir "#ff6ec7" "#1a1a2e" linear 0.8 0.3
  wallpapir --palette nord
  wallpapir --palette dracula --multi-monitor

NOTES
  Wallpapers are saved to ~/wallpapers/ by default.
  After generating, you'll be asked if you want to set it as your desktop wallpaper.
  If multiple displays are connected, wallpapir will offer to generate one per display.
`);
    process.exit(0);
  }

  const paletteIdx = argv.indexOf('--palette');
  const palette = paletteIdx !== -1 ? argv[paletteIdx + 1] : undefined;
  const multiMonitor = argv.includes('--multi-monitor');

  // Filter out flags so positional args still work
  const positional = argv.filter((a, i) =>
    a !== '--multi-monitor' &&
    a !== '--palette' && argv[i - 1] !== '--palette' &&
    a !== '--output' && argv[i - 1] !== '--output'
  );

  const color1 = positional[0];
  const color2 = positional[1];
  const type = positional[2] || 'linear';
  const paramX = positional[3] ? parseFloat(positional[3]) : Math.random();
  const paramY = positional[4] ? parseFloat(positional[4]) : Math.random();

  let outputPath = OUTPUT_PATH;
  const outputIdx = argv.indexOf('--output');
  if (outputIdx !== -1 && argv[outputIdx + 1]) {
    outputPath = argv[outputIdx + 1];
  } else {
    const generatedName = generateFilenameFromParams(color1 ?? 'random', color2 ?? 'random', type, paramX, paramY);
    outputPath = path.join(path.dirname(OUTPUT_PATH), generatedName);
  }
  outputPath = path.resolve(outputPath);

  return { color1, color2, type, paramX, paramY, outputPath, palette, multiMonitor };
}

/**
 * Validate and normalize a color string
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
 */
function addNoise(ctx: any, width: number, height: number, intensity: number = 8) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Generate a unique filename by appending (N) if file exists
 */
function generateUniqueFilename(basePath: string): string {
  if (!fs.existsSync(basePath)) return basePath;
  const dir = path.dirname(basePath);
  const ext = path.extname(basePath);
  const basename = path.basename(basePath, ext);
  let counter = 1;
  let newPath: string;
  while (true) {
    newPath = path.join(dir, `${basename} (${counter})${ext}`);
    if (!fs.existsSync(newPath)) return newPath;
    counter++;
  }
}

/**
 * Render and save a single wallpaper, returning the final path
 */
async function renderWallpaper(c1: string, c2: string, type: string, paramX: number, paramY: number, outputPath: string): Promise<string> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  let gradient;
  if (type === 'radial') {
    const centerX = paramX * CANVAS_WIDTH;
    const centerY = paramY * CANVAS_HEIGHT;
    const radius = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  } else if (type === 'conic') {
    gradient = ctx.createConicGradient(0, paramX * CANVAS_WIDTH, paramY * CANVAS_HEIGHT);
  } else {
    gradient = ctx.createLinearGradient(0, 0, paramX * CANVAS_WIDTH, paramY * CANVAS_HEIGHT);
  }

  const scale = chroma.scale([c1, c2]).mode('lch');
  gradient.addColorStop(0, scale(0).hex());
  gradient.addColorStop(0.5, scale(0.5).hex());
  gradient.addColorStop(1, scale(1).hex());

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  addNoise(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

  const finalPath = generateUniqueFilename(outputPath);
  const buffer = await canvas.encode('png');
  await Bun.write(finalPath, buffer);

  return finalPath;
}

/**
 * Get the number of connected displays via osascript
 */
function getDisplayCount(): number {
  const proc = Bun.spawnSync(['osascript', '-e', 'tell application "System Events" to return count of desktops']);
  const n = parseInt(proc.stdout.toString().trim());
  return isNaN(n) ? 1 : n;
}

/**
 * Prompt the user and optionally set wallpapers on each display
 */
async function promptAndSet(paths: string[]) {
  const plural = paths.length > 1;
  const yes = await promptYN(`Should we set ${plural ? 'them' : 'it'}? (y/N) `);
  if (yes) {
    if (plural) {
      for (let i = 0; i < paths.length; i++) {
        Bun.spawnSync(['osascript', '-e',
          `tell application "System Events" to set picture of desktop ${i + 1} to "${paths[i]}"`
        ]);
      }
    } else {
      Bun.spawnSync(['osascript', '-e',
        `tell application "System Events" to tell every desktop to set picture to "${paths[0]}"`
      ]);
    }
    console.log(`🖥️  Wallpaper${plural ? 's' : ''} set!`);
  }
}

/**
 * Main
 */
async function promptYN(question: string): Promise<boolean> {
  process.stdout.write(question);
  for await (const line of console) {
    return line.trim().toLowerCase() === 'y';
  }
  return false;
}

async function generate() {
  const args = parseArgs();
  let { color1, color2, type, paramX, paramY, outputPath, palette } = args;
  let multiMonitor = args.multiMonitor;

  // Auto-detect multiple displays and offer multi-monitor mode
  if (!multiMonitor) {
    const count = getDisplayCount();
    if (count > 1) {
      multiMonitor = await promptYN(`${count} displays detected. Generate one wallpaper per display? (y/N) `);
      console.log();
    }
  }

  if (multiMonitor) {
    const count = getDisplayCount();
    const results: { type: string; c1: string; c2: string; finalPath: string }[] = [];

    for (let i = 0; i < count; i++) {
      const [c1, c2] = palette ? pickFromPalette(palette) : [validateColor(undefined), validateColor(undefined)];
      const gradientType = GRADIENT_TYPES[i % GRADIENT_TYPES.length];
      const px = Math.random();
      const py = Math.random();
      const filename = generateFilenameFromParams(c1, c2, gradientType, px, py);
      const wallpaperPath = path.resolve(path.join(path.dirname(OUTPUT_PATH), filename));
      const finalPath = await renderWallpaper(c1, c2, gradientType, px, py, wallpaperPath);
      results.push({ type: gradientType, c1, c2, finalPath });
    }

    console.log();
    for (let i = 0; i < results.length; i++) {
      const { type: t, c1, c2, finalPath } = results[i];
      console.log(`🖥️  Display ${i + 1} — ${t}`);
      console.log(`   🎨 ${c1} → ${c2}`);
      console.log(`   🔗 file://${finalPath}`);
    }
    console.log(`\n📐 Resolution: ${CANVAS_WIDTH}×${CANVAS_HEIGHT}\n`);

    await promptAndSet(results.map(r => r.finalPath));

  } else {
    const [c1, c2] = palette ? pickFromPalette(palette) : [validateColor(color1), validateColor(color2)];
    const finalPath = await renderWallpaper(c1, c2, type, paramX, paramY, outputPath);

    console.log(`\n✅ Generated: ${type} wallpaper`);
    console.log(`🎨 Colors: ${c1} → ${c2}`);
    console.log(`📍 Center: (${paramX.toFixed(3)}, ${paramY.toFixed(3)})`);
    console.log(`💾 Saved: ${finalPath}`);
    console.log(`📐 Resolution: ${CANVAS_WIDTH}×${CANVAS_HEIGHT}`);
    console.log(`🔗 file://${finalPath}\n`);

    await promptAndSet([finalPath]);
  }
}

// Run
generate().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
