# CTrack Mobile — Production Pending

What remains to make the app production-ready.

---

## ✅ Done (Implemented)

| Area | Status |
|------|--------|
| Design H (Neon Prism) | Done — colors, components, tab bar |
| Auth & onboarding | Done — sign-in, redirect, profile check |
| Home / Dashboard | Done — KPI, timer, today tasks, quick actions |
| Timesheet | Done — project/shot dropdown, entry types, weekly submit + lock, copy yesterday |
| Chat | Done — room list, messages, real-time, image upload, emoji/GIF picker, sounds |
| Leave | Done — `app/leaves/index.tsx` |
| Expenses | Done — `app/expenses/index.tsx`, `app/expenses/new.tsx` |
| Profile / Me | Done — settings link, PWA banner |
| Settings | Done — notifications, chat, PWA install, about |
| Notifications | Done — inbox, preferences API, register-token, in-app sounds |
| Location tracking | Done — consent, batch upload, `lib/location-tracking.ts` |
| PWA | Done — manifest, icons, install banner, iOS instructions |
| Shot detail | Done — `app/shot/[id].tsx` |
| Focus timer | Done — `app/focus-timer.tsx` |
| Reminders | Done — `app/reminders/index.tsx` |
| Offline queue | Done — `lib/offline-queue.ts` (if wired) |

---

## ⏳ Pending — High Priority (Must-Have for Launch)

### 1. Database migrations

- [ ] **Manual**: Run `npx supabase db push` in ctrack_v0 (requires DB password)
  - Apply `082_timesheet_entry_type_and_week_submissions.sql`
  - Password: Supabase Dashboard → Settings → Database
- [ ] Confirm `entry_type` and `timesheet_week_submissions` exist

### 2. Tasks tab

- [x] **Done** — Dedicated Tasks tab with Overdue/Assigned/Completed lanes
- [x] Home quick action "Tasks" navigates to Tasks tab

### 3. Leave — create new

- [x] **Done** — `app/leaves/new.tsx` with start/end/reason, "Apply Leave" in index

### 4. Error boundary + error handling

- [x] **Done** — ErrorBoundary wraps app, "Try again" button
- [ ] QA: force throw → error UI shows correctly

### 5. Offline behavior

- [x] **Done** — OfflineBanner, OfflineFlushListener, queue flush on reconnect
- [x] **Done** — Timesheet create + copy wired to offline queue; queue merge in UI; OnlineManager + networkMode offlineFirst
- [ ] QA: test graceful handling of network errors (add entry offline → go online → verify sync)

### 6. Production config

- [x] **Done** — `lib/env-validation.ts` warns on localhost in production
- [ ] `EXPO_PUBLIC_API_URL` → production backend (not localhost)
- [ ] `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` for production

### 7. Web push notifications (PWA)

- [ ] Configure VAPID keys for web push
- [ ] Service worker: handle push events, show notification, open correct screen
- [ ] Test on Android Chrome PWA
- [ ] iOS: document limited push support for PWA

---

## ⏳ Pending — Medium Priority (Post-Launch OK)

### 8. Chat enhancements

- [ ] Audio/voice messages ( recording + S3 upload + message reference )
- [ ] GIF: set `EXPO_PUBLIC_GIPHY_API_KEY` if using Giphy
- [ ] Typing indicators
- [ ] Read receipts (optional)

### 9. Notification preferences sync

- [x] **Done** — Settings screen syncs channels + quiet hours to `/api/v1/mobile/notifications/preferences`; AsyncStorage fallback for offline; notification sound stays local

### 10. Location — background tracking

- [ ] Background GPS updates (Expo TaskManager or native)
- [ ] Battery-aware throttling
- [ ] Admin live map (ctrack_v0) for location monitoring

### 11. Admin control center (ctrack_v0)

- [ ] Time & Leave approvals
- [ ] Chat moderation
- [ ] GPS monitor / live map
- [ ] Reporting (utilization, overtime)

---

## ⏳ Pending — Lower Priority (Nice-to-Have)

### 12. AI Phase 1 quick wins

- [ ] Task summary on shot: “You logged X.Xh on SH_XXX this week”
- [ ] Chat quick replies: “On it”, “Done”, “ETA 30min”

### 13. Tools & reminders

- [ ] Shift start reminder
- [ ] Timesheet incomplete reminder (e.g. 6:30pm)
- [ ] Break and overtime wellness reminders
- [ ] Wire `app/reminders` to backend reminder logic (currently TODO in API)

### 14. Tomorrow preview

- [ ] Show tomorrow tasks on Home
- [ ] Conflict hints when leave overlaps critical tasks

### 15. Performance & polish

- [ ] Load within ~3s on 4G
- [ ] Smooth list scrolling
- [ ] No memory leaks after navigation cycles
- [ ] Security review (RLS, rate limits, secrets)

---

## QA Checklist

See `QA_CHECKLIST.md` for full manual QA steps:
- Auth, Dashboard, Timesheet, Leave, Expenses, Chat
- Offline, Error boundary, Env validation
- Android Chrome, iOS Safari

---

## Suggested Order

1. Apply migrations (`082` and any others).
2. Verify Leave create flow.
3. Add ErrorBoundary.
4. Wire offline queue and indicator.
5. Set production env vars.
6. Run full QA checklist.
7. Configure web push (optional for launch).
8. Tasks tab UX (if not covered by Work tab).
