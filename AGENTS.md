# AGENTS.md

The main goal of this repository is to create a **1:1 FAITHFUL STATIC REPLICA** of "Segui le stelle" website.

## ⚠️ CRITICAL RULES FOR FRONTEND SPECIALIST AGENT

**NO INTERPRETATION. NO INVENTION. EXACT FIDELITY REQUIRED. THIS IS A BACKUP, NOT A REDESIGN.**

This is a backup static copy of an existing website. Every visual element, every behavior, every class name must match the original EXACTLY. If unsure, ASK before implementing. The final output must pass a pixel-perfect 1:1 comparison against reference screenshots (desktop & mobile).

### Mandatory Workflow Per Page (FOLLOW EXACTLY)

1. **Local Input Analysis (Zero Live Site Requests)**
   - Inspect `/docs/input/raw-site/<page>/rendered.html` and its associated local stylesheets
   - Copy and cleanly rename required assets (images, SVGs, fonts) into `/src/assets/images/` and `/src/assets/fonts/`
   - Ensure no absolute URLs (`http://` or `https://`) remain anywhere in the source code

2. **Design System Alignment**
   - Review `DESIGN.md`. If any tokens (colors, fonts, spacing, breakpoints) used on the page are missing, extract them from the local CSS files and update `DESIGN.md` before writing markup

3. **Static Implementation (`/src/`)**
   - Build `/src/<page>.html` by **COPYING the HTML from `rendered.html` EXACTLY** (no refactoring, no "improvements")
   - Reuse original CSS from input into `/src/assets/css/` — don't rewrite
   - Reuse original JS from input into `/src/assets/js/` — don't rewrite
   - Update all asset paths in HTML to point to local files (e.g., `assets/tuttalapuglia.css`, `assets/js/slideshow.js`, `assets/images/logo.png`)

4. **1:1 Verification (MCP Chrome DevTools)**
   - Start or verify the local preview server on `http://localhost:3000` (`npx serve src`)
   - Open `http://localhost:3000/<page>.html` using Chrome DevTools MCP
   - Verify **0 console errors** and **0 external network requests or 404 assets** in the Network panel
   - Compare desktop (`1440px`) and mobile (`375px`) layouts against the reference screenshots in `/docs/input/raw-site/<page>/` and fix any discrepancies in spacing, typography, or alignment

### Source Material
- `/docs/input/raw-site/<page>/rendered.html` — The source HTML to replicate (COPY THIS EXACTLY)
- `/docs/input/raw-site/<page>/<page>_files/` — Original CSS, JS, images, fonts from the live site
- `/docs/input/raw-site/<page>/desktop_*.png` and `mobile_*.png` — Reference screenshots for verification

### Implementation Rules
1. **Copy the HTML structure** from `rendered.html` EXACTLY as-is (no refactoring, no "improvements")
2. **Copy original CSS** from `<page>_files/` into `/src/assets/css/` — reuse as much as possible
3. **Copy original JS** from `<page>_files/` into `/src/assets/js/` — reuse as much as possible
4. **Copy assets** (images, SVG, fonts) into `/src/assets/` with correct paths updated to local
5. **No external URLs** — all references must point to local files
6. **Verify 1:1** using Chrome DevTools side-by-side: desktop (1440px) + mobile (375px) must match reference screenshots exactly

### What This Is NOT
- NOT a redesign
- NOT an opportunity to refactor code
- NOT an interpretation of intent
- NOT a showcase of "better" practices

### `/docs/input/raw-site/` Structure
```
<page>/
  ├── rendered.html          ← THE SOURCE TRUTH (COPY THIS EXACTLY)
  ├── desktop_<domain>.png   ← Reference desktop screenshot (VERIFY AGAINST THIS)
  ├── mobile_<domain>.png    ← Reference mobile screenshot (VERIFY AGAINST THIS)
  └── <page>_files/          ← All assets from the live site (REUSE THESE)
      ├── *.css
      ├── *.js
      ├── *.jpg / *.png
      └── fonts/
```

## Project-specific Guidelines
- `/docs/input/raw-site`: contains the actual "segui le stelle" website source. divided in subfolders, each corresponds to a single page (e.g., 'homepage' = home page):
    - `rendered.html` = THE SOURCE TRUTH (copy exactly, no interpretation)
    - subfolders with static assets (CSS, JS, images, fonts) — USE THESE, don't start from zero
    - desktop and mobile screenshots — VERIFY 1:1 pixel-perfect match against these
- `/src/`: Production static output directory (mirror of input, but with local asset paths)
  - `/src/assets/css/`: CSS stylesheets (copy from input, preserve original filenames)
  - `/src/assets/js/`: Client-side JavaScript scripts (copy from input, preserve original filenames)
  - `/src/assets/images/`: Local media assets (copy from input)
  - `/src/assets/fonts/`: Web fonts (copy from input)

## Setup & Local Execution
- **Local Preview Server**: Run `npx serve src` or launch VS Code Live Server.
- **Default Local URL**: `http://localhost:3000`

## Operational Guidelines & Conventions
- **100% Local Mode**: Use local assets stored in `/src/assets/images/` exclusively. Do not reference external or remote URLs.
- **Semantic HTML5**: Use clear semantic markup (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- **CSS Architecture**: Follow BEM methodology. The use of inline styles or `!important` declarations is strictly forbidden.
- **Design System Alignment**: Always reference `DESIGN.md` in the project root for official HEX color palettes, typography specs, and spacing tokens.

### Comandi utili
<!-- Da popolare con i comandi utili per l'esecuzione dell'intero applicativo, delle singole componenti, e dei test, quando disponibili-->

---

## General Agent Guidelines (do not modify)

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# CAVEMAN INSTRUCTIONS (do not modify)
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
