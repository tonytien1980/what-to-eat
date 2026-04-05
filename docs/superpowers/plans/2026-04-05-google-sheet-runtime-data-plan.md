# Google Sheet Runtime Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the restaurant catalog to runtime Google Sheet loading while preserving a bundled fallback snapshot for reliability.

**Architecture:** Move published sheet URLs into one data file, add a browser-side loader that parses CSV into restaurant records, and wrap the result in a hook that exposes live or fallback status to the app. Keep existing expedition logic intact by injecting the loaded restaurant array instead of importing a static global list.

**Tech Stack:** React, TypeScript, Vitest, Vite, browser fetch, published Google Sheets CSV

---

## File Structure

- `data/restaurant-sheet-sources.json`: published sheet URLs by category
- `src/features/restaurants/google-sheet-loader.ts`: runtime CSV parsing and normalization
- `src/features/restaurants/use-restaurant-catalog.ts`: runtime loading + fallback state
- `src/features/restaurants/data.ts`: fallback snapshot exports and sheet source wiring
- `src/features/spin/useExpedition.ts`: restaurant-array injection
- `src/test/google-sheet-loader.test.ts`: loader and fallback coverage
- `docs/*.md`: active docs synced to the new data strategy

## Tasks

1. Add a failing test for runtime Google Sheet loading and fallback behavior.
2. Move sheet URLs into a single shared data file.
3. Implement runtime CSV parsing and restaurant normalization.
4. Add a hook that exposes live or fallback catalog state to the app.
5. Refactor expedition logic to consume injected restaurant arrays.
6. Update docs and verify tests, build, Pages build, and snapshot refresh.
