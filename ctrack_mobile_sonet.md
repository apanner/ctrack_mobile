# ctrack_mobile — Deep Thoughts & Suggestions

> A senior product + engineering review of `ctrack_mobile_plan.md`.
> Written to be honest, sharp, and actionable.
> Date: 2026-02-27

---

## Overall Assessment

The plan is architecturally sound and vision is ambitious in all the right ways.
The stack choices (Supabase + S3 + Next.js + PWA) are pragmatic and reuse what
already exists. However, several areas carry real risk that the plan glosses over.
This document breaks down what is strong, what is risky, what is missing, and what
would make this the most polished VFX artist app on the market.

---

## What Is Strong

- Single stack decision (Supabase for everything) eliminates operational complexity.
  No Firebase, no separate realtime infra to manage. Correct call.
- The 60-second daily logging target is the most important product KPI in this
  entire plan. If achieved, adoption will be high. If missed, artists will abandon it.
- Apple-native glassy design direction is the right aesthetic for a creative studio.
  Artists use MacBooks and iPhones daily. They will judge the app by feel instantly.
- Progressive disclosure principle (simple first, advanced behind sheets) is critical
  and should be enforced strictly in code review as well as design.
- The ASCII screen layouts give a clear enough mental model for developers to start
  building without ambiguity. Good move.
- Reusing `ctrack_v0` timeit service and migrations as the foundation avoids
  data duplication and keeps one source of truth. This is the correct architecture.

---

## What Is Risky

### 1. PWA on iOS is Still Second-Class
iOS Safari PWA has severe limitations in 2026 that the plan underestimates:
- Web push on iOS requires iOS 16.4+ and only works when the PWA is installed to
  home screen. Users on older iOS or not-yet-installed will get zero notifications.
- Background GPS tracking via web API is not reliable on iOS PWA. Safari aggressively
  suspends background scripts.
- Audio recording (MediaRecorder API) has inconsistent codec support on iOS Safari.

**Suggestion**: Plan a thin React Native wrapper (Expo bare workflow or Expo Go
production build) as a Phase 2 upgrade path alongside PWA. This is not a redo —
the same React codebase runs in both. The wrapper just unlocks native push,
background location, and background audio encoding. iOS artists deserve parity.

---

### 2. Continuous GPS Will Drain Battery and Cause Uninstalls
Always-on GPS tracking with no smart throttle will drain battery 20-30% faster per
shift. Artists notice this. They will disable location or uninstall.

**Suggestion**: Use adaptive tracking strategy:
- When device is stationary (speed < 1 km/h) reduce poll to every 5 minutes.
- When device is moving, poll every 30-60 seconds.
- When shift ends (or timesheet stopped), drop to heartbeat mode (every 30 minutes).
- Show battery impact estimate in the consent screen so trust is built upfront.
- Give artists a visible "pause tracking" button (with admin audit log of pauses).

---

### 3. Chat Will Become the Most Used Feature and Also the Biggest Scaling Problem
Supabase Realtime is excellent for small-to-medium loads. However a VFX studio
with 80+ artists all in a project chat, sharing audio and images during crunch week,
will create message volume and binary media that stresses the system.

**Suggestion**:
- Paginate message history aggressively (load last 50 messages, infinite scroll up).
- Never store binary chat media in Supabase Storage. Always use S3 presigned upload
  from client with reference key stored in `chat_attachments`. Already in the plan
  but must be enforced — no exceptions.
- Add message soft-delete and edit with version history for moderation compliance.
- Consider Supabase Realtime channels scoped per room (already in plan) with
  explicit subscribe/unsubscribe on screen focus to avoid subscription accumulation.

---

### 4. The Admin Control Center May Get Built Last and Never Polished
Phase 4 admin work is easy to deprioritize when mobile features are more visible.
But admin is where supervisors and production managers spend their whole day.
If it is slow, confusing, or limited, the entire system loses trust at the top.

**Suggestion**: Build admin data tables and approval APIs in Phase 1 alongside
mobile. The UI can be basic in Phase 1 but the endpoints must exist so admin can
approve timesheets while mobile Phase 1 ships. The polished control center UI is
Phase 4 but the underlying APIs are Phase 1.

---

### 5. Timesheet Correction Flow Is Underspecified
The plan mentions a "correction request flow" in Feature Set but gives it one line.
In real studios, timesheet corrections are a daily admin pain point. Artists forget to
log, log to wrong shot, or need to amend after approval.

