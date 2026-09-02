// The precedence rule, and nothing else.
//
//   attribute  >  scoped CSS  >  engine default
//
// An illustration states its own setup in `data-illo-*` attributes, emitted by
// _includes/illustration from its profile in _data/illustrations.yml. CSS is a
// fallback for values that must answer the viewport, and is consulted ONLY for
// keys the illustration left unset.
//
// This module is pure — it takes an attribute map and a lookup function, never
// the DOM — so the rule can be tested without a browser. core.js supplies both.
//
// WHY THE ZERO SENTINEL: a custom property registered with @property resolves
// on every element in the document, whether or not any rule sets it. There is
// no "absent" to detect. So an unset property must resolve to a value this
// module rejects, and 0 is that value: no style parameter has a legitimate
// zero. Registering a property with a real initial-value silently makes the
// CSS fallback unconditional and overrides every illustration's own setup —
// which is what f716aa1 did, resizing two posts' glyphs from 11px and 15px to
// 27px. The same goes for defining an engine-readable property on :root, which
// inherits everywhere. Both are enforced by scripts/check-illustrations.mjs.
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root.Illo = root.Illo || {}).config = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var PREFIX = "data-illo-";

  // Read as structure by the Instance itself, never passed through as style.
  var RESERVED = ["render", "path", "fit", "seed"];

  function camel(kebab) {
    return kebab.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }

  function kebab(camelName) {
    return camelName.replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); });
  }

  // A usable number, or undefined. Rejects NaN (an unparseable calc() string
  // where @property is unsupported) and 0 (the unset sentinel).
  function num(raw) {
    var n = parseFloat(raw);
    if (!isFinite(n) || n === 0) return undefined;
    return n;
  }

  function resolve(attrs, cssLookup, cssReadable) {
    var opts = {};
    var name, suffix, value, n, i;

    for (name in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, name)) continue;
      if (name.indexOf(PREFIX) !== 0) continue;
      suffix = name.slice(PREFIX.length);
      if (RESERVED.indexOf(suffix) !== -1) continue;
      value = attrs[name];
      if (value === "" || value == null) continue;
      // A numeric string becomes a number; anything else stays as written, so
      // a future parameter can be a keyword without an engine change.
      n = parseFloat(value);
      opts[camel(suffix)] = (isFinite(n) && String(n) === String(value).trim())
        ? n : value;
    }

    for (i = 0; i < cssReadable.length; i++) {
      if (opts[cssReadable[i]] !== undefined) continue;   // the illustration spoke
      n = num(cssLookup("--illo-" + kebab(cssReadable[i])));
      if (n !== undefined) opts[cssReadable[i]] = n;
    }

    return opts;
  }

  return { resolve: resolve, RESERVED: RESERVED };
});
