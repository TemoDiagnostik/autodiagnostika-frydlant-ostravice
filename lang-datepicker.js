
document.addEventListener("DOMContentLoaded", function () {
  let lang = document.documentElement.lang || 'cs';
  flatpickr("#datepicker", {
    dateFormat: "d.m.Y",
    locale: lang === "de" ? "de" : lang === "en" ? "en" : "cs",
    disableMobile: true
  });
});
