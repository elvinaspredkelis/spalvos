# Spalvos

A transportable color system. Warm ink on warm paper (Flexoki / Helply
lineage), dialed toward neutral — quiet, not cold. One set of primitives drives
a light web UI, a dark web UI, a terminal, and an editor.

## The core

Six accent ramps (rose, amber, emerald, cyan, blue, magenta) plus one neutral
spine, authored in **OKLCH** — gamut-safe and perceptually even. Themed tokens
(`background`, `foreground`, `border`, the semantic `*-strong` accents, …)
reference those primitives; a "theme" is just which value wins. Light is the
default, `[data-theme="dark"]` repoints, and the ports repoint again.

The invariant that makes dark safe: at the dark end the darkest surface and the
darkest ink are the *same* primitive (`neutral-1000`, the true-black floor), so
a surface can never sink below the ink.

## Ports

| Port | Path | Notes |
|------|------|-------|
| **Tailwind / CSS** | `tailwind/spalvos.css` | The source of truth — primitives + themed tokens as `@theme` custom properties. `tailwind/namespaced-spalvos.css` and `tailwind/overridden-spalvos.css` are packaging variants. |
| **Zed** | `zed/spalvos.json` | Light + dark editor themes, full syntax map. |
| **Ghostty** | `ghostty/` | `spalvos-dark` / `spalvos-light` terminal themes (OKLCH → sRGB). |
| **Omarchy** | `omarchy/` | `spalvos-dark` / `spalvos-light` desktop themes (`colors.toml` + Neovim + backgrounds). |

Everything downstream derives from the OKLCH primitives in `tailwind/spalvos.css`. Don't
hand-tweak hexes in a port — change the primitives, reconvert, copy the values
back.

## Verify

`test/verify-palette.mjs` reads `tailwind/spalvos.css` and asserts what the file only
*claims* in comments: every `oklch()` literal is inside the sRGB gamut, and the
key semantic contrasts clear their documented WCAG targets.

```sh
bun test/verify-palette.mjs
```
