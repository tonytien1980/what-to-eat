# Location-Aware Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first location-aware productization layer without introducing login, geolocation, or IP-based detection.

**Architecture:** Keep weather fixed to the existing Zhongshan-district runtime, but make the restaurant catalog location-aware. Extend the restaurant schema with `city` and `district`, persist a lightweight local location preference, add a non-blocking correction sheet, and update destination selection to resolve `district -> city -> fallback`.

**Tech Stack:** React, TypeScript, Vitest, Vite, browser localStorage, Google Sheet runtime CSV, JSON fallback snapshot

---

## File Structure

- `src/features/restaurants/types.ts`: extend catalog/location contracts
- `src/features/restaurants/google-sheet-loader.ts`: parse optional `城市` / `地區` columns and normalize defaults
- `src/features/restaurants/selectors.ts`: add location-aware candidate resolution
- `src/features/restaurants/use-restaurant-catalog.ts`: keep existing runtime data loading contract intact
- `src/features/location/`: new local saved-location state, defaults, and helper selectors
- `src/components/`: lightweight location status row and correction sheet
- `src/App.tsx`: wire current location, correction UI, and location-aware counts into the altar flow
- `src/test/`: cover loader parsing, selector fallback order, persisted location state, and visible UI states
- `data/restaurants.json`: enrich fallback snapshot with `city` / `district`
- `docs/00-03*.md`: sync product, data model, UX, and QA language to shipped Phase 1 behavior

## Tasks

1. Add failing tests for `city` / `district` parsing, local saved location, and `district -> city -> fallback` selection.
2. Extend the restaurant record schema and Google Sheet loader to support location columns while preserving backward compatibility.
3. Add a lightweight location state module that stores manual city / district selection in localStorage.
4. Build the minimal current-location row and manual correction sheet without introducing a blocking setup gate.
5. Connect the expedition board and selection logic to the new location-aware candidate pool and visible location status.
6. Update fallback snapshot data, sync active docs, run verification, deploy GitHub Pages, and confirm the live build.
