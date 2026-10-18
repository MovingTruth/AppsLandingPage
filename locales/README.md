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

These are six separate stages, and no stage implies the next:

1. **Generation.** Moving Truth's private release tooling reads each site's message
   registry (`locales/messages.json`) and catalogs (`locales/<locale>.json`) and writes
   the static locale pages. Every published translation must live in those catalogs.
   Never edit a generated locale page by hand, because the next build replaces it.
2. **Automated validation.** Before writing anything, the tooling checks:
   - publication classes;
   - **message identity**: every translated piece of an English page has a registered
     message ID at an exact place in the page, and every catalog entry names a
     registered ID (see "Message IDs" below);
   - **changed-source staleness**: each translation records a fingerprint (SHA-256) of
     the English it was made from. When that English is edited, the translation is
     reported stale, in every language, until a person updates it or explicitly
     reaffirms it. The tooling never does either itself;
   - **coverage**: every translatable source string has a translation, or an explicit
     entry in `coverage-exceptions.json`;
   - links between the family sites.

   Any failure stops generation before anything is written.
3. **Human approval.** Robin approves each change and release. Generation and validation
   do not approve anything.
4. **Release gate.** The release tooling checks the exact approved commits of all six
   sites together: the validation above, its full test suite, and **identity
   continuity**: every message and exception ID on the live `main` branch still names
   the same piece of the page, or has been retired, and no retired ID is reused. Only
   then does it mark the commits as passed. Each site's `main` branch accepts only
   commits so marked.
5. **Git integration.** The approved, passed commits are pushed to each repository's
   `main` branch. The tooling never commits or pushes.
6. **Deployment.** Each of the six sites is deployed independently by GitHub Pages from
   its own `main` branch.

## Message IDs

`messages.json` in each site lists every translated piece of its English pages. Each has
an ID such as `inner-sign.index.text.0012` (site, page, kind, number), the place in the
page where it appears, its current English, and that English's fingerprint. The catalogs
are keyed by these IDs, never by the English itself, so:

- editing an English sentence keeps its ID and its translations, and marks each
  translation stale until it is reviewed;
- the same English in two places has two IDs, so each place can carry its own
  translation;
- an ID never moves to a different piece of the page. When a piece is removed, its ID
  is listed under `retired` and is never used again; a new piece gets a new number.

## Coverage exceptions

`coverage-exceptions.json` in each site lists every source string that intentionally or
knowingly stays in English on a locale page. Each entry has its own fixed ID (such as
`inner-sign.index.exception.0001`) and gives the page, kind, exact source text, exact
locales, category and rationale. A removed entry's ID is listed under `retired` and is
never reused. There are three categories:

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
