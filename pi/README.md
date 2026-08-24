# pi — spalvos theme pair

JSON themes for the pi coding agent (`~/.pi/agent/themes/*.json`), role-mapped
the same way as ../herdr: tokens are assigned by ROLE (text/muted/dim from the
neutral spine, accent/focus = cyan, status hues from each mode's `-strong`
steps), not by ANSI slot — pi draws its own chrome, so unlike ghostty it never
has to bend the 16-color palette to stand in for UI tokens.

## Install

```bash
mkdir -p ~/.pi/agent/themes
cp pi/spalvos-light.json pi/spalvos-dark.json ~/.pi/agent/themes/
```

Then follow the terminal appearance by setting in `~/.pi/agent/settings.json`:

```json
{ "theme": "spalvos-light/spalvos-dark" }
```

(light first, dark second — same order as `pi --use-theme light/dark`.)

## Mapping notes

- **Surfaces**: dark lifts away from the neutral-1000 floor
  (`selectedBg`/message beds at neutral-900/950); light sinks from paper-base
  toward paper-frame. Same invariant as ../herdr.
- **Accent** is cyan in both modes (cyan-400 / cyan-700) — the focus hue used
  by nvim and the ghostty cursors.
- **Status hues** run the dark `-strong` 400 steps and the light `-strong` 600/700
  steps, exactly like ../herdr. Light `success` is emerald-600 to match
  ghostty/fish's green slot (unambiguously green on paper).
- Every hex is a canon primitive from ../spalvos.css; no hand-tuned values.
- The thinking ladder ramps cyan → blue → magenta → rose within one mode's
  step band so effort levels stay ordered without leaving the palette.
