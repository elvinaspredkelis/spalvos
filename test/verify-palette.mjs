#!/usr/bin/env bun
/*
 * Verify Spalvos — reads ../spalvos.css and asserts the palette invariants:
 *   1. Every oklch() literal is inside the sRGB gamut.
 *   2. The key semantic contrasts clear their WCAG targets.
 *   3. Every hex in a port renders a canon primitive (no hand-tweaked colors).
 *   4. The tailwind/ packaging variants are in sync with the canon.
 * Run: `bun test/verify-palette.mjs` (exit 1 on any failure).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildNamespaced, buildOverridden, buildPlayground } from "../scripts/gen-tailwind.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(dir, "../spalvos.css"), "utf8");

// --- OKLCH → linear sRGB → helpers ---------------------------------------
const oklchToLinear = (L, C, H) => {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};
const inGamut = (lin) => lin.every((c) => c >= -0.001 && c <= 1.001);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const cl = (c) => Math.min(1, Math.max(0, c));
const relLum = (L, C, H) => {
  const [r, g, b] = oklchToLinear(L, C, H).map((c) => cl(c));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [relLum(...a), relLum(...b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// --- parse every `--name: oklch(L C H)` (first value wins = light theme) ---
const light = {}; // name -> [L,C,H]
const all = []; // {name, LCH, dark}
// Anchor on the SELECTOR (comments mention [data-theme="dark"] too).
const darkStart = css.indexOf(':root[data-theme="dark"]');
const darkBlock = darkStart >= 0 ? css.slice(darkStart) : "";
for (const m of css.matchAll(/--color-([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) {
  const name = m[1];
  const LCH = [+m[2], +m[3], +m[4]];
  const dark = darkStart >= 0 && m.index >= darkStart;
  if (!dark && light[name] === undefined) light[name] = LCH;
  all.push({ name, LCH, dark });
}

let failures = 0;
const fail = (msg) => { console.error("  ✗ " + msg); failures++; };

// 1. Gamut
let outOfGamut = 0;
for (const { name, LCH, dark } of all) {
  if (!inGamut(oklchToLinear(...LCH))) {
    fail(`${dark ? "[dark] " : ""}--color-${name}: oklch(${LCH.join(" ")}) is OUT of sRGB gamut`);
    outOfGamut++;
  }
}
console.log(`Gamut: ${all.length - outOfGamut}/${all.length} literals in sRGB`);

// 2. Key contrasts (light theme; targets from the file's comments)
const checks = [
  ["foreground on paper-base", ["neutral-950", "paper-base"], 12],
  ["muted-fg on paper-base", ["neutral-600", "paper-base"], 4.5],
  ["primary-strong on paper-base", ["blue-700", "paper-base"], 4.5],
  ["success-strong on paper-base", ["emerald-700", "paper-base"], 4.5],
  ["warning-strong on paper-base", ["amber-700", "paper-base"], 4.5],
  ["critical-strong on paper-base", ["rose-700", "paper-base"], 4.5],
  ["magenta-500 vs white (fill)", ["magenta-500", "neutral-0"], 4.5],
  ["white on blue-500 (primary fill)", ["neutral-0", "blue-500"], 4.5],
];
for (const [label, [fg, bg], target] of checks) {
  if (!light[fg] || !light[bg]) { fail(`${label}: missing token (${fg} / ${bg})`); continue; }
  const r = contrast(light[fg], light[bg]);
  if (r < target) fail(`${label}: ${r.toFixed(2)}:1 < ${target}:1`);
  else console.log(`  ✓ ${label}: ${r.toFixed(2)}:1 (≥ ${target})`);
}

// 3. Invariant: no dark surface sinks below the ink floor. The rule is that a
//    surface can never go darker than the darkest ink — i.e. >= neutral-1000,
//    NOT equal to it. Pinning frame to the floor leaves the ladder no room and
//    crushes every surface toward black.
{
  const floor = light["neutral-1000"][0];
  const darkSurfaces = [...darkBlock.matchAll(/--color-paper-([\w-]+):\s*oklch\(([\d.]+)/g)];
  if (!darkSurfaces.length) fail("no dark paper surfaces found");
  for (const m of darkSurfaces) {
    if (+m[2] < floor) fail(`dark paper-${m[1]}: L ${m[2]} sinks below the neutral-1000 ink floor (${floor})`);
  }
  const lowest = Math.min(...darkSurfaces.map((m) => +m[2]));
  if (lowest >= floor)
    console.log(`  ✓ dark surfaces stay above the ink floor (lowest ${lowest} >= ${floor})`);
}

// 3b. Paper ladders must be perceptibly separated. Below ~0.015 L two large
//     flat fields are indistinguishable, so the elevation tokens do no work.
for (const [label, block] of [["light", css.slice(0, darkStart)], ["dark", darkBlock]]) {
  const steps = [...block.matchAll(/--color-paper-([\w-]+):\s*oklch\(([\d.]+)/g)].map((m) => [m[1], +m[2]]);
  let worst = Infinity, worstPair = "";
  for (let i = 1; i < steps.length; i++) {
    const d = steps[i - 1][1] - steps[i][1];
    if (d <= 0) fail(`${label} paper ladder not monotonic at ${steps[i - 1][0]} -> ${steps[i][0]}`);
    if (d < worst) { worst = d; worstPair = `${steps[i - 1][0]}/${steps[i][0]}`; }
  }
  if (worst < 0.015) fail(`${label} paper: ${worstPair} only ΔL ${worst.toFixed(3)} apart (< 0.015, below JND)`);
  else console.log(`  ✓ ${label} paper ladder: tightest step ΔL ${worst.toFixed(3)} (${worstPair})`);
}

// 3. Port fidelity — every hex in a port is a faithful sRGB rendering of a canon
//    oklch() literal (Δ ≤ 2/255 per channel). Catches hand-tweaked port colors.
const toHex = (L, C, H) =>
  "#" + oklchToLinear(L, C, H).map((c) => Math.round(cl(toSrgb(cl(c))) * 255).toString(16).padStart(2, "0")).join("");
const canonHex = new Set();
for (const m of css.matchAll(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g))
  canonHex.add(toHex(+m[1], +m[2], +m[3]));
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const isCanon = (h) => {
  const t = rgb(h);
  for (const k of canonHex) if (rgb(k).every((v, i) => Math.abs(v - t[i]) <= 2)) return true;
  return false;
};
const ports = [
  { file: "../ghostty/spalvos-dark", strip: true },
  { file: "../ghostty/spalvos-light", strip: true },
  { file: "../omarchy/spalvos-dark/colors.toml", strip: true },
  { file: "../omarchy/spalvos-light/colors.toml", strip: true },
  // zed carries a few intentional derived tones (dim ANSI + a selection tint)
  // that aren't raw primitives; allowlist them so any OTHER foreign hex fails.
  { file: "../zed/spalvos.json", strip: false, allow: new Set(["#0b5b38", "#7a4008", "#065e61", "#003c3f"]) },
];
let portForeign = 0;
for (const { file, strip, allow } of ports) {
  let text = readFileSync(join(dir, file), "utf8");
  if (strip) text = text.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
  const hexes = [...new Set([...text.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase()))];
  const bad = hexes.filter((h) => !isCanon(h) && !allow?.has(h));
  if (bad.length) { fail(`${file}: non-canon hex(es): ${bad.join(" ")}`); portForeign += bad.length; }
}
if (!portForeign) console.log(`  ✓ ports faithful — every hex renders a canon primitive`);

// 4. Variant sync — the tailwind/ packaging files must equal what the generator
//    would emit from the canon (no hand-maintained duplicate of the primitives).
const template = readFileSync(join(dir, "../scripts/playground.template.html"), "utf8");
for (const [rel, expected] of [
  ["tailwind/namespaced-spalvos.css", buildNamespaced(css)],
  ["tailwind/overridden-spalvos.css", buildOverridden(css)],
  ["tailwind/playground.html", buildPlayground(css, template)],
]) {
  if (readFileSync(join(dir, "..", rel), "utf8") !== expected)
    fail(`${rel} out of sync — run: bun scripts/gen-tailwind.mjs`);
  else console.log(`  ✓ ${rel} in sync with canon`);
}

console.log(failures ? `\nFAIL — ${failures} problem(s)` : "\nPASS");
process.exit(failures ? 1 : 0);
