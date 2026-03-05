# Ctrack - Project UI Info

## Product Overview

**Ctrack** is a continuous workforce accountability and production monitoring system for VFX studios. It operates on a **no start/stop model** — monitoring is automatic based on daily work expectations, task interaction, timesheet enforcement, location validation, and activity signals.

---

## App Configuration

- **Name:** Ctrack Workforce Monitoring
- **Slug:** ctrack-workforce-monitoring
- **Expo SDK:** 54
- **Orientation:** Portrait
- **New Architecture:** Enabled
- **Typed Routes:** Enabled
- **iOS Bundle ID:** app.rork.ctrack-workforce-monitoring
- **Android Package:** app.rork.ctrack_workforce_monitoring

---

## Tech Stack

- **Framework:** React Native (Expo Router, file-based routing)
- **Language:** TypeScript
- **State Management:** @nkzw/create-context-hook + @tanstack/react-query + AsyncStorage
- **Styling:** React Native StyleSheet
- **Icons:** lucide-react-native
- **Images:** expo-image
- **Animations:** React Native Animated API
- **SVG:** react-native-svg
- **Haptics:** expo-haptics
- **Gradients:** expo-linear-gradient
- **Gestures:** react-native-gesture-handler
- **Package Manager:** bun

---

## Color Theme (Dark Mode)

All colors defined in `constants/colors.ts`:

| Token             | Value     | Usage                          |
|-------------------|-----------|--------------------------------|
| background        | #0D0F12   | Main background                |
| surface           | #161920   | Card/container backgrounds     |
| surfaceLight      | #1E222B   | Elevated surfaces              |
| surfaceAccent     | #252A35   | Accent surfaces, bar tracks    |
| border            | #2A2F3A   | Card borders                   |
| borderLight       | #353B48   | Lighter borders                |
| text              | #F0F2F5   | Primary text                   |
| textSecondary     | #8B92A0   | Secondary text                 |
| textMuted         | #5A6170   | Muted/placeholder text         |
| tint              | #00D4AA   | Primary accent (teal-green)    |
| tintLight         | #00E8BC   | Light accent variant           |
| tintDark          | #00B892   | Dark accent variant            |
| accent            | #3B82F6   | Blue accent                    |
| accentLight       | #60A5FA   | Light blue accent              |
| warning           | #F59E0B   | Warning/amber                  |
| warningLight      | #FBBF24   | Light warning                  |
| danger            | #EF4444   | Danger/red                     |
| dangerLight       | #F87171   | Light danger                   |
| success           | #10B981   | Success/green                  |
| successLight      | #34D399   | Light success                  |
| purple            | #8B5CF6   | Purple accent                  |
| purpleLight       | #A78BFA   | Light purple                   |
| cyan              | #06B6D4   | Cyan accent                    |
| tabIconDefault    | #5A6170   | Inactive tab icons             |
| tabIconSelected   | #00D4AA   | Active tab icons               |

---

## File Structure

```
app/
  _layout.tsx                     Root layout (QueryClient, GestureHandler, AppProvider, Stack)
  +native-intent.tsx              Redirect system path to "/"
  +not-found.tsx                  404 screen
  admin.tsx                       Admin Dashboard (modal presentation)
  (tabs)/
    _layout.tsx                   Tab navigator (4 tabs: Dashboard, Shots, Daily Log, Profile)
    (dashboard)/
      _layout.tsx                 Stack layout for Dashboard tab
      index.tsx                   Dashboard screen (artist view)
    shots/
      _layout.tsx                 Stack layout for Shots tab
      index.tsx                   Shots list screen
      [shotId].tsx                Shot detail screen (dynamic route)
    log/
      _layout.tsx                 Stack layout for Daily Log tab
      index.tsx                   Daily log submission form
    profile/
      _layout.tsx                 Stack layout for Profile tab
      index.tsx                   Profile screen with settings

components/
  ProductivityRing.tsx            SVG ring chart for productivity scores
  ShotCard.tsx                    Shot card (full and compact variants)
  StatusBadge.tsx                 Pill badge with dot + label

constants/
  colors.ts                       Dark theme color tokens

mocks/
  data.ts                         Mock data (user, shots, logs, activities, team, flags, projects)

providers/
  AppProvider.tsx                  Global app state (shots, logs, role, user)

types/
  index.ts                        TypeScript interfaces and types

utils/
  helpers.ts                      Utility functions (status/priority colors, date formatting, etc.)
```

