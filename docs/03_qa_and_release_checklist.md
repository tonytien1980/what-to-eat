# 03 QA And Release Checklist

## MVP Functional Checks

- category switch changes the candidate pool
- destiny card is drawn before each expedition
- spin result always belongs to the active category
- filtered card falls back safely when no record matches
- result screen shows correct destination name
- map button opens the selected restaurant URL
- every round exposes at least one reroll path
- bonus reroll appears correctly when special destiny rules grant it

## Quality Checks

- Traditional Chinese copy is consistent
- mobile viewport remains usable
- large titles do not overflow
- disabled or missing data states are readable
- animations do not block the final result
- reduced-motion users still get a valid quick reveal

## Verification Commands

The active commands will be updated alongside implementation, but the MVP must maintain:

- automated tests for data and selection logic
- production build verification
- lint or typecheck verification if configured

Current commands:

- `npm test`
- `npm run build`

## Release Rule

Do not stage, commit, or push changes that alter:

- gameplay rules
- data contracts
- visible UI copy
- setup steps

without updating the relevant docs in this folder.
