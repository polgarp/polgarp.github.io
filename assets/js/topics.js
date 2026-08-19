// Homepage topic filters. Hovering a chip previews its reach across both the
// Lately block and the archive; clicking pins it. The newest entries live only
// in Lately while nothing is filtered, so choosing a topic merges them back into
// the list they belong to — animated, because they move rather than vanish.
// The active topic lives in the URL, so a view can be shared and Back undoes it.
(function () {
  "use strict";

  var chips = document.querySelectorAll(".topic-chip");
  var items = document.querySelectorAll(".feed__item[data-tags]");
  var years = document.querySelectorAll(".feed__year");
  var status = document.querySelector(".topics__status");
  var wrap = document.getElementById("feed");
  var lately = document.querySelector(".lately");
  var latelyItems = lately ? lately.querySelectorAll(".lately__item") : [];
  if (!chips.length || !items.length) return;

  var active = null;

  function matches(el, chip) {
    var tags = (el.dataset.tags || "").split("|");
    return chip.dataset.topic.split("|").some(function (t) {
      return tags.indexOf(t) !== -1;
    });
  }

  // Year labels carry a count baked at build time, which stops being true the
  // moment a filter runs. Recompute from whatever that group is showing.
  function retallyYears() {
    years.forEach(function (y) {
      var count = 0;
      y.querySelectorAll(".feed__item").forEach(function (it) {
        if (it.classList.contains("is-hidden")) return;
        if (!active && it.classList.contains("is-lately")) return;
        count += 1;
      });
      var label = y.querySelector(".feed__year-count");
      if (label) label.textContent = "▪ " + count + (count === 1 ? " entry" : " entries");
      y.classList.toggle("is-hidden", count === 0);
    });
  }

  function setState(opts) {
    items.forEach(function (it) {
      it.classList.remove("is-dimmed");
      it.classList.toggle("is-hidden", !!active && !matches(it, active));
    });
    latelyItems.forEach(function (li) { li.classList.remove("is-dimmed"); });
    chips.forEach(function (c) {
      var on = active === c;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (wrap) wrap.classList.toggle("is-filtered", !!active);
    // The collapse owns `hidden` while it runs, so it isn't yanked mid-transition.
    if (lately && !(opts && opts.keepLately)) lately.hidden = !!active;
    retallyYears();
    writeStatus();
  }

  function writeStatus() {
    if (!status) return;
    if (!active) {
      status.hidden = true;
      status.textContent = "";
      return;
    }
    var n = document.querySelectorAll(".feed__item:not(.is-hidden)").length;
    status.hidden = false;
    status.textContent = n + (n === 1 ? " entry" : " entries") +
      " about #" + active.dataset.label + " · ";
    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "topics__clear";
    clear.textContent = "clear filter";
    clear.addEventListener("click", function () { select(null, true); });
    status.appendChild(clear);
  }

  // The block folds into the list rather than blinking out. Nothing meaningfully
  // moves — the rows land within a few pixels of the cards they replace — so the
  // motion is the collapse itself, with the arriving rows settling in behind it.
  var collapseTimer = null;

  function animateMerge(nextActive) {
    var reduce = false;
    try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    if (!lately) return { before: function () {}, after: function () {} };

    var closing = !!nextActive && !lately.hidden;
    var opening = !nextActive && lately.hidden;

    return {
      before: function () {
        window.clearTimeout(collapseTimer);
        if (opening) {
          // Unhide first so the expansion has something to lay out.
          lately.hidden = false;
          lately.classList.add("is-collapsed");
          void lately.offsetHeight;
        }
      },
      after: function (arriving) {
        if (reduce) {
          lately.classList.remove("is-collapsed");
          lately.hidden = !!nextActive;
          return;
        }
        if (closing) {
          lately.classList.add("is-collapsed");
          collapseTimer = window.setTimeout(function () {
            lately.hidden = true;
            lately.classList.remove("is-collapsed");
          }, 420);
        } else if (opening) {
          requestAnimationFrame(function () {
            lately.classList.remove("is-collapsed");
          });
        }

        if (!arriving.length) return;
        arriving.forEach(function (row) { row.classList.add("is-arriving"); });
        // A single rAF gets batched into the same style recalc, so the browser
        // never sees the start state and no transition runs. Force the read.
        void wrap.offsetHeight;
        requestAnimationFrame(function () {
          arriving.forEach(function (row, i) {
            row.style.transitionDelay = (i * 45) + "ms";
            row.classList.add("is-arrived");
          });
        });
        window.setTimeout(function () {
          arriving.forEach(function (row) {
            row.style.transitionDelay = "";
            row.classList.remove("is-arriving", "is-arrived");
          });
        }, 280 + arriving.length * 45 + 80);
      }
    };
  }

  function select(chip, push) {
    var anim = animateMerge(chip);
    anim.before();
    active = chip;
    setState({ keepLately: true });
    var arriving = [];
    if (active && wrap) {
      wrap.querySelectorAll(".feed__item.is-lately").forEach(function (row) {
        if (!row.classList.contains("is-hidden")) arriving.push(row);
      });
    }
    anim.after(arriving);
    writeUrl(push !== false);
  }

  // A user-driven change pushes, so Back steps out of the filter instead of
  // leaving the page. Restoring from the URL on load replaces, so the reader's
  // first Back still takes them where they came from.
  function writeUrl(push) {
    if (!window.history || !history.pushState) return;
    var url = location.pathname;
    if (active) url += "?topic=" + encodeURIComponent(active.dataset.label);
    var state = { topic: active ? active.dataset.label : null };
    if (push) history.pushState(state, "", url);
    else history.replaceState(state, "", url);
  }

  function chipByLabel(label) {
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].dataset.label === label) return chips[i];
    }
    return null;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      select(active === chip ? null : chip, true);
    });
    chip.addEventListener("mouseenter", function () {
      if (active) return;
      items.forEach(function (it) {
        it.classList.toggle("is-dimmed", !matches(it, chip));
      });
      latelyItems.forEach(function (li) {
        li.classList.toggle("is-dimmed", !matches(li, chip));
      });
    });
    chip.addEventListener("mouseleave", function () {
      items.forEach(function (it) { it.classList.remove("is-dimmed"); });
      latelyItems.forEach(function (li) { li.classList.remove("is-dimmed"); });
    });
  });

  function readUrl() {
    var m = /[?&]topic=([^&]+)/.exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  window.addEventListener("popstate", function () {
    var label = readUrl();
    active = label ? chipByLabel(label) : null;
    setState();
  });

  var initial = readUrl();
  if (initial) {
    var startChip = chipByLabel(initial);
    if (startChip) { active = startChip; setState(); writeUrl(false); }
  }
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
