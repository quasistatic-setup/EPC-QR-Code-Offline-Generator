/* app.js – UX: live IBAN validation, smart amount formatting, asymmetric conflict highlight,
   live byte counter, tooltips, dark mode toggle, save-as split, i18n, IBAN spacing, true SVG export */

let LANG = "en";
let hasQR = false;
let lastChanged = null; // remembers which field was edited last (for conflict highlight)

// Optional locales (separate files in assets/i18n/)
const OPTIONAL_LOCALES = [
  "de","fr","it","es","nl","pt","sv","da","no","fi","is",
  "cs","sk","pl","hu","ro","bg","hr","sl","lt","lv","et",
  "el","ga","lb","rm","ca","tr","cy","gd","mt"
];

const LANGUAGE_NAMES = {
  en:"English", de:"Deutsch", fr:"Français", it:"Italiano", es:"Español", nl:"Nederlands",
  pt:"Português", sv:"Svenska", da:"Dansk", no:"Norsk", fi:"Suomi", is:"Íslenska",
  cs:"Čeština", sk:"Slovenčina", pl:"Polski", hu:"Magyar", ro:"Română", bg:"Български",
  hr:"Hrvatski", sl:"Slovenščina", lt:"Lietuvių", lv:"Latviešu", et:"Eesti",
  el:"Ελληνικά", ga:"Gaeilge", lb:"Lëtzebuergescht", rm:"Rumantsch", ca:"Català",
  tr:"Türkçe", cy:"Cymraeg", gd:"Gàidhlig", mt:"Malti"
};
// Normalize language endonyms (fix encoding issues)
Object.assign(LANGUAGE_NAMES, {
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
  mt: "Malti"
});

// ---------- i18n helpers ----------
function ensureI18N(){
  if (!window.I18N) window.I18N = {};
  if (!window.I18N.en) {
    // Minimal inline EN fallback if i18n-core.js failed
    window.I18N.en = {
      title:"EPC QR Code Offline Generator", paymentData:"Payment details", advanced:"Advanced (optional)",
      l_name:"Recipient (name)", l_iban:"IBAN", l_amount:"Amount in EUR", l_unstruct:"Payment reference",
      l_struct:"Structured reference", h_struct:"Use only if no payment reference (free text) is provided.",
      l_purpose:"Purpose code (optional)", h_purpose:"Standardized four-letter codes (e.g., GDDS, SALA, CHAR).",
      l_bic:"BIC (only in special cases)", l_b2o:"Note to originator", l_version:"Version", l_charset:"Character set",
      h_limit:"Maximum payload 331 bytes. No extra line break after the last field.",
      btn_gen:"Generate QR code", btn_ex:"Example data",
      save_as:"Save as", save_png:"PNG", save_svg:"SVG", save_jpg:"JPG",
      theme_dark:"Dark", theme_light:"Light",
      hint_iban_ok:"IBAN looks valid.", hint_iban_bad:"IBAN is invalid.", hint_amount_fmt:"Will be formatted to two decimals on generate.",
      live_checks:"Live checks:", live_ok:"OK", live_conflict:"Conflict: use either Structured reference OR Payment reference.",
      tooltip_struct:"Use RF creditor reference (ISO 11649). If you set this, leave Payment reference empty.",
      tooltip_purpose:"Standard code like GDDS (goods), SALA (salary), CHAR (charity). Optional.",
      totalBytes:"Total bytes:", qrInfo:"QR info:", details:"Show details (EPC payload)", lf:"Line breaks are shown as ⏎.",
      placeholders:{ name:"e.g., Example GmbH", iban:"DE89 3704 0044 0532 0130 00", amount:"12.34", unstruct:"Invoice 4711, Customer 123", struct:"e.g., RF18…", purpose:"e.g., GDDS", bic:"usually empty in EU", b2o:"optional" },
      exdata:{ name:"Example GmbH", iban:"DE71 1102 2033 0123 4567 89", amount:"12.30", unstruct:"Invoice 4711", struct:"", purpose:"", bic:"", b2o:"" },
      status_ok:"QR code created. Scan with your banking app or save.", status_prefill:"Example data filled. Click “Generate QR code”.", status_noqr:"No QR code yet.",
      err_name:"Recipient is required.", err_iban:"IBAN is invalid.", err_purpose:"Purpose code must be 1–4 alphanumeric characters.", err_bic:"Invalid BIC format.", err_amount_min:"Invalid amount: at least 0.01 EUR.",
      err_len:(b)=>`Text too long: payload exceeds 331 bytes (${b}). Please shorten.`, err_qrlib:"QR library not loaded. Ensure assets/qrcode.min.js exists and is loaded before app.js.",
      footer_offline:"This page works fully offline. Just open index.html.", footer_support:"Support:", footer_buy:"☕ Buy me a coffee", footer_kofi:"❤️ Ko-fi", footer_gh:"🌐 GitHub"
    };
  }
}
function t(){ ensureI18N(); return window.I18N[LANG] || window.I18N.en; }

