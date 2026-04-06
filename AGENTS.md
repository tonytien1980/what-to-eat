# AGENTS.md

## Project Mission

Build `今天吃什麼` as a lightweight fantasy-adventure lunch decision service.
The product should feel playful, fast, and low-friction:

- resolve "what should we eat?" in 1-2 minutes
- default to randomness over manual selection
- use fantasy flavor as presentation, not heavy gameplay
- keep the first release single-screen and no-login

## Working Rules

1. Read `AGENTS.md` and the active docs in `docs/` before structural changes.
2. Keep docs and code in sync in the same working session.
3. Prefer the smallest shippable MVP over speculative features.
4. Preserve Traditional Chinese as the primary product language.
5. Do not add accounts, multiplayer sync, or progression systems in MVP unless the active docs change first.

## Source Of Truth

Active docs live in `docs/` and are consolidated into 4 formal SSOT files:

- `docs/00_product_principles_and_scope.md`
- `docs/01_system_architecture_and_data_model.md`
- `docs/02_mvp_experience_and_gameplay_spec.md`
- `docs/03_qa_release_and_doc_governance.md`

When docs overlap, use this precedence:

1. `docs/00_product_principles_and_scope.md` for product principles, boundaries, scope, and non-negotiable rules.
2. `docs/01_system_architecture_and_data_model.md` for target architecture, current runtime mapping, data model, and activation sequencing.
3. `docs/02_mvp_experience_and_gameplay_spec.md` for shipped UX, gameplay, copy, and visual behavior.
4. `docs/03_qa_release_and_doc_governance.md` for QA, release checks, verification commands, and doc-sync rules.

Design and implementation workflow docs live in:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`

## Engineering Constraints

- Start from a static-friendly frontend architecture.
- Keep data editable without a database in MVP.
- Write tests before production behavior changes when feasible.
- Verify with fresh commands before claiming work is done.
- Do not push to `main` directly during feature implementation.

## Release Expectations

- Local git state should stay clean and understandable.
- Keep GitHub remote in sync once a remote exists and verification passes.
- Update docs when UI terms, rules, data contracts, or setup steps change.
