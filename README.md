# Revtel bilingual one-page website

This is Revtel's GitHub Pages website, built with Next.js and TypeScript as a fully static export. Releases require explicit approval and use the manual GitHub Actions workflow described below.

## Edit and preview

- `_source/copy.json`: Traditional Chinese and English copy.
- `_source/community.json`: sourced, dated community metrics and integration links.
- `src/components/`: shared React page sections, navigation, and metadata.
- `src/pages/`: explicit Traditional Chinese and English routes, plus localized errors.
- `src/styles/site.css`: curves, responsive layout and colors inspired by the original Revtel icon.
- `public/`: logos, crawler metadata, and the legacy service worker retirement script.

Use Node.js 22.13+ (Node 22 LTS recommended) and npm:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000/` or `/en/`. For the actual static export:

```sh
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/` or `/en/`. The preview command only serves files from `out/`; it does not run Next.js or render pages. Use `npm run preview -- --port 4174` to choose another port.

## Static architecture

`next.config.ts` sets `output: 'export'` and `trailingSlash: true`. The Pages Router uses `getStaticProps` to choose each page's locale at build time. This keeps the existing `/` and `/en/` URLs and emits the correct `<html lang>` for each document. All page content and SEO metadata are included in the exported HTML, including when browser JavaScript is disabled. React enhances the language switch to preserve the current section.

On either homepage, `public/assets/locale.js` selects a language before the page renders. A saved manual choice (`revtel.locale` in local storage) takes priority; otherwise, the browser's first preferred language decides: all `zh` variants, including Simplified Chinese, use Traditional Chinese, and other languages default to English. Automatic redirects preserve the query string and section fragment and replace the history entry. Manual switches remember the choice and retain the current section. When storage is blocked, a temporary `lang` query parameter lets a manual switch complete without bouncing back; persistent memory is unavailable in that case. Error pages and project sites are not automatically redirected. Without JavaScript, each URL keeps its fixed language and ordinary language links still work.

There are no API routes, request-time rendering, ISR, Server Actions, runtime data fetches, or required environment variables. Logos use ordinary image elements so no image optimization server is needed. Community data stays in the checked-in JSON snapshot.

`npm run build` writes deployable HTML, CSS, JavaScript, and assets to `out/`. A small Node post-build script preserves `/404.html` and `/en/404.html` alongside Next's directory routes and adds `out/.nojekyll` so GitHub Pages serves `_next/` assets. Generated pages and build caches are ignored by Git; edit the source rather than the output. Python is no longer part of the build or preview workflow.

## Verification

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Playwright starts a plain static server against `out/`. Tests cover both languages with JavaScript disabled, metadata, section-preserving language switches, hydration errors, desktop/mobile layouts, local assets, and localized errors. A returning-browser test also installs a legacy root worker, verifies its retirement and cached-page upgrade, and checks that unrelated caches and project tabs survive. Rebuild before testing source changes. Screenshots are written to `test-results/`.

## Structure and scope

The public entry point is a single page per language: introduction, team, two projects, community evidence and GitHub call to action. Navigation stays on that page. Static language links work without JavaScript; a small enhancement preserves the current section fragment.

The featured projects are only React Native NFC Manager and NFC Rewriter. Manager is a developer library; Rewriter is a hands-on app built with it. Descriptions avoid equating development-only app features with the current store release or promising identical support on every device and platform.

The old sample posts, lessons, categories and archives have been removed, along with the obsolete Gatsby bundles, CMS, RSS and manifest. Original files remain recoverable from Git history at `6bf1151`. Old URLs can return 404; the new 404 page points visitors to the one-page home.

The two existing project sites are external destinations. Do not create local directories named `react-native-nfc-manager` or `react-native-nfc-rewriter`, or modify their repos or app checkout. This repository hosts the organization-domain AASA described below; NFC device tests and app changes remain separate.

## iOS website association

`public/.well-known/apple-app-site-association` is the extensionless JSON source for `https://revtel.github.io/.well-known/apple-app-site-association`. Next.js copies it to `out/.well-known/`; the existing Pages artifact workflow publishes that export. No extra root directory, Jekyll configuration, or runtime endpoint is needed.

