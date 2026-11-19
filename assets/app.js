/* app.js – UX: live IBAN validation, smart amount formatting, asymmetric conflict highlight,
   live byte counter, tooltips, dark mode toggle, save-as split, i18n, IBAN spacing, true SVG export */

// Released version, CalVer YYYY.MM.DD.N. This is the single source of truth:
// the release workflow refuses to publish a tag that disagrees with it, and the
// footer shows it so a downloaded offline copy can be matched to a release.
const APP_VERSION = "2026.09.05.1";

let LANG = "en";
let hasQR = false;
let lastChanged = null; // remembers which field was edited last (for conflict highlight)

// Optional locales (separate files in assets/i18n/)
const OPTIONAL_LOCALES = [
  "de",
  "fr",
  "it",
  "es",
  "nl",
  "pt",
  "sv",
  "da",
  "no",
  "fi",
  "is",
  "cs",
  "sk",
  "pl",
  "hu",
  "ro",
  "bg",
  "hr",
  "sl",
  "lt",
  "lv",
  "et",
  "el",
  "ga",
  "lb",
  "rm",
  "ca",
  "tr",
  "cy",
  "gd",
  "mt",
];

// Derive human readable language names without hardcoding a fragile table
function languageLabel(code) {
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    const name = dn.of(code);
    return name
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

const LANGUAGE_NAMES = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  nl: "Nederlands",
  pt: "Português",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  is: "Íslenska",
  cs: "Čeština",
  sk: "Slovenčina",
  pl: "Polski",
  hu: "Magyar",
  ro: "Română",
  bg: "Български",
  hr: "Hrvatski",
  sl: "Slovenščina",
  lt: "Lietuvių",
  lv: "Latviešu",
  et: "Eesti",
  el: "Ελληνικά",
  ga: "Gaeilge",
  lb: "Lëtzebuergesch",
  rm: "Rumantsch",
  ca: "Català",
  tr: "Türkçe",
  cy: "Cymraeg",
  gd: "Gàidhlig",
  mt: "Malti",
};

// ---------- i18n helpers ----------
function ensureI18N() {
  if (!window.I18N) window.I18N = {};
  if (!window.I18N.en) {
    // Minimal inline EN fallback if i18n-core.js failed
    window.I18N.en = {
      title: "EPC QR Code Offline Generator",
      paymentData: "Payment details",
      advanced: "Advanced (optional)",
      l_name: "Recipient (name)",
      l_iban: "IBAN",
      l_amount: "Amount in EUR (optional)",
      l_unstruct: "Payment reference",
      l_struct: "Structured reference",
      h_struct: "Use only if no payment reference (free text) is provided.",
      l_purpose: "Purpose code (optional)",
      h_purpose: "Standardized four-letter codes (e.g., GDDS, SALA, CHAR).",
      l_bic: "BIC (only in special cases)",
      l_b2o: "Note to originator",
      l_version: "Version",
      l_charset: "Character set",
      h_limit:
        "Maximum payload 331 bytes. No extra line break after the last field.",
      h_instant:
        "Instant transfers: this classic EPC QR code cannot request SEPA Instant. After scanning, your banking app may still offer one if the banks involved support it.",
      btn_gen: "Generate QR code",
      btn_ex: "Example data",
      save_as: "Save as",
      save_png: "PNG",
      save_svg: "SVG",
      save_jpg: "JPG",
      theme_dark: "Dark",
      theme_light: "Light",
      hint_iban_ok: "IBAN looks valid.",
      hint_iban_bad: "IBAN is invalid.",
      hint_amount_fmt: "Will be formatted to two decimals on generate.",
      live_checks: "Live checks:",
      live_ok: "OK",
      live_charset: (chars) =>
        `Not in the SEPA character set; many banks replace or drop them: ${chars}`,
      live_conflict:
        "Conflict: use either Structured reference OR Payment reference.",
      tooltip_struct:
        "Use RF creditor reference (ISO 11649). If you set this, leave Payment reference empty.",
      tooltip_purpose:
        "Standard code like GDDS (goods), SALA (salary), CHAR (charity). Optional.",
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
        b2o: "optional",
      },
      exdata: {
        name: "Example GmbH",
        iban: "DE71 1102 2033 0123 4567 89",
        amount: "12.30",
        unstruct: "Invoice 4711",
        struct: "",
        purpose: "",
        bic: "",
        b2o: "",
      },
      status_ok: "QR code created. Scan with your banking app or save.",
      status_prefill: "Example data filled. Click “Generate QR code”.",
      status_noqr: "No QR code yet.",
      err_name: "Recipient is required.",
      err_iban: "IBAN is invalid.",
      err_purpose: "Purpose code must be 1–4 alphanumeric characters.",
      err_bic: "Invalid BIC format.",
      err_amount_min: "Invalid amount: at least 0.01 EUR.",
      err_amount_max: "Invalid amount: at most 999 999 999.99 EUR.",
      err_bic_v1:
        "Version 001 requires a BIC. Enter the BIC or choose version 002.",
      err_bic_noneea: (cc) =>
        `A BIC is required for ${cc} IBANs: this SEPA country is outside the EEA, and EPC069-12 keeps the BIC mandatory there.`,
      hint_bic_noneea: (cc) =>
        `${cc} is a SEPA country outside the EEA: a BIC is required.`,
      save_card: "PNG with details",
      save_txt: "Text (TXT)",
      copy_txt: "Copy as text",
      status_copied: "Payment details copied as text.",
      amount_open: "entered by the payer",
      err_rf: "Structured reference: invalid RF creditor reference (ISO 11649 check digits do not match).",
      err_len: (b) =>
        `Text too long: payload exceeds 331 bytes (${b}). Please shorten.`,
      err_charset: (chars) =>
        `These characters cannot be encoded in ISO-8859-1: ${chars}. Choose UTF-8 as the character set.`,
      err_qrlib:
        "QR library not loaded. Ensure assets/qrcode.js is loaded before app.js.",
      footer_offline: "This page works fully offline. Just open index.html.",
      footer_support: "Support:",
      footer_buy: "☕ Buy me a coffee",
      footer_kofi: "❤️ Ko-fi",
      footer_gh: "🌐 GitHub",
      footer_version: "Version",
    };
  }
}
function t() {
  ensureI18N();
  const dict = window.I18N[LANG];
  if (!dict || dict === window.I18N.en) return window.I18N.en;
  // Fall back to English per key, not per locale: a translation that predates
  // a newly added string must not put "undefined" in front of the user.
  return { ...window.I18N.en, ...dict };
}

