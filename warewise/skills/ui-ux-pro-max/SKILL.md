---
name: ui-ux-pro-max
description: Complete UI/UX design intelligence engine and frontend design system framework for crafting professional, ultra-premium web and mobile user interfaces, responsive layouts, color systems, typography pairing, micro-interactions, and component hierarchies.
---

# UI/UX Pro Max — Design Intelligence Skill

Expert design system generator, layout architect, and UI/UX craftsmanship engine for high-performance React, Tailwind CSS, TypeScript, and modern component frameworks.

## When to Apply This Skill
- **Designing New Surfaces & Views**: Structuring complex operational dashboards, high-density telemetry views, storefronts, modal flows, and checkout funnels.
- **Visual Design & Typography Hierarchy**: Selecting paired display/body/mono typography with strict mathematical scales (Major Second 1.125, Major Third 1.25, Perfect Fourth 1.333).
- **Color Systems & Tonal Depth**: Applying 60-30-10 distribution rules, semantic tokens, WCAG AA 4.5:1+ contrast ratios, warm/cool neutral saturation, and accent highlights.
- **Component Architecture & Spatial Rhythm**: Nested corner radius calculations ($R_{inner} = R_{outer} - Padding$), proportional touch targets (44px+ minimum), 8pt spatial grid, and content-proportional padding.
- **Motion & Micro-interactions**: Enter/exit animations, state transitions with `motion` (`framer-motion`), hover lift feedback, and spring-physics easing curves.
- **Audit & Anti-Pattern Elimination**: Eradicating AI visual cliches, generic gradients, unstyled empty states, low-contrast text, broken flex layouts, and noisy borders.

---

## 1. Core Visual Archetypes & Style Matrix

### A. Architectural / Editorial (Current Active Archetype)
- **Palette**: Warm linen/cream background (`#F8F7F4`), deep carbon ink (`#1C1917`), subtle warm dividers (`#E7E5E0`), rich terracotta/burnt orange accent (`#E27B58`).
- **Typography**: Editorial Serif Display (`Cormorant Garamond` italic 600) + Clean Technical Mono (`Space Mono`) + Functional Modern Sans (`Inter` / `Plus Jakarta Sans`).
- **Visual Texture**: Hairline dividers (1px solid `rgba(28, 25, 23, 0.08)`), subtle warm shadows (`0 10px 40px rgba(0,0,0,0.03)`), pill metadata tags.
- **Best Suited For**: Enterprise Logistics OS, Design-led B2B SaaS, Hardware Platforms, Curated Commerce, Premium Portals.

### B. Neo-Brutalist Technical
- **Palette**: High-contrast black (`#0A0A0A`) on off-white (`#F5F5F0`), electric lime (`#CCFF00`) or safety amber (`#FF9900`) accents.
- **Borders & Corners**: Sharp 0px to 4px radii, 1.5px-2px solid borders, offset box-shadows (`3px 3px 0px #000`).
- **Best Suited For**: Developer tooling, CLI consoles, Web3 platforms, crypto dashboards.

### C. Clean SaaS / Minimalist Product
- **Palette**: Slate-tinted neutral surface (`#FAFAFA` / `#FFFFFF`), deep slate text (`#0F172A`), indigo/violet accent (`#4F46E5` / `#6366F1`).
- **Borders & Corners**: 8px-12px rounded cards, subtle border borders (`#E2E8F0`), soft ambient elevation (`shadow-sm`).
- **Best Suited For**: Productivity suites, CRM, analytics portals, collaborative documents.

### D. Luxury Dark / Carbon Minimal
- **Palette**: Deep charcoal/carbon canvas (`#0D0D0E`), elevated slate cards (`#18181B`), warm titanium highlights (`#E4E4E7`), copper or emerald status tokens.
- **Surface Depth**: Brightness step between background and card $\le 12\%$. No glowing saturated drop-shadows.
- **Best Suited For**: High-frequency financial terminals, luxury sound/media players, developer IDEs.

---

## 2. Mathematical Design Rules & Spacing Hierarchy

### Spacing & Padding Rules
1. **Container Padding Math**: Outer container padding must always exceed or equal the inner gap between children. Minimum card padding is 16px (1rem).
2. **Button Padding Ratio**: Horizontal padding must equal $2\times$ vertical padding (e.g. `px-4 py-2` or `px-6 py-3`).
3. **Nested Border Radius Formula**:
   $$\text{Radius}_{\text{inner}} = \text{Radius}_{\text{outer}} - \text{Padding}_{\text{container}}$$
   *Example*: Outer card `rounded-2xl` (16px) with `p-4` (16px) $\rightarrow$ Inner element `rounded-none` or `rounded-sm` (4px).

### Typography Scale & Readability
1. **Body Font Baseline**: Minimum 14px for dense UI, 16px for primary text. Line-height 1.5–1.7.
2. **Line Width Constraint**: Constrain prose/narrative copy to 60–75 characters (`max-w-prose` / `max-w-xl`).
3. **No Truncated Chips**: Single-line text for all badges, chips, pills, and button labels (`whitespace-nowrap`).

---

## 3. Component Design & State Handling

### Interactive States Checklist
- **Default State**: High visual clarity, semantic color contrast $> 4.5:1$.
- **Hover State**: Subtle brightness shift, background tint, or elevation lift (`hover:bg-opacity-80`, `hover:translate-y-[-1px]`).
- **Focus State**: Visible keyboard focus ring (`focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2`).
- **Active / Pressed State**: Tactile depression scale (`active:scale-[0.98]`).
- **Loading / Skeleton State**: Contextual spinners or pulse placeholders that mirror exact final component geometry.
- **Empty State**: Purposeful iconography, clear descriptive heading, and a direct primary Call to Action (CTA).

---

## 4. Anti-Pattern Elimination (Strict Prohibitions)
- ❌ **No Arbitrary Gradients**: Banned generic purple-to-blue or rainbow gradient text.
- ❌ **No Hero Metric Clutter**: Avoid generic 3-box big number spam without contextual trend indicators or operational action.
- ❌ **No Broken Dark Mode Shadows**: Never use pitch-black or glowing cyan shadows in dark themes.
- ❌ **No Gray Text on Colored Backgrounds**: Text on colored badges must be high-contrast white or deep carbon.
- ❌ **No Trailing/Incomplete Layouts**: All tables, grids, and lists must handle empty, single-item, and overflow states smoothly.
