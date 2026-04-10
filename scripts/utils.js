/**
 * utils.js — Funciones de ayuda (helpers) de Braven Studio
 *
 * Funciones pequeñas que se usan en muchos lugares del sitio.
 * Al tenerlas aquí, evitamos repetir el mismo código.
 */

import { SIMBOLOS, TASAS } from './config.js';

/**
 * Obtiene un elemento del HTML por su id.
 * Ejemplo: G('miBoton') es lo mismo que document.getElementById('miBoton')
 */
export function G(id) {
  return document.getElementById(id);
}

/**
 * Cambia el texto de un elemento.
 * Ejemplo: setText('titulo', 'Hola mundo') cambia el texto del elemento #titulo
 */
export function setText(id, valor) {
  const el = G(id);
  if (el) el.textContent = valor;
}

/**
 * Cambia el HTML interno de un elemento.
 * Ejemplo: setHTML('contenedor', '<strong>Hola</strong>')
 */
export function setHTML(id, valor) {
  const el = G(id);
  if (el) el.innerHTML = valor;
}

/**
 * Crea un ícono de Lucide listo para insertar en el HTML.
 * Ejemplo: lucideIcon('arrow-right', 14) → '<i data-lucide="arrow-right" style="...">'
 */
export function lucideIcon(nombre, tamaño) {
  return `<i data-lucide="${nombre}" style="width:${tamaño}px;height:${tamaño}px"></i>`;
}

/**
 * Crea el ícono de "check" para las listas de features.
 */
export function iconCheck() {
  return lucideIcon('check', 11);
}

/**
 * Formatea un precio en la moneda activa.
 * Ejemplo: formatearPrecio(9000, 'USD') → 'US$145'
 */
export function formatearPrecio(montoDOP, moneda) {
  const simbolo = SIMBOLOS[moneda] || 'RD$';
  const tasa    = TASAS[moneda]   || 1;
  return simbolo + Math.round(montoDOP / tasa).toLocaleString();
}

/**
 * Crea el HTML del mockup de navegador que aparece en los proyectos.
 */
export function browserMockup() {
  return `
    <div class="browser__frame">
      <div class="browser__barra">
        <div class="browser__punto browser__punto--rojo"></div>
        <div class="browser__punto browser__punto--amarillo"></div>
        <div class="browser__punto browser__punto--verde"></div>
        <div class="browser__url"></div>
      </div>
      <div class="browser__contenido">
        <div class="browser__linea browser__linea--navy"></div>
        <div class="browser__linea browser__linea--roja"></div>
        <div class="browser__bloques">
          <div class="browser__bloque"></div>
          <div class="browser__bloque"></div>
        </div>
        <div class="browser__linea browser__linea--azul"></div>
        <div class="browser__linea browser__linea--gris"></div>
      </div>
    </div>`;
}
