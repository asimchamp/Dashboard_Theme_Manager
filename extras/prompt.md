You are a senior Splunk UI architect, advanced CSS motion designer, and design-system engineer.

Your task is to create an EXTENSIVELY CUSTOMIZED Splunk dashboard styling panel using HTML and CSS ONLY.
The goal is to transform a Splunk dashboard into a highly graphical, motion-rich, website-quality user experience.

This is NOT a minimal styling task.
This styling must feel like a real, premium product UI.

════════════════════════════
ABSOLUTE KEYNOTES (NON-NEGOTIABLE)
════════════════════════════

1. NEVER use the "&" character anywhere in the output (including CSS, comments, or text).
2. Theme badge vertical position must ALWAYS be exactly:
   top: 125px;
3. The generated CSS must be at least 800 lines long.
4. All rules must remain Splunk Simple XML safe.
5. CSS only. No JavaScript. No external assets.

════════════════════════════
⚠️ THEME DIVERSITY REQUIREMENTS (CRITICAL)
════════════════════════════

**BEFORE creating a new theme, you MUST ensure it is VISUALLY DISTINCT from all existing themes.**

### Existing Themes Reference (AVOID SIMILARITY)

**Existing themes are listed in `[appserver/static/themes_metadata.json](file:///Applications/Splunk/etc/apps/dashboard_theme_manager/appserver/static/themes_metadata.json)`.**

**Refer to this file** to ensure your new theme is visually distinct from all currently registered themes.

### Diversity Checklist (MUST SATISFY AT LEAST 5 DIFFERENT CATEGORIES)

**✓ Color Philosophy:**

- [ ] Use a completely different primary color family (avoid blues/purples if many exist)
- [ ] Employ opposite contrast strategy (high contrast vs low contrast)
- [ ] Use warm palette (oranges, reds, yellows) if others are cool-toned
- [ ] Implement monochromatic vs multi-color approach differently
- [ ] Use unexpected color combinations (e.g., teal + coral, mustard + navy)

**✓ Visual Identity:**

- [ ] Unique geometric signature (circles vs rectangles vs hexagons vs diagonal cuts)
- [ ] Distinctive border radius strategy (sharp 0px vs ultra-round 24px)
- [ ] Specific texture approach (no texture vs grain vs patterns vs gradients)
- [ ] Unique shadow philosophy (no shadows vs heavy depth vs colored shadows)
- [ ] Different spacing rhythm (tight vs airy vs irregular)

**✓ Motion and Animation:**

- [ ] Different animation timing (instant vs slow ease vs bouncy)
- [ ] Unique hover behaviors (lift vs slide vs pulse vs glow vs rotate)
- [ ] Distinct entry choreography (fade vs slide vs scale vs stagger differently)
- [ ] Different interactive feedback (subtle vs exaggerated)

**✓ Design Philosophy:**

- [ ] Minimalist vs Maximalist approach
- [ ] Corporate/Professional vs Creative/Playful
- [ ] Futuristic vs Classic vs Retro
- [ ] Organic/Natural vs Geometric/Technical
- [ ] Brutalist vs Elegant vs Whimsical

**✓ Typography and Hierarchy:**

- [ ] Different font-weight ranges (300-400 light vs 600-800 bold)
- [ ] Unique letter-spacing approach (tight -0.02em vs wide 0.18em)
- [ ] Text shadow vs no text shadow
- [ ] Different title case approach (uppercase vs sentence case vs title case)

**✓ Special Effects:**

- [ ] Unique glow/blur effects (sharp vs soft vs none)
- [ ] Different gradient directions (radial vs linear vs conic vs none)
- [ ] Backdrop filters (blur vs brightness vs none)
- [ ] Border treatments (solid vs gradient vs none vs decorative)

### Examples of GOOD Diversity:

- ✅ **Neon Pulse** (sharp, neon, cyberpunk) vs **Ocean Breeze** (rounded, soft, professional light)
- ✅ **Emerald Forest** (natural, green, light) vs **Midnight Aurora** (cosmic, vibrant, dark)
- ✅ **Crystal Clarity** (glassmorphism, purple) vs **Cyber Slate** (solid, green, technical)

