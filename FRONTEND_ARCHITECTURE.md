# Green Hero: Frontend Implementation Architecture

This document serves as the complete technical implementation blueprint for the **Green Hero** application, acting as the single source of truth for engineering.

---

## 1. Directory Structure

We use a modular, feature-oriented structure inside Next.js 15 (App Router). Features are grouped in `features/` to isolate core domains, while shared utilities and components sit in directories at the root.

```
green-hero-app/
├── app/                           # Next.js App Router root
│   ├── layout.tsx                 # Root layout (provides providers & core wrappers)
│   ├── page.tsx                   # Splash screen route
│   ├── onboarding/                # Onboarding multi-step route
│   │   └── page.tsx
│   ├── dashboard/                 # Authed/Guest main dashboard route (Home screen)
│   │   └── page.tsx
│   ├── progress/                  # Progress analytics route
│   │   └── page.tsx
│   ├── rewards/                   # Rewards & Achievements route
│   │   └── page.tsx
│   ├── profile/                   # Profile & Settings route
│   │   └── page.tsx
│   └── auth/                      # OTP / Google authentication entry route
│       └── page.tsx
│
├── components/                    # Shared UI Components (Design System Library)
│   ├── ui/                        # Low-level primitives (shadcn/ui customized for tactile look)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   └── sheet.tsx
│   ├── bottom-nav-bar.tsx         # Mobile tab bar
│   ├── sidebar-nav.tsx            # Desktop sidebar
│   ├── state-empty.tsx            # Empty status UI
│   ├── state-loading.tsx          # Skeleton loader state
│   └── state-error.tsx            # Connection error UI
│
├── features/                      # Isolated core features (domains)
│   ├── missions/                  # Daily Mission card & execution logic
│   │   ├── components/
│   │   ├── hooks/
│   │   └── store.ts
│   ├── achievements/              # Badge grids and locked/unlocked state triggers
│   │   ├── components/
│   │   └── store.ts
│   ├── tree-growth/               # Tree rendering stages and growth animations
│   │   ├── components/
│   │   └── store.ts
│   └── auth-conversion/           # Guest-to-authed upgrade flows
│       └── components/
│
├── hooks/                         # Global reusable hooks
│   ├── use-local-storage.ts       # Offline-first state mirroring
│   └── use-media-query.ts         # Responsive layout checks
│
├── services/                      # Supabase client wrapper and API abstractions
│   ├── supabase.ts                # Client initialization
│   ├── db-missions.ts             # Mission CRUD & completion endpoints
│   ├── db-achievements.ts         # Achievement milestones trigger fetches
│   └── db-user.ts                 # Guest upgrade & profile syncing endpoints
│
├── types/                         # TypeScript interfaces and type declarations
│   ├── index.ts                   # Core data models (Missions, Achievements, Users)
│   └── database.types.ts          # Auto-generated Supabase schema types
│
└── utils/                         # Pure utility functions
    ├── cn.ts                      # Tailwind merge utility class tool
    └── formula-carbon.ts          # Simple calculations translating actions into tree equivalents
```

---

## 2. Component Trees (Screen Hierarchy)

We map the nested components for each of the core application routes below.

### 2.1 Splash Screen
```
AppRoot -> SplashLayout
 ├── SplashContainer (Centered layout)
 │    ├── SeedMascotBrand (Illustration + Title + Subtitle)
 │    ├── PrimaryButton ("Get Started" -> Guest Mode Route)
 │    └── SecondaryButton ("Log In" -> Auth Login Options Modal)
 └── BrandFooter (Legal & safety disclaimer)
```

### 2.2 Onboarding Flow
```
AppRoot -> OnboardingLayout
 ├── OnboardingHeader (Skip button -> direct route to /dashboard)
 ├── OnboardingQuestionContainer (Swaps cards based on activeStep)
 │    ├── QuestionText (Prompt + Description text)
 │    ├── ChoiceCardGroup (Single-selection toggle cards)
 │    │    ├── ChoiceCard (e.g. Travel: Car, Bus, Metro, Walk)
 │    │    └── ChoiceCard (Selected: Walk - active green outline, checkmark icon)
 │    └── NextButton (Primary Button - triggers nextPage or finish)
 └── ProgressDotsIndicator (3-dot visual footer showing active step)
```

### 2.3 Home Dashboard (Primary view)
```
AppRoot -> DashboardLayout
 ├── ResponsiveNavigation (Swaps between BottomNavBar / SidebarNav)
 ├── DashboardContainer (Responsive grid: 1-col mobile, 2-col tablet, 3-col desktop)
      ├── HeaderStatsRow
      │    ├── LevelBadge ("Level 3: Carbon Cadet")
      │    ├── StreakCounter ("5 Day Streak 🔥")
      │    └── XPProgressBar (Filled bar + "240/300 XP" + Star Handle)
      ├── TreeStageContainer (Central growth display)
      │    ├── TreeIllustration (Central animated seedling/sapling/tree character)
      │    ├── TreeHealthBadge ("Earth Health: Good 😊")
      │    └── LevelUpgradeTriggerModal (Celebration screen popup)
      ├── DailyMissionCard
      │    ├── MissionMetadata (Title + XP/Water value)
      │    └── PrimaryButton ("Done! Complete Mission")
      └── SmartTipCard (Carbon equivalent explanation tip)
```

