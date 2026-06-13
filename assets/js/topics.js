// Homepage topic filters: hover previews (dims non-matching entries),
// click pins the filter and collapses the feed to matching entries.
(function () {
  "use strict";

  var chips = document.querySelectorAll(".topic-chip");
  var items = document.querySelectorAll(".feed__item[data-tags]");
  var years = document.querySelectorAll(".feed__year");
  var status = document.querySelector(".topics__status");
  if (!chips.length || !items.length) return;

  var active = null; // the active chip element

  function matches(item, chip) {
    var itemTags = item.dataset.tags.split("|");
    return chip.dataset.topic.split("|").some(function (t) {
      return itemTags.indexOf(t) !== -1;
    });
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
      var on = active === c;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (!status) return;
    if (active) {
      var n = document.querySelectorAll(".feed__item:not(.is-hidden)").length;
      status.hidden = false;
      status.textContent = n + (n === 1 ? " entry" : " entries") + " about #" + active.dataset.label + " · ";
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
      active = active === chip ? null : chip;
      apply();
    });
    chip.addEventListener("mouseenter", function () {
      if (active) return;
      items.forEach(function (it) {
        it.classList.toggle("is-dimmed", !matches(it, chip));
      });
    });
    chip.addEventListener("mouseleave", function () {
      items.forEach(function (it) { it.classList.remove("is-dimmed"); });
    });
  });
})();

// j / k navigation. On a feed page it focuses the next/previous entry link
// (Enter opens it). On a Blog/9am26 post it jumps to the neighbouring post in
// the same feed order. Additive to Tab; ignores inputs and the search dialog.
(function () {
  "use strict";

  var feed = document.querySelector(".feed");
  var article = document.querySelector("[data-post-next], [data-post-prev]");
  if (!feed && !article) return;

  function links() {
    return Array.prototype.slice.call(
      document.querySelectorAll(".feed__item:not(.is-hidden) .feed__title a")
    );
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "j" && e.key !== "k") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (document.activeElement || {}).tagName;
    if (/^(input|textarea|select)$/i.test(tag)) return;
    var overlay = document.getElementById("search");
    if (overlay && !overlay.hidden) return; // the dialog owns the keyboard

    if (feed) {
      var list = links();
      if (!list.length) return;
      e.preventDefault();
      var i = list.indexOf(document.activeElement);
      if (e.key === "j") {
        i = i < 0 ? 0 : Math.min(list.length - 1, i + 1);
      } else {
        i = i <= 0 ? 0 : i - 1;
      }
      list[i].focus();
    } else {
      // within a post: j → next (older), k → previous (newer)
      var url = e.key === "j"
        ? article.getAttribute("data-post-next")
        : article.getAttribute("data-post-prev");
      if (url) {
        e.preventDefault();
        location.href = url;
      }
    }
  });
})();
