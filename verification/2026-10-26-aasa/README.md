# NFC Rewriter website association — 2026-10-26

Website association is deployed and Apple CDN retrieval is confirmed. The origin's strict `application/json` MIME expectation remains unmet: GitHub Pages returns `application/octet-stream`. Physical iPhone association and Universal Link/background NFC behavior have not been tested in this task.

## Release identity

- Source commit: [`5ce3017b22a343d2b115bab4ce811a064362bd34`](https://github.com/revtel/revtel.github.io/commit/5ce3017b22a343d2b115bab4ce811a064362bd34).
- Successful manual release: [Actions run 40319724107](https://github.com/revtel/revtel.github.io/actions/runs/40319724107).
- Published AASA: <https://revtel.github.io/.well-known/apple-app-site-association>.
- Apple CDN: <https://app-site-association.cdn-apple.com/a/v1/revtel.github.io>.
- Previous source/release: `98c8c6cc57433d131b2de2f7fde365a03f1a5964`, [run 40293979736](https://github.com/revtel/revtel.github.io/actions/runs/40293979736).
- Both published copies have SHA-256 `f85b7f5e12e4947c86fee387dcf1fad4812b67004b6478514d9a2b9a19fc183a`, matching source and local export.

The worktree was clean at handoff. Pages was already publishing workflow artifacts from Next.js, with HTTPS enforced and no custom domain. Both AASA locations returned 404 before this change; there was no existing app/service entry to merge. The change adds `public/.well-known/apple-app-site-association`, a local preview MIME mapping, one export/response test, and documentation. It retains the existing manual workflow, artifact directory, and `.nojekyll` generation. No project-site directories were created and the NFC app repository was not modified.

The file authorizes only `HE7MCCDHL4.com.revteltech.nfcopenrewriter`, using modern `appIDs`/`components` and exactly these paths:

```text
/react-native-nfc-rewriter/
/react-native-nfc-rewriter/index.html
/react-native-nfc-rewriter/zh-Hant/
/react-native-nfc-rewriter/zh-Hant/index.html
/react-native-nfc-rewriter/ja/
/react-native-nfc-rewriter/ja/index.html
```

There is no wildcard, root-site claim, or additional app/service claim. Query strings and fragments do not broaden the authorized paths.

## Observed verification

Local typecheck and build passed. All 21 Playwright tests passed locally and in CI, covering exact AASA scope and exported bytes, direct local JSON response, language selection/persistence, no-JavaScript content, responsive layouts/assets, localized errors, and retiring the old worker without disturbing project tabs/caches. The first sandboxed test invocation could not bind the local preview port; the complete suite subsequently passed outside the sandbox.

Public checks ran after deployment on 2026-10-26 around 20:10 Asia/Taipei. Exact timestamps, HTTP headers, hashes, and per-URL outcomes are in `public-checks.json`.

| Check | Result |
| --- | --- |
| Origin HTTPS GET, redirects disabled | HTTP 200; no Location; valid JSON; byte-identical to source |
| Origin with a second arbitrary User-Agent | Same successful delivery and content |
| Origin Content-Type | `application/octet-stream`; strict JSON MIME check **fails** |
| Apple CDN HTTPS GET, redirects disabled | HTTP 200; `application/json`; byte-identical content |
| Apple CDN origin diagnostic | `Apple-From: https://revtel.github.io/.well-known/apple-app-site-association`, `Apple-Origin-Format: json` |
| Organization `/` and `/en/` | HTTP 200; expected `zh-Hant`/`en` and page titles |
| Six promotion URLs | All HTTP 200 with the corresponding `en`, `zh-Hant`, or `ja` document |
| NFC Manager project | HTTP 200; existing project page intact |
| Root-site CSS, scripts, images, metadata, and retired worker | All 16 checked resources HTTP 200 |

The live headers prove Apple CDN accepted the actual origin response despite its generic MIME. They do not prove the installed iPhone's `Site/Fmwk Approval`, device cache contents, signed entitlements, or link behavior. No current app artifact or phone state was assumed from the historical handoff.

## Hosting limitation and available correction

GitHub Pages controls HTTP MIME mapping and does not provide repository-defined response headers. GitHub's [staff response about custom headers](https://github.com/orgs/community/discussions/54257) confirms that limitation; its [MIME mapping discussion](https://github.com/orgs/community/discussions/58259) shows that platform-level MIME fixes require GitHub changes. No `_headers`, `.htaccess`, Next.js runtime route, or preview-server setting can change the response from this static Pages hostname. Renaming to `.json`, returning HTML with a meta tag, or redirecting the required endpoint would not satisfy the specified URL/JSON requirements.

To obtain strict `application/json` at the same `revtel.github.io` URL, the remaining path is to ask GitHub Support for an AASA filename MIME mapping/platform fix, supplying `origin.headers`, the exact URL, and the successful `apple-cdn.headers` diagnostic. This task has not sent a support message, and GitHub's willingness to make that change is not established. It is not fixable solely in this repository. If that is unavailable and strict origin MIME is mandatory, a separately approved move to a controlled domain/host with per-path headers would require a new promotion URL and associated-domain app configuration; it would not establish association for this original URL. No domain or hosting migration was made.

## Remaining device checks

`swcutil verify` was attempted using non-interactive sudo and stopped with `sudo: a password is required`; it did not validate this file. See `local-checks.json`. Apple's [TN3155](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links) explains Mac validation and installed-device diagnostics. Apple CDN delivery has been checked directly, but there is no on-device association result.

Before coordinating physical tests, confirm the current iPhone/iOS, installed signed build and entitlements, and already-written NFC tag state with the user. Then test external ordinary links and genuine background NFC independently. This work does not authorize writing/formatting/locking tags, replaying D21 provisioning, uninstalling user data, or TestFlight/App Store publication. Issue #17 has not been changed or declared fixed.

## Evidence and reproduction

- `local-checks.json`, `local-tests.log`: local checks, scope, hash, and unavailable native diagnostic.
- `pages-before.json`, `pages-after.json`, `previous-release.json`, `release.json`, `ci-summary.log`: hosting and release identity/results.
- `origin-before.*`, `root-origin-before.headers`: pre-deployment responses.
- `origin.*`, `origin-random-agent.*`, `apple-cdn.*`: raw post-deployment bodies and headers.
- `public-checks.json`: full public response summaries and separate delivery/MIME/CDN/regression flags.
- `check-public.py`: reproducible stdlib HTTP checker. Run `python3 verification/2026-10-26-aasa/check-public.py` from a network-enabled environment. It disables redirect following and intentionally exits nonzero while the strict origin JSON MIME condition is unmet. Re-running overwrites the current public evidence files; copy this evidence directory first when preserving the original snapshot.

Rollback: remove only this app entry and use the existing manual release workflow, preserving other apps/services if added later. To restore the complete immediately preceding site, manually release reviewed commit `98c8c6c`. Neither step instantly invalidates Apple/device caches.
