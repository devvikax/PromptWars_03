# Frontend Architecture: Green Hero Gamified Ecosystem

Green Hero utilizes a modern, component-driven, responsive frontend architecture optimized for low-latency state synchronization, springy gamified micro-interactions, and WCAG accessibility standards.

---

## 1. Directory Structure

```
├── app/                           # Next.js App Router Pages & Layouts
│   ├── api/                       # Full-Stack Server-Side Route Handlers
│   │   ├── achievements/          # Achievements catalog & unlocks
│   │   ├── ai-coach/              # Llama AI Coach route with history & token logger
│   │   ├── analytics/             # Telemetry log write endpoint
│   │   ├── behavior/              # Telemetry stats sync
│   │   ├── collections/           # Flora/Fauna inventory unlocks
│   │   ├── missions/              # Missions catalog & completed status
│   │   ├── onboarding/            # Profile preferences onboarding
│   │   └── profile/               # Profile reads, writes, and merges
│   ├── auth/                      # Authentication login/register views
│   ├── dashboard/                 # Central gamified dashboard
│   ├── onboarding/                # Feet-on-the-ground preferences quiz
│   ├── profile/                   # User stats & notifications toggle
│   ├── progress/                  # Achievements view
│   ├── rewards/                   # Upgrades catalog
│   ├── globals.css                # Tailwind base configurations
│   └── layout.tsx                 # Root layout & providers
├── components/                    # Modular visual UI components
│   ├── auth/                      # Dual Auth panels & SaveProgressModal
│   ├── ui/                        # Visual cards, buttons, tree components
│   ├── analytics-tracker.tsx      # Client-side telemetry tracker
│   ├── pwa-provider.tsx           # SW registration & offline banner
│   └── theme-provider.tsx         # Dark/Light theme provider
├── constants/                     # Central static data catalogs
├── hooks/                         # Custom React hooks (useAuth)
├── lib/                           # Central config initializers
│   ├── firebase.ts                # Client-side Firebase App, Auth, and DB
│   ├── firebase-server.ts         # Server-side JWT helper & DB REST client
│   └── utils.ts                   # Tailwind merge utility
├── public/                        # PWA assets, manifest, and service worker
│   ├── icon.svg                   # Scalable vector logo
│   ├── manifest.json              # PWA manifest configurations
│   └── sw.js                      # Service Worker caching rules
├── services/                      # Client-side API abstraction helpers
│   ├── auth-header.ts             # Firebase JWT Bearer token resolver
│   ├── auth.ts                    # Email/Password & Session bridges
│   ├── db-achievements.ts         # achievements client API
│   ├── db-missions.ts             # missions client API
│   ├── db-onboarding.ts           # onboarding client API
│   ├── db-user.ts                 # user profile client API
│   ├── llama-integration.ts       # Client proxy to AI Coach
│   ├── llm-coach-service.ts       # AI Coach fallback rules router
│   └── notification-service.ts    # Notification permission & alerts scheduling
├── store/                         # Zustand local & offline state stores
├── styles/                        # Custom animations & theme sheets
└── types/                         # TypeScript interfaces
```

---

## 2. Core State Management Architecture

Green Hero utilizes **Zustand** as its primary client-side state store. To support offline play out-of-the-box, Zustand is integrated with the `persist` middleware which automatically synchronizes in-memory game state with `LocalStorage`.

```
                    +--------------------+
                    |   Zustand Store    |
                    | (Active Memory State) |
                    +---------+----------+
                              |
                     (Zustand Persist)
                              |
                              v
                    +---------+----------+
                    |    LocalStorage    |
                    |  (Offline Backup)  |
                    +---------+----------+
                              |
                    (API Sync on Network)
                              |
                              v
                    +---------+----------+
                    |    Firebase DB     |
                    | (Permanent Profile) |
                    +--------------------+
```

---

## 3. Firebase Integration Plan

All user data is stored in the NoSQL Firebase Realtime Database under a structured `/users/${userId}` tree. Next.js server-side API routes use raw REST operations to communicate with the database.

### 3.1 NoSQL Document Schema

