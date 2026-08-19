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
      line.textContent = " ☕ it's 9:26 - the kettle's on!";
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

  function reflect(theme) {
    var dark = theme === "dark";
    btn.classList.toggle("is-dark", dark);
    // the switch advertises where a click takes you (tooltip only)
    var target = dark ? "light" : "dark";
    btn.setAttribute("aria-label", "Switch to " + target + " mode");
    btn.title = "Switch to " + target + " mode";
  }

  reflect(current());

  btn.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    reflect(next);
    // retrigger the tumble, mirrored to the direction of travel
    btn.classList.remove("is-tip-right", "is-tip-left");
    void btn.offsetWidth;
    btn.classList.add(next === "dark" ? "is-tip-right" : "is-tip-left");
  });
})();
