# 2026-04-06 Artwork Safe Frames And Flip Design

## Scope

This note locks two assets and one interaction pattern:

- category button art under `images/notice/`
- primary CTA scroll under `images/scrolls/`
- destiny-card flip reveal under `src/components/destiny-card-view.tsx`

The goal is to stop future art swaps from breaking alignment, while making the card reveal feel more ceremonial.

## Category Button Safe Frame

Current approved art:

- `images/notice/category_button_tavern_idle.webp`
- `images/notice/category_button_tavern_active.webp`

Canvas:

- `768 x 384`

Measured visible art bounds:

- left `72`
- top `66`
- right `696`
- bottom `318`
- visible art size `624 x 252`

Recommended working rules:

- keep the wood/plaque body inside the measured visible art bounds
- keep idle and active art on the exact same bounds
- avoid shifting the plate horizontally between states
- keep decoration changes outside the text-safe box when possible

Recommended label-safe box:

- x `192`
- y `138`
- width `384`
- height `108`

This keeps text centered within the readable plaque core instead of drifting into side ornaments.

Guide asset:

- [category-button-safe-frame.svg](/Users/oldtien_base/Desktop/今天吃什麼/docs/superpowers/specs/assets/category-button-safe-frame.svg)

## Scroll CTA Safe Frame

Current approved art:

- `images/scrolls/_cta_scroll_regen_fix.webp`

Canvas:

- `1536 x 1024`

Measured visible art bounds:

- left `56`
- top `276`
- right `1479`
- bottom `710`
- visible art size `1423 x 434`

Important note:

- the visible scroll object includes both the rolls and the parchment window
- CTA copy should align to the parchment window, not to the outer object bounds

Recommended parchment-safe box:

- x `332`
- y `362`
- width `872`
- height `172`

Recommended CTA label box:

- x `430`
- y `420`
- width `676`
- height `92`

This box is intentionally slightly above the parchment center so the label reads visually centered once the bottom ornament weight is considered.

Guide asset:

- [scroll-cta-safe-frame.svg](/Users/oldtien_base/Desktop/今天吃什麼/docs/superpowers/specs/assets/scroll-cta-safe-frame.svg)

## Flip Enhancement Direction

Keep the existing gameplay phases:

- `idle`
- `revealing`
- `spinning`
- `result`

Enhance the reveal without rewriting the flow:

1. `revealing`
   - stronger aura swell behind the card
   - slight image scale and luminance charge-up on the back
   - one subtle ritual ring to focus attention

2. `spinning`
   - more pronounced 3D flip entry
   - short flash/shockwave at the transition moment
   - clouds split faster and brighter so the destination feels "summoned"

3. `result`
   - one settle pulse on the card glow
   - result face should feel landed, not just swapped in

Accessibility:

- reduced-motion still resolves quickly with no prolonged shake or repeated flashes

## QA Targets

- category buttons remain fully visible on a narrow mobile viewport
- scroll CTA copy stays inside the parchment-safe box
- card reveal feels stronger, but still resolves in under the current interaction budget
- no regression in reroll flow, result rendering, or reduced-motion behavior
