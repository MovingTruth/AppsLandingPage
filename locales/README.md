# App-family website locales

This folder is the coordination point for the six independent app-family sites.
`manifest.json` contains the canonical fourteen-language set and review state.

Run `node scripts/localize-family.mjs` from this repository to rebuild the currently
implemented locale across all six sibling repositories. The generated pages are static:
English remains at each existing root and French is under `/fr/`.

French is a complete meaning-first draft across all ten current pages, but it is not
approved for publication until a fluent reviewer and an additional privacy/support
technical review are recorded in the manifest. The other twelve translations remain
pending. Do not relabel a draft as reviewed based on automated validation.

The generated sites use a privacy-preserving language suggestion. They never force a
redirect: when a completed translation matches the browser language, the English page
offers that version and lets the visitor remain in English. An explicit choice is
remembered locally on that site. Unsupported languages, invalid saved values, blocked
browser storage, and detection errors fall back to English. Only completed locales may
be added to the script's supported set.

Product names remain unchanged. Future catalogs must preserve technical identifiers,
URLs, email addresses, numeric promises, privacy boundaries, and accessibility meaning.
Arabic must also generate `dir="rtl"` and pass mixed-direction review before release.
