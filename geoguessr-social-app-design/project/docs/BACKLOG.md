# Gaea — "Give It Legs" Backlog

_Prioritized to-do list to take Gaea from the current repo state to a shippable V1. Intended to be appended to `PRD.md` as a new section (e.g. "SECTION 22: Execution Backlog") once reviewed._

Legend: **P0** = blocks a coherent V1 · **P1** = needed for the loop to feel finished · **P2** = polish / post-launch.

---

## Repo hygiene (do first — cheap, high-clarity)

- [ ] **P0 · Deduplicate PRDs.** Delete `gaea_PRD.md`; keep `PRD.md` as canonical. (Contents are identical; no merge of ideas is actually required — this is a delete, not a merge.)
- [ ] **P0 · Rename `cosmo-mobile/` → `mobile/`.** Update `README.md`, `package.json`, CI workflow paths, and any imports in the same PR.
- [ ] **P1 · Refresh `README.md` API list** from `src/routes/*` (add groups, notifications, comments).
- [ ] **P2 · Remove the dead integration test** (`integration.test.ts` vs `integrationTest.ts`).
- [ ] **P2 · Verify no secrets** committed in `.env.example` / `docker-compose.yml`.

---

## Product decisions to lock before building more

- [ ] **P0 · Feed scope: single friend feed vs. group-scoped?** Backend is group-first (per PRD); mockups are single-feed. Pick one; the UI and API must agree. _Recommendation: ship a single friend feed for V1 to match the mockups, keep the group tables dormant, and introduce a group switcher in V1.1._
- [ ] **P0 · Reveal timing model.** PRD says 24h-or-all-guessed reveal; mockups imply instant per-guess reveal. Decide whether accuracy shows immediately on guess (as prototyped) or only at a scheduled reveal. This changes notifications, comments-unlock, and leaderboard timing.
- [ ] **P1 · One guess per post?** PRD says yes (anti-abuse). Confirm and enforce server-side.

---

## Core loop completion

- [ ] **P0 · Comments API + lock gate.** Add `POST/GET /photos/:id/comments`; gate reads/writes behind a `hasGuessed(user, photo)` check so comments stay locked until the viewer guesses (BeReal-style). Wire the feed's "Guess to unlock comments" row to it.
- [ ] **P1 · Comments view UI** (prototyped) → real screen in the RN app.
- [ ] **P1 · Guess-accuracy overlay** two-page swipe (distance map / points) → confirm parity with `GuessResult.tsx`; the prototype is the visual spec.
- [ ] **P1 · Per-post leaderboard screen** wired to `GET /photos/:photoId/leaderboard` with the current user highlighted.

---

## Net-new screens (designed in prototype, not yet in code)

- [ ] **P1 · Login screen** → wire to existing `POST /auth/login` + refresh-token flow.
- [ ] **P1 · Onboarding (3 steps):** "snap where you are" → "guess where they are" → "climb the leaderboard." First action after onboarding should be a *guess*, per PRD Journey 1.
- [ ] **P1 · Profile screen:** post grid, cumulative points, global rank, this-week delta, sign-out. Needs a `GET /users/:id/posts` + profile-stats endpoint.
- [ ] **P2 · Friends/Global leaderboard:** friends tab can ship on existing data; global is PRD Phase 2 (needs scale to be meaningful).

---

## Anti-spoof / integrity (protect the premise)

- [ ] **P1 · Enforce camera-only capture** on both platforms (no library import path reachable in prod builds).
- [ ] **P1 · Reject stale/mocked GPS:** capture timestamp + accuracy; flag mock-location providers on Android.
- [ ] **P2 · Photo moderation** (AWS Rekognition) before a post is surfaced, per PRD §15.

---

## Viral / retention (PRD-backed, post-core)

- [ ] **P2 · Shareable result card** (the Wordle-style artifact) — PRD calls this the primary viral loop; worth pulling earlier if capacity allows.
- [ ] **P2 · Streaks + streak shields** (Duolingo-style forgiveness).
- [ ] **P2 · Push notification triggers:** new post, reveal fired, outscored on leaderboard.

---

## Suggested sequencing

1. **Week 1 — hygiene + decisions:** dedupe PRD, rename folder, lock the three P0 product decisions.
2. **Weeks 2–3 — close the loop:** comments API + lock gate, per-post leaderboard wiring, profile endpoint.
3. **Weeks 4–5 — onboarding & auth UI:** login, onboarding, profile screen.
4. **Post-V1:** share cards, streaks, global leaderboard, groups switcher.
