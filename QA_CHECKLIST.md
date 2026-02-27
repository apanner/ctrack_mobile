# ctrack_mobile QA Checklist

Manual QA steps for key flows on Android Chrome and iOS Safari.

## Prerequisites

- [ ] `EXPO_PUBLIC_API_URL` points to staging/production backend (or localhost for dev)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` configured
- [ ] Test user with artist role and active profile

---

## 1. Auth & Onboarding

### Sign in

- [ ] **Android Chrome**: Email/password sign-in works
- [ ] **iOS Safari**: Email/password sign-in works
- [ ] Invalid credentials show error message
- [ ] Session persists after app reload

### Onboarding (first-time)

- [ ] Onboarding screens display correctly
- [ ] Skip/complete flow works
- [ ] Redirects to main app after completion

---

## 2. Dashboard (Home)

- [ ] Header greeting and compact status render correctly
- [ ] Primary timer action appears as a single clear CTA
- [ ] Today's task module shows max 3 concise items
- [ ] Empty state is clear and uncluttered
- [ ] Pull-to-refresh works
- [ ] Empty states render correctly

---

## 3. Timesheets

- [ ] Timesheet list loads for date range
- [ ] Add new time log: date, project, shot, task, hours
- [ ] Quick hour chips (0.5/1/2/4/8) set hours input correctly
- [ ] Submit timesheet → appears as pending
- [ ] Validation: cannot submit 0 hours or invalid dates
- [ ] Rate limit: 30 submissions/hr shows 429 and retry message

---

## 4. Leaves

- [ ] Leave list loads
- [ ] Create new leave: start, end, reason
- [ ] Pending leaves display
- [ ] Approved/rejected status shown

---

## 5. Expenses

- [ ] Expense list loads
- [ ] Create new expense: category, amount, date
- [ ] Upload receipt (if supported)
- [ ] Submit expense
- [ ] View receipt image

---

## 6. Chat

- [ ] Chat room list loads
- [ ] Chat row card spacing, unread badge, and timestamp readability are consistent
- [ ] Open room → messages load
- [ ] Send text message
- [ ] Messages appear in real-time (or after refresh)
- [ ] Rate limit: 60 messages/min shows 429

---

## 7. Location (if enabled)

- [ ] Location batch upload works
- [ ] Rate limit: 120 batches/hr shows 429

---

## 8. Offline Behavior

- [ ] Offline indicator appears when disconnected
- [ ] Queued actions flush when back online
- [ ] Graceful handling of network errors

---

## 9. Error Boundary

- [ ] Trigger error (e.g. force throw in dev) → error boundary shows
- [ ] "Try again" button resets UI
- [ ] Console logs error

---

## 10. Env Validation

- [ ] In production build: if `EXPO_PUBLIC_API_URL` is localhost, console shows warning
- [ ] Missing env vars show appropriate warnings

---

## Platform-Specific

### Android Chrome

- [ ] Safe area (status bar, notch) respected
- [ ] Keyboard doesn't obscure inputs
- [ ] Back button behavior correct

### iOS Safari

- [ ] Safe area (notch, home indicator) respected
- [ ] Keyboard dismissal works
- [ ] Input focus scrolls view correctly

---

## 11. Native Feel & Motion

- [ ] Tab bar feels floating and native (blur, pill shape, no clipping)
- [ ] Tab switch feels smooth with no visible layout jump
- [ ] Stack navigation uses right-to-left slide transitions consistently
- [ ] App content uses full-screen space without awkward top/bottom dead zones
- [ ] Floating timer pill is visible but not visually dominant

---

## Performance

- [ ] App loads within ~3s on 4G
- [ ] List scrolling is smooth
- [ ] No memory leaks after navigation cycles
