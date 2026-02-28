# CTrack Mobile — Design H Update & Feature Plan

## 1. Design H (Neon Prism) — Visual Overhaul

**Colors** (from design-h.html):
- `--bg:#08080C`, `--s1:#101016`, `--s2:#18181F`, `--bdr:rgba(255,255,255,.06)`
- `--w:#F0F0F2`, `--w2:#8888A0`, `--w3:#50506A`
- Accents: `--pink:#F472B6`, `--violet:#A78BFA`, `--blue:#60A5FA`, `--cyan:#22D3EE`, `--green:#34D399`, `--amber:#FBBF24`, `--red:#FB7185`
- Primary gradient: `linear-gradient(135deg, pink, violet)`
- Mesh: `linear-gradient(135deg, rgba(244,114,182,.15), rgba(167,139,250,.1), rgba(34,211,238,.08))`

**Components to update:**
- `constants/colors.ts` — full Neon Prism palette
- `constants/ui-tokens.ts` — radius 18/26, spacing
- `GlassCard` — gradient top highlight, mesh background
- Tab bar — glass dock with violet/pink accent line
- Timer card — mesh gradient, glow, pulse
- KPI pills — colored bottom accents (cyan, pink, green)
- Shot cards — colored left border
- Quick action chips — colored bottom accent
- Buttons — gradient primary, glass secondary

---

## 2. Notification Sounds & Settings

**Settings screen additions:**
- Notification sounds: Default, Chime, Gentle, None
- Per-channel: Chat, Tasks, Leave, Timesheet reminder (toggle + sound)
- Quiet hours (start/end)
- Vibrate on/off

**Implementation:**
- `app/settings/` — Settings screen (or extend Profile)
- `lib/notification-sounds.ts` — play sound on notification
- Store preferences via existing API or `user_notification_preferences`
- Bundled sound files: `assets/sounds/` (chime.mp3, gentle.mp3)
- Expo `Audio.Sound` for in-app playback; Web: `new Audio(url).play()`

---

## 3. PWA (Installable Web App)

**Manifest:**
- `short_name`: CTrack, `name`: CTrack Artist Manager
- `theme_color`: #F472B6, `background_color`: #08080C
- Icons: 192x192, 512x512 (from `assets/icon.png`)
- `display: standalone`
- `start_url` (Expo default)

