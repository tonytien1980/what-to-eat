# Location-Aware Weather And Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make homepage weather and background selection follow the current expedition location instead of staying fixed to Zhongshan District.

**Architecture:** Add a location-to-CWA mapping layer in the weather feature, make the weather hook accept the current location, keep district-first background selection, and fall back safely when a district lacks formal assets or weather mapping.

**Tech Stack:** React, TypeScript, Vitest, Vite, GitHub Pages, CWA town scripts

---

## Tasks

1. Add tests for location-aware weather mapping, current official town-script shape support, and the new `3 小時預報` UI label.
2. Extend the weather module with reusable `city/district -> countyCode/townId` mapping and location-aware snapshot builders.
3. Update the weather hook and app shell so weather follows `currentLocation`.
4. Keep background selection district-aware, with district assets first and shared assets as fallback.
5. Sync active docs, run full verification, and deploy GitHub Pages.
