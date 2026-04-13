# FYWarehouse Netlify Deployment Guide

## Deployment target
- Repo: `tonygu0826/fywarehouse-nextjs`
- Framework: Next.js 14 App Router
- Recommended host: Netlify with `@netlify/plugin-nextjs`
- Target URL: `https://fywarehouse-nextjs.netlify.app`

## 1. Netlify site setup
1. In Netlify, choose **Add new site → Import an existing project**.
2. Connect GitHub and select `tonygu0826/fywarehouse-nextjs`.
3. Confirm:
   - Build command: `npm run build`
   - Node version: `20`
   - Base directory: empty / repo root
4. Keep `netlify.toml` committed so the Next.js plugin and headers are applied automatically.

## 2. Required environment variables
Set these in **Site configuration → Environment variables** before enabling full production behavior.

### Required for interactive map
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Required for live contact email delivery
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_SECURE`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`
- `EMAIL_TO`
- `ALLOWED_ORIGIN=https://fywarehouse-nextjs.netlify.app`

### Optional rate-limit tuning
- `CONTACT_RATE_LIMIT_WINDOW_MS=60000`
- `CONTACT_RATE_LIMIT_MAX=3`

### Optional analytics
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_SENTRY_DSN`

## 3. What the current config does
- Uses `@netlify/plugin-nextjs` for App Router support.
- Applies CSP/security headers for Google Maps, Google Fonts, and the source CDN image hosts.
- Caches `/_next/static/*` and `/assets/*` aggressively.
- Marks `/api/*` as `no-store`.
- Keeps `/sitemap.xml` proxied to the original external sitemap endpoint.

## 4. Production behavior notes
### Contact form
- Client validation runs on blur.
- Server-side origin checks, rate limiting, and honeypot filtering run in `/api/contact`.
- If SMTP env vars are missing, the API returns a clear 503 configuration message instead of silently failing.

### Map
- The Google Map is client-only and code-split from the main route.
- The section waits until near-viewport before loading the Google Maps JS bundle.
- If the API key is missing or invalid, the page still exposes Google Maps and Directions links.

## 5. Pre-deploy verification
Run locally before pushing:

```bash
npm run lint
npm run build
```

Expected current result:
- `npm run lint` passes
- `npm run build` passes

## 6. Post-deploy acceptance checklist
1. Home page loads without hydration errors.
2. Header logo, hero, and all five service cards render correctly.
3. Service images load from FYWarehouse CDN and fall back cleanly if a remote image fails.
4. Contact form validates required fields and returns success/error feedback.
5. `/api/contact/health` reflects SMTP readiness.
6. Map section either loads interactively or shows fallback actions when no key is configured.
7. Responsive breakpoints behave correctly around `727px`, `1200px`, and `1400px`.

## 7. Rollback guidance
If a production deploy regresses:
1. In Netlify, open **Deploys**.
2. Select the previous green deploy.
3. Choose **Publish deploy**.
4. Re-check `/api/contact/health`, the contact form, and the map section.

## 8. Known remaining limitations
- True pixel-perfect verification still requires side-by-side browser comparison against the source site.
- SMTP delivery depends entirely on valid provider credentials configured in Netlify.
- Google Maps styling currently uses the demo map id until a production map id is supplied.