function loadLocale(lang) {
  ensureI18N();
  if (window.I18N[lang]) return Promise.resolve(true);
  if (!OPTIONAL_LOCALES.includes(lang)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = `./assets/i18n/${lang}.js`;
    s.async = true;
    s.onload = () => {
      try {
        stripLocaleTitles();
      } catch {}
      resolve(!!window.I18N[lang]);
    };
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}
function detectPreferredLang() {
  const stored = store.get("lang");
  if (stored) return stored;
  const list = (
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en"]
  ).map((x) => String(x || "").toLowerCase());
  for (const tag of list) {
    const base = tag.split("-")[0];
    if ((window.I18N && window.I18N[base]) || OPTIONAL_LOCALES.includes(base))
      return base;
  }
  return "en";
}
function populateLangSelect(current) {
  const select = document.getElementById("lang");
  if (!select) return;
  const allCodes = ["en", ...OPTIONAL_LOCALES];
  select.innerHTML = "";
  for (const code of allCodes) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = languageLabel(code);
    if (code === current) opt.selected = true;
    select.appendChild(opt);
  }
  if (!select._bound) {
    select.addEventListener("change", async (e) => {
      await maybeLoadAndApply(e.target.value);
    });
    select._bound = true;
  }
}
function applyLang(lang) {
  try {
    stripLocaleTitles();
  } catch {}
  LANG = lang;
  const dict = t();
  document.documentElement.lang = lang;

  // Section headings
  // Keep product title constant across languages
  document.getElementById("t_title").textContent =
    window.I18N?.en?.title || "EPC QR Code Offline Generator";
  document.getElementById("t_paymentData").textContent = dict.paymentData;
  document.querySelector("summary#t_advanced").textContent = dict.advanced;

  // Labels (.title spans) & hints
  document.querySelector("#l_name .title").textContent = dict.l_name;
  document.querySelector("#l_iban .title").textContent = dict.l_iban;
  document.querySelector("#l_amount .title").textContent = dict.l_amount;
  document.querySelector("#l_unstruct .title").textContent = dict.l_unstruct;
  document.querySelector("#l_struct .title").textContent = dict.l_struct;
  document.getElementById("h_struct").textContent = dict.h_struct;
  document.querySelector("#l_purpose .title").textContent = dict.l_purpose;
  document.getElementById("h_purpose").textContent = dict.h_purpose;
  document.querySelector("#l_bic .title").textContent = dict.l_bic;
  document.querySelector("#l_b2o .title").textContent = dict.l_b2o;
  document.querySelector("#l_version .title").textContent = dict.l_version;
  document.querySelector("#l_charset .title").textContent = dict.l_charset;
  document.getElementById("h_limit").textContent = dict.h_limit;
  document.getElementById("h_instant").textContent = dict.h_instant;

  // Buttons / Save-as texts
  document.getElementById("gen").textContent = dict.btn_gen;
  document.getElementById("ex").textContent = dict.btn_ex;
  document.getElementById("saveBtn").textContent = dict.save_as;
  document.getElementById("savePNG").textContent = dict.save_png;
  document.getElementById("saveSVG").textContent = dict.save_svg;
  document.getElementById("saveJPG").textContent = dict.save_jpg;
  document.getElementById("saveCard").textContent = dict.save_card;
  document.getElementById("saveTXT").textContent = dict.save_txt;
  document.getElementById("copyTXT").textContent = dict.copy_txt;

  // Meta labels
  document.getElementById("t_totalBytes").innerHTML =
    "<strong>" + dict.totalBytes + "</strong>";
  document.getElementById("t_qrInfo").innerHTML =
    "<strong>" + dict.qrInfo + "</strong>";
  document.getElementById("t_details").textContent = dict.details;
  document.getElementById("t_lf").textContent = dict.lf;
  document.getElementById("t_liveValidity").innerHTML =
    "<strong>" + dict.live_checks + "</strong>";

  // Placeholders
  const p = dict.placeholders;
  document.getElementById("name").placeholder = p.name;
  document.getElementById("iban").placeholder = p.iban;
  document.getElementById("amount").placeholder = p.amount;
  document.getElementById("rem_unstruct").placeholder = p.unstruct;
  document.getElementById("rem_struct").placeholder = p.struct;
  document.getElementById("purpose").placeholder = p.purpose;
  document.getElementById("bic").placeholder = p.bic;
  document.getElementById("b2o").placeholder = p.b2o;

  // Footer
  document.getElementById("f_offline").innerHTML = dict.footer_offline.replace(
    "index.html",
    "<em>index.html</em>"
  );
  document.getElementById("f_support").textContent = dict.footer_support;
  document.getElementById("f_buy").textContent = dict.footer_buy;
  document.getElementById("f_kofi").textContent = dict.footer_kofi;
  document.getElementById("f_gh").textContent = dict.footer_gh;
  renderVersion();

  // Tooltips
  document.getElementById("qm_struct").title = dict.tooltip_struct;
  document.getElementById("qm_purpose").title = dict.tooltip_purpose;

  // Amount hint
  document.getElementById("amountHint").textContent = dict.hint_amount_fmt;

  // Dark toggle label
  updateThemeButton();

  // Language selector + remember
  populateLangSelect(lang);
  store.set("lang", lang);

  // Reformat amount according to new locale rules (space thousands + localized decimal)
  const amountEl = document.getElementById("amount");
  if (amountEl && amountEl.value) {
    const n = parseAmountToNumber(amountEl.value);
    if (isFinite(n)) amountEl.value = formatAmountLocalized(n, lang);
    else amountEl.value = sanitizeAmountValue(amountEl.value);
  }
}
async function maybeLoadAndApply(lang) {
  if (!window.I18N?.[lang]) await loadLocale(lang);
  applyLang(window.I18N?.[lang] ? lang : "en");
  clearQR(); // do not show "no QR" message here
  updateLiveUI(); // refresh live checks
}

