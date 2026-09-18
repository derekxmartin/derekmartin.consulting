# Verification and design QA

Verified September 17, 2026 on Windows with Node 24.11.0, Next.js 16.3.5, Playwright 1.63.0, installed Chrome and Playwright WebKit 26.6.

## Results

| Check | Result |
| --- | --- |
| Production build | Passed; all specified page routes and the inquiry handler compile |
| TypeScript | Passed |
| ESLint | Passed |
| Focused unit/API tests | 15 passed |
| Chromium browser scenarios | 8 passed; changed menu and screenshot checks rerun after final visual fixes |
| WebKit mobile flow | Passed across nine page routes, menu, service preselection, validation and signed mock confirmation |
| Responsive layout | No page overflow on the eight primary/supporting pages at 320, 360, 390, 768, 1024 and 1440 CSS pixels |
| Case table | Mobile table scroll stays inside its labeled region; corrected and verified in WebKit |
| Accessibility audit | axe-core 4.12.1: zero detected violations on Home, Services and Contact in Chromium |
| Keyboard | Mobile menu, Escape/focus return, field-error focus and semantic links exercised |
| Reduced motion | Smooth scrolling disabled under the reduced-motion preference |
| Zoom reflow | Checked at 720 CSS pixels, equivalent to a 1440-pixel viewport at 200% browser zoom |
| Production runtime smoke test | Nine routes return 200; unknown, unpublished and fixture routes return actual 404; direct Thanks is neutral; mock production submissions return 503 without a receipt |
| Metadata/assets | Preview noindex controls, empty preview sitemap, local font, favicon and generated PNG social card verified |

The inquiry tests cover field normalization and limits, invalid services, unsupported URLs, malformed/oversized requests, origin restrictions, honeypot, conditional dates, concurrent/repeated requests, provider failures and ambiguous responses, shared-state integration boundary, receipt signatures/expiry, and production mock rejection. Browser tests use synthetic values and do not send email.

The Resend adapter was tested with an injected HTTP implementation. Redis behavior is implemented with the provider SDK, but no real Upstash account or deployed multi-instance test was available. Local mock rate limiting is exercised separately and is not presented as production evidence.

## Comparison with Connected

The original supplied reference was opened before authoring. Actual desktop and mobile Home screenshots were visually compared with it; no pixel-difference claim is made.

Preserved: the left-aligned oversized two-line headline, generous porcelain background, forest-green typography, restrained mint technical field, thin rules, aligned margins, and a solid primary action paired with a quiet underlined link. Manrope is loaded from a local licensed variable font.

The desktop hero uses the authored 1280-pixel container and 112-pixel headline at a 1440-pixel viewport. On a 390-pixel phone, the headline is 64 pixels, the primary action remains visible early, and the diagram is rebuilt as a vertical source/configuration path with three readable destinations.

Intentional differences from the raster concept:

- The header uses Services, Work, How it works, About and Request a project, as required by the written brief.
- The illustration includes an implementation stage, Floodlight and ad-platform tagging, with a clear illustrative caption and no invented official logos.
- The service index precedes Work, using open ruled rows. Floodlight is second and has equal detail and visual prominence.
- The demo cards in the concept are replaced with an honest empty portfolio. No completed demo or client evidence was supplied.
- Process and About use distinct editorial compositions; Contact is a plain accessible form without a decorative enclosing card.

Issues corrected during review: a font import path, a local-origin mismatch in inquiry submission, a hidden skip-link leaking into full-page screenshots, narrow-screen evidence-table overflow, and Safari-style pointer focus preventing the original Escape handler from receiving the key event. Mobile routing branches were clarified.

## Screenshots

| Page/state | Desktop | Mobile |
| --- | --- | --- |
| Home viewport | [1440 × 1000](screenshots/home-desktop.png) | [390 × 844](screenshots/home-mobile.png) |
| Home full page | [Desktop](screenshots/home-desktop-full.png) | [Mobile](screenshots/home-mobile-full.png) |
| Services | [Desktop](screenshots/services-desktop.png) | [Mobile](screenshots/services-mobile.png) |
| Complete Floodlight section | [Desktop](screenshots/floodlight-desktop.png) | [Mobile](screenshots/floodlight-mobile.png) |
| Work empty state | [Desktop](screenshots/work-desktop.png) | [Mobile](screenshots/work-mobile.png) |
| Case-study fixture | [Desktop](screenshots/case-fixture-desktop.png) | [Mobile](screenshots/case-fixture-mobile.png) |
| Contact | [Desktop](screenshots/contact-desktop.png) | [Mobile](screenshots/contact-mobile.png) |
| Contact validation | [Desktop](screenshots/contact-errors-desktop.png) | [Mobile](screenshots/contact-errors-mobile.png) |

