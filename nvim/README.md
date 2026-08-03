# Spalvos for Neovim

Neovim port of the spalvos color system (`../spalvos.css`), structured
after the Zed port (`../zed/spalvos.json`): one file carries both variants, each
variant is the same key set with a different hex behind every key, and the
token → colour assignments are lifted verbatim from the Zed theme — so the
editor, the terminal (`../ghostty`) and the desktop (`../omarchy`) all agree.

```
nvim/
├── lua/spalvos.lua              ← the port: both palettes + the highlight map
└── colors/
    ├── spalvos-light.lua        ← `:colorscheme spalvos-light`
    └── spalvos-dark.lua         ← `:colorscheme spalvos-dark`
```

- `spalvos-light` — `paper-base` canvas, `neutral-800` ink, cyan selection wash.
- `spalvos-dark` — `#1f1f1f` editor canvas, one step above the `#171717`
  desktop/terminal background, teal selection wash.

Covers 219 highlight groups: editor UI, legacy syntax, Treesitter (`@…`), LSP
semantic tokens, diagnostics, diff/git, Telescope, which-key, neo-tree, and
cmp/blink. `vim.g.terminal_color_0..15` is set from the matching Ghostty
palette, so `:terminal` matches the outer terminal exactly.

## Palettes are named by role, not by hue

The hue behind a role flips between variants: light runs blue duty on the cyan
ramp (the spalvos blue ramp is violet/hot at every step), dark uses the real
blue. Naming the slots `accent` / `property` / `fn` rather than `blue` / `cyan`
is what lets a *single* highlight map serve both variants — the same reason
Zed's two `style` blocks share one key set. Both palettes are asserted to carry
identical keys.

## Install

The directory is a ready-made plugin — point your manager at it, or copy the
two pieces onto your `runtimepath`:

```sh
mkdir -p ~/.config/nvim/lua ~/.config/nvim/colors
cp lua/spalvos.lua ~/.config/nvim/lua/
cp colors/spalvos-*.lua ~/.config/nvim/colors/
```

With [lazy.nvim](https://github.com/folke/lazy.nvim), from a local checkout:

```lua
{ dir = "~/path/to/spalvos/nvim", lazy = false, priority = 1000 }
```

## Use

```vim
:colorscheme spalvos-light
:colorscheme spalvos-dark
```

Or from Lua, which is the same thing without the `colors/` shim:

```lua
require("spalvos").load("dark")
```

With LazyVim, set it as the colorscheme:

```lua
{ "LazyVim/LazyVim", opts = { colorscheme = "spalvos-dark" } }
```

To follow the desktop, key it off `vim.o.background` or the Omarchy theme name.

## Relation to `../omarchy/*/neovim.lua`

The Omarchy themes ship their own `neovim.lua`. Those are deliberately
self-contained — Omarchy copies a theme directory into
`~/.config/omarchy/current/theme/` and nothing there may `require` a plugin —
so they duplicate this map inline rather than depending on it. They are the
vendored twins of this port; if you change colours here, re-derive them too.

## Regenerating

Values are lifted from `../zed/spalvos.json`, which itself derives from the
OKLCH primitives in `../spalvos.css`. Don't hand-tweak hexes here —
change the primitives, reconvert, update the Zed theme, then copy the values
across.