### Examples of BAD Similarity (AVOID):

- ❌ Two dark themes with blue accents and similar radius values
- ❌ Two themes with glassmorphism and purple tones
- ❌ Two light themes with green palettes and similar animations
- ❌ Two themes differing only in hue rotation (e.g., purple → pink)
- ❌ Minor variations in shadow depth or opacity with same overall aesthetic

**REQUIREMENT: Document which 5+ diversity points your theme satisfies before starting CSS.**

════════════════════════════
SPLUNK XML SAFETY RULES
════════════════════════════

- All XML tags must be properly opened and closed
- CSS must exist ONLY inside style tags
- No script tags
- No external fonts, libraries, or CDNs
- Use panel depends="$alwaysHideCSS$" so the styling panel remains hidden
- Avoid XML-breaking characters outside CSS blocks

════════════════════════════
SVG BACKGROUND SAFETY (CRITICAL)
════════════════════════════

⚠️ **Splunk's XML parser has two critical limitations for SVG backgrounds:**

1. **LINE LENGTH LIMIT**: Lines exceeding ~400 characters will cause panel loading failures

   - **Solution**: Split long SVG data URLs into multiple lines using CSS backslash continuation:
     `css
     --theme-pattern: url('data:image/svg+xml;utf8,\
%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E\
%3Ccircle cx="50" cy="50" r="40" fill="%23ff0000"/%3E\
%3C/svg%3E');
     `
   - Keep each line under 200 characters for safety
   - Use `awk '{print length}' file.xml | sort -rn | head -1` to check max line length

2. **SVG FILTER EFFECTS NOT SUPPORTED**: Complex SVG filters break Splunk's CSS parser

   - **NEVER USE**: `<filter>`, `<feGaussianBlur>`, `<feOffset>`, `<feComponentTransfer>`, `<feMerge>`, `<defs>` with filters
   - **Dashboard will load panel but break completely** if filters are present

   ❌ **FORBIDDEN** (will break dashboard):

   ```xml
   <defs>
     <filter id="shadow">
       <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
       <feOffset dx="2" dy="3"/>
     </filter>
   </defs>
   <circle filter="url(#shadow)" .../>
   ```

   ✅ **ALLOWED** (simple SVG only):

   ```xml
   <path d="M15 25 Q 30 5, 45 25..." fill="#e0f2fe" fill-opacity="0.3"/>
   <circle cx="85" cy="15" r="8" fill="#fcd34d" opacity="0.2"/>
   ```

**Permitted SVG elements for backgrounds:**

- Basic shapes: `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polyline>`, `<polygon>`, `<path>`
- Groups: `<g>` (for organization only)
- Attributes: `fill`, `stroke`, `fill-opacity`, `stroke-opacity`, `stroke-width`, `stroke-dasharray`
- Keep it simple - use opacity instead of filters for visual depth

**Verification commands:**

```bash
# Check line length (must be < 200)
awk '{print length, NR}' panel.xml | sort -rn | head -3

# Check for forbidden filters
grep -i "feGaussianBlur\|feOffset\|filter id" panel.xml

# Validate XML
xmllint --noout panel.xml
```

════════════════════════════
GLOBAL CUSTOMIZATION SCOPE (MANDATORY)
════════════════════════════

────────────────────────────
1️⃣ DASHBOARD TITLE, DESCRIPTION, THEME BADGE
────────────────────────────

- Fully redesign dashboard title typography, spacing, weight, and animation
- Animate title entrance on dashboard load
- Style dashboard description as a secondary visual layer
- Add a THEME BADGE using CSS ::after on the dashboard header:
  - Fixed position
  - top: 125px (must never change)
  - Rounded pill shape
  - Uppercase lettering
  - Gradient background
  - Subtle depth using shadows
  - Animated reveal
  - pointer-events disabled
  - Text defined via:
    content: "theme_name";

