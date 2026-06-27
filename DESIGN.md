# True Log Design System

## 1. Atmosphere & Identity

True Log should feel like a quiet technical notebook with a personal profile panel attached: neutral, readable, deliberate, and slightly tactile. The signature is monochrome depth with a restrained blue technical accent, using subtle tonal surfaces instead of decorative gradients so long-form writing stays calm.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
| --- | --- | --- | --- | --- |
| Surface/base | `--background` | `oklch(1 0 0)` | `oklch(0.2050 0 0)` | App background |
| Text/base | `--foreground` | `oklch(0.1450 0 0)` | `oklch(0.9850 0 0)` | Body text and headlines |
| Surface/card | `--card` | `oklch(0.9950 0 0)` | `oklch(0.1650 0 0)` | Profile, post, and tool panels |
| Text/card | `--card-foreground` | `oklch(0.1450 0 0)` | `oklch(0.9850 0 0)` | Text inside panels |
| Surface/popover | `--popover` | `oklch(1 0 0)` | `oklch(0.2050 0 0)` | Floating menus and dialogs |
| Text/popover | `--popover-foreground` | `oklch(0.1450 0 0)` | `oklch(0.9850 0 0)` | Popover content |
| Action/primary | `--primary` | `oklch(0.2050 0 0)` | `oklch(0.9220 0 0)` | Primary actions, active navigation |
| Text/on-primary | `--primary-foreground` | `oklch(0.9850 0 0)` | `oklch(0.2050 0 0)` | Text on primary actions |
| Surface/secondary | `--secondary` | `oklch(0.8700 0 0)` | `oklch(0.2690 0 0)` | Secondary controls |
| Text/secondary | `--secondary-foreground` | `oklch(0.1450 0 0)` | `oklch(0.9850 0 0)` | Secondary control text |
| Surface/muted | `--muted` | `oklch(0.9500 0 0)` | `oklch(0.2690 0 0)` | Metadata strips, quiet sections |
| Text/muted | `--muted-foreground` | `oklch(0.5560 0 0)` | `oklch(0.7080 0 0)` | Dates, captions, hints |
| Surface/accent | `--accent` | `oklch(0.9500 0 0)` | `oklch(0.3710 0 0)` | Hover and selected states |
| Text/accent | `--accent-foreground` | `oklch(0.2050 0 0)` | `oklch(0.9850 0 0)` | Text on accent surfaces |
| Status/destructive | `--destructive` | `oklch(0.5770 0.2450 27.3250)` | `oklch(0.7040 0.1910 22.2160)` | Error and destructive actions |
| Text/destructive | `--destructive-foreground` | `oklch(1 0 0)` | `oklch(0.9850 0 0)` | Text on destructive actions |
| Border/default | `--border` | `oklch(0.9500 0 0)` | `oklch(0.2690 0 0)` | Dividers and panel outlines |
| Field/input | `--input` | `oklch(0.9700 0 0)` | `oklch(0.2690 0 0)` | Inputs and segmented controls |
| Focus/ring | `--ring` | `oklch(0.7080 0 0)` | `oklch(0.5560 0 0)` | Keyboard focus rings |
| Chart/1 | `--chart-1` | `oklch(0.8100 0.1000 252)` | `oklch(0.8100 0.1000 252)` | Future data visualization |
| Chart/2 | `--chart-2` | `oklch(0.6200 0.1900 260)` | `oklch(0.6200 0.1900 260)` | Future data visualization |
| Chart/3 | `--chart-3` | `oklch(0.5500 0.2200 263)` | `oklch(0.5500 0.2200 263)` | Future data visualization |
| Chart/4 | `--chart-4` | `oklch(0.4900 0.2200 264)` | `oklch(0.4900 0.2200 264)` | Future data visualization |
| Chart/5 | `--chart-5` | `oklch(0.4200 0.1800 266)` | `oklch(0.4200 0.1800 266)` | Future data visualization |
| Sidebar/base | `--sidebar` | `oklch(0.9850 0 0)` | `oklch(0.2690 0 0)` | vCard-inspired profile sidebar |
| Sidebar/text | `--sidebar-foreground` | `oklch(0.1450 0 0)` | `oklch(0.9850 0 0)` | Sidebar text |
| Sidebar/action | `--sidebar-primary` | `oklch(0.2050 0 0)` | `oklch(0.4880 0.2430 264.3760)` | Sidebar active actions |
| Sidebar/accent | `--sidebar-accent` | `oklch(0.9700 0 0)` | `oklch(0.2690 0 0)` | Sidebar hover states |
| Sidebar/border | `--sidebar-border` | `oklch(0.9220 0 0)` | `oklch(0.2750 0 0)` | Sidebar dividers |
| Sidebar/ring | `--sidebar-ring` | `oklch(0.7080 0 0)` | `oklch(0.4390 0 0)` | Sidebar focus rings |

### Rules

