# 塔羅命運卡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the destiny card into a fantasy tarot-style reveal with a dedicated card back, stronger card-face styling, and tests that prove the reveal order.

**Architecture:** Keep the existing expedition timing model, but split card presentation into a revealing card-back state and a revealed face state. Drive the visuals with CSS-only ornamentation and accent tokens so gameplay logic stays unchanged.

**Tech Stack:** React, TypeScript, Vitest, Vite, CSS animations

---

## File Structure

- `src/components/destiny-card-view.tsx`: tarot card back/front rendering
- `src/styles.css`: card frame, accent tokens, and reveal animations
- `src/test/destiny-card-flip.test.tsx`: reveal order coverage
- `src/test/expedition-flow.test.tsx`: integration flow coverage
- `docs/*.md`: active docs synced to shipped behavior

## Tasks

1. Add a dedicated card-back state for the revealing phase.
2. Upgrade the face card into a tarot-style frame with accent-driven visuals.
3. Verify reveal order and reroll flow with tests.
4. Sync active docs and superpowers docs.
5. Rebuild local production and Pages artifacts before push.
