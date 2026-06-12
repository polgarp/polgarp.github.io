// Article enhancements: heading anchors + share-quote-on-select.
(function () {
  "use strict";

  var body = document.querySelector(".post__body");
  if (!body) return;

  // ----- Heading anchors (kramdown already provides the ids)
  body.querySelectorAll("h1[id], h2[id], h3[id]").forEach(function (h) {
    var a = document.createElement("a");
    a.className = "heading-anchor";
    a.href = "#" + h.id;
    a.textContent = "#";
    a.setAttribute("aria-label", "Link to this section");
    h.appendChild(a);
  });

  // ----- Select text → share on Mastodon
  var btn = document.createElement("button");
  btn.className = "quote-share";
  btn.type = "button";
  btn.textContent = "Share to Mastodon ↗";
  btn.hidden = true;
  document.body.appendChild(btn);

  var currentQuote = "";

  function hide() {
    btn.hidden = true;
    currentQuote = "";
  }

  function maybeShow() {
    var sel = window.getSelection();
    var text = sel ? sel.toString().trim() : "";
    if (!text || text.length < 8 || sel.rangeCount === 0) return hide();
    var range = sel.getRangeAt(0);
    if (!body.contains(range.commonAncestorContainer)) return hide();
    var rect = range.getBoundingClientRect();
    currentQuote = text;
    btn.style.top = (window.scrollY + rect.bottom + 8) + "px";
    btn.style.left = (window.scrollX + rect.left + rect.width / 2) + "px";
    btn.hidden = false;
  }

  document.addEventListener("mouseup", function () { setTimeout(maybeShow, 1); });
  document.addEventListener("keyup", function (e) {
    if (e.key === "Escape") hide();
    if (e.shiftKey || e.key === "Shift") setTimeout(maybeShow, 1);
  });
  document.addEventListener("scroll", hide, { passive: true });

  btn.addEventListener("mousedown", function (e) {
    e.preventDefault(); // keep the selection alive
    var quote = currentQuote.length > 280 ? currentQuote.slice(0, 279) + "…" : currentQuote;
    var text = "“" + quote + "”\n\n— " + document.title + "\n" + location.href;
    window.open("https://mastodonshare.com/?text=" + encodeURIComponent(text), "_blank", "noopener");
    hide();
  });
})();
