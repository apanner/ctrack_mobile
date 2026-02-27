# ctrack_mobile — Gemini Technical Execution & Codebase Audit

> A deep technical review of the current `d:\dev\track\mobile` codebase and specific implementation paths to achieve the Sonet product plan.
> Perspective: Lead React Native / Expo Architect.
> Date: 2026-02-27

---

## 1. Current Codebase Audit: The Gap Analysis

I have scanned the existing `mobile` directory. The foundation is solid (Expo Router 6, React Native 0.81.5, strict TypeScript, React Query), but there is a significant gap between the *current code* and the *vision* of a native-like, glassy, offline-capable PWA.

### Critical Dependencies to Remove
- **`firebase` (^12.6.0)**: It is currently in `package.json`. The architectural decision is to use **Supabase Realtime + Postgres** as the single source of truth. Keeping Firebase adds bundle bloat (especially on Web/PWA) and splits our data layer. **Action:** Uninstall Firebase and rip out `lib/firebase.ts`.

### Critical Dependencies to Add
To achieve the Sonet plan (Background GPS, Push Notifications, Glassy UI, Audio Recording), we need to expand the Expo SDK usage:
- **`react-native-reanimated`**: Mandatory for the "smooth spring transitions and gentle micro-interactions." The standard Animated API won't cut it for a world-class Apple-native feel.
- **`@shopify/flash-list`**: The current `DashboardScreen` uses a standard `ScrollView` with `.map()`. This will lag severely when an artist has 50+ assigned shots. We must migrate to FlashList for 60fps scrolling.
- **`expo-location` & `expo-task-manager`**: Required for the background and foreground GPS throttling logic.
- **`expo-notifications`**: For the native-like notification experience.
- **`expo-av` or `expo-audio`**: For the in-app voice/standup features.
- **`@tanstack/react-query-persist-client`**: The missing piece for offline resilience.

---

## 2. Engineering the "Apple-Native Glassy Style"

The Sonet plan calls for a "premium, minimal, glassy" UI. Doing this performantly across iOS, Android, and Web PWA requires a specific technical strategy.

### The Glassmorphism Implementation
React Native does not have a universal CSS `backdrop-filter`. We must use platform-specific approaches inside our UI primitives:
- **iOS**: Use `expo-blur` (`<BlurView>`). It maps directly to `UIVisualEffectView` and is highly performant.
- **Web (PWA)**: `<BlurView>` translates to `backdrop-filter: blur(20px)` on web. This is perfect for Chrome.
- **Android**: Android does not natively support real-time background blurring efficiently. `expo-blur` works, but can cause frame drops on mid-range Android devices. **Action:** Implement a graceful fallback for Android using semi-transparent solid colors (`rgba(255,255,255,0.08)`) instead of heavy blur, ensuring the app remains lightning fast.

### Component Architecture
Create a unified `<GlassCard>` component that handles platform detection internally. Developers should just write `<GlassCard>` and let the component decide whether to render a BlurView or a transparent view based on `Platform.OS`.

---

## 3. PWA & Web Configuration (Action Required)

The current `app.json` has minimal web configuration:
```json
"web": {
  "favicon": "./assets/favicon.png",
  "bundler": "metro"
}
```
This is **not a PWA** yet. To make it installable and behave like a native app on Android Chrome:

1. **Add PWA Manifest Config**:
   Update `app.json` to generate the `manifest.json` correctly:
   ```json
   "web": {
     "bundler": "metro",
     "favicon": "./assets/favicon.png",
     "shortName": "CTrack",
     "name": "CTrack Artist Manager",
     "themeColor": "#0A0A0F",
     "backgroundColor": "#0A0A0F",
     "display": "standalone",
     "orientation": "portrait"
   }
   ```
2. **Service Worker**: Expo's Metro web bundler doesn't inject an offline service worker by default. We will need to use `expo-pwa` or manually add a `service-worker.js` in the `public` directory to cache the app shell.

---

## 4. The Offline-First Data Layer

The Sonet plan correctly identifies that artists lose connection in render farms. Our current code uses standard `useQuery`. If the app goes offline, it fails (as seen in the `Connection Error` state in `DashboardScreen`).

**Implementation Strategy:**
1. **Query Caching**: Wrap our React Query setup with `@tanstack/react-query-persist-client` and bind it to AsyncStorage (or IndexedDB on web). This ensures that opening the app offline instantly loads the last known state.
2. **Optimistic Mutations**: For timesheets, when an artist hits "Log Time", we immediately update the local React Query cache (Optimistic UI) and push the mutation to a background queue.
3. **Background Sync**: If offline, the mutation stays in the queue. When the device fires the `online` event (via `@react-native-community/netinfo`), the queue flushes to Supabase automatically.

---

## 5. Refining the GPS Throttling Logic (Code Level)

Sonet suggested throttling GPS based on movement speed. Here is how we build that in Expo:

1. **Foreground Location**: Use `Location.watchPositionAsync`.
2. **Background Location**: Register a task with `TaskManager.defineTask('BACKGROUND_LOCATION', ...)`.
3. **The Throttling Hook**:
   We don't need to constantly poll to calculate speed. We can use Expo Location's built-in `distanceInterval` and `deferredUpdates`.
   ```typescript
   // High accuracy (Moving)
   await Location.startLocationUpdatesAsync('BACKGROUND_LOCATION', {
     accuracy: Location.Accuracy.Balanced,
     distanceInterval: 50, // Only trigger if moved 50 meters
     deferredUpdatesInterval: 30000, // Or every 30 seconds
   });
   ```
   If the `DeviceMotion` API detects no physical movement for 5 minutes, we programmatically unregister the high-accuracy task and switch to a "Heartbeat" mode (calling `Location.getCurrentPositionAsync` once every 30 mins).

---

## 6. Immediate Next Steps for the Dev Team

To transition from the current state to the Phase 1 goal:

1. **The Purge**: Run `npm uninstall firebase` and delete `firebase.ts`. Clean up `package.json`.
2. **The Install**: Run `npx expo install react-native-reanimated @shopify/flash-list expo-location expo-notifications @tanstack/react-query-persist-client`.
3. **Navigation Restructure**: Update `app/(tabs)/_layout.tsx`. Remove the 5-tab structure. Consolidate into:
   - `index.tsx` (Home/Timer/Reminders)
   - `work.tsx` (Timesheet + Tasks combined)
   - `chat.tsx` (Supabase Realtime)
   - `profile.tsx` (Me/Tools/Leave)
4. **UI Overhaul**: Replace the current solid `#1C1E26` backgrounds with the dark glassy token system proposed in the Sonet plan. Add a Floating Action Button (FAB) or a persistent Top Pill for the active timer.
5. **Admin API Stubs**: Create the server-side API routes for timesheet submissions so the mobile team can build against actual endpoints instead of mocking.

---

> **Gemini's Conclusion:** The codebase is healthy, but it is currently a standard React Native data-fetching app. To elevate it to "World-Class VFX Studio Edition", we must shift our mindset from *fetching data* to *optimistic offline-first state management* and invest heavily in *Reanimated-driven UI micro-interactions*.