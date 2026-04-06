# 2026-04-06 Location Detection And Fallback Design

## Goal

Turn `今天吃什麼` from a single-area toy into a location-aware product without adding login friction.

The system should support restaurant records with:

- `city`
- `district`

But the product should avoid forcing users to manually choose location every time they open or refresh the site.

## Product Decision

Use a `detect-first, confirm-lightly, remember-locally` strategy.

That means:

1. Try to infer the user's location automatically.
2. If inference is good enough, set the current city and district immediately.
3. Show the detected location in the UI as editable state, not as a blocking setup form.
4. Remember the last accepted location locally so page refreshes do not keep asking again.
5. Only ask the user to correct it when auto-detection is missing, denied, or obviously weak.

This keeps the experience lightweight while still making the product feel location-aware.

## Why Not Force Manual Selection Every Time

If the app asks `你現在在哪裡` every time:

- refresh becomes annoying
- same-screen group play gets slower
- the product feels like setup software instead of a quick lunch tool

If the app never allows manual correction:

- desktop and VPN users will get the wrong area often
- users lose trust quickly

So the right middle ground is:

- no repeated blocking prompt
- always visible current area
- one-tap correction when needed

## Recommended UX Flow

### First Visit

1. App loads with a temporary state:
   - `正在判斷冒險者所在位置`
2. System tries location detection in order:
   - local saved location
   - browser geolocation
   - IP-based city guess
   - no location
3. If a confident city + district is available:
   - use it directly
   - show `目前遠征地：臺北市中山區`
4. If only city is available:
   - use city
   - district remains empty
   - show `目前遠征地：臺北市`
   - offer `補上地區`
5. If detection fails:
   - show a lightweight chooser
   - city required, district optional

### Returning Visit

1. Read last accepted location from local storage
2. Use it immediately on first paint
3. Do not reopen the chooser
4. Provide a small `更改位置` entry near the current location line

### Manual Correction

The correction UI should be lightweight:

- city dropdown
- district dropdown filtered by city
- `略過地區` option
- `儲存並套用`

This should be a panel or sheet, not a full-page setup gate.

## Detection Priority

### 1. Local Storage

Best for returning users.

Store:

```json
{
  "city": "臺北市",
  "district": "中山區",
  "source": "manual",
  "saved_at": "2026-04-06T00:00:00+08:00"
}
```

Recommended behavior:

- load immediately if present
- treat manual choice as higher trust than auto-detected values
- expiry can be long, for example 30 days

### 2. Browser Geolocation

Best for mobile, acceptable for laptops, weaker for desktops.

Pros:

- highest chance to infer district-level location

Cons:

- requires permission
- users may reject it
- should not be triggered in a jarring way on every page load

Recommended use:

- only ask once if no saved location exists
- if denied, remember that denial state locally and stop asking repeatedly

### 3. IP Geolocation

Best fallback when browser location is unavailable or denied.

Pros:

- no permission prompt
- often good enough for city

Cons:

- district may be wrong
- office networks, VPN, and desktop browsing reduce accuracy

Recommended use:

- use for city default
- only trust district when accuracy is explicitly good enough from provider metadata

### 4. Manual Selection

Always available, but not forced by default.

This is the trust recovery path.

## Recommended UX Copy

### Location Line

- `目前遠征地：臺北市中山區`
- `目前遠征地：臺北市`
- `尚未設定遠征地`

### Action Links

- `更改位置`
- `補上地區`
- `使用目前位置`

### One-Time Permission Prompt

Use soft language:

- `要不要用你附近的地區幫你抽？`

Avoid hard setup language like:

- `請先設定地理位置`

## Data Model Changes

Restaurant rows should add:

- `city`
- `district`

Recommended filtering order:

1. `city + district`
2. `city only`
3. fallback to all enabled restaurants

This avoids dead ends in sparse districts.

## Detection Confidence Rules

Use this simple trust model:

- `manual`: highest trust
- `geolocation`: high trust
- `ip-city`: medium trust
- `unknown`: no trust

Recommended UI response:

- high trust: no interruption
- medium trust: use it, but surface `確認地區`
- no trust: open lightweight chooser

## Refresh Behavior

The app should not ask again on every refresh.

Rules:

1. If saved location exists, use it silently.
2. If geolocation was denied before, do not re-prompt on refresh.
3. If no saved location and no denial record exists, one soft prompt is acceptable.
4. Manual edits overwrite auto-detected values.

Suggested local flags:

```json
{
  "location_prompt_state": "accepted | dismissed | denied",
  "location_last_source": "manual | geolocation | ip"
}
```

## Desktop And Mobile Reality

### Mobile

- geolocation is often good enough for district
- best chance of accurate `city + district`

### Desktop

- city inference is often acceptable
- district is less reliable
- more likely to need manual correction

So the product should accept:

- mobile users may get district automatically
- desktop users may only get city automatically

That is still useful.

## Recommended Versioning

### Phase 1

Implement:

- restaurant `city` and `district` fields
- local saved location
- lightweight location display and correction UI
- filter order `district -> city -> fallback`

Do not implement:

- browser geolocation yet
- IP geolocation yet

Why:

- fastest path to productization
- lowest technical risk
- lets the user control correctness

### Phase 2

Add:

- browser geolocation
- denial memory
- optional IP city fallback

This is when the product begins to feel smarter without adding login.

## Recommendation

For this product, the best strategy is:

- `remember first`
- `auto-detect second`
- `manual correction always`

In practical terms:

- do not force location picking on every visit
- do not hide the detected area from the user
- do not rely on desktop auto-detection being district-accurate

The winning UX is:

`預先幫你猜，但永遠讓你輕鬆改。`
