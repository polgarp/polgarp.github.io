// Dark/light toggle. The no-flash bootstrap lives inline in head.html.
(function () {
  "use strict";

  console.log("%c[P%c  black, red, white & monospace. Hello, fellow source-reader.",
    "color:#e00000;font-weight:bold", "");

  var btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function current() {
    return document.documentElement.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  function syncGiscus(theme) {
    var frame = document.querySelector("iframe.giscus-frame");
    if (frame) {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: theme === "dark" ? "dark" : "light" } } },
        "https://giscus.app"
      );
    }
  }

  function reflect(theme) {
    btn.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  }

  reflect(current());

  btn.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    reflect(next);
    syncGiscus(next);
  });

  // If a stored theme overrides the OS preference, align giscus once it loads.
  var stored = localStorage.getItem("theme");
  if (stored) {
    var tries = 0;
    var timer = setInterval(function () {
      if (document.querySelector("iframe.giscus-frame") || ++tries > 20) {
        clearInterval(timer);
        syncGiscus(stored);
      }
    }, 500);
  }
})();
