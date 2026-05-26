# PokéNexus — Product Requirements Document

## 1. Project Overview

**PokéNexus** is a high-fidelity, interactive web application designed for Pokémon trainers to browse a digital Pokédex, manage their collection, and facilitate trades. The platform emphasizes a **Dark Mode** aesthetic with vibrant, attribute-driven color themes and immersive full-screen interactions.

---

## 2. Design System: Obsidian Index

### 2.1 Color Palette

| Token             | Value                    | Usage                           |
| ----------------- | ------------------------ | ------------------------------- |
| `--pn-bg`         | `#131315`                | Primary page background         |
| `--pn-surface`    | `#1e1e22`                | Card / panel backgrounds        |
| `--pn-surface-2`  | `#26262c`                | Elevated elements, hover states |
| `--pn-accent`     | `#ff1c1c`                | Active states, brand highlights |
| `--pn-text`       | `#f0f0f0`                | Primary body text               |
| `--pn-text-muted` | `#9999aa`                | Secondary / caption text        |
| `--pn-border`     | `rgba(255,255,255,0.08)` | Dividers, card outlines         |

### 2.2 Pokémon Type Colors (Contextual Fills)

| Type     | Color           | Hex       |
| -------- | --------------- | --------- |
| Normal   | Tan             | `#A8A878` |
| Fire     | Orange          | `#F08030` |
| Water    | Cornflower Blue | `#6890F0` |
| Electric | Gold            | `#F8D030` |
| Grass    | Medium Green    | `#78C850` |
| Ice      | Pale Cyan       | `#98D8D8` |
| Fighting | Crimson         | `#C03028` |
| Poison   | Purple          | `#A040A0` |
| Ground   | Khaki           | `#E0C068` |
| Flying   | Lavender        | `#A890F0` |
| Psychic  | Hot Pink        | `#F85888` |
| Bug      | Olive Green     | `#A8B820` |
| Rock     | Dark Tan        | `#B8A038` |
| Ghost    | Slate Purple    | `#705898` |
| Dragon   | Indigo          | `#7038F8` |
| Dark     | Brown           | `#705848` |
| Steel    | Silver          | `#B8B8D0` |
| Fairy    | Rose            | `#EE99AC` |

### 2.3 Typography