// ---------- Theme ----------
function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  store.set("theme", mode);
  updateThemeButton();
}
// Browsers may refuse storage entirely - a blocked-cookies setting is enough.
// An unguarded access threw inside init() and took everything after it down
// with it, including the footer version and the language list, while the form
// above kept working. Storage is a convenience here, never a requirement.
const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* remembering the choice is optional */
    }
  },
};

function initTheme() {
  const stored = store.get("theme");
  if (stored) {
    setTheme(stored);
    return;
  }
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

// Remove locale-specific titles; keep only EN base
function stripLocaleTitles() {
  if (!window.I18N) return;
  for (const k of Object.keys(window.I18N)) {
    if (k !== "en" && window.I18N[k] && typeof window.I18N[k] === "object") {
      try {
        delete window.I18N[k].title;
      } catch {}
    }
  }
}

// --- Overrides to avoid encoding issues in UI texts ---
function updateThemeButton() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.textContent = isDark ? t().theme_light : t().theme_dark;
}

// ---------- Validation & helpers ----------
function ibanClean(s) {
  return String(s || "")
    .replace(/[\s\-]/g, "")
    .toUpperCase();
}
// ISO 7064 mod 97-10, shared by IBAN (ISO 13616) and RF reference (ISO 11649):
// move the first four characters to the end, letters become 10..35, and the
// resulting number must leave remainder 1.
function mod97IsOne(s) {
  const moved = s.slice(4) + s.slice(0, 4);
  const num = moved.replace(/[A-Z]/g, (c) => (c.charCodeAt(0) - 55).toString());
  let rem = 0;
  for (let i = 0; i < num.length; i += 7)
    rem = parseInt(String(rem) + num.substr(i, 7), 10) % 97;
  return rem === 1;
}
function ibanIsValid(iban) {
  const s = ibanClean(iban);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(s)) return false;
  return mod97IsOne(s);
}

// SEPA countries outside the EEA (EPC409-09 list of SEPA countries). For
// these EPC069-12 keeps the BIC mandatory even in version 002. Jersey,
// Guernsey and the Isle of Man use GB IBANs.
const SEPA_NON_EEA = new Set([
  "AD", "AL", "CH", "GB", "GI", "MC", "MD", "ME", "MK", "RS", "SM", "VA",
]);
function ibanNeedsBic(iban) {
  const cc = ibanClean(iban).slice(0, 2);
  return SEPA_NON_EEA.has(cc) ? cc : "";
}

// Structured reference (AT-T009, max 35). EPC069-12 says an ISO 11649 RF
// creditor reference "may" be used, so other references pass unchanged. An RF
// reference is often printed in groups of four; the spaces are not part of it.
function structRefClean(s) {
  const v = String(s || "").trim().toUpperCase();
  return /^RF/.test(v) ? v.replace(/\s+/g, "") : v;
}
function rfIsValid(ref) {
  return /^RF\d{2}[A-Z0-9]{1,21}$/.test(ref) && mod97IsOne(ref);
}
// --- Amount helpers (locale-specific separators) ---
const DOT_DECIMAL_LANGS = new Set(["en", "ga", "cy", "gd", "mt"]);
function getDecimalSeparator(lang) {
  return DOT_DECIMAL_LANGS.has(lang) ? "." : ",";
}
function parseAmountToNumber(amount) {
  const s = String(amount || "")
    .trim()
    .replace(/\s+/g, "");
  // be tolerant: treat comma as decimal when present, else dot
  // An empty field means "no amount" (the payer fills it in). Number("") is 0,
  // which used to turn a blank field into 0.00 and then fail the minimum check.
  if (!s) return NaN;
  const normalized = s.includes(",") ? s.replace(",", ".") : s;
  const n = Number(normalized);
  return isFinite(n) ? n : NaN;
}
function formatAmountLocalized(n, lang) {
  const dec = getDecimalSeparator(lang);
  const sign = n < 0 ? "-" : "";
  const fixed = Math.abs(n).toFixed(2);
  const [intPart, fracPart] = fixed.split(".");
  // group thousands with spaces
  const g = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + g + (dec + fracPart);
}
function sanitizeAmountValue(value) {
  // allow digits, dot, comma; last separator becomes decimal, others removed
  // Examples: "1.234,56" → "1234.56", "1,234.56" → "1234.56"
  let s = String(value || "")
    .replace(/\s+/g, "")
    .replace(/[^0-9.,]/g, "");
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  const sepIndex = Math.max(lastDot, lastComma);
  let intPart = s,
    fracPart = "";
  if (sepIndex !== -1) {
    intPart = s.slice(0, sepIndex);
    fracPart = s.slice(sepIndex + 1);
  }
  intPart = intPart.replace(/[.,]/g, "");
  fracPart = fracPart.replace(/[.,]/g, "");
  return sepIndex !== -1 ? intPart + "." + fracPart : intPart;
}

