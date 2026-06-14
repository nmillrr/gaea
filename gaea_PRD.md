# Gaea — Product Requirements Document
**Version 1.0 | Confidential | Seed Stage**

---

## Table of Contents

1. Executive Summary
2. Problem Analysis
3. Market Research
4. Competitor Analysis
5. Core Insight
6. User Personas
7. Product Strategy
8. MVP Definition
9. User Journey
10. Game Design
11. Network Effects
12. Retention Analysis
13. Growth Strategy
14. Monetization
15. Technical Architecture
16. Privacy and Safety
17. Risk Register
18. Roadmap
19. Success Metrics
20. Founder Recommendation
21. Further Research Required

---

# SECTION 1: EXECUTIVE SUMMARY

## Product Vision

Gaea turns every photo you take into a game your friends play. It is the first social platform where location isn't metadata — it's the challenge.

## Mission Statement

Make the real world the most compelling game board on the planet.

## Long-Term Vision

Gaea becomes the default social layer for place-based experience — a platform where every trip, campus walk, neighborhood discovery, and travel moment is a shared game, not a passive post. In five years, Gaea is how a generation of 18–30-year-olds keeps friendships alive, documents the world, and competes with the people they love.

## Why Now?

Four forces are converging:

**1. Authenticity backlash is accelerating.** BeReal proved there is massive demand for unfiltered, real-time content. But BeReal had no game mechanic and no durable engagement loop. Its DAU collapsed after the novelty wore off.

**2. Casual multiplayer is the fastest-growing mobile entertainment category.** Wordle (150M+ players at peak), GeoGuessr (50M+ registered users), and the explosion of "couch co-op" social games on mobile demonstrate that friends want low-friction competition, not passive consumption.

**3. Gen Z is not replacing social media with video games — they want both simultaneously.** TikTok gamifies the feed. Duolingo gamifies language learning. The next frontier is gamifying the social graph itself.

**4. Maps are finally a native mobile experience.** Apple Maps, Google Maps, and Mapbox have matured to the point where embedding interactive, guessable maps into a social feed is a seamless, low-latency UX. This wasn't true at BeReal's inception.

## Core Insight

The most interesting thing about a photo is the question it raises: *Where was this taken?*

Every photo has a location. Nobody has made that location the point of the social experience — until now. Gaea doesn't ask you to perform for an audience. It asks your audience to think.

---

# SECTION 2: PROBLEM ANALYSIS

## Problem 1: Modern Social Media Feels Fake

Instagram's engagement rate has fallen steadily since 2019. Gen Z's top-cited complaint about Instagram is that it makes them feel worse about themselves and their own lives. BeReal's viral moment in 2022 was driven entirely by the promise of one thing: authenticity on demand.

The problem runs deeper than filters. Social media has evolved into a performance economy. Users optimize for likes, saves, and reach — not genuine connection. The result is a paradox: we are more connected than at any point in history and more socially isolated than any prior generation.

Performative content produces performative relationships. Gaea does not ask you to look good. It asks you to be *somewhere interesting* — and your friends to prove they know you well enough to guess where.

**Trend Evidence:**
- Pinterest (2023 survey): 72% of Gen Z report feeling pressure to curate their image on social media
- BeReal reached 73M MAU in August 2022 within two years of launch before plateauing
- "Instagram vs Reality" and "De-influencing" are sustained cultural movements with billions of impressions on TikTok

## Problem 2: Most Social Apps Are Passive

The average American spends 2.5 hours per day on social media. Almost all of it is passive — scrolling, watching, liking. Participation rates are staggeringly low. On Twitter/X, roughly 1% of users generate 90% of content. On Reddit, 90% of users never post. Even on TikTok, whose algorithm flattens the content hierarchy, over 80% of users never create a video.

Passive consumption is a low-loyalty behavior. It creates platform stickiness through algorithmic dependency, not genuine attachment. When the algorithm breaks or a competitor emerges, users leave.

Games are different. Games require action. Games produce outcomes — winners, scores, streaks. Outcomes generate emotion: pride, frustration, competitiveness, delight. Emotion produces return visits. Gaea converts the passive "scroll and see" moment into an active "guess and compete" moment.

## Problem 3: People Want Ways to Connect With Friends Remotely

Discord, Facetime, iMessage — none of them solve the core problem of asynchronous, low-effort friendship maintenance. Texting a friend "thinking of you" requires initiation. Watching a friend's Instagram story requires no initiation but produces no real interaction.

Gaea creates a third category: **a mandatory, casual touchpoint that is also fun**. When a friend posts a Gaea, you're not passive — you have to engage to play. The mechanic forces interaction without requiring either party to initiate conversation. It is the digital equivalent of a postcard that asks you a question.

**Supporting Data:**
- Locket Widget reached #1 on the App Store in January 2022 on the strength of one mechanic: photos from friends on your home screen. The demand for ambient friend presence is enormous.
- Wordle's peak virality was driven not by the puzzle but by the shareable result card — a social artifact that forced conversation.

## Problem 4: Location Is Underutilized as Social Content

Instagram has location tagging. Snapchat has Snap Map. Google Maps has reviews. TikTok has place pins. None of them make location the *primary social object*.

Location tagging is metadata. It is a label. Gaea makes location the game board.

This is a meaningful distinction. When location is metadata, it is filtered out. When location is the game board, it is the entire point of the interaction. A photo taken at a nondescript corner of a city becomes fascinating not because of how it looks, but because of where it was taken — and whether your friends can figure it out.

Travel content is one of the most-consumed categories on social media (travel is consistently a top-3 niche on Instagram and TikTok). But travel content is consumed by strangers. Gaea makes your friends the audience — and the contestants.

---

# SECTION 3: MARKET RESEARCH

## Market Sizing

### Total Addressable Market (TAM)

Gaea competes at the intersection of three large markets:

| Market | 2024 Size | 2029 Projection | CAGR |
|--------|-----------|-----------------|------|
| Social Media Global | $219B | $415B | ~14% |
| Mobile Gaming Global | $93B | $147B | ~10% |
| Casual / Hyper-Casual Mobile Games | $17B | $31B | ~12% |
| Location-Based Services (LBS) | $40B | $108B | ~22% |

**Combined TAM (non-overlapping):** Approximately $370B by 2029 across the segments most relevant to Gaea's ultimate platform ambition.

**Realistic TAM for the specific consumer social + location game niche:** $25–40B. This encompasses platforms like GeoGuessr, BeReal, Snapchat's Snap Map, and any successor to the real-time social gaming category.

### Serviceable Addressable Market (SAM)

Gaea's initial wedge targets English-speaking Gen Z and young Millennial smartphone users, ages 16–30, in North America, the UK, and Australia.

- Total Gen Z + young Millennial smartphone users in these regions: ~180M
- Percentage active on at least two social platforms: ~70% = ~126M
- Percentage who play casual mobile games at least weekly: ~45% of that = ~57M
- **SAM: ~57M users**

At an LTV of $20–40 per user per year (realistic for a freemium social app with modest ARPU), this represents a **$1.1B–2.3B SAM**.

### Serviceable Obtainable Market (SOM)

In Year 3, a successful Gaea could realistically capture 2–5% of its SAM through organic viral growth, campus seeding, and word of mouth:

- **SOM Year 3 (conservative):** 1.1M MAU
- **SOM Year 3 (optimistic):** 2.8M MAU

At these scales, with 15–25% conversion to paid features and modest ad revenue, annual revenue in the $8M–35M range is credible. This is a fundable, venture-scale trajectory.

---

# SECTION 4: COMPETITOR ANALYSIS

## Direct Competitors

### BeReal

**What they do well:** Authentic constraint (one photo, one moment, no filter), enormous brand recognition with Gen Z, frictionless onboarding, bilateral camera mechanic creates intimacy.

**What they do poorly:** No game mechanic. No reason to return after novelty fades. Notifications are irritating. No scoring, no competition, no reward structure. DAU fell ~75% from peak to trough by mid-2023.

**User motivation:** FOMO-driven authenticity; "what are my friends doing right now"

**Retention mechanic:** Streaks, notification urgency. Both brittle.

**Monetization:** Weak — BeReal was acquired by Voodoo in 2024 for $500M but had minimal revenue at acquisition.

**Opportunity:** BeReal proved the demand for unfiltered friend content. It failed to give users a reason to engage *with* that content beyond passively viewing. Gaea makes viewing active.

---

### GeoGuessr

**What they do well:** Compelling core mechanic (place a pin, get scored on distance), massive loyal user base, strong streamer and content creator community, addictive loop, global scope.

**What they do poorly:** Cold, anonymous experience by default. No social graph. Content is generated by Google Street View, not by friends. No mobile-native social layer. No UGC angle.

**User motivation:** Competitive geography knowledge, puzzle satisfaction, improvement over time

**Retention mechanic:** Ranked games, daily challenges, league play

**Monetization:** Freemium subscription ($2–4/month). Solid conversion rate among core users (~8–12% estimated). ~$30–50M ARR estimated.