The association authorizes only `HE7MCCDHL4.com.revteltech.nfcopenrewriter` and the six exact promotion Home paths: `/react-native-nfc-rewriter/`, `/react-native-nfc-rewriter/index.html`, `/react-native-nfc-rewriter/zh-Hant/`, `/react-native-nfc-rewriter/zh-Hant/index.html`, `/react-native-nfc-rewriter/ja/`, and `/react-native-nfc-rewriter/ja/index.html`. There are no wildcards. Preserve other apps and services when editing this domain-wide file.

The association test checks the exported bytes, JSON scope, and local response without following redirects. Local preview explicitly serves this file as JSON; that does **not** configure GitHub Pages response headers. After an authorized manual release, independently check the exact public URL for HTTP 200, no redirect, actual Content-Type, and matching JSON, then inspect `https://app-site-association.cdn-apple.com/a/v1/revtel.github.io`. Also check both organization homepages and the three promotion languages. Apple's [Universal Link diagnostics](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links) cover `swcutil` validation and device association. Origin deployment, Apple CDN availability, and physical iPhone behavior are distinct checks; website success does not establish that background NFC issue #17 is resolved.

The 2026-10-26 release returned HTTP 200 without redirects at the origin, but GitHub Pages served the extensionless file as `application/octet-stream`. Apple CDN nevertheless fetched the byte-identical JSON successfully and returned it as `application/json`, with `Apple-From` naming the intended `.well-known` URL. This confirms CDN retrieval, not device association or a strict origin JSON-MIME pass. Pages does not expose custom HTTP headers ([GitHub staff response](https://github.com/orgs/community/discussions/54257)); keeping this exact `github.io` hostname while changing its MIME mapping requires GitHub platform support. Repository `_headers`, `.htaccess`, a `.json` redirect, or changes to the local preview cannot fix that response. A custom domain on hosting with header control would be a separate URL/app migration and is not a substitute for this association. See [release evidence](verification/2026-10-26-aasa/README.md) for the observed responses and outstanding checks.

To roll back this association, remove only this app's entry and redeploy through the same manual workflow, preserving other consumers and the website. Apple and device caches can retain previous data after a rollback.

## Community evidence

Snapshot: 2026-10-26. NFC Manager: 1,640 GitHub stars, 349 forks. NFC Rewriter: 264 stars, 100 forks; Google Play displays 10K+ downloads. Manager's npm count is 436,474 downloads for the fixed period 2026-09-26 through 2026-10-25. Downloads are not unique users, apps or active users. The page links each metric to its official source.

The ZEUS and Self links point to source-code integrations pinned to inspected commits. They do not imply a partnership, endorsement or adoption of a particular current major version. Before updating metrics, fetch official sources again and update both `community.json` and the localized date notes in `copy.json`. Do not substitute a cached `last-month` response with a different date interval.

## Existing browser cache upgrade

Keep `/sw.js` available so returning browsers can retire the 2018 Gatsby service worker. It deletes only the exact Gatsby root precache and unregisters itself. It has no fetch handler and does not claim clients or remove other caches. Known old root-content windows are navigated to the appropriate localized homepage; unrelated project-site tabs are not reloaded. Fresh visitors do not register a worker.

## Release and rollback

The previous deployment used `master:/`. The Next.js source tree must not be published directly as that folder: it now needs a build, and the published artifact is `out/`.

`.github/workflows/pages.yml` provides a **manual-only** release workflow. It installs locked dependencies, checks types, builds, tests the exported site, and uploads only `out/` to GitHub Pages. It does not run on pushes or pull requests. At the first approved release, change the repository's Pages source to **GitHub Actions**, then manually run the workflow against the approved ref. No repository settings or deployments are changed by local builds.

Before an approved release, re-check the remote head, Pages settings and both project-site links. After release, verify both homepages, language/section links, assets, custom 404 and a returning browser with the old worker.

For a Next.js release rollback, run the manual workflow against a reviewed prior Next.js revision. Reverting all the way to the original pre-migration site also requires restoring the previous `master:/` publishing method. Git history contains that website; no project-site repositories need to change.
