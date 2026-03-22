# FYWarehouse Analytics Integration

## Day 11 scope

This project now includes:

- GA4 loader via `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Optional GTM loader via `NEXT_PUBLIC_GTM_ID`
- Production-only analytics dispatch
- Cookie consent gate before any analytics script loads
- Page-view tracking for App Router navigation
- Event tracking for key conversion and engagement actions

## Environment variables

Set these in `.env.local` for local production-like testing or in Vercel for production:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## Current tracked events

- `page_view`
- `cookie_consent_updated`
- `contact_form_submit_success`
- `contact_form_submit_error`
- `phone_click`
- `email_click`
- `navigation_click`
- `logo_click`
- `service_click`
- `map_interaction`
- `external_link_click`

## Privacy behavior

- Analytics stays disabled in development.
- Analytics stays disabled in production until the visitor accepts the cookie banner.
- Consent choice is stored in `localStorage` under `fywarehouse-analytics-consent`.
- Visitors can reopen consent controls through the `Privacy settings` button.

## Original site notes

Reference-only findings from the source site analysis:

- Google tag reference observed: `GT-KFN9SQ8`
- Google site verification token observed: `X_44blTG5zrUgEanEoicHXtMS0zG9HeLEr2YyzsYXwE`
- Baidu analytics logic observed: `recordBaiDuAnalyticsCookies`

These values are documented for auditing only and are not injected into this clone automatically.