### 2.4 Progress Screen
```
AppRoot -> ProgressLayout
 ├── ResponsiveNavigation
 ├── ProgressContainer
      ├── EarthHealthBanner (Detailed good/warning/excellent status explanation)
      ├── ImpactGrid (2-column tactile layout)
      │    ├── ImpactCard (Carbon: "1 Tree Planted" + "Equivalent to 12kg of CO2")
      │    └── ImpactCard (Water: "3 Buckets Saved" + "30 Liters conserved")
      └── CompletedHistorySection
           ├── SectionHeader ("Missions Completed")
           ├── HistoryList
           │    ├── CompletedHistoryItem (🚶 Walked to store, Yesterday, +20 XP)
           │    └── CompletedHistoryItem (🔌 Unplugged chargers, 2 days ago, +15 XP)
           └── EmptyHistoryState (Shown if list is empty)
```

### 2.5 Rewards Screen
```
AppRoot -> RewardsLayout
 ├── ResponsiveNavigation
 ├── RewardsContainer
      ├── StreakMilestoneBanner ("5-Day Streak!" progress banner)
      ├── BadgesGrid (2-column grid layout)
      │    ├── BadgeCard (Unlocked: "First Step" - color, check icon)
      │    ├── BadgeCard (Unlocked: "Streak Master" - color, fire icon)
      │    └── BadgeCard (Locked: "Earth Protector" - grayscale, lock icon)
      └── TreeRoadmapStages (Visual timeline of growth stages)
```

### 2.6 Profile & Authentication Screen
```
AppRoot -> ProfileLayout
 ├── ResponsiveNavigation
 ├── ProfileContainer
      ├── ProfileAvatarHeader (Guest avatar seed illustration + "Guest Hero" + level badge)
      ├── SaveProgressCard (Invites registration)
      │    └── PrimaryButton ("Sign Up / Log In" -> triggers AuthModal)
      ├── AuthModal (Authentication Dialog - overlay)
      │    ├── ModalHeader ("Create Account")
      │    ├── PhoneOTPModule (Enter phone number -> triggers CodeEntryScreen)
      │    ├── GoogleLoginButton (OAuth integration link)
      │    └── AppleLoginButton (OAuth integration link)
      └── AICoachContainer (Muted placeholder section)
```

---

## 3. State Management Strategy

We recommend **Zustand** as the primary state manager. It is extremely lightweight, requires minimal boilerplate, supports TypeScript out of the box, and provides simple middleware to sync state automatically with local storage, enabling an **offline-first** design.

### Zustand Stores Structure

```typescript
// 1. Auth Store (store/auth-store.ts)
interface AuthState {
  user: User | null;         // Holds user details (null if guest)
  isGuest: boolean;          // Set to true by default
  isAuthenticated: boolean;  // Set to true after OTP/Google auth
  setSession: (session: Session | null) => void;
  upgradeGuestToUser: (authedUser: User) => Promise<void>; // Merges local stats
}

// 2. Game Progress Store (store/game-store.ts)
interface GameState {
  level: number;             // E.g., Level 3
  xp: number;                // E.g., 240
  xpNeeded: number;          // E.g., 300
  streak: number;            // E.g., 5
  waterDrops: number;        // E.g., 2
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  completeMissionLocal: (missionId: string) => void;
}
```

---

## 4. Supabase Integration Plan

### 4.1 Relational Database Schema

We design a flat, relational structure optimized for fast reads. Relationships are mapped below.

```
 [users] 
    ├── id (UUID, PK)
    ├── email (String)
    ├── phone (String)
    ├── is_guest (Boolean)
    └── created_at (Timestamp)
 
 [missions]
    ├── id (UUID, PK)
    ├── title (Text)
    ├── description (Text)
    ├── xp_reward (Integer)
    ├── water_reward (Integer)
    └── category (Enum: 'transport', 'energy', 'diet')

 [user_missions] (Many-to-Many junction)
    ├── id (UUID, PK)
    ├── user_id (UUID, FK -> users.id)
    ├── mission_id (UUID, FK -> missions.id)
    ├── completed_at (Timestamp)
    └── synced (Boolean) - Local storage tracking flag

 [achievements]
    ├── id (UUID, PK)
    ├── key (String, Unique)
    ├── title (Text)
    ├── description (Text)
    ├── icon_slug (String)
    └── xp_required (Integer)

 [user_achievements]
    ├── id (UUID, PK)
    ├── user_id (UUID, FK -> users.id)
    ├── achievement_id (UUID, FK -> achievements.id)
    └── unlocked_at (Timestamp)

 [progress_logs]
    ├── id (UUID, PK)
    ├── user_id (UUID, FK -> users.id)
    ├── carbon_saved_g (Float)
    ├── water_saved_l (Float)
    └── log_date (Date)
```