function loadLocale(lang){
  ensureI18N();
  if (window.I18N[lang]) return Promise.resolve(true);
  if (!OPTIONAL_LOCALES.includes(lang)) return Promise.resolve(false);
  return new Promise((resolve)=>{
    const s = document.createElement('script');
    s.src = `./assets/i18n/${lang}.js`;
    s.async = true;
    s.onload = ()=> { try{ stripLocaleTitles(); }catch{} resolve(!!window.I18N[lang]); };
    s.onerror = ()=> resolve(false);
    document.head.appendChild(s);
  });
}
function detectPreferredLang(){
  const stored = localStorage.getItem('lang');
  if (stored) return stored;
  const list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"])
               .map(x => String(x||"").toLowerCase());
  for (const tag of list) {
    const base = tag.split('-')[0];
    if ((window.I18N && window.I18N[base]) || OPTIONAL_LOCALES.includes(base)) return base;
  }
  return "en";
}
function populateLangSelect(current){
  const select = document.getElementById('lang-select');
  if (!select) return;
  const allCodes = ["en", ...OPTIONAL_LOCALES];
  select.innerHTML = "";
  for (const code of allCodes) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = LANGUAGE_NAMES[code] || code.toUpperCase();
    if (code === current) opt.selected = true;
    select.appendChild(opt);
  }
  if (!select._bound) {
    select.addEventListener('change', async (e)=>{
      await maybeLoadAndApply(e.target.value);
    });
    select._bound = true;
  }
}
function applyLang(lang){
  try{ stripLocaleTitles(); }catch{}
  LANG = lang;
  const dict = t();
  document.documentElement.lang = lang;

  // Section headings
  // Keep product title constant across languages
  document.getElementById("t_title").textContent = (window.I18N?.en?.title) || "EPC QR Code Offline Generator";
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

  // Buttons / Save-as texts
  document.getElementById("gen").textContent = dict.btn_gen;
  document.getElementById("ex").textContent = dict.btn_ex;
  document.getElementById("saveBtn").textContent = dict.save_as;
  document.getElementById("savePNG").textContent = dict.save_png;
  document.getElementById("saveSVG").textContent = dict.save_svg;
  document.getElementById("saveJPG").textContent = dict.save_jpg;

  // Meta labels
  document.getElementById("t_totalBytes").innerHTML = "<strong>"+dict.totalBytes+"</strong>";
  document.getElementById("t_qrInfo").innerHTML = "<strong>"+dict.qrInfo+"</strong>";
  document.getElementById("t_details").textContent = dict.details;
  document.getElementById("t_lf").textContent = dict.lf;
  document.getElementById("t_liveValidity").innerHTML = "<strong>"+dict.live_checks+"</strong>";

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
  document.getElementById("f_offline").innerHTML = dict.footer_offline.replace("index.html","<em>index.html</em>");
  document.getElementById("f_support").textContent = dict.footer_support;
  document.getElementById("f_buy").textContent = dict.footer_buy;
  document.getElementById("f_kofi").textContent = dict.footer_kofi;
  document.getElementById("f_gh").textContent  = dict.footer_gh;
  fixFooterSeparators();

  // Tooltips
  document.getElementById("qm_struct").title = dict.tooltip_struct;
  document.getElementById("qm_purpose").title = dict.tooltip_purpose;

  // Amount hint
  document.getElementById("amountHint").textContent = dict.hint_amount_fmt;

  // Dark toggle label
  updateThemeButton();

  // Language selector + remember
  populateLangSelect(lang);
  localStorage.setItem('lang', lang);

  // Reformat amount according to new locale rules (space thousands + localized decimal)
  const amountEl = document.getElementById('amount');
  if (amountEl && amountEl.value) {
    const n = parseAmountToNumber(amountEl.value);
    if (isFinite(n)) amountEl.value = formatAmountLocalized(n, lang);
    else amountEl.value = sanitizeAmountValue(amountEl.value);
  }
}
async function maybeLoadAndApply(lang){
  if (!window.I18N?.[lang]) await loadLocale(lang);
  applyLang(window.I18N?.[lang] ? lang : "en");
  clearQR();       // do not show "no QR" message here
  updateLiveUI();  // refresh live checks
}

