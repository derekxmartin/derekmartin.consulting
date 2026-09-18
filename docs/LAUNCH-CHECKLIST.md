# Production setup and owner inputs

This milestone is a local content-review build. It has not been published to the production domain. A passing build does not establish email inbox delivery or production analytics.

## Remaining owner decisions

- Review provisional copy and confirm the personal-name identity.
- Confirm the advertised service capabilities. Individual platform examples remain unconfirmed and hidden in `src/content/services.ts`.
- Designate the public contact address, owner inbox and verified sending domain.
- Supply publishable work, screenshots and evidence; confirm client permissions where applicable.
- Complete and review the privacy notice, including contact, processors, retention and applicable operating details. Then update `privacyContentApproved` in `src/content/site.ts`.
- Confirm the use of `derekmartin.consulting` at launch and provision its hosting and DNS.
- Leave analytics off unless real identifiers, an adapter and approved consent behavior are supplied.

Unknown rates, turnaround promises, availability, correction-period duration, portrait and social links are omitted. None blocks reviewing the local implementation.

## Real inquiry delivery

1. Create a Resend account and verify a sending domain. Select the owner-specified recipient; do not infer a test recipient from prior clients.
2. Provision one Upstash Redis database for shared rate limiting and idempotency.
3. Set the private hosting environment variables below. Never use `NEXT_PUBLIC_` for these secrets.
4. Select `INQUIRY_DELIVERY=resend`. In production, `mock` always fails safely.
5. Run an owner-authorized end-to-end test with the actual recipient. Confirm the message arrives, contains the correct fields, uses a verified sender and has the visitor's email as Reply-To.
6. Confirm retry behavior and rate limiting with the deployed architecture. Keep this production check separate from local mock results.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Trusted canonical origin and allowed form origin, including `https://` and no trailing slash |
| `SITE_ENV` | Use `preview` until release; `production` enables eligible public indexing |
| `INQUIRY_DELIVERY` | `resend` for actual delivery; `mock` only for development |
| `RESEND_API_KEY` | Authenticated email delivery |
| `CONTACT_FROM_EMAIL` | Verified sender address |
| `CONTACT_TO_EMAIL` | Designated owner inbox or explicitly approved test recipient |
| `RECEIPT_SIGNING_SECRET` | Random secret of at least 32 characters; signs receipts and hashes network identifiers |
| `UPSTASH_REDIS_REST_URL` | Shared Redis service URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication secret |

Vercel's exact `VERCEL_URL` is allowed for Vercel previews. Add any additional trusted preview aliases deliberately rather than accepting arbitrary request Host headers. Only loopback origins on the development server's port are automatically allowed in development.

## Behavior and retention of technical state

- Delivery waits for the provider acknowledgment. This is acceptance for delivery, not evidence of actual inbox arrival.
- Notification content is plain text. Visitor input cannot set From or Subject, and the server never fetches the supplied client website.
- Requests are capped at 32 KiB. The body-read timeout is five seconds; email requests time out after ten seconds; Redis requests have a 2.5-second timeout and automatic retries disabled.
- Five validated attempts per hashed network identity in a 15-minute sliding window. The rate limiter fails closed if storage is unavailable.
- On Vercel, the overwritten `x-vercel-forwarded-for` header supplies the network identity. Self-hosted deployments use a conservative shared bucket until their trusted proxy is deliberately configured. Do not simply trust arbitrary forwarded headers.
- Redis holds non-PII request identifiers, one-way payload fingerprints and completion flags for seven days, plus a 45-second delivery lock. It does not store raw inquiry text.
- Provider idempotency keys protect ambiguous retries; identical requests use identical message bodies. The client retries the same UUID and submission timestamp. A changed payload cannot reuse an accepted reference. Requests expire after 23 hours so a stale client cannot cross the provider's 24-hour idempotency window.
- Confirmation receipts are signed, HTTP-only, SameSite=Lax, Secure in production and scoped to `/contact/thanks`. They expire after 15 minutes and contain no inquiry content.
- The implementation does not log request bodies or form values. Review hosting and provider access/log retention separately before launch.
- In development only, mock storage lives in process memory and resets with the server. `MOCK_OUTCOME=success`, `failure` or `timeout` exercises local states; restart the dev server after changing it.

## Vercel deployment preparation

1. Put this repository in the owner's Git hosting account when ready. The supplied workspace did not have a Git repository; no remote was invented.
2. Import into Vercel as a Next.js project, with the repository root as the project root. Use Node 24, `npm ci` and `npm run build`.
3. Configure environment values separately for preview and production. Keep `SITE_ENV=preview` while reviewing. A production-built preview requires real delivery settings if you want its form to send.
4. Deploy a preview when authorized. Confirm the `noindex` metadata and response header. Vercel previews remain noindex even if `SITE_ENV` is accidentally set to production.
5. Complete the owner inputs and real integration checks before the production release.
6. Set the canonical production origin, approved privacy content and `SITE_ENV=production`. Connect the domain using Vercel's current DNS instructions, then verify HTTPS and canonical behavior.
7. Test navigation, service preselection, a real inquiry, neutral direct Thanks, the 404 routes and the public sitemap on the final domain.

No production deployment, live notification email or analytics activation has been performed in this task.
