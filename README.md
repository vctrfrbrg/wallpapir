# Wallpapir 🎨

Generate beautiful, high-resolution gradient wallpapers (4K) from the command line using Bun. Perfect for MacBook Pro and other high-DPI displays.

## Installation

### Homebrew (recommended)

```bash
brew tap vctrfrbrg/wallpapir
brew install wallpapir
```

### From source

```bash
# Clone or navigate to the project
cd wallpapir

# Install dependencies
bun install
```

## Quick Start

```bash
# Random wallpaper
wallpapir

# Radial gradient from darkgreen to black
wallpapir darkgreen black radial

# Linear gradient with custom parameters
wallpapir purple gold linear 0.3 0.7

# Conic gradient at center
wallpapir "#ff6b9d" cyan conic 0.5 0.5
```

## Syntax

```
wallpapir [color1] [color2] [type] [paramX] [paramY] [--output path]
```

### Parameters

| Parameter | Description | Default | Format |
|-----------|-------------|---------|--------|
| `color1` | Starting color | Random if omitted | Name (e.g., `black`, `gold`) or hex (e.g., `#ff6b9d`) |
| `color2` | Ending color | Random if omitted | Name or hex |
| `type` | Gradient style | `linear` | `linear`, `radial`, or `conic` |
| `paramX` | X-coordinate/direction | Random if omitted | 0.0–1.0 (normalized) |
| `paramY` | Y-coordinate/direction | Random if omitted | 0.0–1.0 (normalized) |
| `--output path` | Custom output file | Auto-generated from params | Relative or absolute path |

## Gradient Types

### Linear
Direction-based gradient (diagonal or angled).
- `paramX` and `paramY` determine the end point
- Examples:
  ```bash
  bun gradient.ts blue orange linear 1.0 1.0   # Diagonal
  bun gradient.ts red gold linear 0.5 0.5      # Gentle slope
  ```

### Radial
Center-point gradient that expands outward.
- `paramX` and `paramY` set the center position
- Examples:
  ```bash
  bun gradient.ts darkgreen black radial 0.85 0.32   # Off-center radial
  bun gradient.ts white navy radial 0.5 0.5          # Centered radial
  ```

### Conic
Angular/polar gradient that sweeps around a point.
- `paramX` and `paramY` set the center
- Examples:
  ```bash
  bun gradient.ts purple gold conic 0.5 0.5    # Center conic
  bun gradient.ts red cyan conic 0.7 0.3       # Off-center conic
  ```

## Output Files

Wallpapers are saved to `./wallpapers/` with auto-generated names based on your parameters.

### Default Naming
Format: `{color1}-{color2}-{type}-{paramX*100}-{paramY*100}.png`

Examples:
```
green-red-radial-85-32.png
purple-gold-linear-30-70.png
fef0e5-2a2a2a-linear-50-50.png
```

### Auto-Increment
If you run the same command twice, the second file gets `(1)` appended:
```
green-red-radial-85-32.png
green-red-radial-85-32 (1).png
green-red-radial-85-32 (2).png
```

## Color Support

### Named Colors
Supports standard CSS/web colors:
```bash
bun gradient.ts black white linear
bun gradient.ts red blue linear
bun gradient.ts darkgreen navy linear
bun gradient.ts purple gold linear
```

### Hex Colors
Full 6-digit or 3-digit hex codes:
```bash
bun gradient.ts "#ff6b9d" "#00ffff" radial 0.5 0.5
bun gradient.ts "#fef0e5" "#2a2a2a" linear 0.5 0.5
```

In `zsh`, wrap hex codes in quotes:
```bash
bun gradient.ts "#ff0000" "#0000ff" linear
```

## Examples

### Premium Beige-to-Charcoal (Subtle Linear)
```bash
bun gradient.ts "#fef0e5" "#2a2a2a" linear 0.5 0.5
```
Output: `fef0e5-2a2a2a-linear-50-50.png`

### Deep Space Radial (Dark Center)
```bash
bun gradient.ts navy black radial 0.5 0.5
```
Output: `navy-black-radial-50-50.png`

### Candy Conic (Angular Rainbow)
```bash
bun gradient.ts pink cyan conic 0.5 0.5
```
Output: `pink-cyan-conic-50-50.png`

### Diagonal Sunset
```bash
bun gradient.ts orange red linear 1.0 1.0
```
Output: `orange-red-linear-100-100.png`

### Random Everything
```bash
bun gradient.ts
```
(All parameters randomized—different each run)

## Custom Output

Use `--output` to specify a custom path:
```bash
bun gradient.ts purple gold linear 0.3 0.7 --output wallpapers/my-custom-bg.png
```

Run again and it auto-increments:
```bash
# Second run of same command
# Creates: wallpapers/my-custom-bg (1).png
```

## Technical Details

- **Resolution:** 3840×2160 (4K, 16:9 aspect ratio)
- **Format:** PNG
- **Color Space:** LCh (perceptually uniform interpolation)
- **Anti-Banding:** Subtle noise dithering to prevent color banding
- **Runtime:** ~1-2 seconds per wallpaper

## Directory Structure

```
wallpapir/
├── gradient.ts           # Main script
├── package.json          # Dependencies
├── .gitignore            # Excludes wallpapers and node_modules
├── README.md             # This file
└── wallpapers/           # Generated wallpapers (not in git)
    ├── green-red-radial-85-32.png
    ├── purple-gold-linear-30-70.png
    └── ...
```

## Tips & Tricks

1. **Quick Radial Pulse Origin:** Center variations create organic feels
   ```bash
   bun gradient.ts navy white radial 0.6 0.4
   bun gradient.ts navy white radial 0.4 0.6
   ```

2. **Diagonal Sweeps:** Use linear with extreme paramX/Y
   ```bash
   bun gradient.ts red blue linear 0.0 1.0   # Top-left to bottom-right
   bun gradient.ts red blue linear 1.0 0.0   # Top-right to bottom-left
   ```

3. **All Files:** Check `wallpapers/` to browse your collection
   ```bash
   ls -lh wallpapers/ | head -20
   ```

4. **Batch Generation:** Create multiple variations
   ```bash
   bun gradient.ts darkgreen black radial
   bun gradient.ts darkgreen black radial 0.85 0.32
   bun gradient.ts darkgreen gold radial 0.5 0.5
   ```

## Troubleshooting

**"Error: Invalid color"**
- Ensure color names are valid CSS colors or hex codes are properly quoted in zsh
  ```bash
  # ✅ Correct
  bun gradient.ts "#ff0000" black linear
  
  # ❌ Wrong (# triggers shell comment)
  bun gradient.ts #ff0000 black linear
  ```

**Wallpapers not appearing**
- Check `wallpapers/` directory: `ls -lh wallpapers/`
- Ensure `wallpapers/` exists; script creates it automatically

**Very slow generation**
- 4K rendering is compute-intensive (~1-2s per wallpaper)
- This is normal; Bun + Rust-backed canvas is optimized

## License

MIT