// ---------- Theme ----------
function updateThemeButton(){
  const btn = document.getElementById('themeToggle');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = (isDark ? '☀️ ' + t().theme_light : '🌙 ' + t().theme_dark);
}
function setTheme(mode){
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
  updateThemeButton();
}
function initTheme(){
  const stored = localStorage.getItem('theme');
  if (stored) { setTheme(stored); return; }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

// Remove locale-specific titles; keep only EN base
function stripLocaleTitles(){
  if (!window.I18N) return;
  for (const k of Object.keys(window.I18N)){
    if (k !== 'en' && window.I18N[k] && typeof window.I18N[k] === 'object'){
      try { delete window.I18N[k].title; } catch {}
    }
  }
}

// Footer separators and icons: "Support: ☕ Buy me a coffee · ❤️ Ko-fi · 🌐 GitHub"
function fixFooterSeparators(){
  const supportEl = document.getElementById('f_support');
  if (!supportEl) return;
  const container = supportEl.parentElement; // the span wrapping the links
  if (!container) return;

  // Find anchors and their label spans
  const buyA  = container.querySelector('a[href*="buymeacoffee"]');
  const kofiA = container.querySelector('a[href*="ko-fi"]');
  const ghA   = container.querySelector('a[href*="github.com"]');
  const buyL  = document.getElementById('f_buy');
  const kofiL = document.getElementById('f_kofi');
  const ghL   = document.getElementById('f_gh');

  // Clean any leading symbols in labels
  const clean = (el)=>{ if (el) el.textContent = String(el.textContent||'').replace(/^\s*[^A-Za-z0-9]+\s*/, ''); };
  clean(buyL); clean(kofiL); clean(ghL);

  // Prepend icons INSIDE the labels (prevents gaps caused by link margins)
  if (buyL)  buyL.textContent  = `☕ ${buyL.textContent}`.trim();
  if (kofiL) kofiL.textContent = `❤️ ${kofiL.textContent}`.trim();
  if (ghL)   ghL.textContent   = `🌐 ${ghL.textContent}`.trim();

  // Remove existing plain text nodes (old separators)
  Array.from(container.childNodes).forEach(n=>{ if (n.nodeType === 3) n.remove(); });

  // Rebuild separators exactly once: Buy · Ko-fi · GitHub
  if (buyA && kofiA) container.insertBefore(document.createTextNode(' · '), kofiA);
  if (kofiA && ghA)  container.insertBefore(document.createTextNode(' · '), ghA);
}

// ---------- Validation & helpers ----------
function ibanClean(s){ return String(s||'').replace(/[\s\-]/g,'').toUpperCase(); }
function ibanIsValid(iban){
  const s = ibanClean(iban);
  if(!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(s)) return false;
  const moved = s.slice(4)+s.slice(0,4);
  const num = moved.replace(/[A-Z]/g, c => (c.charCodeAt(0)-55).toString());
  let rem = 0;
  for (let i=0;i<num.length;i+=7) rem = parseInt(String(rem)+num.substr(i,7),10)%97;
  return rem===1; // ISO 13616 mod-97
}
// --- Amount helpers (locale-specific separators) ---
const DOT_DECIMAL_LANGS = new Set(["en","ga","cy","gd","mt"]);
function getDecimalSeparator(lang){ return DOT_DECIMAL_LANGS.has(lang) ? '.' : ','; }
function parseAmountToNumber(amount){
  const s = String(amount||'').trim().replace(/\s+/g,'');
  // be tolerant: treat comma as decimal when present, else dot
  const normalized = s.includes(',') ? s.replace(',', '.') : s;
  const n = Number(normalized);
  return isFinite(n) ? n : NaN;
}
function formatAmountLocalized(n, lang){
  const dec = getDecimalSeparator(lang);
  const sign = n < 0 ? '-' : '';
  const fixed = Math.abs(n).toFixed(2);
  const [intPart, fracPart] = fixed.split('.');
  // group thousands with spaces
  const g = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + g + (dec + fracPart);
}
function sanitizeAmountValue(value){
  // allow digits, spaces, dot and comma; keep at most one decimal (mapped to dot)
  let s = String(value||'').replace(/[^0-9., ]/g, '');
  s = s.replace(/ {2,}/g, ' ');
  // unify to dot
  s = s.replace(/,/g, '.');
  if (s.indexOf('.') !== -1) {
    const i = s.indexOf('.');
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
  }
  return s;
}

function formatAmountUIKeepCaret(inputEl, lang){
  const raw = String(inputEl.value||'');
  const caret = inputEl.selectionStart ?? raw.length;
  // Count digits before caret in the original raw input
  const digitsBefore = (raw.slice(0, caret).match(/\d/g) || []).length;
  const rawBefore = raw.slice(0, caret);
  const justTypedDecimal = /[.,]$/.test(rawBefore);

  // Sanitize and normalize
  let s = sanitizeAmountValue(raw); // digits, spaces, single dot as decimal (dot)
  // remove spaces for numeric processing
  s = s.replace(/\s+/g,'');
  // split into int/frac by dot (if any)
  let intPart = s, fracPart = '';
  const dotIdx = s.indexOf('.');
  const hadDot = dotIdx !== -1; // remember if user typed a decimal separator
  if (dotIdx !== -1) {
    intPart = s.slice(0, dotIdx);
    fracPart = s.slice(dotIdx + 1);
  }
  intPart = intPart.replace(/\D/g, '');
  fracPart = fracPart.replace(/\D/g, '');

  // group thousands with spaces
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const dec = getDecimalSeparator(lang);
  // Show decimal separator if user just typed it, even without fractional digits yet
  const formatted = grouped + ((fracPart || hadDot) ? (dec + fracPart) : '');

  // determine new caret position: after same number of digits
  let seen = 0, newCaret = 0;
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
  try { inputEl.setSelectionRange(newCaret, newCaret); } catch {}
}
function asEUR(amount){
  if(!amount) return '';
  const n = parseAmountToNumber(amount);
  if(!isFinite(n)||n<0.01) throw new Error(t().err_amount_min);
  return 'EUR'+n.toFixed(2);
}
function formatAmountFieldToTwoDecimals(){
  const el = document.getElementById('amount');
  const n = parseAmountToNumber(el.value);
  if (!isFinite(n)) return;
  el.value = formatAmountLocalized(n, LANG);
}

// IBAN auto spacing with caret preservation
function formatIbanUIKeepCaret(inputEl){
  const raw = inputEl.value;
  const selStart = inputEl.selectionStart || 0;
  let rawIndex = 0;
  for (let i=0, r=0; i<raw.length && i<selStart; i++){
    if (/\S/.test(raw[i])) r++;
    rawIndex = r;
  }
  const normalized = raw.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  const chunks = normalized.match(/.{1,4}/g) || [];
  const formatted = chunks.join(' ');
  let formattedCaret = 0, seenRaw = 0;
  for (const ch of formatted){
    if (ch !== ' ') { seenRaw++; }
    formattedCaret++;
    if (seenRaw >= rawIndex) break;
  }
  if (selStart === raw.length) formattedCaret = formatted.length;
  inputEl.value = formatted;
  inputEl.setSelectionRange(formattedCaret, formattedCaret);
}

function byteLenUtf8(str){ return new TextEncoder().encode(str).length; }

// Build payload "draft" to compute live byte length even if not valid yet
function buildPayloadDraft(){
  const v = {
    name: document.getElementById('name').value || '',
    iban: document.getElementById('iban').value || '',
    amount: document.getElementById('amount').value || '',
    rem_unstruct: document.getElementById('rem_unstruct').value || '',
    rem_struct: document.getElementById('rem_struct').value || '',
    purpose: document.getElementById('purpose').value || '',
    bic: document.getElementById('bic').value || '',
    b2o: document.getElementById('b2o').value || '',
    version: document.getElementById('version').value,
    charset: document.getElementById('charset').value
  };
  const lines = [];
  lines.push('BCD', v.version || '001', v.charset || '1', 'SCT');
  lines.push(v.bic ? v.bic.trim() : '');
  lines.push((v.name||'').trim());
  lines.push(ibanClean(v.iban));
  const n = parseAmountToNumber(v.amount); lines.push(isFinite(n) && n>=0.01 ? 'EUR'+n.toFixed(2) : '');
  lines.push(v.purpose ? v.purpose.toUpperCase() : '');
  const hasStruct = !!v.rem_struct, hasUnstruct = !!v.rem_unstruct;
  lines.push(hasStruct ? v.rem_struct.trim() : '');
  lines.push(hasUnstruct ? v.rem_unstruct.trim() : '');
  lines.push(v.b2o ? v.b2o.trim() : '');
  return lines.join('\n').replace(/(\n)+$/,'');
}

function buildPayload(v){
  const lines = [];
  lines.push('BCD', v.version || '001', v.charset || '1', 'SCT');
  lines.push(v.bic ? v.bic.trim() : '');
  lines.push(v.name.trim());
  lines.push(ibanClean(v.iban));
  lines.push(v.amount ? asEUR(v.amount) : '');
  lines.push(v.purpose ? v.purpose.toUpperCase() : '');
  const hasStruct = !!v.rem_struct, hasUnstruct = !!v.rem_unstruct;
  if (hasStruct && hasUnstruct)
    throw new Error(LANG==="de"
      ? "Bitte nur EINE Referenz verwenden: entweder „Strukturiert“ ODER „Verwendungszweck“."
      : "Use only ONE reference: either structured OR free text.");
  lines.push(hasStruct ? v.rem_struct.trim() : '');
  lines.push(hasUnstruct ? v.rem_unstruct.trim() : '');
  lines.push(v.b2o ? v.b2o.trim() : '');
  return lines.join('\n').replace(/(\n)+$/,'');
}

function ensureLimits(payload){
  const bytes = byteLenUtf8(payload);
  if (bytes > 331) throw new Error(t().err_len(bytes));
  return bytes;
}

// ---------- QR rendering & export ----------
let qrobj = null;
function setDownloadEnabled(enabled){
  document.getElementById('saveBtn').disabled = !enabled;
  document.getElementById('saveCaret').disabled = !enabled;
  document.getElementById('savePNG').disabled = !enabled;
  document.getElementById('saveSVG').disabled = !enabled;
  document.getElementById('saveJPG').disabled = !enabled;
}
function renderQR(text){
  if (typeof window.QRCode === "undefined") throw new Error(t().err_qrlib);
  const box = document.getElementById('qrcanvas');
  box.innerHTML = '';
  qrobj = new QRCode(box, { width:300, height:300, correctLevel: QRCode.CorrectLevel.M });
  if (typeof qrobj.makeCode === 'function') qrobj.makeCode(text);
  else { box.innerHTML=''; qrobj = new QRCode(box, { text, width:300, height:300, correctLevel: QRCode.CorrectLevel.M }); }
  hasQR = true; setDownloadEnabled(true);
}
function clearQR(){
  document.getElementById('qrcanvas').innerHTML = '';
  document.getElementById('payload').textContent = '';
  document.getElementById('bytes').textContent = '–';
  document.getElementById('liveInfo').textContent = '–';
  hasQR = false; setDownloadEnabled(false);
  closeSaveMenu();
}
function showPayload(payload, bytes){
  document.getElementById('payload').textContent = payload.replace(/\n/g,'⏎\n');
  document.getElementById('bytes').textContent = `${bytes} / 331`;
}
function setStatus(msg, ok=false, warn=false){
  const s = document.getElementById('status');
  s.textContent = msg;
  s.className = 'status ' + (warn? 'warn' : (ok?'ok':'err'));
}

// True vector SVG export from QR matrix (no extra lib)
function exportSVG(){
  if (!hasQR || !qrobj || !qrobj._oQRCode) { setStatus(t().status_noqr, false); return; }
  const qr = qrobj._oQRCode;
  const n = typeof qr.getModuleCount === "function" ? qr.getModuleCount() : qr.moduleCount;
  if (!n) { setStatus(t().status_noqr, false); return; }
  let rects = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const dark = typeof qr.isDark === "function" ? qr.isDark(r, c) : (qr.modules && qr.modules[r] && qr.modules[r][c]);
      if (dark) rects += `<rect x="${c}" y="${r}" width="1" height="1"/>`;
    }
  }
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="#fff"/>
  <g fill="#000">${rects}</g>
