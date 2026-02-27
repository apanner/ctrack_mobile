# CTrack Mobile UI Redesign Plan (V2)

## 1. Vision & Core Philosophy
The current UI is functional but feels rigid, flat, and outdated. The redesign will focus on:
- **Modern Apple/Linear-inspired Design:** Soft gradients, deep blurs (glassmorphism), rounded corners (bento-box style), and high-contrast typography.
- **Simplicity:** Remove visual clutter, heavy borders, and harsh background contrasts. Let the content breathe with generous whitespace.
- **Fluid Motion:** Implement smooth "page slide" transitions between screens, spring animations for button presses, and seamless tab switching.
- **Bento Box Layouts:** Grouping content into distinct, softly rounded cards of varying sizes instead of a generic vertical list.

## 2. Global Styling & Theming

### Color Palette (Refined Dark Mode)
- **Background:** `#000000` (True black for OLED) or `#09090B` (Very dark slate)
- **Card/Surface:** `#18181B` (Slightly lighter, no harsh borders) with a subtle `rgba(255,255,255,0.05)` border.
- **Accents:** 
  - Primary (Cyan): `#06B6D4` -> shift to a more electric/neon cyan `#00F0FF`.
  - Secondary (Purple): `#8B5CF6` -> shift to a softer lavender `#A78BFA`.
  - Timer/Active (Orange): `#F97316` -> shift to a punchy coral `#FF6B4A`.
- **Text:** 
  - Primary: `#FFFFFF`
  - Secondary: `#A1A1AA` (Zinc-400 for softer contrast)

### Typography
- Bold, heavy sans-serif headers (e.g., `font-weight: '800'`, size `28px` or `32px`).
- Clean, readable body text.
- Removal of ALL CAPS headers unless absolutely necessary.

### Component Styling
- **Cards (GlassCard 2.0):** `borderRadius: 24`, subtle background blur, minimal padding (e.g., `20px`).
- **Bottom Tab Bar:** Convert from a blocky bottom bar to a **floating, blurred pill** at the bottom of the screen to give it an iOS/modern aesthetic.
- **Buttons:** Fully rounded (`borderRadius: 999`), soft inner shadow, scale down slightly on press (using `react-native-reanimated`).

## 3. Screen-by-Screen Overhaul

### Home (Dashboard)
*Current:* Rigid vertical list of stats, timer, tasks, tomorrow, productivity, quick actions.
*New Design (Bento Grid):*
- **Header:** Large, personalized greeting ("Good morning, Alex") with a subtle profile avatar.
- **Top Row (Split):** 
  - Left: "Today's Hours" in a clean circular progress ring.
  - Right: "Active Timer" widget with a soft breathing pulse animation.
- **Middle Section (Tasks):** Horizontal scrolling cards for "Today's Tasks" to save vertical space. Each card is squarish and punchy.
- **Bottom Section (Quick Actions):** A 2x2 grid of modern, large-icon buttons for Log Time, Apply Leave, Focus, etc.

### Work (Timesheet & Tasks)
*New Design:*
- Replace the basic list with a sleek horizontal calendar strip at the top to swipe between days.
- Tasks below appear as floating, swipeable rows (swipe left to log time, swipe right to mark done).

### Chat
*New Design:*
- iOS Messages-style interface.
- Blurred, transparent header overlapping the chat history.
- Soft, rounded chat bubbles with distinct colors for sender vs receiver.

### Me (Profile/Settings)
*New Design:*
- Settings grouped in iOS-style grouped lists (white surface with 10% opacity, rounded corners).

## 4. Animations & "Page Slide"
- Update `_layout.tsx` Stack screen options to use `animation: 'slide_from_right'` or iOS native stack transitions.
- Use `react-native-reanimated` for layout transitions (e.g., when a task is completed, it shrinks and fades out).
- Add `react-native-haptic-feedback` on major interactions (starting a timer, completing a task).

## 5. Execution Steps
1. **Update Constants:** Rewrite `constants/colors.ts` with the new palette.
2. **Update Layouts & Navigation:** 
   - Overhaul `(tabs)/_layout.tsx` to create a floating blurred tab bar.
   - Update root `_layout.tsx` to ensure `animation: "slide_from_right"` is explicitly set for modern page transitions.
3. **Refactor Components:**
   - Overhaul `GlassCard.tsx` for the new Bento look.
   - Build a new `BentoGrid` utility.
   - Overhaul `FloatingTimerPill` to look like iOS Dynamic Island.
4. **Redesign Home Screen (`index.tsx`):** Implement the horizontal scrolls and grid layout.
5. **Redesign Work Screen (`work.tsx`):** Implement the calendar strip and swipeable cards.
