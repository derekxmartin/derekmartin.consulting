# Derek Martin Consulting

A working local implementation of the Connected website brief. Next.js App Router, TypeScript, CSS Modules, local Manrope, editable service content and a server-side project inquiry flow.

## Run locally

Requires Node.js 24 or later for the installed development tools. Node 24.11.0 was used for verification.

```sh
npm ci
```

Copy `.env.example` to `.env.local` if it does not already exist. The provided local configuration selects mock delivery and disables indexing.

```sh
npm run dev
```

Open [the local preview](http://127.0.0.1:3000). The server binds to the local computer only.

The contact form prominently identifies local test mode. A successful test does not send email. The case-study fixture is available at `/work/layout-preview` only under `next dev`.

## Verify

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run test:webkit
npm run build
npm run test:production
```

The Chromium tests use an installed Chrome browser. Configure `channel` in `playwright.config.ts` for another supported installation. Install the second test engine with `npx playwright install webkit` before running `npm run test:webkit`. The production check starts its own short-lived server on port 3001 and stops it afterward. It deliberately verifies that production refuses mock delivery.

```sh
npm start
```

`npm start` runs the production build. Mock mode is forbidden in that runtime, including production-built previews, and missing real delivery settings produce an honest unavailable state. Use `npm run dev` to review simulated success.

## Edit content

| File | Editable material |
| --- | --- |
| `src/content/site.ts` | Identity, canonical domain fallback, public email, home copy, process, handoff and unresolved owner settings |
| `src/lib/metadata.ts` | Shared page-title format: `Page Name \| Derek Martin, Ad Ops & Tracking`, social titles and indexing rules |
| `src/content/services.ts` | Five service records, examples, deliverables, scoping inputs, optional platform support and FAQs |
| `src/content/work.ts` | Real publishable case studies and publication eligibility |
| `src/content/work-fixture.ts` | Explicitly unpublished layout fixture |
| `src/app/about/page.tsx` | First-person background copy |
| `src/app/contact/page.tsx` | Contact introduction |
| `src/app/privacy/page.tsx` | Privacy draft requiring operating details and review |
| `src/app/getting-started/page.tsx` | Generic client preparation guidance |
| `src/styles/tokens.css` | Connected palette |
| `src/styles/globals.css`, `src/components/*.module.css` | Typography, spacing and page composition |

Optional public email, social profiles, response windows and availability are omitted until configured. The domain supplied in the current user request is the canonical fallback; `SITE_URL` overrides it. No analytics scripts are installed or loaded. Unconfirmed platform examples are held in local content and omitted publicly.

### Publishing portfolio content

Add a typed `CaseStudy` record to `cases` in `src/content/work.ts`. Include substantive implementation notes and actual verification rows before setting `status: 'published'`. For client material, confirm publication permission with `permissionConfirmed: true`. Add only trusted URLs and real local image files with meaningful alt text and dimensions. Missing demo/video links disappear cleanly. Unknown and unpublished slugs return 404.

The route list is generated at build time. Rebuild after publishing a case. No CMS is required.

## Delivery and launch

See [delivery setup and release checklist](docs/LAUNCH-CHECKLIST.md), [verification and design QA](docs/VERIFICATION.md), and [portfolio roadmap](docs/PORTFOLIO-ROADMAP.md).

The real delivery adapter uses the [Resend email API](https://resend.com/docs/api-reference/emails/send-email). [Upstash rate limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) and Redis provide shared abuse prevention and idempotency state. Neither service has been configured or contacted with live credentials.

## Dependencies actually installed

The lockfile is authoritative. Application dependencies: Next.js 16.3.5; React and React DOM 19.3.0; Zod 4.6.5; `@upstash/redis` 1.38.4; `@upstash/ratelimit` 2.1.0; `@fontsource-variable/manrope` 5.3.0.

Development dependencies: TypeScript 6.0.3; ESLint 9.39.5; eslint-config-next 16.3.5; tsx 4.23.13; Playwright 1.63.0; agent-browser 0.38.1; Node types 26.6.1; React/React DOM types 19.3.0.

Manrope is self-hosted from `fonts/manrope-latin.woff2`, with its OFL license in `fonts/OFL.txt`. The favicon and generated social card use the site's identity. There are no external image or font dependencies at runtime.

The source brief remains unchanged in `REQUIREMENTS.md.md`, alongside the original PNG in `references/`.