**Opportunity:** GeoGuessr is a game with no social layer. Gaea is a social layer with a GeoGuessr mechanic. The hybrid is unexplored and vastly more viral.

---

### Snapchat

**What they do well:** Default communication layer for under-25s, Stories format, ephemeral content, Snap Map shows real-time friend locations, massive distribution.

**What they do poorly:** Snap Map is a surveillance tool, not a game. Nobody engages with Snap Map as a mechanic — it's passive location sharing. Snapchat has tried games (Snap Games) without breakout success.

**User motivation:** Direct messaging, streaks, Stories, visual communication

**Retention mechanic:** Streaks — arguably the most powerful retention mechanic in social media history

**Monetization:** Advertising ($4.6B in 2023 revenue). Snapchat+ subscription launched 2022, reached 7M+ subscribers by 2023.

**Opportunity:** Snapchat won distribution but never made location *fun*. The Snap Map is a viewer, not a game board. Gaea competes directly with Snapchat's social graph while offering something Snapchat cannot: location as a competitive mechanic.

---

### Instagram

**What they do well:** Dominant visual social platform, Reels distribution, brand advertising, discovery algorithms, creator monetization.

**What they do poorly:** Massively overbuilt. No game mechanic. Algorithmic feed has alienated core users. Gen Z describes it as a platform for older people or brands.

**User motivation:** Visual inspiration, creator following, brand discovery, status signaling

**Retention mechanic:** Infinite algorithmic feed, Stories, DMs

**Opportunity:** Instagram cannot become Gaea without destroying what makes Instagram profitable. A game mechanic would conflict with advertising. Gaea can build what Instagram cannot.

---

### TikTok

**What they do well:** Algorithmic discovery, short video loop, massive creator ecosystem, trend propagation, near-perfect dopamine optimization.

**What they do poorly:** Friend-to-friend connection is weak. Content is made for strangers, not friends. Location is peripheral. Social gaming is nonexistent.

**User motivation:** Entertainment, trend participation, creator following

**Retention mechanic:** Infinite scroll, algorithm, creator content

**Opportunity:** TikTok is a broadcast medium. Gaea is a peer-to-peer game. They are not competing for the same emotional job.

---

## Indirect Competitors

### Pokémon GO

**Insight:** Pokémon GO demonstrated that tens of millions of people will physically move through the world if there is a game attached to that movement. The mechanic of "the real world is the game board" is proven at massive scale. Gaea is Pokémon GO for photography and social guessing — no physical movement required.

### Strava

**Insight:** Strava turned individual athletic data into a social competition. Segments, KOMs, kudos — all game mechanics layered on physical activity. Strava proved you can build a $1.5B+ company on the intersection of activity, location, and social competition. Gaea is Strava for casual social photography.

### Wordle / NYT Games

**Insight:** Wordle reached 300M+ plays in January 2022. Its virality was entirely driven by the shareable result card — a social artifact that made the private puzzle experience public. Gaea's guess result screen (how close was your pin?) is Gaea's Wordle result card. It is the primary viral loop.

### Discord

**Insight:** Discord proved that friend groups want a private, game-adjacent social space. Gaea's friend-group challenge mechanics are closer to a Discord activity than an Instagram post.

### Locket

**Insight:** Locket reached #1 on the App Store with a single mechanic — friends' photos on your lock screen. This validates that ambient friend presence is a product-market fit, not a feature. Gaea should study Locket's onboarding closely.

---

## Competitor Matrix

| Platform | Social Graph | Game Mechanic | Location | UGC | Gen Z | Mobile Native | Viral Loop |
|----------|-------------|---------------|----------|-----|-------|---------------|------------|
| Gaea | ✅ | ✅ | ✅ Core | ✅ | ✅ | ✅ | ✅ Strong |
| BeReal | ✅ | ❌ | ❌ Passive | ✅ | ✅ | ✅ | ⚠️ Weak |
| GeoGuessr | ❌ | ✅ | ✅ Core | ❌ | ⚠️ | ⚠️ | ⚠️ Weak |
| Snapchat | ✅ | ❌ | ⚠️ Map | ✅ | ✅ | ✅ | ⚠️ Streaks |
| Instagram | ⚠️ | ❌ | ⚠️ Tag | ✅ | ⚠️ | ✅ | ⚠️ Algo |
| Wordle | ❌ | ✅ | ❌ | ❌ | ✅ | ⚠️ | ✅ Result card |

Gaea is the only product that is strong across all six dimensions. This is the gap.

---

# SECTION 5: CORE INSIGHT

## The Insight That Changes Everything

**Every photo is a question. Gaea is the answer.**

Traditional social media is broadcast: one person speaks, many listen. The content is the end product.

Gaea inverts this. The photo is not the content — the photo is the *prompt*. The content is the guessing, the competition, the reveals, the trash talk. The photo is bait.

This insight has three corollaries:

**1. You don't need a beautiful photo to post. You need an interesting location.**

This lowers the content creation bar dramatically. You don't need to be photogenic. You don't need editing skills. You need to be somewhere — a restaurant, a campus corner, a hiking trail, an airport, a childhood bedroom. The interesting-ness of a Gaea post is geographic, not aesthetic. This democratizes content creation in a way Instagram never could.

**2. The guesser is the star, not the poster.**

On Instagram, the creator gets attention. On Gaea, the person who guesses the closest gets the social recognition. This is a structural inversion that changes the game dynamics entirely. Suddenly, the most valuable asset in the network is not the ability to create beautiful content but the ability to *know your friends' lives, habits, and geography well enough to guess correctly*. The product rewards intimacy.

**3. The social loop is forced, not optional.**

On Instagram, you can scroll past a friend's post. On Gaea, scrolling past a post means opting out of the game. The mechanic creates a social obligation that is fun rather than pressuring. You don't feel guilty for not commenting. You feel like you're missing out on points.

---

# SECTION 6: USER PERSONAS

## Persona 1: The College Student

**Name:** Maya, 20, University of Michigan sophomore  
**Major:** Communications  
**Social apps:** Instagram, TikTok, Snapchat, BeReal  

**Goals:**
- Stay connected with high school friends now at different universities
- Build presence within her current friend group
- Find low-effort ways to share what her college life looks like

**Behaviors:**
- Posts to Instagram approximately once every 3 weeks (curated)
- Sends BeReal daily for about 6 months before abandoning it
- Plays Wordle with her mom and shares results via iMessage every morning
- Studies in different campus locations and often thinks "this is a cool spot"

**Motivations:**
- Competitive with close friends; loves winning trivia-style games
- Proud of her campus knowledge
- Wants to feel like her friends actually *know* her life, not just see a highlight reel

**Pain Points:**
- BeReal felt pointless — no one reacted
- Instagram posts feel high-stakes and infrequent
- Friends at other schools feel distant; "we just don't talk as much anymore"

**Gaea Use Case:** Posts 3–4x per week. Her campus "spots" become famous within her friend group. She's intensely competitive when guessing friends' locations. Invites her high school friends and creates a cross-campus competitive league.

---

## Persona 2: The Young Professional

**Name:** Jordan, 26, product designer in San Francisco  
**Background:** Recent grad, moved from Austin 18 months ago  

**Goals:**
- Maintain friendships with college friends now scattered across cities
- Document his new city without the pressure of Instagram aesthetics
- Find a casual, regular way to stay connected

**Behaviors:**
- Active on Instagram for creative inspiration, not personal posting
- Sends memes on group chats; "lurker" on most platforms
- Plays NYT Games (Wordle, Connections) daily; sees social sharing of results
- Explores his neighborhood on weekends

**Motivations:**
- Values low-stakes engagement; resistant to performing for a large audience
- Competitive in private; loves the concept of a game only his close friends play
- Interested in the "know your city" flex

**Pain Points:**
- Most social apps feel performative; "I don't want followers, I want friends"
- Doesn't post regularly because he'd rather share something funny or clever than something beautiful
- Long-distance friendships feel increasingly passive

**Gaea Use Case:** Light poster (1–2x/week), aggressive guesser. Uses Gaea primarily as a guessing tool. Loves leaderboard competition with his 6-person college friend group. Eventually becomes a high-volume poster when he realizes his SF neighborhood knowledge is unbeatable.

---

## Persona 3: The Traveler

**Name:** Sofia, 24, study abroad student / frequent traveler  
**Background:** Junior year abroad in Barcelona; traveled to 14 countries by age 22  

**Goals:**
- Share travel experiences with friends in a way that feels interactive, not just broadcast
- Discover that her photos are genuinely difficult for friends to guess
- Build a visual travel log that doubles as a game archive

**Behaviors:**
- Heavy Instagram poster while traveling (80% of her posts come from abroad)
- Frustrated that travel posts get passive likes but no real engagement
- Uses GeoGuessr recreationally; has strong geographic intuition
- Creates content that feels exploratory, not staged

**Motivations:**
- Proud of her geographic knowledge; wants a platform that rewards it
- Loves the asymmetry of being somewhere exotic while her friends guess wildly wrong

**Pain Points:**
- Travel content on Instagram feels like bragging; she'd rather make it a game
- Friends back home engage superficially; a few emojis and they move on
- Hard to share the *feeling* of a place, not just the appearance

