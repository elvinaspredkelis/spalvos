#!/usr/bin/env bun
/*
 * Verify Spalvos — reads ../spalvos.css and asserts the palette invariants:
 *   1. Every oklch() literal is inside the sRGB gamut.
 *   2. The key semantic contrasts clear their WCAG targets.
 * Run: `bun test/verify-palette.mjs` (exit 1 on any failure).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../spalvos.css"),
  "utf8",
);

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

// 3. Invariant: dark frame references the neutral-1000 floor (not a lower value)
if (!/--color-paper-frame:\s*var\(--color-neutral-1000\)/.test(darkBlock))
  fail("dark paper-frame must be var(--color-neutral-1000) (the shared floor)");
else console.log("  ✓ dark frame == neutral-1000 floor");

console.log(failures ? `\nFAIL — ${failures} problem(s)` : "\nPASS");
process.exit(failures ? 1 : 0);
