# CWA Town Location Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hard-coded CWA town mapping in code with a managed data table.

**Architecture:** Add a JSON-backed mapping table under `data/`, load it through a focused weather helper module, and keep the weather runtime using that helper for location-aware town forecast lookup.

**Tech Stack:** TypeScript, JSON data files, Vitest, Vite

---

## Tasks

1. Add tests that lock the managed-table lookup behavior and normalization rules.
2. Create `data/cwa-town-locations.json` and a dedicated weather helper that reads it.
3. Replace the hard-coded mapping in `cwa-county.ts` with the new helper.
4. Sync active docs to describe the mapping table as the weather lookup contract.
5. Run tests/build/pages build and deploy.
