# Batch One: Weather Truth And Publish Safety

## Approval And Boundaries

- The owner approved batch one after the 2026-09-23 audit: weather correctness, failure/staleness, forecast time, and publish deletion guards.
- Execute inline in `codex/batch-one-data-safety`; no physical subagents.
- Do not change the original dirty `data/restaurants.json`, gameplay, distance, long-name layout, dependencies, or deployment workflow.
- No production deployment, live Sheet write, or live Apps Script update. The owner explicitly approved atomic Sheets publishing implementation on 2026-09-24; live activation remains a separate gate.

## Design

The canonical weather owners remain the managed town table, CWA loader, weather hook, and background selector. Cover all 12 Taipei districts using official `Info_Town.js`. Use the same timestamped `Time_3hr` / `TempArray_3hr` entry for temperature, apparent temperature and weather; do not mix in GT observations. Select the applicable forecast interval and reject expired/malformed data. Label the temperature range as future 24 hours, not today. No fabricated fallback forecast.

The hook keeps last-good data only for the same location, labels refresh failure/expiry, and clears it when changing location. With no forecast, use a neutral shared background and unavailable/loading copy. Keep the existing focus/visibility/5-minute refresh; failed requests are evicted, script loading times out, and cache storage stays bounded. Unmapped and city-only selection must never masquerade as Zhongshan.

For publish safety, the existing Apps Script remains the owner. Validate every required header and flag before writes, reject empty/invalid projections, show proposed changes for explicit confirmation, revalidate under a script lock after confirmation, and perform all four sheet replacements in one native atomic batch. Verify values before reporting success. A network error is an unknown outcome, not permission to blindly retry. This native write-method change was explicitly approved on 2026-09-24.

## Execution Checklist

- [x] Establish clean isolated baseline with `npm test` (58 tests passed).
- [x] Write failing real-mapping, time-window, malformed-data, script-failure/retry/timeout, weather-hook and unavailable-UI tests in `src/test/`.
- [x] Implement weather table/loader/hook/App/background changes and run targeted tests.
- [x] Test the actual `Code.gs` in a VM with read/write/lock doubles, then implement schema guards and atomic publishing. Verify missing flags, empty master, cancellation, changed inputs, failed batch and readback mismatch cause no false success.
- [x] Align architecture, UX, QA, README and Apps Script installation guidance with both repairs and pending live activation.
- [x] Run full tests (64 passed), both builds, focused local browser checks, correctness review and Ponytail final-diff review for the weather scope.
- [x] Keep only batch-one changes on the non-deploying repair branch; sync to GitHub and report activation limits and the original dirty worktree separately.

## Preflight Simplification Review

- `cwa-county.ts`: remove the fabricated weather and obsolete county/GT paths from the active weather owner rather than layering another loader over them.
- Use timestamped data already provided by CWA; no new provider, backend, dependency, or extra cache layer.
- Keep state transitions in the existing hook; do not add a global store.
- Prefer Google's atomic batch API to custom staging sheets/rollback infrastructure if the owner approves it.

## Evidence Sources

- Official town mapping: https://www.cwa.gov.tw/Data/js/info/Info_Town.js
- Official Taipei forecast: https://www.cwa.gov.tw/Data/js/3hr/ChartData_3hr_T_63.js
- Google atomic request semantics: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
- Original audit: `output/audit-2026-09-23/review.md` in the original workspace.

## 2026-09-23 Weather Verification

- Baseline: 58 tests passed in the isolated worktree. The original workspace still has the previously reported ignored Playwright-spec collection failure; no tests/config were silently changed to hide it.
- Final weather checks: `npm test` 18 suites / 64 tests passed; `npm run build`, `npm run build:pages` and `git diff --check` passed. Existing large-chunk warning remains; no dependency/performance remediation is claimed.
- Red: missing district mapping, fabricated fallback, non-retryable failure, no script timeout, cross-location and stale-state defects were reproduced before implementation.
- Real browser: switched Zhongshan to Songshan, saved and cache-bypassing reloaded. Songshan showed the official 21:00 forecast: clear, 26 degrees, apparent temperature 27, future 24-hour range 24-31. The background used the Songshan clear-cloudy pool.
- Official source check: all 12 local mappings matched `Info_Town['63']`; every town existed in `TempArray_3hr`.
- Browser fault injection: first-load CWA failure produced no temperatures and a neutral default background; drawing remained enabled. A later refresh failure preserved same-district values with the stale label.
- Mobile Chromium emulation: 390px wide, no horizontal overflow, existing two-line title and four-category row preserved. Real Safari/GPS was not tested and is outside this weather-only validation.
- Correctness review checked nullable weather consumers, timeout/rejection cleanup, calendar rollover, location races and unchanged restaurant scope. An impossible-date normalization gap was found, reproduced with a failing test and fixed.
- Ponytail final review: removed the unused county/GT and fabricated fallback paths instead of adding another loader; one bounded cache; no new dependencies, backend or store. No further scope-related cut required.
- At the 2026-09-23 checkpoint, publisher implementation was paused for approval. That gate was approved on 2026-09-24; see the following checkpoint.

## 2026-09-24 Atomic Publisher Checkpoint

- No live Sheets write, Apps Script installation, production deployment, dependency change, or original restaurant-snapshot edit.
- Red evidence: the original Code.gs performed eight header/clear writes when is_enabled was missing. The initial 18 new publisher tests failed before implementation.
- The canonical publisher now validates all 12 required headers and explicit flags, blocks all-empty/all-disabled master and uncategorized enabled rows, and confirms per-category before/after counts and clears.
- Dialog confirmation precedes locking; master and target data/metadata are re-read after acquiring the script lock. Differences abort before any write.
- A single native batch replaces four A:G ranges, clears old tails and grows grids as needed. Values are typed, including literal strings beginning with '='. H+ and cell formatting are not replacement targets.
- A separate API readback checks every cell before success. Any post-submit exception is unknown outcome; no automated retry or rollback. Native API atomicity is based on Google's contract, not claimed as proven by VM doubles.
- CLI preview now calls the same checked-in Code.gs pure contract in Node VM. Removed unused alternative TypeScript publishing validators/projectors; bootstrap merging remains unchanged. Tests moved from the alternative implementation to the actual publisher.
- Final review reproduced and fixed CSV FALSE-vs-checkbox empty-row disagreement and harmless metadata-key-order false conflicts. Both had failing tests before fixes.
- Review/security checks: no new credentials, no remote code evaluation by CLI, no spreadsheet formula interpretation, fixed configured destination, no second write path or custom backup queue. Script locks do not cover human edits; readback and no-edit operator guidance bound that residual risk.
- Ponytail final review: shared actual publisher rules replace duplicate preview logic; native batch replaces clear/write loops, without new dependencies or staging sheets. Bootstrap tooling beyond this publishing boundary remains out of scope.
- Live activation next requires approved test copies, service authorization and Google Apps Script validation. Production deployment remains separate; CSV propagation and frontend catalog consistency remain batch-two work.
- Final local verification: `npm test` passed 21 suites / 101 tests; `npm run build`, `npm run build:pages`, `node --check scripts/build-publish-preview-from-master.mjs`, and `git diff --check` passed. Both builds retain the pre-existing large-chunk warning. The production Apps Script service and its authorization were not exercised.
- The original workspace still has only the pre-existing `data/restaurants.json` diff (4221 insertions / 76 deletions), untouched by this batch. The repair uses its separate worktree; no main/deploy branch merge is included.