</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'epc-qr.svg'; a.click();
  URL.revokeObjectURL(url);
}

function getQRNodes(){
  const box=document.getElementById('qrcanvas');
  return { img: box.querySelector('img'), canvas: box.querySelector('canvas') };
}
function downloadDataURL(dataURL, filename){
  const a=document.createElement('a'); a.href=dataURL; a.download=filename; a.click();
}
function exportPNG(){
  const {img, canvas} = getQRNodes();
  if (canvas) return downloadDataURL(canvas.toDataURL('image/png'), 'epc-qr.png');
  if (img && img.src) return downloadDataURL(img.src, 'epc-qr.png');
  setStatus(t().status_noqr, false);
}
function exportJPG(){
  const {img, canvas} = getQRNodes();
  if (canvas) return downloadDataURL(canvas.toDataURL('image/jpeg', 0.92), 'epc-qr.jpg');
  if (img && img.src){
    const c = document.createElement('canvas'); c.width=300; c.height=300;
    const ctx = c.getContext('2d');
    const im = new Image();
    im.onload = function(){ ctx.drawImage(im,0,0,300,300); downloadDataURL(c.toDataURL('image/jpeg', 0.92), 'epc-qr.jpg'); };
    im.src = img.src; return;
  }
  setStatus(t().status_noqr, false);
}

