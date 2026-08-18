# UI/UX Pro Max Guidelines & Project Rules (nextlevelbuilder/ui-ux-pro-max-skill)

This project adopts the **UI/UX Pro Max** design intelligence framework for all visual design, layout composition, and frontend craftsmanship.

## Active Project Archetype: Architectural & Editorial Logistics OS
- **Canvas & Surfaces**:
  - Background: `--bg` `#F8F7F4` (Warm Linen / Bone)
  - Text & Ink: `--ink` `#1C1917` (Deep Warm Carbon)
  - Accent / Urgency: `--accent` `#E27B58` (Terracotta / Burnt Orange)
  - Surface Subtles: `#F2EFE9`, `#EAE6DE`, `#E7E5E0`
- **Typography**:
  - Headings / Display: `Cormorant Garamond` (italic 600, serif luxury)
  - Technical / Telemetry / Labels: `Space Mono` (`font-mono-tech`, uppercase, letter-spacing 0.1em)
  - Body / Form Controls: `Inter` (`font-sans-clean`, 14px–16px, 1.5–1.7 line height)

## Mathematical Design & Spacing Rules
1. **Container Padding Math**: Outer container padding $\ge$ inner gaps. Minimum card padding is 16px.
2. **Button Padding Ratio**: Horizontal padding is exactly $2\times$ vertical padding (e.g. `px-4 py-2` or `px-6 py-3`).
3. **Nested Border Radius Formula**:
   $$\text{Radius}_{\text{inner}} = \text{Radius}_{\text{outer}} - \text{Padding}_{\text{container}}$$
4. **Touch & Click Targets**: Minimum touch target size 44px on mobile, responsive hover/active micro-interactions on desktop.
5. **No Label Wrapping**: Pills, badges, chips, and button labels must always fit on one line (`whitespace-nowrap`).

## Visual Anti-Patterns (Banned)
- No arbitrary purple-to-blue gradients or gradient text.
- No nested cards without mathematical radius adjustments.
- No unstyled empty states or silent click handlers.
- No gray-on-gray low contrast text (maintain WCAG AA $\ge 4.5:1$).

## Component Architecture
- **Animation**: Use `motion` from `motion/react` for layout animations, slide-overs, modal overlays, and toast telemetry.
- **Icons**: Always import from `lucide-react`.
- **Modularity**: Split complex views into dedicated components within `src/components/`.
