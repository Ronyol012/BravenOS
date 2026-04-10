/**
 * currency.js — Cambio de moneda
 *
 * Permite ver los precios en RD$, US$ o €.
 * Cuando el usuario cambia la moneda, actualizamos los precios.
 */

import { SIMBOLOS } from './config.js';

/* Moneda activa, cargada de la última visita */
let monedaActual = localStorage.getItem('brv-moneda') || 'DOP';

/** Devuelve la moneda activa */
export function getMoneda() { return monedaActual; }

/** Cambia a una moneda específica y actualiza la UI */
export function setMoneda(moneda, onCambio) {
  monedaActual = moneda;
  localStorage.setItem('brv-moneda', moneda);

  /* Actualizar botones de selección de moneda */
  ['DOP', 'USD', 'EUR'].forEach(m => {
    const btn = document.getElementById('moneda-' + m);
    if (btn) btn.classList.toggle('activo', m === moneda);
  });

  /* Actualizar el botón de control del nav */
  const btnControl = document.getElementById('btnMoneda');
  if (btnControl) btnControl.textContent = moneda;

  /* Actualizar el span del menú mobile */
  const mobMoneda = document.getElementById('mobMoneda');
  if (mobMoneda) mobMoneda.textContent = moneda;

  /* Llamar al callback para re-renderizar pricing */
  if (typeof onCambio === 'function') onCambio();
}

/** Cicla entre las tres monedas */
export function ciclarMoneda(onCambio) {
  const orden = ['DOP', 'USD', 'EUR'];
  const siguiente = orden[(orden.indexOf(monedaActual) + 1) % 3];
  setMoneda(siguiente, onCambio);
}
