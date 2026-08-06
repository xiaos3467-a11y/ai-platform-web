# AI Platform Design System

> **Version**: 1.0.0 · **Last Updated**: 2026-08-05
> **Stack**: React 18 · TypeScript · Ant Design 5 · Vite
> **Aesthetic**: Apple-inspired — clean, modern, generous whitespace

---

## Design Principles

| Principle | Description |
|-----------|-------------|
| **简洁 Clarity** | Remove noise; every element earns its place |
| **层次 Depth** | Use glass surfaces, elevation, and translucency to create spatial hierarchy |
| **动效 Motion** | Spring-physics easing; purposeful, never decorative |
| **一致 Consistency** | Same tokens everywhere — one source of truth |
| **可达 Accessibility** | WCAG 2.1 AA; respect `prefers-reduced-motion` |

---

## Table of Contents

1. [Color System](#1-color-system)
2. [Typography](#2-typography)
3. [Spacing](#3-spacing)
4. [Border Radius](#4-border-radius)
5. [Elevation & Shadows](#5-elevation--shadows)
6. [Motion & Animation](#6-motion--animation)
7. [Component Patterns](#7-component-patterns)
8. [Dark / Light Theme](#8-dark--light-theme)
9. [Accessibility](#9-accessibility)

---

## 1. Color System

### 1.1 Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-blue` | `#0a84ff` (dark) / `#0071e3` (light) | Primary actions, links, focus rings |
| `--brand-purple` | `#5e5ce6` | Gradient endpoints, premium accents |
| `--brand-violet` | `#bf5af2` | Logo gradient, creative accents |

### 1.2 Semantic Colors

| Semantic | Dark | Light | Meaning |
|----------|------|-------|---------|
| Success | `#30d158` | `#34c759` | Positive outcomes, healthy states |
| Warning | `#ffd60a` | `#ff9f0a` | Attention needed |
| Error | `#ff453a` | `#ff3b30` | Destructive actions, failures |
| Info | `#0a84ff` | `#0071e3` | Informational indicators |

### 1.3 Neutral / Text

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| Text Primary | `#f5f5f7` | `#1d1d1f` | Headings, body emphasis |
| Text Secondary | `rgba(255,255,255,0.45)` | `rgba(0,0,0,0.45)` | Descriptions, labels |
| Text Tertiary | `rgba(255,255,255,0.25)` | `rgba(0,0,0,0.3)` | Placeholders, hints |
| Text Muted | `rgba(255,255,255,0.35)` | `rgba(0,0,0,0.35)` | Disabled, metadata |

### 1.4 Surface Colors

| Surface | Dark | Light | Usage |
|---------|------|-------|-------|
| Canvas | `#000000` | `#f5f5f7` | Page background |
| Card | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.80)` | Glass cards |
| Elevated | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.03)` | Popovers, dropdowns |
| Spotlight | `rgba(255,255,255,0.12)` | — | Active nav, highlights |

### 1.5 Gradient Recipes

```css
/* Primary action gradient */
--gradient-primary: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%);

/* Success */
--gradient-success: linear-gradient(135deg, #30d158 0%, #34c759 100%);

/* Warning */
--gradient-warning: linear-gradient(135deg, #ffd60a 0%, #ff9f0a 100%);

/* Error */
--gradient-error: linear-gradient(135deg, #ff453a 0%, #ff6961 100%);

/* Logo / brand */
--gradient-brand: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 50%, #bf5af2 100%);

/* Chart palette */
--chart-1: #0a84ff;
--chart-2: #30d158;
--chart-3: #ffd60a;
--chart-4: #ff453a;
--chart-5: #5e5ce6;
--chart-6: #64d2ff;
```

---

## 2. Typography

### 2.1 Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
             'Inter', 'Helvetica Neue', 'PingFang SC', 'Noto Sans SC', sans-serif;
```

### 2.2 Type Scale

| Level | Size | Weight | Letter Spacing | Line Height | Usage |
|-------|------|--------|----------------|-------------|-------|
| Display | 44px | 700 | −0.04em | 1.1 | Login hero |
| H1 | 40px | 700 | −0.04em | 1.2 | Page titles |
| H2 | 34px | 700 | −0.04em | 1.2 | Section headers |
| H3 | 28px | 600 | −0.03em | 1.2 | Sub-sections |
| H4 | 22px | 600 | −0.03em | 1.3 | Card titles |
| H5 | 17px | 600 | −0.02em | 1.4 | Component titles |
| Body | 14px | 400 | −0.01em | 1.57 | Default text |
| Small | 13px | 400 | 0.00em | 1.5 | Metadata, labels |
| Caption | 12px | 500 | 0.02em | 1.4 | Badges, tags |
| Micro | 11px | 500 | 0.02em | 1.3 | Version numbers |

### 2.3 Number Display

```css
/* Stat card numbers */
.stat-value {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* Inline data */
.data-value {
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
```

---

## 3. Spacing

Based on a **4px** fundamental unit.

| Token | Value | Usage |
|-------|-------|-------|
| `space-0.5` | 2px | Tight icon gaps |
| `space-1` | 4px | Minimum padding |
| `space-2` | 8px | Inline icon gaps, small padding |
| `space-3` | 12px | Form field gaps |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Card gaps (Row gutter) |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Page title → content |
| `space-10` | 40px | Hero spacing |
| `space-12` | 48px | Large section gaps |

### Layout Grid

- **Row gutter**: 20px (horizontal + vertical)
- **Page margin**: 28px
- **Content max-width**: none (fluid)
- **Card body padding**: 24px
- **Stat card padding**: 24px 28px

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-xs` | 6px | Tags, badges |
| `radius-sm` | 8px | Small elements, icon actions |
| `radius-md` | 10px | Buttons, inputs, pills |
| `radius-lg` | 12px | Standard cards, tooltips |
| `radius-xl` | 16px | Glass cards, modals |
| `radius-2xl` | 20px | Large modals |
| `radius-3xl` | 24px | Hero cards, login |
| `radius-full` | 999px | Circular avatars, toggles |

---

## 5. Elevation & Shadows

### 5.1 Shadow Scale

| Level | Dark | Light | Usage |
|-------|------|-------|-------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.3)` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle lift |
| `shadow-sm` | `0 2px 8px rgba(0,0,0,0.3)` | `0 2px 8px rgba(0,0,0,0.06)` | Cards |
| `shadow-md` | `0 8px 24px rgba(0,0,0,0.4)` | `0 8px 24px rgba(0,0,0,0.08)` | Popovers |
| `shadow-lg` | `0 16px 48px rgba(0,0,0,0.5)` | `0 16px 48px rgba(0,0,0,0.12)` | Modals |
| `shadow-xl` | `0 24px 64px rgba(0,0,0,0.4)` | `0 24px 64px rgba(0,0,0,0.15)` | Hero cards |

### 5.2 Glass Surfaces

```css
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: saturate(180%) blur(20px);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
}
```

### 5.3 Focus Ring

```css
:focus-visible {
  outline: 2px solid rgba(0, 122, 255, 0.6);
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 6. Motion & Animation

### 6.1 Easing Curves

| Name | Value | Usage |
|------|-------|-------|
| Standard | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| Decelerate | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter animations |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy feedback |
| Linear | `linear` | Spinners, progress |

### 6.2 Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 100ms | Hover states, active press |
| `duration-fast` | 200ms | Color transitions |
| `duration-normal` | 300ms | Transform transitions |
| `duration-slow` | 400ms | Entrance animations |
| `duration-slower` | 500ms | Page transitions |

### 6.3 Entrance Animations

```css
/* Fade in — opacity only */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Fade up — entrance from below */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scale in — popover appear */
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

/* Number count-up handled by AnimatedNumber component */
```

### 6.4 Interaction Patterns

| Action | Animation | Duration | Easing |
|--------|-----------|----------|--------|
| Button hover | `translateY(-1px)` + shadow increase | 200ms | Decelerate |
| Button press | `scale(0.97)` | 100ms | Standard |
| Card hover | `translateY(-2px)` + shadow increase | 300ms | Decelerate |
| Card press | `scale(0.99)` | 100ms | Standard |
| Nav item hover | Background fade | 200ms | Standard |
| Toggle slide | `left` transition + icon crossfade | 400ms | Spring |

### 6.5 Stagger Pattern

```css
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.10s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
/* ... up to 8 items */
```

### 6.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Component Patterns

### 7.1 Stat Card

- Glass card background (`--bg-card`)
- 0.5px subtle border
- 44×44 gradient icon badge with 14px radius
- 36px tabular-nums value
- 13px secondary label with 0.02em letter spacing
- Hover: `translateY(-2px)` + shadow increase

### 7.2 Section Card

- Glass card + header separator (0.5px `--border-divider`)
- Title: 17px semibold + optional subtitle in 13px muted
- Optional leading icon in brand blue
- Header padding: 16px 24px
- Body padding: 24px

### 7.3 Buttons

| Variant | Background | Border | Text |
|---------|-----------|--------|------|
| Primary | `var(--gradient-primary)` | none | `#fff` |
| Secondary | `var(--bg-elevated)` | `var(--border-subtle)` | `var(--text-primary)` |
| Ghost | transparent | none | `var(--text-secondary)` |
| Danger | `var(--gradient-error)` | none | `#fff` |

All: 10px radius, 40px height, 500 weight, scale(0.97) on active.

### 7.4 Inputs

- 10px radius, 40px height (48px large)
- Background: `var(--bg-elevated)`
- Border: `var(--border-subtle)` → `#0a84ff` on focus
- Focus shadow: `0 0 0 3px rgba(10,132,255,0.15)`
- Error border: `#ff453a` + `0 0 0 3px rgba(255,69,58,0.1)`

### 7.5 Status Pill

- 8px radius, 0.5px colored border
- 12px semibold text
- Tinted background at 8% opacity
- Dot + icon pattern

### 7.6 Empty State

- 64×64 icon badge (20px radius, glass background)
- 15px title, 13px description
- Centered with 80px vertical padding
- Optional primary CTA button

### 7.7 Chat Bubble

- User: gradient primary background, rounded `16px 16px 4px 16px`
- Assistant: glass background, rounded `16px 16px 16px 4px`
- 28×28 avatar badge (9px radius, gradient fill)
- 13px body text, 1.6 line height

---

## 8. Dark / Light Theme

### 8.1 Switching Mechanism

- `ThemeProvider` manages `mode` state → persists to `localStorage`
- Adds/removes `light` class on `<html>`
- CSS custom properties flip via `html.light` selector
- AntD `ConfigProvider` swaps between `darkTokens` / `lightTokens`

### 8.2 Token Architecture

```
src/styles/
  ├── global.css          ← CSS custom properties (--text-primary, --bg-card, etc.)
  └── themeTokens.ts      ← AntD component token overrides (darkTokens / lightTokens)

src/contexts/
  └── theme.tsx           ← ThemeProvider, useTheme(), useThemeTokens()
```

### 8.3 Key Differences

| Aspect | Dark | Light |
|--------|------|-------|
| Canvas | `#000000` (pure black) | `#f5f5f7` (Apple gray) |
| Card BG | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.80)` |
| Borders | white at 6–12% | black at 6–8% |
| Shadows | deep, dark, diffuse | light, subtle |
| Sidebar | `rgba(22,22,24,0.82)` glass | `rgba(255,255,255,0.78)` glass |
| Header | `rgba(0,0,0,0.72)` glass | `rgba(255,255,255,0.72)` glass |

---

## 9. Accessibility

### 9.1 Color Contrast

All text/background combinations must pass WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).

### 9.2 Keyboard Navigation

- All interactive elements are tabbable
- `:focus-visible` ring uses brand blue at 60% opacity
- Sidebar collapsible toggle supports Enter/Space

### 9.3 Motion Sensitivity

`prefers-reduced-motion: reduce` disables all animations globally.

### 9.4 Screen Reader

- Icon-only buttons have `aria-label`
- Status indicators have textual equivalents
- Error boundary provides actionable messaging

---

## File Reference

| File | Purpose |
|------|---------|
| `src/styles/global.css` | CSS custom properties, animations, utility classes |
| `src/styles/themeTokens.ts` | AntD ConfigProvider token overrides |
| `src/contexts/theme.tsx` | Theme state management + context |
| `src/components/` | Shared UI components (GlassCard, StatCard, etc.) |
| `design/exports/` | Design resources (icons, illustrations, swatches) |

---

*This document is the single source of truth for the AI Platform design system. All UI decisions should reference it.*