Also captured: [expanded mobile menu](screenshots/mobile-navigation.png), [WebKit Home](screenshots/home-webkit-mobile.png), [social-sharing card](screenshots/social-card.png).

## Honest limits and release checks

- Local delivery is mocked. No real email was sent, no inbox was verified and no production domain was published.
- No real portfolio material is published. The development fixture is not proof of tracking implementation or destination acceptance.
- Privacy remains a draft; public contact details, delivery settings and confirmed platform support still need owner review.
- Analytics is disabled. The optional event boundary has no active vendor adapter, identifiers or approved consent setup.
- Windows WebKit passed functional and overflow checks but paints the variable font much lighter than Chromium, despite the specified CSS weights. Similar Windows WebKit font discrepancies have been [reported to Playwright](https://github.com/microsoft/playwright/issues/7441). This is a possible environment-specific explanation, not verification on Apple hardware. Native Safari/iOS typography remains a release check; the WebKit screenshot is retained to make the difference reviewable.
- The automated accessibility audits and manual interaction checks are not a WCAG certification. A screen-reader pass and real-device review remain useful release checks.
- Lighthouse performance scores and production LCP/CLS were not measured. The brief's 90+ performance and 95+ accessibility targets are not claimed as achieved. Field metrics do not yet exist.

See [the launch checklist](LAUNCH-CHECKLIST.md) for the exact production setup and remaining owner inputs.

## CSS background motion update

Added at the owner's request, then strengthened after feedback that the first pass was not visible. The original 24–36 second drift was too faint, and the narrow-screen rules pushed almost all of it outside the owner's 735-pixel preview.

The current effect uses static SVG connector tracks with mint dashes animated entirely by CSS `stroke-dashoffset` over 12–15 seconds. Two dashes per path keep movement visible in short viewports. The hero's flat mint accents also move farther over 14–18 seconds. There are no animation scripts or new dependencies. Decorative layers are hidden from assistive technology, ignore pointer input and are clipped to prevent page overflow. All animations remain conditional on `prefers-reduced-motion: no-preference`, with the existing global reduced-motion override preserved.

Verified the updated effect in the owner's actual How it works preview (735 × 436), including its normal motion preference, changing dash positions, and visible movement after reloading. Also visually reviewed How it works at phone width and Home at a 1280-pixel desktop width. No horizontal overflow was found and the background does not capture pointer input. Build and lint passed. The `motion-*` screenshots above document the earlier, superseded pass, not this stronger revision.

## CSS menu swivel

The compact navigation now pivots from its top-right corner, with staggered link reveals and a plus icon that rotates into a close icon. Opening and closing use CSS transitions; React only retains the existing disclosure state and Escape behavior. The panel overlays the page, stays within short viewports and scrolls internally when needed. Reduced-motion mode removes the transforms and transitions.

Build, lint and the existing mobile-menu interaction test passed (open, Escape with focus return, and navigation with automatic closure). Additional browser checks confirmed a fully opaque open panel with no horizontal overflow at 390 pixels, closed links excluded from keyboard navigation, zero transition duration and no panel transform under reduced motion, and a panel bottom of 405 pixels in the owner's 436-pixel-tall preview. The [mobile navigation screenshot](screenshots/mobile-navigation.png) shows the settled open state.

## Typed events and implementation pulses

At the owner's request, the hero now types and erases four illustrative labels: `website event`, `add_to_cart`, `generate_lead`, and `purchase`. Each six-second sequence sends a mint signal from the source to configuration, then along all three destination branches. Expanding outlines and a brief mint fill mark source, configuration and destination activity. Mobile uses vertical SVG routes with the same CSS timing. All motion, including the typing and caret, uses CSS; the diagram remains a Server Component with no timers, animation library or telemetry.

Verified partial typing and all four full labels at sampled animation times, followed the source/configuration/destination phases, and checked label fit and horizontal overflow at 320, 390, 735, 768, 1024, 1280 and 1440 pixels. Corrected a wide-mobile ripple that could extend beyond the viewport. Reduced-motion emulation showed zero animations, a visible static Website event label, and a hidden typing layer. Build and lint passed, and the updated sequence was inspected in the owner's live preview.

Visual checks: [desktop destination pulse](screenshots/flow-pulse-1440.png), [mobile destination pulse](screenshots/flow-pulse-390.png), and [signals in transit](screenshots/flow-pulse-transit.png).

## Advertising platform logos

Replaced the generic Ad platform label with inline Google Ads, Facebook and TikTok SVG marks, preserving the destination pulse. Paths are sourced from [Simple Icons](https://github.com/simple-icons/simple-icons), stored locally in `src/content/platforms.ts`, and rendered in the site's ink color with no external runtime requests. Each SVG includes a title, and the figure's accessible description names the platforms.

Build and lint passed. Browser checks confirmed all three logos fit at 320, 390, 735, 1024 and 1440 pixels without horizontal overflow. Reviewed the [desktop](screenshots/platform-logos-1440.png), [mobile](screenshots/platform-logos-390.png), and refreshed in-app preview.

Follow-up: replaced GA4 with the Google Analytics SVG and represented Floodlight with the Campaign Manager 360 SVG, also from Simple Icons. The SVG title and accessible figure description explicitly identify Campaign Manager 360 / Floodlight; this is a product mark used to represent its tracking feature, not a separate Floodlight logo. See [Google's product overview](https://support.google.com/campaignmanager/answer/10534982). Removed the superseded generic endpoint squares and their unused animation rules. Destination pulses continue around every logo box.

Build and lint passed after this follow-up. Both new marks fit at the same five checked widths, with no horizontal overflow. Reviewed the final [desktop](screenshots/all-platform-logos-1440.png) and [mobile](screenshots/all-platform-logos-390.png) graphic and refreshed the in-app preview.

## Service icon tooltips

All five platform marks now have styled tooltips on pointer hover and keyboard focus. Labels remain open when the pointer moves onto them and dismiss with Escape without moving keyboard focus. Long measurement names use mobile-specific positioning to stay inside the viewport. Replaced the native SVG titles to avoid duplicate hover labels and exposed the named icons to assistive technology while keeping the decorative animation hidden. A small client component handles interaction and Escape; the tooltip transition and existing diagram animations remain CSS-driven.

Build and lint passed. Verified every tooltip at 320, 390, 735, 1024 and 1440 pixels for hover, pointer movement onto the tooltip, Escape dismissal, viewport fit and page overflow. All five labels also passed keyboard focus and Escape checks. Reduced-motion mode has zero tooltip transition duration, and no browser errors were observed. Reviewed [desktop](screenshots/service-tooltip-desktop.png) and [mobile](screenshots/service-tooltip-mobile.png) screenshots and refreshed the live preview.

## Supplied animated header wordmark

Integrated the owner's `derek-martin-animated-header-logo` package into the header home link. The animated and static SVGs are copied unchanged into `public/brand` with the supplied Manrope OFL license. The logo renders at 44 pixels high on desktop and 40 pixels on phones, with its full aspect ratio reserved from the start. The SVG handles its one-time opening animation; no logo animation scripts were added. A picture source selects the supplied static SVG for reduced-motion users. The accessible home-link name and swivel navigation remain in place.

Build, lint and the mobile-menu interaction test passed. Browser screenshots confirmed that the opening frame changes into the completed wordmark while its bounds remain identical. The same image element remains mounted after client-side navigation. Checked widths 320, 390, 735, 768, 1024 and 1440 with no horizontal overflow, verified selection of the static SVG under reduced motion, and observed no browser errors. The in-app preview was refreshed at the header to show playback.

Visual checks: [opening mark](screenshots/header-logo-opening.png), [completed mark](screenshots/header-logo-complete.png), [desktop header](screenshots/animated-header-1440.png), and [phone header](screenshots/animated-header-390.png).