- The palette is intentionally neutral; use chart blues only for data visualization or future technical accents.
- `--primary` is for action and active state, never decoration.
- Every UI color must map to this table or the Tailwind `@theme inline` aliases in `src/app/globals.css`.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | `3rem` | 700 | 1.1 | 0 | Rare landing title |
| H1 | `2.25rem` | 700 | 1.15 | 0 | Page title |
| H2 | `1.75rem` | 650 | 1.25 | 0 | Section heading |
| H3 | `1.375rem` | 650 | 1.35 | 0 | Card and post subsection titles |
| Body/lg | `1.125rem` | 400 | 1.65 | 0 | Intro copy |
| Body | `1rem` | 400 | 1.65 | 0 | Default prose and UI text |
| Body/sm | `0.875rem` | 400 | 1.55 | 0 | Metadata and secondary UI |
| Caption | `0.75rem` | 600 | 1.4 | 0 | Labels, dates, taxonomy chips |

### Font Stack

- Primary: `Noto Sans KR`, `ui-sans-serif`, `sans-serif`, `system-ui`
- Mono: `Geist Mono`, `ui-monospace`, `monospace`
- Serif: `ui-serif`, `Georgia`, `Cambria`, `"Times New Roman"`, `Times`, `serif`

### Rules

- Letter spacing stays at `0`; use weight and scale for hierarchy.
- Body text never drops below `0.875rem`.
- Mono is reserved for code, slugs, dates, and compact technical metadata.

## 4. Spacing & Layout

### Base Unit

All spacing derives from `--spacing: 0.25rem`, equal to 4px.

| Token | Value | Usage |
| --- | --- | --- |
| `--space-1` | `0.25rem` | Tight inline spacing |
| `--space-2` | `0.5rem` | Compact groups |
| `--space-3` | `0.75rem` | Button and field padding |
| `--space-4` | `1rem` | Default component gap |
| `--space-6` | `1.5rem` | Panel padding |
| `--space-8` | `2rem` | Section groups |
| `--space-12` | `3rem` | Major vertical rhythm |
| `--space-16` | `4rem` | Page-level separation |

### Grid

- Max content width: `72rem` for content-heavy blog pages.
- Shell direction: mobile stacks profile above content; desktop uses sidebar plus content panel.
- Breakpoints: Tailwind defaults, with first QA targets at 375px, 768px, and 1280px.

### Rules

- Use stable dimensions for controls and panels to avoid layout shift.
- Prefer full-width bands and constrained inner content over nested cards.

## 5. Components

### Theme Segmented Control

- **Structure**: one `role="group"` container with three button options: System, Light, Dark.
- **Variants**: default, selected, hover, focus.
- **Spacing**: `--space-1` internal gap, `--space-2` horizontal button padding.
- **States**: selected uses `--primary` and `--primary-foreground`; focus uses `--ring`.
- **Accessibility**: each option is a real button with `aria-pressed`.
- **Motion**: color and background transitions only, 150ms.

### Latest Post List

- **Structure**: one heading block followed by a five-item ordered list.
- **Surface**: list items use `--background`, `--border`, and `--radius-md` inside the main `--card` panel.
- **Metadata**: dates, reading time, category, and pinned state use the caption style; avoid mono when Korean labels are present.
- **Tags**: taxonomy chips use `--muted`, `--border`, and mono caption text.
- **Motion**: list items may shift tonal background on hover only, 150ms.
- **Accessibility**: the list remains semantic HTML with `article`, `time`, and labeled tag groups.

### Post Card

- **Structure**: one semantic `article` with metadata, linked title, excerpt, and optional tag chips.
- **Surface**: cards use `--background`, `--border`, and `--radius-md` inside the main content panel.
- **Interaction**: the title is the primary link; hover may shift the card to `--accent`, and focus uses `--ring`.
- **Implementation**: component-level styling uses Tailwind utilities mapped to the `@theme inline` tokens.

### Post Detail

- **Structure**: one centered article panel with a compact return link, theme control, metadata header, and rendered Markdown body.
- **Width**: detail pages use a narrower reading width than future index/archive pages.
- **Metadata**: title, description/excerpt, date, reading time, category, pinned state, and optional tags remain visible above the body.
- **Accessibility**: the page uses semantic `main`, `article`, `header`, `time`, and link elements.

### Markdown Content

- **Structure**: rendered HTML is wrapped by one component that scopes typography and spacing to descendants.
- **Typography**: headings follow the H1/H2/H3 scale; body copy keeps a relaxed line height for Korean reading.
- **Code**: inline code and code blocks use mono text and muted surfaces; syntax highlighting is reserved for a later stage.
- **Safety**: raw HTML passthrough is disabled in the Markdown pipeline.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Micro | 150ms | ease-out | Theme buttons, links, focus-visible states |
| Standard | 250ms | ease-in-out | Future drawer or panel state changes |
| Emphasis | 450ms | cubic-bezier(0.16, 1, 0.3, 1) | Future page entry moments |

### Rules

- Animate only color, opacity, transform, or filter.
- Respect `prefers-reduced-motion`.
- Every interactive element must expose hover, active, and keyboard focus states.

## 7. Depth & Surface

### Strategy

Depth uses a mixed strategy: tonal shifts first, subtle borders second, and low-opacity shadows only when a surface must lift above the page.

| Level | Token | Usage |
| --- | --- | --- |
| Subtle | `--shadow-xs` | Resting cards and compact controls |
| Default | `--shadow` | Content panels |
| Elevated | `--shadow-lg` | Future popovers and dialogs |

Rules:

- Shadows are restrained and neutral; no glow effects.
- Panels use `--card`, `--border`, and `--shadow-sm` before stronger elevation.
- Radius derives from `--radius`; repeated cards use `--radius-md` or `--radius-lg`.