```
 /users/${userId}
    ├── email (String)
    ├── phone (String/Null)
    ├── isGuest (Boolean)
    ├── level (Integer)
    ├── xp (Integer)
    ├── streak (Integer)
    ├── waterDrops (Integer)
    ├── travelType (String/Null)
    ├── acUsage (String/Null)
    ├── foodType (String/Null)
    ├── earthHealth (String)
    │
    ├── completedMissions/ (List of completions)
    │     └── [missionId]: { id, userId, missionId, completedAt }
    │
    ├── unlockedAchievements/ (Set of unlocked achievements)
    │     └── [achievementKey]: true
    │
    ├── unlockedCollections/ (Set of unlocked birds/flowers)
    │     └── [collectionKey]: true
    │
    ├── unlockedRewards/ (Set of unlocked ecosystem upgrades)
    │     └── [rewardKey]: true
    │
    ├── behavior/ (User interaction telemetry)
    │     ├── ignoredMissionsCount (Integer)
    │     ├── categoryPreferences/
    │     │     └── [category]: { completed, ignored, skipped }
    │     └── lastActiveAt (Timestamp)
    │
    └── insightLogs/ (Conversations and daily tips logs)
          └── [timestamp]: { content, timestamp, tokenUsage: { promptTokens, completionTokens, totalTokens } }
```

### 3.2 Guest Progress Merging (Server-Side)
When a guest signs up for a permanent account, the `/api/profile` POST handler fetches both `/users/${guestId}` and `/users/${userId}` records, merges their statistics (levels, XP, completion logs, and unlocked inventories), saves the unified profile under the authenticated user's ID, and deletes the temporary guest profile.

---

## 4. Animation Architecture (Framer Motion)

Animations must feel satisfying and springy. We define custom transitions:

### 4.1 Framer Motion Presets

```typescript
// Spring presets for tactical pops
export const springPop = {
  type: "spring",
  stiffness: 300,
  damping: 15,
};

export const standardEase = {
  type: "tween",
  ease: [0.4, 0, 0.2, 1],
  duration: 0.25,
};
```

### 4.2 Micro-Interaction Animators (Framer Variants)

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

## 5. Accessibility Implementation Plan (WCAG 2.1 AAA)

Green Hero ensures 100% usability for individuals with visual impairments, screen reader requirements, or low digital literacy.

1.  **Semantic Layout Elements**: Use strict HTML5 layout elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`).
2.  **Focus States & Keyboard Trapping**:
    *   No-mouse keyboard navigation maps all click activities via Tab focus.
    *   Custom CSS focus indicators: `.btn:focus-visible { outline: 3px solid #58CC02; outline-offset: 2px; }`
    *   Dialog components use Radix UI focus traps to lock keyboard cursor movement inside modals.
3.  **Aria Announcement Indicators (`aria-live`)**:
    *   XP Progress updates feature an `aria-live="polite"` indicator so screen readers read XP updates without interrupting active navigation.
4.  **Low Literacy Layouts**: Emojis are wrapped with semantic descriptors:
    ```html
    <span role="img" aria-label="Walking icon">🚶</span>
    ```

---

## 6. Performance & Caching Plan

- **Dynamic Lazy Loading**: Routes like the Rewards tab and the Profile modal are lazy loaded using Next.js `dynamic()` imports to minimize the primary JavaScript bundle size.
- **Next.js Image Optimization**: All static tree stage illustrations and mascot assets are served as SVGs or WebP formats via `<Image src={...} width={...} height={...} priority />` to prevent layout shifts.
- **Service Worker / Offline Check-Ins (PWA)**:
  - Green Hero uses a custom service worker to register PWA rules.
  - Offline mode: Users can complete their daily mission offline. Zustand queues the completion event in LocalStorage. When the browser triggers a `navigator.onLine` reconnect, the queued event is synced to Firebase.
- **HTTP Caching**: Tips database uses Next.js `revalidate: 86400` (static rendering refreshed once every 24 hours).

---

## 7. Development Roadmap

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

### Phase 4: Firebase Integration
*   Establish Firebase Auth (Email/Password) client and REST server API routes.
*   Deploy Firebase Realtime Database handlers (`dbRead`, `dbWrite`, `dbUpdate`) with `MOCK_DB` local persistence.
*   Build guest-to-authenticated merge functions.

### Phase 5: Accessibility Audits & Testing
*   Conduct manual keyboard navigation walkthroughs.
*   Run screen reader checks using VoiceOver/NVDA.
*   Optimize Next.js assets for 100/100 Lighthouse performance metrics.

### Phase 6: PWA Configuration & Deployment
*   Generate PWA asset manifests (icons, manifest.json).
*   Integrate service workers for offline caching and queue syncs.
*   Deploy to production.
