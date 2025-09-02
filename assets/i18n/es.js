window.I18N = window.I18N || {};
window.I18N.es = {
  paymentData: "Datos de pago",
  advanced: "Avanzado (opcional)",
  l_name: "Beneficiario (nombre)",
  l_iban: "IBAN",
  l_amount: "Importe en EUR",
  l_unstruct: "Referencia de pago",
  l_struct: "Referencia estructurada",
  h_struct: "Usar solo si no se proporciona referencia de pago (texto libre).",
  l_purpose: "Código de propósito (opcional)",
  h_purpose: "Códigos estandarizados de cuatro letras (p. ej., GDDS, SALA, CHAR).",
  l_bic: "BIC (solo en casos especiales)",
  l_b2o: "Nota para el ordenante",
  l_version: "Versión",
  l_charset: "Conjunto de caracteres",
  h_limit: "Carga máxima 331 bytes. Sin salto de línea adicional tras el último campo.",
  btn_gen: "Generar código QR",
  btn_ex: "Datos de ejemplo",

  // Guardar como
  save_as: "Guardar como",
  save_png: "PNG",
  save_svg: "SVG",
  save_jpg: "JPG",

  // UX
  theme_dark: "Oscuro",
  theme_light: "Claro",
  hint_iban_ok: "El IBAN parece válido.",
  hint_iban_bad: "El IBAN no es válido.",
  hint_amount_fmt: "Se formateará a dos decimales al generar.",
  live_checks: "Comprobaciones en vivo:",
  live_ok: "OK",
  live_conflict: "Conflicto: use Referencia estructurada O Referencia de pago.",
  tooltip_struct: "Usa la referencia de acreedor RF (ISO 11649). Si se establece, deje vacía la Referencia de pago.",
  tooltip_purpose: "Código estándar como GDDS (bienes), SALA (salario), CHAR (caridad). Opcional.",
  totalBytes: "Bytes totales:",
  qrInfo: "Info del QR:",
  details: "Mostrar detalles (carga EPC)",
  lf: "Los saltos de línea se muestran como ⏎.",

  placeholders: {
    name: "p. ej., Ejemplo S.L.",
    iban: "DE89 3704 0044 0532 0130 00",
    amount: "12,34",
    unstruct: "Factura 4711, Cliente 123",
    struct: "p. ej., RF18…",
    purpose: "p. ej., GDDS",
    bic: "normalmente vacío en la UE",
    b2o: "opcional"
  },
  exdata: {
    name: "Ejemplo S.L.",
    iban: "DE71 1102 2033 0123 4567 89",
    amount: "12,30",
    unstruct: "Factura 4711",
    struct: "",
    purpose: "",
    bic: "",
    b2o: ""
  },
  status_ok: "Código QR creado. Escanéelo con su app bancaria o guárdelo.",
  status_prefill: "Datos de ejemplo rellenados. Haga clic en Generar código QR.",
  status_noqr: "Aún no hay código QR.",
  err_name: "El beneficiario es obligatorio.",
  err_iban: "El IBAN no es válido.",
  err_purpose: "El código de propósito debe tener 1–4 caracteres alfanuméricos.",
  err_bic: "Formato de BIC no válido.",
  err_len: (bytes) => `Texto demasiado largo: la carga supera 331 bytes (${bytes}). Por favor, acórtelo.`,
  err_qrlib: "Biblioteca de QR no cargada. Asegúrese de que assets/qrcode.min.js exista y se cargue antes de app.js.",

  // Pie de página (marcas permanecen en inglés)
  footer_offline: "Esta página funciona completamente sin conexión. Solo abra index.html.",
  footer_support: "Soporte:",
  footer_buy: "Buy me a coffee",
  footer_kofi: "Ko-fi",
  footer_gh: "GitHub"
};