function formatAmountUIKeepCaret(inputEl, lang) {
  const raw = String(inputEl.value || "");
  const caret = inputEl.selectionStart ?? raw.length;
  // Count digits before caret in the original raw input
  const digitsBefore = (raw.slice(0, caret).match(/\d/g) || []).length;
  const rawBefore = raw.slice(0, caret);
  const justTypedDecimal = /[.,]$/.test(rawBefore);

  // Sanitize and normalize
  let s = sanitizeAmountValue(raw); // digits, spaces, single dot as decimal (dot)
  // remove spaces for numeric processing
  s = s.replace(/\s+/g, "");
  // split into int/frac by dot (if any)
  let intPart = s,
    fracPart = "";
  const dotIdx = s.indexOf(".");
  const hadDot = dotIdx !== -1; // remember if user typed a decimal separator
  if (dotIdx !== -1) {
    intPart = s.slice(0, dotIdx);
    fracPart = s.slice(dotIdx + 1);
  }
  intPart = intPart.replace(/\D/g, "");
  fracPart = fracPart.replace(/\D/g, "");

  // group thousands with spaces
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const dec = getDecimalSeparator(lang);
  // Show decimal separator if user just typed it, even without fractional digits yet
  const formatted = grouped + (fracPart || hadDot ? dec + fracPart : "");

  // determine new caret position: after same number of digits
  let seen = 0,
    newCaret = 0;
  for (const ch of formatted) {
    if (/\d/.test(ch)) seen++;
    newCaret++;
    if (seen >= digitsBefore) break;
  }
  if (digitsBefore === 0) newCaret = 0;
  if (digitsBefore > (intPart + fracPart).length) newCaret = formatted.length;
  // If user just entered decimal separator and no fractional digits yet, place caret after separator
  if (justTypedDecimal && fracPart.length === 0 && formatted.includes(dec)) {
    newCaret = formatted.indexOf(dec) + 1;
  }

  inputEl.value = formatted;
  try {
    inputEl.setSelectionRange(newCaret, newCaret);
  } catch {}
}
// AT-T002 is optional. When present it must be 0.01 to 999999999.99 EUR
// (EPC069-12 2.2). Compare in whole cents so 0.004 or 999999999.995 cannot
// slip past the bounds and round to an out-of-range value.
const AMOUNT_MAX_CENTS = 99999999999;
function amountCents(amount) {
  const n = parseAmountToNumber(amount);
  return isFinite(n) ? Math.round(n * 100) : NaN;
}
function asEUR(amount) {
  if (!String(amount || "").trim()) return "";
  const cents = amountCents(amount);
  if (!isFinite(cents) || cents < 1) throw new Error(t().err_amount_min);
  if (cents > AMOUNT_MAX_CENTS) throw new Error(t().err_amount_max);
  return "EUR" + (cents / 100).toFixed(2);
}
function formatAmountFieldToTwoDecimals() {
  const el = document.getElementById("amount");
  const n = parseAmountToNumber(el.value);
  if (!isFinite(n)) return;
  el.value = formatAmountLocalized(n, LANG);
}

// IBAN auto spacing with caret preservation
function formatIbanUIKeepCaret(inputEl) {
  const raw = inputEl.value;
  const selStart = inputEl.selectionStart || 0;
  let rawIndex = 0;
  for (let i = 0, r = 0; i < raw.length && i < selStart; i++) {
    if (/\S/.test(raw[i])) r++;
    rawIndex = r;
  }
  const normalized = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const chunks = normalized.match(/.{1,4}/g) || [];
  const formatted = chunks.join(" ");
  let formattedCaret = 0,
    seenRaw = 0;
  for (const ch of formatted) {
    if (ch !== " ") {
      seenRaw++;
    }
    formattedCaret++;
    if (seenRaw >= rawIndex) break;
  }
  if (selStart === raw.length) formattedCaret = formatted.length;
  inputEl.value = formatted;
  inputEl.setSelectionRange(formattedCaret, formattedCaret);
}

// EPC069-12 charset ids mapped to the byte encoders qrcode-generator ships
// with. Its built-in default truncates each code unit to one byte, which is
// ISO-8859-1 - so UTF-8 has to be selected explicitly, and only these two are
// offered because the library has no encoder for the other ISO-8859 parts.
const CHARSET_ENCODERS = { 1: "UTF-8", 2: "default" };

// Byte length in the selected charset, because the 331-byte cap of the
// standard counts the bytes that actually end up in the QR code.
function payloadByteLen(str, charset) {
  if (String(charset) === "2") return str.length; // one byte per code unit
  return new TextEncoder().encode(str).length;
}

