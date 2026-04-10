/**
 * pricing.js — Sección de planes y precios
 *
 * Renderiza las tarjetas de planes con sus precios en la
 * moneda activa, y maneja los add-ons (extras) que el
 * usuario puede agregar a cada plan.
 */

import { PRECIOS, MANTENIMIENTO } from './config.js';
import { formatearPrecio, iconCheck, lucideIcon } from './utils.js';
import { getMoneda } from './currency.js';

/* Guarda qué add-ons tiene activos cada plan */
const addonSeleccionados = {};

/** Renderiza el grid completo de planes */
export function renderPricing(contenido) {
  const contenedor = document.getElementById('planesGrid');
  if (!contenedor) return;

  const moneda = getMoneda();
  let html = '';

  contenido.planes.forEach(plan => {
    /* Badge de "más vendido" solo en el plan destacado */
    const badge = plan.destacado
      ? `<div class="plan__top-badge">${plan.badge} ✦</div>`
      : '';

    /* Lista de features con ícono de check */
    const features = plan.features
      .map(f => `<li class="plan__feature">${iconCheck()}<span>${f}</span></li>`)
      .join('');

    /* Chips de add-ons */
    const chips = contenido.addons.map(ao => {
      const activo = addonSeleccionados[plan.id]?.[ao.k] ? ' activo' : '';
      return `<span class="addon-chip${activo}"
        data-pid="${plan.id}" data-k="${ao.k}" data-p="${ao.p}"
        onclick="window.toggleAddon(this)">
        <span class="addon-chip__punto"></span>
        ${ao.lbl} +${formatearPrecio(ao.p, moneda)}
      </span>`;
    }).join('');

    /* Clase del botón según si es plan destacado o no */
    const claseBtn = plan.destacado ? 'plan__btn--destacado' : 'plan__btn';

    html += `
      <div class="plan ${plan.destacado ? 'plan--destacado' : ''}">
        ${badge}
        <div>
          <div class="plan__id">${plan.id}</div>
          <div class="plan__nombre">${plan.nombre}</div>
          <div class="plan__badge">${plan.badge}</div>
        </div>
        <div class="plan__precio">${formatearPrecio(PRECIOS[plan.id], moneda)}</div>
        <div class="plan__meta">
          <div class="plan__meta-fila">
            <span class="plan__meta-label">${contenido.prEntrega}</span>
            <span class="plan__meta-valor">${plan.entrega}</span>
          </div>
          <div class="plan__meta-fila">
            <span class="plan__meta-label">${contenido.prMant}</span>
            <span class="plan__meta-valor">${formatearPrecio(MANTENIMIENTO[plan.id], moneda)}/mo</span>
          </div>
        </div>
        <div class="plan__divisor"></div>
        <ul class="plan__features">${features}</ul>
        <div class="plan__condiciones">${plan.condiciones}</div>
        <div class="addon-bar">
          <span class="addon-etiqueta">${contenido.addonsLbl}</span>
          ${chips}
        </div>
        <div class="addon-extra" id="addon-extra-${plan.id}"></div>
        <a href="#contacto" class="${claseBtn}">
          ${contenido.prEmpezar} ${plan.id} →
        </a>
      </div>`;
  });

  contenedor.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Activa o desactiva un add-on en un plan.
 * Se llama desde el onclick del chip en el HTML.
 * La exponemos en window para que el onclick inline funcione.
 */
export function toggleAddon(el) {
  const pid = el.getAttribute('data-pid');
  const k   = el.getAttribute('data-k');
  const p   = parseInt(el.getAttribute('data-p'), 10);

  if (!addonSeleccionados[pid]) addonSeleccionados[pid] = {};
  const activo = !addonSeleccionados[pid][k];
  addonSeleccionados[pid][k] = activo ? p : 0;
  el.classList.toggle('activo', activo);

  /* Calcula el total de add-ons para este plan */
  const total = Object.values(addonSeleccionados[pid]).reduce((a, b) => a + b, 0);
  const extra = document.getElementById('addon-extra-' + pid);
  if (extra) {
    extra.style.display = total > 0 ? 'block' : 'none';
    extra.textContent   = '+ ' + formatearPrecio(total, getMoneda());
  }
}

/* Expone toggleAddon en window para los onclick del HTML */
window.toggleAddon = toggleAddon;
