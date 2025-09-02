# EPC QR Code Offline Generator

Ein leichter, vollständig offline nutzbarer Generator für EPC/SEPA QR‑Codes. 
Öffne einfach `index.html` in einem modernen Browser, fülle die Zahlungsdaten aus und speichere den erzeugten QR‑Code als PNG, SVG oder JPG.

## Funktionen
- Offline: Keine Server‑Aufrufe, alle Skripte lokal eingebunden
- IBAN‑Prüfung: Live‑Validierung und Formatierung (Leerzeichen)
- Felder: Empfänger, IBAN, Betrag (EUR), Verwendungszweck ODER strukturierte Referenz (RF, ISO 11649), Purpose‑Code, BIC (selten nötig), Mitteilung an Auftraggeber
- EPC‑Payload: Byte‑Zähler und Limit‑Check (max. 331 Bytes)
- Export: QR als PNG, SVG oder JPG speichern
- UI/UX: Dunkel/Hell‑Modus, Tooltips, Beispieldaten, Detailsicht der EPC‑Payload
- Mehrsprachig: Englisch (Basis) + optionale Sprachen in `assets/i18n/`

## Schnellstart
1. Repository klonen oder ZIP laden.
2. `index.html` im Browser öffnen (Doppelklick genügt). Optional über einen Static Server bedienen.
3. Pflichtfelder ausfüllen (Empfänger, IBAN, ggf. Betrag) und auf „Generate QR code“ klicken.
4. Über „Save as“ den QR als PNG/SVG/JPG speichern.

Hinweis: Die Seite funktioniert vollständig offline. Du kannst sie lokal aufbewahren und ohne Internet nutzen.

## Felder und Regeln (Kurzüberblick)
- Empfänger: Freitext (erforderlich)
- IBAN: Live‑Prüfung nach Mod97; Eingabe mit/ohne Leerzeichen möglich
- Betrag: Dezimalzahl in EUR; wird beim Erzeugen auf zwei Nachkommastellen formatiert
- Verwendungszweck vs. Strukturierte Referenz: gegenseitig ausschließend (entweder Freitext ODER RF‑Referenz)
- Purpose‑Code: 1–4 alphanumerische Zeichen (z. B. GDDS, SALA, CHAR)
- BIC: Nur in Sonderfällen (außerhalb EWR/SEPA‑Randfälle) erforderlich
- EPC‑Payload: Maximale Länge 331 Bytes; Zähler wird angezeigt

## Export
- PNG und JPG: 300×300 px (ECL=M)
- SVG: „echtes“ Vektor‑SVG, ideal für Druck

## Internationalisierung (i18n)
- Basisstrings: `assets/i18n-core.js` (Englisch)
- Optionale Sprachen: einzelne Dateien unter `assets/i18n/<lang>.js`
- Beim Wechsel der Sprache lädt die App die entsprechende Datei dynamisch, wenn vorhanden
- Neue Übersetzung hinzufügen:
  1) `assets/i18n/de.js` als Vorlage kopieren
  2) `window.I18N.<lang> = { ... }` befüllen
  3) Dateiname nach ISO‑Sprachcode wählen (z. B. `it.js`)

## Projektstruktur
- `index.html` – UI, Styles und Script‑Einbindung
- `assets/app.js` – App‑Logik: Validierung, Payload‑Aufbau, QR‑Render, Export, i18n‑Handling
- `assets/qrcode.min.js` – QR‑Code‑Bibliothek (lokal)
- `assets/i18n-core.js` – Basis‑i18n (EN)
- `assets/i18n/*.js` – optionale Übersetzungen (DE, FR, IT, …)
- `LICENSE` – MIT‑Lizenz

## Entwicklung
- Kein Build‑Schritt erforderlich; reine Static‑Files
- Zum lokalen Testen reicht das Öffnen von `index.html`
- Alternativ ein beliebiger Static Server, z. B.:
  - Python: `python -m http.server 8080`
  - Node (npx): `npx serve .`

## Datenschutz
- Es werden keine Daten übertragen. Alle Eingaben bleiben im Browser des Nutzers.

## Lizenz
- MIT (siehe `LICENSE`)

---

### English (short)
A small, fully offline EPC/SEPA QR code generator. Open `index.html` in a modern browser, fill in payment details, and save the QR as PNG/SVG/JPG. No server calls; all code runs locally. See sections above for fields, limits (331 bytes), i18n and exports. Licensed under MIT.

