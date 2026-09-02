const test = require("node:test");
const assert = require("node:assert");
const config = require("../assets/js/illustration/config.js");

const CSS_READABLE = ["cell", "base", "arrive", "markScale", "fadeTop", "fadeBottom"];
const noCss = () => "";

test("attribute wins over CSS", () => {
  const opts = config.resolve({ "data-illo-cell": "8" }, () => "20px", CSS_READABLE);
  assert.strictEqual(opts.cell, 8);
});

test("CSS is used when the attribute is absent", () => {
  const opts = config.resolve({}, () => "20px", CSS_READABLE);
  assert.strictEqual(opts.cell, 20);
});

test("a CSS value of zero means unset, not zero", () => {
  // The regression: @property --illo-density had initial-value 20px, so an
  // unset property resolved to a real number and overrode every attribute.
  const opts = config.resolve({}, () => "0px", CSS_READABLE);
  assert.strictEqual(opts.cell, undefined);
});

test("an unparseable CSS value is ignored, not taken literally", () => {
  // Where @property is unsupported the raw calc() string arrives instead.
  const opts = config.resolve({}, () => "calc(1rem * 0.285)", CSS_READABLE);
  assert.strictEqual(opts.cell, undefined);
});

test("kebab attributes become camelCase keys", () => {
  const opts = config.resolve({ "data-illo-mark-scale": "0.7" }, noCss, CSS_READABLE);
  assert.strictEqual(opts.markScale, 0.7);
});

test("camelCase keys are looked up as kebab custom properties", () => {
  const seen = [];
  config.resolve({}, (name) => { seen.push(name); return ""; }, ["markScale"]);
  assert.ok(seen.includes("--illo-mark-scale"));
});

test("structural attributes are not style options", () => {
  const opts = config.resolve(
    { "data-illo-path": "M0 0 H10", "data-illo-seed": "4", "data-illo-render": "sift" },
    noCss, CSS_READABLE
  );
  assert.strictEqual(opts.path, undefined);
  assert.strictEqual(opts.seed, undefined);
  assert.strictEqual(opts.render, undefined);
});

test("unknown parameters pass through without an engine change", () => {
  const opts = config.resolve({ "data-illo-future-knob": "3" }, noCss, CSS_READABLE);
  assert.strictEqual(opts.futureKnob, 3);
});

test("non-numeric attribute values stay strings", () => {
  const opts = config.resolve({ "data-illo-mood": "brisk" }, noCss, CSS_READABLE);
  assert.strictEqual(opts.mood, "brisk");
});

test("CSS is only consulted for declared readable keys", () => {
  const opts = config.resolve({}, () => "5", ["cell"]);
  assert.strictEqual(opts.cell, 5);
  assert.strictEqual(opts.base, undefined);
});

test("an empty attribute does not shadow CSS", () => {
  // The include emits nothing for an absent profile key; if it ever emits an
  // empty string, that must still mean "ask the stylesheet".
  const opts = config.resolve({ "data-illo-cell": "" }, () => "20px", CSS_READABLE);
  assert.strictEqual(opts.cell, 20);
});
