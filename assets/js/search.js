// Full-content client-side search. The index is fetched lazily on first open.
(function () {
  "use strict";

  var overlay = document.getElementById("search");
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var toggle = document.getElementById("search-toggle");
  if (!overlay || !input || !results) return;

  var index = null;
  var loading = false;
  var active = -1;

  function recent() {
    return index.slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    }).slice(0, 5).map(function (d) {
      return { d: d, title: escapeHtml(d.title), snippet: "" };
    });
  }

  function open() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    input.focus();
    if (!index && !loading) {
      loading = true;
      fetch("/search.json")
        .then(function (r) { return r.json(); })
        .then(function (data) {
          index = data;
          render(input.value ? search(input.value) : recent());
        });
    } else if (index && !input.value) {
      render(recent());
    }
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    active = -1;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function highlight(text, words) {
    var out = escapeHtml(text);
    words.forEach(function (w) {
      out = out.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
    });
    return out;
  }

  function search(query) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length || !index) return [];
    var scored = [];
    index.forEach(function (doc) {
      var title = doc.title.toLowerCase();
      var content = doc.content.toLowerCase();
      var score = 0;
      var ok = words.every(function (w) {
        var inTitle = title.indexOf(w) !== -1;
        var inBody = content.indexOf(w) !== -1;
        if (inTitle) score += 10;
        if (inBody) score += 1;
        return inTitle || inBody;
      });
      if (!ok) return;
      var pos = content.indexOf(words[0]);
      var snippet = "";
      if (pos !== -1) {
        var start = Math.max(0, pos - 50);
        snippet = (start > 0 ? "…" : "") + doc.content.slice(start, pos + 110) + "…";
      }
      scored.push({ doc: doc, score: score, snippet: snippet });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 20).map(function (s) {
      return { d: s.doc, snippet: highlight(s.snippet, words), title: highlight(s.doc.title, words) };
    });
  }

  function render(items) {
    active = -1;
    if (!items.length) {
      results.innerHTML = input.value && index
        ? '<li class="search__empty">No matches. Your pixels are in another canvas.</li>'
        : "";
      return;
    }
    results.innerHTML = items.map(function (it) {
      return '<li class="search__result"><a href="' + it.d.url + '">' +
        '<span class="search__meta">' + escapeHtml(it.d.label) + (it.d.date ? " · " + it.d.date : "") + "</span>" +
        '<span class="search__title">' + it.title + "</span>" +
        (it.snippet ? '<span class="search__snippet">' + it.snippet + "</span>" : "") +
        "</a></li>";
    }).join("");
  }

  function move(delta) {
    var links = results.querySelectorAll("a");
    if (!links.length) return;
    active = (active + delta + links.length) % links.length;
    links.forEach(function (l, i) { l.classList.toggle("is-active", i === active); });
    links[active].scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", function () {
    render(input.value ? search(input.value) : (index ? recent() : []));
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") {
      var link = results.querySelector("a.is-active") || results.querySelector("a");
      if (link) link.click();
    }
  });

  if (toggle) toggle.addEventListener("click", open);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) close();
    var typing = /^(input|textarea|select)$/i.test(document.activeElement.tagName);
    if (typing) return;
    if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) {
      e.preventDefault();
      open();
    }
  });
})();
