/**
 * quiz.js — Quiz de recomendación de plan
 *
 * 3 preguntas → recomendación personalizada del plan ideal.
 * El usuario elige una opción por pregunta y avanza automáticamente.
 */

import { PRECIOS } from './config.js';
import { formatearPrecio, iconCheck, lucideIcon } from './utils.js';
import { getMoneda } from './currency.js';

/* Respuestas del usuario (una por pregunta) */
let respuestas = ['', '', ''];
let pasoActual = 0;

/** Renderiza el paso actual del quiz */
export function renderQuiz(contenido) {
  /* Resetear estado */
  respuestas = ['', '', ''];
  pasoActual = 0;
  mostrarPaso(0, contenido);

  /* Ocultar resultado si estaba visible */
  const resultado = document.getElementById('quizResultado');
  if (resultado) resultado.classList.remove('activo');
}

/** Muestra un paso específico del quiz */
function mostrarPaso(paso, contenido) {
  /* Ocultar todos los pasos, mostrar solo el actual */
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('quizPaso' + i);
    if (el) el.classList.toggle('activo', i === paso && paso < 3);
  });

  const resultado = document.getElementById('quizResultado');
  if (resultado) resultado.classList.toggle('activo', paso >= 3);

  if (paso < 3) {
    /* Renderiza las opciones del paso actual */
    const contenedorOpciones = document.getElementById('quizOpciones' + paso);
    if (!contenedorOpciones) return;

    const opciones = contenido.quizOpciones[paso];
    contenedorOpciones.innerHTML = opciones.map(op => `
      <div class="quiz__opcion ${respuestas[paso] === op.valor ? 'seleccionada' : ''}"
           data-paso="${paso}" data-valor="${op.valor}"
           onclick="window.elegirOpcionQuiz(${paso}, '${op.valor}', this)">
        <div class="quiz__opcion-icono">
          ${lucideIcon(op.icono, 16)}
        </div>
        <div>
          <div class="quiz__opcion-titulo">${op.titulo}</div>
          <div class="quiz__opcion-sub">${op.sub}</div>
        </div>
      </div>`
    ).join('');

    if (window.lucide) window.lucide.createIcons();
  } else {
    mostrarResultado(contenido);
  }
}

/** El usuario selecciona una opción */
export function elegirOpcion(paso, valor, el, contenido) {
  respuestas[paso] = valor;

  /* Marcar la opción seleccionada */
  el.closest('.quiz__opciones, .quiz__opciones--3col')
    ?.querySelectorAll('.quiz__opcion')
    .forEach(o => o.classList.remove('seleccionada'));
  el.classList.add('seleccionada');

  /* Avanzar al siguiente paso automáticamente */
  setTimeout(() => {
    pasoActual = paso < 2 ? paso + 1 : 3;
    mostrarPaso(pasoActual, contenido);
  }, 320);
}

/** Muestra el resultado del quiz */
function mostrarResultado(contenido) {
  const planId = contenido.quizMapa[respuestas[0]] || 'BRV-01';
  const plan   = contenido.planes.find(p => p.id === planId);
  if (!plan) return;

  const moneda   = getMoneda();
  const features = plan.features
    .map(f => `<li class="quiz__res-feature">${iconCheck()} ${f}</li>`)
    .join('');

  const resultado = document.getElementById('quizResultado');
  if (!resultado) return;

  resultado.innerHTML = `
    <div style="flex:1;min-width:260px">
      <div class="quiz__res-etiqueta">${contenido.quizResultadoLabel}</div>
      <div class="quiz__res-plan">${planId}</div>
      <div class="quiz__res-nombre">${plan.nombre}</div>
      <a href="#contacto" class="btn btn--primario btn--rojo" style="display:inline-flex;gap:8px">
        ${contenido.prEmpezar} ${planId} ${lucideIcon('arrow-right', 13)}
      </a><br>
      <button class="quiz__repetir" onclick="window.repetirQuiz()">
        ${lucideIcon('rotate-ccw', 12)} ${contenido.quizRepetir}
      </button>
    </div>
    <div class="quiz__res-tarjeta">
      <div class="quiz__res-precio">${formatearPrecio(PRECIOS[planId], moneda)}</div>
      <div class="quiz__res-entrega">${contenido.prEntrega}: ${plan.entrega}</div>
      <ul class="quiz__res-features">${features}</ul>
    </div>`;

  if (window.lucide) window.lucide.createIcons();
}

/** Reinicia el quiz al principio */
export function repetirQuiz(contenido) {
  renderQuiz(contenido);
}

/* Expone funciones en window para los onclick del HTML */
window.elegirOpcionQuiz = (paso, valor, el) => {
  /* El contenido se inyecta desde main.js via un closure */
  window._quizContenido && elegirOpcion(paso, valor, el, window._quizContenido);
};
window.repetirQuiz = () => {
  window._quizContenido && repetirQuiz(window._quizContenido);
};
