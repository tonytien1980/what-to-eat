# 今天吃什麼 Design Spec

## Problem

Groups often spend too long deciding what to eat. Existing random restaurant pickers solve speed, but they feel disposable and forgettable.

## Product Thesis

`今天吃什麼：命運遠征` should keep the speed of a random lunch picker while adding a light fantasy-adventure wrapper that makes the reveal fun enough for people to want to use it again.

## Target Experience

- no-login
- same-screen
- one group, one device
- minimal choice, mostly random
- resolved in 1-2 minutes

## Core Flow

1. Open the app
2. Choose a category
3. Start the expedition
4. Reveal a destiny card
5. Spin the destination pool
6. Show the destination
7. Launch maps or reroll once

## Design Constraints

- fantasy flavor should support decision speed, not slow it down
- destiny cards must be readable in one glance
- the app should remain deployable as a static frontend
- the first release should not depend on accounts or a backend

## MVP Scope

- category-based restaurant pools
- destiny card draw
- slot-machine animation
- destination reveal
- Google Maps launch
- one reroll path

## Non-Goals

- persistent user identity
- synchronous multiplayer
- ranking systems
- long-term progression
- deep narrative or battle systems

## Data Model

Restaurant data should include category, tags, price level, distance level, and map URL so destiny cards can influence the random pool with simple logic.

## UX Direction

The UI should feel like a tavern quest board meets a polished modern mini-app:

- readable on mobile first
- strong fantasy framing
- concise Traditional Chinese copy
- short, purposeful animation

## Acceptance Criteria

- a first-time user can start a round in under 30 seconds
- a round can end in under 2 minutes
- the final destination always belongs to the chosen category
- a valid maps URL is always available on the result screen
