# Spalvos for Tailwind

Two ways to pull the [spalvos](../README.md) palette into a **Tailwind v4**
project. Both files are generated from the canon (`../spalvos.css`) by
`../scripts/gen-tailwind.mjs` — don't edit them by hand; change the canon and
regenerate.

Each file already `@import`s Tailwind, so it *is* your CSS entry — point your
build at it (or copy it in and import it):

```css
/* app.css */
@import "./overridden-spalvos.css";
```

## Playground

`playground.html` is a self-contained interactive demo (in-browser Tailwind v4
compiler + the overridden variant) — every class is a spalvos token, with
theme / contrast / code-format toggles and click-to-copy. Serve the repo and
open it:

```sh
python3 -m http.server   # then open http://localhost:8000/tailwind/playground.html
```

## Namespaced — add spalvos alongside Tailwind's defaults

`namespaced-spalvos.css` prefixes every token with `spalvos-`, so the palette
sits next to Tailwind's built-in colors instead of replacing them. Reach for
this when an existing project still needs `bg-red-500` and friends.

```html
<div class="bg-spalvos-paper-base text-spalvos-blue-700">
<button class="bg-spalvos-primary text-spalvos-primary-fg">
```

## Overridden — spalvos *is* the palette

`overridden-spalvos.css` wipes Tailwind's default color palette
(`--color-*: initial`) and installs spalvos in its place, so the class names
stay short. Reach for this on a new project styled entirely in spalvos.

```html
<div class="bg-paper-base text-blue-700">
<button class="bg-primary text-primary-fg">
```

`bg-red-500` and the rest of Tailwind's defaults no longer exist — only spalvos
tokens (plus `white` / `black`).

## Which one

| | Namespaced | Overridden |
|---|---|---|
| Tailwind defaults | kept | removed |
| Class names | `bg-spalvos-blue-500` | `bg-blue-500` |
| Use when | adding to an existing palette | spalvos is the whole system |

## Not using Tailwind?

Import `../spalvos.css` directly — the same tokens are plain CSS custom
properties (`var(--color-blue-500)`, `var(--color-background)`, …). Toggle dark
with `data-theme="dark"` on the root; high-contrast with `data-contrast="high"`.
