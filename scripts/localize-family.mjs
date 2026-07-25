#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const hubDir = resolve(scriptDir, "..");
const devDir = resolve(hubDir, "..");

const sites = [
  {
    name: "Moving Truth Apps",
    directory: hubDir,
    domain: "https://apps.movingtruth.com",
    pages: ["index.html"],
  },
  {
    name: "Inner Whisper",
    directory: join(devDir, "InnerWhisperLandingPage"),
    domain: "https://inner-whisper.movingtruth.com",
    pages: ["index.html", "privacy_policy.html", "support.html"],
  },
  {
    name: "Inner Thought",
    directory: join(devDir, "InnerThoughtLandingPage"),
    domain: "https://inner-thought.movingtruth.com",
    pages: ["index.html", "privacy_policy.html", "accessibility.html", "support.html"],
  },
  {
    name: "Inner Sign",
    directory: join(devDir, "InnerSignLandingPage"),
    domain: "https://inner-sign.movingtruth.com",
    pages: ["index.html"],
  },
  {
    name: "Inner Course",
    directory: join(devDir, "InnerCourseLandingPage"),
    domain: "https://inner-course.movingtruth.com",
    pages: ["index.html"],
  },
  {
    name: "Inner Play",
    directory: join(devDir, "InnerPlayLandingPage"),
    domain: "https://inner-play.movingtruth.com",
    pages: ["index.html"],
  },
];

const localeDefinitions = {
  fr: { label: "Français", languageLabel: "Langue", dir: "ltr" },
  es: { label: "Español", languageLabel: "Idioma", dir: "ltr" },
  de: { label: "Deutsch", languageLabel: "Sprache", dir: "ltr" },
  "pt-BR": { label: "Português (Brasil)", languageLabel: "Idioma", dir: "ltr" },
  it: { label: "Italiano", languageLabel: "Lingua", dir: "ltr" },
  nl: { label: "Nederlands", languageLabel: "Taal", dir: "ltr" },
  hi: { label: "हिन्दी", languageLabel: "भाषा", dir: "ltr" },
  ar: { label: "العربية", languageLabel: "اللغة", dir: "rtl" },
  "zh-Hans": { label: "简体中文", languageLabel: "语言", dir: "ltr" },
  ja: { label: "日本語", languageLabel: "言語", dir: "ltr" },
  ko: { label: "한국어", languageLabel: "언어", dir: "ltr" },
  ru: { label: "Русский", languageLabel: "Язык", dir: "ltr" },
  th: { label: "ไทย", languageLabel: "ภาษา", dir: "ltr" },
};
const familyDomains = sites.map((site) => site.domain);
const manifest = JSON.parse(await readFile(join(hubDir, "locales", "manifest.json"), "utf8"));
const activeLocales = manifest.canonicalLocales.filter(
  (code) => code !== "en" && manifest.localeStatus[code] !== "pending"
);
const availableLocales = ["en", ...activeLocales];

async function hydrateCatalog(site, catalog) {
  if (!catalog.translationValues && !catalog.scriptTranslationValues) return catalog;

  const keyLocale = catalog.sourceKeyLocale ?? "fr";
  const keyCatalog = JSON.parse(
    await readFile(join(site.directory, "locales", `${keyLocale}.json`), "utf8")
  );
  const hydrateSection = (keys, values, section) => {
    if (!Array.isArray(values) || keys.length !== values.length) {
      throw new Error(
        `${site.name}: ${section} requires exactly ${keys.length} ordered values`
      );
    }
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  };

  return {
    translations: hydrateSection(
      Object.keys(keyCatalog.translations ?? {}),
      catalog.translationValues,
      "translationValues"
    ),
    scriptTranslations: hydrateSection(
      Object.keys(keyCatalog.scriptTranslations ?? {}),
      catalog.scriptTranslationValues,
      "scriptTranslationValues"
    ),
  };
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    bull: "•",
    copy: "©",
    gt: ">",
    hellip: "…",
    laquo: "«",
    larr: "←",
    ldquo: "“",
    lsquo: "‘",
    lt: "<",
    mdash: "—",
    middot: "·",
    nbsp: "\u00a0",
    ndash: "–",
    quot: '"',
    rarr: "→",
    raquo: "»",
    rdquo: "”",
    rsquo: "’",
    times: "×",
  };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const base = entity[1].toLowerCase() === "x" ? 16 : 10;
      const digits = base === 16 ? entity.slice(2) : entity.slice(1);
      return String.fromCodePoint(Number.parseInt(digits, base));
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function escapeText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}

function pageUrl(domain, language, page) {
  const suffix = page === "index.html" ? "" : page;
  return language === "en"
    ? `${domain}/${suffix}`
    : `${domain}/${language}/${suffix}`;
}