────────────────────────────
2️⃣ DASHBOARD WATERMARK
────────────────────────────

- Add watermark using ::after on dashboard body
- Fixed bottom-right positioning
- Low visual dominance
- Uppercase with wide letter spacing
- Slow fade-in animation
- Non-interactive

────────────────────────────
3️⃣ INPUTS AND FILTER PANELS
────────────────────────────

- Fully customize dropdowns, text inputs, and time pickers
- Redesign label typography and spacing
- Add animated focus states
- Add active selection indicators
- Visually group related filters
- Animate interaction feedback smoothly

────────────────────────────
4️⃣ PANEL CONTAINERS (EXTENDED DETAIL)
────────────────────────────
Panel containers must behave like high-end UI cards:

- Multi-layer visual depth:
  - Base surface
  - Elevated hover surface
  - Active interaction surface
- Clear separation between dashboard rows
- Consistent padding system driven by spacing tokens
- Rounded geometry aligned with global radius scale
- Hover behavior:
  - Vertical lift
  - Shadow amplification
  - Border emphasis
- Entry animation:
  - Staggered reveal
  - Subtle translation and opacity shift
- Panels must visually communicate hierarchy and importance

────────────────────────────
5️⃣ KPI AND SINGLE VALUE PANELS (EXTENDED DETAIL)
────────────────────────────
KPI panels must feel dynamic and informative:

- Large, bold numerical display
- Accent bar or underline decoration
- Smooth pop-in animation on load
- Optional trend icon or subtle pulse effect
- Typography distinctly larger than surrounding text
- Title/label styled as secondary information

────────────────────────────
6️⃣ CHARTS AND GRAPHS (CRITICAL)
────────────────────────────
Important: charts render using Highcharts SVG.
You must target SVG elements directly.

- Axis labels and tick marks:
  - .highcharts-axis-labels text
  - .highcharts-axis-line
  - .highcharts-grid-line
- Smooth line and area charts:
  - .highcharts-graph (stroke-width, stroke-linecap, stroke-linejoin)
  - .highcharts-area (fill-opacity)
- Bar chart rounding:

  - .highcharts-series rect { rx: ...; ry: ...; }
  - Add hover transitions

- Legend styling:

  - .highcharts-legend-item text

- Tooltip styling:

  - .highcharts-tooltip
  - .highcharts-tooltip-box (fill, stroke)
  - .highcharts-tooltip text (critical for visibility)

- Chart load-in animation:
  - Fade in or scale up the entire chart container

────────────────────────────
7️⃣ TABLES (DATA TABLES)
────────────────────────────
Tables must have a modern data grid feel:

- Striped or alternating row backgrounds
- Hover row highlight with smooth transition
- Header row distinct styling:
  - Uppercase labels
  - Contrasting background
  - Subtle border beneath
- Cell padding consistent with spacing tokens
- Smooth row-hover animation (transform scale or shadow)
- Optional accent border on hover

────────────────────────────
8️⃣ LEGENDS AND TOOLTIPS
────────────────────────────
Legends and tooltips must be clear and match theme:

- Legend item hover states
- Tooltip box styling (background, border, shadow)
- Tooltip text must be HIGHLY VISIBLE (use !important if needed)
- Coordinated colors with overall palette
- Smooth fade-in animation

────────────────────────────
9️⃣ SCROLLBARS
────────────────────────────
Custom scrollbars elevate the entire theme:

- ::-webkit-scrollbar
- ::-webkit-scrollbar-track
- ::-webkit-scrollbar-thumb
- Rounded, themed, and smooth

────────────────────────────
🔟 MOTION CHOREOGRAPHY (EXTENDED)
────────────────────────────
Bring the UI to life with coordinated, purposeful motion:

- Header reveal (fade from top)
- Panel stagger (cascading from top to bottom)
- Hover elevation (subtle vertical lift)
- Focus indicators (scale, glow, or border)
- Smooth state transitions (150ms–300ms recommended)
- Use cubic-bezier easing for refined motion:
  - Standard: cubic-bezier(0.4,0.0,0.2,1)
  - Emphasized: cubic-bezier(0.2,0.0,0.0,1)
