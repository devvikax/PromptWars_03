# Green Hero: Product Design, Motion & Handoff blueprint

This document details the interface layout structures, high-fidelity mockups, responsive grid rules, animation timings, accessibility compliance, and developer handoff guidelines for **Green Hero**.

---

## 1. Structural Wireframes (ASCII Mappings)

### 1.1 Home Dashboard Layout
```
+--------------------------------------------------+
|  Level 3: Carbon Cadet [XP: 240/300]   Streak:5🔥 |
|  [==========================*                  ] |
+--------------------------------------------------+
|                                                  |
|                   .---.                          |
|                  /     \                         |
|                 (   🌿  )  Tree Level 2: Sapling |
|                  \  😊 /                         |
|                   '---'                          |
|                     |                            |
|                  ___|___                         |
|                  \_____/ (In Pot)                |
|                                                  |
|           Earth Health Status: Good 😊           |
+--------------------------------------------------+
|  TODAY'S MISSION                                 |
|  🚶 Walk or cycle for short trips today          |
|  Reward: +20 XP & 1 Water Drop 💧                 |
|                                                  |
|  [ Done! Complete Mission ]  <-- Tactile Green   |
+--------------------------------------------------+
|  💡 QUICK TIP                                    |
|  Walking 1 km instead of driving saves 150g CO₂! |
+--------------------------------------------------+
| [🏠 Home]   [📈 Progress]   [🏆 Rewards]  [👤 Profile]|
+--------------------------------------------------+
```

### 1.2 Onboarding Choice Flow Layout
```
+---------------------------------------+ [Skip]   |
|                                                  |
|    How do you usually travel? 🌍                 |
|    Choose the mode you use most often.           |
|                                                  |
|    +----------------------------------------+    |
|    | 🚗 Car                                 |    |
|    +----------------------------------------+    |
|    | 🚌 Bus                                 |    |
|    +----------------------------------------+    |
|    | 🚇 Metro                               |    |
|    +----------------------------------------+    |
|    | 🚶 Walk  [ Selected ]               ✓  |    |
|    +----------------------------------------+    |
|                                                  |
|    [ Next Question → ]                           |
|                                                  |
|                o   .   .  (Progress Dots)        |
+--------------------------------------------------+
```

---

## 2. High-Fidelity UI Screens & Mockups

Below is the complete set of visual screens generated inside Stitch using the **Green Hero Design System**. All mockups use the warm light theme (`#F4FBF7`) with Outfit typography and rounded, tactile components.

### 2.1 Splash Screen (App Welcome)
Features the friendly seed mascot and a direct Guest mode pathway to minimize friction.

