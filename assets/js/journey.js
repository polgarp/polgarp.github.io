// Sticky area index: highlight the area currently in view. Anchor clicks +
// smooth scroll are handled by CSS; this only tracks the active section.
(function () {
  "use strict";

  var links = document.querySelectorAll(".area-index a");
  var areas = document.querySelectorAll(".area[id]");
  if (!links.length || !areas.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  links.forEach(function (a) { byId[a.dataset.target] = a; });

  function setCurrent(id) {
    links.forEach(function (a) { a.classList.toggle("is-current", a.dataset.target === id); });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && byId[e.target.id]) setCurrent(e.target.id);
    });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

  areas.forEach(function (a) { io.observe(a); });
})();
