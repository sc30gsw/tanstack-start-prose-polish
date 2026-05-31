(function () {
  function setAll(open) {
    document.querySelectorAll("details").forEach(function (d) {
      d.open = open;
    });
  }
  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "q") {
      var q = e.target.value.trim().toLowerCase();
      document.querySelectorAll("[data-search]").forEach(function (el) {
        var hit = !q || (el.getAttribute("data-search") || "").indexOf(q) > -1;
        el.style.display = hit ? "" : "none";
      });
    }
  });
  document.addEventListener("click", function (e) {
    if (!e.target) return;
    if (e.target.id === "expand-all") setAll(true);
    if (e.target.id === "collapse-all") setAll(false);
  });
})();
