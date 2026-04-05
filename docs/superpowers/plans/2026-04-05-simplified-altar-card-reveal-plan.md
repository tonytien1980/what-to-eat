# 簡化祭壇與翻牌揭示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the altar UI and replace the visible destiny-card concept with a weighted card-back to destination reveal flow.

**Architecture:** Keep the internal restaurant filtering logic, but treat it as hidden gameplay. Introduce a weighted card-back deck module, extend expedition rounds to carry the chosen back, and rebuild the central altar into a reduced-information layout with a tall single-card reveal stage and detached action buttons.

**Tech Stack:** React, TypeScript, Vitest, Vite, CSS animations, local WebP card-back assets

---

## File Structure

- `src/features/card-backs/`: weighted back definitions and selection logic
- `src/features/spin/useExpedition.ts`: round state extended with selected back and longer reveal timing
- `src/components/destiny-card-view.tsx`: rebuilt into tall reveal card with back/front states
- `src/App.tsx`: simplified altar layout and detached result action row
- `src/styles.css`: header cleanup, fantasy tab/button styling, rarity glow, reveal effects
- `src/test/`: weighted selection tests and updated UI flow tests
- `docs/*.md`: active docs synced to the shipped UI and interaction changes

## Tasks

1. Add failing tests for weighted card-back selection and the new reveal flow expectations.
2. Create a weighted card-back deck module from `images/backs/`.
3. Extend expedition rounds to choose a back on start and reroll.
4. Rebuild the main layout into a simplified two-line title + two-line weather header.
5. Replace the current card content with a tall back/front reveal card and detached actions.
6. Update docs, run automated verification, browser QA, and deploy Pages.