// EPC217-08 Basic Latin Character Set - the characters a SEPA credit transfer
// is guaranteed to carry. EPC069-12 itself allows more: its own examples read
// "Franz Mustermaenn" (with umlaut) and "Francois D'Alsace S.A." (with cedilla),
// and banks differ in what they convert, keep or drop. So this is a hint next
// to the live checks, never a reason to refuse a code.
const SEPA_BASIC_CHARS = /[A-Za-z0-9 /?:().,'+-]/;

function charsOutsideSepaSet(...texts) {
  const seen = new Set();
  for (const text of texts) {
    for (const c of text) if (!SEPA_BASIC_CHARS.test(c)) seen.add(c);
  }
  return [...seen];
}

// UTF-8 covers every character; ISO-8859-1 does not. Encoding an unsupported
// character would silently truncate it to a different letter (a Polish "l"
// with stroke would arrive as "B"), so refuse instead of corrupting a
// recipient name.
function assertEncodable(payload, charset) {
  if (String(charset) !== "2") return;
  const bad = [...new Set([...payload])].filter((c) => c.codePointAt(0) > 0xff);
  if (bad.length) throw new Error(t().err_charset(bad.join(" ")));
}

function collectPayloadFields(v, opts = {}) {
  const lines = [];
  const draft = opts.draft;
  lines.push("BCD", v.version || "002", v.charset || "1", "SCT");
  // Ensure BIC is uppercase in the payload
  lines.push(v.bic ? v.bic.trim().toUpperCase() : "");
  lines.push((v.name || "").trim());
  lines.push(ibanClean(v.iban));
  if (draft) {
    const c = amountCents(v.amount);
    lines.push(
      isFinite(c) && c >= 1 && c <= AMOUNT_MAX_CENTS
        ? "EUR" + (c / 100).toFixed(2)
        : ""
    );
  } else {
    lines.push(v.amount || "");
  }
  lines.push(v.purpose ? v.purpose.toUpperCase() : "");
  const hasStruct = !!v.rem_struct,
    hasUnstruct = !!v.rem_unstruct;
  lines.push(hasStruct ? structRefClean(v.rem_struct) : "");
  lines.push(hasUnstruct ? v.rem_unstruct.trim() : "");
  lines.push(v.b2o ? v.b2o.trim() : "");
  return lines;
}

// Build payload "draft" to compute live byte length even if not valid yet
function buildPayloadDraft() {
  const v = {
    name: document.getElementById("name").value || "",
    iban: document.getElementById("iban").value || "",
    amount: document.getElementById("amount").value || "",
    rem_unstruct: document.getElementById("rem_unstruct").value || "",
    rem_struct: document.getElementById("rem_struct").value || "",
    purpose: document.getElementById("purpose").value || "",
    bic: document.getElementById("bic").value || "",
    b2o: document.getElementById("b2o").value || "",
    version: document.getElementById("version").value,
    charset: document.getElementById("charset").value,
  };
  const lines = collectPayloadFields(v, { draft: true });
  return lines.join("\n").replace(/(\n)+$/, "");
}

function ensureLimits(payload, charset) {
  const bytes = payloadByteLen(payload, charset);
  if (bytes > 331) throw new Error(t().err_len(bytes));
  return bytes;
}

// ---------- QR rendering & export ----------
let qrobj = null;
function setDownloadEnabled(enabled) {
  document.getElementById("saveBtn").disabled = !enabled;
  document.getElementById("saveCaret").disabled = !enabled;
  document.getElementById("savePNG").disabled = !enabled;
  document.getElementById("saveSVG").disabled = !enabled;
  document.getElementById("saveJPG").disabled = !enabled;
  document.getElementById("saveCard").disabled = !enabled;
  document.getElementById("saveTXT").disabled = !enabled;
  document.getElementById("copyTXT").disabled = !enabled;
}
function renderQR(text, charset) {
  if (typeof qrcode === "undefined") throw new Error(t().err_qrlib);

  // Line 3 of the payload announces the charset, so the bytes written into
  // the code have to match it. Without this the library keeps its ISO-8859-1
  // default while the payload claims UTF-8, and a reader that trusts the
  // announcement sees invalid bytes as soon as an umlaut appears.
  const encoder =
    qrcode.stringToBytesFuncs[CHARSET_ENCODERS[String(charset)] || "UTF-8"];
  if (!encoder) throw new Error(t().err_qrlib);
  qrcode.stringToBytes = encoder;

  const box = document.getElementById("qrcanvas");
  box.innerHTML = "";

  // EPC069-12 mandates error correction level M, so the level is fixed.
  // Only the QR version is auto-detected: start small and grow until the
  // payload fits. Never fall back to level L - that would produce a code
  // outside the EPC standard, and a payment code has to stay readable even
  // when printed small or partly smudged.
  // ensureLimits() caps the payload at 331 bytes beforehand, which fits
  // level M from version 13 on, so this loop always finds a version.
  let qrSuccess = false;

  for (let typeNumber = 4; typeNumber <= 40; typeNumber++) {
    try {
      const tempQR = qrcode(typeNumber, "M");
      tempQR.addData(text);
      tempQR.make();
      qrobj = tempQR; // only assign once the code was built successfully
      qrSuccess = true;
      break;
    } catch (e) {
      // qrcode.js throws strings, not Error objects
      const errMsg = typeof e === "string" ? e : e.message || String(e);
      if (!errMsg.includes("overflow")) throw e;
    }
  }

  if (!qrSuccess) throw new Error("QR code data too large");

  box.innerHTML = qrSVG(qrobj);

  hasQR = true;
  setDownloadEnabled(true);
}
// ISO/IEC 18004 requires a light margin of four modules around the symbol
// (the "quiet zone"). Without it, a code printed on a coloured or busy
// background, or cropped tightly, may not be found by the scanner.
const QUIET_ZONE = 4;
function qrSVG(qr) {
  const n = qr.getModuleCount();
  const size = n + 2 * QUIET_ZONE;
  let rects = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c))
        rects += `<rect x="${c + QUIET_ZONE}" y="${r + QUIET_ZONE}" width="1" height="1"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="#fff"/>
  <g fill="#000">${rects}</g>
</svg>`;
}

function setStatus(msg, ok = false, warn = false) {
  const s = document.getElementById("status");
  s.textContent = msg;
  s.className = "status " + (warn ? "warn" : ok ? "ok" : "err");
}

// Override with clean error message (redeclared intentionally)
function buildPayload(v) {
  const hasStruct = !!v.rem_struct,
    hasUnstruct = !!v.rem_unstruct;
  if (hasStruct && hasUnstruct) throw new Error(t().live_conflict);
  const lines = collectPayloadFields({
    ...v,
    amount: v.amount ? asEUR(v.amount) : "",
  });
  return lines.join("\n").replace(/(\n)+$/, "");
}

// --- Safe overrides to normalize previously mis-encoded strings ---
function clearQR() {
  document.getElementById("qrcanvas").innerHTML = "";
  document.getElementById("payload").textContent = "";
  document.getElementById("bytes").textContent = "";
  document.getElementById("liveInfo").textContent = "";
  hasQR = false;
  lastPayment = null;
  setDownloadEnabled(false);
  closeSaveMenu();
}
function showPayload(payload, bytes) {
  document.getElementById("payload").textContent = payload.replace(
    /\n/g,
    "\\n\n"
  );
  document.getElementById("bytes").textContent = `${bytes} / 331`;
}

// True vector SVG export from QR matrix (no extra lib)
function exportSVG() {
  if (!hasQR || !qrobj) {
    setStatus(t().status_noqr, false);
    return;
  }
  if (!qrobj.getModuleCount()) {
    setStatus(t().status_noqr, false);
    return;
  }
  const svg = qrSVG(qrobj);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "epc-qr.svg";
  a.click();
  URL.revokeObjectURL(url);
}

