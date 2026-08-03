# Spalvos for herdr

[Herdr](https://herdr.dev) port of the spalvos color system
(`../spalvos.css`), converted from OKLCH primitives to sRGB hex.

- `spalvos-light.toml` / `spalvos-dark.toml` — drop-in `[theme]` sections for
  `~/.config/herdr/config.toml`.

## Why herdr needs its own hexes

Herdr ships a `terminal` theme that paints its UI out of the ANSI palette, so
it inherits whatever the terminal is using. That works on a dark terminal and
fails on a light one, because it maps herdr's ink tokens onto the **white**
slots:

| herdr token | `terminal` theme → | spalvos-light value | on paper |
|---|---|---|---|
| `overlay0` (section headers, item labels) | ANSI 7 | `paper-sunken` `#f2f2f1` | **1.08:1** |
| `text` (primary text) | ANSI 15 | `paper-raised` `#ffffff` | **1.04:1** |
| `surface_dim` (dividers, selected row) | ANSI 8 | `neutral-500` `#73716e` | mid-gray slab |
| `accent` (active tab fill) | ANSI 4 | `cyan-700` `#087075` | — |

The sidebar was therefore invisible in light mode: section titles, workspace
names and agent labels all rendered at ~1:1 against the paper canvas.

**The ANSI palette is not the bug.** A light terminal theme keeps light whites —
`../ghostty/spalvos-light` deliberately puts the paper surfaces in slots 7/15
and says so, and Solarized Light and Catppuccin Latte do the same. Slots 7/15
are not ink at the light end, so a TUI must not draw text with them. Fixing the
palette to suit one consumer would have broken every other one. Fixing the
consumer is the correct direction, so these files pin all 16 tokens to explicit
spalvos hexes.

`name = "terminal"` is kept as the base on purpose: the pane canvas and the
text herdr emits with a `reset` keep coming from ghostty, so they track the
terminal exactly. Only the chrome is pinned.

Dark had a quieter version of the same problem — `surface_dim` on ANSI 8
(`neutral-700`) is 1.73:1 on the background, so dividers and the selected-row
band were both invisible — and gets the same treatment.

## Token roles

Herdr documents the 16 token *names* but not what each one paints. They were
established empirically against herdr 0.7.5: every token was set to a unique
probe colour, herdr was driven through its sidebar, tab bar, help and settings
screens on a pty, and the emitted SGR sequences were read back.

| Token | Paints |
|---|---|
| `panel_bg` | sidebar + tab-bar background; **also** the label ink on `accent` |
| `surface_dim` | dividers (as fg) **and** the selected-row band (as bg) |
| `surface0`, `surface1` | panels, wells, raised rows (settings/help) |
| `overlay0` | section headers, unselected item labels |
| `overlay1` | minor glyphs (the new-tab `+`), dim chrome |
| `subtext0` | secondary text |
| `text` | primary text |
| `accent` | focus — the active-tab fill |
| `red` `green` `yellow` `blue` `mauve` `teal` `peach` | agent/status hues |

The names are Catppuccin's, but assignment here is by **observed role**, not by
Catppuccin's lightness order — the same principle as
`../nvim/lua/spalvos.lua` ("named by ROLE, not by hue"). That is why `overlay0`
is a *stronger* ink than `overlay1`: `overlay0` carries the sidebar's labels and
has to clear AA, while `overlay1` only carries glyphs and is held to the 3:1 UI
floor.

## Install

Herdr has one `[theme.custom]` table and no per-mode variant of it
(`ThemeConfig` is `{auto_switch, dark_name, light_name, custom}`), so the table
has to be rewritten when the desktop mode changes. `../bin/spalvos-mode-apply`
does that, splicing the right file between marker comments and reloading the
running server:

```sh
../bin/spalvos-mode-apply          # detect light/dark from the desktop
../bin/spalvos-mode-apply dark     # or pin one
```

To follow `omarchy theme set`, call it from `~/.config/omarchy/hooks/theme-set`.

To install by hand instead, copy the `[theme]` and `[theme.custom]` tables from
the variant you want into `~/.config/herdr/config.toml` (replacing any existing
`[theme]` table — a duplicate TOML table is a parse error), then
`herdr server reload-config`.

## Verify

`../test/verify-legibility.mjs` asserts that every hex is a real spalvos primitive,
that each ink token clears 4.5:1 and each UI/status token 3:1 against **all
four** surface beds, that the active-tab label reads on the accent fill, and
that the ink ladder is monotonic.

```sh
bun test/verify-legibility.mjs
```
