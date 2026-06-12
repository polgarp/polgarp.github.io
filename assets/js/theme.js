// Dark/light toggle. The no-flash bootstrap lives inline in head.html.
(function () {
  "use strict";

  console.log("%c[P%c  black, red, white & monospace. Hello, fellow source-reader.",
    "color:#e00000;font-weight:bold", "");

  // The 9:26 club: one minute a day, the footer notices.
  function club() {
    var now = new Date();
    var open = now.getHours() === 9 && now.getMinutes() === 26;
    var line = document.querySelector(".footer__club");
    if (open && !line) {
      line = document.createElement("p");
      line.className = "footer__club";
      line.textContent = "it's 9:26 — drink up ☕";
      var footer = document.querySelector(".footer__inner");
      if (footer) footer.appendChild(line);
    } else if (!open && line) {
      line.remove();
    }
  }
  club();
  setInterval(club, 20000);

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
