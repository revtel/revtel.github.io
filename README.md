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

The two existing project sites are external destinations. Do not create local directories named `react-native-nfc-manager` or `react-native-nfc-rewriter`, or modify their repos or app checkout. AASA, NFC device tests and Universal Links remain outside this site's scope.

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
