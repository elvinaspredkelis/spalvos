#!/usr/bin/env bun
/*
 * Verify LEGIBILITY in the TUI ports — the companion to verify-palette.mjs.
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

console.log(failures ? `\nFAIL — ${failures} problem(s)` : "\nPASS");
process.exit(failures ? 1 : 0);