// Save-as UI
function toggleSaveMenu(){
  const menu = document.getElementById('saveMenu');
  const caret = document.getElementById('saveCaret');
  const open = !menu.classList.contains('open');
  if (open && !hasQR) return; // don't open if no QR
  menu.classList.toggle('open', open);
  caret.setAttribute('aria-expanded', String(open));
}
function closeSaveMenu(){
  const menu = document.getElementById('saveMenu');
  const caret = document.getElementById('saveCaret');
  menu.classList.remove('open');
  caret.setAttribute('aria-expanded', 'false');
}

// ---------- Live UX updates ----------
function updateLiveUI(){
  const dict = t();

  // --- IBAN-Validierung (live) ---
  const ibanEl = document.getElementById('iban');
  const ibanHint = document.getElementById('ibanHint');
  const clean = ibanClean(ibanEl.value);

  if (clean.length >= 8) {
    const ok = ibanIsValid(ibanEl.value);
    ibanEl.classList.toggle('is-valid', ok);
    ibanEl.classList.toggle('is-invalid', !ok);
    ibanHint.textContent = ok ? dict.hint_iban_ok : dict.hint_iban_bad;
  } else {
    ibanEl.classList.remove('is-valid','is-invalid');
    ibanHint.textContent = '';
  }

  // --- Konflikt: Strukturierte Referenz vs. Verwendungszweck ---
  const unstructEl = document.getElementById('rem_unstruct');
  const structEl   = document.getElementById('rem_struct');
  const conflict = !!unstructEl.value.trim() && !!structEl.value.trim();
  const liveInfo = document.getElementById('liveInfo');

  // Erst zurücksetzen
  unstructEl.classList.remove('is-invalid');
  structEl.classList.remove('is-invalid');

  if (conflict) {
    // Beide rot hervorheben (Fehlerzustand hat via CSS Fokus-Prio)
    unstructEl.classList.add('is-invalid');
    structEl.classList.add('is-invalid');

    liveInfo.textContent = dict.live_conflict;
    setStatus(dict.live_conflict, false, true);
  } else {
    liveInfo.textContent = dict.live_ok;
    // Warn-Status zurücknehmen, falls er nur vom Konflikt kam
    const s = document.getElementById('status');
    if (s.classList.contains('warn')) setStatus('');
  }

  // --- Live-Bytezähler anhand Draft-Payload ---
  try {
    const draft = buildPayloadDraft();
    const bytes = byteLenUtf8(draft);
    document.getElementById('bytes').textContent = `${bytes} / 331`;
  } catch {
    document.getElementById('bytes').textContent = '–';
  }
}


