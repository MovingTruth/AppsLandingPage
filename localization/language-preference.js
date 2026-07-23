(function () {
  "use strict";

  var supportedLocales = ["en", "fr"];
  var defaultLocale = "en";
  var storageKey = "moving-truth-language";
  var localeLinks = document.querySelectorAll(".family-language a[lang]");
  var currentLocale = document.documentElement.lang || defaultLocale;

  function remember(locale) {
    if (!supportedLocales.includes(locale)) return;
    try {
      window.localStorage.setItem(storageKey, locale);
    } catch (error) {
      // A blocked or unavailable preference store must never interrupt the page.
    }
  }

  localeLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      remember(link.getAttribute("lang"));
    });
  });

  // A localized URL is an intentional choice, including a link from another
  // Moving Truth site. Remember it without redirecting anywhere.
  if (currentLocale !== defaultLocale && supportedLocales.includes(currentLocale)) {
    remember(currentLocale);
    return;
  }

  var savedLocale = null;
  try {
    savedLocale = window.localStorage.getItem(storageKey);
  } catch (error) {
    // Continue with browser-language detection.
  }

  function resolveBrowserLocale() {
    var requested = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || defaultLocale];

    for (var index = 0; index < requested.length; index += 1) {
      var tag = String(requested[index]).toLowerCase();
      if (tag === "fr" || tag.startsWith("fr-")) return "fr";
      if (tag === "en" || tag.startsWith("en-")) return "en";
    }
    return defaultLocale;
  }

  var preferredLocale = supportedLocales.includes(savedLocale)
    ? savedLocale
    : resolveBrowserLocale();

  if (preferredLocale === currentLocale || preferredLocale === defaultLocale) return;

  var preferredLink = document.querySelector(
    '.family-language a[lang="' + preferredLocale + '"]'
  );
  if (!preferredLink) return;

  var suggestion = document.createElement("aside");
  suggestion.className = "language-suggestion";
  suggestion.setAttribute("aria-label", "Language suggestion");

  var message = document.createElement("p");
  message.lang = "fr";
  message.textContent = "Cette page est disponible en français.";

  var accept = document.createElement("a");
  accept.href = preferredLink.href;
  accept.lang = "fr";
  accept.textContent = "Lire en français";
  accept.addEventListener("click", function () {
    remember(preferredLocale);
  });

  var decline = document.createElement("button");
  decline.type = "button";
  decline.textContent = "Stay in English";
  decline.addEventListener("click", function () {
    remember(defaultLocale);
    suggestion.remove();
  });

  suggestion.appendChild(message);
  suggestion.appendChild(accept);
  suggestion.appendChild(decline);
  document.body.appendChild(suggestion);
})();
