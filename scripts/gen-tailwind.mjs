#!/usr/bin/env bun
/*
 * Generate the two Tailwind packaging variants from the canon (../spalvos.css),
 * so there is ONE source of primitives — the variants never drift by hand.
 *
 *   namespaced-spalvos.css  — adds spalvos alongside Tailwind's defaults, every
 *                             token prefixed `spalvos-` (→ bg-spalvos-blue-500).
 *   overridden-spalvos.css  — wipes Tailwind's default palette (`--color-*:
 *                             initial`) so spalvos is the only palette (→ bg-blue-500).
 *
 * Run: `bun scripts/gen-tailwind.mjs`  (verify-palette.mjs asserts they're in sync).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const header = (name) =>
  `/* ${name} — GENERATED from ../spalvos.css by scripts/gen-tailwind.mjs. Do not edit; regenerate. */\n`;

export const buildNamespaced = (canon) =>
  header("namespaced-spalvos.css") +
  "@import 'tailwindcss';\n\n" +
  canon.trimEnd().replaceAll("--color-", "--color-spalvos-") +
  "\n";

export const buildOverridden = (canon) => {
  const reset =
    "@theme static {\n" +
    "  /* Replace Tailwind's default palette entirely — spalvos is the only palette. */\n" +
    "  --color-*: initial;\n" +
    "  --color-white: #fff;\n" +
    "  --color-black: #000;\n";
  return (
    header("overridden-spalvos.css") +
    "@import 'tailwindcss';\n\n" +
    canon.trimEnd().replace("@theme static {", reset) +
    "\n"
  );
};

// The interactive playground: the static template with the overridden variant
// inlined into its <style type="text/tailwindcss"> block, so its palette is the
// same single source as everything else.
export const buildPlayground = (canon, template) =>
  template.replace("/*__SPALVOS_CSS__*/", () => "\n" + buildOverridden(canon) + "  ");

if (import.meta.main) {
  const canon = readFileSync(join(ROOT, "spalvos.css"), "utf8");
  const template = readFileSync(join(ROOT, "scripts/playground.template.html"), "utf8");
  writeFileSync(join(ROOT, "tailwind/namespaced-spalvos.css"), buildNamespaced(canon));
  writeFileSync(join(ROOT, "tailwind/overridden-spalvos.css"), buildOverridden(canon));
  writeFileSync(join(ROOT, "tailwind/playground.html"), buildPlayground(canon, template));
  console.log("Wrote tailwind/namespaced-spalvos.css, overridden-spalvos.css, playground.html");
}