function localeChrome(domain, page, activeLocale) {
  const languageLabel = activeLocale === "en"
    ? "Language"
    : localeDefinitions[activeLocale].languageLabel;
  const activeLabel = activeLocale === "en"
    ? "English"
    : localeDefinitions[activeLocale].label;
  const links = availableLocales.map((code) => {
    const label = code === "en" ? "English" : localeDefinitions[code].label;
    const current = activeLocale === code ? ' aria-current="page"' : "";
    return `  <a href="${pageUrl(domain, code, page)}" lang="${code}" data-language-choice="${code}"${current}>${label}</a>`;
  }).join("\n");
  return `
<!-- family-localization:start -->
<div class="family-language">
<details>
<summary><span class="family-language__label">${languageLabel}</span><span>${activeLabel}</span></summary>
<nav class="family-language__menu" aria-label="${languageLabel}">
${links}
</nav>
</details>
</div>
<!-- family-localization:end -->`;
}

const localeStyles = `
<!-- family-localization-style:start -->
<style>
  .family-language{position:absolute;z-index:900;inset-block-start:4.75rem;inset-inline-end:1rem;color:#e8e0d0;font:600 .75rem/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .family-language details{position:relative}
  .family-language summary{min-block-size:2.6rem;display:flex;align-items:center;gap:.55rem;padding:.3rem .75rem;list-style:none;border:1px solid rgba(201,168,76,.24);border-radius:999px;background:rgba(13,13,13,.82);cursor:pointer;backdrop-filter:blur(12px)}
  .family-language summary::-webkit-details-marker{display:none}
  .family-language summary::after{content:"⌄";font-size:1rem;color:#c9a84c}
  .family-language details[open] summary::after{transform:rotate(180deg)}
  .family-language__label{position:absolute;inline-size:1px;block-size:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .family-language__menu{position:absolute;inset-block-start:calc(100% + .45rem);inset-inline-end:0;min-inline-size:12rem;max-block-size:min(65vh,28rem);overflow:auto;display:grid;gap:.2rem;padding:.4rem;border:1px solid rgba(201,168,76,.24);border-radius:16px;background:rgba(13,13,13,.97);box-shadow:0 16px 45px rgba(0,0,0,.42);backdrop-filter:blur(16px)}
  .family-language a{min-block-size:2.5rem;display:flex;align-items:center;padding:0 .7rem;border-radius:10px;color:inherit;text-decoration:none;white-space:nowrap}
  .family-language a:hover,.family-language a:focus-visible{background:rgba(201,168,76,.16);outline:2px solid transparent}
  .family-language a[aria-current="page"]{background:#c9a84c;color:#111}
  .language-suggestion{position:fixed;z-index:1100;inset-inline:50%;inset-block-end:1rem;transform:translateX(-50%);inline-size:min(calc(100% - 2rem),42rem);display:flex;align-items:center;justify-content:center;gap:.7rem;flex-wrap:wrap;padding:.8rem 1rem;border:1px solid rgba(201,168,76,.42);border-radius:16px;background:rgba(13,13,13,.96);color:#e8e0d0;font:600 .88rem/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 16px 45px rgba(0,0,0,.42);backdrop-filter:blur(16px)}
  .language-suggestion p{margin:0;color:#e8e0d0}
  .language-suggestion a,.language-suggestion button{min-block-size:2.35rem;display:inline-flex;align-items:center;padding:0 .8rem;border:1px solid rgba(201,168,76,.5);border-radius:999px;background:transparent;color:#e8e0d0;font:inherit;text-decoration:none;cursor:pointer}
  .language-suggestion a{background:#c9a84c;color:#111}
  .language-suggestion a:focus-visible,.language-suggestion button:focus-visible{outline:2px solid #f1d47a;outline-offset:2px}
  @media (max-width:700px){.family-language{inset-block-start:4.8rem;inset-inline-end:.75rem}}
</style>
<!-- family-localization-style:end -->`;

function stripGeneratedChrome(html) {
  return html
    .replace(/\n?<!-- family-localization-style:start -->[\s\S]*?<!-- family-localization-style:end -->\n?/g, "\n")
    .replace(/\n?<!-- family-localization-script:start -->[\s\S]*?<!-- family-localization-script:end -->\n?/g, "\n")
    .replace(/\n?<!-- family-localization:start -->[\s\S]*?<!-- family-localization:end -->\n?/g, "\n")
    .replace(/\n?<!-- family-localization-meta:start -->[\s\S]*?<!-- family-localization-meta:end -->\n?/g, "\n");
}

function translateTextNodes(html, translations, usage) {
  const protectedBlocks = [];
  let working = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (block) => {
    const token = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
    protectedBlocks.push(block);
    return token;
  });

  working = working.replace(/>([^<>]+)</g, (full, raw) => {
    const leading = raw.match(/^\s*/)?.[0] ?? "";
    const trailing = raw.match(/\s*$/)?.[0] ?? "";
    const decoded = decodeEntities(raw).trim().replace(/\s+/g, " ");
    const translated = translations[decoded];
    if (translated === undefined) return full;
    usage.add(decoded);
    return `>${leading}${escapeText(translated)}${trailing}<`;
  });

  working = working.replace(/\b(content|aria-label|alt|title)="([^"]*)"/g, (full, attribute, raw) => {
    const decoded = decodeEntities(raw);
    const translated = translations[decoded];
    if (translated === undefined) return full;
    usage.add(decoded);
    return `${attribute}="${escapeAttribute(translated)}"`;
  });

  return working.replace(/__PROTECTED_BLOCK_(\d+)__/g, (_, index) => protectedBlocks[Number(index)]);
}

