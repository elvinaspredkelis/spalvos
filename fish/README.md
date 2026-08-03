# Spalvos for fish

Fish port of the spalvos color system (`../spalvos.css`), converted
from OKLCH primitives to sRGB hex. Syntax roles are matched to
`../nvim/lua/spalvos.lua` so the shell, the editor and the terminal agree.

- `spalvos-light.theme` / `spalvos-dark.theme` — fish `.theme` files (bare hex,
  no leading `#` — that is the format's convention).
- `spalvos-theme.fish` — a `conf.d` drop-in that loads whichever variant matches
  the desktop mode, and repoints the handful of Tide prompt colours that break.

## Why fish needs explicit hexes

Fish's stock theme names ANSI slots (`fish_color_param cyan`,
`fish_pager_color_progress brwhite`). Named slots normally track the terminal
for free — but two of them are not ink in spalvos:

| Fish default | Slot | spalvos-light | spalvos-dark |
|---|---|---|---|
| `fish_pager_color_progress brwhite --background=cyan` | 15 | `paper-raised` — **1.04:1 on paper** | fine |
| `fish_color_search_match white --background=brblack` | 7 | `paper-sunken` — **1.08:1** | fine |
| `fish_color_selection white --bold --background=brblack` | 7 | `paper-sunken` | fine |
| `fish_color_autosuggestion brblack` | 8 | fine (4.70:1) | `neutral-700` — **1.73:1** |

The white slots are paper surfaces at the light end and the black slots are
surface tones at the dark end (by design — see `../ghostty/`), so each default
fails in the opposite mode. Every text role in these themes is pinned to a hex
instead.

## The override you have to remove first

Fish 4.3 migrates theme variables from universal to global scope by writing
`~/.config/fish/conf.d/fish_frozen_theme.fish`, containing its **default** theme
as `set --global`. That file is why theme changes can appear to do nothing:

- `set --global` in `conf.d` shadows any universal variable, so
  `fish_config theme choose` is silently overridden; and
- whichever `conf.d` snippet sorts last wins, and `fish_frozen_theme.fish` sorts
  after most names.

Delete it when installing this port — its own header says to. `spalvos-theme.fish`
replaces it.

## Install

```sh
mkdir -p ~/.config/fish/themes
cp spalvos-light.theme spalvos-dark.theme ~/.config/fish/themes/
cp spalvos-theme.fish ~/.config/fish/conf.d/
rm -f ~/.config/fish/conf.d/fish_frozen_theme.fish
```

Open a new shell, or `exec fish` in an existing one.

`spalvos-theme.fish` picks the variant from Omarchy's `light.mode` marker (the
same signal ghostty's `theme = dark:…,light:…` follows), falling back to the GTK
`color-scheme` and then to dark. The `.theme` files stay the single source of
truth — the script only parses and applies them.

To pin one variant instead, skip the `conf.d` file and use
`fish_config theme choose "spalvos-dark"` (after deleting the frozen theme).

## Tide

Tide stores its colours as ANSI slot *names*. Most are fine — `green` resolves
through the ghostty palette. `spalvos-theme.fish` repoints only the ones naming
a surface slot: `tide_os_color`, `tide_bun_color`, `tide_crystal_color`,
`tide_private_mode_color` and `tide_vi_mode_color_default` were `white`/`brwhite`
(invisible on paper — including the OS icon that opens the prompt), and
`tide_cmd_duration_color`, `tide_time_color`,
`tide_prompt_color_frame_and_connection` and
`tide_prompt_color_separator_same_color` were `brblack` (1.73:1 in dark).

Frame and separator colours are set to a deliberately decorative weight
(~2:1) — they are line art, not text.

## Verify

`../test/verify-legibility.mjs` asserts that every hex is a real spalvos primitive,
that body roles clear 4.5:1 against the matching `../ghostty/` canvas, and that
every role carrying its own `--background=` reads as a pair.

```sh
bun test/verify-legibility.mjs
```
