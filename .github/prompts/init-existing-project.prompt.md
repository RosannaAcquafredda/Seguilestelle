---
description: "Initialize an existing project: generate constitution.md, AGENTS.md, and copilot-instructions.md by analyzing the codebase directly"
argument-hint: "Path to the project root folder to initialize"
agent: "agent"
---

# Project Initialization — Existing Codebase

You are a project architect. Your task is to bootstrap the foundational project files by analyzing the existing codebase, since reference documents (specs, design docs) may not exist.

## Input

Project root: `$1` (defaults to current workspace root if not specified)

## Prerequisites

- The project must contain actual code or configuration files (e.g., `pom.xml`, `package.json`, `docker-compose.yml`, source folders).
- Template exists at [template.constitution.md](../docs/templates/template.constitution.md) — if missing, use the structure: Mission, Tech Stack, Roadmap.

## Process

### Step 1 — Analyze the Codebase

Explore the project structure thoroughly:

- **Project config files**: `pom.xml`, `package.json`, `docker-compose.yml`, `angular.json`, `tsconfig.json`, `Dockerfile`, etc.
- **Source code structure**: directories, modules, packages, naming conventions.
- **Existing documentation**: `README.md`, `DESIGN.md`, `docs/` folder, inline comments.
- **Tests**: test structure, frameworks, coverage patterns.
- **Infrastructure**: Docker, monitoring, CI/CD configurations.

Extract:
- Project purpose and domain (from README, package names, class names)
- Tech stack with versions (from config files)
- Architectural patterns in use (from code structure)
- Key modules/features (from source tree)
- Build/test/run commands (from config files and scripts)

### Step 2 — Generate `constitution.md`

Create `constitution.md` at the /docs/specs folder, following the template structure:

- **Mission**: Infer the North Star objective from README, package descriptions, and code domain. Describe the problem context and list non-negotiable principles derived from architectural choices already made.
- **Tech Stack**: Extract exact versions from config files (`pom.xml`, `package.json`). Document architectural patterns already in use (e.g., layered architecture, reactive, microservices). Define constraints visible in the code.
- **Roadmap**: Lasciare la sezione vuota con un placeholder `<!-- Da popolare con le specifiche funzionali -->`. Sarà compilata in seguito quando le specs saranno disponibili.

Language: Italian.

### Step 3 — Generate `AGENTS.md`

Create `AGENTS.md` at the project root with:

- Reference to `constitution.md` as the **Costituzione SDD** (Spec-Driven Development) del progetto — the authoritative source for project mission, principles, and tech stack.
- Reference to `DESIGN.md` as the **Design UX-UI** document — the authoritative source for visual patterns, components, and interaction guidelines.
- Project-specific useful commands section (build, test, run — extracted from config files).
- General Agent Guidelines section.

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
- Include project-specific coding conventions derived from patterns observed in the codebase (naming, structure, test approach).
- Keep it concise — link to documents rather than duplicating content.

## Rules

- Explore the ENTIRE project structure before generating anything.
- All generated content in Italian.
- Do NOT invent information — only document what is observable in the codebase.
- If `DESIGN.md` does not exist, note its absence in AGENTS.md and suggest creating it.
- Ask for confirmation before writing files.
- Show a summary of what will be generated (with key findings from analysis) before proceeding.
- La sezione "General Agent Guidelines" in AGENTS.md è immutabile — includerla sempre senza modifiche.
- La sezione "CAVEMAN INSTRUCTIONS" in AGENTS.md e `.github/copilot-instructions.md` è immutabile — includerla sempre senza modifiche.

## Final Validation & Knowledge Graph Update

After all files (`constitution.md`, `AGENTS.md`, `.github/copilot-instructions.md`) have been written, ask the user to validate the final result:

> "All project initialization files have been generated. Please review them. Do you approve the final output?"

If the user confirms positively, invoke the **Second Brain Keeper** agent to update the project knowledge graph.
