---
name: design-system-thibaut-cr-pelle
description: >
  Apply the Thibaut Crépelle design system when building or updating UI.
  Use when creating components, choosing colors or typography,
  or reviewing designs for e-commerce interfaces.
---

# Thibaut Crépelle — Design System Skill

## When to Use

- Building new UI components for Thibaut Crépelle.
- Reviewing or updating existing component styles.
- Choosing colors, typography, or spacing for e-commerce pages.
- Checking designs against the extracted token set.

## Context

- **Product:** Thibaut Crépelle — https://www.thibaut.cool/#contactmobile
- **Surface:** e-commerce
- **Audience:** Consumers and shoppers
- **Character:** Product-focused shopping experience with a balanced color system and 5 typefaces.

## Tokens

### Colors

| Token | Value | Role |
|-------|-------|------|
| color-1 | `#000000` | Text Primary |
| color-2 | `#0000EE` | Text Primary |
| color-3 | `#808080` | Text Secondary |
| color-4 | `#FFFFFF` | Text Light |

### Typography

**Font stack:** Apple Garamond Regular, Inter, Inter-Medium, sans-serif, Times New Roman

| Level | Size | Usage |
|-------|------|-------|
| text-xs | 12px | Captions, metadata |
| text-sm | 16px | Labels, secondary text |
| text-base | 80px | Body text (default) |

**Weight scale:** 400 · 500 · 600
**Line heights:** 80px · 16px · 24px · 19.2px

### Spacing

**Base unit:** 8px

`space-1: 10px` · `space-2: 12px` · `space-3: 16px` · `space-4: 24px` · `space-5: 32px` · `space-6: 40px` · `space-7: 52px` · `space-8: 64px` · `space-9: 96px` · `space-10: 120px` · `space-11: 420px`

### Shapes

**Border radius:** `radius-sm: 6px` · `radius-md: 12px` · `radius-lg: 186px`

### Elevation

_None detected._

### Motion

- **duration-fast:** `all`
- **duration-fast:** `none`

## Component Inventory

- **Links:** 25 detected
- **Tables:** 1 detected
- **Images:** 20 detected

## Constraints

### Always

- Use tokens from the tables above — do not introduce new values.
- Include hover, focus-visible, and disabled states for interactive elements.
- Follow the 8px spacing grid.
- Meet WCAG 2.2 AA contrast minimums.

### Never

- Do not introduce colors outside the extracted palette.
- Do not use arbitrary spacing values — stick to the scale.
- Do not mix border-radius values. Pin to the detected set (6px, 12px, 186px).
- Do not stack more than one primary CTA per viewport.
- Do not use red for non-error UI — reserve it for destructive actions and warnings.
- Do not ship components without defining hover, focus-visible, and disabled states.

## Tone

Persuasive, benefit-driven, trustworthy. Active voice, urgency without pressure.

## Authoring Workflow

When creating or documenting a component for this system:

1. State intent — one sentence on purpose.
2. Map tokens — list every token the component uses.
3. Define anatomy — named parts with token assignments.
4. Specify states — default, hover, focus-visible, active, disabled, loading, error, empty.
5. Describe interactions — keyboard, pointer, touch, edge cases.
6. Add a11y criteria — testable pass/fail checks.
7. List anti-patterns — concrete misuse examples.
8. Close with the Definition of Done checklist.

## Output Structure

Component guidelines must contain, in order:

1. Overview (purpose, when to use, when not to use)
2. Tokens and foundations
3. Anatomy, variants, responsive behavior
4. States and interactions
5. Accessibility (ARIA, contrast, focus, screen reader)
6. Content guidelines (copy rules, tone)
7. Anti-patterns with reasoning

## Component Requirements

- Reference only tokens from the tables above.
- Define all states: default, hover, focus-visible, active, disabled, loading, error.
- Handle edge cases: empty, overflow, truncation, max content.
- Include keyboard navigation behavior.
- Document ARIA roles and labels.

## Definition of Done

- Default state renders (smoke test).
- All states visually verified.
- Zero hardcoded visual values — tokens only.
- Keyboard navigation works without pointer.
- No critical a11y violations.
- Tested at min and max breakpoint.
- At least one anti-pattern documented.
- Purpose, usage, and limitations documented.
