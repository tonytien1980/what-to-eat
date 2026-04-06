# 2026-04-06 Refactor Gap Checklist

## Purpose

This document is a pre-refactor alignment checklist.

It compares:

- the active 4-file SSOT set under `docs/`
- the current runtime implementation under `src/`

It is not an implementation plan.

Its job is to answer one question:

> If we start the productization refactor now, are we blocked by conflicting docs, or simply by missing implementation?

## Source Of Truth Used For This Checklist

Primary reference order:

1. `docs/00_product_principles_and_scope.md`
2. `docs/01_system_architecture_and_data_model.md`
3. `docs/02_mvp_experience_and_gameplay_spec.md`
4. `docs/03_qa_release_and_doc_governance.md`

Working-spec references used only as secondary context:

- `docs/superpowers/specs/2026-04-06-location-detection-and-fallback-design.md`
- `docs/superpowers/specs/2026-04-06-artwork-safe-frames-and-flip-design.md`

## Bottom-Line Conclusion

Current state:

- there is no major contradiction across the active 4-file SSOT set
- a refactor can start without being blocked by docs fighting each other
- the main risk is stage confusion:
  - some requirements describe the currently shipped MVP
  - some requirements describe approved next-stage productization that is not fully implemented yet

So the current problem is:

- **not "docs conflict"**
- but **"docs are ahead of code in selected areas"**

## Category A: High-Confidence Alignment

These areas are broadly aligned between the active SSOT and the current codebase.

### Core Product Shape

Docs say:

- single-screen
- no login
- fast decision flow
- fantasy wrapper over lightweight decision-making

Code matches:

- `src/App.tsx`
- `src/features/spin/useExpedition.ts`
- `src/components/destiny-card-view.tsx`

### Google Sheet Primary Data Source With Snapshot Fallback

Docs say:

- Google Sheet is the main source
- bundled snapshot is fallback

Code matches:

- `src/features/restaurants/use-restaurant-catalog.ts`
- `src/features/restaurants/google-sheet-loader.ts`

### Card Back System

Docs say:

- weighted back draw
- rarity-matched face template
- reroll re-draws card back

Code matches:

- `src/features/card-backs/deck.ts`
- `src/features/spin/useExpedition.ts`
- `src/components/destiny-card-view.tsx`

### Zhongshan District Weather Source

Docs say:

- currently fixed to Taipei Zhongshan District official weather data

Code matches:

- `src/features/weather/cwa-county.ts`
- `src/features/weather/scenes.ts`
- `src/App.tsx`

### Flip / Reveal Flow

Docs say:

- reveal
- flip
- result
- reroll remains lightweight

Code matches:

- `src/features/spin/useExpedition.ts`
- `src/components/destiny-card-view.tsx`
- `src/styles.css`

## Category B: Docs Approved, Code Not Yet Implemented

These are the most important refactor targets.

### Restaurant Data Still Lacks `city` And `district`

Docs now expect:

- location-aware productization
- future filtering by `district -> city -> fallback`
- item-level `city` and `district`

Current code:

- `src/features/restaurants/types.ts`
  - `RestaurantRecord` still has no `city`
  - `RestaurantRecord` still has no `district`
- `src/features/restaurants/google-sheet-loader.ts`
  - still parses only `name` and `mapUrl`
  - no location columns are loaded

Impact:

- location-aware filtering cannot be implemented cleanly yet

### No Stored Location State

Docs approve:

- `detect-first, confirm-lightly, remember-locally`
- local saved location
- prompt-state memory
- manual correction path

Current code:

- `src/App.tsx`
  - no location line
  - no location source state
  - no correction entry
- no dedicated location state module exists

Impact:

- refactor needs a new state unit for location resolution and persistence

### No Location-Based Candidate Filtering

Docs approve:

- `district -> city -> fallback`

Current code:

- `src/features/restaurants/selectors.ts`
  - only filters by `category`, `isEnabled`, and destiny-card modifiers
  - no location-aware selection path exists

Impact:

- selection logic must be refactored, not just patched

