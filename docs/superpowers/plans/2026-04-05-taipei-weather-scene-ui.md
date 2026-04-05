# 台北天氣場景化 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Taipei weather forecasts drive the homepage scene system and redesign the interface so the background stays visible while gameplay remains fast.

**Architecture:** Add a browser-side official CWA script loader, normalize Taipei forecast data into typed scene selections, and rebuild the homepage into a two-panel HUD over a full-screen weather scene. Keep expedition gameplay logic intact and make weather loading additive rather than blocking.

**Tech Stack:** React, TypeScript, Vitest, Vite, CWA official county forecast script

---

## File Structure

- `src/features/weather/`: official data loading, parsing, scene mapping, Taipei hook
- `images/backgrounds/manifest.json`: scene and weather variant mapping
- `src/App.tsx`: weather-driven shell and gameplay orchestration
- `src/styles.css`: full-screen scene UI and responsive HUD
- `src/test/weather-scene.test.ts`: weather parsing and scene mapping tests
- `docs/*.md`: active docs synced to shipped behavior

## Tasks

1. Add typed CWA county forecast parsing and Taipei snapshot derivation.
2. Map CWA weather codes to the scene manifest and asset URLs.
3. Rebuild the homepage into a visible-background weather HUD plus destiny altar.
4. Preserve expedition flow, rerolls, and fallback behavior.
5. Sync active docs and verify both local and Pages builds.
