// Type "bauhaus" anywhere (outside a text field) and the primary triad flashes
// across the page for a couple of seconds, then settles back. Pure easter egg.
(function () {
  "use strict";

  var word = "bauhaus";
  var buf = "";
  var active = false;

  document.addEventListener("keydown", function (e) {
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (document.activeElement || {}).tagName;
    if (/^(input|textarea|select)$/i.test(tag)) return;
    buf = (buf + e.key.toLowerCase()).slice(-word.length);
    if (buf === word && !active) flash();
  });

  function flash() {
    active = true;
    var el = document.createElement("div");
    el.className = "bauhaus";
    el.setAttribute("aria-hidden", "true");
    // shape → colour per the Bauhaus/Kandinsky assignment: triangle yellow,
    // square red, circle blue.
    ["bauhaus__tri", "bauhaus__sq", "bauhaus__ci"].forEach(function (c) {
      var s = document.createElement("span");
      s.className = c;
      el.appendChild(s);
    });
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () { el.classList.remove("is-in"); }, 1600);
    setTimeout(function () { el.remove(); active = false; }, 2000);
  }
})();
