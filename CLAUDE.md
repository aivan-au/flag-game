## Purpose
This is a single-page progressive web app that challenges players to match flag images to country names. The codebase is static (no build step), so the agent can make edits directly in the root files and verify changes by serving `index.html` locally. Use this document as the jump‑off point instead of inspecting every PNG or audio file.

## Layout & Key Files
- `index.html`: entry point. Loads `styles.css`, `countries.js`, `app.js`, and registers `sw.js`. No bundler, so all paths are static-relative.
- `styles.css`, `assets/`, `manifest.json`, `sw.js`: UI, icons, service worker, and PWA metadata. Assets include `icons/` for manifests, `flags/` for all flag PNGs, and `audio/` with voice packs (per voice ID).
- `app.js`: game logic, DOM bindings, audio helpers, and state machine. Look here first for behavior changes.
- `countries.js`: master country list plus `packs` object that drives available selections. Packs are just arrays of ISO codes used by `app.js`.
- `scripts/generate_audio.py`: helper to process audio assets. Run inside the `.venv` if new audio needs generating.
- `.venv/`: existing virtual environment configured in the project root. Activate it before running any Python tooling (`source .venv/bin/activate`).
- `.gitignore` / `.git`: keep working tree clean; repository already tracks https://github.com/aivan-au/flag-game.git.

## Game Flow Summary
1. `start-screen` renders pack selector + start button. Default pack is `starter`.
2. Clicking **Start** toggles `state.audioAllowed`, ensures background music runs, then calls `startGame()`.
3. `startGame()` picks the selected pack (via `packs` in `countries.js`), fills `state.pool`, and begins question loop by calling `nextQuestion()`.
4. Each question:
   - Picks an unused country from `state.pool`.
   - Shuffles one correct option plus three wrong options (`generateOptions()`).
   - Loads the flag image from `assets/flags/<code>.png`.
   - Reveals options sequentially with a short delay (`CONFIG.optionRevealDelay`).
   - Optionally plays audio clips for each eligible country (question, positive/negative, celebration, score, country names).
5. `handleGuess()` locks the UI, stops audio, highlights results, updates score, and either ends the game or enables the **Next** button.
6. `endGame()` shows the start screen and, if sound is enabled, plays celebration/score cues.

State is kept in the `state` object (pool, used codes, question number, score, audio flags, selected pack). Audio sources are derived from `AUDIO_SOURCES`, with shared `AUDIO_BASE_PATH` using voice ID `kPzsL2i3teMYv0FxEYQ6`. Changing voice/audio files means updating `assets/audio/<voice-id>/`.

## Path & Asset Notes
- Flags live under `assets/flags/` named by ISO code (`af.png`, `us.png`, etc.). `CONFIG.flagBasePath` assumes this directory.
- Audio: `assets/audio/<voice-id>/question.mp3`, `positive.mp3`, `negative.mp3`, `celebration.mp3`, `score_<value>.mp3`, plus country codes. Ensure new packs include matching audio files if audio-enabled gameplay is critical.
- Manifest icons reference `assets/icons/icon-192.png` and icon-512. Keep these paths in sync if assets move.
- `sw.js` registers the service worker for offline support. It expects the same relative structure; avoid renaming `assets/` without updating `sw.js`.

## Development Hints
- No npm/pnpm/yarn. Static files mean browser refresh is enough. To host locally, run `python3 -m http.server 4173` (or similar) from the root. **Important:** Use `python3`, not `python` (the latter is not available on this system).
- Use the `.venv` before running `scripts/generate_audio.py`—it contains the necessary dependencies. Example:
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
1. Target specific modules instead of brute-forcing content: start with `app.js` for behavior, `countries.js` for data, and `styles.css` for presentation.
2. If new audio sets are needed, consult `scripts/generate_audio.py` and update `assets/audio/<voice-id>/` accordingly.
3. Any path change (flags, icons, scripts) must be reflected in `index.html`, `manifest.json`, `sw.js`, and `app.js` to avoid broken assets.
4. Service worker caching is static: update `sw.js` when adding/removing files so the cache list stays accurate.
5. Document new hooks in this file if you add utilities that future agents should know (e.g., new config values, audio voices, or helper scripts).

## Testing & Validation
- Manual: Serve via simple HTTP server (`python3 -m http.server`) and exercise Start button, selecting packs, answering questions, and verifying audio toggles, progress, and score display.
- Since there's no automated test suite, rely on browser dev tools for console errors and `network` tab to confirm assets load.
- Keep `index.html` query strings for cache busting (`?v=1.2.1`) if you want to force reloads when deploying.

## Communication Notes
- No database or backend—everything runs in the browser. Avoid searching server directories or running database migrations.
- Audio generation is the only Python-related concern; thus the `.venv` exists. Refer to the `scripts/` folder before adding new Python scripts.

## Collaboration & Preferences
See `LEARNINGS.md` for documented preferences on:
- Project approach (branching, experimentation, debug modes)
- Technical preferences (vanilla stack, inline SVG, CSS Grid)
- Design style (minimal, visual indicators, color palette)
- Communication patterns and decision-making style

This file captures learnings from past sessions to ensure consistent and efficient collaboration.