**Suggestion**: Design a full correction lifecycle:
- Draft → Submitted → Approved → Correction Requested → Corrected → Re-approved
- Correction reason field (required for audit).
- Admin can unlock specific day for re-edit without touching rest of week.
- Audit trail showing every state change with timestamp and who performed it.
- Correction count metric on admin dashboard as quality signal.

---

### 6. No Offline Strategy for Timesheets
Artists work in studios, not always with good connectivity (render farms, server
rooms, enclosed sets). If the mobile app requires a live connection to log time,
data will be lost during outages.

**Suggestion**: Implement optimistic offline queue for timesheets:
- All timesheet writes go to IndexedDB local queue first.
- Service worker syncs queue to API when connection is restored.
- Conflict resolution: last-write-wins on draft state, server wins on approved state.
- Visual indicator when operating in offline mode (subtle, not alarming).

---

## Missing Features Worth Adding

### Artist Profile Card (VFX Context)
Each artist should have a profile card showing:
- Current active project and shot.
- Department and role (Compositor, Lighter, etc.).
- Task load this week vs capacity.
- Leave balance remaining.
- Streak (days of complete timesheets) — gamification encouragement.

This card is visible to team leads and the artist themselves. Helps supervisors
quickly triage who has bandwidth without opening the full admin panel.

---

### Shot-Linked Quick Notes (Not Chat, Not Timesheet)
VFX artists constantly jot things like "render farm node 12 failing on this shot"
or "client requested gamma change after v07". These are shot-specific working notes.
Chat loses them. Timesheet is the wrong place. Need a lightweight note per shot
per artist — viewable by supervisors — that persists with the shot record.

**Implementation**: Simple `shot_artist_notes` table. Mobile: quick note button
from task detail. Admin: note feed per shot in task view.

---

### Daily Standup Digest (Push at Standup Time)
VFX studios run a daily standup, often 9-10am. The app could:
- Auto-generate a "your day" digest push at configurable standup time.
- Show: tasks due today, tasks overdue, unread mentions, leave of teammates.
- Admin can trigger team digest to a project chat room.
- This replaces the need for a supervisor to manually chase status from 20 artists.

---

### Leave Calendar (Team View)
Artists need to see when their teammates are on leave before they apply.
Currently the plan has leave apply + approval but no team visibility for artists.

**Suggestion**: Add a read-only team leave calendar view on mobile:
- Segmented by department.
- Highlights conflicts with own planned leave.
- Shows delivery risk dates (if critical shot is due and 3 of 4 team members are on leave).

---

### Shot Status Quick Update from Mobile
Artists should be able to update shot status (In Progress → Review Ready → On Hold)
directly from their task card. Currently the plan shows task lanes but no shot
status mutation from mobile.

**Why it matters**: Supervisors learn about blockers hours late because the artist
updated their timesheet but forgot to change the shot status in the web app.
Mobile shot status update closes this loop instantly.

---

### Announcement Board (Read-Only, Admin to All)
Studio management sends announcements: holiday policy changes, client visit schedules,
render farm downtime. These get lost in chat. A separate announcement board:
- Admin posts announcement with optional expiry date.
- Artists see it on home screen as a pinned card.
- "Read" tracking per announcement for compliance-critical notices.
- Distinguishable from chat noise.

---

## UX Refinements

### Bottom Tab Count: Five Is One Too Many
The plan has: Home | Time | Chat | Tasks | Profile. Five tabs plus a Tools screen.
That is too many primary destinations. The mental model breaks.

**Suggestion**: Collapse to four:
- Home (dashboard + reminders + timer — everything in one scroll)
- Work (timesheet + tasks combined under one work tab)
- Chat
- Me (profile + settings + tools + leave)

Tools and reminders surface as cards on Home and as a sheet from Me. This makes
every tab feel essential rather than crowded.

---

### Timer as a Floating Persistent Element
The active timer (logged hours against current task) should be a persistent floating
pill at the top of every screen, not just visible on Home. Like how a music player
persists across tabs in Apple Music. This way:
- Artist does not lose track of time while reading a chat message.
- Tap the pill to expand the timer detail sheet.
- Pulsing animation subtly reminds artist the clock is running.

---

