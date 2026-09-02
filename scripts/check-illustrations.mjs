#!/usr/bin/env node
// Guards the three structural invariants that keep one illustration from
// changing another. Run after `bundle exec jekyll build`:
//
//   node scripts/check-illustrations.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CSS = "_site/assets/css/main.css";
const SITE = "_site";
const failures = [];

const css = readFileSync(CSS, "utf8");
const rules = css.replace(/\n/g, "").split("}");

// ---- 1. Every registered custom property uses a sentinel initial-value.
//
// A registered property resolves on EVERY element in the document, so a real
// initial-value makes the engine's CSS fallback unconditional and overrides
// each illustration's own setup. Zero is the only value config.js rejects.
let registered = 0;
for (const [, name, body] of css.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
  registered++;
  const initial = /initial-value:\s*([^;]+)/.exec(body)?.[1].trim();
  if (initial === undefined) {
    failures.push(`${name}: no initial-value; @property needs one for a non-universal syntax`);
  } else if (parseFloat(initial) !== 0) {
    failures.push(
      `${name}: initial-value is "${initial}", must be a zero sentinel.\n` +
      `    A registered property resolves on every element, so a non-zero initial\n` +
      `    value silently overrides every illustration's own setup.`
    );
  }
}
if (registered === 0) failures.push(`no @property blocks found in ${CSS} — did the build run?`);

// ---- 2. No engine-readable property is defined on :root.
//
// :root inherits to every element, which is the same defect wearing a
// different name. Only the colour tokens readTokens() consumes may live there.
const COLOUR_TOKENS = ["--illo-ink", "--illo-accent"];
for (const rule of rules) {
  const [selector, body] = rule.split("{");
  if (!selector || !body) continue;
  if (!/(^|,)\s*:root\s*$/.test(selector.trim())) continue;
  for (const [, prop] of body.matchAll(/(--illo-[\w-]+)\s*:/g)) {
    if (!COLOUR_TOKENS.includes(prop)) {
      failures.push(
        `${prop} is defined on :root, so it inherits to every element.\n` +
        `    Move it to the selector of the illustration that needs it.`
      );
    }
  }
}

// ---- 3. Every figure declares its own pitch.
//
// An illustration relying on an implicit default is one another illustration's
// stylesheet can reach. The background layer is exempt: its pitch is derived
// from type metrics in .illo--bg on purpose.
function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (entry.endsWith(".html")) yield path;
  }
}

let figures = 0;
for (const file of htmlFiles(SITE)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes("data-illo=")) continue;
  for (const [tag] of html.matchAll(/<(?:figure|div)[^>]*data-illo=[^>]*>/g)) {
    figures++;
    if (tag.includes("illo--bg")) continue;
    if (!/data-illo-cell="[^"]+"/.test(tag)) {
      failures.push(`${file}: a figure declares no data-illo-cell, so its pitch is an implicit default`);
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} illustration config violation(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ ${registered} registered properties use sentinels; :root is clean; ${figures} figures declare their own setup`);
