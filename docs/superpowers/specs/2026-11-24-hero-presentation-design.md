# Hero + Presentation Sections — Design

## Scope & Goals

**Goal:** Build a 1:1 replication of the homepage hero and presentation sections using semantic HTML5, BEM CSS, and vanilla JS (no external dependencies).

**Sections Covered:**
1. **Hero Section** — Slideshow carousel with city navigation
2. **Presentation Section** — Intro text + concepts carousel

**What's NOT in this phase:** Events sidebar, event grid, footer.

---

## Approach

**Single sensible approach:** Build from local `/docs/input/raw-site/homepage/rendered.html` reference + design tokens in `DESIGN.md`.

1. **Copy assets** — Move images (slider JPGs, logo) into `/src/assets/images/`
2. **Build semantic structure** — Header + main with sections
3. **Write BEM CSS** — Type scale, spacing, layout (responsive via clamp)
4. **Implement carousel JS** — Slideshow autoplay, prev/next, dots; city nav scroll
5. **Verify locally** — Zero console errors, all images load, desktop (1440px) + mobile (375px) match reference screenshots

---

## Design Decisions

### File Structure
- `/src/index.html` — Full page (will add footer/events later)
- `/src/assets/css/style.css` — All styles (single file for now)
- `/src/assets/js/carousel.js` — Slideshow + nav scroll behavior
- `/src/assets/images/` — Logos, slider images, SVGs

### Hero Section
- **Slideshow:** 9 slider images, autoplay (5s), manual prev/next, dot indicators
- **City Nav:** Horizontal scrollable list with progress bar (shows scroll position)
- **Branding:** "PUGLIA" text + region logo, centered above slideshow
- **Typography:** Hero title (`.tlr-hero-tit`, `clamp(3.3rem, 13vw, 11rem)`, weight 900, letter-spacing -0.045em)
- **Subtitle:** "Scopri il programma..." (`.tlr-hero-sub`, `clamp(1.4rem, 3.2vw, 2.5rem)`)

### Presentation Section
- **Intro Text:** 3 paragraphs (`.tlr-attacco`, `clamp(1.375rem, 2.4vw, 2rem)`, weight 500)
- **Concepts Carousel:** 6 cards (terms + descriptions), horizontal scroll with nav buttons + progress bar
- **Responsive Grid:** Left column for intro (desktop), full width stacked (mobile)

### Colors & Tokens
- Background: `--tlr-pagina` (#FBFAF3)
- Text: `--tlr-nero` (#001c30)
- Accents: `--tlr-azzurro` (#4497B4)
- Borders: `--tlr-linea` (rgba subtle)

### Spacing
- Outer gutter: `--tlr-margine` (clamp 16px–56px)
- Section gaps: `--tlr-s-50` (clamp 30px–50px), `--tlr-s-70` (clamp 50px–96px)
- Container max: 1320px

---

## Implementation Plan

1. ✅ Analyze reference HTML & extract markup structure
2. ✅ Create `/src/index.html` with semantic sections
3. ✅ Copy slider images + logo to `/src/assets/images/`
4. ✅ Write `/src/assets/css/style.css` (design tokens, BEM classes)
5. ✅ Build `/src/assets/js/carousel.js` (slideshow autoplay, manual controls, scroll sync)
6. ✅ Start local server (`npx serve src`)
7. ✅ Verify: 0 console errors, all images load, responsive layouts match desktop/mobile screenshots
8. ✅ Compare side-by-side: hero + presentation visually match reference

---

## Success Criteria

- ✅ No external URLs in HTML/CSS/JS
- ✅ Slideshow auto-rotates every 5s, manual controls work
- ✅ City nav scrolls, progress bar tracks position
- ✅ Concepts carousel scrolls horizontally (desktop + mobile)
- ✅ Typography scales smoothly via clamp() (responsive without media queries)
- ✅ Desktop layout (1440px): matches reference screenshot
- ✅ Mobile layout (375px): matches reference screenshot
- ✅ 0 console errors in Chrome DevTools
