---
name: Serene Editorial Glass
colors:
  surface: '#f8f9fc'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e1e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#414848'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#eff1f3'
  outline: '#717878'
  outline-variant: '#c1c8c8'
  surface-tint: '#436465'
  primary: '#325354'
  on-primary: '#ffffff'
  primary-container: '#4a6b6c'
  on-primary-container: '#c7eaeb'
  inverse-primary: '#aacdce'
  secondary: '#4b6076'
  on-secondary: '#ffffff'
  secondary-container: '#cee5ff'
  on-secondary-container: '#51667c'
  tertiary: '#425140'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a6957'
  on-tertiary-container: '#d7e8d1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6e9ea'
  primary-fixed-dim: '#aacdce'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#2b4c4d'
  secondary-fixed: '#cee5ff'
  secondary-fixed-dim: '#b2c9e2'
  on-secondary-fixed: '#041d30'
  on-secondary-fixed-variant: '#33495e'
  tertiary-fixed: '#d7e7d1'
  tertiary-fixed-dim: '#bbcbb6'
  on-tertiary-fixed: '#111f11'
  on-tertiary-fixed-variant: '#3c4b3a'
  background: '#f8f9fc'
  on-background: '#191c1e'
  surface-variant: '#e1e3e5'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 34px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '400'
    lineHeight: 34px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies a serene, distraction-free document reading and synthesis environment. Rooted in minimalist editorial traditions, the aesthetic pairs airy structural layout with ethereal frosted glass surfaces to promote mental clarity, sustained focus, and calm contemplation. 

The interface evokes the tactile purity of premium unbleached paper fused with modern translucent materials. Visual hierarchy relies on breathing room, subtle tonal transitions, and precise typography rather than heavy containment lines or aggressive contrast. Interactions are quiet, fluid, and deliberate.

## Colors

The palette draws from natural slate, muted sage, and distant sky tones, anchored by warm alabaster backgrounds. 

- **Primary (`#4A6B6C`)**: A grounded, contemplative deep sage slate used for active states, primary actions, and core focal indicators.
- **Secondary (`#6C8299`)**: A tranquil, atmospheric slate-blue serving secondary affordances, subtle metadata badges, and informational highlights.
- **Tertiary (`#8A9A86`)**: A delicate herbal sage applied sparingly to positive confirmations, bookmarks, and peaceful annotations.
- **Neutral (`#6B6E70`)**: A warm stone gray providing high-legibility body text without the harshness of pure black.
- **Backgrounds & Surfaces**: Canvas foundations rest on warm soft whites (`#FBFBF9` and `#F5F5F0`), while elevated layers utilize translucent white sheets (`rgba(255, 255, 255, 0.72)`) over subtle blurred backdrops.

## Typography

The typographic hierarchy pairs the literary authority of **Newsreader** for editorial headings and long-form titles with the modern, neutral precision of **Manrope** for body copy and navigational UI.

- Headlines utilize generous line heights and subtle negative tracking to preserve rhythm during extended reading sessions.
- Body sizes favor relaxed line heights (1.6x - 1.65x) to reduce cognitive strain across document layouts.
- Labels lean slightly heavier in weight to maintain crisp legibility on semi-transparent backgrounds and delicate borders.

## Layout & Spacing

The layout is built around a fluid, centered document reading column flanked by modular floating utility panes. It relies on an 8-point base spacing rhythm that expands dramatically in outer regions to evoke open paper margins.

- **Desktop (1024px+)**: 12-column fluid grid bounded to a maximum document viewport of 1440px. The central reading pane spans 7 to 8 columns (max 720px width for optimal line-length comfort), with outer gutters set to `1.5rem` and broad canvas margins of `3rem`.
- **Tablet (768px - 1023px)**: 8-column layout. Toolbars and metadata sidebars collapse into floating sheets; document canvas retains a minimum 2rem margin.
- **Mobile (<768px)**: 4-column single-stream view. Canvas margins contract to `1.25rem`, gutters drop to `1rem`, and floating controls dock cleanly into a bottom floating bar.

## Elevation & Depth

Visual hierarchy uses frosted glassmorphism backed by soft environmental light rather than conventional dark drop shadows.

- **Surface Layers**: Floating bars, document cards, and inspection panels use `rgba(255, 255, 255, 0.72)` paired with `backdrop-filter: blur(16px) saturate(140%)`.
- **Low-Contrast Ghost Outlines**: All raised components feature a subtle 1px border using `rgba(255, 255, 255, 0.9)` along top/left edges and `rgba(108, 130, 153, 0.12)` along bottom/right edges to create soft refracted highlights.
- **Ambient Diffusion**: When layering calls for true physical separation (e.g., active floating palettes or contextual popovers), use an expansive, ultra-diffused shadow tinted with slate: `0 12px 32px -8px rgba(74, 107, 108, 0.08)`. Avoid stark black or high-opacity shadows.

## Shapes

The interface embraces a balanced rounded geometry (Level 2: `0.5rem` base, `1rem` for medium containers, and `1.5rem` for large cards and floating sheets). 

Rounded forms soften the structural rigidity of document grids, reinforcing the serene, organic personality. Interactive pills and tag shapes employ fully circular radiuses (`9999px`) to distinguish actionable metadata and toggles from structural content blocks.

## Components

### Buttons
- **Primary**: Solid deep sage (`#4A6B6C`) with crisp white text, rounded to `0.5rem`, providing quiet tactile confidence. Hover shifts subtly to `#3E5B5C` with no harsh elevation change.
- **Secondary / Glass**: Frosted white (`rgba(255, 255, 255, 0.65)`) with neutral slate text, 1px perimeter highlight (`rgba(108, 130, 153, 0.18)`), and `backdrop-filter: blur(12px)`.
- **Ghost**: Pure transparent background with muted slate text; displays a soft sage-tinted wash (`rgba(74, 107, 108, 0.06)`) on hover.

### Chips & Annotations
- Pill-shaped (`rounded-full`) tags built with translucent backgrounds (`rgba(245, 245, 240, 0.8)`).
- Filter and taxonomy chips use muted text labels (`label-md`). Selected states apply a soft sky/slate wash (`rgba(108, 130, 190, 0.14)`) and primary sage typography.

### Input Fields & Search Bars
- Recessed frosted inputs (`rgba(255, 255, 255, 0.5)`) framed by a gentle border (`rgba(107, 110, 112, 0.2)`).
- Focus states smoothly transition the border to primary sage (`#4A6B6C`) with an exterior ring of `rgba(74, 107, 108, 0.12)`. Placeholder text rests in warm neutral gray.

### Checkboxes & Radio Buttons
- Minimal square-rounded checkboxes (`rounded-sm`) and circular radios.
- Inactive states carry an understated stone rim. Active states fill with primary sage slate displaying an off-white internal glyph.

### Cards & Reading Sheets
- Built from white frosted panes (`rgba(255, 255, 255, 0.72)`) bordered with subtle light-refracting strokes.
- Internal padding adheres to `space-lg`. Document cards use deliberate editorial rhythm: title in `Newsreader`, followed by body excerpts in `Manrope` with calm line spacing.

### Document Viewer Controls & Floating Palettes
- Persistent reading navigation and zoom bars float centered above or below content.
- Assembled as segmented frosted glass bars containing borderless icon actions, divided only by gentle vertical hairpins (`rgba(107, 110, 112, 0.15)`).