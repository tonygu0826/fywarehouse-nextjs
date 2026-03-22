# FYWarehouse Day 9 Cross-Browser Compatibility

## Target support matrix

| Browser | Minimum supported version | Notes |
| --- | --- | --- |
| Chrome | 109+ | Primary evergreen Chromium baseline |
| Edge | 109+ | Matches Chromium baseline |
| Firefox | 115+ | ESR-friendly baseline |
| Safari | 15.6+ | Covers current macOS/iOS modern Safari features used by the site |
| iOS Safari | 15.6+ | Mobile baseline for sticky UI, modern layout, and Next.js runtime |

## Explicit non-targets

- Internet Explorer 11 and legacy EdgeHTML are not supported.
- Browsers without CSS custom property support are not targeted by Next.js 14 runtime expectations.

## Day 9 audit summary

### CSS
- Added an explicit PostCSS + Autoprefixer pipeline.
- Added layout fallbacks before `min()` declarations in critical width-constrained blocks.
- Added `position: -webkit-sticky` fallbacks for sticky header and mobile form action area.
- Preserved existing flex/grid layout behavior; no visual redesign was introduced.

### JavaScript / runtime
- App uses modern browser APIs through the Next.js 14 client runtime and Google Maps loader.
- `fetch`, `Promise`, and `async/await` are acceptable for the supported evergreen browser matrix.
- No additional polyfill was added because the defined target baseline already supports the APIs used in the app.
- Google Maps `importLibrary()` remains a modern-browser path; unsupported legacy browsers fall outside the support matrix.

### HTML / accessibility
- Semantic structure is present (`header`, `nav`, `main`, `section`, `article`, `form`).
- Contact form inputs are label-associated and expose `aria-invalid` states.
- Live status/alert regions are present for async form submission and map loading/error fallback states.

### Responsive / media
- Responsive image `sizes` attributes are already in place for hero, service cards, and footer image assets.
- Layout breakpoint remains centered on the existing 727px mobile cutover.
- Next.js provides the base viewport meta; no custom viewport override was required.

## Known constraints

- CSS variable fallback was not expanded for IE-class browsers because they are outside the supported matrix.
- CSS Grid is kept as-is; no IE grid translation was enabled.
- `:focus-visible` remains in use; unsupported browsers gracefully fall back to standard focus behavior.
