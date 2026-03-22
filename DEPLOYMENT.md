# FYWarehouse Deployment Guide

## 1. Environment Variables
Configure these in Vercel Project Settings -> Environment Variables.

### Required
- `NEXT_PUBLIC_SITE_URL`: production site URL, for example `https://www.fywarehouse.com`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key used by the map section
- `EMAIL_SERVER_HOST`: SMTP host
- `EMAIL_SERVER_PORT`: SMTP port (`587` or `465`)
- `EMAIL_SERVER_USER`: SMTP username or API key user
- `EMAIL_SERVER_PASSWORD`: SMTP password or provider API key
- `EMAIL_FROM`: sender identity for contact form emails
- `EMAIL_TO`: recipient inbox for contact form submissions

### Recommended
- `ALLOWED_ORIGIN`: production origin allowed to post to `/api/contact`
- `CONTACT_RATE_LIMIT_WINDOW_MS`: rate-limit window in milliseconds
- `CONTACT_RATE_LIMIT_MAX`: max contact submissions per window per IP
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics placeholder
- `NEXT_PUBLIC_GTM_ID`: Google Tag Manager placeholder
- `NEXT_PUBLIC_SENTRY_DSN`: client-side monitoring placeholder
- `SENTRY_AUTH_TOKEN`: optional source-map upload token
- `VERCEL_PROJECT_PRODUCTION_URL`: documentation/reference field only

Reference templates:
- Development: `.env.example`
- Production template: `.env.production.example`

## 2. Vercel Deployment Steps
1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, create a new project and import the repository.
3. Confirm framework preset is `Next.js`.
4. Vercel will use the committed settings in `vercel.json`:
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add all required production environment variables before the first deployment.
6. Trigger the first production deployment.
7. After deployment, verify:
   - home page renders correctly
   - contact form API returns success with valid SMTP configuration
   - Google Maps loads with the production API key
   - `_next/static` responses include long-term cache headers

## 3. Custom Domain Configuration
1. Open Vercel Project -> Settings -> Domains.
2. Add the production domain, for example `www.fywarehouse.com`.
3. Add the apex domain if needed, for example `fywarehouse.com`.
4. Follow Vercel DNS instructions:
   - `A` or `ALIAS/ANAME` for apex depending on DNS provider
   - `CNAME` for `www` pointing to Vercel
5. Set the primary domain in Vercel.
6. Update `NEXT_PUBLIC_SITE_URL` and `ALLOWED_ORIGIN` to the final production URL.

## 4. SSL / HTTPS
- Vercel provisions SSL certificates automatically after domain verification.
- Keep HTTPS enabled for all traffic.
- The security policy in `vercel.json` and `next.config.mjs` includes `upgrade-insecure-requests`.
- If a custom domain changes, allow certificate re-issuance to finish before traffic cutover.

## 5. Production Optimizations Included
- `reactStrictMode` enabled
- `poweredByHeader` disabled
- response compression enabled
- AVIF/WebP image optimization enabled
- remote image allowlist configured for current CDN/image sources
- immutable caching for `/_next/static/*` and `/assets/*`
- `no-store` caching for `/api/*`
- security headers for CSP, frame policy, referrer policy, permissions policy, and MIME sniffing protection

## 6. CI/CD Workflow
A GitHub Actions workflow is included at `.github/workflows/ci.yml`.

It runs on pushes and pull requests and performs:
- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Add matching GitHub repository secrets for the SMTP and maps variables if you want CI builds to validate with production-like configuration.

## 7. Monitoring and Post-Deploy Checks
Recommended post-deploy checks:
- Vercel deployment logs show successful build and no runtime errors
- Vercel Functions logs show successful `/api/contact` mail delivery
- Google Maps loads without referrer or billing errors
- Lighthouse / Vercel Speed Insights can be enabled after go-live
- Add Sentry or another error-monitoring service when ready using the existing placeholders

## 8. Rollback Guidance
- Use Vercel Deployments -> Promote Previous Deployment for instant rollback.
- If rollback is caused by bad secrets, restore the previous environment-variable values and redeploy.
- Re-test contact form submission and map loading after rollback.
