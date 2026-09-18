# Website measurement

- GTM container: `GTM-PH8ZXNF6`; version 2, **Consent-aware GA4 and inquiry events**.
- GA4 property: `derekmartin.consulting` (`554826594`).
- Web stream: `Derek Martin Consulting - Website` (`15802919311`).
- Measurement ID: `G-J2T8NHV8VV`.

## Consent and environments

The analytics UI renders on Vercel production only. Local and preview deployments do not load analytics unless `ANALYTICS_TEST=1` is explicitly set at build and runtime.

No Google scripts load before acceptance. The versioned `dm-analytics-consent-v1` localStorage value remembers acceptance or decline; if storage is unavailable, the choice applies to the current visit. Both choices have equal prominence. Cookie settings in the footer reopens the preference panel.

Acceptance enables analytics storage. Advertising storage, advertising user data and ad personalization remain denied. Withdrawal disables the GA4 measurement ID, stops custom events, updates analytics consent and clears first-party GA cookies. On the next load, Google scripts remain unloaded. A script that was already loaded remains in memory until navigation/reload; withdrawal stops collection without needing to reload.

## Events

| Event | Trigger | Parameters |
| --- | --- | --- |
| `page_view` | Google tag on initial load; enhanced measurement on browser history navigation | GA4 page location, title and referrer |
| `service_cta_click` | A service-specific link to the contact page | `service_id`, `placement` |
| `form_start` | First change to an inquiry field after consent | `form_id` |
| `generate_lead` | Confirmed successful Formspree response | `form_id`, `service_id` |
| `form_error` | Validation, provider error or uncertain delivery | `form_id`, `error_category` |
| `email_click` | Email link click | `placement` |
| `phone_click` | Telephone link click | `placement` |
| `linkedin_click` | LinkedIn link click | `placement` |

`generate_lead` is a GA4 key event, counted once per event with no default monetary value. It confirms provider acceptance, not inbox delivery or a qualified sale. Declined analytics and ad blockers intentionally result in unmeasured inquiries; use Formspree as the source of truth for submissions.

Automatic GA4 **Form interactions is OFF**, preventing automatic `form_start`/`form_submit` duplicates. Page views/history changes and the other existing enhanced measurement options remain on. Do not add a second Google tag or manually send page views without first disabling the corresponding automatic measurement.

GTM uses one Google tag on Initialization - All Pages and one GA4 Event tag with an exact allowlist of seven custom event names. Four Data Layer variables map the parameters. `gtm-events-import.json` contains the custom event configuration, **not** the separate base Google tag; merge imports rather than overwriting a populated container.

Only fixed public identifiers and categories enter custom events. Inquiry names, email addresses, telephone numbers, website URLs and message bodies are not passed to analytics. Optional Data Layer parameters are cleared on each event to avoid carrying values across events. GA4's existing email redaction is enabled. Do not place private information in page URLs or campaign parameters.

## Verification

For device-specific problems, open `/contact?analytics-debug=1`. The collapsible panel reports saved consent, the GA disable flag, script presence, GTM execution, queued form event counts and visible form success. Use **Copy diagnostic report** to share those values. It excludes form contents, cookie values, client IDs and request payloads. Resource timing counts are observations, not evidence of GA4 receipt; browsers may omit or limit them. This panel does not change consent, send events or submit the form.

PowerShell (with Node/npm on PATH):

```powershell
$env:ANALYTICS_TEST='1'
npm run build
npx playwright test --config playwright.analytics.config.ts
```

The repeatable tests run desktop Chrome and iPhone WebKit. They stub Google scripts and Formspree to check consent persistence, single container loading, withdrawal, failed inquiries, one lead on success and exclusion of inquiry values. No test inquiries are sent.

Before release, also test the published GTM/gtag scripts while intercepting `*.google-analytics.com/*collect` requests. Check one pageview per visited route with the correct title/referrer, each custom event's payload, one `form_start`, no `form_submit`, and zero collection after withdrawal. Intercept Formspree responses; do not send fake inquiries or lead events into live reports.

In GA4, use Realtime to confirm a real accepted visit, then Traffic acquisition with the `generate_lead` key event to compare campaigns. Event-scoped custom dimensions expose service, placement, form and error category in explorations. Standard reports and newly registered dimensions need processing time before data appears.