**Gaea Use Case:** Power user. Posts aggressively while traveling; her pins are notoriously difficult to guess. Accumulates a "travel portfolio" in the app. Becomes the persona Gaea builds influencer marketing around — the traveler whose friends are actively trying to guess her locations.

---

## Persona 4: The Friend Group Organizer

**Name:** Darius, 23, recent grad  
**Background:** The "group chat admin" in his friend circle of 12 people  

**Goals:**
- Keep the group active and engaged between in-person hangouts
- Create shared experiences that don't require everyone to be available at the same time
- Find a replacement for games that faded out (Houseparty, etc.)

**Behaviors:**
- Coordinates group chats, events, shared playlists
- Introduced his friend group to Wordle; organized a group Geoguessr stream
- Uses Discord for gaming nights; Snapchat for quick communication

**Motivations:**
- Social glue; gets satisfaction from keeping the group alive
- Competitive by nature but values group participation over individual glory
- Wants a platform that doesn't require everyone to be online simultaneously

**Pain Points:**
- Hard to find asynchronous group activities that everyone can join at their own pace
- Most games require real-time coordination; Gaea works across time zones

**Gaea Use Case:** Creates the private friend group, invites everyone, maintains the weekly leaderboard. Becomes the product's advocate. Likely refers multiple other "organizers" to the platform.

---

## Persona 5: The Long-Distance Friend

**Name:** Priya, 22, graduated and moved across the country  
**Background:** Lost regular contact with 70% of college friends after graduation  

**Goals:**
- Find a low-pressure way to stay in touch
- Create the feeling of shared experience despite geographic separation

**Behaviors:**
- Checks social media to see what friends are doing but rarely posts
- Sends voice memos occasionally; maintains a few close friendships via video call
- Plays mobile games during commute

**Motivations:**
- Wants passive, ambient connection that doesn't require scheduling or effort
- Likes the idea of knowing what her friends' lives look like in real-time

**Pain Points:**
- Friendship maintenance feels like a chore; texting requires initiation
- Social media is a poor substitute for actual connection

**Gaea Use Case:** Light but consistent user. Guesses once or twice a day; rarely posts. The platform gives her a reason to *open the app* and feel connected without initiating conversation. Sends guessing results to friends via DM — creating touchpoints.

---

## Persona 6: The Family User

**Name:** Kevin, 45, father of two college-age kids  
**Background:** Technology-comfortable; uses iMessage, follows kids on Instagram  

**Goals:**
- Stay connected with kids in a fun, non-intrusive way
- Feel like he's part of their daily lives
- Have a shared activity that doesn't feel like surveillance

**Behaviors:**
- Plays Wordle with his daughter daily and shares results
- Occasionally checks his kids' Instagram; feels distant from it
- Never uses Snapchat; finds TikTok overwhelming

**Motivations:**
- Wants connection, not surveillance
- Enjoys geographic puzzle-solving; strong mental map of cities kids live in
- Competitive; would love to beat his kids at guessing

**Gaea Use Case:** A secondary but high-value user segment for monetization. Family-mode features (limited privacy exposure, curated access) unlock this segment. Kevin converts to a paid subscriber to get the "family challenge" weekly format.

---

# SECTION 7: PRODUCT STRATEGY

## The Options

### Option A: Social Network First
**Thesis:** Build a full social network with location-guessing as the primary mechanic. Friends, feeds, follows, notifications — all optimized for social connection.

**Verdict:** Too broad, too expensive to build, no clear wedge. Social networks require massive scale to generate value. With no existing social graph to tap, acquiring users to a network that doesn't have critical mass is a chicken-and-egg problem that kills most social startups.

### Option B: Game First
**Thesis:** Launch Gaea as a location-guessing game using curated content (similar to GeoGuessr), then add social features.

**Verdict:** Wrong order. Games without social graphs commoditize quickly. You'd be competing with GeoGuessr on game quality alone — and GeoGuessr has a 10-year head start. The game mechanic is compelling only because the *content is produced by your friends*.

### Option C: Friend-Group Game First ✅
**Thesis:** Launch Gaea as a private, friend-group game. You and a small group of friends compete to guess each other's locations. Private, competitive, social — no need for a public feed or follower counts.

**Verdict:** This is the correct wedge. Here's why:

- **Lowest CAC:** Friend groups are acquired as a unit. One enthusiastic "Darius" (Persona 4) brings 11 friends. CAC is effectively divided by group size.
- **Highest retention:** The mechanic only works if friends are participating. This creates social obligation — the best retention mechanic that exists.
- **Viral by design:** When the "guesser" shares their result publicly ("I guessed within 0.3 miles — can you beat that?"), it acquires new users from outside the group.
- **No cold-start problem:** You don't need a public content pool. You only need 3–5 active friends.
- **Beachhead clarity:** You can seed this on campuses, in study abroad programs, in travel communities — cohorts where friend groups are tight and geographic novelty is high.

### Option D: Travel and Exploration Platform
**Verdict:** Too niche. Travel is a high-engagement but low-frequency behavior. You cannot build daily retention on a behavior that happens 2–3 times per year. Travel can be a *feature* of Gaea, not the product.

### Option E: Campus-Focused Social Game
**Verdict:** Partially correct. Campus is the right *go-to-market channel* for Option C, not a product category in itself. Build Option C, seed it on campuses.

## Recommendation: Option C, Seeded via Option E

**Build:** A private, friend-group location-guessing game with a daily posting mechanic.

**Seed:** College campuses, initially in the US, where friend group density is highest and social experimentation is highest.

**Expand:** Once 10–15 campus networks are established with strong retention, open the product to young professionals and travelers as a second cohort.

---

# SECTION 8: MVP DEFINITION

## Design Principle

Every feature in the MVP must answer the question: *Does this enable a person to post a photo and have their friends guess where it was taken?* If the feature does not serve this mechanic directly, it does not belong in V1.

---

## Feature Set

### 1. Authentication
**What:** Phone number or Apple/Google Sign-In. No username/password.  
**Why:** Friction kills onboarding. Phone number ties the account to a real identity without requiring a new credential. Apple/Google handles secure auth.  
**Not included:** Email/password registration — too slow.

### 2. Profiles
**What:** Name, profile photo, username, cumulative score, current streak, leaderboard rank within friend groups.  
**Why:** Profiles are necessary to build social identity and track competitive standing.  
**Not included:** Bio, links, follower count, public feed. These are broadcast features. Gaea is not a broadcast platform.

### 3. Posting
**What:** Tap to capture a photo. Location is captured automatically and encrypted at the point of capture. Photo is posted to friend groups immediately.  
**Why:** The post is the game trigger. Every friction point in posting reduces supply of game content.  
**Not included:** Captions (MVP), filters (MVP), video (Phase 2). The photo is bait; text is unnecessary noise.

### 4. Photo Upload and Location Capture
**What:** Camera native to app (not photo library in V1). GPS coordinates captured at time of capture and stored server-side, encrypted. Coordinates are never shown to users before the reveal.  
**Why:** Location capture is the secret that makes the game work. It must be automatic and accurate.  
**Not included:** Manual location entry (exploitable). Post-hoc location editing (exploitable).

### 5. Guessing
**What:** An interactive map embedded in each post card. User drags and drops a pin to their guess. Submits one guess per post. Timer visible (24-hour window to guess before reveal).  
**Why:** The guess is the core engagement action. The map must be fast, smooth, and native. One guess per post prevents abuse.  
**Not included:** Multiple guesses, satellite toggle (Phase 2), hint system (Phase 2).

### 6. Scoring
**What:** Distance-based scoring (detailed in Section 10). Score displayed immediately upon reveal. Cumulative score tracked per friend group.  
**Why:** Scoring converts a casual guess into a competitive stake. Without scoring, the mechanic is trivia. With scoring, it is a game.  
**Not included:** Complex XP systems (Phase 2). Keep it simple: one number, one leaderboard.

### 7. Leaderboards
**What:** Per-group weekly leaderboard and all-time leaderboard. Updated in real time after reveals.  
**Why:** Leaderboards create social pressure to keep playing. They are the primary competitive display surface.  
**Not included:** Global leaderboard (Phase 2 — requires large user base to be meaningful).

### 8. Friends and Groups
**What:** Friend requests via phone contacts or username search. Group creation (up to 20 members in MVP). One-tap invite via SMS/iMessage.  
**Why:** The game requires a closed social graph. Groups provide competitive context. SMS invites are the primary growth vector.  
**Not included:** Open follow model, public accounts, discovery feed.

### 9. Notifications
**What:** Push notification when a friend posts (game trigger). Push notification when your post reveal fires (results). Push notification when you've been outscored on the leaderboard.  
**Why:** Notifications are the re-engagement mechanism. Without them, the app goes cold.  
**Not included:** Notification customization (Phase 2). Keep defaults smart and minimal to avoid fatigue.