### Timesheet Entry UX: Wheel Picker Not Text Input
Typing hours is error-prone on mobile. Use a native-feel wheel/drum picker for hours
(0 to 12) and minutes (0, 15, 30, 45). Familiar from iOS clock/alarm UI. Pairs with
the glassy design direction. Adds significant perceived quality.

---

### Empty State Quality
Every empty state is a moment of trust. When an artist has no tasks, the home screen
should not show a blank list. It should show:
- Warm message with their name.
- Hint about what to expect here.
- Illustration that matches the studio's brand.
Empty states are often the first thing a new artist sees and the last thing polished.
Plan them from day one.

---

### Onboarding Flow (First Launch)
The plan has no onboarding flow. A new artist installing the PWA for the first time
needs to:
1. See what the app does in 3 slides (not marketing, actual functional walkthrough).
2. Grant location permission with context (why, what is tracked, who sees it).
3. Grant notification permission with context (types, how to control them).
4. Set their shift hours (or skip to use studio default).
5. Land on Home with their tasks already populated.

This onboarding is the most important UX moment. It determines whether notifications
and GPS will be granted. Without them, the app is half functional.

---

## Technical Suggestions

### API Versioning from Day One
All mobile endpoints should be under `/api/v1/mobile/...` not `/api/mobile/...`.
Mobile apps are slow to update. When you need to change a response shape, you will
want `/v2/` to exist without breaking `/v1/` for artists still on the old install.

---

### Schema: Add `is_archived` to Chat Rooms
Studios have hundreds of projects over years. Project chat rooms must be archivable
without deletion. Archived rooms are read-only, searchable, and hidden from the
active list. Without this, the chat room list becomes unusable in 12 months.

---

### Supabase RLS Performance on High-Traffic Tables
`artist_location_tracks` and `chat_messages` will be the two highest-insert tables.
RLS on these must be benchmarked early. A location batch insert hitting 80 artists
every 30 seconds is 160 rows/minute. At scale with complex RLS policies, this can
degrade. Use partial indexes on `user_id` and `captured_at` from migration day one.

---

### Chat Message Search
Full-text search across chat history is expected by users familiar with Slack or
WhatsApp. Supabase supports `pg_trgm` full-text search on Postgres.
Plan a `search_vector` generated column on `chat_messages.content` and expose a
`GET /api/mobile/chat/search?q=` endpoint. This is easy to add in schema design
but painful to retrofit later.

---

### Rate Limiting Strategy for Mobile APIs
The plan mentions rate limits but does not specify them. Suggested defaults:
- Timesheet write: 30 per hour per user (prevents accidental spam)
- Chat message send: 60 per minute per user
- Location batch upload: 120 per hour per user
- Notification register token: 10 per day per user
Use Upstash Redis or Supabase Edge Functions with in-memory counters.

---

## Phases: Reordering for Maximum Early Value

The current phase order risks building chat before artists are even using the app.

**Suggested revised order**:

```text
Phase 0 (1 week)  — Foundation infra: schema migrations, RLS, env, CI/CD.
Phase 1 (2 weeks) — Mobile Home + Timesheet + Leave + PWA install.
                    Artists can log time. Value delivered immediately.
Phase 2 (2 weeks) — Notifications + Admin approval center (basic UI).
                    Supervisors can approve. Loop is closed.
Phase 3 (3 weeks) — Chat (text first, then media, then audio).
                    Team communication unlocked.
Phase 4 (2 weeks) — GPS tracking + admin live map.
                    Location intelligence added.
Phase 5 (2 weeks) — Tools, reminders, focus timer, shot status update.
                    Quality of life for artists.
Phase 6 (2 weeks) — Admin control center polish, reporting, compliance exports.
Phase 7 (1 week)  — Hardening, load testing, rollout playbook.
```

This order ships usable value to artists in week 3 and to supervisors in week 5.
The current plan ships usable value only after Phase 2 (6+ weeks).

---

## One Big Idea Worth Adding

### Artist Workload Intelligence (AI-Light)
Not machine learning. Simple rule-based engine that runs on the server nightly:

1. For each artist: compare assigned task hours vs available hours this week.
2. Flag artists who are overbooked (>110% capacity) or underbooked (<50%).
3. For each critical shot: flag if assigned artist has a leave conflict this week.
4. Surface these flags on the admin operations dashboard as "action items" not raw data.

Example: "3 artists are overbooked this week. SH_312 is at risk — lead compositor
is on leave Thursday-Friday and the shot is due Friday 6pm."

