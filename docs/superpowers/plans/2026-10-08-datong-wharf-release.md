# Datong Wharf Release Implementation Plan

> Execute inline with `superpowers:executing-plans`; physical subagents remain disabled.

**Goal:** Publish the user-approved Dadaocheng Wharf v2 six-weather set for Taipei Datong.

**Architecture:** Reuse `images/backgrounds/district-manifest.json` and `data/cwa-town-locations.json`. The existing selector, weather parser, UI, and deployment workflow remain unchanged. Only approved, byte-identical WebP assets enter runtime.

**Tech Stack:** React, Vite, TypeScript, Vitest, GitHub Pages.

This is the pre-release procedure, not a live deployment-status ledger. Actual verification and deployment readback are retained in the ignored local release report under `output/background-runtime/taipei-datong/`.

## Authorization and Baseline

- User accepted the whole set and explicitly requested production replacement on 2026-10-08.
- Base commit: `471b9a7ef6325e7204e2e480f9a4503504b8350f`, equal to the live deployment branch at preflight.
- Branch: `codex/initial-mvp`; pushing it triggers `.github/workflows/deploy-pages.yml`. Do not merge to main or create a second release path.
- Preserve and exclude preexisting `data/restaurants.json` changes. Baseline SHA256: `10c8a729b7d9d66a1e98aa527d98a80fd3671a85edd03a740f36d5ef22e6bca7`.
- Logical responsibilities: Jocelyn owns release scope; Maria implements configuration/tests; Ada reviews simplicity; Louise verifies browser behavior; Amy synchronizes SSOT. No new backend, paid generation, credential changes, or UI redesign.
- Tools: local Git/npm/file checks, GitHub CLI for the authorized push/deployment readback, and in-app browser for local/live QA. No memory writes.

## Steps

- [ ] Add and run `src/test/datong-background-release.test.ts` before configuration changes: six canonical variants with three random seeds, five existing Wx classes, and two Chinese city spellings for CWA lookup. Expected initial result: 13 failures because Datong is absent.
- [ ] Copy approved `output/background-trials/taipei-datong/background-taipei-datong-<weather>-dadaocheng-wharf-trial-v2.webp` into finals/runtime local staging and `images/backgrounds/taipei/datong/background-taipei-datong-<weather>-dadaocheng-wharf.webp`. Weather slugs: `clear-cloudy`, `overcast`, `rain`, `heavy-rain`, `thunderstorm`, `dense-fog`. Verify hashes against approved sources, dimensions 1536x1024, size below 500000 bytes, and no trial suffix in runtime.
- [ ] Add Datong manifest entry, slug `datong`, landmark `dadaocheng-wharf`, label `大稻埕碼頭`, weight 1. Map `clear_cloudy`, `overcast`, `rain`, `heavy_rain`, `thunderstorm`, `dense_fog` to the six canonical paths; all six pools contain only this landmark.
- [ ] Append `{ "city": "臺北市", "district": "大同區", "countyCode": "63", "townId": "6300600", "label": "臺北市大同區" }` to the existing CWA table. Official page and selected controls verified at `https://www.cwa.gov.tw/V8/C/W/Town/Town.html?TID=6300600`.
- [ ] Update all four active SSOT files: six districts / fourteen landmarks / eighty-four images; Datong one-landmark pools; approved v2 provenance, known UI overlap, official CWA mapping, regression acceptance. Do not claim Wx alone automatically selects heavy rain.
- [ ] Run `npm test`, `npm run build`, and `npm run build:pages`. Review scoped diff for correctness, secrets, unapproved files and duplication. Expected: all tests and both builds pass; no selector changes or new dependencies.
- [ ] Commit only the approved files. Build/test the exact commit in an isolated temporary archive so uncommitted restaurant data cannot affect release verification. Browser-check Datong selection and background at desktop and mobile sizes.
- [ ] Push the verified commit to `origin/codex/initial-mvp`. Wait for the matching GitHub Actions run to succeed. Read back live `version.json`, six deployed asset hashes, and Datong UI/weather selection.
- [ ] Record deployment evidence in the existing ignored output workspace; report live URL, verification limits, remaining restaurant dirty state and exact local/remote equality.

## Stop and Rollback

- Stop before push for failed tests/builds, unexpected file changes, missing approved assets, or a moved remote head.
- On a failed deployment, report the exact stage and preserve evidence. Rollback uses an ordinary revert of this scoped release commit followed by the same Pages pipeline, never a force-push or destructive reset. Do not silently broaden the change to unrelated product problems.