### 10. Results and Reveals
**What:** After 24 hours (or after all group members have guessed), the reveal fires: the true location appears on the map alongside all friend guesses. Distances shown. Winner highlighted. Score updated.  
**Why:** The reveal is the highest-engagement moment in the product — the equivalent of a lottery draw. It must be visually satisfying and shareable.  
**Not included:** Animated reveal (Phase 2). Shareable result card (should be in MVP — see note below).

**Note on the Shareable Result Card:** The Wordle result card is one of the most powerful organic growth tools in consumer social history. Gaea's shareable reveal card (showing the map with all guesses and the true location) is the primary viral loop. This should be included in MVP despite being a "growth" feature, because it drives the core acquisition loop without paid spend.

---

# SECTION 9: USER JOURNEY

## Journey 1: New User (First-Time Experience)

1. Friend receives SMS invite with a specific post link ("Maria posted a Gaea — where do you think she is?")
2. User taps link → App Store / Play Store download prompt (or web view if not installed)
3. Onboarding: phone number → verify → name and photo
4. Immediately lands on the post that triggered the invite
5. Sees the photo, the map, the timer (e.g., "16 hours left to guess")
6. Drops a pin, submits guess
7. "Guess locked in! You'll see the reveal in 16 hours."
8. Prompted to add Maria as a friend and join her group
9. Optionally prompted: "Post your own Gaea to challenge your friends"

**Design Principle:** The new user's first action should be to *guess*, not to set up a profile. The game is the hook. Profile can come after.

---

## Journey 2: Returning User (Daily Active)

1. Morning push notification: "Jake posted a new Gaea. You have 14 hours to guess."
2. User opens app → Jake's photo is front and center
3. User studies the image, zooms in, drops a pin
4. Scrolls down to see pending reveals from yesterday's posts
5. Reveal fires: user was 0.4 miles off, earned 4,200 points
6. Sees friend who guessed within 0.1 miles — "Beat their score tomorrow"
7. User decides to post their own Gaea from current location
8. Posts. Returns to feed. Checks leaderboard. Exits.

**Total session time:** 3–7 minutes. This is the target. Not an hour. Not 30 minutes. A focused, competitive, socially satisfying 5-minute session.

---

## Journey 3: The Poster

1. Opens app
2. Taps camera icon
3. Captures photo (location captured automatically in background)
4. Optional: adds a caption clue (e.g., "Good luck 👀") — short text, not required
5. Selects which friend group(s) to post to
6. Posts
7. Receives notification as friends guess
8. Can see number of guesses received but not the guesses themselves (reveals come later)
9. At reveal, sees all guesses on the map — feels pride or amusement at how wrong/right friends were

---

## Journey 4: The Guesser

1. Receives notification of a new post
2. Opens app → photo fills most of the screen
3. Studies the image for contextual clues (signs, architecture, landscape, weather)
4. Taps the map section below → map expands to full screen
5. Navigates the map (pinch to zoom, drag to pan)
6. Places pin
7. Can adjust pin before submitting
8. Submits → confirmation screen ("Guess locked — 8 friends have also guessed")
9. Returns to app at reveal time for results

---

## Journey 5: The Winner

1. Reveal fires → "You won this round! 🎯 You guessed within 0.2 miles."
2. Full-screen map shows: true location, user's pin, all friend pins
3. Score breakdown: user earned 4,800/5,000 points
4. Shareable result card generated automatically: "I guessed within 0.2 miles on Gaea! Can you beat that? [link]"
5. User shares to Instagram Stories, iMessage, WhatsApp
6. Tap the share — new users see the result card and are prompted to download

---

## Journey 6: Social Invite

1. User is in a friend group without two specific friends
2. Taps "Invite to Group" → contacts list
3. Selects friends → SMS template pre-populated: "Hey! I challenged [group name] to guess where I am on Gaea. Join us: [link]"
4. Friend receives invite, downloads, first action is to join the group and guess the pending post

---

## Journey 7: Leaderboard Experience

