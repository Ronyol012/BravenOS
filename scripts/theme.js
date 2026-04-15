/**
 * theme.js — Modo oscuro y claro
 *
 * Controla si el sitio se ve claro (día) u oscuro (noche).
 * El usuario elige y lo guardamos para la próxima vez.
 */

import { lucideIcon } from './utils.js';

/* Tema actual, cargado de lo que guardó el usuario antes */
let temaActual = localStorage.getItem('brv-tema') || 'light';

/** Aplica el tema al HTML y actualiza el ícono del botón */
export function aplicarTema() {
  document.documentElement.setAttribute('data-theme', temaActual);
  const btn = document.getElementById('btnTema');
  if (btn) {
    btn.innerHTML = lucideIcon(temaActual === 'dark' ? 'sun' : 'moon', 13);
    if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
  }
}

/** Alterna entre claro y oscuro */
export function toggleTema() {
  temaActual = temaActual === 'light' ? 'dark' : 'light';
  localStorage.setItem('brv-tema', temaActual);
  aplicarTema();
}

export function getTema() { return temaActual; }
