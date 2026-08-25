#!/usr/bin/env bun
/*
 * Generate assets/cover.png — the social/README card.
 *
 * Like every other port, the card derives from canon: the ramp hexes are read
 * out of ../spalvos.css and converted here, so a palette change reaches the
 * artwork by re-running this instead of by editing a design file.
 *
 * 1600x900 (16:9) — X crops to roughly this in-timeline. For the GitHub social
 * preview (Settings -> Social preview) export a 1280x640 crop of the same
 * composition.
 *
 * Run: `bun scripts/gen-cover.mjs` (needs ImageMagick's `magick` on PATH).
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const ok2hex = (L, C, H) => {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return "#" + lin.map((x) => {
    x = Math.max(0, Math.min(1, x));
    const g = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(g * 255).toString(16).padStart(2, "0");
  }).join("");
};

const css = readFileSync(join(root, "spalvos.css"), "utf8");
const token = (name) => {
  const m = css.match(new RegExp(`--color-${name}:\\s*oklch\\(([0-9.]+) ([0-9.]+) ([0-9.]+)\\)`));
  if (!m) throw new Error(`cover: --color-${name} not found in spalvos.css`);
  return ok2hex(+m[1], +m[2], +m[3]);
};

// Light shows the 600 inks, dark the 400s — the steps each variant actually
// paints its accents with.
const RAMPS = ["raspberry", "orange", "emerald", "cyan", "blue", "fuchsia"];
const light = RAMPS.map((r) => token(`${r}-600`));
const dark = RAMPS.map((r) => token(`${r}-400`));

const PAPER = token("paper-base"), INK = token("neutral-800");
const MUTED = token("neutral-500"), DARK_MUTED = token("neutral-400");
const DARK = "#171717"; // paper-dark-base, the editor/desktop canvas

const W = 1600, H = 900, SPLIT = 560;
const FONT_B = "/usr/share/fonts/TTF/JetBrainsMonoNerdFont-Bold.ttf";
const FONT_R = "/usr/share/fonts/TTF/JetBrainsMonoNerdFont-Regular.ttf";

const args = ["-size", `${W}x${H}`, `xc:${PAPER}`, "-fill", DARK, "-draw", `rectangle 0,${SPLIT} ${W},${H}`];
const row = (cols, y) => {
  let x = 120;
  for (const c of cols) {
    args.push("-fill", c, "-draw", `roundrectangle ${x},${y} ${x + 200},${y + 90} 10,10`);
    x += 232;
  }
};
row(light, 400);
row(dark, 660);
args.push(
  "-font", FONT_B, "-pointsize", "96", "-fill", INK, "-annotate", "+120+210", "Spalvos",
  "-font", FONT_R, "-pointsize", "36", "-fill", MUTED, "-annotate", "+124+272", "One palette. Every surface.",
  "-font", FONT_R, "-pointsize", "24", "-fill", MUTED, "-annotate", "+120+372", "light",
  "-font", FONT_R, "-pointsize", "24", "-fill", DARK_MUTED, "-annotate", "+120+632", "dark",
  join(root, "assets/cover.png"),
);
execFileSync("magick", args);
console.log("wrote assets/cover.png (1600x900)");
