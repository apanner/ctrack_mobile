# CTrack Mobile Development Plan

**App root:** `d:/dev/track/ctrack_mobile`

## Execution Timeline

### Phase 0 - Foundation (Week 1)
- Finalize schema migrations + RLS
- Remove Firebase remnants
- Add required Expo dependencies
- Create versioned mobile API surface (`/api/v1/mobile/*`)

### Phase 1 - Core Flows (Weeks 2-3)
- Build Home + Work core experiences
- Implement animated logo splash + branded login loading states
- Timesheet draft/submit/correction lifecycle
- Leave apply/status flows
- Expense claim draft/submit with receipt upload
- PWA install UX and onboarding
- Basic admin approval APIs

### Phase 2 - Notifications + Approvals (Weeks 4-5)
- Push token registration
- In-app notification inbox
- Deep links and badge sync
- Admin approval UI baseline
- Expense review UI (approve/reject/mark paid)

### Phase 3 - Chat (Weeks 6-8)
- Realtime text chat
- S3 image/audio attachments
- Retry/pagination/search/moderation basics

### Phase 4 - GPS Intelligence (Weeks 9-10)
- Consent flow + adaptive tracking policy
- Location batch upload and reliability
- Admin map + route replay + geofence alerts

### Phase 5 - Productivity Tools (Weeks 11-12)
- Focus timer and smart reminders
- Productivity meter and bid-vs-actual insights
- Daily motivation pipeline

### Phase 6 - Admin Excellence (Weeks 13-14)
- Workforce command center modules
- Reporting + anomaly dashboards
- Compliance exports

### Phase 7 - Hardening + Launch (Week 15)
- Load/security/performance testing
- QA matrix completion
- Pilot rollout then full rollout

## Sprint Backlog Themes
- Schema/RLS/perf indexes first
- API contracts before UI
- Offline-first from early sprints
- Chat media reliability before chat polish
- Admin approvals early, admin polish later
- Adaptive design validation in every sprint (not only at QA end)
- Brand-consistent motion system (logo + spinner + auth transitions) from Sprint 1

## Adaptive Design Delivery Plan

### Sprint-Level Tasks
- Define responsive tokens (spacing, radius, type scale) for compact/standard/large/tablet
- Implement `useAdaptiveLayout` hook and shared adaptive utilities
- Refactor core screens (`Home`, `Work`, `Chat`, `Me`) to responsive containers
- Add keyboard-safe chat composer and input bars on all breakpoints
- Add tablet-ready two-pane layouts for chat and task detail screens

### Device Coverage Matrix
- Compact Android (360x640 class)
- Standard Android (390x844 class)
- Large phone (430x932 class)
- Tablet portrait/landscape (768+ class)

### Acceptance for Adaptive Design
- No clipped text or overlapping buttons at any supported size class
- No hidden CTA under keyboard or safe area
- Navigation and timer pill remain reachable and visible
- Large text accessibility mode remains usable without horizontal scroll

## Dependencies
- `ctrack_v0` auth roles and permission model
- Supabase migrations and policies
- S3 bucket/presigned URL service
- Notification provider configuration
- Finance approval policy (allowed categories, limits, SLA)

## Team Roles
- Product/Design
- Mobile Engineer
- Backend Engineer
- Admin Web Engineer
- QA Engineer
- DevOps/Release support

## Definition of Done
- Acceptance criteria passed
- Tests added/updated
- No blocker lint/runtime issues
- Security checks for role-gated endpoints
- UX and accessibility reviewed
- Expense flow includes auditable status transitions and payout reference
- Splash/login include branded animation and spinner parity with `ctrack_v0` style

## Testing Strategy
- Unit: core domain logic + hooks
- Integration: API/service and sync flows
- E2E: login -> timesheet -> leave -> expense submit -> admin review -> payout -> notification paths
- Performance: list rendering, chat latency, API p95, offline recovery
- UX motion checks: splash duration, login transition smoothness, spinner visibility on low network

## Risk Mitigation
- iOS PWA limitations: document and provide fallback behavior
- Battery drain: enforce adaptive GPS policy
- Chat scale: paginate + compress + strict media limits
- Data conflicts: deterministic sync rules and audit logs

## Launch Checklist
- Production env validated
- Migrations applied successfully
- Error monitoring enabled
- Pilot cohort onboarded
- Rollback and incident runbook ready

