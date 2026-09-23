# Batch One: Weather Truth And Publish Safety

## Approval And Boundaries

- The owner approved batch one after the 2026-09-23 audit: weather correctness, failure/staleness, forecast time, and publish deletion guards.
- Execute inline in `codex/batch-one-data-safety`; no physical subagents.
- Do not change the original dirty `data/restaurants.json`, gameplay, distance, long-name layout, dependencies, or deployment workflow.
- No production deployment, live Sheet write, or live Apps Script update. Atomic Sheets publishing requires the separately requested owner approval.

## Design

The canonical weather owners remain the managed town table, CWA loader, weather hook, and background selector. Cover all 12 Taipei districts using official `Info_Town.js`. Use the same timestamped `Time_3hr` / `TempArray_3hr` entry for temperature, apparent temperature and weather; do not mix in GT observations. Select the applicable forecast interval and reject expired/malformed data. Label the temperature range as future 24 hours, not today. No fabricated fallback forecast.

The hook keeps last-good data only for the same location, labels refresh failure/expiry, and clears it when changing location. With no forecast, use a neutral shared background and unavailable/loading copy. Keep the existing focus/visibility/5-minute refresh; failed requests are evicted, script loading times out, and cache storage stays bounded. Unmapped and city-only selection must never masquerade as Zhongshan.

For publish safety, the existing Apps Script remains the owner. Validate every required header and flag before writes, reject empty/invalid projections, show proposed changes for explicit confirmation, revalidate under a script lock after confirmation, and perform all four sheet replacements in one native atomic batch. Verify values before reporting success. A network error is an unknown outcome, not permission to blindly retry. This native write-method change is pending explicit approval.

## Execution Checklist

- [x] Establish clean isolated baseline with `npm test` (58 tests passed).
- [x] Write failing real-mapping, time-window, malformed-data, script-failure/retry/timeout, weather-hook and unavailable-UI tests in `src/test/`.
- [x] Implement weather table/loader/hook/App/background changes and run targeted tests.
- [ ] If approved, test the actual `Code.gs` in a VM with read/write/lock doubles, then implement schema guards and atomic publishing. Verify missing flags, empty master, cancellation, changed inputs, failed batch and readback mismatch cause no false success.
- [x] Align architecture, UX, QA and README with the weather implementation and pending activation. Apps Script is unchanged pending approval.
- [x] Run full tests (64 passed), both builds, focused local browser checks, correctness review and Ponytail final-diff review for the weather scope.
- [ ] Commit only this work and sync the non-deploying feature branch to GitHub. Report activation limits and the original dirty worktree separately.

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
- Sheet publisher safety remains unimplemented while the separately requested atomic-write approval is pending. The complete first batch is therefore not closed.
