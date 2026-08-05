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
| Text/muted | `--muted-foreground` | `oklch(0.5300 0 0)` | `oklch(0.7080 0 0)` | Dates, captions, hints |
| Surface/accent | `--accent` | `oklch(0.9500 0 0)` | `oklch(0.3710 0 0)` | Hover and selected states |
| Text/accent | `--accent-foreground` | `oklch(0.2050 0 0)` | `oklch(0.9850 0 0)` | Text on accent surfaces |
| Status/destructive | `--destructive` | `oklch(0.5770 0.2450 27.3250)` | `oklch(0.7040 0.1910 22.2160)` | Error and destructive actions |
| Text/destructive | `--destructive-foreground` | `oklch(1 0 0)` | `oklch(0.9850 0 0)` | Text on destructive actions |
| Border/default | `--border` | `oklch(0.9220 0 0)` | `oklch(0.3200 0 0)` | Dividers and panel outlines |
| Field/input | `--input` | `oklch(0.9220 0 0)` | `oklch(0.3200 0 0)` | Search field and future form controls |
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
| Sidebar/border | `--sidebar-border` | `oklch(0.9220 0 0)` | `oklch(0.4600 0 0)` | Sidebar dividers |
| Sidebar/ring | `--sidebar-ring` | `oklch(0.7080 0 0)` | `oklch(0.4390 0 0)` | Sidebar focus rings |

### Rules

- The palette is intentionally neutral; use chart blues only for data visualization or future technical accents.
- `--primary` is for action and active state, never decoration.
- Every UI color must map to this table or the Tailwind `@theme inline` aliases in `src/app/globals.css`.
- `--border` stays distinct from `--muted` and `--accent` so an outline reads as an edge rather than disappearing into a fill.

## 3. Typography

### Scale

Every level maps to a stock Tailwind utility. The scale carries no value the framework cannot express, so a level can be applied without arbitrary syntax.

| Level | Size | Weight | Line Height | Utilities | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | `3rem` | 700 | 1.1 | `sm:text-5xl font-bold sm:leading-[1.1]` | Page title from the `sm` breakpoint up |
| H1 | `2.25rem` | 700 | 1.15 | `text-4xl font-bold leading-[1.15]` | Page title |
| H2 | `1.5rem` | 700 | 1.25 | `text-2xl font-bold leading-tight` | Section heading |
| H3 | `1.25rem` | 700 | 1.35 | `text-xl font-bold leading-[1.35]` | Post card titles |
| Body/lg | `1.125rem` | 400 | 1.65 | `sm:text-lg leading-[1.65]` | Intro copy from the `sm` breakpoint up |
| Body | `1rem` | 400 | 1.65 | `text-base leading-[1.65]` | Default prose and UI text |
| Body/sm | `0.875rem` | 400 | 1.55 | `text-sm leading-[1.55]` | Secondary UI |
| Caption | `0.75rem` | 600 | 1.4 | `text-xs font-semibold leading-[1.4]` | Labels, dates, metadata, taxonomy chips |

Display and Body/lg are the responsive halves of H1 and Body rather than separate choices: a page title is `text-4xl sm:text-5xl`, and intro copy is `text-base sm:text-lg`.

Headings inside rendered Markdown are not on this scale. They come from `@tailwindcss/typography`, which owns the prose rhythm; only `scroll-mt` is overridden there.

### Font Stack

- Primary: `Pretendard Variable`, `ui-sans-serif`, `sans-serif`, `system-ui`
- Mono: `Geist Mono Variable`, `ui-monospace`, `monospace`
- Serif: `ui-serif`, `Georgia`, `Cambria`, `"Times New Roman"`, `Times`, `serif`

The Pretendard and Geist Mono variable WOFF2 files are owned under `public/fonts`, together with their SIL Open Font License files. Production builds must serve these repository assets directly and must not fetch fonts from Google Fonts, CDNs, or font packages.

### Rules

- Letter spacing stays at `0`; use weight and scale for hierarchy.
- Body text never drops below `0.875rem`.
- Headings use `font-bold` (700) and captions `font-semibold` (600). Nothing in between, so a level always has a utility.
- Mono is reserved for code-oriented content such as inline code, fenced code blocks, keyboard input, and sample output. General labels, slugs, dates, tags, and navigation inherit the primary sans font.

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

- Shell max width: `1440px`.
- Page content may still use narrower inner widths when readability or sparse content needs it.
- Shell direction: below Tailwind `xl` (`1280px`), profile stacks above content; from `1280px`, sidebar and content sit side by side.
- Breakpoints: Tailwind defaults, with first QA targets at 375px, 768px, 1279px, 1280px, and 1440px.

### Rules

- Use stable dimensions for controls and panels to avoid layout shift.
- Prefer full-width bands and constrained inner content over nested cards.

