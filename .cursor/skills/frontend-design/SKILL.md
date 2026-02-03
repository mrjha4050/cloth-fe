---
name: frontend-design
description: Creates distinctive, production-grade frontend interfaces with high design quality. Guides typography, color, motion, spatial composition, and visual details to avoid generic AI aesthetics. Use when the user asks to build web components, pages, or applications; requires a clear aesthetic direction and production-ready, polished code.
---

# Frontend Design

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with strong attention to aesthetic detail and intentional creative choices.

**When to use**: User asks to build a component, page, application, or interface. They may provide purpose, audience, or technical constraints.

---

## Design Thinking (Before Coding)

1. **Purpose**: What problem does this interface solve? Who uses it?
2. **Tone**: Pick a clear direction—e.g. brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian. Use as inspiration but design something true to the chosen direction.
3. **Constraints**: Framework, performance, accessibility.
4. **Differentiation**: What makes this memorable? What will users remember?

**Critical**: Choose one conceptual direction and execute it precisely. Bold maximalism and refined minimalism both work—intentionality matters more than intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

---

## Frontend Aesthetics Guidelines

### Typography

- Choose fonts that are distinctive and well-suited to the concept. Avoid generic choices (Arial, Inter, Roboto, system-ui as default).
- Pair a distinctive display font with a refined body font.
- Vary choices by project; do not repeatedly use the same “safe” fonts (e.g. Space Grotesk).

### Color & Theme

- Commit to a cohesive palette. Use CSS variables for consistency.
- Prefer dominant colors with sharp accents over timid, evenly-distributed palettes.
- Vary between light and dark themes and different aesthetics across projects.

### Motion

- Use animation for impact and micro-interactions. Prefer CSS-only where possible; use Motion (or equivalent) in React when available.
- Prioritize high-impact moments: e.g. one well-orchestrated load with staggered reveals (`animation-delay`) over many small, scattered effects.
- Use scroll-triggering and hover states that feel intentional and surprising.

### Spatial Composition

- Consider unexpected layouts: asymmetry, overlap, diagonal flow, grid-breaking elements.
- Balance generous negative space with controlled density where it fits the tone.

### Backgrounds & Visual Details

- Create atmosphere and depth instead of flat solid colors.
- Add context-appropriate effects: gradient meshes, noise/grain, geometric patterns, layered transparencies, strong shadows, decorative borders, custom cursors where it fits the concept.
- Match complexity to the vision: maximalist designs can have elaborate code; minimalist ones need restraint, precision, and subtle detail.

---

## What to Avoid

- Overused font families (Inter, Roboto, Arial, default system fonts as the main identity).
- Cliched schemes (e.g. purple gradients on white) and predictable layouts.
- Cookie-cutter patterns that lack context-specific character.
- Converging on the same “safe” choices across different projects.

Interpret creatively and make unexpected choices that feel designed for the specific context. No two designs should be identical. Match implementation complexity to the aesthetic: maximalist → elaborate animations and effects; minimal/refined → restraint, spacing, typography, and subtle detail.

---

## Summary Checklist

- [ ] Clear purpose, tone, and differentiation decided before coding
- [ ] Typography: distinctive display + refined body; not generic defaults
- [ ] Color: cohesive palette with intentional accents; CSS variables where appropriate
- [ ] Motion: high-impact moments (e.g. load, scroll, hover); not scattered gimmicks
- [ ] Layout: intentional composition (asymmetry, overlap, or clear grid)
- [ ] Backgrounds/details: atmosphere and depth aligned with the aesthetic
- [ ] Code is production-grade, functional, and polished
- [ ] Design is memorable and true to the chosen direction
