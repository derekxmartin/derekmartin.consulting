# Derek Martin header logos

Three original SVG treatments for the navigation-bar identity. All have transparent backgrounds, outlined lettering and no external dependencies.

- A: Connected monogram, a single-line lowercase name beside outlined DM initials.
- B: Stacked monogram, a solid emblem beside a two-line name.
- C: Framed wordmark, custom corner strokes framing the lowercase name.

View header-logo-options.png to compare at realistic header size. The navigation around each logo is presentation context, not part of the individual logo file.

## Use

Replace the existing name text with the selected SVG inside the existing home link. Start at 40-44 px high on desktop and 36-40 px on mobile, using width: auto. Preserve its aspect ratio. Use alt="Derek Martin" on the image and an accessible home-link name. Do not retain a second visible name alongside it. Keep other navigation and buttons as HTML.

Example:

```html
<a href="/" aria-label="Derek Martin home">
  <img src="/derek-martin-b-stacked-monogram.svg" alt="Derek Martin" style="height:44px;width:auto;display:block" />
</a>
```

Forest green: #073D33. Mint accent: #94CFB3. Light backgrounds are recommended. Lettering uses Manrope converted to paths. Its SIL Open Font License is included; no font installation is required.
