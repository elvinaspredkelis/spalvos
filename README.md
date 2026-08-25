# Spalvos

A transportable color system. Warm ink on warm paper (Flexoki / Helply
lineage), dialed toward neutral — quiet, not cold. One set of primitives drives
a light web UI, a dark web UI, a terminal, and an editor.

Authored in OKLCH — gamut-safe and perceptually even. The same core carries the
web, a terminal, and an editor with no per-port hand-tweaking.

Tested at [Primevise](https://primevise.com), [Rinkta](https://rinkta.com), and [Mintis Dynamics](https://mintisdynamics.com).

<a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-5ec990"></a>
<a href="https://github.com/elvinaspredkelis/spalvos/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/elvinaspredkelis/spalvos?color=5b7ef0"></a>

---

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

Everything starts from `spalvos.css` — the OKLCH primitives and themed tokens
live there as `@theme` custom properties, and every other port is derived from
it. If a colour looks off somewhere, fix the primitive and reconvert; never
hand-tweak hexes in a port.

- [Tailwind / CSS](spalvos.css) — packaging variants in [`tailwind/`](tailwind)
- [Zed](zed/spalvos.json)
- [Neovim](nvim)
- [Ghostty](ghostty)
- [Herdr](herdr)
- [Fish](fish)
- [Omarchy](omarchy)

## Previews

### Omarchy

| Light | Dark |
|-------|------|
| ![Spalvos light desktop](omarchy/spalvos-light/preview.png) | ![Spalvos dark desktop](omarchy/spalvos-dark/preview.png) |

## Verify

`test/verify-palette.mjs` reads `spalvos.css` and asserts its invariants: every
`oklch()` literal is inside the sRGB gamut, and the key semantic contrasts clear
their WCAG targets.

```sh
bun test/verify-palette.mjs
```

`test/verify-legibility.mjs` covers the TUI ports, where a colour's legibility
depends on which surface it lands on: every text-capable slot in `ghostty/`,
`herdr/` and `fish/` is checked against *every* surface it can be drawn on, not
just the default background.

```sh
bun test/verify-legibility.mjs
```

### One thing to know before writing a port

The ANSI **white** slots (7/15) are paper *surfaces* at the light end, and the
**black** slots (0/8) are surface tones at the dark end. That is correct ANSI
practice, and it means a TUI must never paint text with them. Consumers that do
— fish's stock theme, Tide, herdr's built-in `terminal` theme — go invisible in
one mode or the other. The fix belongs in the consumer: bending the palette to
suit one of them breaks all the rest.

## Who uses Spalvos

- [Primevise](https://primevise.com)
- [Rinkta](https://rinkta.com)
- [Krowk](https://krowk.com)

## License

MIT — see [`LICENSE`](LICENSE).