function getQRNodes() {
  const box = document.getElementById("qrcanvas");
  return {
    img: box.querySelector("img"),
    canvas: box.querySelector("canvas"),
    svg: box.querySelector("svg"),
  };
}
function downloadDataURL(dataURL, filename) {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = filename;
  a.click();
}
function svgToCanvas(svg, callback) {
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 300, 300);
    URL.revokeObjectURL(url);
    callback(canvas);
  };
  img.src = url;
}
function exportPNG() {
  const { img, canvas, svg } = getQRNodes();
  if (canvas) {
    return downloadDataURL(canvas.toDataURL("image/png"), "epc-qr.png");
  }
  if (img && img.src) {
    return downloadDataURL(img.src, "epc-qr.png");
  }
  if (svg) {
    svgToCanvas(svg, (canvas) => {
      downloadDataURL(canvas.toDataURL("image/png"), "epc-qr.png");
    });
    return;
  }
  setStatus(t().status_noqr, false);
}
function exportJPG() {
  const { img, canvas, svg } = getQRNodes();
  if (canvas) {
    return downloadDataURL(canvas.toDataURL("image/jpeg", 0.92), "epc-qr.jpg");
  }
  if (img && img.src) {
    const c = document.createElement("canvas");
    c.width = 300;
    c.height = 300;
    const ctx = c.getContext("2d");
    const im = new Image();
    im.onload = function () {
      ctx.drawImage(im, 0, 0, 300, 300);
      downloadDataURL(c.toDataURL("image/jpeg", 0.92), "epc-qr.jpg");
    };
    im.src = img.src;
    return;
  }
  if (svg) {
    svgToCanvas(svg, (canvas) => {
      downloadDataURL(canvas.toDataURL("image/jpeg", 0.92), "epc-qr.jpg");
    });
    return;
  }
  setStatus(t().status_noqr, false);
}

// EPC069-12 is written for codes shown next to the same data in plain text
// (an invoice), so the payer can compare what the app pre-fills with what
// they were asked to pay. These exports give that text, built from the data
// of the code currently shown - never from fields edited since.
let lastPayment = null;

