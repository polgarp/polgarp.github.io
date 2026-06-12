// Homepage topic filters: hover previews (dims non-matching entries),
// click pins the filter and collapses the feed to matching entries.
(function () {
  "use strict";

  var chips = document.querySelectorAll(".topic-chip");
  var items = document.querySelectorAll(".feed__item[data-tags]");
  var years = document.querySelectorAll(".feed__year");
  var status = document.querySelector(".topics__status");
  if (!chips.length || !items.length) return;

  var active = null;

  function matches(item, topic) {
    return item.dataset.tags.split("|").indexOf(topic) !== -1;
  }

  function apply() {
    items.forEach(function (it) {
      it.classList.remove("is-dimmed");
      it.classList.toggle("is-hidden", !!active && !matches(it, active));
    });
    years.forEach(function (y) {
      y.classList.toggle("is-hidden", !y.querySelector(".feed__item:not(.is-hidden)"));
    });
    chips.forEach(function (c) {
      var on = active === c.dataset.topic;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (!status) return;
    if (active) {
      var n = document.querySelectorAll(".feed__item:not(.is-hidden)").length;
      status.hidden = false;
      status.textContent = n + (n === 1 ? " entry" : " entries") + " tagged #" + active + " · ";
      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "topics__clear";
      clear.textContent = "clear filter";
      clear.addEventListener("click", function () {
        active = null;
        apply();
      });
      status.appendChild(clear);
    } else {
      status.hidden = true;
      status.textContent = "";
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      active = active === chip.dataset.topic ? null : chip.dataset.topic;
      apply();
    });
    chip.addEventListener("mouseenter", function () {
      if (active) return;
      items.forEach(function (it) {
        it.classList.toggle("is-dimmed", !matches(it, chip.dataset.topic));
      });
    });
    chip.addEventListener("mouseleave", function () {
      items.forEach(function (it) { it.classList.remove("is-dimmed"); });
    });
  });
})();