function translateScripts(html, scriptTranslations, usage) {
  let output = html;
  for (const [source, target] of Object.entries(scriptTranslations)) {
    if (!output.includes(source)) continue;
    output = output.split(source).join(target);
    usage.add(`script:${source}`);
  }
  return output;
}

function alternateMeta(site, page, canonicalLocale) {
  const alternates = availableLocales.map(
    (code) => `<link rel="alternate" hreflang="${code}" href="${pageUrl(site.domain, code, page)}">`
  ).join("\n");
  return `
<!-- family-localization-meta:start -->
<link rel="canonical" href="${pageUrl(site.domain, canonicalLocale, page)}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${pageUrl(site.domain, "en", page)}">
<!-- family-localization-meta:end -->`;
}

function rewriteForLocale(html, site, page, locale) {
  const definition = localeDefinitions[locale];
  const htmlTag = definition.dir === "rtl"
    ? `<html$1lang="${locale}" dir="rtl"$2>`
    : `<html$1lang="${locale}"$2>`;
  let output = html
    .replace(/<html\b([^>]*)\blang="[^"]*"([^>]*)>/i, htmlTag)
    .replace(/(<meta property="og:url" content=")[^"]*(")/i, `$1${pageUrl(site.domain, locale, page)}$2`)
    .replace(/((?:src|href)=")(assets\/|styles\.css)/g, '$1../$2');

  for (const domain of familyDomains) {
    output = output.replaceAll(`href="${domain}"`, `href="${domain}/${locale}/"`);
  }

  const meta = alternateMeta(site, page, locale);
  output = output.replace(
    "</head>",
    `${meta}\n${localeStyles}\n<!-- family-localization-script:start -->\n<script src="../localization/language-preference.js" defer></script>\n<!-- family-localization-script:end -->\n</head>`
  );
  output = output.replace(/<body([^>]*)>/i, `<body$1>${localeChrome(site.domain, page, locale)}`);
  return output;
}

function addEnglishChrome(html, site, page) {
  const clean = stripGeneratedChrome(html);
  const meta = alternateMeta(site, page, "en");
  return clean
    .replace(
      "</head>",
      `${meta}\n${localeStyles}\n<!-- family-localization-script:start -->\n<script src="localization/language-preference.js" defer></script>\n<!-- family-localization-script:end -->\n</head>`
    )
    .replace(/<body([^>]*)>/i, `<body$1>${localeChrome(site.domain, page, "en")}`);
}

async function buildLocale(site, locale, cleanPages) {
  const catalogPath = join(site.directory, "locales", `${locale}.json`);
  const catalog = await hydrateCatalog(
    site,
    JSON.parse(await readFile(catalogPath, "utf8"))
  );
  const translations = catalog.translations ?? {};
  const scriptTranslations = catalog.scriptTranslations ?? {};
  const usage = new Set();

  for (const page of site.pages) {
    const clean = cleanPages.get(page);
    let localized = translateTextNodes(clean, translations, usage);
    localized = translateScripts(localized, scriptTranslations, usage);
    localized = rewriteForLocale(localized, site, page, locale);

    const outputPath = join(site.directory, locale, page);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, localized);
  }

  try {
    const script = await readFile(join(site.directory, "site.js"), "utf8");
    const localizedScript = translateScripts(script, scriptTranslations, usage);
    await writeFile(join(site.directory, locale, "site.js"), localizedScript);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const preferenceScript = (
    await readFile(join(scriptDir, "language-preference.js"), "utf8")
  ).replace(
    'var supportedLocales = ["en", "fr"];',
    `var supportedLocales = ${JSON.stringify(availableLocales)};`
  );
  const preferenceDirectory = join(site.directory, "localization");
  await mkdir(preferenceDirectory, { recursive: true });
  await writeFile(join(preferenceDirectory, "language-preference.js"), preferenceScript);

  const unused = [
    ...Object.keys(translations).filter((key) => !usage.has(key)),
    ...Object.keys(scriptTranslations).filter((key) => !usage.has(`script:${key}`)),
  ];
  if (unused.length) {
    throw new Error(`${site.name}: ${unused.length} unused translation keys:\n${unused.join("\n")}`);
  }

  console.log(`${site.name}: generated ${site.pages.length} ${locale} page(s)`);
}

for (const site of sites) {
  const cleanPages = new Map();
  for (const page of site.pages) {
    const sourcePath = join(site.directory, page);
    cleanPages.set(page, stripGeneratedChrome(await readFile(sourcePath, "utf8")));
  }
  for (const locale of activeLocales) {
    await buildLocale(site, locale, cleanPages);
  }
  for (const [page, clean] of cleanPages) {
    await writeFile(join(site.directory, page), addEnglishChrome(clean, site, page));
  }
}
