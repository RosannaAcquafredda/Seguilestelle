---
description: "Initialize a new project: generate constitution.md, AGENTS.md, and copilot-instructions.md from functional specs"
argument-hint: "Path to the project root folder to initialize"
agent: "agent"
---

# Project Initialization — Spec-Driven Development

You are a project architect. Your task is to bootstrap the foundational project files from the functional specifications.

## Input

Project root: `$1` (defaults to current workspace root if not specified)

## Prerequisites

Before proceeding, verify:
1. Functional specs exist in `docs/specs/` — if the folder is empty or missing, **STOP immediately** and ask the user to run `/spec-brainstorm` first to generate the spec files. Do NOT proceed without specs.
2. Template exists at [template.constitution.md](../docs/templates/template.constitution.md)

## Process

### Step 1 — Read Context

- Read ALL spec files in `docs/specs/` to understand the project scope, features, actors, and tech stack.
- Read the template at `docs/templates/template.constitution.md`.
- If a `DESIGN.md` exists at root, read it for UX-UI context.

### Step 2 — Generate `constitution.md`

Create `constitution.md` at the at the /docs/specs folder, following the template structure:

- **Mission**: Synthesize the North Star objective from all specs. Describe the problem context, current pain points, and list non-negotiable principles.
- **Tech Stack**: Extract from specs or infer from existing project structure (check `pom.xml`, `package.json`, `docker-compose.yml`). Pin specific versions. Define mandatory architectural patterns and constraints.
- **Roadmap**: Generate a checklist of features derived from each spec file in `docs/specs/`, linking back to the spec filenames.

Language: Italian (matching specs).

### Step 3 — Generate `AGENTS.md`

Create `AGENTS.md` at the project root with:

- Reference to `constitution.md` as the **Costituzione SDD** (Spec-Driven Development) del progetto — the authoritative source for project mission, principles, and tech stack.
- Reference to `DESIGN.md` as the **Design UX-UI** document — the authoritative source for visual patterns, components, and interaction guidelines.
- Project-specific useful commands section (build, test, run — extracted from `pom.xml`, `package.json`, `docker-compose.yml`).
- General Agent Guidelines section with rules for: think before coding, simplicity first, surgical changes, goal-driven execution.

Structure:
```markdown
# AGENTS.md

## Documenti di Riferimento
- **Costituzione SDD**: [constitution.md](constitution.md) — Mission, principi, tech stack, roadmap
- **Design UX-UI**: [DESIGN.md](DESIGN.md) — Pattern visivi, componenti, linee guida interazione

## Comandi Utili
<!-- Extracted from project config files -->

## General Agent Guidelines
<!-- Standard behavioral rules — NON MODIFICARE questa sezione -->
```

**IMPORTANTE**: Le sezioni "General Agent Guidelines" e "CAVEMAN INSTRUCTIONS" sono universali e sempre valide. Non vanno mai modificate, rimosse o sovrascritte durante la generazione. Vanno incluse così com'è.

### Step 4 — Generate `.github/copilot-instructions.md`

Create `.github/copilot-instructions.md` contextualized for the project:

- Reference `constitution.md` for architectural decisions and tech stack constraints.
- Reference `DESIGN.md` for UI patterns and component conventions.
- Include project-specific coding conventions derived from the tech stack.
- Keep it concise — link to documents rather than duplicating content.

## Rules

- Read ALL specs before generating anything.
- All generated content in Italian.
- Do NOT invent information not present in specs or existing project files.
- If `DESIGN.md` does not exist, note its absence in AGENTS.md and suggest creating it.
- Ask for confirmation before writing files.
- Show a summary of what will be generated before proceeding.
- La sezione "CAVEMAN INSTRUCTIONS" in AGENTS.md e `.github/copilot-instructions.md` è immutabile — includerla sempre senza modifiche.

## Final Validation & Knowledge Graph Update

After all files (`constitution.md`, `AGENTS.md`, `.github/copilot-instructions.md`) have been written, ask the user to validate the final result:

> "All project initialization files have been generated. Please review them. Do you approve the final output?"

If the user confirms positively, invoke the **Second Brain Keeper** agent to update the project knowledge graph.