function plainLabel(s) {
  return String(s).replace(/\s*\([^)]*\)\s*$/, "");
}
function paymentTextLines(p) {
  const d = t();
  const rows = [
    [d.l_name, p.name],
    [d.l_iban, (ibanClean(p.iban).match(/.{1,4}/g) || []).join(" ")],
  ];
  if (p.bic) rows.push([d.l_bic, p.bic]);
  rows.push([
    d.l_amount,
    // the label already names the currency ("Amount in EUR")
    p.amount ? p.amount : "– " + d.amount_open,
  ]);
  if (p.rem_unstruct) rows.push([d.l_unstruct, p.rem_unstruct]);
  if (p.rem_struct) rows.push([d.l_struct, structRefClean(p.rem_struct)]);
  if (p.purpose) rows.push([d.l_purpose, p.purpose.toUpperCase()]);
  if (p.b2o.trim()) rows.push([d.l_b2o, p.b2o.trim()]);
  return rows.map(([k, v]) => [plainLabel(k), v]);
}
function paymentText(p) {
  return paymentTextLines(p)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function exportTXT() {
  if (!hasQR || !lastPayment) return setStatus(t().status_noqr, false);
  const blob = new Blob([paymentText(lastPayment) + "\n"], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  downloadDataURL(url, "epc-qr.txt");
  URL.revokeObjectURL(url);
}

async function copyText() {
  if (!hasQR || !lastPayment) return setStatus(t().status_noqr, false);
  const text = paymentText(lastPayment);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // file:// pages and older browsers may refuse the async clipboard
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  setStatus(t().status_copied, true);
}

// QR code on the left, the same data as text on the right, for pasting into
// an invoice or document that does not have the details printed already.
function exportCard() {
  const { svg } = getQRNodes();
  if (!hasQR || !lastPayment || !svg) return setStatus(t().status_noqr, false);
  const rows = paymentTextLines(lastPayment);
  const S = 2; // render at 2x for print
  const qrSize = 300, pad = 24, gap = 24, textW = 380, lineH = 22;
  const font = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  const measure = document.createElement("canvas").getContext("2d");
  const wrap = (text, f) => {
    measure.font = f;
    const out = [];
    let line = "";
    for (const word of String(text).split(/(\s+)/)) {
      const next = line + word;
      if (line && measure.measureText(next).width > textW) {
        out.push(line.trimEnd());
        line = word.trimStart();
      } else line = next;
    }
    if (line) out.push(line);
    return out;
  };
  const labelFont = `600 13px ${font}`, valueFont = `16px ${font}`;
  const blocks = rows.map(([k, v]) => ({ k, lines: wrap(v, valueFont) }));
  const textH = blocks.reduce((h, b) => h + 18 + b.lines.length * lineH + 10, 0);
  const W = pad + qrSize + gap + textW + pad;
  const H = pad * 2 + Math.max(qrSize, textH);

  svgToCanvas(svg, (qrCanvas) => {
    const c = document.createElement("canvas");
    c.width = W * S;
    c.height = H * S;
    const ctx = c.getContext("2d");
    ctx.scale(S, S);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, pad, pad, qrSize, qrSize);
    ctx.textBaseline = "top";
    let y = pad + 4;
    const x = pad + qrSize + gap;
    for (const b of blocks) {
      ctx.font = labelFont;
      ctx.fillStyle = "#555";
      ctx.fillText(b.k, x, y);
      y += 18;
      ctx.font = valueFont;
      ctx.fillStyle = "#000";
      for (const l of b.lines) {
        ctx.fillText(l, x, y);
        y += lineH;
      }
      y += 10;
    }
    downloadDataURL(c.toDataURL("image/png"), "epc-qr-details.png");
  });
}

// Save-as UI
function toggleSaveMenu() {
  const menu = document.getElementById("saveMenu");
  const caret = document.getElementById("saveCaret");
  const open = !menu.classList.contains("open");
  if (open && !hasQR) return; // don't open if no QR
  menu.classList.toggle("open", open);
  caret.setAttribute("aria-expanded", String(open));
}
function closeSaveMenu() {
  const menu = document.getElementById("saveMenu");
  const caret = document.getElementById("saveCaret");
  menu.classList.remove("open");
  caret.setAttribute("aria-expanded", "false");
}

// ---------- Live UX updates ----------
function updateLiveUI() {
  const dict = t();

  // --- IBAN-Validierung (live) ---
  const ibanEl = document.getElementById("iban");
  const ibanHint = document.getElementById("ibanHint");
  const clean = ibanClean(ibanEl.value);

  if (clean.length >= 8) {
    const ok = ibanIsValid(ibanEl.value);
    ibanEl.classList.toggle("is-valid", ok);
    ibanEl.classList.toggle("is-invalid", !ok);
    ibanHint.textContent = ok ? dict.hint_iban_ok : dict.hint_iban_bad;
    const cc = ok ? ibanNeedsBic(ibanEl.value) : "";
    if (cc && !document.getElementById("bic").value.trim())
      ibanHint.textContent += " " + dict.hint_bic_noneea(cc);
  } else {
    ibanEl.classList.remove("is-valid", "is-invalid");
    ibanHint.textContent = "";
  }

  // --- Konflikt: Strukturierte Referenz vs. Verwendungszweck ---
  const unstructEl = document.getElementById("rem_unstruct");
  const structEl = document.getElementById("rem_struct");
  const conflict = !!unstructEl.value.trim() && !!structEl.value.trim();
  const liveInfo = document.getElementById("liveInfo");

  // Erst zurücksetzen
  unstructEl.classList.remove("is-invalid");
  structEl.classList.remove("is-invalid");

  if (conflict) {
    // Beide rot hervorheben (Fehlerzustand hat via CSS Fokus-Prio)
    unstructEl.classList.add("is-invalid");
    structEl.classList.add("is-invalid");

    liveInfo.textContent = dict.live_conflict;
    liveInfo.classList.remove("warn");
    setStatus(dict.live_conflict, false, true);
  } else {
    // Only the free-text fields: the others are validated against their own
    // pattern already and cannot carry anything unexpected.
    const outside = charsOutsideSepaSet(
      document.getElementById("name").value,
      unstructEl.value,
      structEl.value,
      document.getElementById("b2o").value
    );
    liveInfo.textContent = outside.length
      ? dict.live_charset(outside.join(" "))
      : dict.live_ok;
    liveInfo.classList.toggle("warn", outside.length > 0);
    // Warn-Status zurücknehmen, falls er nur vom Konflikt kam
    const s = document.getElementById("status");
    if (s.classList.contains("warn")) setStatus("");
  }

  // --- Live-Bytezähler anhand Draft-Payload ---
  try {
    const draft = buildPayloadDraft();
    const bytes = payloadByteLen(
      draft,
      document.getElementById("charset").value
    );
    document.getElementById("bytes").textContent = `${bytes} / 331`;
  } catch {
    document.getElementById("bytes").textContent = "–";
  }
}

// Debounced live UI updates to avoid excessive re-renders while typing
let _liveUITimer = null;
function queueLiveUI(delayMs = 120) {
  try {
    clearTimeout(_liveUITimer);
  } catch {}
  _liveUITimer = setTimeout(updateLiveUI, delayMs);
}

// ---------- Events ----------
document.getElementById("gen").addEventListener("click", () => {
  try {
    // normalize amount visually
    const amountEl = document.getElementById("amount");
    // sanitize current value according to language rules
    // (a blank field stays blank: the amount is optional)
    amountEl.value = sanitizeAmountValue(amountEl.value);
    const n = parseAmountToNumber(amountEl.value);
    if (isFinite(n)) amountEl.value = formatAmountLocalized(n, LANG);

    const v = {
      name: document.getElementById("name").value || "",
      iban: document.getElementById("iban").value || "",
      amount: document.getElementById("amount").value || "",
      rem_unstruct: (document.getElementById("rem_unstruct").value || "").trim(),
      rem_struct: (document.getElementById("rem_struct").value || "").trim(),
      purpose: (document.getElementById("purpose").value || "").trim(),
      bic: (document.getElementById("bic").value || "").trim(),
      b2o: document.getElementById("b2o").value || "",
      version: document.getElementById("version").value,
      charset: document.getElementById("charset").value,
    };

    const dict = t();
    if (!v.name.trim()) throw new Error(dict.err_name);
    if (!ibanIsValid(v.iban)) throw new Error(dict.err_iban);
    if (v.purpose && !/^[A-Za-z0-9]{1,4}$/.test(v.purpose))
      throw new Error(dict.err_purpose);
    // Enforce uppercase BIC: convert in UI; validate uppercase pattern here
    if (v.bic && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v.bic))
      throw new Error(dict.err_bic);
    // EPC069-12 2.2: the BIC is mandatory in version 001 and optional only
    // from version 002 on. A 001 code without BIC is outside the standard.
    const nonEea = ibanNeedsBic(v.iban);
    if ((nonEea || v.version === "001") && !v.bic) {
      // the BIC field sits in the collapsed Advanced section
      document.getElementById("bic").closest("details").open = true;
    }
    if (nonEea && !v.bic) throw new Error(dict.err_bic_noneea(nonEea));
    if (v.version === "001" && !v.bic) throw new Error(dict.err_bic_v1);
    if (v.rem_struct && /^RF/i.test(v.rem_struct)) {
      if (!rfIsValid(structRefClean(v.rem_struct))) throw new Error(dict.err_rf);
    }

    const payload = buildPayload(v);
    assertEncodable(payload, v.charset);
    const bytes = ensureLimits(payload, v.charset);

    renderQR(payload, v.charset);
    lastPayment = {
      ...v,
      name: v.name.trim(),
      bic: v.bic.toUpperCase(),
      amount: v.amount ? asEUR(v.amount).slice(3) : "",
    };
    // show it in the user's own number format, not the payload's
    if (lastPayment.amount)
      lastPayment.amount = formatAmountLocalized(Number(lastPayment.amount), LANG);
    showPayload(payload, bytes);
    setStatus(dict.status_ok, true);
  } catch (err) {
    setStatus(err.message || String(err), false);
    console.error(err);
  }
});

