# EPC QR Code Offline Generator

[Live Demo on GitHub Pages](https://quasistatic-setup.github.io/EPC-QR-Code-Offline-Generator/) · static, offline-capable

A lightweight, fully offline EPC/SEPA QR code generator. Open `index.html` in a modern browser, fill in the payment details, and save the QR code as PNG, SVG or JPG. No server calls; everything runs locally in your browser.

## Screenshots
Advanced section collapsed:

![Advanced collapsed](docs/screenshots/advanced-collapsed.png)

Advanced section expanded:

![Advanced expanded](docs/screenshots/advanced-expanded.png)

## Features
- Offline only: no network requests; all scripts are local. A Content-Security-Policy
  with `connect-src 'none'` makes the browser enforce this, so payment data cannot
  be sent anywhere even if a script were injected
- IBAN validation: live check and readable spacing
- Fields: Recipient, IBAN, Amount (EUR), Payment reference OR Structured reference (RF, ISO 11649), Purpose code, BIC (rarely needed), Note to originator
- EPC payload guard: live byte counter and limit check (max 331 bytes)
- Export: save QR as PNG, SVG, or JPG
- UX niceties: dark/light theme, tooltips, example data, EPC payload details
- Multilingual: English base plus optional locales in `assets/i18n/`

## Quick Start
1. Download the ZIP from the [latest release](https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/releases/latest) and unpack it — or clone the repository.
2. Open `index.html` in your browser (double-click is fine). Optionally serve it via a static file server.
3. Fill in the required fields (Recipient, IBAN, optionally Amount) and click "Generate QR code".
4. Use "Save as" to export the QR code as PNG/SVG/JPG.

Note: The app works entirely offline. You can keep and use it without internet connectivity.

## Releases
- Each release ships a ZIP that unpacks into a ready-to-use folder; there is no build step and no install.
- Version numbers are dates: `YYYY.MM.DD.N`, with `N` counting the releases published that day.
- The footer of the app shows its own version, so you can tell an old offline copy from the [current release](https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/releases/latest).
- Changes per version: [CHANGELOG.md](CHANGELOG.md).
- The live demo always tracks `main`, which can be ahead of the latest release.

## Fields & Rules (Overview)
- Recipient: free text (required)
- IBAN: validated using Mod97; input with or without spaces
- Amount: decimal EUR value; formatted to two decimals on generate
- Payment reference vs. Structured reference: mutually exclusive (use one or the other)
- Purpose code: 1-4 alphanumeric characters (e.g., GDDS, SALA, CHAR)
- BIC: only needed for special/edge cases outside standard SEPA usage
- SEPA Instant: a classic EPC QR code cannot request or force an SCT Inst payment. After scanning, the banking app may offer an instant transfer if the payment and participating banks are eligible.
- EPC payload: maximum length 331 bytes; live counter is shown

## Export
- PNG and JPG: 300x300 px (ECL=M)
- SVG: true vector output, suitable for print

## Internationalization (i18n)
- Base strings: `assets/i18n-core.js` (English)
- Optional languages: individual files under `assets/i18n/<lang>.js`
- When switching the language, the app dynamically loads the file if present
- Add a new translation:
  1) Copy `assets/i18n/de.js` as a template
  2) Fill `window.I18N.<lang> = { ... }`
  3) Name the file using the ISO language code (e.g., `it.js`)

## Project Structure
- `index.html`: UI, styles, and script loading
- `assets/app.js`: App logic (validation, payload build, QR render, export, i18n handling)
- `assets/qrcode.js`: QR library (local)
- `assets/i18n-core.js`: Base i18n (EN)
- `assets/i18n/*.js`: Optional translations (DE, FR, IT, ...)
- `CHANGELOG.md`: what changed per version
- `LICENSE`: MIT license

## Development
- No build step required; static files only
- For local testing, simply open `index.html`
- Or serve via any static server, e.g.:
  - Python: `python -m http.server 8080`
  - Node (npx): `npx serve .`

## GitHub Pages
- Live site: https://quasistatic-setup.github.io/EPC-QR-Code-Offline-Generator/
- In the repo UI: add the link under the “About” box → click the cog icon and set “Website” to the URL above. GitHub will then show a clickable link on the repo homepage.

## Privacy
- No data is transmitted. All inputs stay in the user's browser.

## Support
If this tool helps you and you want to support it:
- Buy Me a Coffee: https://buymeacoffee.com/quasistatic
- Ko-fi: https://ko-fi.com/quasistatic
- GitHub: https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator

## License
MIT — see `LICENSE`.

## Credits
- QR code library: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
  by Kazuhiko Arase, MIT licensed (local copy in `assets/qrcode.js`)
- Footer labels: Emoji glyphs (☕❤️🌐) from system fonts

## Notes
- No Node or test tooling is required; this repo ships static assets only.
- Language selector uses `Intl.DisplayNames` to list languages.