// ---------- Events ----------
document.getElementById('gen').addEventListener('click', ()=>{
  try{
    // normalize amount visually
    const amountEl = document.getElementById('amount');
    // sanitize current value according to language rules
    amountEl.value = sanitizeAmountValue(amountEl.value);
    const n = parseAmountToNumber(amountEl.value);
    if (isFinite(n)) amountEl.value = formatAmountLocalized(n, LANG);

    const v = {
      name: document.getElementById('name').value || '',
      iban: document.getElementById('iban').value || '',
      amount: document.getElementById('amount').value || '',
      rem_unstruct: document.getElementById('rem_unstruct').value || '',
      rem_struct: document.getElementById('rem_struct').value || '',
      purpose: document.getElementById('purpose').value || '',
      bic: document.getElementById('bic').value || '',
      b2o: document.getElementById('b2o').value || '',
      version: document.getElementById('version').value,
      charset: document.getElementById('charset').value
    };

    const dict = t();
    if(!v.name.trim()) throw new Error(dict.err_name);
    if(!ibanIsValid(v.iban)) throw new Error(dict.err_iban);
    if(v.purpose && !/^[A-Za-z0-9]{1,4}$/.test(v.purpose)) throw new Error(dict.err_purpose);
    if(v.bic && !/^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(v.bic)) throw new Error(dict.err_bic);

    const payload = buildPayload(v);
    const bytes = ensureLimits(payload);

    renderQR(payload);
    showPayload(payload, bytes);
    setStatus(dict.status_ok, true);
  }catch(err){
    setStatus(err.message || String(err), false);
    console.error(err);
  }
});

