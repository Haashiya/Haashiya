---
name: design-to-code
description: Translates UI/UX design mockups (images) into production-ready Next.js components for the Haashiya project. Activate when the user sends a design image, screenshot, or Figma export and asks to implement it.
---

# Design-to-Code Workflow for Haashiya

## 1. Design Intake Protocol

When the user sends a design image:

1. **View the image** using `view_file` to understand the full layout.
2. **Compare against the existing spec sheet** at `spec-sheet-homepage-haashiya.md` in the project root.
3. **Identify every component** visible in the design — map each one to an existing component or flag it as new.
4. **Ask clarifying questions** ONLY if there is genuine ambiguity (e.g., an interaction pattern that isn't clear from static mockups). Do NOT ask about things you can infer.

## 2. Project Architecture (Mandatory Knowledge)

```
src/
├── app/                    # Next.js App Router (v16)
│   ├── layout.tsx          # Root layout — RTL, fonts loaded here
│   ├── globals.css         # Design system tokens + resets + utilities
│   └── page.tsx            # Homepage assembly
├── components/
│   ├── layout/             # Structural: Navbar, Footer
│   └── ui/                 # Presentational: Hero, SectionTitle, ServiceCard, ResourceItem, GlossarySearch
├── assets/styles/          # Component-level CSS modules go here
├── config/                 # App configuration (empty, ready for use)
├── features/               # Feature-specific logic (empty, ready for use)
├── lib/                    # Utilities and API helpers
│   ├── api/
│   └── utils/
└── types/                  # TypeScript type definitions
public/
└── images/                 # Static assets: hero_bg, footer_bg, logos
```

### Tech Stack
- **Next.js 16.3.4** (App Router, React 19, TypeScript)
- **Vanilla CSS** — no Tailwind, no CSS-in-JS
- **CSS Modules** for component-scoped styles (`.module.css`)
- **Google Fonts** via `next/font/google`: Work Sans (Latin) + IBM Plex Sans Arabic (Arabic)

### Critical Conventions
- **RTL layout**: `<html dir="rtl" lang="ar">` — use CSS logical properties (`margin-inline-start`, `padding-inline-end`, etc.), NEVER `margin-left`/`margin-right`.
- **Mobile-first**: `max-width: 480px` mobile container, centered with shadow on desktop.
- **8px spacing system**: All spacing as multiples of 8 (`--spacing-1` through `--spacing-8`).
- **CSS variables only**: Colors, typography, spacing all via `globals.css` `:root` variables.
- **Arabic font for all content text**: Only use `--font-latin` (Work Sans) for Latin-script text like "PDF", "DOCX", dates, usernames.

## 3. Design System Tokens (from globals.css)

### Colors
```
--color-primary-500: #2471ea    (buttons, interactive)
--color-primary-600: #1359c8    (brand base)
--color-primary-700: #2471ea    (gradients, footer)
--color-primary-hero-start: #0f459b  (hero gradient top)
--color-ink: #061b3c            (headings, dark text)
--color-stone: #9f9893          (meta text, secondary)
--color-surface: #ffffff        (cards, backgrounds)
--color-surface-tint: #f0f6ff   (alternating section bg)
--color-white-text: #ffffff     (text on blue)
```

### Typography Scale (spec-sheet values — these are the SOURCE OF TRUTH)
```
H1:     56px / 700 / 1.3   (hero title)
H2:     37px / 700 / 1.3   (section titles)
H3:     27px / 600 / 1.4   (card titles, list item titles)
Body:   16px / 400 / 1.6   (descriptions)
Meta:   16px / 400 / 1.4   (category labels, dates)
Button: 27px / 600 / 1     (button text)
```

> ⚠️ NOTE: The globals.css currently has SMALLER values (h1: 32px, h2: 22px, etc.) that DON'T match the spec sheet. When implementing designs, ALWAYS use the spec-sheet values above. Update globals.css if needed.

### Spacing
```
--spacing-1: 8px   --spacing-2: 16px  --spacing-3: 24px  --spacing-4: 32px
--spacing-5: 40px  --spacing-6: 48px  --spacing-7: 56px  --spacing-8: 64px
```

## 4. Existing Components Reference

| Component | File | Purpose |
|---|---|---|
| Navbar | `components/layout/Navbar.tsx` | Sticky top bar, logo + login button |
| Footer | `components/layout/Footer.tsx` | Blue gradient bg, logo, credits |
| Hero | `components/ui/Hero.tsx` | Full-width hero with gradient bg |
| SectionTitle | `components/ui/SectionTitle.tsx` | Centered `<h2>` for sections |
| ServiceCard | `components/ui/ServiceCard.tsx` | 2-column grid cards with photo + overlay |
| ResourceItem | `components/ui/ResourceItem.tsx` | Parallelogram list items with badge |
| GlossarySearch | `components/ui/GlossarySearch.tsx` | Search box inside blue container |

## 5. Implementation Procedure

When creating or modifying a component from a design:

### Step A: CSS Module First
1. Create `src/assets/styles/ComponentName.module.css`
2. Use design system variables — NEVER hardcode colors/sizes
3. Use CSS logical properties for RTL compatibility
4. Implement signature design elements faithfully (e.g., parallelogram clip-path)

### Step B: Component TSX
1. Place in the appropriate directory (`components/layout/` or `components/ui/`)
2. Props should be typed — define interfaces in the component file or `src/types/`
3. Use semantic HTML (`<nav>`, `<section>`, `<article>`, `<footer>`, etc.)
4. Include `aria-` attributes for accessibility
5. Keep components presentational — logic goes in `features/` or `lib/`

### Step C: Integration
1. Import into the page file (`src/app/page.tsx` or relevant route)
2. Follow the existing assembly pattern: components composed inside `<div className="mobile-container">`
3. Inline styles for one-off layout (grid, flex containers) are acceptable per existing patterns

### Step D: Verification
1. Run `npm run dev` to verify rendering
2. Screenshot the result using browser tools
3. Compare side-by-side with the original design
4. Fix pixel-level discrepancies

## 6. Design Signature Elements (NEVER simplify these)

1. **Parallelogram/skewed list items** — `clip-path: polygon(20px 0, 100% 0, 100% 100%, 0 100%)` or skewX pseudo-elements
2. **Blue gradient overlays** on service card photos
3. **Pill-shaped buttons** — `border-radius: 24px`
4. **RTL arrow direction** — arrows point LEFT (←) in this RTL context

## 7. Asset Handling

- **Static images**: Place in `public/images/`, reference as `/images/filename.ext`
- **Generated assets**: Use `generate_image` tool if placeholder images are needed, then save to `public/images/`
- **SVG icons**: Inline SVGs preferred for small icons (arrows, plus signs)
- **Existing assets**: `hero_bg.png`, `footer_bg.png`, `navbar_logo.png`, `footer_logo.png`

## 8. Quality Checklist

Before marking a design implementation as complete:
- [ ] All CSS uses design system variables (no magic numbers)
- [ ] RTL renders correctly (text alignment, flex direction, margins)
- [ ] Arabic font renders for Arabic text, Work Sans for Latin text
- [ ] Mobile container respects 480px max-width
- [ ] Semantic HTML with proper heading hierarchy
- [ ] Interactive elements have hover/focus states
- [ ] Matches the design mockup at pixel-level fidelity
- [ ] No TypeScript errors, no ESLint warnings
- [ ] Project builds successfully (`npm run build`)
