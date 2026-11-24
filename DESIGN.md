# DESIGN.md — Segui le stelle

## Color Palette

### Core Surfaces & Text
- `--tlr-pagina`: `#FBFAF3` (Main page background — warm cream/ivory)[cite: 1]
- `--tlr-bianco`: `#FFFFFF` (Cards, panels, primary light surface)[cite: 1]
- `--tlr-grigio-caldo`: `#F5F2EA` (Secondary light surface, tags, disabled buttons, past events)[cite: 1]
- `--tlr-nero`: `#001c30` (Primary dark surface — hero, footer, sticky sidebar header, primary text)[cite: 1]
- `--tlr-nero-2`: `#003e66` (Secondary dark surface — hero nav tiles, active sidebar badges, slideshow bg)[cite: 1]

### Brand Accents
- `--tlr-azzurro`: `#4497B4` (Primary accent — hero subtitle, fold corner, active states, focus rings)[cite: 1]
- `--tlr-azzurro-testo`: `#236D88` (Accessible dark cyan for text links, eyebrows, counters)[cite: 1]
- `--tlr-azzurro-chiaro`: `#E4F1F6` (Light cyan hover tint for chips and document rows)[cite: 1]
- `--tlr-oro`: `#D9AE4F` (Gold accent — active slideshow dot and slideshow focus outline)[cite: 1]

### Neutral Text & Borders
- `--tlr-grigio-testo`: `#5E5E5E` (Muted text on light backgrounds)[cite: 1]
- `--tlr-grigio-su-nero`: `#A6A6A6` (Muted text on dark `#001c30` backgrounds)[cite: 1]
- `--tlr-linea`: `rgba(30, 30, 30, .12)` (Standard border / divider)[cite: 1]
- `--tlr-linea-sottile`: `rgba(30, 30, 30, .07)` (Subtle divider)[cite: 1]

### Semantic & Utility States
- **Error Banner**: background `#FFF3EF`, text `#8A2B1B`[cite: 1]
- **Event Row Hover**: `#FDFCF7`[cite: 1]
- **Dark Button Hover**: `#3A3A3A`[cite: 1]
- **Slideshow Control Overlay**: `rgba(20, 39, 31, .6)`[cite: 1]

---

## Typography

- **Primary Font**: `'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`[cite: 1]
  - Local font file: `/src/assets/fonts/inter-latin-opsz-normal.woff2` (`font-weight: 100 900`, `font-style: normal`, `font-display: swap`)[cite: 1]
- **Type Scale**:
  - **Hero Title (`.tlr-hero-tit`)**: `clamp(3.3rem, 13vw, 11rem)` / line-height `0.9` / weight `900` / letter-spacing `-0.045em`[cite: 1]
  - **Hero Subtitle (`.tlr-hero-sub`)**: `clamp(1.4rem, 3.2vw, 2.5rem)` / line-height `1.15` / weight `500` / letter-spacing `-0.02em`[cite: 1]
  - **View Title (`.tlr-vtit`)**: `clamp(2.4rem, 5.6vw, 4.5rem)` / line-height `0.95` / weight `900` / letter-spacing `-0.04em`[cite: 1]
  - **Event Detail Title (`.tlr-vtit--evento`)**: `clamp(2rem, 4.4vw, 3.5rem)` / line-height `1` / weight `900`[cite: 1]
  - **Concept Term (`.tlr-concetti dt`)**: `min(3.4rem, 9cqi)` (fallback `clamp(2rem, 4vw, 3.4rem)`) / line-height `0.95` / weight `900` / letter-spacing `-0.045em`[cite: 1]
  - **Group Heading (`.tlr-gtit`)**: `clamp(1.5rem, 2.6vw, 2rem)` / line-height `1.1` / weight `900` / letter-spacing `-0.03em`[cite: 1]
  - **Intro Lead (`.tlr-attacco`)**: `clamp(1.375rem, 2.4vw, 2rem)` / line-height `1.3` / weight `500` (`strong`: `800`) / letter-spacing `-0.02em`[cite: 1]
  - **Sidebar Heading (`.tlr-lato-tit`)**: `1.75rem` / line-height `1` / weight `900` / letter-spacing `-0.04em`[cite: 1]
  - **Event Card Title (`.tlr-ev-tit`)**: `1.25rem` / line-height `1.25` / weight `750` / letter-spacing `-0.015em`[cite: 1]
  - **Body Default (`body`)**: `1.0625rem` (`17px`) / line-height `1.55` / weight `400`[cite: 1]
  - **Body Large (`.tlr-pres-dx`, `.tlr-det-testo`)**: `1.125rem` (`18px`) / line-height `1.65–1.7`[cite: 1]
  - **Small / UI Labels**: `0.875rem` (`14px`) and `0.8125rem` (`13px`) / weight `700`[cite: 1]
  - **Micro Labels / Counters**: `0.75rem` (`12px`) / weight `800` / `font-variant-numeric: tabular-nums`[cite: 1]

---

## Layout, Spacing & Elevation

### Container & Fluid Spacing
- **Max Container Width (`.tlr-in`)**: `1320px` (centered, horizontal padding `var(--tlr-margine)`)[cite: 1]
- **Fluid Spacing Tokens**:
  - `--tlr-margine`: `clamp(16px, 4vw, 56px)` (Outer horizontal gutter)[cite: 1]
  - `--tlr-s-50`: `clamp(30px, 4vw, 50px)` (Medium vertical section gap)[cite: 1]
  - `--tlr-s-70`: `clamp(50px, 7vw, 96px)` (Large vertical section gap)[cite: 1]
- **Outer Frame Margin**: Hero and Footer panels use `16px` outer margin on viewport edges[cite: 1]

### Breakpoints
- `359px`: Narrow mobile carousel adjustment[cite: 1]
- `600px`: Event card 2-column grid (`176px 1fr`), hero tile grid switch (`50%`), brand logo scaling[cite: 1]
- `640px`: Institutional footer 2-column grid