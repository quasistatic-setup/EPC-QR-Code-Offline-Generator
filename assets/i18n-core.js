/* i18n-core.js – English base */
window.I18N = {
  en: {
    title: "EPC QR Code Offline Generator",
    paymentData: "Payment details",
    advanced: "Advanced (optional)",
    l_name: "Recipient (name)",
    l_iban: "IBAN",
    l_amount: "Amount in EUR",
    l_unstruct: "Payment reference",
    l_struct: "Structured reference",
    h_struct: "Use only if no payment reference (free text) is provided.",
    l_purpose: "Purpose code (optional)",
    h_purpose: "Standardized four-letter codes (e.g., GDDS, SALA, CHAR).",
    l_bic: "BIC (only in special cases)",
    l_b2o: "Note to originator",
    l_version: "Version",
    l_charset: "Character set",
    h_limit: "Maximum payload 331 bytes. No extra line break after the last field.",
    btn_gen: "Generate QR code",
    btn_ex: "Example data",

    // Save-as
    save_as: "Save as",
    save_png: "PNG",
    save_svg: "SVG",
    save_jpg: "JPG",

    // New UX strings
    theme_dark: "Dark",
    theme_light: "Light",
    hint_iban_ok: "IBAN looks valid.",
    hint_iban_bad: "IBAN is invalid.",
    hint_amount_fmt: "Will be formatted to two decimals on generate.",
    live_checks: "Live checks:",
    live_ok: "OK",
    live_conflict: "Conflict: use either Structured reference OR Payment reference.",
    tooltip_struct: "Use RF creditor reference (ISO 11649). If you set this, leave Payment reference empty.",
    tooltip_purpose: "Standard code like GDDS (goods), SALA (salary), CHAR (charity). Optional.",
    totalBytes: "Total bytes:",
    qrInfo: "QR info:",
    details: "Show details (EPC payload)",
    lf: "Line breaks are shown as ⏎.",

    placeholders: {
      name: "e.g., Example GmbH",
      iban: "DE89 3704 0044 0532 0130 00",
      amount: "12.34",
      unstruct: "Invoice 4711, Customer 123",
      struct: "e.g., RF18…",
      purpose: "e.g., GDDS",
      bic: "usually empty in EU",
      b2o: "optional"
    },
    exdata: {
      name: "Example GmbH",
      iban: "DE71 1102 2033 0123 4567 89",
      amount: "12.30",
      unstruct: "Invoice 4711",
      struct: "",
      purpose: "",
      bic: "",
      b2o: ""
    },
    status_ok: "QR code created. Scan with your banking app or save.",
    status_prefill: "Example data filled. Click “Generate QR code”.",
    status_noqr: "No QR code yet.",
    err_name: "Recipient is required.",
    err_iban: "IBAN is invalid.",
    err_purpose: "Purpose code must be 1–4 alphanumeric characters.",
    err_bic: "Invalid BIC format.",
    err_amount_min: "Invalid amount: at least 0.01 EUR.",
    err_len: (bytes) => `Text too long: payload exceeds 331 bytes (${bytes}). Please shorten.`,
    err_qrlib: "QR library not loaded. Ensure assets/qrcode.min.js exists and is loaded before app.js.",

    // Footer
    footer_offline: "This page works fully offline. Just open index.html.",
    footer_support: "Support:",
    footer_buy: "☕ Buy me a coffee",
    footer_kofi: "❤️ Ko-fi",
    footer_gh: "🌐 GitHub"
  }
};
