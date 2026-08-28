# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versions use CalVer: `YYYY.MM.DD.N`, where `N` counts the releases published on
that day. There is no build step — a release is the state of `main` at the tag,
packaged as a ZIP you can unpack and open. The release workflow refuses to
publish a tag unless `APP_VERSION` in `assets/app.js` and a section in this file
carry the same version.

## [Unreleased]

## [2026.08.28.3] - 2026-08-28

### Added
- The live checks name characters that are outside the SEPA Basic Latin
  Character Set of EPC217-08 (`a-z A-Z 0-9 / - ? : ( ) . , ' +` and space), for
  the recipient, both reference fields and the note to the originator. Banks
  convert, keep or drop everything else at their own discretion, which is why a
  name can arrive incomplete while the QR code is faultless.
- This is a hint, not a block: EPC069-12 allows more than the basic set - its
  own examples read `Franz Mustermänn` and `François D'Alsace S.A.` - and banks
  differ in what they accept.

## [2026.08.28.2] - 2026-08-28

### Fixed
- The page keeps working when the browser refuses storage. `localStorage` was
  read unguarded during start-up, so a blocked-cookies setting left the page
  without a theme, with an empty language selector and without the footer
  version, while the form above still worked.

### Changed
- The footer names the version instead of showing a bare `v2026.08.28.1` in
  link blue: it now reads `Version <number>` in the muted footer colour, and
  the label is translatable.

## [2026.08.28.1] - 2026-08-28

### Fixed
- Umlauts and other non-ASCII characters are written in the character set the
  payload announces. The QR library defaults to ISO-8859-1, and that default was
  never replaced, so a code declaring UTF-8 in line 3 carried Latin-1 bytes:
  `ÄÖ` went in as `c4 d6` instead of `c3 84 c3 96`. Readers that trust the
  announced character set saw invalid bytes, which is why some banking apps
  refused codes that contained a special character.
- Characters that ISO-8859-1 cannot represent are rejected with a message
  instead of being truncated. A Polish `ł` used to arrive as `B`, silently
  changing a recipient name.
- The byte counter and the 331-byte limit measure the character set actually in
  use, so the number below the form is the number that ends up in the code.

### Changed
- The character set list offers UTF-8 and ISO-8859-1 only. EPC069-12 also
  defines ids 3 to 8, but the QR library has no encoder for those ISO-8859
  parts; offering them relabelled the payload while still writing ISO-8859-1
  bytes. UTF-8 covers every character those sets contain.
- Missing translations fall back to English per string instead of per language,
  so a locale that predates a new message no longer shows `undefined`.

## [2026.08.17.1] - 2026-08-17

### Added
- Version indicator in the footer, linked to the releases page, so a downloaded
  offline copy can be matched against a release later on.
- Release workflow: pushing a `v*` tag publishes a GitHub release with a
  ready-to-use ZIP (`index.html`, `assets/`, README, LICENSE, this changelog).
- This changelog.
- Content-Security-Policy with `connect-src 'none'`. The browser now enforces
  the offline promise: the IBAN and amount you type cannot be sent anywhere,
  even if a script were injected.
- `.editorconfig` pinning UTF-8 and LF, so the encoding damage repaired below
  cannot happen again.
- `.gitignore` (Malte Hain).

### Changed
- QR rendering now uses `qrcode-generator`, which encodes umlauts and other
  non-ASCII characters correctly (Malte Hain).
- README credits the QR library actually in use.

### Fixed
- Error correction is pinned to level M, as EPC069-12 requires. When the payload
  grows, the QR version grows instead of the error correction dropping.
- PNG and JPEG export works again for SVG-rendered QR codes (Malte Hain).
- Repaired double-encoded language names in `assets/app.js` (`ÄŒeÅ¡tina` had
  replaced `Čeština` in eight entries) and stripped a stray BOM.
- Removed a call to a footer helper that no longer exists.
- Dropped duplicate function definitions that shadowed the live ones.

## [2025.09.05.1] - 2025-09-05

First tagged version: offline EPC/SEPA QR generator with live IBAN validation,
payload byte guard, PNG/SVG/JPG export, dark mode and optional locales. No
release notes were recorded at the time; the commit history holds the detail.

[Unreleased]: https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/compare/v2026.08.28.3...HEAD
[2026.08.28.3]: https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/compare/v2026.08.28.2...v2026.08.28.3
[2026.08.28.2]: https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/compare/v2026.08.28.1...v2026.08.28.2
[2026.08.28.1]: https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/compare/v2026.08.17.1...v2026.08.28.1
[2026.08.17.1]: https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/compare/v2025.09.05.1...v2026.08.17.1
[2025.09.05.1]: https://github.com/quasistatic-setup/EPC-QR-Code-Offline-Generator/releases/tag/v2025.09.05.1