- **Font Family**: [Sora](https://fonts.google.com/specimen/Sora) — Modern, clean sans-serif
- **Weights used**: 300 (Light), 400 (Regular), 600 (Semi-Bold), 700 (Bold)

### 2.4 Visual Language

| Property              | Value                                                    |
| --------------------- | -------------------------------------------------------- |
| Border Radius (base)  | `16px`                                                   |
| Border Radius (small) | `10px`                                                   |
| Border Radius (large) | `24px`                                                   |
| Sidebar / Overlay     | Semi-transparent glassmorphism (`backdrop-filter: blur`) |
| Card Style            | Minimalist — large image, name only                      |
| Transitions           | Smooth fade-in on screen changes                         |

---

## 3. Site Structure & Navigation

The application uses a **persistent left-side navigation bar**.

```
┌──────────┬──────────────────────────────────────────┐
│          │                                          │
│   NAV    │             Main Content                 │
│          │                                          │
│ Pokédex  │                                          │
│ Trade    │                                          │
│ Profile  │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

| Section | Route      | Description                   |
| ------- | ---------- | ----------------------------- |
| Pokédex | `/pokedex` | Main library of Pokémon       |
| Trade   | `/trade`   | Exchange hub                  |
| Profile | `/profile` | User information & collection |

> **Note:** The Battle feature and top navigation bar were explicitly removed to simplify the user experience.

---

## 4. Feature Requirements

### 4.A Pokédex Library

#### Grid Layout

- Default: **4-column grid** (standard viewport)
- Full-screen adaptive grid on wider displays

#### Card UI

```
┌──────────────────┐
│                  │
│   [Pokémon Art]  │   ← Full type-color background fill
│                  │
│   Bulbasaur      │   ← Name below image
└──────────────────┘
```

- **Image-first** design
- Name positioned **below** the image
- No type badges or ID numbers on the list view
- **Hover effect**: Image scales up (`scale(1.05)`), card container remains fixed size
- **Background**: Full color fill matching the Pokémon's **primary type**

#### Filtering

- Automatic filtering — no "Apply" button required
- Filter dimensions:
  - **Type** (all 18 Pokémon types)
  - **Generation** (Gen I–IX)
  - **Personality** (e.g., Timid, Jolly, Adamant …)
- **Search bar** positioned directly below filter selectors

#### Pagination

- **30 items per page**
- Standard prev / next navigation

---

### 4.B Immersive Details View

- **Trigger**: Click on any Pokémon card
- **Animation**: Full-screen **fade-in overlay**
- **Layout**:
  ```
  ┌────────────────────────────────────────────────┐
  │  [Dynamic header — type color bg]              │
  │       [High-fidelity 3D render]                │
  ├────────────────────────────────────────────────┤
  │  Name / Type / Description                     │
  │                                                │
  │  HP         ████████░░  80                     │
  │  Attack     ██████░░░░  60                     │
  │  Defense    ███████░░░  70                     │
  │  Speed      █████░░░░░  50                     │
  │  EXP        ██████████  MAX                    │
  │                                                │
  │  ← Back                                        │
  └────────────────────────────────────────────────┘
  ```
- **Stats**: HP, Attack, Defense, Speed, EXP — displayed as progress bars
- **Back navigation**: clearly labeled, returns to Pokédex

---

### 4.C Global Trade Center

#### Layout

- **Dual-column** interface

```
┌──────────────────────┬──────────────────────┐
│   Your Pokémon       │   Target Pokémon      │
│                      │                      │
│  [Card] [Card] ...   │  [Card] [Card] ...   │
│                      │                      │
│  [Dropdown ▼]        │  [Dropdown ▼]        │
│  [Search / Filter]   │  [Search / Filter]   │
├──────────────────────┴──────────────────────┤
│  Status: ● Connection Stable                │
└─────────────────────────────────────────────┘
```

- Simplified trade cards: **Image + Name only**
- Selection dropdowns for quick Pokémon matching
- Search / filter buttons per column
- Status indicator (e.g., `● Connection Stable`)

---

### 4.D Trainer Profile

| Field         | Type          | Notes                        |
| ------------- | ------------- | ---------------------------- |
| Trainer Name  | Text input    | Editable                     |
| Rank          | Select / Text | e.g., Gym Leader, Elite Four |
| Location      | Text input    | City / Region                |
| Bio           | Textarea      | Free-form description        |
| Profile Image | File upload   | Supports JPG, PNG, WebP      |

- All fields are **editable** in-place
- Profile image upload with preview

---

## 5. Technical Constraints

| Constraint | Detail                                                                |
| ---------- | --------------------------------------------------------------------- |
| Platform   | Desktop-first responsive web app                                      |
| Framework  | Next.js (App Router)                                                  |
| Styling    | Tailwind CSS v4 + CSS custom properties                               |
| Animations | CSS keyframes (`fadeIn`, `scaleIn`) — no heavy JS animation libraries |
| State      | React `useState` / `useReducer` for filter & selection state          |
| Data       | PokéAPI (`https://pokeapi.co/api/v2/`) for Pokémon data               |
| Images     | High-quality 3D renders (official artwork or PokéAPI sprites)         |
| Font       | Google Fonts — Sora                                                   |

---

## 6. Component Inventory

| Component          | Description                                      |
| ------------------ | ------------------------------------------------ |
| `<NavSidebar>`     | Persistent left navigation                       |
| `<PokemonCard>`    | Grid card with type-color bg & hover scale       |
| `<PokemonGrid>`    | 4-column responsive grid + pagination            |
| `<FilterPanel>`    | Type / Generation / Personality filters + search |
| `<DetailsOverlay>` | Full-screen fade-in detail view                  |
| `<StatBar>`        | Animated progress bar for base stats             |
| `<TradeColumn>`    | Single column in the trade interface             |
| `<TradeStatus>`    | Connection status badge                          |
| `<ProfileCard>`    | Editable trainer profile form                    |

---

## 7. Animation Spec

| Animation             | Keyframe                                 | Duration | Easing     |
| --------------------- | ---------------------------------------- | -------- | ---------- |
| Screen / overlay open | `fadeIn` (opacity 0→1, translateY 8px→0) | 300ms    | `ease`     |
| Card appear           | `scaleIn` (opacity 0→1, scale 0.96→1)    | 300ms    | `ease`     |
| Card image hover      | CSS `transform: scale(1.05)`             | 200ms    | `ease-out` |

---

## 8. File Structure (Proposed)

```
app/
├── globals.css            ← Design system tokens & utilities
├── layout.tsx             ← Root layout (Sora font, dark bg)
├── page.tsx               ← Root redirect → /pokedex
│
├── pokedex/
│   ├── page.tsx           ← Pokédex list + filter + pagination
│   └── [id]/
│       └── page.tsx       ← Pokémon details overlay
│
├── trade/
│   └── page.tsx           ← Global Trade Center
│
├── profile/
│   └── page.tsx           ← Trainer profile
│
└── components/
    ├── NavSidebar.tsx
    ├── PokemonCard.tsx
    ├── PokemonGrid.tsx
    ├── FilterPanel.tsx
    ├── DetailsOverlay.tsx
    ├── StatBar.tsx
    ├── TradeColumn.tsx
    └── ProfileCard.tsx
```
