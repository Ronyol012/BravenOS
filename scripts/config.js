/**
 * config.js — Configuración central de Braven Studio
 *
 * ⚠ ESTE ES EL ARCHIVO QUE MÁS VAS A EDITAR.
 * Si cambia un precio, el WA o el dominio → edita aquí.
 */

/* ── Precios de los planes (en DOP) ──────────────────────── */
export const PRECIOS = {
  'BRV-01': 9000,
  'BRV-02': 12000,
  'BRV-03': 18000,
  'BRV-04': 28000,
};

/* ── Mantenimiento mensual (en DOP) ──────────────────────── */
export const MANTENIMIENTO = {
  'BRV-01': 3500,
  'BRV-02': 3500,
  'BRV-03': 5000,
  'BRV-04': 5000,
};

/* ── Tasas de conversión (1 DOP = X unidades) ────────────── */
export const TASAS = {
  DOP: 1,
  USD: 62,
  EUR: 67,
};

/* ── Símbolo de cada moneda ──────────────────────────────── */
export const SIMBOLOS = {
  DOP: 'RD$',
  USD: 'US$',
  EUR: '€',
};

/* ── Contacto ─────────────────────────────────────────────── */
export const WA_NUMERO  = '18298052619';
export const EMAIL      = 'bravenweb@gmail.com';
export const DOMINIO    = 'https://bravenweb.com';

/* ── Mensaje pre-llenado para WhatsApp ───────────────────── */
export const WA_MENSAJE = encodeURIComponent(
  'Hola Braven, vi su web y quiero cotizar un proyecto.'
);
