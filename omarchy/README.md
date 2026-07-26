# Spalvos for Omarchy

Two Omarchy themes ported from the spalvos color system — a light and a dark
variant. Colors are lifted verbatim from the ghostty ports
(`../ghostty/spalvos-dark`, `../ghostty/spalvos-light`) and the Zed theme
(`../zed/spalvos.json`), so the desktop, terminal, and editor all agree.

```
spalvos-dark/           spalvos-light/
├── colors.toml         ├── colors.toml
├── neovim.lua          ├── neovim.lua
├── icons.theme         ├── icons.theme
├── preview.png         ├── preview.png
└── backgrounds/        ├── light.mode          ← marks this theme "light"
                        └── backgrounds/
```

`colors.toml` is the single source Omarchy reads to generate the terminal
(Ghostty/Alacritty/Kitty), Waybar, Hyprland, Hyprlock, Mako, SwayOSD, Walker,
btop, and Chromium configs. `neovim.lua` is a self-contained LazyVim
colorscheme (no plugin dependency — there is no spalvos Neovim plugin, so the
highlights are set inline from the same palette). `icons.theme` picks the Yaru
accent icon set. `light.mode` (empty file) tells Omarchy the theme is light.

## Install

Each directory is a standalone Omarchy theme. Copy (or symlink) both into
`~/.config/omarchy/themes/`:

```sh
cp -r spalvos-dark  ~/.config/omarchy/themes/spalvos-dark
cp -r spalvos-light ~/.config/omarchy/themes/spalvos-light
```

Then pick one from the theme menu (`SUPER + CTRL + SHIFT + SPACE`) or:

```sh
omarchy-theme-set spalvos-dark
omarchy-theme-set spalvos-light
```

## Palette

Both themes carry the full 16-slot ANSI palette plus fg/bg/cursor/selection.
See `preview.png` in each directory, or the source-of-truth notes in
`../ghostty/spalvos-dark` and `../ghostty/spalvos-light`.

| role   | dark      | light     |
|--------|-----------|-----------|
| bg     | `#171717` | `#fbfbfa` |
| fg     | `#ecebe9` | `#343331` |
| accent | `#42cbd2` | `#087075` |

## Optional extras

Omarchy also supports these per-theme files; add them if you want the full
experience (skipped here — the theme works without them):

- `unlock.png` — transparent PNG shown on the Hyprlock unlock screen.
- `preview-unlock.png` — generated via `omarchy plymouth preview`.

## Regenerating

Don't hand-tweak the hexes. The palette derives from the OKLCH primitives in
`../../spalvos.css`; if those change, reconvert the ghostty ports and copy the
values back into both `colors.toml` files (and the `neovim.lua` palette table).
