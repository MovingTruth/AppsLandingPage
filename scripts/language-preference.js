(function () {
  "use strict";

  var supportedLocales = ["en", "fr"];
  var defaultLocale = "en";
  var storageKey = "moving-truth-language";
  var localeSuggestions = {
    fr: {
      ariaLabel: "Suggestion de langue",
      message: "Cette page est aussi disponible en français.",
      accept: "Lire en français"
    },
    es: {
      ariaLabel: "Sugerencia de idioma",
      message: "Esta página también está disponible en español.",
      accept: "Leer en español"
    },
    de: {
      ariaLabel: "Sprachvorschlag",
      message: "Diese Seite ist auch auf Deutsch verfügbar.",
      accept: "Auf Deutsch lesen"
    },
    "pt-BR": {
      ariaLabel: "Sugestão de idioma",
      message: "Esta página também está disponível em português.",
      accept: "Ler em português"
    },
    it: {
      ariaLabel: "Suggerimento per la lingua",
      message: "Questa pagina è disponibile anche in italiano.",
      accept: "Leggi in italiano"
    },
    nl: {
      ariaLabel: "Taalsuggestie",
      message: "Deze pagina is ook beschikbaar in het Nederlands.",
      accept: "Lees in het Nederlands"
    },
    hi: {
      ariaLabel: "भाषा का सुझाव",
      message: "यह पेज हिन्दी में भी उपलब्ध है।",
      accept: "हिन्दी में पढ़ें"
    },
    ar: {
      ariaLabel: "اقتراح اللغة",
      message: "هذه الصفحة متاحة أيضًا باللغة العربية.",
      accept: "اقرأ بالعربية"
    },
    "zh-Hans": {
      ariaLabel: "语言建议",
      message: "此页面也提供简体中文版本。",
      accept: "阅读简体中文版"
    },
    ja: {
      ariaLabel: "言語の提案",
      message: "このページは日本語でもご覧いただけます。",
      accept: "日本語で読む"
    },
    ko: {
      ariaLabel: "언어 제안",
      message: "이 페이지는 한국어로도 제공됩니다.",
      accept: "한국어로 읽기"
    },
    ru: {
      ariaLabel: "Предложение языка",
      message: "Эта страница также доступна на русском языке.",
      accept: "Читать на русском"
    },
    th: {
      ariaLabel: "คำแนะนำภาษา",
      message: "หน้านี้มีให้บริการเป็นภาษาไทยด้วย",
      accept: "อ่านเป็นภาษาไทย"
    }
  };
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
      var resolved = defaultLocale;

      if (tag === "fr" || tag.startsWith("fr-")) resolved = "fr";
      else if (tag === "es" || tag.startsWith("es-")) resolved = "es";
      else if (tag === "de" || tag.startsWith("de-")) resolved = "de";
      else if (tag === "pt" || tag.startsWith("pt-")) resolved = "pt-BR";
      else if (tag === "it" || tag.startsWith("it-")) resolved = "it";
      else if (tag === "nl" || tag.startsWith("nl-")) resolved = "nl";
      else if (tag === "hi" || tag.startsWith("hi-")) resolved = "hi";
      else if (tag === "ar" || tag.startsWith("ar-")) resolved = "ar";
      else if (
        tag === "zh-hans" ||
        tag.startsWith("zh-hans-") ||
        tag === "zh-cn" ||
        tag.startsWith("zh-cn-") ||
        tag === "zh-sg" ||
        tag.startsWith("zh-sg-")
      ) resolved = "zh-Hans";
      else if (tag === "ja" || tag.startsWith("ja-")) resolved = "ja";
      else if (tag === "ko" || tag.startsWith("ko-")) resolved = "ko";
      else if (tag === "ru" || tag.startsWith("ru-")) resolved = "ru";
      else if (tag === "th" || tag.startsWith("th-")) resolved = "th";
      else if (tag === "en" || tag.startsWith("en-")) resolved = "en";

      if (supportedLocales.includes(resolved)) return resolved;
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
  var suggestionCopy = localeSuggestions[preferredLocale];
  if (!suggestionCopy) return;

  var suggestion = document.createElement("aside");
  suggestion.className = "language-suggestion";
  suggestion.setAttribute("aria-label", suggestionCopy.ariaLabel);

  var message = document.createElement("p");
  message.lang = preferredLocale;
  message.textContent = suggestionCopy.message;

  var accept = document.createElement("a");
  accept.href = preferredLink.href;
  accept.lang = preferredLocale;
  accept.textContent = suggestionCopy.accept;
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
