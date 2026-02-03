---
name: code-simplifier
description: Simplifies recently written or modified code for clarity, consistency, and maintainability while preserving all functionality. Applies project best practices (e.g. from CLAUDE.md when present), reduces nesting, avoids nested ternaries, and prefers explicit naming. Use after completing a coding task, implementing a feature, fixing a bug, or refactoring; focus only on recently modified code unless the user requests a broader scope.
---

# Code Simplifier

## When to Apply

Trigger this skill automatically after:

- Implementing a new feature or logical chunk of code
- Fixing a bug (e.g. adding conditional checks)
- Completing a refactor or performance optimization
- Any coding task that has just been completed

**Scope**: Refine only recently modified or touched code in the current session, unless the user explicitly asks for a broader review.

---

## Core Principles

### 1. Preserve Functionality

- Never change what the code does—only how it does it.
- All original features, outputs, and behaviors must remain intact.
- Do not remove or alter behavior to “simplify.”

### 2. Apply Project Standards

When present, follow **CLAUDE.md** and project conventions. Common defaults:

- ES modules with sorted imports and extensions where used
- Prefer `function` keyword over arrow functions for top-level functions
- Explicit return type annotations for top-level functions
- React: explicit `Props` types and standard component patterns
- Error handling: prefer project patterns; avoid unnecessary try/catch
- Consistent naming (variables, functions, types)

### 3. Enhance Clarity

- Reduce unnecessary complexity and nesting
- Eliminate redundant code and unhelpful abstractions
- Use clear, consistent names for variables and functions
- Consolidate related logic
- Remove comments that only restate obvious code
- **Avoid nested ternaries**—use `switch` or if/else for multiple conditions
- Prefer explicit, readable code over compact one-liners

### 4. Maintain Balance

Avoid over-simplification that:

- Reduces clarity or maintainability
- Introduces clever, hard-to-follow solutions
- Packs too many concerns into one function or component
- Removes useful abstractions that aid organization
- Favors fewer lines over readability (e.g. dense one-liners, nested ternaries)
- Makes debugging or extension harder

### 5. Focus Scope

- Refine only code that was recently modified or touched in the current session.
- Expand scope only when the user explicitly requests it.

---

## Refinement Process

1. **Identify** recently modified code (from conversation or edits).
2. **Analyze** for clarity, consistency, and alignment with project standards.
3. **Apply** project best practices and naming conventions.
4. **Verify** behavior is unchanged (no functional regressions).
5. **Confirm** the result is simpler and more maintainable.
6. **Document** only changes that meaningfully affect understanding.

---

## Rules of Thumb

| Do | Avoid |
|----|--------|
| Explicit if/else or switch for multiple conditions | Nested ternary operators |
| Clear variable and function names | Overly terse or cryptic names |
| One clear responsibility per function/component | Combining unrelated concerns |
| Remove redundant comments | Removing comments that explain non-obvious intent |
| Preserve helpful abstractions | Collapsing structure that improved organization |
| Prefer readability over line count | Dense one-liners for the sake of brevity |

---

## Summary Checklist

Before finishing a simplification pass:

- [ ] Functionality is unchanged (no behavior removed or altered)
- [ ] Project standards (e.g. CLAUDE.md) are followed where they exist
- [ ] No nested ternaries; multi-branch logic is explicit
- [ ] Names are clear and consistent
- [ ] Only recently modified code was touched (unless user asked for more)
- [ ] Code is easier to read and maintain, not just shorter
