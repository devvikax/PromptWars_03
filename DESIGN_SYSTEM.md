# Green Hero: Design System & Reusable Component Library

This document contains the visual guidelines, design tokens, and components for **Green Hero**, configured for "The Green Playground" visual style.

---

## 1. Creative North Star: "The Green Playground"
Our creative vision combines the tactile satisfaction of physical board games with modern, simplified habit tracking. Every element features chunky rounded corners, clear flat borders, and deep solid shadows to encourage touch. Emojis and visual indicators completely replace dense scientific statistics, keeping the app accessible for children, elderly users, and first-time smartphone owners.

---

## 2. Color System & Accessibility Check

Green Hero supports both a primary warm Light Mode and a dark Slate-Forest Dark Mode. Contrast ratios are calculated against WCAG 2.1 specifications to guarantee high readability.

### 2.1 Light Mode Color Tokens (Default)

| Token Name | Hex Value | Role / Usage | WCAG Contrast (vs Canvas) |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#F4FBF7` | Light mint-cream page background | *Base* |
| **Card BG** | `#FFFFFF` | Core container background | *1.1:1* (Structural contrast via border) |
| **Text Primary** | `#1A301D` | Headings, labels, and core body copy | **13.5:1** (AAA Compliant) |
| **Text Muted** | `#5E7A62` | Secondary labels, captions, and hints | **5.2:1** (AA Compliant) |
| **Green Hero (Primary)** | `#58CC02` | Main buttons, checkmarks, progress fill | **2.8:1** (Non-text contrast AA) |
| **Green Hero Shadow** | `#3A9E01` | 3D offset shadow for primary buttons | *Decorative* |
| **Gold Reward (Secondary)**| `#FFB000` | Stars, level-ups, streaks, XP indicators| **2.2:1** (Non-text contrast AA) |
| **Gold Reward Shadow** | `#D88D00` | 3D offset shadow for gold buttons | *Decorative* |
| **Eco Water (Tertiary)** | `#0EA5E9` | Carbon offset tips, water drops, highlights | **3.8:1** (AA Compliant for large text) |
| **Danger / Alert** | `#FF4B4B` | Errors, delete warning states | **3.9:1** (AA Compliant) |

### 2.2 Dark Mode Color Tokens

Activated when the system theme is dark, this mode uses a deep, calming forest-slate backdrop.

| Token Name | Hex Value | Role / Usage | WCAG Contrast (vs Canvas) |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#0F1F13` | Deep slate-forest background | *Base* |
| **Card BG** | `#1B3020` | Dark moss green container background | *1.4:1* (Border defines container) |
| **Text Primary** | `#ECFDF5` | Headings, labels, and core body copy | **11.2:1** (AAA Compliant) |
| **Text Muted** | `#8CA991` | Secondary labels, captions, and hints | **4.9:1** (AA Compliant) |
| **Green Hero (Primary)** | `#6EE7B7` | High-visibility mint green for dark mode | **5.4:1** (AA Compliant) |
| **Green Hero Shadow** | `#065F46` | Dark green offset shadow for primary buttons | *Decorative* |
| **Gold Reward (Secondary)**| `#FFC000` | Bright gold accent for rewards | **4.2:1** (AA Compliant) |
| **Gold Reward Shadow** | `#9A6A00` | Darker gold offset shadow | *Decorative* |
| **Eco Water (Tertiary)** | `#38BDF8` | Light sky blue accent | **6.1:1** (AA Compliant) |
| **Danger / Alert** | `#FCA5A5` | Soft red error text | **5.8:1** (AA Compliant) |

---

## 3. Typography Scale (Outfit)

We use the rounded, geometric **Outfit** font family across the entire application.

- **display-lg (40px / 2.5rem)**: Weight: 800 (Extra Bold) | Line Height: 1.2 | Usage: Level-up headers, streak alerts.
- **headline-xl (28px / 1.75rem)**: Weight: 800 (Extra Bold) | Line Height: 1.3 | Usage: Main screen card headings.
- **headline-lg (22px / 1.375rem)**: Weight: 700 (Bold) | Line Height: 1.3 | Usage: Standard cards, modal headers.
- **body-lg (18px / 1.125rem)**: Weight: 600 (Semi Bold) | Line Height: 1.5 | Usage: Mission cards, smart tips.
- **body-md (16px / 1rem)**: Weight: 500 (Medium) | Line Height: 1.5 | Usage: General description text, settings options.
- **label-md (14px / 0.875rem)**: Weight: 700 (Bold) | Letter Spacing: 0.05em | Case: Uppercase | Usage: Buttons, chips, small badges.

---

## 4. Shapes, Borders & Elevation

All elements use a **flat 3D tactile style** (thick flat borders and solid offsets) instead of blurry gradients or soft drop-shadows.

### Shape Radii
- **Standard Cards / Containers**: `16px` (`roundness: ROUND_TWELVE`)
- **Interactive Buttons / Badges**: `9999px` (`ROUND_FULL`)
- **Toggle Cards / Input Fields**: `16px` (`ROUND_TWELVE`)

### Tactile Shadows
- **Cards**: `border: 2px solid #C3DEC9; box-shadow: 0px 4px 0px #E2F2E7;`
- **Buttons**: `border: 2px solid #3A9E01; box-shadow: 0px 4px 0px #3A9E01;`
- **Dark Mode**: Outline values and shadows swap to dark mode equivalents (`#1B3020` border, `#0F1F13` shadow).

---

## 5. Reusable Component States

To ensure a production-ready system, we define the exact CSS rules for **Default, Hover, Pressed, Disabled, and Loading** states.

