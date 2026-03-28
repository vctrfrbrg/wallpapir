# Wallpapir 🎨

Generate beautiful 4K gradient wallpapers from the terminal. Supports curated palettes, multiple gradient styles, and multi-monitor setups.

## Installation

### Homebrew (recommended)

```bash
brew tap vctrfrbrg/wallpapir
brew install wallpapir
```

### From source

```bash
git clone https://github.com/vctrfrbrg/wallpapir.git
cd wallpapir
bun install
```

## Quick Start

```bash
# Fully random wallpaper
wallpapir

# Use a curated palette
wallpapir --palette nord

# Specific colors and gradient type
wallpapir black white radial

# Multi-monitor: one wallpaper per display, same palette, different styles
wallpapir --palette dracula --multi-monitor
```

After generating, wallpapir will ask if you want to set the wallpaper. If multiple displays are connected, it will offer multi-monitor mode automatically.

## Syntax

```
wallpapir [color1] [color2] [type] [x] [y] [--output path] [--palette name] [--multi-monitor]
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `color1` | Start color — named (`black`) or hex (`#ff6b9d`) | Random |
| `color2` | End color — same format | Random |
| `type` | Gradient style: `linear`, `radial`, `conic` | `linear` |
| `x`, `y` | Direction/center point as 0–1 fractions | Random |
| `--output` | Custom output path | Auto-generated |
| `--palette` | Curated color palette (see below) | — |
| `--multi-monitor` | Generate one wallpaper per display | — |

## Palettes

Palettes pick two colors automatically from a curated set, so you always get a harmonious result.

```bash
wallpapir --palette nord
wallpapir --palette dracula
wallpapir --palette catppuccin
```

Palettes work with all other flags:

```bash
wallpapir --palette nord radial
wallpapir --palette catppuccin --multi-monitor
```

## Multi-Monitor

With `--multi-monitor`, wallpapir detects how many displays are connected and generates one wallpaper per display. Each display gets a different gradient style (linear, radial, conic) but uses the same palette for a cohesive look.

```bash
wallpapir --palette dracula --multi-monitor
```

When running plain `wallpapir` with multiple displays connected, you'll be asked automatically:

```
2 displays detected. Generate one wallpaper per display? (y/N)
```

## Gradient Types

### Linear
Direction-based gradient. `x` and `y` define the end point.
```bash
wallpapir blue orange linear 1.0 1.0   # Diagonal
wallpapir red gold linear 0.5 0.5      # Gentle slope
```

### Radial
Expands outward from a center point. `x` and `y` set the center.
```bash
wallpapir darkgreen black radial 0.85 0.32   # Off-center
wallpapir white navy radial 0.5 0.5          # Centered
```

### Conic
Sweeps angularly around a center point.
```bash
wallpapir purple gold conic 0.5 0.5    # Centered
wallpapir red cyan conic 0.7 0.3       # Off-center
```

## Output

Wallpapers are saved to `~/wallpapers/` with auto-generated names:

```
nord-88c0d0-linear-72-45.png
black-white-radial-50-50.png
```

If the same filename already exists, it auto-increments:
```
black-white-radial-50-50.png
black-white-radial-50-50 (1).png
```

Use `--output` for a custom path:
```bash
wallpapir --palette nord --output ~/Desktop/wall.png
```

## Technical Details

- **Resolution:** 3840×2160 (4K, 16:9)
- **Format:** PNG
- **Color interpolation:** LCh mode via Chroma.js (no muddy midpoints)
- **Anti-banding:** Subtle noise dithering applied to every wallpaper

## Troubleshooting

**Hex colors not working**
Wrap hex codes in quotes to prevent shell interpretation of `#`:
```bash
wallpapir "#ff0000" "#0000ff" linear   # correct
wallpapir #ff0000 #0000ff linear       # wrong — # starts a comment
```

**Wallpaper not setting on macOS**
Make sure wallpapir has permission to control System Events. If prompted, allow it in System Settings → Privacy & Security → Automation.

## License

MIT