![Splash Screen](file:///C:/Users/vikas/.gemini/antigravity/brain/033f8b2b-5c26-4cd1-b39a-cb820aeacb8c/splash_screenshot.png)
- **Stitch Resource**: [Splash Screen](file:///projects/2822415300335679492/screens/7af9a7da2798489e9a992d06858adda8)

### 2.2 Onboarding: Travel Survey
Introduces survey questions via large, easy-to-tap choice cards instead of keyboard forms.

![Onboarding Travel](file:///C:/Users/vikas/.gemini/antigravity/brain/033f8b2b-5c26-4cd1-b39a-cb820aeacb8c/onboarding_screenshot.png)
- **Stitch Resource**: [Onboarding Screen](file:///projects/2822415300335679492/screens/97246a6d883a472187d648a58b74e5f3)

### 2.3 Home Dashboard (Today's Mission)
The primary layout featuring the central tree visual, level/XP metrics, streak fire, and the current daily mission card.

![Home Dashboard](file:///C:/Users/vikas/.gemini/antigravity/brain/033f8b2b-5c26-4cd1-b39a-cb820aeacb8c/home_screenshot.png)
- **Stitch Resource**: [Home Screen](file:///projects/2822415300335679492/screens/e8f2608e39d441cdb1a8b19fc2809b56)

### 2.4 Your Progress (Impact Analytics)
Visualizes carbon equivalents (planting a tree) and water droplets, followed by completed activity history.

![Your Progress](file:///C:/Users/vikas/.gemini/antigravity/brain/033f8b2b-5c26-4cd1-b39a-cb820aeacb8c/progress_screenshot.png)
- **Stitch Resource**: [Progress Screen](file:///projects/2822415300335679492/screens/caca02b7ba3c451598c0fb8b5b5b523a)

### 2.5 Rewards & Achievements
Displays the streak master detail, unlocked badges, locked silhouettes, and tree stages roadmap.

![Rewards Screen](file:///C:/Users/vikas/.gemini/antigravity/brain/033f8b2b-5c26-4cd1-b39a-cb820aeacb8c/rewards_screenshot.png)
- **Stitch Resource**: [Rewards Screen](file:///projects/2822415300335679492/screens/875b66bab4754b05bdb808d6d7612330)

### 2.6 Account Setup (Profile)
Guest account parameters, progress-backup triggers, and future AI Eco Coach placeholder.

![Profile Screen](file:///C:/Users/vikas/.gemini/antigravity/brain/033f8b2b-5c26-4cd1-b39a-cb820aeacb8c/profile_screenshot.png)
- **Stitch Resource**: [Profile Screen](file:///projects/2822415300335679492/screens/e889d64268b84a4b98d28c373ee545e6)

### 2.7 Phone OTP Verification
Secure verification entry using large 64px tactile inputs.

![OTP Screen](file:///C:/Users/vikas/.gemini/antigravity/brain/033f8b2b-5c26-4cd1-b39a-cb820aeacb8c/otp_screenshot.png)
- **Stitch Resource**: [OTP Screen](file:///projects/2822415300335679492/screens/f8a45d81aaeb44918b33d845c56b9054)

---

## 3. Responsive Screen Adaptations

While Green Hero is mobile-first, components scale systematically across breakpoints.

### 3.1 Layout Columns
- **Mobile (<480px)**: 1-column vertical feed. All cards occupy full-width (`width: 100%`) with `16px` side margins.
- **Tablet (481px - 1024px)**: 2-column split grid.
  - Left column: Daily Mission card + Smart Tips.
  - Right column: Tree growth widget + Level indicator.
- **Desktop (1025px+)**: 3-column dashboard.
  - Column 1: Navigation panel, smart tips, and Earth Health status.
  - Column 2 (Center stage): Tree evolution container and XP progress.
  - Column 3: Badges showcase and completed history list.

### 3.2 Navigation Bar Swap
- **Mobile & Tablet**: Bottom-docked tab bar (Height: `72px`), featuring large 24x24px icons with active green labels.
- **Desktop**: Left-docked sticky sidebar (Width: `240px`). Top features the Green Hero seed logo, and navigation items stack vertically with hover states.

---

## 4. Micro-interactions & Motion Timings

Animations provide playful feedback, reinforcing environment-friendly habits. We specify exact timing curves and parameters below:

### 4.1 Timing Curves

```
Elastic Pop / Bounce
 ├── Timing Formula: cubic-bezier(0.175, 0.885, 0.32, 1.275)
 ├── Duration: 300ms
 └── Usage: Modals, card selection clicks, checkmarks, level-up banners

Standard Slide / Fade
 ├── Timing Formula: cubic-bezier(0.4, 0, 0.2, 1)
 ├── Duration: 250ms
 └── Usage: Screen transitions, XP bar fill transitions, dropdown sheets

Snappy Depress
 ├── Timing Formula: cubic-bezier(0.25, 1, 0.5, 1)
 ├── Duration: 100ms
 └── Usage: Tactile buttons translateY down state on click
```

### 4.2 Interaction Triggers & Transitions
- **Button Press**: On click, button translates down `translateY(4px)` and flat shadow size collapses to `0px`. Resets to default over `100ms` upon release.
- **Mission Accomplished Star Burst**:
  - Tapping "Done!" triggers 10 gold stars (`#FFB000`) styled as small absolute circular divs.
  - Timed transition: `scale(0) -> scale(1.2) -> scale(0)` while moving outward `40px` in a circle, fading out over `400ms`.
- **XP Increment float**:
  - A small `+20 XP` text element appears at the click coordinates.
  - Eased transition: `transform: translateY(-30px); opacity: 0;` over `800ms`.

---

## 5. Tree System Visual Evolution

The growing tree is the core emotional anchor. The asset stages are mapped to user levels:

```
Stage 1: Seed 🌱
 └── Level: 1 - 2
 └── Visual: A cute little green seed in dark rich soil with a sleeping face.

Stage 2: Sapling 🌿
 └── Level: 3 - 5
 └── Visual: A small green sprout with two leaves in a red-clay pot, smiling.

Stage 3: Young Tree 🌳
 └── Level: 6 - 9
 └── Visual: A small potted oak tree with three clusters of leaves, waving.

Stage 4: Flourishing Tree 🌳✨
 └── Level: 10+
 └── Visual: A large green tree covered in small gold flowers/stars, sparkling.
```
- **Transition animation**: When a level boundary is crossed, the tree container performs a `1.15x` scale pop over `300ms` with the elastic curve, replacing the old illustration.

---

## 6. Accessibility & Inclusion Audit (WCAG 2.1)

To support children, elderly citizens, and low-literacy users, we establish strict compliance rules:

- **Contrast Compliance**: Headings, buttons, and card labels must maintain a minimum contrast ratio of **4.5:1** (light mode uses deep forest green `#1A301D` against `#F4FBF7` mint canvas, achieving **13.5:1**, far exceeding AAA).
- **Target Sizes**: Interactive elements (buttons, choice cards, navigation items) have a minimum height/width of **56px** (exceeding standard 48px).
- **Aria Labels & Screen Reader Cues**:
  - Every emoji/icon uses `aria-hidden="true"` to prevent raw voiceover (e.g. reading "car emoji").
  - Alternative texts describe the context (e.g., `<span role="img" aria-label="5 Day Streak">🔥</span>`).
  - Screen reader announcements: Completing a mission triggers an `aria-live="polite"` update announcing: *"Congratulations! Mission Completed. You earned 20 XP and your streak is now 5 days."*
- **Low-Literacy Aid**: Emojis are consistently placed adjacent to text items. A child or user who struggles to read "Walk or cycle" can instantly recognize the walking emoji (`🚶`) and green primary action button.

---

## 7. Developer Handoff specifications

### 7.1 Font Installation
- **Font Face**: Outfit (Google Fonts). Include weights: `500 (Medium)`, `600 (Semi-Bold)`, `700 (Bold)`, `800 (Extra Bold)`.
- **CSS Import**: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');`

### 7.2 Core CSS Tokens
```css
:root {
  --color-canvas-light: #F4FBF7;
  --color-card-light: #FFFFFF;
  --color-text-primary-light: #1A301D;
  --color-text-muted-light: #5E7A62;
  --color-primary-green: #58CC02;
  --color-primary-green-shadow: #3A9E01;
  --color-reward-gold: #FFB000;
  --color-reward-gold-shadow: #D88D00;
  --color-water-blue: #0EA5E9;
  
  --radius-card: 16px;
  --radius-button: 9999px;
  
  --timing-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --timing-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```
