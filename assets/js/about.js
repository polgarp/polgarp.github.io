// "Beyond work" chips: hovering/focusing a chip swaps the shared caption to its
// note; leaving restores the default line. Note text is in data-note (and the
// default in data-default), so it's all present for assistive tech too.
(function () {
  "use strict";

  var caption = document.querySelector(".beyond__caption");
  var chips = document.querySelectorAll(".beyond__chip");
  if (!caption || !chips.length) return;

  var def = caption.dataset.default;

  chips.forEach(function (chip) {
    function show() { caption.textContent = chip.dataset.note; chip.classList.add("is-active"); }
    function reset() { caption.textContent = def; chip.classList.remove("is-active"); }
    chip.addEventListener("mouseenter", show);
    chip.addEventListener("focus", show);
    chip.addEventListener("mouseleave", reset);
    chip.addEventListener("blur", reset);
  });
})();