### No Location Correction UI

Docs approve:

- lightweight chooser
- city dropdown
- district dropdown
- `略過地區`

Current code:

- no such UI exists in `src/App.tsx`
- no reusable location UI component exists in `src/components/`

Impact:

- refactor requires both new state and new visible UX

### No Geolocation / IP Detection Pipeline

Docs say:

- Phase 1 should still avoid geolocation / IP fallback
- but the architecture file already defines their future role and trust hierarchy

Current code:

- no browser geolocation use
- no IP lookup path
- no trust-state abstraction

Impact:

- not a blocker for Phase 1
- but should not be accidentally assumed to exist

## Category C: Gray Areas To Lock Before Implementation

These are not contradictory, but they need a deliberate choice before coding.

### What Exactly Counts As "Phase 1"

The active docs are mostly consistent, but they describe a larger location-aware direction in layers:

- `00` says the next formal productization direction is location-aware
- `01` describes the architecture and phased strategy
- `02` says this is approved next-stage UX, not fully live yet

This is workable, but before implementation starts we should explicitly lock:

- Are we implementing only:
  - `city/district data model`
  - local saved location
  - manual correction UI
  - `district -> city -> fallback`
- Or also implementing:
  - browser geolocation
  - prompt-state memory
  - IP city fallback

Recommended answer:

- implement the first group only
- leave geolocation and IP to a later phase

### Whether Weather Location And Restaurant Location Must Share The Same Source

Current code:

- weather is already fixed to Zhongshan District official data

Potential future behavior:

- restaurant candidate pool becomes city / district aware

Gray area:

- if the user later corrects location away from Zhongshan District, should weather also follow?

This should be decided before coding broader location-aware behavior.

Recommended current decision:

- for the next refactor, keep weather fixed to Zhongshan District
- treat restaurant location-awareness as a separate concern
- only unify them later if product intent becomes fully location-personalized

### How Much Of The Working Specs Should Move Into Active SSOT

The current active docs already absorbed a lot of the working-spec content.

This is good, but during refactor we should avoid a split where:

- behavior is updated in code
- only `docs/superpowers/specs/` is edited
- active 4-file SSOT is left stale

Recommended rule:

- during refactor, all behavior changes update only the active 4 SSOT files
- working specs may be updated only as support material

## Category D: Implementation Debt That Will Affect Refactor Quality

These are not spec contradictions, but they matter.

### Weather Logic Is Concentrated In One File

- `src/features/weather/cwa-county.ts` now mixes:
  - county parsing
  - town parsing
  - fallback creation
  - browser script loading

This still works, but location-aware refactor will be safer if weather parsing and location state are not added to the same file without further decomposition.

### Restaurant Loader Still Infers Metadata Heuristically

- `priceLevel`
- `distanceLevel`
- `tags`

are still inferred from name / category heuristics in `src/features/restaurants/google-sheet-loader.ts`

Once `city` and `district` are introduced, continuing to pile more implicit inference into this file will make it harder to reason about data correctness.

Recommended refactor direction:

- move toward explicit sheet columns where possible

## Refactor Readiness Verdict

If implementation starts now:

- **docs are ready enough**
- **code is not yet aligned with the approved productization direction**
- **the right interpretation is "planned and partially staged, not yet implemented"**

So the answer to:

> "Will we hit document contradictions if we start?"

is:

> No major contradictions. The main work is bridging the approved docs into the codebase.

## Recommended Pre-Implementation Lock

Before coding, the refactor should be declared to follow this scope:

### In Scope

- restaurant `city` / `district` schema
- Google Sheet parsing for those fields
- location state saved locally
- lightweight current-location display
- lightweight manual correction UI
- `district -> city -> fallback` selection

### Out Of Scope

- browser geolocation
- IP geolocation
- account system
- full restaurant detail pages
- broader platformization

## Short Answer For The Team

The active docs are now coherent enough to start.

The refactor risk is not conflicting specifications.

The real risk is implementing too much of the future location system at once instead of keeping the first productization phase narrow.