## 5. Components

### Theme Menu

- **Structure**: an icon-only trigger that opens a menu of three radio options: System, Light, Dark. A menu rather than a segmented control because the trigger sits in the sidebar action row beside GitHub, mail, and RSS, where three inline labels would not fit at `240px`.
- **Trigger**: `2.25rem` square, matching the other sidebar action buttons, showing the icon of the mode currently in effect.
- **Surface**: the panel uses `--sidebar`, `--sidebar-border`, and an elevated shadow; it opens upward because the sidebar action row sits low in the panel.
- **States**: the selected option uses `--accent` and `--accent-foreground`; hover and keyboard highlight share that treatment.
- **Accessibility**: the trigger is labelled `Theme mode`; the options are radio menu items, so the selected one is announced through `aria-checked` rather than `aria-pressed`.
- **Motion**: color and background transitions only, 150ms.
- **Persistence**: the choice is stored in `localStorage` and re-applied by an inline script before first paint, so no flash of the wrong theme occurs. `system` keeps following the operating system after load.

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

### Pagination

- **Reference**: adapt Chirpy's quiet pagination states without copying its mobile page-index behavior.
- **Structure**: previous control, up to five consecutive page links, and next control remain visible in one centered row.
- **Dimensions**: every control is `2rem` square; the row uses a deliberate half-step gap of `0.125rem` (2px) to fit seven controls on narrow screens.
- **Shape**: use the compact-control radius `--radius-compact` (`0.5rem`) so square controls retain card-like corners instead of inheriting the circular `--radius-lg` silhouette.
- **Current page**: use `--muted` and `--foreground` as a filled state without a visible outline.
- **Inactive page**: keep the resting surface transparent; hover adds a `--border` outline without shifting layout.
- **Boundary controls**: previous and next keep their positions on the first and last pages and use a visibly disabled, non-interactive state.
- **Responsive behavior**: preserve the same five-number window on mobile instead of switching to Chirpy's current/total index.
- **Accessibility**: expose the current page with `aria-current="page"`, disabled controls with `aria-disabled="true"`, and retain visible keyboard focus rings.

### Post Detail

- **Structure**: one centered article panel with a compact return link, theme control, metadata header, and rendered Markdown body.
- **Width**: from `xl`, the body shares the row with a `14rem` table-of-contents rail, so the reading column is narrower than on the archive and taxonomy pages.
- **Metadata**: title, description/excerpt, date, reading time, category, pinned state, and optional tags remain visible above the body.
- **Accessibility**: the page uses semantic `main`, `article`, `header`, `time`, and link elements.

### Markdown Content

- **Structure**: rendered HTML is wrapped by one component that scopes typography and spacing to descendants.
- **Typography**: `@tailwindcss/typography` owns the prose rhythm, so body headings follow its scale rather than §3; body copy keeps a relaxed line height for Korean reading.
- **Code**: inline code and code blocks use mono text and muted surfaces. Fenced blocks are highlighted at build time by Shiki through `rehype-pretty-code`, which emits both themes as CSS variables so light and dark switch without re-highlighting. Inline code is left unhighlighted.
- **Anchors**: heading ids are the plain GitHub-style slug, and the table of contents links to the same ids. Landing offset comes from `scroll-margin` alone, so a heading sits in the same place whether it was reached from the table of contents, its own anchor, or a pasted URL.
- **Task lists**: GFM checkboxes are read-only and carry their completion state as an accessible name.
- **Safety**: raw HTML passthrough is disabled in the Markdown pipeline.

### Mermaid Diagram

- **Source contract**: a fenced `mermaid` block is the only syntax that enables diagram rendering; inline text and similarly named languages remain ordinary code.
- **Progressive enhancement**: the static export contains escaped source in a readable fallback, then a diagram-post-only client leaf replaces it with SVG after hydration.
- **Surface**: diagrams use `--muted`, `--border`, and `--radius-md`, with horizontal overflow contained inside the article on narrow screens.
- **Theme**: SVG output follows the current light or dark mode and is regenerated when the site theme changes.
- **Failure state**: invalid Mermaid keeps the escaped source visible and exposes a concise accessible error; content must never disappear.
- **Safety**: Mermaid runs with `securityLevel: "strict"`; raw HTML, click callbacks, and unsafe links are not enabled.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Micro | 150ms | ease-out | Theme buttons, links, focus-visible states |
| Standard | 200ms | ease-out | Mobile table-of-contents drawer and reading bar |
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
| Elevated | `--shadow-lg` | Dialogs and drawers, such as the mobile table of contents |

Rules:

- Shadows are restrained and neutral; no glow effects.
- Panels use `--card`, `--border`, and `--shadow-sm` before stronger elevation.
- Radius derives from `--radius`; repeated cards use `--radius-md` or `--radius-lg`.