// Save-as split
document.getElementById("saveBtn").addEventListener("click", toggleSaveMenu);
document.getElementById("saveCaret").addEventListener("click", toggleSaveMenu);
document.getElementById("savePNG").addEventListener("click", () => {
  closeSaveMenu();
  exportPNG();
});
document.getElementById("saveSVG").addEventListener("click", () => {
  closeSaveMenu();
  exportSVG();
});
document.getElementById("saveJPG").addEventListener("click", () => {
  closeSaveMenu();
  exportJPG();
});
document.getElementById("saveCard").addEventListener("click", () => {
  closeSaveMenu();
  exportCard();
});
document.getElementById("saveTXT").addEventListener("click", () => {
  closeSaveMenu();
  exportTXT();
});
document.getElementById("copyTXT").addEventListener("click", () => {
  closeSaveMenu();
  copyText();
});
document.addEventListener("click", (e) => {
  const split = document.getElementById("save-split");
  if (!split.contains(e.target)) closeSaveMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSaveMenu();
});

// Example data
document.getElementById("ex").addEventListener("click", () => {
  const dict = t();
  const ex = dict.exdata;
  const map = {
    name: ex.name,
    iban: ex.iban,
    amount: ex.amount,
    rem_unstruct: ex.unstruct,
    rem_struct: ex.struct,
    purpose: ex.purpose,
    bic: ex.bic,
    b2o: ex.b2o,
  };
  for (const id in map) {
    const el = document.getElementById(id);
    if (el) el.value = map[id];
  }
  const ibanEl = document.getElementById("iban");
  if (ibanEl && ibanEl.value) formatIbanUIKeepCaret(ibanEl);
  clearQR();
  setStatus(dict.status_prefill, true);
  updateLiveUI();
});

// Input reactions: clear QR, IBAN spacing, remember lastChanged, live checks
for (const id of [
  "name",
  "iban",
  "amount",
  "rem_unstruct",
  "rem_struct",
  "purpose",
  "bic",
  "b2o",
  "version",
  "charset",
]) {
  const el = document.getElementById(id);
  if (!el) continue;
  el.addEventListener("input", () => {
    if (id === "iban") formatIbanUIKeepCaret(el);
    if (id === "amount") formatAmountUIKeepCaret(el, LANG);
    if (id === "bic" || id === "rem_struct") {
      const pos = el.selectionStart;
      el.value = String(el.value || "").toUpperCase();
      if (typeof pos === "number")
        try {
          el.setSelectionRange(pos, pos);
        } catch {}
    }
    if (hasQR) clearQR();
    lastChanged = id; // track which field triggered the change
    queueLiveUI();
  });
  if (id === "amount")
    el.addEventListener("blur", formatAmountFieldToTwoDecimals);
}

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

// ---------- Init ----------
// The version is language independent, so it is written once at startup and
// not touched by applyLang().
function renderVersion() {
  const el = document.getElementById("f_version");
  // Labelled, because a bare "v2026.08.28.1" at the bottom of the page reads
  // as just another link and gets missed - and identifying an offline copy is
  // the whole point of showing it.
  if (el) el.textContent = `${t().footer_version} ${APP_VERSION}`;
}

(function init() {
  ensureI18N();
  initTheme();
  renderVersion();
  const pref = detectPreferredLang();
  populateLangSelect(pref);
  if (!window.I18N[pref] && OPTIONAL_LOCALES.includes(pref)) {
    loadLocale(pref).then(() => applyLang(window.I18N[pref] ? pref : "en"));
  } else {
    applyLang(window.I18N[pref] ? pref : "en");
  }
  // Accessibility and validation attributes (avoid relying on possibly corrupted inline HTML)
  try {
    // Fix base EN strings if source encoding ever got mangled
    const en = window.I18N && window.I18N.en;
    if (en) {
      en.lf = "Line breaks are shown as \\n.";
      if (en.placeholders) en.placeholders.struct = "e.g., RF18XXXX";
      en.status_prefill = "Example data filled. Click 'Generate QR code'.";
      en.err_purpose = "Purpose code must be 1–4 alphanumeric characters.";
      en.footer_buy = "Buy me a coffee";
      en.footer_kofi = "Ko-fi";
      en.footer_gh = "GitHub";
    }
    const statusEl = document.getElementById("status");
    if (statusEl) {
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
    }
    const ibanEl = document.getElementById("iban");
    if (ibanEl) {
      ibanEl.setAttribute("autocapitalize", "characters");
      ibanEl.setAttribute("inputmode", "text");
      ibanEl.setAttribute("pattern", "^[A-Z]{2}[0-9]{2}[A-Z0-9 ]{0,30}$");
      ibanEl.setAttribute(
        "title",
        "Starts with country code + 2 digits; letters/digits, spaces allowed"
      );
    }
    const structEl = document.getElementById("rem_struct");
    if (structEl) {
      structEl.setAttribute("autocapitalize", "characters");
      structEl.setAttribute(
        "title",
        "Creditor reference, max. 35 characters. RF references (ISO 11649) are checked."
      );
    }
    const saveCaret = document.getElementById("saveCaret");
    if (saveCaret) {
      saveCaret.setAttribute("aria-label", "Open save format menu");
      saveCaret.textContent = "▼";
    }
  } catch {}
  const ibanEl = document.getElementById("iban");
  if (ibanEl && ibanEl.value) formatIbanUIKeepCaret(ibanEl);
  clearQR(); // start disabled
  updateLiveUI();
})();
