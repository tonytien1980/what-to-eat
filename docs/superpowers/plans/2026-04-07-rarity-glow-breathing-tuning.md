# Rarity Glow And Breathing Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tune card glow and breathing motion so each rarity tier reads clearly, especially separating `common` from `rare`.

**Architecture:** Keep the existing rarity token system in CSS, but rebalance the common tier toward material detail instead of glow, and add tier-specific aura / glow breathing for `rare`, `epic`, and `legendary` while preserving the distinct hidden scan treatment.

**Tech Stack:** React, CSS animations, Vite, Vitest, GitHub Pages

---

## Tasks

1. Write the approved motion/rarity rules into a short design spec and keep implementation aligned to it.
2. Rebalance rarity tokens in `src/styles.css` so `common` has weaker halo and stronger frame definition.
3. Add tier-specific breathing animations for `rare`, `epic`, and `legendary`, while keeping `hidden` anomaly-driven.
4. Update active docs to describe the new rarity differentiation and validation expectations.
5. Run `npm test`, `npm run build`, and `npm run build:pages`, then push and verify Pages deploy.