### 4.2 Guest Account Conversion Trigger (Supabase RPC Function)
When a guest signs in via Phone OTP or Google, their local stats (missions completed, XP, streak) must merge into their permanent profile. We write an RPC function in Postgres:

```sql
CREATE OR REPLACE FUNCTION merge_guest_progress(
  p_guest_id UUID,
  p_auth_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- 1. Update user_missions from guest to authenticated user
  UPDATE user_missions
  SET user_id = p_auth_user_id
  WHERE user_id = p_guest_id;

  -- 2. Update progress logs from guest to authenticated user
  UPDATE progress_logs
  SET user_id = p_auth_user_id
  WHERE user_id = p_guest_id;

  -- 3. Delete the temporary guest record from users table
  DELETE FROM users WHERE id = p_guest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Animation Architecture (Framer Motion)

Animations must feel satisfying and springy, matching the game-like look of Duolingo. We define custom transitions:

### 5.1 Framer Motion Presets

```typescript
// Spring presets for tactical pops
export const springPop = {
  type: "spring",
  stiffness: 300,
  damping: 15, // Creates a satisfying bounce effect
};

export const standardEase = {
  type: "tween",
  ease: [0.4, 0, 0.2, 1],
  duration: 0.25,
};
```

### 5.2 Micro-Interaction Animators (Framer Variants)

```typescript
// 1. Level-Up Modal Pop
export const levelUpModalVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: [0, 1.15, 1], 
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" }
  },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15 } }
};

// 2. Tree Growth Squash and Stretch
export const treeGrowthVariants = {
  idle: { scale: 1 },
  grow: {
    scaleY: [1, 0.8, 1.25, 1],
    scaleX: [1, 1.1, 0.9, 1],
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};
```

---

## 6. Accessibility Implementation Plan (WCAG 2.1 AAA)

Green Hero ensures 100% usability for individuals with visual impairments, screen reader requirements, or low digital literacy.

1.  **Semantic Layout Elements**: Use strict HTML5 layout elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`).
2.  **Focus States & Keyboard Trapping**:
    *   No-mouse keyboard navigation maps all click activities via Tab focus.
    *   Custom CSS focus indicators: `.btn:focus-visible { outline: 3px solid #58CC02; outline-offset: 2px; }`
    *   Dialog components use Radix UI focus traps to lock keyboard cursor movement inside modals (like the OTP dialog).
3.  **Aria Announcement Indicators (`aria-live`)**:
    *   XP Progress updates feature an `aria-live="polite"` indicator so screen readers read XP updates without interrupting active navigation.
4.  **Low Literacy Layouts**: Emojis are wrapped with semantic descriptors:
    ```html
    <span role="img" aria-label="Walking icon">🚶</span>
    ```

---

## 7. Performance & Caching Plan

- **Dynamic Lazy Loading**: Routes like the Rewards tab and the Profile modal are lazy loaded using Next.js `dynamic()` imports to minimize the primary JavaScript bundle size.
- **Next.js Image Optimization**: All static tree stage illustrations and mascot assets are served as SVGs or WebP formats via `<Image src={...} width={...} height={...} priority />` to prevent layout shifts.
- **Service Worker / Offline Check-Ins (PWA)**:
  - Green Hero uses `next-pwa` to register service workers.
  - Offline mode: Users can complete their daily mission offline. Zustand queues the completion event in LocalStorage. When the browser triggers a `navigator.onLine` reconnect, the queued event is synced to Supabase.
- **HTTP Caching**: Tips database uses Next.js `revalidate: 86400` (static rendering refreshed once every 24 hours).

---

## 8. Development Roadmap

### Phase 1: Core Design System Primitives
*   Configure Tailwind theme configurations with the exact Light/Dark tokens.
*   Setup shadcn/ui base primitives (Button, Card, Dialog, Progress bar) customized to use the thick tactile border style.
*   Implement layout navigation wrappers (BottomNavBar / SidebarNav).

### Phase 2: Onboarding & Guest Dashboard
*   Build the multi-step Onboarding Question flow.
*   Create the Home Dashboard featuring the XP Progress bar and Tree Growth illustration container.
*   Implement Zustand stores for managing local game status.

### Phase 3: Gamified Animations
*   Integrate Framer Motion curves to buttons, modal triggers, and level up popups.
*   Add micro-animations for particle starbursts and XP floating text indicators.

### Phase 4: Supabase Backend Integration
*   Write Postgres migrations for schema tables (`users`, `missions`, `user_missions`, `achievements`, `progress_logs`).
*   Deploy the guest progress merging Postgres RPC function.
*   Hook up the authentication hooks for Phone OTP and Google OAuth.

### Phase 5: Accessibility Audits & Testing
*   Conduct manual keyboard navigation walkthroughs.
*   Run screen reader checks using VoiceOver/NVDA.
*   Optimize Next.js assets for 100/100 Lighthouse performance metrics.

### Phase 6: PWA Configuration & Deployment
*   Generate PWA asset manifests (icons, manifest.json).
*   Integrate service workers for offline caching and queue syncs.
*   Deploy to production on Vercel.