This is not ML. It is a nightly Supabase scheduled function + a smart display.
It makes the admin feel like the system is thinking for them. This is the feature
that separates a good artist management tool from a great one.

---

## Design Token Suggestion (Apple Glassy Reference)

```text
Background base:       #0A0A0F  (near-black, warm-dark)
Surface / Card:        rgba(255,255,255,0.06) + blur(20px) + border rgba(255,255,255,0.12)
Text primary:          #FFFFFF
Text secondary:        rgba(255,255,255,0.55)
Accent (active/CTA):   #3B82F6  (blue, iOS-like)
Danger:                #EF4444
Warning:               #F59E0B
Success:               #10B981
Radius (cards):        16px
Radius (buttons):      12px
Radius (chips):        999px (pill)
Spacing unit:          4px base, 8/12/16/24/32/48 scale
Font:                  SF Pro (system) on iOS, Inter on Android/web
Tab bar:               frosted glass, 44px item hit area
```

---

## Summary of Top 10 Actionable Suggestions

1. Plan a thin native wrapper (Expo) as Phase 2 upgrade path for iOS GPS + push parity.
2. Use adaptive GPS throttling (speed + shift state) to protect battery and trust.
3. Build admin approval APIs in Phase 1 even if admin UI comes in Phase 4.
4. Design the full timesheet correction lifecycle with audit trail from day one.
5. Add offline queue for timesheet writes using IndexedDB + service worker sync.
6. Add shot-linked quick notes, team leave calendar, and announcement board.
7. Collapse bottom nav to 4 tabs and make the active timer a persistent floating pill.
8. Use wheel/drum picker for hour input instead of text fields.
9. Design the onboarding flow before any other screen — it determines permission grants.
10. Add workload intelligence (nightly rule engine) to give admin proactive action items.

---

---

## Update: Revised GPS Policy (Stationary vs Moving)

Previous plan said "always-on continuous tracking." That is too aggressive and
burns battery for no operational value when an artist is sitting at their desk.

**Revised GPS Strategy:**

```text
Artist is MOVING  (speed > 1.5 km/h):   Poll every 10-30 seconds. High accuracy mode.
Artist is STATIONARY (speed < 1.5 km/h): Poll every 30 minutes. Low power mode.
Shift ended / timer stopped:             Heartbeat only. Once per hour.
App fully closed on Chrome:              Rely on last known position + session close event.
```

**How to detect stationary vs moving on Chrome PWA:**
- Use `navigator.geolocation.watchPosition()` with `maximumAge` and `timeout` tuned
  per mode.
- Compare successive coordinates. If distance < 50m over 2 readings, switch to
  low-frequency mode.
- Use `DeviceMotionEvent` (accelerometer) as a secondary signal to detect movement
  without burning GPS unnecessarily.
- Store last known position locally so cold app open shows last location instantly.

**Chrome browser focus (not iOS Safari):**
- Target platform is Chrome on Android. This is the right call.
- Chrome PWA supports Background Sync API, Web Push, Geolocation, MediaRecorder (Opus/WebM).
- All GPS and audio features work reliably on Android Chrome PWA — no native wrapper needed for Android.
- iOS users: recommend Chrome on iOS over Safari, or accept reduced background capability.
- Document the Chrome requirement clearly in onboarding ("For best experience, use Chrome").

**DB table addition for motion state:**
- Add `motion_state` field to `artist_location_tracks`: `moving | stationary | unknown`.
- Add `poll_interval_seconds` to `location_sessions` for audit of what policy was active.

---

## Update: Remote Mic Monitoring (Ambient Listen Mode)

**What was requested:** Admin can listen to the mic of a specific artist's device
when that artist has the app open.

**Honest technical and legal assessment — must be read before implementing:**

This feature is technically possible via WebRTC peer connection:
- Artist app opens a dormant WebRTC `RTCPeerConnection` channel when they open the app.
- Admin initiates a `getDisplayMedia` or `getUserMedia` request through signaling.
- Audio stream is relayed to admin in real-time.

**However — this is surveillance and carries serious legal exposure:**

