# App-family website locales

This folder is the coordination point for the six independent app-family sites.
`manifest.json` contains the canonical fourteen-language set and review state.

Run `node scripts/localize-family.mjs` from this repository to rebuild every completed
draft across all six sibling repositories. The generated pages are static: English
remains at each existing root, with completed drafts under their locale paths.

French, Spanish, German, Brazilian Portuguese, Italian, Dutch, Hindi, Arabic,
Simplified Chinese, Japanese, Korean, Russian, and Thai are complete
meaning-first drafts across all eleven current pages, including Inner Thought's
accessibility statement. None is approved until a fluent
reviewer and an additional privacy/support technical review are recorded in the
manifest. All fourteen languages now have complete drafts. Do not relabel a draft as
reviewed based on automated validation.

The generated sites use a privacy-preserving language suggestion. They never force a
redirect: when a completed translation matches the browser language, the English page
offers that version and lets the visitor remain in English. An explicit choice is
remembered locally on that site. Unsupported languages, invalid saved values, blocked
browser storage, and detection errors fall back to English. Only completed locales are
generated or added to the script's supported set.

Product names remain unchanged. Future catalogs must preserve technical identifiers,
URLs, email addresses, numeric promises, privacy boundaries, and accessibility meaning.
Arabic must also generate `dir="rtl"` and pass mixed-direction review before release.