1. User opens Leaderboard tab
2. Sees weekly rankings for each group they're in
3. Current position highlighted; delta from last week shown (↑3 from #4 to #1)
4. Taps a friend's score to see their guess history on recent posts
5. Notification: "You've been bumped to #2 by Jake." → Re-engagement trigger

---

# SECTION 10: GAME DESIGN

## Scoring System

### Base Scoring Formula

The core scoring mechanic is distance-based with a nonlinear decay function.

**Maximum Points Per Round:** 5,000

**Scoring Curve:**
- 0–50m: 5,000 points (perfect)
- 51–250m: 4,500–4,999 (excellent)
- 251m–1km: 3,500–4,499 (very good)
- 1–5km: 2,000–3,499 (good)
- 5–25km: 750–1,999 (fair)
- 25–100km: 150–749 (trying)
- 100km+: 0–149 (terrible, but still participates)

**Design Rationale:** GeoGuessr uses a similar curve. The key insight is that the curve must reward precision but not punish casual participation so harshly that low scorers stop playing. A score of 150 still feels better than 0.

---

### Streak System

**Daily Streak:** Post or guess at least once per day. Streak increments by 1. Visual streak counter on profile.

**Streak Bonus:** At 7-day streak, +250 bonus points per round. At 30-day streak, +1,000 bonus points per round.

**Streak Shields:** Once per week, a user can miss a day without breaking their streak (Duolingo-style). This prevents the "I was traveling and forgot" churn event that destroyed Snapchat streaks.

**Design Rationale:** Snapchat's streak mechanic is responsible for a significant portion of its daily retention among teens. The anxiety around streak loss is a documented psychological driver of return visits. Gaea adopts this mechanic but softens it with shields to prevent the negative emotion that comes from streak loss.

---

### MVP Game Features

| Feature | MVP | Phase 2 | Phase 3 |
|---------|-----|---------|---------|
| Distance-based scoring | ✅ | | |
| Group leaderboard (weekly) | ✅ | | |
| Streaks | ✅ | | |
| Shareable result card | ✅ | | |
| Daily challenge (global) | | ✅ | |
| Achievement badges | | ✅ | |
| Tournament mode (bracket) | | | ✅ |
| Seasonal rankings | | | ✅ |
| Hint system (purchase) | | ✅ | |
| Difficulty ratings per post | | ✅ | |
| "Hardest posts" hall of fame | | | ✅ |

---

### Achievement Badges (Phase 2)

Badges should be earned, not purchased. They signal social status within the app.

Examples:
- **Cartographer**: 50 guesses within 1km
- **Home Turf**: Posted from 10 different locations within your home city
- **Continental**: Correctly guessed a post from 3 different continents
- **Sherlock**: Guessed a post within 100m
- **Around the World**: 100 total guesses

---

# SECTION 11: NETWORK EFFECTS

## Types of Network Effects Present in Gaea

### 1. Direct Network Effects (Friends)

The product is worthless with one user and gets better with every additional friend. Unlike a social media platform where you can consume content from strangers, Gaea requires bilateral relationships. Every friend you add:
- Generates posts for you to guess
- Competes against you on the leaderboard
- Guesses your posts (making your content more meaningful)

This is the strongest form of network effect: direct, reciprocal, and irreplaceable by algorithms.

### 2. Same-Side Network Effects (Group Competition)

The value of any friend group increases with group size, up to a point. A 3-person group has limited competition. A 12-person group generates multiple posts per day, rich leaderboard dynamics, and high social stakes. Groups of 6–15 people appear to be the optimal competitive unit — enough to generate daily content, small enough for personal relationships.

### 3. Cross-Side Network Effects (Poster ↔ Guesser)

More posters make the guessing experience richer. More guessers make posting more rewarding (more feedback, more competition). These two roles reinforce each other. As the platform grows, the game improves on both sides of the network.

### 4. Viral Loop Network Effects (Share Cards)

Every share card distributed by a winner to Instagram Stories, iMessage, or WhatsApp is a free, contextual ad that drives new user acquisition. The viral loop creates a network effect where growth itself generates more growth.

### 5. Geographic Network Effects

As Gaea grows, posts come from more diverse locations. High-density cities (NYC, London, SF, campus towns) become known for competitive, high-difficulty content. This creates geographic pride — "SF Gaea players are the best guessers" — which generates community identity that reinforces retention.

---

# SECTION 12: RETENTION ANALYSIS

## Retention Framework

| Timeframe | Target | Mechanism |
|-----------|--------|-----------|
| Day 1 | 60% | First guess experience; group joined; result pending |
| Day 7 | 35% | First week leaderboard result; streak in progress |
| Day 30 | 20% | Group habits formed; streak > 7; pending tournament |
| Day 90 | 12% | Core group deeply habituated; referral to new groups |

These targets are aggressive relative to social media benchmarks (Instagram D30 ~30%, TikTok D30 ~25%) but achievable given the game mechanic.

---

## Retention Loops

### Daily Loop
- Morning: notification of new post → open app → guess
- Evening: reveal notification → open app → see results → share or compete
- Trigger: social obligation ("my friend is waiting for me to guess")

### Weekly Loop
- Monday: weekly leaderboard resets → motivation to catch up
- Friday/Saturday: high post frequency (weekend activities)
- Sunday: weekly summary notification ("You ranked #2 this week — can you win next week?")

### Monthly Loop
- 30-day streak milestone → increased investment
- Monthly leaderboard history → narrative arc ("I'm getting better at this")
- New friend joins group → fresh energy, new competition

---

## Comparison With Competitors

| Platform | D1 | D7 | D30 | Primary Mechanism |
|---------|----|----|-----|-------------------|
| Snapchat | ~60% | ~40% | ~28% | Streaks + DMs |
| BeReal | ~70% (early) | ~35% | ~15% | Novelty (decays) |
| Wordle | ~55% | ~30% | ~18% | Daily puzzle habit |
| GeoGuessr | ~45% | ~25% | ~15% | Competitive maps |
| **Gaea Target** | ~60% | ~35% | ~20% | Game + social obligation |

Gaea's retention is mechanically superior to BeReal (because it has a game mechanic) and structurally different from GeoGuessr (because it uses the social graph, not strangers).

---

# SECTION 13: GROWTH STRATEGY

## Phase 1: Campus Seeding (0–50K Users)

**Target:** 5 campuses. 500 early users per campus. 10 strong friend-group clusters per campus.

**Tactic:**
- Identify "Darius" personas on each campus (dormitory RAs, Greek life social chairs, student org leaders, club presidents)
- Offer exclusive "Campus Champion" status (featured on leaderboard, early access, limited badge)
- Run campus-specific competitions ("UMich vs Michigan State — who knows their campus better?")
- Partner with study abroad programs: students leaving for a semester are perfect "traveler" content creators

**CAC Target:** Under $2/user via peer referral. No paid acquisition in Phase 1.

---

## Phase 2: Viral Loop Activation (50K–500K Users)

**Primary Loop:**
1. User wins a round
2. Shareable result card generated: "I guessed within 0.2 miles — can you beat that?"
3. Card shared to Instagram Story, WhatsApp, iMessage
4. Friend sees card, taps download link
5. Friend is onboarded and joins the group directly

**Secondary Loop:**
1. User posts an extremely difficult Gaea (middle of a Slovenian mountain, obscure building)
2. Friend's wild wrong guess is funny
3. Friend screenshots the reveal map and posts it to Twitter/TikTok with "my friends have no idea where I was 😭"
4. Organic social media posts about Gaea generate word-of-mouth acquisition

**K-factor target:** 1.2–1.5 (each existing user brings 1.2–1.5 new users on average via social sharing)

---

## Phase 3: Cohort Expansion (500K–5M Users)

**Cohorts to target:**
1. **Travel communities** (r/solotravel, travel creator TikTok): traveler personas are high-volume posters with the most interesting content
2. **Outdoor/hiking communities** (AllTrails users, REI customers): locations are inherently interesting for guessing
3. **Study abroad programs**: institutional partnerships with universities to promote Gaea to students going abroad
4. **International friend groups**: diaspora communities where friends are genuinely separated by thousands of miles

---

## Influencer Strategy

**Do not use celebrity influencers.** They generate passive followers, not engaged game players.

**Use nano-influencers (5K–50K followers) in:**
- Travel TikTok/Instagram
- Campus content creators (dorm vlogs, study-with-me channels)
- Outdoor / hiking community creators

**Approach:** Partner with creators who travel to interesting locations. They post their Gaea to the public. Public followers attempt to guess in a special challenge format. This generates massive top-of-funnel exposure with people who have strong geographic curiosity.

---

# SECTION 14: MONETIZATION

## Design Principle

Monetization must not damage the social experience. Any feature that creates a pay-to-win dynamic will destroy the competitive integrity of the game and accelerate churn among non-paying users.

---

## Revenue Model Recommendation: Freemium Subscription + Cosmetics

### Tier 1: Free (All Users)
- Full game access
- Up to 3 friend groups
- Standard result cards
- Basic leaderboard

### Tier 2: Gaea Pro ($4.99/month or $39.99/year)
- Unlimited friend groups
- Streak shields (2 per week, vs 1 for free)
- HD result cards with animated reveal
- Historical stats dashboard ("Your accuracy by city", "Hardest post you ever solved")
- "Pro" badge on profile
- Early access to new features

### Tier 3: Gaea Teams ($9.99/month)
- Designed for large groups (20–50 people)
- Tournament creation (bracket-style eliminations)
- Custom challenges with time limits
- Admin controls

---

## Secondary Revenue Streams (Phase 3+)

**Cosmetic Packs:** Custom map styles (topographic, vintage, satellite), special reveal animations, frame designs for result cards. One-time purchases, $1.99–$4.99. These generate revenue without affecting gameplay.

**Sponsored Challenges:** Brand-sponsored daily challenges. "This week's challenge is powered by REI — guess the National Park." The integration feels native because location and outdoors are on-brand.

**City Packs:** Curated "best of [city]" challenge packs (best coffee shops in Seoul, best viewpoints in Rome). Purchased by travelers preparing for a trip. $1.99 per city pack.

**Revenue Projection (Year 3, 2M MAU):**
- 8% Pro conversion = 160,000 subscribers × $40/year = **$6.4M ARR**
- Cosmetics: 15% of users spend avg $3 = **$900K**
- Sponsored challenges: 12 partnerships × $150K = **$1.8M**
- **Total Year 3 ARR: ~$9.1M**

This is a credible seed-stage revenue trajectory.

---

## What to Avoid

- **Advertising in the feed:** Destroys authenticity and the friend-group feel
- **Pay-to-win mechanics (purchasing better guesses, etc.):** Destroys competitive integrity
- **Selling location data:** Privacy catastrophe and regulatory liability
- **Aggressive upsell modals:** Creates friction and resentment

---

# SECTION 15: TECHNICAL ARCHITECTURE

## Recommended Stack

### Mobile
**React Native** (cross-platform iOS and Android from a single codebase)

*Rationale:* Building and maintaining two native codebases at a seed-stage startup is prohibitively expensive. React Native's performance is sufficient for map interactions and camera usage in 2024. Expo managed workflow accelerates development. If extreme performance issues arise in maps (unlikely with Mapbox RN SDK), isolated native modules can be written.

Alternative: Flutter (Dart) — slightly better performance, slightly worse React Native ecosystem integration.

---

### Backend
**Node.js + TypeScript on AWS**

- **API layer:** Express.js or Fastify for REST API; GraphQL for complex relational queries (friend lists, leaderboards)
- **Real-time:** WebSockets via AWS API Gateway (for live reveal notifications) or Pusher for faster implementation
- **Queue:** AWS SQS for reveal job processing (time-triggered reveals at 24-hour mark)
- **Caching:** Redis (ElastiCache) for leaderboard reads and active session data

---

### Database
**PostgreSQL (RDS) as primary datastore**

Schema decisions:
- Users, friendships, groups are relational — PostgreSQL is the right tool
- Posts and guesses are also relational (foreign keys, transactions)
- Scores and leaderboards: materialized views updated on reveal events

**PostGIS extension** for geospatial queries (finding distance between guess coordinate and true coordinate is a single PostGIS function call).

---

### Maps
**Mapbox SDK (iOS + Android + React Native)**

*Rationale:* Mapbox is the industry standard for embeddable, customizable interactive maps in mobile apps. Google Maps is more expensive at scale and less flexible for custom styling. Mapbox supports:
- Pin drop interaction natively
- Custom map styles (needed for cosmetic packs)
- Offline tile caching
- React Native SDK with active maintenance

Mapbox pricing at 50,000 MAU with ~2 map loads per session per day: approximately $1,500–3,000/month. Manageable at early scale.

---

### Storage
**AWS S3** for photo storage with **CloudFront CDN** for delivery.

Photo pipeline:
1. Client captures photo
2. Photo uploaded directly to S3 via presigned URL (not through backend — reduces latency and backend load)
3. Lambda trigger on upload: compress photo, generate thumbnail
4. CDN serves compressed photo; original retained for export/delete requests

---

### Authentication
**Firebase Auth or AWS Cognito**

Phone number OTP via Twilio (Firebase handles this natively). Apple Sign-In and Google Sign-In via OAuth. JWT tokens stored in secure device storage.

---

### Location Services
**Native device GPS** (CoreLocation on iOS, FusedLocationProvider on Android)

- Accuracy: target <10m
- Location is captured at post creation, never stored on device, immediately encrypted and sent to backend
- True location stored in encrypted database column, only decrypted at reveal time via backend logic
- Client never receives the true coordinates — only a distance score after reveal

---

### Notifications
**Firebase Cloud Messaging (FCM)** for both iOS and Android push notifications.

Notification triggers:
- New post in a group (delayed ~30 min to avoid spam if multiple friends post simultaneously)
- Reveal event fires
- Leaderboard position change (weekly summary, not real-time)
- Streak reminder (if no activity by 9 PM local time)

---

### Geospatial Distance Calculation
**PostGIS ST_Distance function** with geography type for accurate great-circle distance.

```sql
SELECT ST_Distance(
  guess_coords::geography,
  true_coords::geography
) AS distance_meters
FROM guesses
WHERE guess_id = $1;
```

Scoring applied server-side based on returned distance. Client cannot manipulate scoring.

---

### Security Architecture
- All API calls require JWT authentication
- True location coordinates stored encrypted (AES-256) in database
- Reveal logic runs server-side; clients receive score, not coordinates
- Rate limiting on all endpoints (especially post creation and guessing)
- Photo moderation: AWS Rekognition for CSAM and explicit content detection before post is surfaced

---

# SECTION 16: PRIVACY AND SAFETY

## Why This Section Is Critical

Gaea is a location-sharing product. Location data is among the most sensitive personal data categories that exist. A single privacy failure — one instance of location data being used to track, stalk, or harass a user — would cause catastrophic reputational damage and potential regulatory action.

Privacy must be a first-principles design constraint, not a bolt-on policy.

---

## Threat Model

### Threat 1: Stalking via Precise Location Reveal

**Risk:** A bad actor (abusive ex-partner, stalker) gains access to a user's precise location via Gaea posts.

**Mitigation:**
- **True coordinates are never revealed to clients.** Only the distance score is returned. The reveal map shows the approximate area, not a GPS pin on the exact address.
- **Reveal precision:** True location shown at ~100m radius circle, not a precise GPS point.
- **Friend-only posting:** In MVP, all posts are visible only to explicitly-added friends. No public posts.
- **Delayed reveal:** Reveal fires 24 hours after posting. The user is no longer at that location.
- **Location blur:** For posts made at a user's home or work (detected via frequent posting within a geofence), precision is automatically reduced to ~500m radius.

### Threat 2: Location Pattern Analysis

**Risk:** A bad actor compiles multiple posts over time and triangulates a user's home address, work location, or daily routine.

**Mitigation:**
- **Privacy Zones:** Users designate up to 3 "Privacy Zones" (home, work, school). Posts within a Privacy Zone have their coordinates blurred to the nearest kilometer.
- **Anti-pattern detection:** Backend flags if more than 3 posts in 30 days come from a <100m radius — user is prompted to enable Privacy Zone for that location.
- **Post history:** Users can delete any post and its associated location data from the database.

### Threat 3: Minors and Age-Specific Risks

**Risk:** Minors sharing location data presents heightened safety concerns.

**Mitigation:**
- Age verification at onboarding (date of birth required)
- Users under 18 default to "Under 18 Mode": friend requests require mutual phone contacts, no username-only discovery, all location blurring at maximum
- Parental approval flow for users 13–15 (COPPA-compliant)
- No location data in shareable result cards for minor accounts (card shows distance score only, no map visualization)
- Gaea does not accept users under 13.

### Threat 4: Doxxing via Photo Content

**Risk:** Photo content reveals precise location through visible street signs, building numbers, or unique landmarks — not coordinates.

**Mitigation:**
- This is an inherent challenge with any photo-sharing product. Gaea cannot prevent users from posting identifiable images.
- User education: onboarding tip — "Gaea is more fun when you're creative with what you reveal!"
- Reporting tools for posts that contain sensitive personal information (home address, ID documents, etc.)
- This risk is partially mitigated by the game mechanic itself: the best Gaea photos are *ambiguous enough* to be a challenge. Posting your house number defeats the game's purpose.

### Threat 5: Harassment via Challenge Mechanics

**Risk:** A user is repeatedly tagged in challenges, bombarded with notifications, or targeted by a hostile group.

**Mitigation:**
- Block and report on any user or group
- Leaving a group immediately stops all notifications from that group
- "Quiet mode" to disable notifications for individual posts
- Friends-only model (MVP) means hostile strangers cannot interact with you without a mutual friend connection

### Threat 6: Location Data Breach

**Risk:** Database compromise exposes user GPS coordinates.

**Mitigation:**
- True location coordinates stored encrypted at rest (AES-256, per-user key derived from user ID)
- No raw coordinates transmitted to clients at any time
- Encryption keys managed via AWS KMS, not application-layer secrets
- Regular penetration testing (third-party, annually after launch)
- SOC 2 Type II certification target within 18 months of launch

---

## Privacy-First Default Settings

| Setting | Default | User-Adjustable |
|---------|---------|-----------------|
| Location precision | 100m radius blur | Yes (increase blur) |
| Privacy Zones | 0 zones (prompt to set up) | Yes (up to 3 zones) |
| Friend requests | Mutual contacts only | Yes (open to anyone) |
| Post history visibility | Friends only | Yes (private only) |
| Result card sharing | Score only for <18 | N/A for <18 |
| Data retention | Location data deleted 90 days after reveal | Yes (immediate deletion) |

---

## Regulatory Considerations

- **GDPR (EU):** Location data is "special category" data requiring explicit consent. Gaea EU users receive consent screens specifically for location data. Right to erasure must delete all location coordinates.
- **CCPA (California):** Users can request full data export and deletion.
- **COPPA (US):** Under-13 users prohibited. Under-16 requires verifiable parental consent in some states.
- **App Store / Play Store requirements:** Both Apple and Google require explicit location permission dialogs. Gaea must clearly explain why location is needed at permission request time.

**Legal Counsel:** Engage a privacy attorney before public launch. Location data in a social context is a rapidly evolving regulatory area.

---

# SECTION 17: RISK REGISTER

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Cold-start / no content in new groups | High | High | Seeded campus launch; minimum group size 3; onboarding prompts first post |
| BeReal / Snapchat copies the mechanic | Medium | High | Move fast; establish brand loyalty before copy lands; game design depth is moat |
| Privacy incident (location data misuse) | Low | Critical | Privacy-by-design architecture; delayed reveal; coordinate blur |
| Low D7 retention (game novelty wears off) | Medium | High | Streaks, leaderboards, group social obligation are structural not novelty-dependent |
| Map SDK costs spike at scale | Low | Medium | Mapbox cost monitoring; negotiate enterprise terms at 500K+ MAU |
| App Store policy change (location permissions) | Low | High | Stay current with Apple/Google guidelines; alternative web fallback |
| User abuse (harassment in groups) | Medium | Medium | Robust reporting, block tools; friend-only model limits exposure |
| Geographic coverage gaps (rural areas, satellite limitations) | Medium | Low | Mapbox satellite tiles available globally; scoring works regardless of map quality |
| Inability to hire senior mobile engineers | Medium | Medium | Competitive equity packages; React Native reduces iOS/Android hiring pressure |
| Regulatory action on location data (EU) | Low | High | GDPR compliance from day one; DPA engagement before EU launch |
| Friend-group game fatigue (group goes dormant) | Medium | Medium | Cross-group leaderboards; seasonal resets keep competition fresh |
| Competitor acquires GeoGuessr and adds social layer | Low | Medium | Social graph and friend-first mechanics are our defensible moat, not geography game quality |

---

# SECTION 18: ROADMAP

## Phase 1: Private Beta (Months 1–4)

**Goal:** Validate core game mechanic with 500–2,000 real users in controlled environments.

**Deliverables:**
- iOS app (Android to follow in Phase 2)
- Core auth, posting, guessing, scoring, reveals
- Shareable result card
- Friend groups (up to 20 users)
- Basic leaderboard (weekly, per group)
- Privacy Zones
- 3 campus beta programs

**Success Criteria:**
- D7 retention ≥ 30%
- Average guesses per post ≥ 60% of group
- At least 2 friend groups per user on average
- 40% of users share at least one result card externally

---

## Phase 2: Public Launch (Months 5–9)

**Goal:** Expand to 25,000–100,000 MAU via campus seeding and viral loops.

**New Features:**
- Android launch
- Daily Challenge (curated, non-friend post for solo guessers)
- Streak system with shields
- Achievement badges
- Web view for result card sharing (no-download-required guessing)
- Improved notification system with time-of-day optimization
- Gaea Pro subscription launch

**Growth Activities:**
- 25 campus ambassador programs
- Travel creator partnerships (10–20 nano-influencers)
- Press outreach targeting college media and tech media

---

## Phase 3: Competitive Features (Months 10–18)

**Goal:** Deepen engagement for power users; increase ARPU.

**New Features:**
- Tournament mode (bracket-style group competitions)
- Seasonal leaderboards (global top 1,000 by region)
- Hint purchasing (cosmetic/optional)
- City Packs (curated challenge collections)
- Custom group challenges (time limits, difficulty settings)
- Cross-group leaderboards ("Gaea Score" — individual lifetime ranking)
- Gaea Teams tier launch

---

## Phase 4: Global Community (Months 19–30)

**Goal:** Expand beyond English-speaking markets; establish Gaea as a global social game.

**New Features:**
- Localization (Spanish, French, Japanese, Korean, Portuguese)
- Regional leaderboards and country-specific daily challenges
- Study abroad institutional partnerships (international)
- API for potential third-party integrations (travel apps, campus platforms)
- Sponsored challenges (brand partnerships)
- Family Mode (cross-generational groups)

---

## Phase 5: Platform Expansion (Months 30+)

**Goal:** Expand the "location as game board" concept beyond friend-group guessing.

**Possible Expansions:**
- Gaea Live: real-time guessing events (post from a live event, friends guess simultaneously)
- Gaea Video: short video clips as the guessing medium
- Gaea Public: opt-in public posts where any user can guess (creator tier)
- Gaea for Travel: trip planning + location-log tools for travelers
- B2B: white-labeled version for corporate team-building, educational institutions

---

# SECTION 19: SUCCESS METRICS

## North Star Metric

**Guesses per day per active user**

This metric captures both sides of the game mechanic (content supply and engagement demand) in a single number. A user who opens the app and guesses is fully engaged with the product's core loop. Target: 2.5 guesses/day/active user.

---

## Activation Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Onboarding completion rate | ≥70% | Phone → profile → first guess |
| Time to first guess | <5 min | If first guess takes >10 min, onboarding fails |
| Group joined at signup | ≥80% | Via invite link; critical for retention |
| First post within 48 hours | ≥40% | Poster activation; necessary for supply |

---

## Retention Metrics

| Metric | Target |
|--------|--------|
| D1 retention | ≥60% |
| D7 retention | ≥35% |
| D30 retention | ≥20% |
| 3-month streak (any streak) | ≥15% of MAU |

---

## Engagement Metrics

| Metric | Target |
|--------|--------|
| Daily guesses / active user | 2.5 |
| Posts per user per week | 1.5 |
| Group guess participation rate | ≥65% of group members guess each post |
| Reveal open rate | ≥75% of guessers open the reveal |
| Result card share rate | ≥20% of winners share externally |

---

## Virality Metrics

| Metric | Target |
|--------|--------|
| K-factor | ≥1.2 (viral) |
| Invite conversion rate | ≥25% (invitee downloads) |
| % new users acquired via invite | ≥60% |
| % new users acquired via share card | ≥25% |

---

## Monetization Metrics

| Metric | Target (Month 12) |
|--------|------------------|
| Pro conversion rate | ≥5% of MAU |
| ARPU (all users) | $2.00/month |
| LTV:CAC ratio | ≥3:1 |
| Annual subscription mix | ≥40% of Pro subscribers |

---

## Community Health Metrics

| Metric | Target |
|--------|--------|
| Reports per 1,000 posts | <2 |
| Account bans per 1,000 users per month | <1 |
| Privacy deletion requests | Processed within 30 days |
| User-reported location concerns | Tracked; target zero escalated incidents |

---

# SECTION 20: FOUNDER RECOMMENDATION

## Should This Company Be Built?

**Yes. Conditionally. With significant caveats.**

---

## The Case For

Gaea sits at the intersection of three proven consumer behaviors: location-based gaming (GeoGuessr, Pokémon GO), authentic social (BeReal, Locket), and casual competitive loops (Wordle, NYT Games). No product currently occupies this intersection. That is a genuine white space.

The core mechanic — every photo is a game — is the best I've seen for solving the "passive social media" problem. It is structurally viral (the result card is the new Wordle share). It creates social obligation that drives return visits without being coercive. It rewards intimacy (knowing your friends' lives) rather than performance (being aesthetically excellent).

