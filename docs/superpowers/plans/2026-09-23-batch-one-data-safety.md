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

## 2026-09-24 Test-Copy Acceptance Checkpoint

Status at the 2026-09-24 checkpoint: prepared; awaiting human confirmation of Google API terms. See the 2026-09-25 continuation below for the current blocker. Live acceptance has **not** passed.

- The owner approved test-copy acceptance only. The earlier no-live-write boundary is lifted for these test copies, not for production, deployment, or account-wide permission changes.
- Created native copies in the private My Drive `ChatGPT` folder. Both Sheet UIs show owner-only sharing; no sharing permissions were changed.
- [Master copy](https://docs.google.com/spreadsheets/d/1rR4Yt5Bz2fxkKntWxj3V6tkB-M2-y5IjQ_WeyhAO7xs/edit): `restaurants_master`, sheet ID 0, grid 2421 x 26.
- [Publish copy](https://docs.google.com/spreadsheets/d/1Wucd9jIFUweyvAsxIoHsmZgaBETtKGtlTQjnOcG2Y8g/edit): four original category tabs, IDs 1292660499 / 2000631709 / 1592174170 / 2025510556.
- [Copy-bound Apps Script](https://script.google.com/u/0/home/projects/1X7bOGgtQtSh2HZtne7-o5huTPar_TpKOkA6H4hU0E86IpbUc-ka72EZv/edit): renamed `what-to-eat-acceptance-2026-09-24`.
- The copied old script initially retained production IDs. Before any manual function execution, replaced its source with commit `7af80c1459c4fc29c5e18bfd4c490f57a6c398c8` Code.gs, substituting only the two verified copy IDs. The repository config remains unchanged.
- Saved editor content was selected and copied back through the UI: exact equality with the pasted source; no production ID present. Its 11693 UTF-16 code units / FNV-1a `e6ef3be3` match the locally derived test source. Local derived-source SHA-256: `c359425721ea77c665ae4e47292fe7d510da3c6180470da86e4c86d44dfbf081`.
- Selected `Google Sheets API`, version `v4`, identifier `Sheets` in Add Service, but **did not click Add**: the dialog requires agreement to Google API terms. No preview or publish was manually run, no test fixture values written, and no account access consent granted.
- Read-only connector checks of copy `A1:A2421` and `H1:L2421` found 69 enabled rows with all four categories false. Examples: row 48 `すき家(士林店)`, row 58 `吉野家(重北店)`, row 64 `麥當勞(民生三店)`, row 65 `摩斯漢堡(台北重慶店)`, row 70 `鬍鬚張(寧夏店)`. These are expected blockers under the existing contract, not a live execution result. Do not classify or disable production rows without owner approval.
- Fresh local `npm test`: 21 suites / 101 tests passed. Builds were not rerun in this docs-and-copy preparation turn; their earlier passing evidence is recorded above.
- No production spreadsheet, production script, runtime source URL, frontend code or Pages deployment was modified. Original worktree still has its pre-existing restaurant snapshot diff (4221 insertions / 76 deletions), untouched.

Resume from these existing copies; do not create another pair:

1. Obtain confirmation before accepting the Add Service terms. Complete any subsequent Google account-access consent with the owner; do not bypass warnings or enable account-wide Apps Script API settings as a workaround.
2. Recheck copy-only script config and service state, then run read-only `previewMasterPublishSync` for authorization. Verify the copied-data blockers in the actual Google runtime.
3. Use controlled fixtures only in the test master for success, cancellation, missing-header, all-empty/all-disabled, single-category-clear warning and changed-during-confirmation cases. Read back all four published A:G ranges; verify H+ and formatting preservation. Restore the test fixture deliberately and record its final state.
4. Report actual Google runtime results separately from VM coverage and any untested failure injection. Production activation, data correction and frontend CSV propagation remain separate gates.

## 2026-09-25 Consent And Browser Blocker

- The owner confirmed acceptance of the Google API terms and adding Sheets API v4 to the existing test project. This exact approval is recorded; do not ask for it again unless its scope or terms change. Subsequent account-access consent remains a separate boundary.
- Chrome inventory still lists the same test project and both copies. Selecting the script page by URL and then its current tab ID timed out. The documented same-browser Playwright alternative also timed out on `Emulation.setFocusEmulationEnabled` before returning page content.
- No Add click, preview, publish, spreadsheet write or script edit was sent in this continuation. Current service/auth state could not be reverified; do not infer it from the prior dialog or mark acceptance passed.
- Requested that the owner open and refresh the existing test project in Chrome, keep it open, and report readiness. Resume by reading the actual page, checking copy-only IDs and existing services, then applying the already-approved Add action only if still needed. Do not create another copy or use a different authorization/write path to bypass the failed browser control.
- This continuation changes documentation only; local code tests/builds were not rerun. The previous 101-test result remains historical, not live acceptance evidence. The original workspace still contains only the pre-existing restaurant snapshot diff (4221 insertions / 76 deletions), untouched.

## 2026-09-25 Service Added; OAuth Blocked

- After the owner reopened the existing test project, Chrome page control recovered. The editor still showed both verified test-copy IDs, not production IDs.
- Selected Google Sheets API v4, clicked Add under the existing explicit approval, and observed the `Sheets` dependency plus saved-to-Drive confirmation. No other service was added.
- Selected `previewMasterPublishSync`, clicked Run, then Review permissions. Google displayed only `系統已封鎖這個應用程式`, explaining that access to sensitive account information was blocked; there was no consent/continue control. No access was granted and no bypass was attempted. The OAuth URL and transient authentication parameters are intentionally not recorded.
- Stopped the pending preview in the editor; its execution log showed `已取消執行`. No publish was invoked, no fixture data was written, and no runtime master validation result was obtained.
- Project Overview confirmed the owner is the current account and the container is the existing publish copy. It lists exactly one scope: `https://www.googleapis.com/auth/spreadsheets` (account spreadsheet access). Copy-only constants constrain code targets, not OAuth permissions.
- Project Settings confirmed GCP `預設`, Taipei timezone and V8 enabled. No Cloud binding, manifest, account protection, permission or source-code change was made beyond adding the approved Sheets service.
- The precise account/client policy behind the denial remains unknown. Google's [authorization guide](https://developers.google.com/apps-script/guides/services/authorization) points this class of issue to OAuth verification. Do not infer a specific account-protection setting or promise that reconfiguration will fix it. Any standard Cloud project/OAuth setup or verification submission needs separate approval; [switching projects](https://developers.google.com/apps-script/guides/cloud-platform-projects) cannot restore the default project and may require reauthorization.
- Live acceptance remains blocked before data validation; success, cancellation, empty-master/header guards, category-clear warnings and readback scenarios remain untested in Google runtime. The earlier 69-row data finding is separate from this authorization denial.
- Repository changes in this continuation are documentation only; no code tests/builds were rerun. Resume with the same copies after an approved OAuth remedy and successful consent, not with a duplicate app or direct connector publishing workaround.
