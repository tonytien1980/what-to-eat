# Weather-Only Release Plan

> Execute inline with superpowers:executing-plans. Physical subagents are not authorized.

## Goal And Boundaries

Release the already-approved weather corrections independently of the blocked Sheets publisher. Start from deployed commit 09057be and retain all 90 district backgrounds, restaurant data, card behavior, dependencies and Apps Script code. The owner approved handling weather first after the recommendation to integrate, verify and deploy it.

Use the existing weather loader, hook, mapping and background selector. No new provider, data owner or cache layer. Reuse only the weather implementation from db8654d; do not merge the batch-one branch or its publisher changes. The original checkout has an unrelated restaurant snapshot edit; preserve its SHA-256 10c8a729b7d9d66a1e98aa527d98a80fd3671a85edd03a740f36d5ef22e6bca7.

## Checklist

- [x] Create isolated codex/weather-release-2026-10-11 from 09057be. Baseline npm test: 19 suites / 97 tests passed.
- [x] Apply the four weather/app test files from db8654d before production files; run targeted tests and record the expected failures.
- [x] Restore only data/cwa-town-locations.json, src/App.tsx, src/features/backgrounds/selector.ts and src/features/weather/{cwa-county,scenes,types,useTaipeiWeather} from the weather commit via apply_patch. Check every current caller and keep newer asset manifests unchanged.
- [x] Add coverage for all district background mappings, unavailable/stale UI and forecast/background agreement. Put npm test before the existing Pages build so failed regression checks cannot deploy.
- [x] Align README and docs/01, docs/02, docs/03 with weather truth, neutral failure backgrounds and release verification, preserving newer artwork rules and the existing production publisher contract.
- [x] Run npm test, npm run build, npm run build:pages, diff checks, correctness review and report-only Ponytail final review. Compare image/data/publisher paths against 09057be.
- [x] Browser-test the local build: Songshan, Zhongzheng, Beitou, Shilin, city-only and refresh. Compare current official Time_3hr / TempArray_3hr values; no GPS prompt or data writes. Network failure and stale paths are verified through real-loader integration tests rather than browser fault injection.
- [x] Commit and sync the weather branch, integrate it into codex/initial-mvp without staging the original dirty snapshot, and wait for Pages tests/build/deploy success.
- [x] Read back live version.json and actual UI values/background after reload; compare deployment SHA and official forecast. Record limits and final Git state.

## Preflight Review

Ponytail (report only): remove the fabricated forecast and obsolete GT/county path rather than adding fallback layers. One bounded loader cache and the current hook remain the owners. The deployment gap is separate from Sheets OAuth. Keep the change weather-only and add the missing test gate to the existing workflow.

## Recovery

Before release, failed verification blocks deployment. After release, a verified regression is handled by reverting only the weather release commit with owner awareness; never reset the original dirty checkout or change Google account protections. Preserve the previous deployed SHA and report actual Pages state, not merely a successful push.

## Verification Evidence

- Red: migrating weather tests first produced 16 failures / 4 passes. The additional real-owner integration and deployment-gate tests produced 17 failures before the production changes.
- Review found one further weather-only defect: valid Wx 19 without artwork displayed the hardcoded Zhongshan forecast label. Added a failing test, then replaced the obsolete time-label fallback with official weather text. No Wx classification or image file changed.
- Green: 22 suites / 119 tests passed. Both production builds passed. An invalid testing-library option in the new test was caught by TypeScript and removed before release.
- Builds retain the existing bundle-size warning (roughly 808 KB Pages JS); no dependencies or artwork were added. Performance restructuring is outside this weather-only change.
- Local browser at 127.0.0.1:18176 verified Songshan, Zhongzheng, Shilin: 00:00 forecast, overcast, 25 C / apparent 27 C. Beitou: partly cloudy, 25 C / apparent 26 C. Corresponding district image paths matched. Source readback at 2026-10-11 00:22 Taipei used CWA data updated 00:16:38; all 12 IDs matched Info_Town.js.
- Reload kept Shilin rather than collapsing to city-only. Explicit Skip District + Save showed unavailable weather and neutral default artwork. The 390x844 viewport request rendered without horizontal overflow (375 CSS px after scrollbar); normal and unavailable weather text remained readable. This is browser viewport testing, not physical iPhone/Safari testing. Console error readback was empty.
- Pre-landing correctness review traced loader, hook, App, mappings, selectors and all callers. Report-only Ponytail final review: no remaining blocker in the scoped change; obsolete county/GT paths removed, no parallel cache/provider or new dependency. Final weather-text fallback test passed.
- Relative to 09057be, images/manifests, restaurant snapshot/source config, restaurant logic, cards, Apps Script and package files are unchanged. The original checkout's unrelated restaurant snapshot still matches the recorded SHA-256.
- Weather code release e5b961c was fast-forwarded into codex/initial-mvp and both branches pushed. [Pages run 38067786553](https://github.com/tonytien1980/what-to-eat/actions/runs/38067786553) passed tests, build and deployment at 2026-10-11 00:29 Taipei. Live version.json returned e5b961c (builtAt 2026-10-10T16:28:52.299Z), and ordinary reload of the existing non-incognito tab loaded assets/index-C3hPrOGC.js with the new timestamped UI.
- Production browser readback confirmed all four districts against the same official forecast: Songshan, Zhongzheng and Shilin overcast 25 C / apparent 27 C; Beitou partly cloudy 25 C / apparent 26 C. Each used a matching district weather asset. Console error readback was empty. Original Zhongzheng preference was restored after testing; mobile proof is stored locally under output/weather-release-2026-10-11/production-mobile.jpg.
- Limits: physical iOS Safari and a hidden-tab focus-triggered update banner were not independently verified. Existing version-banner unit tests pass, and the old ordinary browser tab successfully refreshed to the new bundle without clearing storage. CWA outages or future source-format changes remain external risks, now represented by explicit unavailable/stale states rather than fabricated weather.
- Working state after weather release: isolated weather worktree clean and equal to its GitHub branch; original deploy branch equal to GitHub with only the pre-existing restaurant snapshot dirty and SHA-256 unchanged. This closeout documentation commit follows the same sync/deploy gate; it makes no additional code changes.
