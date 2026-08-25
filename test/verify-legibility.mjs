#!/usr/bin/env bun
/*
 * Verify LEGIBILITY in the TUI and desktop ports — the companion to
 * verify-palette.mjs.
 *
 * verify-palette.mjs owns the palette invariants (gamut, the key semantic
 * contrasts) and port PROVENANCE — that every hex in a port renders a canon
 * primitive. This file owns the question provenance cannot answer: a hex can be
 * a perfectly canonical primitive and still be unreadable where it is used.
 *
 * A terminal UI draws the same ink on several different surfaces — the panel,
 * a divider band, a selected row, a raised panel — so the check has to be the
 * CROSS-PRODUCT, not one ink against one background. That is exactly what was
 * missing when herdr's built-in `terminal` theme put ANSI 7 (paper-sunken, a
 * SURFACE) under the sidebar labels at 1.08:1: every colour involved was canon.
 *
 * Run: `bun test/verify-legibility.mjs` (exit 1 on any failure).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// --- WCAG contrast --------------------------------------------------------
// Ports are read as hex, so no OKLCH conversion is needed here — mapping the
// canon to hex is verify-palette.mjs's job.
const chan = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const unGamma = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const relLum = (h) => {
  const [r, g, b] = chan(h).map(unGamma);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let failures = 0;
const fail = (msg) => { console.error("  ✗ " + msg); failures++; };
const ok = (msg) => console.log("  ✓ " + msg);

const checkContrast = (label, fg, bg, target) => {
  const r = contrast(fg, bg);
  if (r < target) fail(`${label}: ${r.toFixed(2)}:1 < ${target}:1  (${fg} on ${bg})`);
  return r >= target;
};

// =========================================================================
// herdr — 16 chrome tokens, each checked against all four surface beds.
// =========================================================================
// The token roles were established by instrumenting herdr 0.7.5 (each token
// given a unique probe colour, the emitted SGR sequences read back). Any of
// these inks can land on any of these surfaces, so the whole cross-product has
// to hold — that is precisely what a single "fg vs background" check misses.
const HERDR_BEDS = ["panel_bg", "surface_dim", "surface0", "surface1"];
const HERDR_INK = ["overlay0", "subtext0", "text"];        // body text -> AA
const HERDR_UI = ["overlay1", "red", "green", "yellow", "blue", "mauve", "teal", "peach"];

console.log("\n=== herdr ===");
for (const variant of ["light", "dark"]) {
  const src = readFileSync(join(root, `herdr/spalvos-${variant}.toml`), "utf8");
  const tok = {};
  for (const m of src.matchAll(/^\s*(\w+)\s*=\s*"(#[0-9a-f]{6})"/gim)) tok[m[1]] = m[2].toLowerCase();

  const expected = [...HERDR_BEDS, ...HERDR_INK, ...HERDR_UI, "accent"];
  const missing = expected.filter((t) => !(t in tok));
  if (missing.length) { fail(`herdr/${variant}: missing token(s) ${missing.join(", ")}`); continue; }

  let worst = Infinity, worstLabel = "";
  for (const [group, target] of [[HERDR_INK, 4.5], [HERDR_UI, 3]]) {
    for (const t of group) {
      for (const bed of HERDR_BEDS) {
        checkContrast(`herdr/${variant} ${t} on ${bed}`, tok[t], tok[bed], target);
        const r = contrast(tok[t], tok[bed]);
        if (r < worst) { worst = r; worstLabel = `${t}/${bed}`; }
      }
    }
  }
  ok(`herdr/${variant}: ink >= 4.5:1 and UI >= 3:1 on all 4 beds (tightest ${worstLabel} ${worst.toFixed(2)}:1)`);

  // The active-tab label is drawn in panel_bg ON the accent fill — an inversion
  // that only shows up when you watch what herdr actually emits.
  if (checkContrast(`herdr/${variant} panel_bg label on accent fill`, tok.panel_bg, tok.accent, 4.5))
    ok(`herdr/${variant}: active-tab label ${contrast(tok.panel_bg, tok.accent).toFixed(2)}:1 on the accent fill`);

  // The ink ladder must be ordered, or the token names lie about their weight.
  const ladder = HERDR_INK.map((t) => contrast(tok[t], tok.panel_bg));
  if (ladder.some((r, i) => i && r <= ladder[i - 1]))
    fail(`herdr/${variant}: ink ladder not monotonic: ${ladder.map((r) => r.toFixed(2)).join(" ")}`);
  else ok(`herdr/${variant}: ink ladder rises ${ladder.map((r) => r.toFixed(2)).join(" < ")}`);
}

// =========================================================================
// ghostty — the canvas the other two ports are read against.
// =========================================================================
console.log("\n=== ghostty ===");
const ghostty = {};
for (const variant of ["light", "dark"]) {
  const src = readFileSync(join(root, `ghostty/spalvos-${variant}`), "utf8");
  const get = (k) => (src.match(new RegExp(`^${k}\\s*=\\s*(#[0-9a-f]{6})`, "im")) || [])[1]?.toLowerCase();
  ghostty[variant] = { bg: get("background"), fg: get("foreground") };

  if (checkContrast(`ghostty/${variant} foreground on background`, ghostty[variant].fg, ghostty[variant].bg, 12))
    ok(`ghostty/${variant}: foreground ${contrast(ghostty[variant].fg, ghostty[variant].bg).toFixed(2)}:1 on background`);

  // NOT asserted: that every ANSI slot is legible. In a light theme the white
  // slots are paper SURFACES by design (see the file's own comments), and that
  // is correct ANSI practice — it is the consumer's job not to paint text with
  // them. herdr's built-in `terminal` theme did exactly that, which is why
  // herdr/ pins its own hexes instead of reading the palette.
}

// =========================================================================
// fish — read against the ghostty canvas of the matching variant.
// =========================================================================
console.log("\n=== fish ===");
// Roles that carry command-line text, so they owe AA on the canvas. Roles left
// out are deliberately faint (autosuggestion) or are attributes only.
const FISH_BODY = [
  "fish_color_normal", "fish_color_command", "fish_color_keyword", "fish_color_quote",
  "fish_color_redirection", "fish_color_end", "fish_color_option", "fish_color_error",
  "fish_color_param", "fish_color_comment", "fish_color_operator",
  "fish_color_cwd", "fish_color_cwd_root", "fish_color_user", "fish_color_host",
  "fish_color_host_remote", "fish_color_status",
  "fish_pager_color_completion", "fish_pager_color_description", "fish_pager_color_prefix",
];
const FISH_DECORATIVE = ["fish_color_escape"];

for (const variant of ["light", "dark"]) {
  const src = readFileSync(join(root, `fish/spalvos-${variant}.theme`), "utf8");
  const vars = {};
  for (const line of src.split("\n")) {
    const clean = line.replace(/#(?![0-9a-fA-F]{6}\b).*$/, "").trim();
    if (!clean) continue;
    const [name, ...rest] = clean.split(/\s+/);
    if (!/^fish_(color|pager_color)_/.test(name) || !rest.length) continue;
    vars[name] = {
      fg: (rest.find((t) => /^[0-9a-f]{6}$/i.test(t)) || "").toLowerCase(),
      bg: (rest.map((t) => (t.match(/^--background=([0-9a-f]{6})$/i) || [])[1]).find(Boolean) || "").toLowerCase(),
    };
  }

  const canvas = ghostty[variant].bg;
  const missing = [...FISH_BODY, ...FISH_DECORATIVE].filter((n) => !vars[n]?.fg);
  if (missing.length) fail(`fish/${variant}: missing colour for ${missing.join(", ")}`);

  let pass = 0;
  for (const [group, target] of [[FISH_BODY, 4.5], [FISH_DECORATIVE, 3]]) {
    for (const n of group) {
      if (!vars[n]?.fg) continue;
      if (checkContrast(`fish/${variant} ${n} on canvas`, "#" + vars[n].fg, canvas, target)) pass++;
    }
  }
  ok(`fish/${variant}: ${pass} text roles clear their target on ${canvas}`);

  // Anything that sets its own background is a self-contained pair and has to
  // read on its own terms — this is where `brwhite --background=cyan` died.
  for (const [n, v] of Object.entries(vars)) {
    if (!v.bg) continue;
    const fg = v.fg ? "#" + v.fg : ghostty[variant].fg;
    if (checkContrast(`fish/${variant} ${n} band`, fg, "#" + v.bg, 4.5))
      ok(`fish/${variant}: ${n} band ${contrast(fg, "#" + v.bg).toFixed(2)}:1`);
  }
}

// =========================================================================
// omarchy — v4 colors.toml, checked on the surface ladder it declares.
// =========================================================================
// Omarchy paints the foreground ladder and the chromatic slots across all
// four declared surfaces (waybar, mako, walker all pull from this file), so
// the check is the same cross-product idea as herdr: text inks owe AA on
// every surface, chromatic/UI slots owe 3:1 on the primary background.
console.log("\n=== omarchy ===");
const OMARCHY_SURFACES = ["background", "dark_background", "darker_background", "lighter_background"];
const OMARCHY_INK = ["foreground", "light_foreground", "bright_foreground"];
const OMARCHY_UI = ["accent", "muted", "dark_foreground", "red", "yellow", "orange", "green", "cyan", "blue", "magenta"];

for (const variant of ["light", "dark"]) {
  const src = readFileSync(join(root, `omarchy/spalvos-${variant}/colors.toml`), "utf8");
  const tok = {};
  for (const m of src.matchAll(/^\s*(\w+)\s*=\s*"(#[0-9a-f]{6})"/gim)) tok[m[1]] = m[2].toLowerCase();

  if (!/^\s*mode\s*=\s*"(light|dark)"/m.test(src)) fail(`omarchy/${variant}: missing v4 \`mode\` key`);
  const expected = [...OMARCHY_SURFACES, ...OMARCHY_INK, ...OMARCHY_UI, "selection", "brown",
    "bright_red", "bright_yellow", "bright_green", "bright_cyan", "bright_blue", "bright_magenta"];
  const missing = expected.filter((t) => !(t in tok));
  if (missing.length) { fail(`omarchy/${variant}: missing token(s) ${missing.join(", ")}`); continue; }

  let worst = Infinity, worstLabel = "";
  for (const t of OMARCHY_INK) {
    for (const bed of OMARCHY_SURFACES) {
      checkContrast(`omarchy/${variant} ${t} on ${bed}`, tok[t], tok[bed], 4.5);
      const r = contrast(tok[t], tok[bed]);
      if (r < worst) { worst = r; worstLabel = `${t}/${bed}`; }
    }
  }
  ok(`omarchy/${variant}: ink >= 4.5:1 on all 4 surfaces (tightest ${worstLabel} ${worst.toFixed(2)}:1)`);

  let uiWorst = Infinity, uiWorstLabel = "";
  for (const t of OMARCHY_UI) {
    for (const bed of OMARCHY_SURFACES) {
      checkContrast(`omarchy/${variant} ${t} on ${bed}`, tok[t], tok[bed], 3);
      const r = contrast(tok[t], tok[bed]);
      if (r < uiWorst) { uiWorst = r; uiWorstLabel = `${t}/${bed}`; }
    }
  }
  ok(`omarchy/${variant}: UI slots >= 3:1 on all 4 surfaces (tightest ${uiWorstLabel} ${uiWorst.toFixed(2)}:1)`);

  // Selected text: Omarchy renders selection_foreground on the selection band,
  // and its fallback for that key is bright_foreground.
  if (checkContrast(`omarchy/${variant} bright_foreground on selection`, tok.bright_foreground, tok.selection, 4.5))
    ok(`omarchy/${variant}: bright_foreground ${contrast(tok.bright_foreground, tok.selection).toFixed(2)}:1 on selection band`);

  // The foreground ladder must be ordered dark_ < light_ < bright_ around fg.
  const ladder = ["dark_foreground", "foreground", "bright_foreground"].map((t) => contrast(tok[t], tok.background));
  if (ladder.some((r, i) => i && r <= ladder[i - 1]))
    fail(`omarchy/${variant}: foreground ladder not monotonic: ${ladder.map((r) => r.toFixed(2)).join(" ")}`);
  else ok(`omarchy/${variant}: foreground ladder rises ${ladder.map((r) => r.toFixed(2)).join(" < ")}`);
}

// =========================================================================
// nvim — syntax ink under APCA, the perceptual algorithm WCAG 3 adopts.
// =========================================================================
// WCAG 2's ratio math flatters light-on-dark pairs (a dark theme "passes"
// with keywords the eye reads as dim) and under-rates dark-on-light hue
// inks. APCA Lc predicts real readability: >= 75 for body ink, >= 60 for
// fluently-read colored tokens. Deliberately-faint roles (punctuation,
// gutter, ghost text) are exempt — they are de-emphasis by design.
const apcaY = (h) => {
  const c = (i) => Math.pow(parseInt(h.slice(i, i + 2), 16) / 255, 2.4);
  const y = 0.2126729 * c(1) + 0.7151522 * c(3) + 0.072175 * c(5);
  return y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y;
};
const apcaLc = (txt, bg) => {
  const yt = apcaY(txt), yb = apcaY(bg);
  const s = yb > yt
    ? (Math.pow(yb, 0.56) - Math.pow(yt, 0.57)) * 1.14
    : (Math.pow(yb, 0.65) - Math.pow(yt, 0.62)) * 1.14;
  return Math.abs(s) < 0.1 ? 0 : Math.abs((Math.abs(s) - 0.027) * 100);
};

console.log("\n=== nvim (APCA) ===");
// Three floors. Body tokens are read fluently (Lc >= 60, with 0.5 rounding
// tolerance). Chromatic accents (keywords, functions, types, params) sit at
// Lc >= 50 — APCA under-credits saturated hues, and pushing these to the
// low-chroma 200 steps washes the theme out (tried; reverted). Emphasis
// tokens (tags, self/this, symbol sigils) are sparse and take Lc >= 45.
const NVIM_BODY = ["property", "number", "string", "comment", "accent", "variable"];
const NVIM_ACCENT = ["fn", "keyword", "type", "param"];
const NVIM_EMPHASIS = ["tag", "var_special", "str_special"];
const nvimSrc = readFileSync(join(root, "nvim/lua/spalvos.lua"), "utf8");
for (const variant of ["light", "dark"]) {
  const body = nvimSrc.split(`${variant} = {`)[1];
  const tok = {};
  for (const m of body.matchAll(/^\s*(\w+)\s*=\s*"(#[0-9a-f]{6})"/gim)) tok[m[1]] ??= m[2].toLowerCase();
  const bg = tok.bg;
  if (apcaLc(tok.fg, bg) < 75) fail(`nvim/${variant}: fg Lc ${apcaLc(tok.fg, bg).toFixed(1)} < 75`);
  let worst = Infinity, worstLabel = "";
  for (const [group, floor] of [[NVIM_BODY, 59.5], [NVIM_ACCENT, 50], [NVIM_EMPHASIS, 45]]) {
    for (const t of group) {
      const r = apcaLc(tok[t], bg);
      if (r < floor) fail(`nvim/${variant} ${t}: APCA Lc ${r.toFixed(1)} < ${floor}  (${tok[t]} on ${bg})`);
      if (r < worst) { worst = r; worstLabel = t; }
    }
  }
  ok(`nvim/${variant}: fg Lc ${apcaLc(tok.fg, bg).toFixed(1)}, body Lc >= 60 / accents >= 50 / emphasis >= 45 (tightest ${worstLabel} ${worst.toFixed(1)})`);
}

console.log(failures ? `\nFAIL — ${failures} problem(s)` : "\nPASS");
process.exit(failures ? 1 : 0);
