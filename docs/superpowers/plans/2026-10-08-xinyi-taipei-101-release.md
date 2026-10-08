# Xinyi Taipei 101 Release Plan

## Approved Scope

Publish the user-approved Taipei 101 v1 clear-cloudy master and five weather
variants. Keep their existing WebP bytes, daytime composition, and accepted UI
overlap. Do not regenerate artwork or change UI, selection algorithms, global
weather classification, credentials, or unrelated restaurant data.

## Canonical Owners

- Assets: `images/backgrounds/taipei/xinyi/`, canonical filenames without trial/version suffixes.
- Background selection: `images/backgrounds/district-manifest.json`, one Taipei 101 candidate per weather pool.
- Forecast mapping: `data/cwa-town-locations.json`, CWA county `63`, town `6300200`.
- CWA evidence: https://www.cwa.gov.tw/V8/C/W/Town/Town.html?TID=6300200
- Release branch: `codex/initial-mvp`, existing GitHub Pages workflow.

## Execution and Verification

1. Add failing Xinyi tests for all six assets, different random values, existing Wx mappings, and both Taipei spellings.
2. Copy the six approved WebPs into final/runtime archives and the formal image directory, verifying SHA256 equality, dimensions, and size limits.
3. Register Xinyi in the existing manifest and forecast mapping, and update README plus all four SSOT documents.
4. Run the full test suite, both build commands, and report-only final diff review. Preserve unrelated `data/restaurants.json` changes outside the commit.
5. Verify the exact committed snapshot independently, including desktop/mobile browser behavior, before pushing the approved release branch.
6. Wait for successful Pages deployment; read back version and all six asset hashes, and verify the live Xinyi scene and forecast.
7. Report local/remote state and recommend the next unfinished district without starting generation.

## Boundaries and Rollback

All six assets are available by explicit variant. Existing Wx classification
does not independently promote rain to heavy rain; this release does not change
that contract. Browser responsive checks do not replace physical iPhone testing.
If deployment or verification fails, stop and report the failure. A rollback
requires human approval and should revert only this release commit, preserving
unrelated work.
