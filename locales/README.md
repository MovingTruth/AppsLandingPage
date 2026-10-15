# App-family website locales

This folder is the coordination point for the six independent app-family sites.
`manifest.json` lists the canonical fourteen languages and gives each one a publication
class:

- `source`: English, the source language.
- `published-draft`: public and generated, but **not** human-reviewed. All thirteen
  non-English languages are currently in this class.
- `reviewed`: public after genuine, recorded fluent review (plus technical review of
  privacy and support pages). No review policy has been adopted yet, so no language can
  be classified `reviewed`. Automated validation never counts as review, and a page
  being public is not evidence that it was reviewed.
- `unpublished`: canonical but not generated or offered in the language menu.

Every current page, including Inner Thought's accessibility statement and Technical Craft
page, is present in all thirteen draft languages. Page presence is complete; translation
is not. The drafts are meaning-first, and 61 known untranslated occurrences remain, each
recorded as `draft-debt` in the sites' `coverage-exceptions.json`: Inner Whisper's
link-preview description (all thirteen languages), its "Aurora" theme name (nine
languages), and three iOS Settings paths on its privacy page (all thirteen languages).

## How a change reaches the public sites

These are five separate stages, and no stage implies the next:

1. **Generation.** Moving Truth's private release tooling reads each site's
   `locales/<locale>.json` and writes the static locale pages. Every published
   translation must live in those catalogs. Never edit a generated locale page by hand,
   because the next build replaces it.
2. **Automated validation.** Before writing anything, the tooling checks:
   - publication classes;
   - **coverage**: every translatable source string has a translation, or an explicit
     entry in `coverage-exceptions.json`;
   - **unused messages**: no catalog entry is left over;
   - links between the family sites.

   It does **not** detect **changed-source staleness**, meaning an English sentence
   edited after it was translated. That needs stable message IDs and is planned
   separately.
3. **Human approval.** Robin approves each change and release. Generation and validation
   do not approve anything.
4. **Git integration.** Approved changes are committed and pushed to each repository's
   `main` branch. The tooling never commits or pushes.
5. **Deployment.** Each of the six sites is deployed independently by GitHub Pages from
   its own `main` branch.

## Coverage exceptions

`coverage-exceptions.json` in each site lists every source string that intentionally or
knowingly stays in English on a locale page. Each entry gives the page, kind, exact
source text, exact locales, category and rationale. There are three categories:

- `identifier`: a metadata or technical token;
- `shared-literal`: a brand name, email address or domain that is the same in every
  language;
- `draft-debt`: untranslated text that still needs translating.

A language with draft debt cannot be classified `reviewed`.

## Language choice

The generated sites use a privacy-preserving language suggestion and never force a
redirect. When a published translation matches the browser language, the English page
offers that version and lets the visitor stay in English.

The visitor's language is carried between the family sites **by the links themselves**:
on a translated page, links to the other sites point to the same language there. Each
site remembers an explicit choice only in that site's own browser storage. Nothing is
shared across domains. Unsupported languages, invalid saved values, blocked browser
storage and detection errors all fall back to English.

## Content rules

Product names remain unchanged. Catalogs must preserve technical identifiers, URLs,
email addresses, numeric promises, privacy boundaries and accessibility meaning. Arabic
pages are generated with `dir="rtl"` and need mixed-direction review before any Arabic
page can be called reviewed.