The business model is sound: freemium subscription with low-cost CAC via viral loops. The TAM is large enough for a venture-scale outcome. The exit paths are clear: Snap, Google Maps, Airbnb, or a gaming company would all be credible acquirers of a platform with millions of engaged, location-sharing social users.

---

## The Case Against

**BeReal is the cautionary tale.** BeReal peaked at 73M MAU and then lost 75%+ of its daily active users in 18 months. BeReal's problem was that it had a novel mechanic but no durable engagement loop. Gaea has a game mechanic that should be more durable — but should be is not is. The D30 and D90 retention data from beta must be rigorously validated before committing to a Series A fundraise.

**Social apps are winner-take-most.** The social graph is a moat, but only if you're the one sitting on it. If Snapchat ships a "guess where I am" feature natively in Snap Map tomorrow, Gaea's wedge collapses. The only defense against this is speed: reach a critical mass of daily active users on specific campuses before a competitor can ship a copycat.

**Location privacy is a liability.** One bad incident — one case of a Gaea post enabling a stalking event — will generate headlines that destroy the brand. The privacy architecture described in Section 16 is robust, but it requires excellent engineering execution and constant vigilance.

---

## What Version to Build

**Build Option C (friend-group game), seeded on campuses, with a ruthless focus on the core loop.**

