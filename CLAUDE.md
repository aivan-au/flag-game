## Purpose
This is a single-page progressive web app that challenges players to match flag images to country names. The codebase uses **Vite** for development (HMR/hot reload) and production builds. Use this document as the jump‑off point instead of inspecting every PNG or audio file.

## Layout & Key Files
- `index.html`: entry point. Loads `styles.css` and `app.js` (as ES module). Vite processes this file and injects HMR client in dev mode.
- `app.js`: main ES module — game logic, DOM bindings, audio helpers, state machine, options modal, progression toggle/path rendering, and service worker registration. Imports from `countries.js` and `challenges.js`. Look here first for behavior changes.
- `countries.js`: ES module exporting `countries` (193 countries with `rank` field) and `packs` object that drives pack-based selections. Packs are arrays of ISO codes used by `app.js`.
- `challenges.js`: ES module exporting `progressionChallenges` (54 challenges). Countries ordered by rank, grouped into chunks of 5 with a review challenge after every 4 regular ones. **DO NOT reorder or modify** — player progress in `localStorage` references these by index.
- `styles.css`: all styling, imported by `index.html`.
- `public/`: static assets served as-is by Vite (not processed/hashed). Contains:
  - `assets/flags/` — all flag PNGs
  - `assets/audio/` — voice packs (per voice ID) and shared audio
  - `assets/images/` — pack images, result icons
  - `assets/icons/` — PWA manifest icons
  - `manifest.json` — PWA metadata
  - `sw.js` — service worker for offline support (cache: `flag-game-1.3.0`)
- `vite.config.js`: Vite configuration (port 4173, output to `dist/`).
- `package.json`: npm scripts (`dev`, `build`, `preview`).
- `scripts/generate_audio.py`: helper to process audio assets. Run inside the `.venv` if new audio needs generating.
- `.venv/`: existing virtual environment configured in the project root. Activate it before running any Python tooling (`source .venv/bin/activate`).
- `.gitignore` / `.git`: keep working tree clean; repository already tracks https://github.com/aivan-au/flag-game.git.

## Game Flow Summary

### Practice Mode (default)
1. `start-screen` renders pack selector + start button. Default pack is `world`.
2. Clicking **Start** toggles `state.audioAllowed`, ensures background music runs, then calls `startGame()`.
3. `startGame()` picks the selected pack (via `packs` in `countries.js`), fills `state.pool`, and begins question loop by calling `nextQuestion()`.
4. Each question:
   - Picks an unused country from `state.pool`.
   - Shuffles one correct option plus three wrong options (`generateOptions()`).
   - Loads the flag image from `assets/flags/<code>.png`.
   - Reveals options sequentially with a short delay (`CONFIG.optionRevealDelay`).
   - Optionally plays audio clips for each eligible country (question, positive/negative, celebration, score, country names).
5. `handleGuess()` locks the UI, stops audio, highlights results, updates score, and either ends the game or enables the **Next** button.
6. `endGame()` shows the end screen and, if sound is enabled, plays celebration/score cues.

### Progression Mode
1. Toggling the **Progression** switch in the header hides the pack grid and start button, showing the challenge path instead.
2. The path is a Duolingo-style vertical zigzag of numbered circles. Visual states: **completed** (gold `#EEBA09`), **unlocked** (purple `#430098`), **locked** (grey with lock icon).
3. Zigzag pattern per group of 5: center → right → left → right → center. Direction alternates each group (right-first, then left-first). Vertical connector between groups.
4. Review nodes (every 5th challenge) are 1.5x larger than regular nodes (84px vs 56px).
5. Clicking an unlocked/completed circle calls `window.startProgressionChallenge(index)`, which sets up the game with the challenge's specific country codes and question count (bypassing settings).
6. Challenge structure (from `challenges.js`): 4 regular challenges of 5 new flags (100% to pass), then 1 review of all flags so far (10 shown, 80% to pass). 54 challenges total covering 193 countries.
7. End screen adapts: **pass** → "Challenge complete!" + **Continue** button (starts next challenge); **fail** → "Not quite — try again!" + **Try Again** button (replays same challenge).
8. Progress is saved in `localStorage` key `progressionCompleted` (integer: number of challenges completed). Path re-renders via `window.renderProgressionPath()` when returning to start screen.

### Shared State
State is kept in the `state` object (pool, used codes, question number, score, audio flags, selected pack, `isProgression`, `progressionChallenge`). Audio sources are derived from `AUDIO_SOURCES`, with shared `AUDIO_BASE_PATH` using voice ID `kPzsL2i3teMYv0FxEYQ6`. Changing voice/audio files means updating `public/assets/audio/<voice-id>/`.

