// Homepage topic chips: hovering a topic spotlights matching entries.
(function () {
  "use strict";

  var chips = document.querySelectorAll(".topic-chip");
  var items = document.querySelectorAll(".feed__item[data-tags]");
  if (!chips.length || !items.length) return;

  function clear() {
    items.forEach(function (it) { it.classList.remove("is-dimmed"); });
  }

  chips.forEach(function (chip) {
    function spotlight() {
      var topic = chip.dataset.topic;
      items.forEach(function (it) {
        var match = it.dataset.tags.split("|").indexOf(topic) !== -1;
        it.classList.toggle("is-dimmed", !match);
      });
    }
    chip.addEventListener("mouseenter", spotlight);
    chip.addEventListener("focus", spotlight);
    chip.addEventListener("mouseleave", clear);
    chip.addEventListener("blur", clear);
  });
})();
