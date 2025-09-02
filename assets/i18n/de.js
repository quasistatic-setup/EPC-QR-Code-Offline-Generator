window.I18N = window.I18N || {};
window.I18N.de = {
  paymentData: "Zahlungsdaten",
  advanced: "Erweitert (optional)",
  l_name: "Empfänger (Name)",
  l_iban: "IBAN",
  l_amount: "Betrag in EUR",
  l_unstruct: "Verwendungszweck",
  l_struct: "Strukturierte Referenz",
  h_struct: "Nur verwenden, wenn kein Verwendungszweck angegeben wird.",
  l_purpose: "Purpose-Code (optional)",
  h_purpose: "Standardisierte vierstellige Codes (z. B. GDDS, SALA, CHAR).",
  l_bic: "BIC (nur in Sonderfällen)",
  l_b2o: "Mitteilung an Auftraggeber",
  l_version: "Version",
  l_charset: "Zeichensatz",
  h_limit: "Maximale Nutzlast 331 Bytes. Letztes Feld ohne zusätzlichen Zeilenumbruch.",
  btn_gen: "QR-Code erzeugen",
  btn_ex: "Beispieldaten",

  // Save-as
  save_as: "Speichern als",
  save_png: "PNG",
  save_svg: "SVG",
  save_jpg: "JPG",

  // UX
  theme_dark: "Dunkel",
  theme_light: "Hell",
  hint_iban_ok: "IBAN wirkt gültig.",
  hint_iban_bad: "IBAN ist ungültig.",
  hint_amount_fmt: "Wird beim Erzeugen auf zwei Nachkommastellen formatiert.",
  live_checks: "Live-Prüfungen:",
  live_ok: "OK",
  live_conflict: "Konflikt: Entweder Strukturierte Referenz ODER Verwendungszweck verwenden.",
  tooltip_struct: "RF-Kreditorenreferenz (ISO 11649) verwenden. Falls gesetzt, Verwendungszweck leer lassen.",
  tooltip_purpose: "Standardcode wie GDDS (Waren), SALA (Gehalt), CHAR (Spende). Optional.",
  totalBytes: "Bytes gesamt:",
  qrInfo: "QR-Info:",
  details: "Details anzeigen (EPC-Payload)",
  lf: "Zeilenumbrüche werden als ⏎ dargestellt.",

  placeholders: {
    name: "z. B. Beispiel GmbH",
    iban: "DE89 3704 0044 0532 0130 00",
    amount: "12,34",
    unstruct: "Rechnung 4711, Kunde 123",
    struct: "z. B. RF18…",
    purpose: "z. B. GDDS",
    bic: "in der EU meist leer lassen",
    b2o: "optional"
  },
  exdata: {
    name: "Beispiel GmbH",
    iban: "DE71 1102 2033 0123 4567 89",
    amount: "12,30",
    unstruct: "Rechnung 4711",
    struct: "",
    purpose: "",
    bic: "",
    b2o: ""
  },
  status_ok: "QR-Code erstellt. Jetzt mit Banking-App scannen oder speichern.",
  status_prefill: "Beispieldaten eingefügt. Jetzt „QR-Code erzeugen“ klicken.",
  status_noqr: "Noch kein QR-Code vorhanden.",
  err_name: "Empfänger fehlt.",
  err_iban: "IBAN ist ungültig. Bitte prüfen.",
  err_purpose: "Purpose-Code: 1–4 alphanumerische Zeichen.",
  err_bic: "BIC-Format ungültig.",
  err_len: (bytes) => `Text zu lang: Nutzlast überschreitet 331 Bytes (${bytes}). Kürzen Sie Freitext/Referenzen.`,
  err_qrlib: "QR-Bibliothek nicht geladen. Prüfe assets/qrcode.min.js und die Lade-Reihenfolge.",

  // Footer (Markennamen bleiben Englisch)
  footer_offline: "Diese Seite funktioniert vollständig offline. Öffne einfach die index.html.",
  footer_support: "Unterstützung:",
  footer_buy: "☕ Buy me a coffee",
  footer_kofi: "❤️ Ko-fi",
  footer_gh: "🌐 GitHub"
};