**Remove from MVP:**
- Public feed
- Follower counts
- Algorithmic discovery
- Video posts
- Comments
- Reactions / likes (these add performativity; the game mechanic is enough)

**Add to MVP (not listed above):**
- Shareable result card (non-negotiable for growth)
- Web view for guessing (so non-users can guess without downloading)
- Privacy Zones (non-negotiable for safety)

---

## The Strongest Wedge

Campus friend groups. Specifically: colleges with active Greek life, study abroad programs, and strong group identity. The density of friend connections is highest, the willingness to try new social apps is highest, and the "interesting location" problem is naturally solved (everyone is moving between cities, countries, and campuses).

**Target campus #1 on Day 1:** A single university. Build 10 active friend groups. Achieve D30 retention ≥ 20%. Then expand to 5 more campuses. Prove the mechanic at scale before scaling the company.

---

## The Biggest Risk

**Retention after novelty fades.** If the game mechanic feels repetitive after 30–60 days, Gaea has a BeReal-shaped problem. The mitigation is the social obligation loop (friends expect you to guess their post) and the streak mechanic. Both must be in the product from day one and must be tested rigorously.

---

## Would I Invest?

**Yes, at the right terms, with one condition.**

The condition: I need to see D30 retention data from a closed beta of at least 500 users on at least 2 campuses before committing to a seed round. The mechanics are compelling and the white space is real. But consumer social is littered with products that worked in theory and died in the wild. Show me that users are still guessing after 30 days. Then I'm in.

**Seed valuation range:** $8–12M post-money, $1.5–2.5M raised, for 18 months of runway to reach 25,000–100,000 MAU with validated D30 retention.

---

# SECTION 21: FURTHER RESEARCH REQUIRED

## Research Priority Matrix

| Research Area | Priority | Validation Method | Hypothesis |
|---------------|---------|-------------------|------------|
| BeReal DAU collapse root cause | Critical | Public data + founder interviews | Hypothesis: the product failed because of zero game mechanic, not because of category exhaustion |
| GeoGuessr freemium conversion rate | High | Revenue estimates vs user count | Hypothesis: geographic-game players convert at 8–12%, higher than social apps |
| Snapchat Snap Map daily active users | High | App Annie / Sensor Tower estimates | Hypothesis: <5% of Snapchat users open Snap Map weekly |
| D30 retention for Wordle-style games | High | Public reports + benchmarks | Hypothesis: daily puzzle loops retain at 15–20% D30 |
| Campus social app launch playbooks | High | Case studies: Fizz, Yik Yak, Sidechat | Hypothesis: campus launches require 1 dedicated ambassador per 200 students |
| Gen Z location-sharing comfort | Critical | Primary survey (200+ Gen Z users) | Hypothesis: comfort with location-sharing in friend-only contexts is >70% |
| Mobile map SDK performance benchmarks | Medium | Technical testing | Hypothesis: Mapbox React Native is sufficient for MVP map interactions |
| Privacy Zone design patterns | High | User research sessions | Hypothesis: users want 2–3 zones (home + work), not fine-grained control |
| Optimal group size for engagement | Medium | Beta data | Hypothesis: 6–12 person groups have 30% higher engagement than 3–5 person groups |
| Streak mechanic churn behavior | High | Duolingo / Snapchat literature | Hypothesis: streak loss is the single largest churn event; shields reduce it by >40% |

---

## Open Research Questions

**On Product:**
1. What is the optimal time window for guessing — 24 hours, 12 hours, or player-configurable?
2. Does a visible timer increase or decrease guess quality? (Urgency vs. deliberation)
3. Should users be able to see how many friends have guessed before guessing themselves? (Social proof vs. independence of guesses)
4. What is the minimum viable friend group size to sustain engagement for 30+ days?

**On Growth:**
1. Which campuses have the highest per-capita GeoGuessr usage? (Proxy for Gaea affinity)
2. What is the average K-factor for photo-sharing apps launched on campus (Fizz, Locket, BeReal)?
3. Does the shareable result card perform better when it includes a map visualization or a score-only format?

**On Monetization:**
1. What is the maximum price Gen Z users will pay for a social app subscription?
2. Is the City Pack (travel guide) concept more appealing to travelers pre-trip or during a trip?
3. Does the presence of a paid tier affect the social dynamics of competitive groups?

**On Safety:**
1. What percentage of users would designate a Privacy Zone if prompted at onboarding?
2. Is the 24-hour delay sufficient as a stalking deterrent, or do users require additional location blurring?
3. How do we handle users who post from genuinely sensitive locations (shelters, hospitals, protected residences)?

---

## Recommended Validation Experiments

### Experiment 1: Paper Prototype Test
**Method:** Run a Gaea game manually with 10–15 users using iMessage and a shared Google Form for guesses. Measure engagement and retention for 2 weeks.  
**Success Signal:** >70% of participants guess every post within 24 hours.

