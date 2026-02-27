# CTrack Mobile PRD

## Product Vision
Build a world-class VFX artist management app that feels native on mobile, works as an installable PWA, and gives studio leadership full operational control from desktop.

## Users
- Artist
- Team Lead
- Production Manager
- Admin

## Core Problems
- Daily time logging is slow and error-prone
- Team communication is fragmented
- Leave and approvals are delayed
- Task risk is detected too late
- Managers lack real-time visibility

## Goals
- Daily artist input under 60 seconds
- Single stack with `ctrack_v0` database/auth (Supabase + S3)
- Native-like notifications and install experience
- Offline-resilient timesheet flow
- Clear productivity insights (bid vs actual)

## Non-Goals
- Silent microphone surveillance
- Separate backend or auth system
- Heavy ML-first roadmap in v1

## Functional Requirements

### App Branding, Splash, and Login
- Animated logo splash screen on app open
- Reuse `ctrack_v0` spinner style for loading states (brand-consistent "CTrack" animation feel)
- Login screen with polished glass UI, fast auth feedback, and inline loading animation
- Pre-auth loading state must show branded spinner (not plain system loader)
- Post-login transition animation to Home/Work dashboard
- Failure states: invalid login, network timeout, auth retry guidance

### Timesheet
- Log hours by Project -> Shot -> Task
- Draft/save/submit flow
- Correction lifecycle with audit history
- One-tap smart defaults (last task, copy yesterday)
- Offline queue + auto-sync when online

### Leave
- Apply leave from mobile
- Track status and comments
- Team leave calendar view
- Admin approve/reject with audit trail

### Expense Refund
- Artist submits expense claim from mobile
- Fields: date, category, amount, currency, project/shot (optional), notes
- Receipt upload (image/pdf) to S3 via presigned URL
- Claim states: Draft -> Submitted -> Under Review -> Approved -> Rejected -> Paid
- Admin/Finance approve or reject with comments
- Payout tracking with reference ID and paid date
- Artist can see claim history and status timeline

### Chat
- 1:1 + group/project/team rooms
- Text, image, and audio messages
- Realtime updates, read state, typing state
- S3 media storage with presigned upload
- Search + pagination + moderation controls

### Notifications
- Channels: chat, task, leave, reminders, admin broadcast, motivation
- Push + in-app inbox + deep links + badge counts
- Quiet hours, digest, per-channel preferences

### GPS Tracking
- Consent-based tracking
- Adaptive policy:
  - Moving: 10-30s updates
  - Stationary: 30 min updates
  - Shift ended: heartbeat
- Admin live map + route replay + geofence alerts

### Productivity & Motivation
- Productivity meter (velocity + deadline + checklist composite)
- Bid vs actual analysis per task/artist
- Daily motivational messages (system + lead/admin)
- Suggestion insights for deadline risk and workload balance

## UX & Design Principles
- Apple-like, premium, minimal, glassy style
- One primary action per screen
- Progressive disclosure for advanced controls
- 44px+ touch targets and accessibility-first components
- Persistent active timer pill across app

## Mobile Adaptive Design Requirements
- Support widths from compact phones to large phones/tablets without layout break
- Respect safe areas for notch, status bar, home indicator, and dynamic island
- Use responsive spacing and typography scale instead of fixed pixel values
- Keep primary actions within thumb reach on one-hand usage zones
- Preserve readability at large accessibility text sizes
- Ensure chat composer, timer pill, and bottom nav never overlap keyboard/content

### Adaptive Breakpoints (logical)
- Compact: up to 360dp
- Standard: 361dp to 430dp
- Large: 431dp to 768dp
- Tablet: above 768dp

### Adaptive Layout Rules
- Compact: single-column, reduced side padding, condensed metadata
- Standard/Large: single-column with richer cards and secondary metadata visible
- Tablet: two-pane where useful (chat list + room, task list + detail)
- Orientation:
  - Portrait first for all mobile workflows
  - Landscape supported for chat, dashboard, and admin quick-monitor views

## Navigation
- Home
- Work (timesheet + tasks)
- Chat
- Me (profile/settings/tools/leave)

## Acceptance Criteria
- App launch shows branded logo animation and spinner-consistent loading
- Login is smooth, animated, and handles error/retry cleanly
- Artists can submit daily timesheet with validations
- Leave workflow works end-to-end mobile + admin
- Expense refund workflow works end-to-end with receipt and payout status
- Realtime chat supports text/image/audio reliably
- GPS works with adaptive policy and consent controls
- App is installable; install prompt hides after completion
- Notifications behave like a native app
- Admin control center can approve, monitor, and report

## KPIs
- Avg daily log completion time < 60 sec
- Timesheet completion rate > 95%
- Expense claim processing SLA < 3 business days
- Notification delivery > 98%
- Chat p95 send-to-receive < 500ms
- Offline sync success = 100% (queued writes)

## Release Scope
1. Foundation: schema/RLS/API contracts/PWA baseline
2. Core: timesheet + leave + approvals + offline
3. Collaboration: chat + media + notifications
4. Intelligence: GPS + productivity + motivation
5. Hardening: security/perf/testing/rollout

## Compliance & Security
- Strict Supabase RLS policies
- Signed media URLs with TTL
- Privacy consent + retention controls
- No silent audio capture

