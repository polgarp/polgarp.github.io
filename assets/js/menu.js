// Mobile nav: the hamburger toggles the collapsed primary nav under the
// breakpoint. Desktop never runs this path (the button is display:none there).
(function () {
  "use strict";

  var btn = document.getElementById("menu-toggle");
  var nav = document.getElementById("primary-nav");
  if (!btn || !nav) return;

  function close() {
    btn.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }

  btn.addEventListener("click", function () {
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });

  // Picking a destination or pressing Escape closes the panel.
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