// Save-as split
document.getElementById('saveBtn').addEventListener('click', toggleSaveMenu);
document.getElementById('saveCaret').addEventListener('click', toggleSaveMenu);
document.getElementById('savePNG').addEventListener('click', ()=>{ closeSaveMenu(); exportPNG(); });
document.getElementById('saveSVG').addEventListener('click', ()=>{ closeSaveMenu(); exportSVG(); });
document.getElementById('saveJPG').addEventListener('click', ()=>{ closeSaveMenu(); exportJPG(); });
document.addEventListener('click', (e)=>{ const split = document.getElementById('save-split'); if (!split.contains(e.target)) closeSaveMenu(); });
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeSaveMenu(); });

// Example data
document.getElementById('ex').addEventListener('click', ()=>{
  const dict = t();
  const ex = dict.exdata;
  const map = {
    name: ex.name, iban: ex.iban, amount: ex.amount,
    rem_unstruct: ex.unstruct, rem_struct: ex.struct, purpose: ex.purpose,
    bic: ex.bic, b2o: ex.b2o
  };
  for (const id in map) { const el = document.getElementById(id); if (el) el.value = map[id]; }
  const ibanEl = document.getElementById('iban'); if (ibanEl && ibanEl.value) formatIbanUIKeepCaret(ibanEl);
  clearQR();
  setStatus(dict.status_prefill, true);
  updateLiveUI();
});

// Input reactions: clear QR, IBAN spacing, remember lastChanged, live checks
for (const id of ["name","iban","amount","rem_unstruct","rem_struct","purpose","bic","b2o","version","charset"]) {
  const el = document.getElementById(id);
  if (!el) continue;
  el.addEventListener("input", ()=>{
    if (id === "iban") formatIbanUIKeepCaret(el);
    if (id === "amount") formatAmountUIKeepCaret(el, LANG);
    if (hasQR) clearQR();
    lastChanged = id; // track which field triggered the change
    updateLiveUI();
  });
  if (id === "amount") el.addEventListener("blur", formatAmountFieldToTwoDecimals);
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', ()=>{
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// Language dropdown (defensive duplicate of handler in populateLangSelect)
document.getElementById('lang-select').addEventListener('change', async (e)=>{
  await maybeLoadAndApply(e.target.value);
});

// ---------- Init ----------
(function init(){
  ensureI18N();
  initTheme();
  const pref = detectPreferredLang();
  populateLangSelect(pref);
  if (!window.I18N[pref] && OPTIONAL_LOCALES.includes(pref)) {
    loadLocale(pref).then(()=> applyLang(window.I18N[pref] ? pref : "en"));
  } else {
    applyLang(window.I18N[pref] ? pref : "en");
  }
  const ibanEl = document.getElementById('iban');
  if (ibanEl && ibanEl.value) formatIbanUIKeepCaret(ibanEl);
  clearQR(); // start disabled
  updateLiveUI();
})();
