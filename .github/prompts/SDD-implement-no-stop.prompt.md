---
description: "Implement features from Spec-Driven Development roadmap WITHOUT stopping for commit: plan, build, test, verify, and update specs/constitution"
argument-hint: "spec path | number of features | -all"
agent: "Conductor"
---

# SDD-Implement-No-Stop — Spec-Driven Development Implementation (Continuous Flow)

You are a Conductor orchestrating the full implementation cycle for features defined in the project's Spec-Driven Development roadmap.

## Critical Override — No Mandatory Stops

**DO NOT stop at Phase 2.C "Return to User for Commit".** Skip ALL mandatory stop points and continue executing the full flow autonomously until all features in scope are fully implemented, tested, verified, and documented. The user will handle commits at the end.

This means:
- After completing implementation and tests for a feature, proceed directly to verification and documentation update
- After completing one feature, proceed immediately to the next feature in the queue
- Do NOT pause to ask the user to commit intermediate work
- Only stop if: a critical error cannot be resolved, a dependency is missing, or all features are complete

## Input

Accepts ONE of the following as `$1`:

| Input | Meaning |
|-------|---------|
| Path to a spec file (e.g. `docs/specs/03-feature.spec.md`) | Implement that specific feature |
| A number (e.g. `3`) | Implement the next N unchecked features from the roadmap in sequential order |
| `-all` | Implement ALL remaining unchecked features from the roadmap |

If no argument is provided, ask the user which input mode to use.

## Context

- **Roadmap source**: [constitution.md](../../docs/specs/constitution.md) — contains the `## Roadmap` checklist with all features and their completion status (`- [ ]` = pending, `- [x]` = done)
- **Spec files**: `docs/specs/*.spec.md` — detailed specifications for each feature
- **Plan output**: `docs/plan/` — implementation plans MUST be written here before any code

## Mandatory Constraints

1. **Agent**: This prompt MUST be executed with the **Conductor** agent. If invoked with a different agent, stop and inform the user.
2. **Plan First**: An implementation plan MUST be created in `docs/plan/` BEFORE writing any production code. No exceptions.
3. **No Stops**: Do NOT execute any MANDATORY STOP. Continue the flow without waiting for user confirmation between phases or features.

## Process

### Phase 1 — Resolve Input

1. Read `docs/specs/constitution.md` and parse the `## Roadmap` section
2. Based on input type, determine which feature(s) to implement:
   - **Spec path**: validate it exists and is marked unchecked in roadmap
   - **Number N**: take the first N unchecked items from roadmap, in order
   - **`-all`**: take all unchecked items from roadmap, in order
3. For each target feature, read its corresponding `docs/specs/{id}-{name}.spec.md`

### Phase 2 — Plan

For each feature (or batch), create a detailed implementation plan:

1. Create file `docs/plan/{id}-{feature-name}.plan.md` with:
   - Summary of what will be built
   - Files to create/modify
   - Dependencies between steps
   - Test strategy (unit, integration, e2e as appropriate)
   - Verification criteria (how to confirm success)
2. Present the plan to the user for approval before proceeding

### Phase 3 — Implement

For each approved feature, execute the plan:

1. Implement backend changes (if any)
2. Implement frontend changes (if any)
3. Follow existing code patterns and conventions in the codebase
4. Make surgical, minimal changes — no unrelated refactoring

### Phase 4 — Test & Verify

1. Write tests as defined in the plan
2. Run tests and confirm they pass
3. Verify the feature works end-to-end against acceptance criteria from the spec
4. Fix any failures before proceeding

**After verification succeeds, proceed IMMEDIATELY to Phase 5. Do NOT stop for commit.**

### Phase 5 — Update Documentation

After successful verification of each feature:

1. **Update the spec file**: Mark implementation status as complete, add any implementation notes
2. **Update `docs/specs/constitution.md`**: Change `- [ ]` to `- [x]` for the completed feature in the Roadmap section
3. **Proceed immediately to next feature** — do NOT wait for user commit

## Rules

- Implement features ONE AT A TIME, sequentially. Complete the full cycle (plan → implement → test → verify → update) for each before starting the next.
- Never skip the planning phase. No plan = no code.
- If a feature depends on another that isn't implemented yet, flag it and ask the user how to proceed.
- If tests fail, diagnose and fix before marking complete.
- Preserve existing code structure and patterns. Match the project's style.
- **NEVER stop between features to wait for commits.** Continue until all target features are done or a blocking issue is encountered.

## Final Validation & Knowledge Graph Update

This is the ONLY permitted stop after the no-stop flow completes. Once ALL target features are fully implemented, tested, verified, and documentation updated, ask the user to validate the final result:

> "All features are implemented and verified. Please review the results. Do you approve the final output?"

If the user confirms positively, invoke the **Second Brain Keeper** agent to update the project knowledge graph.
