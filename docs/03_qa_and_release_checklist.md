# 03 QA And Release Checklist

## MVP Functional Checks

- first load should show no selected category
- category switch changes the candidate pool
- runtime restaurant catalog loads from Google Sheet when available
- runtime restaurant catalog falls back to bundled snapshot when sheet loading fails
- one weighted card back is visible before the first draw begins
- card back rarity always matches the face template rarity
- reroll changes both the destination and the card back
- destiny card is drawn before each expedition
- visible card back is shown before the face card content appears
- spin result always belongs to the active category
- filtered card falls back safely when no record matches
- result screen shows correct destination name
- map button opens the selected restaurant URL
- every round exposes at least one reroll path
- bonus reroll appears correctly when special destiny rules grant it
- Taipei weather snapshot loads and updates the scene selection
- fallback weather snapshot still renders if official weather data cannot load
- reloading the page can rotate to another compatible scene for the same current weather variant

## Quality Checks

- Traditional Chinese copy is consistent
- mobile viewport remains usable
- large titles do not overflow
- category buttons and scroll CTA remain legible with the provided artwork
- disabled or missing data states are readable
- animations do not block the final result
- tall reveal card still resolves correctly on desktop and mobile
- transparent altar stage keeps the scene visible behind the card
- reduced-motion users still get a valid quick reveal
- imported reference snapshot remains available locally after build
- sheet source list and fallback snapshot stay aligned after `npm run data:import`

## Verification Commands

The active commands will be updated alongside implementation, but the MVP must maintain:

- automated tests for data and selection logic
- production build verification
- lint or typecheck verification if configured

Current commands:

- `npm test`
- `npm run build`
- `npm run build:pages`

Deployment:

- pushing `codex/initial-mvp` should trigger `.github/workflows/deploy-pages.yml`
- GitHub Pages should publish the `dist/` artifact from the workflow

## Release Rule

Do not stage, commit, or push changes that alter:

- gameplay rules
- data contracts
- visible UI copy
- setup steps

without updating the relevant docs in this folder.