- Avoid jarring or instant transitions
- All animations must respect prefers-reduced-motion if desired

════════════════════════════
DESIGN TOKENS (RECOMMENDED APPROACH)
════════════════════════════
Organize your CSS using CSS custom properties for consistency:

:root {
--color-bg-base: ...;
--color-bg-elevated: ...;
--color-bg-hover: ...;
--color-bg-active: ...;
--color-text-primary: ...;
--color-text-secondary: ...;
--color-text-muted: ...;
--color-accent-primary: ...;
--color-accent-secondary: ...;
--color-border-subtle: ...;
--color-border-strong: ...;

--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;

--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 56px;
--space-10: 72px;

--shadow-1: ...;
--shadow-2: ...;
--shadow-3: ...;
--shadow-4: ...;

--motion-fast: 120ms;
--motion-medium: 280ms;
--motion-slow: 620ms;

--ease-standard: cubic-bezier(0.4,0.0,0.2,1);
--ease-emphasized: cubic-bezier(0.2,0.0,0.0,1);
}

Use these tokens throughout your CSS for:

- Scalability
- Consistency
- Easier theme variations

────────────────────────────
1️⃣1️⃣ CUSTOM SVG BACKGROUNDS AND VISUAL ENHANCEMENT
────────────────────────────
Elevate your theme with custom SVG background patterns that reinforce the visual identity:

**Dashboard Body Background:**

- Create a custom SVG pattern that matches your theme's aesthetic
- Use CSS custom properties to define the pattern:

  ```css
  :root {
    --theme-bg-pattern: url('data:image/svg+xml;utf8,\
  %3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E\
  %3Cpath d="..." fill="#..." fill-opacity="0.1"/%3E\
  %3C/svg%3E');
  }

  body,
  .dashboard-body {
    background-image: var(--theme-bg-pattern) !important;
    background-size: 100px 100px;
    background-repeat: repeat;
  }
  ```

**Panel Background Enhancement:**

- Add subtle texture or pattern overlays to panels
- Use layered backgrounds for depth:
  ```css
  .dashboard-panel {
    background-image: linear-gradient(corner-accent), var(--theme-bg-pattern);
  }
  ```

**Design Patterns to Consider:**

- Geometric grids (dots, crosses, hexagons)
- Organic patterns (waves, clouds, topography)
- Technical patterns (circuit boards, data streams, lattices)
- Abstract shapes (gradients, blobs, noise)

**Remember:**

- Keep SVG simple (no filter effects)
- Split long lines using backslash continuation
- Use low opacity (0.05-0.15) for subtle texture
- Ensure pattern enhances, not overwhelms content
- Test readability with pattern applied

════════════════════════════
OUTPUT FORMAT
════════════════════════════

Your final output MUST be valid Splunk Simple XML:

panel depends="$alwaysHideCSS$"
html
style
/_ Minimum 800 lines of well-structured, commented CSS
covering all sections above _/
/style
/html
/panel

(Use proper XML brackets in actual output)

Comment each major section clearly.
Use meaningful class selectors.
Stay organized.

════════════════════════════
FINAL CHECKLIST BEFORE SUBMISSION
════════════════════════════

✅ Theme satisfies 5+ diversity points from different categories
✅ No "&" character anywhere
✅ Theme badge at exactly top: 125px
✅ CSS is 800+ lines  
✅ All sections customized (header, panels, KPIs, charts, tables, inputs, scrollbars)
✅ Motion choreography implemented (stagger, hover, focus, load)
✅ Design tokens used consistently
✅ Tooltip text is highly visible
✅ Custom SVG background pattern (if used) follows safety guidelines (no filters, split lines)
✅ No script tags, external assets, or XML-breaking characters
✅ Valid XML structure with panel depends="$alwaysHideCSS$"

═══════════════════════════════════════
END OF SPLUNK DASHBOARD STYLING GUIDE
═══════════════════════════════════════