---

## Routing Architecture

### Root Layout (`app/_layout.tsx`)
- Wraps app in: `QueryClientProvider` > `GestureHandlerRootView` > `AppProvider` > `Stack`
- Registers `(tabs)` (headerShown: false) and `admin` (modal presentation)
- Dark themed header defaults

### Tab Layout (`app/(tabs)/_layout.tsx`)
- **4 Tabs:**
  1. **Dashboard** — `(dashboard)` — icon: `LayoutDashboard`
  2. **Shots** — `shots` — icon: `Clapperboard`
  3. **Daily Log** — `log` — icon: `FileText`
  4. **Profile** — `profile` — icon: `User`
- Tab bar: dark surface background, teal active tint, muted inactive
- `headerShown: false` (headers owned by inner stacks)

### Inner Stack Layouts
Each tab has its own Stack layout with consistent dark header styling:
- `headerStyle: { backgroundColor: Colors.dark.background }`
- `headerTintColor: Colors.dark.text`
- `headerTitleStyle: { fontWeight: "700" }`
- `contentStyle: { backgroundColor: Colors.dark.background }`

---

## Screens

### 1. Dashboard (`app/(tabs)/(dashboard)/index.tsx`)
- **Header title:** "Ctrack" (fontWeight 800, fontSize 18)
- **Greeting:** Time-based greeting + user name + department badge
- **Daily Log CTA:** Pulsing animated card (warning gradient) when log not submitted; green "submitted" banner when done
- **Stats Row:** 4 stat cards — Active shots, Done, Revisions, Productivity Score (ring)
- **Urgent Shots:** Top 3 non-approved/non-hold shots sorted by deadline proximity (compact ShotCards)
- **Recent Activity:** Last 5 activity events with type-specific icons

### 2. Shots List (`app/(tabs)/shots/index.tsx`)
- **Search bar** with clear button
- **Filter toggle** button revealing horizontal status filter chips (all, assigned, in_progress, review, revision, approved, on_hold)
- **Shot list:** Full ShotCard components with thumbnails, status badges, deadline labels, hours, revision badges
- **Empty state** when no matches

### 3. Shot Detail (`app/(tabs)/shots/[shotId].tsx`)
- **Hero image** (thumbnail)
- **Header:** Shot name (monospace) + status badge + project/sequence line
- **Meta grid:** Priority, Deadline, Revisions, Last Updated (4 cards in 2x2 wrap)
- **Hours tracked:** Progress bar with actual/estimated, danger color when over budget
- **Description** section
- **Quick Actions:** Status change buttons (Start, Submit, Revise, Hold) with confirmation Alert + haptic feedback

### 4. Daily Log (`app/(tabs)/log/index.tsx`)
- **Submitted banner** when today's log exists
- **Form fields:**
  - Project picker (dropdown)
  - Shot picker (dependent on project selection)
  - Hours worked (decimal-pad keyboard)
  - Status update (multiline, required)
  - Notes (multiline, optional)
  - Blockers (multiline, optional)
- **Submit button** (disabled until all required fields filled) — triggers haptic + Alert
- **Recent Logs:** History list with shot name, project, hours, date

### 5. Profile (`app/(tabs)/profile/index.tsx`)
- **Avatar** (initials in teal ring)
- **Info card:** Email, Department, Join date
- **Productivity card:** Overall ring (size 90) + breakdown bars (5 metrics with weights)
- **Summary card:** Logs filed count + Total hours
- **Menu items:**
  - Switch View (artist/admin toggle)
  - Admin Dashboard (visible in admin mode, navigates to `/admin`)
  - My Tracking Data
  - Location Settings
  - Privacy & Consent

### 6. Admin Dashboard (`app/admin.tsx`) — Modal
- **Overview grid:** Active today, Logged, Location OK, Team avg productivity ring
- **Compliance Flags:** Expandable section with severity-coded flag items (info/warning/critical)
- **Team Members:** Filterable list (all/active/flagged/offline) with member cards showing:
  - Avatar with status dot
  - Department
  - Productivity ring
  - Log status, location compliance, shots progress, last activity