```text
GDPR (EU)            : Requires explicit informed consent for audio monitoring.
                       Silent activation is illegal regardless of employment contract.
CCPA (California)    : Same.
India IT Act         : Unauthorised interception is a criminal offence.
Employment Law       : Most jurisdictions require written consent for workplace monitoring.
App Store / Play Store: Both platforms reject apps with undisclosed audio capture.
Chrome PWA           : getUserMedia() always shows a visible mic indicator in the browser.
                       There is NO silent mic access in Chrome. The tab will show
                       a red recording indicator. User will see it.
```

**The Chrome platform itself prevents silent activation.**
Any Chrome PWA using `getUserMedia({audio: true})` shows a persistent red dot in the
browser tab and address bar. Artists will see it immediately. There is no way around this.

**Safe and legal implementation path — what you CAN do:**

1. **Consent-based ambient check-in** (recommended):
   - Artist can optionally start a live audio "standup" session from their app.
   - Admin can join that session to listen/speak. Artist knows it is happening.
   - This is essentially a lightweight in-app voice call with explicit start/end.
   - Full audit log: who started, who joined, duration, timestamp.

2. **Scheduled audio standup rooms** (team-level, not surveillance):
   - Admin schedules a standup channel at a specific time.
   - Artists get a push notification to join.
   - Audio is recorded with consent, stored in S3, accessible to authorized roles.

3. **Panic/help button** (artist-initiated):
   - Artist can press a distress signal that opens a one-way audio stream to admin.
   - Artist initiates it. Never admin-initiated without artist knowledge.

**Architecture for consent-based audio relay:**
- Use Supabase Realtime for WebRTC signaling (offer/answer/ICE candidates).
- Add a `live_audio_sessions` table: room_id, participants, consent_acknowledged_at, started_at, ended_at.
- TURN server needed for NAT traversal: use Cloudflare Calls or Twilio TURN.
- Store recording in S3 with `audio_session_recordings` metadata table.

**Decision required from studio management:**
Do not implement silent mic access. It will expose the studio to criminal liability
and destroy artist trust. Implement consent-based audio sessions only.

---

## Update: Artist Productivity Intelligence (Bid vs Actual Analysis)

This is one of the most valuable features for both artists and studio management.
The plan listed it as a sentence. It deserves full specification.

**Concept:**
Every task in VFX has a `bid_hours` (the estimated time the task should take).
When an artist logs time via timesheet, they accumulate `actual_hours` against that task.
Comparing bid vs actual gives a productivity signal.

**Metrics to compute per artist per task:**

```text
Efficiency Ratio    = bid_hours / actual_hours
                      > 1.0 means faster than bid (efficient)
                      < 1.0 means slower than bid (over-running)
                      = 1.0 means exactly on bid

Velocity Score      = weighted average efficiency across last 30 days of tasks
Deadline Hit Rate   = % of tasks submitted before or on due date in last 30 days
Consistency Index   = standard deviation of efficiency ratios (low = consistent)
```

**Artist-facing productivity screen (mobile):**

```text
+--------------------------------------------------+
| <- My Productivity                    [History] |
+--------------------------------------------------+
| VELOCITY THIS MONTH                               |
| ████████████░░  82%  Slightly under bid          |
| Trend: +4% vs last month                         |
+--------------------------------------------------+
| DEADLINE HIT RATE                                 |
| ████████████████  94%  Excellent                 |
+--------------------------------------------------+
| THIS WEEK TASKS                                   |
| SH_120 Comp   Bid: 8h  Actual: 6.5h  [+]18%     |
| SH_095 Prep   Bid: 4h  Actual: 5.2h  [-]30%     |
+--------------------------------------------------+
| MOTIVATIONAL INSIGHT                              |
| "You completed 3 tasks ahead of schedule         |
|  this week. Strong comp work on Dragon_EP03."    |
+--------------------------------------------------+
```

**Admin-facing productivity view (control center):**

```text
+----------------------------------------------------------+
| TEAM PRODUCTIVITY — Week 9                                |
| Sort by: [Velocity] [Deadline Rate] [Consistency]        |
+----------------------------------------------------------+
| Artist          Velocity  Deadline%  Trend   Risk        |
| Ahmad Karimi    112%      98%        (+5%)   LOW         |
| Priya Sharma    78%       84%        (-8%)   MEDIUM      |
| Lee Jin         55%       62%        (-15%)  HIGH        |
+----------------------------------------------------------+
| [Flag for 1:1] [Reassign Task] [Send Motivation]        |
+----------------------------------------------------------+
```

**DB additions needed:**

