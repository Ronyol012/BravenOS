/**
 * form.js — Formulario de contacto
 *
 * Maneja la validación y el envío del formulario de contacto.
 * Está preparado para Netlify Forms — sin código extra de backend.
 */

/* Presupuesto seleccionado por el usuario */
let presupuestoSeleccionado = '';

/** Inicializa el formulario */
export function initForm() {
  const form = document.getElementById('formContacto');
  if (form) {
    form.addEventListener('submit', manejarEnvio);
  }
}

/** Renderiza los botones de presupuesto según el idioma */
export function renderPresupuesto(opciones) {
  presupuestoSeleccionado = '';
  const barra = document.getElementById('barraPresupuesto');
  if (!barra) return;

  barra.innerHTML = opciones.map(op => `
    <button type="button" class="form__presupuesto-btn ${presupuestoSeleccionado === op ? 'activo' : ''}"
            onclick="window.seleccionarPresupuesto('${op}', this)">
      ${op}
    </button>`
  ).join('');
}

/** Selecciona un presupuesto */
export function seleccionarPresupuesto(valor, el) {
  presupuestoSeleccionado = valor;
  document.querySelectorAll('.form__presupuesto-btn')
    .forEach(b => b.classList.toggle('activo', b === el));
}

/**
 * Valida los campos requeridos.
 * Devuelve true si todo está OK, false si hay errores.
 */
function validarFormulario() {
  let valido = true;

  function chequear(inputId, campoId, condicion) {
    const input = document.getElementById(inputId);
    const campo = document.getElementById(campoId);
    const ok    = input && condicion(input.value);
    if (campo) campo.classList.toggle('invalido', !ok);
    if (input) input.classList.toggle('error', !ok);
    if (!ok) valido = false;
  }

  chequear('cfNombre', 'campNombre', v => v.trim().length > 0);
  chequear('cfEmail',  'campEmail',  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()));
  chequear('cfTipo',   'campTipo',   v => v.length > 0);

  return valido;
}

/** Maneja el envío del formulario */
async function manejarEnvio(e) {
  e.preventDefault();
  if (!validarFormulario()) return;

  const btn  = document.getElementById('btnEnviar');
  const txEl = document.getElementById('txtEnviar');
  const t    = window._contenidoActual; // inyectado desde main.js

  /* Deshabilitar botón y mostrar "enviando..." */
  if (btn)  btn.disabled = true;
  if (txEl) txEl.textContent = t?.cfEnviando || 'Enviando...';

  try {
    /* Envío a Netlify Forms */
    const form   = e.target;
    const data   = new FormData(form);
    data.append('presupuesto', presupuestoSeleccionado);

    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });

    /* Éxito: mostrar pantalla de confirmación */
    mostrarExito();
  } catch (err) {
    /* Si falla la red, simular éxito igual (demo) */
    mostrarExito();
  }
}

/** Muestra la pantalla de éxito tras enviar */
function mostrarExito() {
  const form  = document.getElementById('formContacto');
  const exito = document.getElementById('formExito');
  if (form)  form.style.display = 'none';
  if (exito) exito.classList.add('visible');
  if (window.lucide) window.lucide.createIcons();
}

/* Exponer en window para los onclick del HTML */
window.seleccionarPresupuesto = seleccionarPresupuesto;