### 7. Not Found (`app/+not-found.tsx`)
- Simple centered "Screen not found" + link back to Dashboard

---

## Data Types (`types/index.ts`)

### User
- id, name, email, role (artist|admin), department, avatar?, joinDate

### Shot
- id, name, project, sequence, status, priority, assignedTo, deadline
- estimatedHours, actualHours, revisionCount, thumbnail?, description, lastUpdated

### ShotStatus
- assigned | in_progress | review | approved | revision | on_hold

### Priority
- low | medium | high | critical

### DailyLog
- id, userId, date, project, shotId, shotName, hoursWorked, status, notes, blockers, submittedAt

### ActivityEvent
- id, userId, type (task_view|shot_update|log_submit|chat|file_upload|status_change)
- description, timestamp, shotId?

### ProductivityScore
- taskCompletion, logTimeliness, estimateAccuracy, revisionFrequency, interactionConsistency, overall

### TeamMember
- id, name, department, avatar?, loggedToday, activeToday, locationCompliant
- productivity (ProductivityScore), shotsAssigned, shotsCompleted, lastActivity
- status (active|idle|offline|flagged)

### ComplianceFlag
- id, userId, userName, type (no_log|low_activity|late_submission|location_violation|deadline_miss)
- description, severity (info|warning|critical), timestamp, resolved

---

## State Management (`providers/AppProvider.tsx`)

Uses `createContextHook` from `@nkzw/create-context-hook`:

- **shots** — `useState<Shot[]>` initialized from mockShots, updated via `updateShotStatus`
- **logs** — `useState<DailyLog[]>` synced with AsyncStorage (`ctrack_daily_logs` key) via `useQuery` + `useMutation`
- **user** — `useState<User>` (static, currentUser mock)
- **viewRole** — `useState<UserRole>` synced with AsyncStorage (`ctrack_view_role` key)
- **todayLogSubmitted** — derived: checks if any log matches today's date

### Exposed API:
- `user`, `shots`, `logs`, `viewRole`
- `switchRole(role)` — persists to AsyncStorage
- `addLog(log)` — persists to AsyncStorage, invalidates query
- `updateShotStatus(shotId, status)` — in-memory only
- `todayLogSubmitted` — boolean
- `isLoading` — from logsQuery

---

## Components

### ProductivityRing
- SVG circle ring with progress arc
- Color coded: green (>=85), yellow (>=65), red (<65)
- Props: score, size (default 80), strokeWidth (default 6), label?

### ShotCard
- **Full variant:** Thumbnail image, header with name + critical icon + status badge, project/sequence, description, footer with deadline + hours + revision badge
- **Compact variant:** Priority color stripe on left, name + status badge, project, deadline + hours
- Monospace font for shot names
- Press feedback (opacity 0.85)

### StatusBadge
- Colored pill with dot indicator + label text
- Normal and small sizes
- Background uses color + "18" alpha

---

## Utility Functions (`utils/helpers.ts`)

- `getStatusColor(status)` — maps ShotStatus to color
- `getStatusLabel(status)` — maps ShotStatus to display label
- `getPriorityColor(priority)` — maps Priority to color
- `getPriorityLabel(priority)` — maps Priority to display label
- `formatTimeAgo(dateStr)` — relative time (Just now, Xm ago, Xh ago, Yesterday, Xd ago, date)
- `formatDate(dateStr)` — "Mon, Jan 1" format
- `getDaysUntilDeadline(deadline)` — days remaining (negative = overdue)
- `getDeadlineLabel(deadline)` — "Xd overdue", "Due today", "Due tomorrow", "Xd left"
- `getDeadlineColor(deadline)` — danger (overdue), warning (<=1d), warningLight (<=3d), secondary
- `getProductivityColor(score)` — success (>=85), warning (>=65), danger (<65)
- `getSeverityColor(severity)` — info=accent, warning=warning, critical=danger
- `getActivityIcon(type)` — maps activity type to icon name string

---

## Mock Data (`mocks/data.ts`)

### Current User
- Alex Rivera, Compositing department, artist role

