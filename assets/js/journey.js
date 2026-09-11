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
    links.forEach(function (a) {
      var current = a.dataset.target === id;
      a.classList.toggle("is-current", current);
      // The class only carries colour, which says nothing to a screen reader.
      if (current) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
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

// Focus rescue: a link inside a chapter can be focused while sitting under the
// pinned chapter head. The browser sees it inside the viewport and so has no
// reason to scroll, and it knows nothing about the overlay on top of it — the
// focused element and its outline end up completely hidden. scroll-margin-top
// handles the case where a scroll does happen; this handles the case where one
// does not. WCAG 2.4.11 Focus Not Obscured.
(function () {
  "use strict";

  var journey = document.querySelector(".journey");
  if (!journey) return;

  document.addEventListener("focusin", function (event) {
    var target = event.target;
    if (!journey.contains(target)) return;

    var area = target.closest(".area");
    if (!area) return;

    var head = area.querySelector(".area__head");
    // Below the sticky breakpoint the head is `relative` and covers nothing.
    if (!head || window.getComputedStyle(head).position !== "sticky") return;

    var headBox = head.getBoundingClientRect();
    var targetBox = target.getBoundingClientRect();
    var overlaps = targetBox.top < headBox.bottom && targetBox.bottom > headBox.top;
    if (!overlaps) return;

    // Move the page, not the element: scroll so the focused thing clears the
    // head's lower edge with a little room to read against.
    window.scrollBy({
      top: targetBox.top - headBox.bottom - 12,
      behavior: "instant"
    });
  });
})();
