# Spalvos for ghostty

Ghostty port of the spalvos color system (`../tailwind/spalvos.css`), converted from
OKLCH primitives to sRGB hex.

- `spalvos-dark` — based on the "TRANSPORT RECIPE" at the foot of
  `../tailwind/spalvos.css`, restructured after Catppuccin Macchiato's ghostty theme:
  lifted `paper-dark-base` background, black slot = visible surface tone,
  chromatic brights == normals (pastel 400 steps), white ladder below the
  foreground, neutral selection.
- `spalvos-light` — the system flipped to light after Kary Pro Colors
  Light: `paper-base` background, mid-gray `neutral-600` ink, muted
  accents at uniform lightness, cyan cursor/selection, blue duty on the
  cyan ramp (the spalvos blue ramp is violet/hot at every step). All
  text-capable slots kept in the L≈39–61 legible band.

Cursor and selection colors aren't pinned by the recipe; they're derived
from the same primitives (noted in each file).

## Install

```sh
mkdir -p ~/.config/ghostty/themes
cp spalvos-dark spalvos-light ~/.config/ghostty/themes/
```

## Use

Follow the OS appearance (see ghostty `theme` config reference):

```ini
theme = dark:spalvos-dark,light:spalvos-light
```

Or pin one:

```ini
theme = spalvos-dark
```

Reload with `ghostty +reload-config` or restart ghostty. List installed
themes with `ghostty +list-themes`.

## Regenerating

Values were produced by converting the OKLCH primitives in `../tailwind/spalvos.css`
to sRGB (Ottosson OKLab matrix + sRGB gamma, gamut-clamped). If the
primitives change, reconvert and update both files — don't hand-tweak
hexes, so the port stays faithful to the source of truth.
