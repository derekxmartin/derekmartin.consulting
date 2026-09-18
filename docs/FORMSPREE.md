# Formspree delivery

The existing contact form uses Formspree when `FORMSPREE_FORM_ID` is configured.
This public routing ID takes precedence over the legacy local mock/Resend flow.
Formspree delivery needs no Resend, Redis, or receipt-signing credentials.

1. Create a form in the owner's Formspree account and verify its notification recipient.
2. Copy the ID from `https://formspree.io/f/FORM_ID`.
3. Set `FORMSPREE_FORM_ID=FORM_ID` in Vercel's Production environment and redeploy.
4. Review the form's spam protection and domain settings in Formspree. Custom CAPTCHA settings require the corresponding client integration; don't enable custom keys without wiring them into the form.
5. Submit an owner-approved live test and confirm it appears in both Formspree and the recipient inbox.

The client uses the official Formspree React SDK, sends all project fields plus an empty `_gotcha` honeypot, and displays confirmation only after provider acceptance. Email inbox delivery still needs verification. Failed requests preserve the fields. Network errors are treated as uncertain; retries may produce duplicates. A stable submission reference is included for reconciliation, not a promise of server-side deduplication.

Formspree submissions do not use the legacy `/contact/thanks` receipt cookie or store form content in browser storage. Success is shown inline. The old API remains for mock/Resend use when no Formspree ID is configured.

Automated checks use a fake ID and intercept every provider request:

```sh
npm run build
npx playwright test --config playwright.formspree.config.ts
```

References: [React library](https://help.formspree.io/articles/working-with-react/the-formspree-react-library), [honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering).
