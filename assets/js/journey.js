// Sticky section index: highlight the section currently in view. Anchor clicks +
// smooth scroll are handled by CSS; this only tracks the active section.
(function () {
  "use strict";

  var links = document.querySelectorAll(".area-index a");
  var sections = [].slice.call(document.querySelectorAll("#journey-top, .area[id]"));
  if (!links.length || !sections.length) return;

  // Marking the rail as JS-managed is what arms the reveal in CSS. Without it
  // the rail is plainly visible, so a failed or blocked script leaves a working
  // index rather than an empty gutter.
  var rail = links[0].closest(".area-index");
  if (rail) rail.classList.add("js-rail");

  function setCurrent(id) {
    links.forEach(function (a) { a.classList.toggle("is-current", a.dataset.target === id); });
    // The rail earns its place once the reader has left the intro.
    if (rail) rail.classList.toggle("is-revealed", id !== "journey-top");
  }

  // The current section is the last one whose top has crossed a line ~35% down
  // the viewport. Works at the very top (intro) and through the page.
  function update() {
    var line = window.innerHeight * 0.35;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) current = sections[i];
      else break;
    }
    setCurrent(current.id);
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { update(); ticking = false; }); }
  }

  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