- `tasks` table: add `bid_hours` column (may already exist in ctrack_v0).
- `productivity_snapshots` table: user_id, period_start, period_end, velocity_score,
  deadline_hit_rate, consistency_index, computed_at.
- Run nightly Supabase scheduled function (pg_cron) to recompute snapshots.

**Privacy rules:**
- Artists see only their own productivity data.
- Supervisors see their team's data.
- Admin sees studio-wide data.
- Historical snapshots retained for 12 months then anonymized.

---

## Update: Daily Motivational Messages to Artists

This is a lightweight but high-impact feature. Artists in VFX work under enormous
deadline pressure. A thoughtful daily message from the system (or their lead) changes
the emotional tone of opening the app.

**Two layers:**

### Layer 1: System-generated contextual message
Run at shift start time (or first app open of the day):

```text
Logic:
  - If artist completed all tasks yesterday:     → Achievement message
  - If artist has a task overdue:                → Supportive + action nudge message
  - If artist is ahead of bid this week:         → Reinforce with specific praise
  - If Monday morning:                           → Week kick-off energy message
  - If Friday afternoon:                         → Wrap-up + recognition message
  - Otherwise:                                   → Rotating curated VFX industry quotes
```

Message is short — max 2 lines. Displayed as a warm card at top of Home screen.
Dismissable. Never blocking.

### Layer 2: Lead/Supervisor broadcast motivation
Admin can compose a message (text, 160 chars) and send to:
- Specific project team.
- Entire studio.
- Individual artist (1:1 encouragement).

Appears as a distinctive card, visually different from system-generated messages.
Shows sender name. Artists can react with a single emoji (acknowledgement without
opening chat).

**DB addition:**
- `daily_motivations` table: id, target_type (system/lead/admin), target_id,
  message, sent_at, context_trigger (optional), reactions JSONB.

**Push delivery:** Morning push at configurable studio-wide time (e.g., 09:00).
Artist can opt out of motivational messages in notification preferences.

---

## Update: Productivity Meter — Visual Deadlines Intelligence

A visual, always-visible indicator of how the artist is tracking against their
current workload. Not a number. A feeling. Like a fuel gauge.

**Mobile home screen placement:**
Small pill indicator below the KPI strip. Always visible. Tappable for detail.

```text
+-----------------------------------------+
|  Productivity  [=========>   ] 72%  OK  |
+-----------------------------------------+
```

Color coding (subtle, not alarming):
- 90-100%: calm green tint. "On track."
- 70-89%: neutral amber. "Watchable."
- 50-69%: warm orange. "Review load."
- Below 50%: soft red. "Talk to your lead."

**Computation:**
```text
Productivity Meter Score =
  (0.4 × Velocity Score this week)
  + (0.4 × Deadline Hit Rate this month)
  + (0.2 × Checklist Completion Rate today)
```

This is a composite score, not just one metric. Harder to game. More honest signal.

**Admin view:** Show every artist as a colored dot on the roster grid.
At a glance the supervisor sees who is thriving and who needs support.
Not surveillance — it is a welfare and workload tool.

---

## Revised Summary of Top Suggestions (Updated)

1. GPS: stationary = 30 min poll, moving = continuous. Chrome Android is primary target.
2. No silent mic access — Chrome physically prevents it and it is legally toxic.
   Implement consent-based audio sessions (standup rooms, artist-initiated streams).
3. Build admin approval APIs in Phase 1 even if admin UI comes in Phase 4.
4. Full timesheet correction lifecycle with audit trail from day one.
5. Offline queue for timesheet writes using IndexedDB + service worker sync.
6. Bid vs actual productivity intelligence: velocity score, deadline hit rate, consistency index.
7. Daily contextual motivation card on home screen (system-generated + lead-sent).
8. Productivity meter as a persistent visual indicator (composite score, color coded).
9. Artist productivity history and team productivity view in admin control center.
10. Collapse bottom nav to 4 tabs. Active timer as persistent floating pill.
11. Wheel/drum picker for timesheet hour input.
12. Onboarding flow with permission context before any other screen.
13. Shot-linked quick notes, team leave calendar, announcement board.
14. Workload intelligence nightly engine (overbooking + delivery risk flags for admin).

---

> This document is a living critique. Update it as implementation reveals new constraints.
> The goal is not perfection on paper — it is the best possible tool in the hands of VFX artists.
