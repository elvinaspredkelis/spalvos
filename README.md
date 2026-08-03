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

The invariant that makes dark safe: no surface ever sinks *below* the darkest
ink (`neutral-1000`, the true-black floor). Dark `frame` sits just above that
floor rather than on it, which leaves the six elevations room to separate.

## Ports

| Port | Path | Notes |
|------|------|-------|
| **Tailwind / CSS** | `spalvos.css` | The source of truth — primitives + themed tokens as `@theme` custom properties. `tailwind/namespaced-spalvos.css` and `tailwind/overridden-spalvos.css` are packaging variants. |
| **Zed** | `zed/spalvos.json` | Light + dark editor themes, full syntax map. |
| **Ghostty** | `ghostty/` | `spalvos-dark` / `spalvos-light` terminal themes (OKLCH → sRGB). |
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

## License

MIT — see [`LICENSE`](LICENSE).