**App icon:** Strong, professional icon at `assets/icon.png`:
- Bold white "C" on dark (#08080C) background
- Gradient ring (pink → violet → cyan) aligned with Design H
- Used for: icon, adaptive-icon (Android), favicon (web), PWA home screen

**Install flow:**
- `PwaInstallBanner` in Me tab — detects `beforeinstallprompt`, shows "Add to Home Screen"
- Settings → PWA Install — full screen with iOS Safari instructions (Share → Add to Home Screen)
- Dismiss/installed state stored in AsyncStorage

**iOS Safari:** Manual install via Share → "Add to Home Screen" (no programmatic prompt).

---

## 4. Chat: Sounds, Emoji & GIF Packs

**Sounds:**
- In-chat: send sound, receive sound (user-selectable)
- `assets/sounds/chat-send.mp3`, `chat-receive.mp3`
- Settings: pick from 3–4 presets or none

**Emoji picker:**
- Use `emoji-picker-react` (web) or `@emoji-mart/react-native-picker` (native)
- Or simple inline emoji grid component
- Store last-used in AsyncStorage

**GIF packs:**
- Integrate GIPHY API (or Tenor) with API key in env
- `lib/api/giphy.ts` — search GIFs, trending
- Chat composer: [+] → Emoji | GIF | Image | Audio
- GIF picker modal with search + categories

---

## 5. AI Features — Integration Possibilities

**Phase 1 (Low effort):**
- **Smart time suggestions:** "Copy yesterday" — one-tap copy previous day entries
- **Task summarization:** Show "You logged 4.5h on SH_220 this week" on shot detail
- **Chat quick replies:** Suggest common replies ("On it", "Done", "ETA 30min") — rule-based

**Phase 2 (Medium — API integration):**
- **Timesheet autofill:** LLM suggests project/shot/task from notes ("worked on debris pass")
- **Leave impact preview:** "3 artists on leave that day" before submit
- **Chat summarization:** Thread summary for long chats
- **Notification triage:** Priority scoring (urgent vs low)

**Phase 3 (Higher effort):**
- **Voice-to-timesheet:** Speech → "2h SH_220 Compositing" → create log
- **Natural language queries:** "How much did I log last week?"
- **Anomaly detection:** "Unusual hours — double-check?"

**Implementation notes:**
- Use OpenAI/Anthropic API from backend (ctrack_v0) — never expose keys in mobile
- New endpoints: `POST /api/v1/mobile/ai/suggest-timesheet`, `POST /api/v1/mobile/ai/chat-summary`
- Graceful fallback when AI unavailable

---

## 6. Timesheet Enhancements

### 6.1 Project + Shot Dropdown

- **Project:** Dropdown (or improved picker) — required for billable
- **Shot:** Dropdown populated by selected project (shots for that project)
- If no project: "General / Non-billable" option
- Order: Projects by name, Shots by shot_code

### 6.2 Entry Type: Training, Power Outage, Downtime

**Schema addition:**
```sql
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS entry_type TEXT
  CHECK (entry_type IN ('work', 'training', 'downtime', 'power_outage')) DEFAULT 'work';
```

**UI:**
- Entry type selector: Work | Training | Downtime | Power outage
- When Training: project/shot optional, notes encouraged
- When Downtime/Power outage: no project/shot, system-level

### 6.3 Weekly Submit + Lock

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS timesheet_week_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  week_start_date DATE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);
```

**Logic:**
- Week = Mon–Sun (ISO week start)
- User enters time all week; can edit until "Submit Week"
- On submit: insert into `timesheet_week_submissions`, mark week as locked
- API: `GET /api/v1/mobile/timesheets/week-status?weekStart=2026-02-24` → `{ submitted: boolean, submittedAt?: string }`
- API: `POST /api/v1/mobile/timesheets/submit-week` body: `{ weekStartDate }`
- On create/update/delete time_log: reject if week already submitted (by work_date)
- UI: Show "Week submitted ✓" badge, disable edit for that week
- Weekly report: Summary of submitted week (total hours, by project, by entry type)

### 6.4 Weekly Report

- Screen: "Week of 24 Feb 2026" — total hours, breakdown by project, by type (work/training/downtime)
- Only for submitted weeks
- Export: simple text/csv or share

---

## 7. Execution Order

1. **Design H** — colors, tokens, polish (foundation)
2. **Timesheet** — project/shot dropdown, entry types, weekly submit (backend + UI)
3. **Settings** — notification sounds, preferences
4. **PWA** — manifest, install CTA
5. **Chat** — emoji, GIF, sounds
6. **AI** — Phase 1 quick wins (copy yesterday, etc.)

---

## 8. File Structure

```
ctrack_mobile/
├── app/
│   ├── settings/
│   │   ├── index.tsx          # Settings home
│   │   ├── notifications.tsx  # Notification + sounds
│   │   └── chat.tsx           # Chat sounds, emoji, GIF packs
│   └── (tabs)/
│       └── work.tsx           # Updated timesheet
├── assets/
│   └── sounds/
│       ├── chime.mp3
│       ├── gentle.mp3
│       ├── chat-send.mp3
│       └── chat-receive.mp3
├── components/
│   ├── GlassCard.tsx          # Design H style
│   ├── TabBar.tsx             # Design H dock
│   └── chat/
│       ├── EmojiPicker.tsx
│       └── GifPicker.tsx
├── constants/
│   ├── colors.ts              # Neon Prism
│   └── ui-tokens.ts
└── lib/
    ├── api/
    │   ├── timesheets.ts      # submit-week, week-status
    │   └── giphy.ts
    ├── notification-sounds.ts
    └── weekly-timesheet.ts    # week logic, lock check
```

---

## 9. Backend (ctrack_v0) Additions

**Migrations:**
- `time_logs.entry_type` (work, training, downtime, power_outage)
- `timesheet_week_submissions` table
- `user_notification_preferences` (if not exists): sound_id, quiet_hours_start, quiet_hours_end

**API:**
- `GET/POST /api/v1/mobile/timesheets/week-status`
- `POST /api/v1/mobile/timesheets/submit-week`
- `GET /api/v1/mobile/timesheets/weekly-report?weekStart=...`
- Timesheet create/update: check week lock before allowing
