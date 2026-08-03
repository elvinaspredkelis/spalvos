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

| Port | Path | Notes |
|------|------|-------|
| **Tailwind / CSS** | `spalvos.css` | The source of truth — primitives + themed tokens as `@theme` custom properties. `tailwind/namespaced-spalvos.css` and `tailwind/overridden-spalvos.css` are packaging variants. |
| **Zed** | `zed/spalvos.json` | Light + dark editor themes, full syntax map. |
| **Neovim** | `nvim/` | `spalvos-light` / `spalvos-dark` colorschemes — both variants in `nvim/lua/spalvos.lua`, mirroring the Zed syntax map. |
| **Ghostty** | `ghostty/` | `spalvos-dark` / `spalvos-light` terminal themes (OKLCH → sRGB). |
| **Herdr** | `herdr/` | `[theme.custom]` blocks for the terminal workspace manager. Pins its own hexes rather than reading the ANSI palette — see the port's README for why. |
| **Fish** | `fish/` | `.theme` files + a `conf.d` loader that follows the desktop mode, plus the Tide prompt fixes. |
| **Omarchy** | `omarchy/` | `spalvos-dark` / `spalvos-light` desktop themes (`colors.toml` + Neovim + backgrounds). |

Everything downstream derives from the OKLCH primitives in `spalvos.css`. Don't
hand-tweak hexes in a port — change the primitives, reconvert, copy the values
back.

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

## License

MIT — see [`LICENSE`](LICENSE).