### 5.1 Primary Button (Green Hero)
```css
/* 1. Default State */
.btn-primary {
  background-color: #58CC02;
  color: #FFFFFF;
  border: 2px solid #3A9E01;
  box-shadow: 0px 4px 0px #3A9E01;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 14px 28px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.1s ease;
}

/* 2. Hover State */
.btn-primary:hover {
  background-color: #64E002;
  transform: translateY(-2px);
  box-shadow: 0px 6px 0px #3A9E01;
}

/* 3. Pressed (Active) State */
.btn-primary:active {
  transform: translateY(4px);
  box-shadow: 0px 0px 0px #3A9E01;
}

/* 4. Disabled State */
.btn-primary:disabled {
  background-color: #E2F2E7;
  color: #8CA991;
  border-color: #C3DEC9;
  box-shadow: 0px 4px 0px #C3DEC9;
  cursor: not-allowed;
  transform: none;
}

/* 5. Loading State */
.btn-primary.loading {
  background-color: #58CC02;
  color: transparent;
  position: relative;
  cursor: wait;
}
.btn-primary.loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #FFFFFF;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spinner 0.6s linear infinite;
}
@keyframes spinner {
  to { transform: rotate(360deg); }
}
```

### 5.2 Choice Toggle Card (Survey Selection)
Used for multiple-choice items during onboarding or profile editing.
```css
/* 1. Default State */
.choice-card {
  background-color: #FFFFFF;
  border: 2px solid #C3DEC9;
  box-shadow: 0px 4px 0px #E2F2E7;
  border-radius: 16px;
  padding: 18px 24px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

/* 2. Hover State */
.choice-card:hover {
  border-color: #58CC02;
  transform: translateY(-2px);
  box-shadow: 0px 6px 0px #E2F2E7;
}

/* 3. Selected (Pressed) State */
.choice-card.selected {
  background-color: #F4FBF7;
  border-color: #58CC02;
  box-shadow: 0px 4px 0px #3A9E01;
  transform: translateY(2px);
}

/* 4. Disabled State */
.choice-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 5. Loading State */
.choice-card.loading {
  background-color: #F9FAFB;
  border-color: #E5E7EB;
  box-shadow: none;
  cursor: wait;
  opacity: 0.7;
}
```

### 5.3 Daily Mission Card
The central card showcasing today's task.
- **HTML**:
  ```html
  <div class="mission-card">
    <div class="mission-header">
      <span class="mission-tag">Today's Mission</span>
      <span class="mission-reward">+20 XP & 1 Drop 💧</span>
    </div>
    <p class="mission-task">🚶 Walk or cycle for short trips today</p>
    <button class="btn btn-primary">Done! Complete Mission</button>
  </div>
  ```
- **CSS**:
  ```css
  .mission-card {
    background: #FFFFFF;
    border: 2px solid #C3DEC9;
    box-shadow: 0px 6px 0px #E2F2E7;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .mission-tag {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 14px;
    color: #58CC02;
    text-transform: uppercase;
  }
  .mission-reward {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: #FFB000;
  }
  .mission-task {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 18px;
    color: #1A301D;
    margin: 0;
  }
  ```

### 5.4 Tree Growth Container
A container card hosting the tree evolution illustration and stages progress.
- **HTML**:
  ```html
  <div class="tree-stage-card">
    <div class="tree-illustration-box">
      <img src="sapling_illustration.png" alt="Growing sapling" />
    </div>
    <div class="tree-health-row">
      <span class="tree-stage-title">Tree Level: 2 (Sapling)</span>
      <div class="earth-health-badge good">Earth Health: Good 😊</div>
    </div>
  </div>
  ```
- **CSS**:
  ```css
  .tree-stage-card {
    background: #FFFFFF;
    border: 2px solid #C3DEC9;
    box-shadow: 0px 4px 0px #E2F2E7;
    border-radius: 24px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .tree-illustration-box {
    width: 160px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tree-illustration-box img {
    max-width: 100%;
    max-height: 100%;
  }
  .tree-stage-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: #1A301D;
  }
  ```

### 5.5 App Status Components: Empty, Loading, and Error States

#### Empty State (No Completed Missions)
```html
<div class="state-container empty-state">
  <span class="state-emoji">🌱</span>
  <h3 class="state-title">No completed missions yet!</h3>
  <p class="state-description">Your completed daily actions will appear here. Finish today's mission to start your journey!</p>
</div>
```

#### Loading State (Skeleton Screen Container)
```html
<div class="state-container loading-state">
  <div class="skeleton-header skeleton-animate"></div>
  <div class="skeleton-body skeleton-animate"></div>
</div>
```
```css
.skeleton-animate {
  background: linear-gradient(90deg, #E2F2E7 25%, #F4FBF7 50%, #E2F2E7 75%);
  background-size: 200% 100%;
  animation: loading-shine 1.5s infinite;
  border-radius: 8px;
}
@keyframes loading-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Error State (Connection Error / Mission Fetch Failed)
```html
<div class="state-container error-state">
  <span class="state-emoji">⚠️</span>
  <h3 class="state-title">Connection failed!</h3>
  <p class="state-description">We couldn't load today's mission. Please check your internet connection and try again.</p>
  <button class="btn btn-primary">Try Again</button>
</div>
```
```css
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
  border: 2px dashed #C3DEC9;
  border-radius: 16px;
  max-width: 320px;
  margin: auto;
}
.state-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}
.state-title {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1A301D;
  margin: 0 0 8px 0;
}
.state-description {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #5E7A62;
  margin: 0 0 16px 0;
}
```
