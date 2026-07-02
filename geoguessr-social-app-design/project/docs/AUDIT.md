# Gaea — Hygiene & Vision-Alignment Audit

_Companion to the interactive prototype (`Gaea Prototype.dc.html`). Based on a read of the `nmillrr/gaea` repo @ `main` and the 10 frontend mockups in `/screens`._

---

## 1. How closely the codebase matches the vision

**Verdict: strongly aligned.** The core loop you described already exists in code. The gaps are mostly at the edges (comments, profile, global leaderboard) and in repo hygiene — not in the fundamental architecture.

| Vision element | In the code today? | Notes |
|---|---|---|
| Take a live photo (anti-spoof) | ✅ `cosmo-mobile` CaptureScreen; camera-only, no library import | Matches `live_camera` → `photo_processing` → `pre_upload` |
| Auto location tagging at capture | ✅ Backend captures + encrypts coords server-side; PostGIS | True coords never sent to client until reveal — good anti-cheat |
| Photo → map toggle on a post | ✅ `PhotoCard` + `MapGuess` | Matches `feed` → `map_guess` |
| Sticky center pin, world-start zoom | ✅ `MapGuess` starts zoomed-out; center pin | Matches your description exactly |
| Distance scoring, closest wins | ✅ `src/game/scoring.ts` (server-authoritative) | Non-linear decay per PRD §10 |
| Guess accuracy reveal (distance + points) | ✅ `GuessResult` two-page swipe | Matches `guess_accuracy_1` / `_2` |
| Per-post leaderboard | ✅ `GET /photos/:photoId/leaderboard` | The "SEE LEADERBOARD" destination |
| Comments locked until you guess (BeReal-style) | ⚠️ Partial | `Comment` entity exists; **no comment routes exposed** and no lock-gate logic found |
| Feed + sticky bottom nav | ✅ `FeedScreen` + `BottomNav` | Matches `feed` |
| Loading skeletons | ✅ implied by feed states | Matches `loading_feed` |
| Notifications | ✅ `NotificationsScreen` + FCM service | Matches `notifications` |
| Profile (grid, points, rank) | ❌ Not built | No mockup either — designed net-new in prototype |
| Login / onboarding | ❌ Not built | Auth endpoints exist; no onboarding UI — designed net-new |
| Global / friends leaderboard | ❌ Backend has per-photo only | PRD scopes global as Phase 2 — designed net-new in prototype |

---

## 2. Clunky / redundant / legacy items to clean up

Ranked by how much confusion they cause.

1. **Duplicate PRDs — HIGH.** `PRD.md` (80,057 B) and `gaea_PRD.md` (79,735 B) are the same document. Two copies drift out of sync the moment either is edited. **Action:** keep `PRD.md` as canonical, delete `gaea_PRD.md`. See `docs/BACKLOG.md` for the merged-content note.

2. **Legacy `cosmo-mobile/` directory name — HIGH (cosmetic, but everywhere).** The app is "Gaea" but the mobile folder, and any import paths / docs referencing it, still say `cosmo-mobile`. This is the kind of thing that quietly confuses every new contributor. **Action:** rename `cosmo-mobile/` → `mobile/` (or `app/`), update `README.md`, `package.json` workspaces, and CI paths in one PR.

3. **Comments are half-built — MEDIUM.** There's a `Comment` entity but no routes and no "unlock after guessing" gate. Right now the BeReal-style locked-comments feature you described is not actually enforced anywhere. **Action:** add `POST/GET /photos/:id/comments` + a `hasGuessed` check middleware.

4. **README endpoint list is out of date — MEDIUM.** README documents auth/photos/guesses/friends/users but omits `groups`, `notifications`, and comments — all of which exist (or should) in `src/routes/`. New devs will mis-model the API. **Action:** regenerate the endpoint list from `src/routes/*`.

5. **Groups vs. the feed you mocked — MEDIUM (product decision).** The backend has a full friend-**group** system (`groupController.ts` is the largest controller at ~10 KB), and the PRD's wedge is explicitly "friend-group game first." But the mockups show a single global-feeling feed with no group selector. **Decide:** is V1 a single friend feed (simpler, matches mockups) or group-scoped (matches PRD/backend)? The UI and the backend currently disagree. This is the single most important product-alignment question.

6. **Two integration test entry points — LOW.** `src/tests/integration.test.ts` and `src/tests/integrationTest.ts` coexist. Likely one is dead. **Action:** confirm and delete the unused one.

7. **`.env.example` / secrets hygiene — LOW (verify).** Confirm no real keys ever landed in `.env.example` or the docker compose file; both are committed.

---

## 3. Architecture notes (keep — these are good)

- Server-authoritative scoring and encrypted true-coordinates is the right anti-cheat posture; don't move scoring or reveal logic client-side.
- PostGIS `ST_Distance` for scoring is the correct tool — keep it.
- Camera-only capture (no library import) is a deliberate anti-spoof choice and matches your "so locations don't get spoofed" requirement. Preserve it.

---

## 4. What the prototype adds beyond the mockups

The prototype (`Gaea Prototype.dc.html`) recreates all 10 mockups as one connected, tappable flow (init → loading → feed → map guess → accuracy swipe → per-post leaderboard; plus camera → processing → pre-upload; plus notifications) using real pannable Leaflet maps and live distance/points computation. It also designs the four screens that had no mockup: **login, 3-step onboarding, profile (post grid + points + rank), and a friends/global leaderboard** — flagged above as net-new so you can react to them before they're specced.