### Module Structure
All JS files use ES module `import`/`export`. The dependency graph is:
- `app.js` imports from `countries.js` and `challenges.js`
- `window.startProgressionChallenge` and `window.renderProgressionPath` are still exposed on `window` for internal use within `app.js` (progression path click handler and screen transitions).

## Path & Asset Notes
- Static assets live under `public/` and are served at the root URL (e.g., `public/assets/flags/us.png` → `/assets/flags/us.png`).
- Flags: `public/assets/flags/` named by ISO code (`af.png`, `us.png`, etc.). `CONFIG.flagBasePath` assumes `assets/flags`.
- Audio: `public/assets/audio/<voice-id>/question.mp3`, `positive.mp3`, `negative.mp3`, `celebration.mp3`, `score_<value>.mp3`, plus country codes.
- Manifest icons reference `assets/icons/icon-192.png` and icon-512.
- `public/sw.js` registers the service worker for offline support. It expects the same relative structure; avoid renaming `public/assets/` without updating `sw.js`. When adding new assets, add them to the appropriate array in `sw.js` and bump the cache version.
- The production build (`dist/`) copies `public/` contents to the root and bundles/hashes JS/CSS into `dist/assets/`.

## Development Hints
- **Dev server:** `npm run dev` starts Vite with HMR on port 4173. Edits to JS/CSS are reflected instantly without full page reload.
- **Production build:** `npm run build` outputs to `dist/`. Preview with `npm run preview`.
- **Service worker:** Automatically disabled in dev mode (`import.meta.env.DEV`). Also disabled with `?dev` query param. In production builds, the SW registers from `/sw.js`.
- Use the `.venv` before running `scripts/generate_audio.py` — it contains the necessary dependencies. Example:
  ```bash
  source .venv/bin/activate
  python3 scripts/generate_audio.py <arguments>
  ```
- **macOS filesystem note:** The directory is named `LAB26` (uppercase). macOS filesystem is case-insensitive, so `Lab26` may appear to work but can cause path resolution issues. Always use the exact casing: `/Users/aivan/LAB26/FlagGame`.
- When editing `countries.js`, keep object formatting consistent; packs expect arrays of lowercase ISO codes.
- Audio playback is gated behind `state.audioEnabled` (which follows user interaction). Tests should simulate clicking the start button if you need to verify audio behavior.
- Score threshold and total questions live in `CONFIG`. Adjust there for game difficulty tweaks instead of spreading values elsewhere.
- UI toggles `hidden`, `show`, `is-hidden`, and `selected` classes declared in `styles.css`. Changing class names requires syncing CSS and JS selectors.

## Recommended Next Steps for an Agent
1. Target specific modules instead of brute-forcing content: start with `app.js` for behavior, `countries.js` for data, `challenges.js` for progression definitions, and `styles.css` for presentation.
2. If new audio sets are needed, consult `scripts/generate_audio.py` and update `public/assets/audio/<voice-id>/` accordingly.
3. Any path change (flags, icons, scripts) must be reflected in `index.html`, `public/manifest.json`, `public/sw.js`, and `app.js` to avoid broken assets.
4. Service worker caching is static: update `public/sw.js` when adding/removing files so the cache list stays accurate. Always bump `CACHE_NAME` version.
5. **Do not reorder `challenges.js`** — player progress is stored as an index into this array.
6. `window.startProgressionChallenge` and `window.renderProgressionPath` are exposed on `window` within `app.js` for internal cross-reference in the progression path click handler.
7. Document new hooks in this file if you add utilities that future agents should know (e.g., new config values, audio voices, or helper scripts).

## Testing & Validation
- Manual: Run `npm run dev` and exercise Start button, selecting packs, answering questions, and verifying audio toggles, progress, and score display.
- Progression mode: toggle on, click first circle, complete challenge, verify gold state and next unlock. Check `localStorage.getItem('progressionCompleted')` in devtools.
- The Vite dev server automatically disables the service worker. Use `?dev` query param as a fallback to unregister SW and clear caches.
- Since there's no automated test suite, rely on browser dev tools for console errors and `network` tab to confirm assets load.
- For production deploys, bump the `CACHE_NAME` version in `public/sw.js`. The SW activate event auto-deletes old caches.

## Communication Notes
- No database or backend — everything runs in the browser. Avoid searching server directories or running database migrations.
- Audio generation is the only Python-related concern; thus the `.venv` exists. Refer to the `scripts/` folder before adding new Python scripts.

## Collaboration & Preferences
See `LEARNINGS.md` for documented preferences on:
- Project approach (branching, experimentation, debug modes)
- Technical preferences (vanilla stack, inline SVG, CSS Grid)
- Design style (minimal, visual indicators, color palette)
- Communication patterns and decision-making style

This file captures learnings from past sessions to ensure consistent and efficient collaboration.