### Experiment 2: Single Campus Cohort
**Method:** Recruit 50 users on one campus. Build a minimal iOS prototype. Run for 30 days.  
**Success Signal:** D30 retention ≥ 20%, average 2+ guesses per day per user.

### Experiment 3: Share Card Virality Test
**Method:** Design two share card variants (map visualization vs. score-only). A/B test share rate and conversion rate on 500 users.  
**Success Signal:** At least one variant achieves ≥15% external share rate.

### Experiment 4: Privacy Zone Audit
**Method:** In beta, survey 100 users on their comfort level with location precision at reveal.  
**Success Signal:** >80% report comfort with 100m radius blur; <10% report concern even with blur.

---

# SECTION 22: BUILD STATUS & GAP ANALYSIS

*Added 2026-06-14 after a codebase audit. This section tracks what is actually implemented in the repo today versus the product vision and the mockups in `/screens`. It is the working engineering backlog — keep it current.*

## Current Architecture (as built)

- **Backend** (`/src`): Node + Express 5 + TypeScript, TypeORM over PostgreSQL, JWT auth, Redis-backed rate limiting, S3/MinIO image storage, Jest tests. Entities: `User`, `Photo`, `Guess`, `Friendship`, `Comment` (+ a notifications service). Docker Compose dev environment.
- **Mobile** (`/cosmo-mobile`): Expo / React Native, Redux Toolkit, React Navigation native stack. Screens: Login, Register, Onboarding, Home, Feed, Capture, Guess, Profile, PhotoDetail.
- **Scoring** (`src/game/scoring.ts`): Haversine distance → points, in JS.

## What aligns with the vision ✅

- Auth, friends (request/accept), photo upload with lat/lng, feed of friends' photos, per-photo guessing, per-photo leaderboard endpoint, and proximity scoring all exist end-to-end on the backend.
- Friend-only visibility is enforced (`friendshipCheck` middleware) — matches the privacy-by-design / closed-graph requirement.
- One-guess-per-photo rate limiting exists — matches "one guess per post."
- Mobile app has the right screen skeleton and a Redux store already sliced by feature (feed, guesses, photos, capture).

## Critical gaps vs. vision & mockups ❌

| # | Gap | Where | Notes |
|---|-----|-------|-------|
| 1 | **Maps are commented out** in the guess flow | `cosmo-mobile/src/screens/GuessScreen.tsx` | Shows "Maps functionality is temporarily disabled." This is the core mechanic. `react-native-maps` is a dependency but unused. Mockup `map_guess` needs a sticky center pin + pan/zoom + world-zoom default. |
| 2 | **Brand is still "Cosmo," not "Gaea"** | Mobile app (`FeedScreen` title, `app.json`, package name, many files) | Mockups show lowercase **gaea** wordmark. Rename pass needed across `/cosmo-mobile`. |
| 3 | **Feed UX doesn't match `feed.png`** | `FeedScreen.tsx`, `PhotoCard.tsx` | Mockup needs: sticky bottom nav (home / upload / profile), in-card map-icon toggle (photo ⇄ map), caption + comments section. Current build has a floating "+" button, a separate "Guess Location" route, no bottom nav, no comments on the card. |
| 4 | **Comments not gated on guessing** | backend + mobile | Vision: comments locked until the viewer submits a guess (BeReal-style). `Comment` entity exists but no gate. |
| 5 | **No caption / location-label on a post** | `src/entities/Photo.ts` (no `caption` column) | Mockups `feed`, `pre_upload`, `map_guess` all show captions; `pre_upload` shows a tagged street address + an optional "hint." Photo entity needs `caption` (and likely a reverse-geocoded display label + optional hint). |
| 6 | **Guess-accuracy result screens missing** | mobile | Mockups `guess_accuracy_1` (two-pin map + distance) and `guess_accuracy_2` (points ring) are swipeable; carousel styles exist in `GuessScreen` but the views are unbuilt (blocked by gap #1). "See leaderboard" CTA needed. |
| 7 | **Scoring curve doesn't match design spec** | `src/game/scoring.ts` | Current: **linear**, 0 pts beyond **20 km**. PRD §10: **nonlinear decay**, partial points out to **100 km+**. Reconcile (and decide the official max distance). |
| 8 | **Camera-only capture not enforced** | `CaptureScreen` / capture flow | Anti-spoofing requirement: live in-app camera + GPS captured at shutter, no library import. Need to confirm `photo_processing` (location collection) and `pre_upload` (tag + caption + upload) flow exists and blocks gallery uploads. |
| 9 | **No reveal/timer, streaks, groups, or weekly leaderboard** | backend | All are MVP per PRD (§8, §10). Today there is only an all-time per-photo leaderboard, no time-boxed reveal, no streak counter, no group entity, no per-group/weekly board. |
| 10 | **Launch + skeleton loading screens** | mobile | Mockups `init_screen` (splash) and `loading_feed` (gray skeleton placeholders) are not implemented; current loading is a plain spinner. |
| 11 | **Notifications screen** | mobile | `notifications.png` mockup exists; no screen built (backend service exists). |

## Tech-debt / hygiene notes

- `// @ts-nocheck` at the top of `src/routes/guess.ts` — type checking suppressed; remove and fix.
- README claims **PostGIS** geospatial queries, but distance is computed in JS via Haversine and `Photo` stores plain `float` lat/lng. Either adopt PostGIS (`geography` column + `ST_Distance`, as PRD §15 specifies) or correct the README. Recommendation: keep JS Haversine for MVP, fix the README.
- Two `HomeScreen` and `FeedScreen` both wired as the post-login feed — `Home` is dead/duplicate. Consolidate.
- **Done in this pass:** removed committed `coverage/` build artifacts (now gitignored), deleted junk nested `cosmo-mobile/cosmo-mobile/` directory, swept stray `.DS_Store` files.

## Recommended build order (next milestones)

1. ✅ **Rebrand Cosmo → Gaea** across the mobile app — *done.* `app.json` (name/slug/permission strings), secure-storage keys, and the Login/Home/Register wordmarks now read Gaea/gaea.
2. ✅ **Re-enable maps** + build the `map_guess` interaction — *done.* New `MapGuess` component (`src/components/MapGuess.tsx`): a static center pin over a pannable `react-native-maps` `MapView` that defaults to a zoomed-out world region, with a "Guess" lock-in pill.
3. ✅ **Build the result screens** (`guess_accuracy_1` / `_2`) + leaderboard CTA — *done.* New `GuessResult` component (`src/components/GuessResult.tsx`): swipeable two-pin distance map + points pages with a "See leaderboard" view.
4. ✅ **Reshape the feed** to match `feed.png` — *done.* `FeedScreen` now has the `gaea` header + bell and a skeleton loading state; `BottomNav` adds the sticky home/upload/profile bar; `PhotoCard` does the in-card photo⇄map toggle, renders the caption, and locks comments until the viewer guesses.
5. ✅ **Caption/hint plumbing + camera-only capture flow** — *done.* `caption` and `hint` columns added to the `Photo` entity and threaded through upload/feed/detail responses (`photoController.ts`); mobile `Photo` type + `photoApi.uploadPhoto` + `captureSlice` updated. `CaptureScreen` rewritten on the modern `expo-camera` `CameraView` API as a three-stage flow — **camera-only** live capture (gallery picker removed for anti-spoofing) → `photo_processing` (GPS + reverse-geocode) → `pre_upload` (reverse-geocoded address label, caption, hint, "Upload Photo"). The poster's hint now shows as a banner over the guessing map (`MapGuess`). *(This rewrite also cleared the 14 stale TypeScript errors the old `CaptureScreen` carried.)*
6. ⏳ **Reconcile the scoring curve** with PRD §10 — not started (still linear / 20 km cutoff).
7. ⏳ **Game-depth backbone** — not started: reveal/timer, streaks, groups, weekly leaderboards, splash screen, notifications screen.

**Schema note:** `Photo` gained `caption` and `hint` columns. With TypeORM `synchronize` on in dev these apply automatically; for any non-synchronize environment, generate a migration before deploying.

## Known follow-ups surfaced during the build

- **Hardcoded Google Maps API key** is committed in `cosmo-mobile/app.json` (iOS + Android + the maps plugin). Restrict it by bundle ID / SHA in the Google Cloud console, and ideally move it to an EAS secret / env injection. It is already in git history — rotate it.
- `cosmo-mobile` package `name` is still `cosmo-mobile`; pre-existing TypeScript errors remain in `CaptureScreen.tsx`, `ProfileScreen.tsx`, `useAuth.ts`, and the mobile test suite (missing `@testing-library/react-native` / `redux-mock-store` dev deps). None block the new feed/guess work, but they should be cleaned up.
- Comment posting is **gated** in the UI but not yet **persisted** — the `Comment` entity exists with no create/list endpoint wired to the card.

---

*End of Document*

---

**Gaea PRD v1.0**  
Prepared for: Founding Team, Angel Investors, Seed-Stage VCs  
Status: Working Draft — Not for External Distribution  
Next Review: After Campus Beta Completion