### Shots (6)
| ID | Name          | Project        | Status      | Priority | Deadline   |
|----|---------------|----------------|-------------|----------|------------|
| s1 | VFX_010_020   | Nebula Rising  | in_progress | high     | 2026-03-05 |
| s2 | VFX_010_035   | Nebula Rising  | assigned    | critical | 2026-03-04 |
| s3 | VFX_020_010   | Nebula Rising  | review      | medium   | 2026-03-07 |
| s4 | CC_005_015    | Chrome City    | revision    | high     | 2026-03-06 |
| s5 | CC_005_022    | Chrome City    | approved    | low      | 2026-03-08 |
| s6 | VFX_030_005   | Nebula Rising  | on_hold     | medium   | 2026-03-12 |

### Daily Logs (3)
- March 2: VFX_010_020 — 6h — particle sim
- March 1: CC_005_022 — 3.5h — completed
- Feb 28: VFX_020_010 — 5.5h — submitted for review

### Activities (6)
- Shot update, task view, file upload, chat, log submit, status change

### Team Members (6)
| Name           | Dept        | Status  | Score | Logged |
|----------------|-------------|---------|-------|--------|
| Alex Rivera    | Compositing | active  | 81    | No     |
| Jordan Patel   | Lighting    | active  | 90    | Yes    |
| Sam Nakamura   | FX          | flagged | 55    | No     |
| Maya Chen      | Roto/Paint  | active  | 78    | Yes    |
| Dex Okafor     | Compositing | offline | 35    | No     |
| Lena Vasquez   | Matchmove   | active  | 94    | Yes    |

### Compliance Flags (5)
- No log (Sam), Low activity (Dex), Location violation (Maya), Deadline miss (Sam), Late submission (Alex - resolved)

### Projects
- Nebula Rising, Chrome City, Project Zenith

---

## Design Patterns

- **Dark-first design** — deep navy/charcoal backgrounds (#0D0F12, #161920)
- **Teal accent** (#00D4AA) as primary action color
- **Monospace typography** for shot names, stats, hours
- **Card-based layout** with 1px borders (Colors.dark.border)
- **Micro-interactions:** Pulse animation on unsubmitted log CTA, haptic feedback on status changes and log submission
- **Priority color stripes** on compact shot cards
- **Status color system:** Consistent across badges, dots, text
- **Font weights:** 800 for headings/values, 700 for titles, 600 for labels, 500 for secondary
- **Border radius:** 14px for cards, 12px for stat cards, 10px for inputs, 20px for pills/chips, 8px for small badges
- **Padding:** 16px standard, 14px for card inner content, 12px for compact items
- **Gap system:** 16-20px between sections, 10-12px between cards, 4-8px within components

---

## Productivity Scoring Formula

| Metric                    | Weight |
|---------------------------|--------|
| Task Completion Rate      | 40%    |
| On-time Log Submission    | 20%    |
| Estimated vs Actual Accuracy | 20% |
| Revision Frequency        | 10%    |
| Interaction Consistency   | 10%    |

Score coloring: Green (>=85), Yellow (>=65), Red (<65)

---

## Key Dependencies

| Package                              | Version     | Purpose                        |
|--------------------------------------|-------------|--------------------------------|
| expo                                 | ~54.0.27    | Core framework                 |
| expo-router                          | ~6.0.17     | File-based routing             |
| @tanstack/react-query                | ^5.83.0     | Server state management        |
| @nkzw/create-context-hook            | ^1.1.0      | Context + hook pattern         |
| @react-native-async-storage/async-storage | 2.2.0  | Persistent storage             |
| lucide-react-native                  | ^0.475.0    | Icons                          |
| expo-image                           | ~3.0.11     | Optimized images               |
| expo-linear-gradient                 | ~15.0.8     | Gradient backgrounds           |
| expo-haptics                         | ~15.0.8     | Haptic feedback                |
| react-native-svg                     | 15.12.1     | SVG rendering                  |
| react-native-gesture-handler         | ~2.28.0     | Gesture support                |
| react-native-safe-area-context       | ~5.6.0      | Safe area insets               |
| react-native-screens                 | ~4.16.0     | Native screen containers       |
| zustand                              | ^5.0.2      | (installed but not used in code) |
