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
    pages: ["index.html", "privacy_policy.html", "support.html"],
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

const locale = "fr";
const localeName = "Français";
const familyDomains = sites.map((site) => site.domain);

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
  const enUrl = pageUrl(domain, "en", page);
  const frUrl = pageUrl(domain, locale, page);
  const englishCurrent = activeLocale === "en" ? ' aria-current="page"' : "";
  const frenchCurrent = activeLocale === locale ? ' aria-current="page"' : "";
  return `
<!-- family-localization:start -->
<nav class="family-language" aria-label="${activeLocale === "fr" ? "Langue" : "Language"}">
  <span>${activeLocale === "fr" ? "Langue" : "Language"}</span>
  <a href="${enUrl}" lang="en" data-language-choice="en"${englishCurrent}>English</a>
  <a href="${frUrl}" lang="fr" data-language-choice="fr"${frenchCurrent}>Français</a>
</nav>
<!-- family-localization:end -->`;
}

const localeStyles = `
<!-- family-localization-style:start -->
<style>
  .family-language{position:fixed;z-index:1000;inset-block-start:.75rem;inset-inline-end:.75rem;display:flex;align-items:center;gap:.45rem;padding:.42rem .55rem;border:1px solid rgba(201,168,76,.32);border-radius:999px;background:rgba(13,13,13,.88);color:#e8e0d0;font:600 .75rem/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;backdrop-filter:blur(14px)}
  .family-language span{color:#b6aa96}
  .family-language a{min-block-size:2rem;display:inline-flex;align-items:center;padding:0 .55rem;border-radius:999px;color:inherit;text-decoration:none}
  .family-language a:hover,.family-language a:focus-visible{background:rgba(201,168,76,.16);outline:2px solid transparent}
  .family-language a[aria-current="page"]{background:#c9a84c;color:#111}
  .language-suggestion{position:fixed;z-index:1100;inset-inline:50%;inset-block-end:1rem;transform:translateX(-50%);inline-size:min(calc(100% - 2rem),42rem);display:flex;align-items:center;justify-content:center;gap:.7rem;flex-wrap:wrap;padding:.8rem 1rem;border:1px solid rgba(201,168,76,.42);border-radius:16px;background:rgba(13,13,13,.96);color:#e8e0d0;font:600 .88rem/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 16px 45px rgba(0,0,0,.42);backdrop-filter:blur(16px)}
  .language-suggestion p{margin:0;color:#e8e0d0}
  .language-suggestion a,.language-suggestion button{min-block-size:2.35rem;display:inline-flex;align-items:center;padding:0 .8rem;border:1px solid rgba(201,168,76,.5);border-radius:999px;background:transparent;color:#e8e0d0;font:inherit;text-decoration:none;cursor:pointer}
  .language-suggestion a{background:#c9a84c;color:#111}
  .language-suggestion a:focus-visible,.language-suggestion button:focus-visible{outline:2px solid #f1d47a;outline-offset:2px}
  @media (max-width:700px){.family-language{position:absolute;inset-block-start:.45rem;inset-inline-end:.45rem}.family-language span{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}}
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

function rewriteForLocale(html, site, page) {
  let output = html
    .replace(/<html\b([^>]*)\blang="[^"]*"([^>]*)>/i, '<html$1lang="fr"$2>')
    .replace(/(<meta property="og:url" content=")[^"]*(")/i, `$1${pageUrl(site.domain, locale, page)}$2`)
    .replace(/((?:src|href)=")(assets\/|styles\.css)/g, '$1../$2');

  for (const domain of familyDomains) {
    output = output.replaceAll(`href="${domain}"`, `href="${domain}/fr/"`);
  }

  const meta = `
<!-- family-localization-meta:start -->
<link rel="canonical" href="${pageUrl(site.domain, locale, page)}">
<link rel="alternate" hreflang="en" href="${pageUrl(site.domain, "en", page)}">
<link rel="alternate" hreflang="fr" href="${pageUrl(site.domain, locale, page)}">
<link rel="alternate" hreflang="x-default" href="${pageUrl(site.domain, "en", page)}">
<!-- family-localization-meta:end -->`;
  output = output.replace(
    "</head>",
    `${meta}\n${localeStyles}\n<!-- family-localization-script:start -->\n<script src="../localization/language-preference.js" defer></script>\n<!-- family-localization-script:end -->\n</head>`
  );
  output = output.replace(/<body([^>]*)>/i, `<body$1>${localeChrome(site.domain, page, locale)}`);
  return output;
}

function addEnglishChrome(html, site, page) {
  const clean = stripGeneratedChrome(html);
  const meta = `
<!-- family-localization-meta:start -->
<link rel="canonical" href="${pageUrl(site.domain, "en", page)}">
<link rel="alternate" hreflang="en" href="${pageUrl(site.domain, "en", page)}">
<link rel="alternate" hreflang="fr" href="${pageUrl(site.domain, locale, page)}">
<link rel="alternate" hreflang="x-default" href="${pageUrl(site.domain, "en", page)}">
<!-- family-localization-meta:end -->`;
  return clean
    .replace(
      "</head>",
      `${meta}\n${localeStyles}\n<!-- family-localization-script:start -->\n<script src="localization/language-preference.js" defer></script>\n<!-- family-localization-script:end -->\n</head>`
    )
    .replace(/<body([^>]*)>/i, `<body$1>${localeChrome(site.domain, page, "en")}`);
}

async function buildSite(site) {
  const catalogPath = join(site.directory, "locales", `${locale}.json`);
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const translations = catalog.translations ?? {};
  const scriptTranslations = catalog.scriptTranslations ?? {};
  const usage = new Set();

  for (const page of site.pages) {
    const sourcePath = join(site.directory, page);
    const original = await readFile(sourcePath, "utf8");
    const clean = stripGeneratedChrome(original);
    let localized = translateTextNodes(clean, translations, usage);
    localized = translateScripts(localized, scriptTranslations, usage);
    localized = rewriteForLocale(localized, site, page);

    const outputPath = join(site.directory, locale, page);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, localized);
    await writeFile(sourcePath, addEnglishChrome(clean, site, page));
  }

  try {
    const script = await readFile(join(site.directory, "site.js"), "utf8");
    const localizedScript = translateScripts(script, scriptTranslations, usage);
    await writeFile(join(site.directory, locale, "site.js"), localizedScript);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const preferenceScript = await readFile(join(scriptDir, "language-preference.js"), "utf8");
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

  console.log(`${site.name}: generated ${site.pages.length} French page(s)`);
}

for (const site of sites) {
  await buildSite(site);
}
