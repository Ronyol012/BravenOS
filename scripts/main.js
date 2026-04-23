/**
 * main.js — Punto de entrada de Braven Studio
 *
 * Este archivo es el "director de orquesta".
 * Importa todos los módulos y los inicializa en el orden correcto.
 * Solo hay que tocar este archivo si quieres agregar una nueva sección.
 */

import { CONTENIDO }                        from './data/content.js?v=3';
import { aplicarTema, toggleTema }           from './theme.js';
import { getMoneda, setMoneda, ciclarMoneda } from './currency.js';
import { initNav, toggleMenuMobile, cerrarMenuMobile } from './nav.js';
import {
  initScrollReveal, animarHero, initManifesto,
  resetManifesto, animarContadores, initParallax
} from './animations.js';
import { renderPricing }                     from './pricing.js';
import { renderQuiz, repetirQuiz }           from './quiz.js';
import { initForm, renderPresupuesto }       from './form.js';
import { lucideIcon, setText, setHTML }      from './utils.js';

/* ── Estado global del sitio ──────────────────────────────── */
let idioma = localStorage.getItem('brv-idioma') || 'es';

/* Exponer el contenido actual para los módulos que lo necesitan */
window._contenidoActual = CONTENIDO[idioma];
window._quizContenido   = CONTENIDO[idioma];

/* ── Punto de entrada principal ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  aplicarTema();
  setMoneda(getMoneda(), renderizarPricing);
  renderizarTodo();
  inicializarEventos();
  animarHero();
  initNav();
  initScrollReveal();
  initManifesto();
  initParallax();
  initForm();
});

/* ── Renderiza todo el contenido del sitio ────────────────── */
function renderizarTodo() {
  const t = CONTENIDO[idioma];
  window._contenidoActual = t;
  window._quizContenido   = t;

  renderizarNav(t);
  renderizarHero(t);
  renderizarMarquee(t);
  renderizarManifesto(t);
  renderizarServicios(t);
  renderizarProyectos(t);
  renderizarPricingCabecera(t);
  renderizarPricing();
  renderizarProceso(t);
  renderizarValores(t);
  renderizarTestimonios(t);
  renderizarFAQ(t);
  renderizarQuiz(t);
  renderizarFormulario(t);
  renderizarCTA(t);
  renderizarFooter(t);

  /* Re-observar elementos de scroll reveal */
  initScrollReveal();

  /* Activar íconos Lucide */
  if (window.lucide) window.lucide.createIcons();
}

/* ── Funciones de renderizado por sección ─────────────────── */

function renderizarNav(t) {
  for (let i = 0; i < 5; i++) {
    setText('nl' + i, t.nav[i]);
    setText('ml' + i, t.nav[i]);
  }
  setText('navCta', t.navCta);
  setText('mlCta',  t.navCta);

  /* Botón de idioma: actualizar texto */
  const btnLang = document.getElementById('btnIdioma');
  if (btnLang) {
    btnLang.innerHTML = lucideIcon('globe', 11) + ' ' + idioma.toUpperCase();
  }
  setText('mobIdioma', idioma.toUpperCase());
}

function renderizarHero(t) {
  setText('heroPill', t.pill);

  /* Título (4 palabras animadas) */
  const palabras = ['ht0','ht1','ht2','ht3'];
  palabras.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i < 2) {
      el.textContent = t.heroTitulo[i];
    } else {
      /* La tercera y cuarta son sans-serif con punto rojo al final */
      const texto = t.heroTitulo[i];
      el.innerHTML = texto.slice(0, -1) + '<span class="texto-acento">.</span>';
    }
  });

  setText('heroSubtitulo', t.heroSub);
  setHTML('heroCta1', t.heroCta1 + ' ' + lucideIcon('arrow-right', 13));
  setText('heroCta2', t.heroCta2);
  setText('heroStatLabel1', t.statLabel1);
  setText('heroStatLabel2', t.statLabel2);
  setText('heroTrusted', t.trusted);
  setText('cardTitulo', t.cardTitulo);
  setText('cardBadge', t.cardBadge);
  t.cardMeta.forEach((m, i) => setText('cardMeta' + i, m));
  setText('flotanteTxt', t.flotante);
}

function renderizarMarquee(t) {
  const pista = document.getElementById('marqueePista');
  if (!pista) return;
  /* Duplicamos la lista para el efecto de scroll infinito */
  const items = [...t.marquee, ...t.marquee];
  pista.innerHTML = items.map(txt =>
    `<div class="marquee__item">${txt} <span class="marquee__separador">✦</span></div>`
  ).join('');
}

function renderizarManifesto(t) {
  /* Frases (se animan al hacer scroll) */
  const frases = [
    `<span class="sans">${t.mfFrases[0].split(' ')[0]}</span> ${t.mfFrases[0].split(' ').slice(1).join(' ')}`,
    t.mfFrases[1],
    `<span class="sans texto-acento">${t.mfFrases[2].split(' ')[0]}</span> ${t.mfFrases[2].split(' ').slice(1).join(' ')}`,
  ];
  frases.forEach((html, i) => setHTML('mf' + i, html));

  /* Etiquetas de los stats */
  t.mfStats.forEach((s, i) => setText('statLabel' + i, s.texto));

  /* Iniciar contadores cuando la sección sea visible */
  resetManifesto();
  const mfEl = document.getElementById('manifestoTexto');
  if (mfEl) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animarContadores(t.mfStats);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    obs.observe(mfEl);
  }
}

function renderizarServicios(t) {
  setText('servLabel',    t.servLabel);
  setText('servTitulo',   t.servTitulo);
  setText('servSubtitulo',t.servSubtitulo);
  setText('servDesc',     t.servDesc);

  const lista = document.getElementById('serviciosList');
  if (!lista) return;

  lista.innerHTML = t.servicios.map(s => `
    <div class="servicio">
      <span class="servicio__numero">${s.num}</span>
      <div class="servicio__contenido">
        <div class="servicio__nombre">${s.nombre}</div>
        <div class="servicio__descripcion">${s.desc}</div>
        <div class="servicio__chips">
          ${s.chips.map(c => `<span class="chip">${c}</span>`).join('')}
        </div>
      </div>
      <span class="servicio__flecha">${lucideIcon('arrow-up-right', 16)}</span>
    </div>`
  ).join('');
}

function renderizarProyectos(t) {
  setText('pjLabel',    t.pjLabel);
  setText('pjTitulo',   t.pjTitulo);
  setText('pjSubtitulo',t.pjSubtitulo);
  setText('pjVerTodos', t.pjVerTodos);

  const lista = document.getElementById('proyectosList');
  if (!lista) return;

  lista.innerHTML = t.proyectos.map((p, i) => `
    <div class="proyecto ${p.espejo ? 'proyecto--espejo' : ''} sr ${i ? 'delay-' + i : ''}">
      <div class="proyecto__numero-bg">${p.num}</div>
      <div class="proyecto__info">
        <div class="proyecto__etiqueta">${p.etiqueta}</div>
        <h3 class="proyecto__titulo">${p.titulo}</h3>
        <div class="proyecto__cita">${p.cita}</div>
        <p class="proyecto__descripcion">${p.desc}</p>
        <div class="proyecto__tags">
          ${p.tags.map(tag => `<span class="proyecto__tag">${tag}</span>`).join('')}
        </div>
        <button class="proyecto__enlace" onclick="abrirModalProyecto(${i})">
          ${t.pjVerCaso} ${lucideIcon('arrow-right', 13)}
        </button>
      </div>
      <div class="proyecto__visual proyecto__visual--${p.visual}">
        <div class="browser-mockup">
          <div class="browser__frame">
            <div class="browser__barra">
              <div class="browser__punto browser__punto--rojo"></div>
              <div class="browser__punto browser__punto--amarillo"></div>
              <div class="browser__punto browser__punto--verde"></div>
              <div class="browser__url"></div>
            </div>
            <div class="browser__contenido">
              ${p.detalle?.portada
                ? `<img src="${p.detalle.portada}" alt="${p.titulo}" class="browser__portada">`
                : `<div class="browser__linea browser__linea--navy"></div>
              <div class="browser__linea browser__linea--roja"></div>
              <div class="browser__bloques">
                <div class="browser__bloque"></div>
                <div class="browser__bloque"></div>
              </div>
              <div class="browser__linea browser__linea--azul"></div>
              <div class="browser__linea browser__linea--gris"></div>`
              }
            </div>
          </div>
        </div>
      </div>
    </div>`
  ).join('');
}

function renderizarPricingCabecera(t) {
  setText('prLabel',    t.prLabel);
  setText('prTitulo',   t.prTitulo);
  setText('prSubtitulo',t.prSubtitulo);
  setText('prDesc',     t.prDesc);
  setText('prMas',      t.prMas);
  setText('prCotizar',  t.prCotizar);
}

function renderizarPricing() {
  const t = CONTENIDO[idioma];
  renderPricing(t);
}

function renderizarProceso(t) {
  setText('procLabel',    t.procLabel);
  setText('procTitulo',   t.procTitulo);
  setText('procSubtitulo',t.procSubtitulo);

  const grid = document.getElementById('procesoGrid');
  if (!grid) return;

  grid.innerHTML = t.pasos.map(p => `
    <div class="paso">
      <div class="paso__numero-bg">${p.num}</div>
      <div class="paso__icono">${lucideIcon(p.icono, 18)}</div>
      <div class="paso__titulo">${p.titulo}</div>
      <div class="paso__descripcion">${p.desc}</div>
    </div>`
  ).join('');
}

function renderizarValores(t) {
  setText('valLabel',    t.valLabel);
  setText('valTitulo',   t.valTitulo);
  setText('valSubtitulo',t.valSubtitulo);

  const grid = document.getElementById('valoresGrid');
  if (!grid) return;

  grid.innerHTML = t.valores.map(v => `
    <div class="valor">
      <div class="valor__icono">${lucideIcon(v.icono, 22)}</div>
      <div class="valor__numero">${v.num}</div>
      <div class="valor__nombre">${v.nombre}</div>
      <div class="valor__descripcion">${v.desc}</div>
    </div>`
  ).join('');
}

function renderizarTestimonios(t) {
  setText('testLabel',    t.testLabel);
  setText('testTitulo',   t.testTitulo);
  setText('testSubtitulo',t.testSubtitulo);
  setHTML('testFrase',    t.testFrase);

  const cards = document.getElementById('testimonioCards');
  if (!cards) return;

  cards.innerHTML = t.testimonios.map(tm => `
    <div class="testimonio">
      <div class="testimonio__estrellas">★★★★★</div>
      <p class="testimonio__texto">${tm.texto}</p>
      <div class="testimonio__autor">
        <div class="testimonio__avatar avatar--${tm.avatar}">${tm.iniciales}</div>
        <div>
          <div class="testimonio__nombre">${tm.nombre}</div>
          <div class="testimonio__cargo">${tm.cargo}</div>
        </div>
      </div>
    </div>`
  ).join('');
}

function renderizarFAQ(t) {
  setText('faqLabel',    t.faqLabel);
  setText('faqTitulo',   t.faqTitulo);
  setText('faqSubtitulo',t.faqSubtitulo);

  const lista = document.getElementById('faqLista');
  if (!lista) return;

  lista.innerHTML = t.faqs.map((f, i) => `
    <div class="faq__item" onclick="toggleFAQ(${i})">
      <div class="faq__pregunta">
        <span>${f.p}</span>
        <div class="faq__icono" id="faqIcono${i}">
          ${lucideIcon('plus', 14)}
        </div>
      </div>
      <div class="faq__respuesta" id="faqResp${i}">${f.r}</div>
    </div>`
  ).join('');

  window._faqAbierto = null;
}

function renderizarQuiz(t) {
  setText('quizLabel',    t.quizLabel);
  setText('quizTitulo',   t.quizTitulo);
  setText('quizSubtitulo',t.quizSubtitulo);
  setText('quizDesc',     t.quizDesc);
  t.quizPreguntas.forEach((p, i) => setText('quizPregunta' + i, p));
  renderQuiz(t);
}

function renderizarFormulario(t) {
  setText('cfLabel',        t.cfLabel);
  setHTML('cfTitulo',       t.cfTitulo.replace('\n', '<br>'));
  setText('cfDesc',         t.cfDesc);
  setText('cfMeta3',        t.cfMeta3);
  setText('cfLblNombre',    t.cfLblNombre);
  setText('cfLblEmail',     t.cfLblEmail);
  setText('cfLblTipo',      t.cfLblTipo);
  setText('cfLblPresupuesto',t.cfLblPresupuesto);
  setText('cfLblMensaje',   t.cfLblMensaje);
  setText('cfErrNombre',    t.cfErrNombre);
  setText('cfErrEmail',     t.cfErrEmail);
  setText('cfErrTipo',      t.cfErrTipo);
  setText('cfTipoPlaceholder', t.cfTipoPlaceholder);

  /* Opciones del select de tipo de proyecto */
  const select = document.getElementById('cfTipo');
  if (select) {
    const opts = select.querySelectorAll('option:not(:first-child)');
    opts.forEach((opt, i) => { if (t.cfTipos[i]) opt.textContent = t.cfTipos[i]; });
  }

  setText('cfEnviarTxt',    t.cfEnviar);
  setText('cfExitoTitulo',  t.cfExitoTitulo);
  setText('cfExitoTexto',   t.cfExitoTexto);
  setText('cfExitoLink',    t.cfExitoLink);

  renderPresupuesto(t.cfPresupuestos);
}

function renderizarCTA(t) {
  setText('ctaLabel',    t.ctaLabel);
  setText('ctaTitulo',   t.ctaTitulo);
  setText('ctaSubtitulo',t.ctaSubtitulo);
  setText('ctaDesc',     t.ctaDesc);
  setHTML('ctaBtn1',     t.ctaBtn1 + ' ' + lucideIcon('arrow-right', 14));
  setText('ctaBtn2',     t.ctaBtn2);
  setText('ctaMeta3',    t.ctaMeta3);
}

function renderizarFooter(t) {
  setText('footDesc', t.footDesc);
  setText('footS',    t.footS);
  setText('footSt',   t.footSt);
  setText('footC',    t.footC);
  setText('footCopy', t.footCopy);

  // Anclas para cada link de Servicios
  const anclaServ = ['#servicios', '#servicios', '#planes', '#servicios'];
  const footServ = document.getElementById('footServList');
  if (footServ) footServ.innerHTML = t.footServicios.map((l, i) =>
    `<li><a href="${anclaServ[i] || '#'}">${l}</a></li>`
  ).join('');

  // Anclas para cada link de Estudio
  const anclaEst = ['#nosotros', '#proyectos', '#proceso', '#contacto'];
  const footEst = document.getElementById('footEstList');
  if (footEst) {
    footEst.innerHTML = t.footEstudio.map((l, i) => {
      const esUltimo = i === t.footEstudio.length - 1;
      const estilo   = esUltimo ? ' style="color:var(--color-red);font-weight:700"' : '';
      return `<li><a href="${anclaEst[i] || '#'}"${estilo}>${l}</a></li>`;
    }).join('');
  }

  const footLegal = document.getElementById('footLegalList');
  if (footLegal) footLegal.innerHTML = t.footLegal.map(l => `<li><a href="#">${l}</a></li>`).join('');
}

/* ── Inicializar todos los event listeners ────────────────── */
function inicializarEventos() {
  /* Tema */
  document.getElementById('btnTema')?.addEventListener('click', toggleTema);
  document.getElementById('btnTemaMob')?.addEventListener('click', toggleTema);

  /* Idioma */
  document.getElementById('btnIdioma')?.addEventListener('click', cambiarIdioma);
  document.getElementById('btnIdiomaMob')?.addEventListener('click', cambiarIdioma);

  /* Moneda */
  document.getElementById('btnMoneda')?.addEventListener('click', () => ciclarMoneda(renderizarPricing));
  document.getElementById('btnMonedaMob')?.addEventListener('click', () => ciclarMoneda(renderizarPricing));

  /* Selector de moneda en pricing */
  ['DOP', 'USD', 'EUR'].forEach(m => {
    document.getElementById('moneda-' + m)?.addEventListener('click', () => setMoneda(m, renderizarPricing));
  });

  /* Menú hamburguesa */
  document.getElementById('btnHamburguesa')?.addEventListener('click', toggleMenuMobile);
  document.querySelectorAll('.menu-mobile a').forEach(a => {
    a.addEventListener('click', cerrarMenuMobile);
  });
}

/* ── Cambiar idioma ────────────────────────────────────────── */
function cambiarIdioma() {
  idioma = idioma === 'es' ? 'en' : 'es';
  localStorage.setItem('brv-idioma', idioma);
  document.documentElement.lang = idioma;
  renderizarTodo();
}

/* ── FAQ accordion ────────────────────────────────────────── */
let faqAbierto = null;

window.toggleFAQ = function(i) {
  const item  = document.querySelectorAll('.faq__item')[i];
  const icono = document.getElementById('faqIcono' + i);
  if (!item || !icono) return;

  /* Si ya estaba abierto, cerrarlo */
  if (faqAbierto === i) {
    item.classList.remove('abierto');
    icono.innerHTML = lucideIcon('plus', 14);
    if (window.lucide) window.lucide.createIcons({ nodes: [icono] });
    faqAbierto = null;
    return;
  }

  /* Cerrar el anterior */
  if (faqAbierto !== null) {
    const prevItem  = document.querySelectorAll('.faq__item')[faqAbierto];
    const prevIcono = document.getElementById('faqIcono' + faqAbierto);
    if (prevItem)  prevItem.classList.remove('abierto');
    if (prevIcono) {
      prevIcono.innerHTML = lucideIcon('plus', 14);
      if (window.lucide) window.lucide.createIcons({ nodes: [prevIcono] });
    }
  }

  /* Abrir el nuevo */
  item.classList.add('abierto');
  icono.innerHTML = lucideIcon('minus', 14);
  if (window.lucide) window.lucide.createIcons({ nodes: [icono] });
  faqAbierto = i;
};

/* ── Modal de proyecto ────────────────────────────────────── */
window.abrirModalProyecto = function(i) {
  const t = CONTENIDO[idioma];
  const p = t.proyectos[i];
  if (!p || !p.detalle) return;
  const d = p.detalle;

  const modal = document.getElementById('proyectoModal');
  if (!modal) return;

  /* Galería de 3 imágenes */
  const galeria = document.getElementById('pmodalGaleria');
  const variants = ['', 'b', 'b'];
  const imgSrcs  = (d.imgs || ['', '', '']).filter(s => s);   // solo las que tienen src

  galeria.innerHTML = (d.imgs || ['', '', '']).map((src, idx) => {
    if (src) {
      return `<div class="pmodal__img"><img src="${src}" alt="${p.titulo} — imagen ${idx + 1}" loading="lazy" data-lb-idx="${imgSrcs.indexOf(src)}"></div>`;
    }
    return `<div class="pmodal__img pmodal__img--placeholder pv--${p.visual}${variants[idx]}">${idx === 0 ? p.num : ''}</div>`;
  }).join('');

  // Bind lightbox al click de cada imagen real
  galeria.querySelectorAll('img[data-lb-idx]').forEach(img => {
    img.addEventListener('click', () => {
      abrirLightbox(imgSrcs, parseInt(img.dataset.lbIdx, 10));
    });
  });

  /* Textos principales */
  document.getElementById('pmodalEtiqueta').textContent = p.etiqueta;
  document.getElementById('pmodalTitulo').textContent   = p.titulo;
  document.getElementById('pmodalCita').textContent     = p.cita;

  /* Meta grid */
  document.getElementById('pmodalMeta').innerHTML = `
    <div class="pmodal__meta-item">
      <div class="pmodal__meta-label">${t.pjModalRol}</div>
      <div class="pmodal__meta-valor">${d.rol}</div>
    </div>
    <div class="pmodal__meta-item">
      <div class="pmodal__meta-label">${t.pjModalCliente}</div>
      <div class="pmodal__meta-valor">${d.cliente}</div>
    </div>
    <div class="pmodal__meta-item">
      <div class="pmodal__meta-label">${t.pjModalAño}</div>
      <div class="pmodal__meta-valor">${d.año}</div>
    </div>
    <div class="pmodal__meta-item">
      <div class="pmodal__meta-label">${t.pjModalDur}</div>
      <div class="pmodal__meta-valor">${d.duracion}</div>
    </div>`;

  /* Resumen */
  document.getElementById('pmodalResumen').textContent = d.resumen;

  /* Retos */
  document.getElementById('pmodalRetosLbl').textContent    = t.pjModalRetos;
  document.getElementById('pmodalRetos').innerHTML         = d.retos.map(r => `<li>${r}</li>`).join('');

  /* Resultados */
  document.getElementById('pmodalResultadoLbl').textContent = t.pjModalResultado;
  document.getElementById('pmodalResultado').innerHTML      = d.resultado.map(r => `<li>${r}</li>`).join('');

  /* Stack */
  document.getElementById('pmodalStack').innerHTML = d.stack.map(s => `<span class="pmodal__stack-chip">${s}</span>`).join('');

  /* CTA */
  const cta = document.getElementById('pmodalCta');
  cta.textContent = t.pjModalCta;
  cta.onclick = () => { cerrarModalProyecto(); document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }); };

  /* Abrir */
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('abierto');
  document.body.style.overflow = 'hidden';
};

window.cerrarModalProyecto = function() {
  const modal = document.getElementById('proyectoModal');
  if (!modal) return;
  modal.classList.remove('abierto');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

/* Cerrar con overlay o tecla Escape */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pmodalOverlay')?.addEventListener('click', cerrarModalProyecto);
  document.getElementById('pmodalCerrar')?.addEventListener('click', cerrarModalProyecto);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('lightbox')?.classList.contains('activo')) {
        cerrarLightbox();
      } else {
        cerrarModalProyecto();
      }
    }
    if (document.getElementById('lightbox')?.classList.contains('activo')) {
      if (e.key === 'ArrowRight') { _lbZoomReset(); lightboxNavegar(1);  }
      if (e.key === 'ArrowLeft')  { _lbZoomReset(); lightboxNavegar(-1); }
      if (e.key === '+' || e.key === '=') _lbZoomBy(0.25);
      if (e.key === '-')                  _lbZoomBy(-0.25);
      if (e.key === '0')                  _lbZoomReset();
    }
  });

  document.getElementById('lightboxCerrar')?.addEventListener('click', cerrarLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => { _lbZoomReset(); lightboxNavegar(-1); });
  document.getElementById('lightboxNext')?.addEventListener('click', () => { _lbZoomReset(); lightboxNavegar(1); });

  _lbInitInteraction();
});

/* ══════════════════════════════════════════════════════════════
   LIGHTBOX — zoom + pan
══════════════════════════════════════════════════════════════ */
let _lbSrcs   = [];
let _lbIdx    = 0;
let _lbScale  = 1;
let _lbX      = 0;   // desplazamiento pan X
let _lbY      = 0;   // desplazamiento pan Y
let _lbDrag   = false;
let _lbDragX  = 0;
let _lbDragY  = 0;
let _lbBadgeTimer = null;

const LB_MIN = 1;
const LB_MAX = 6;
const LB_STEP = 0.3;

function abrirLightbox(srcs, idx) {
  _lbSrcs = srcs;
  _lbIdx  = idx;
  _lbZoomReset(false);
  _lbRender();
  document.getElementById('lightbox').classList.add('activo');
  document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
  document.getElementById('lightbox')?.classList.remove('activo');
  _lbZoomReset(false);
  if (!document.getElementById('proyectoModal')?.classList.contains('abierto')) {
    document.body.style.overflow = '';
  }
}

function lightboxNavegar(dir) {
  if (!_lbSrcs.length) return;
  _lbIdx = (_lbIdx + dir + _lbSrcs.length) % _lbSrcs.length;
  _lbRender();
}

function _lbRender() {
  const img     = document.getElementById('lightboxImg');
  const counter = document.getElementById('lightboxCounter');
  const prev    = document.getElementById('lightboxPrev');
  const next    = document.getElementById('lightboxNext');

  img.src = _lbSrcs[_lbIdx];
  img.alt = `Imagen ${_lbIdx + 1} de ${_lbSrcs.length}`;
  counter.textContent = `${_lbIdx + 1} / ${_lbSrcs.length}`;

  const showNav = _lbSrcs.length > 1;
  prev.style.display = showNav ? '' : 'none';
  next.style.display = showNav ? '' : 'none';

  _lbApplyTransform();
}

function _lbApplyTransform() {
  const img    = document.getElementById('lightboxImg');
  const canvas = document.getElementById('lightboxCanvas');
  if (!img) return;
  // Transición suave solo cuando no está arrastrando
  img.style.transition = _lbDrag ? 'none' : 'transform .18s ease';
  img.style.transform = `scale(${_lbScale}) translate(${_lbX / _lbScale}px, ${_lbY / _lbScale}px)`;
  canvas?.classList.toggle('zoomed', _lbScale > 1);
}

function _lbZoomBy(delta, cx, cy) {
  const img = document.getElementById('lightboxImg');
  if (!img) return;

  const prev  = _lbScale;
  _lbScale    = Math.min(LB_MAX, Math.max(LB_MIN, _lbScale + delta));

  // Si volvemos a 1x, centramos
  if (_lbScale === 1) { _lbX = 0; _lbY = 0; }

  _lbApplyTransform();
  _lbShowBadge();
}

function _lbZoomReset(animate = true) {
  _lbScale = 1; _lbX = 0; _lbY = 0;
  _lbApplyTransform();
  if (animate) _lbShowBadge();
}

function _lbShowBadge() {
  const badge = document.getElementById('lightboxZoomBadge');
  if (!badge) return;
  badge.textContent = `${Math.round(_lbScale * 100)}%`;
  badge.classList.add('visible');
  clearTimeout(_lbBadgeTimer);
  _lbBadgeTimer = setTimeout(() => badge.classList.remove('visible'), 1200);
}

function _lbInitInteraction() {
  const canvas = document.getElementById('lightboxCanvas');
  const lb     = document.getElementById('lightbox');
  if (!canvas) return;

  /* ── Rueda del ratón → zoom centrado en cursor ── */
  canvas.addEventListener('wheel', e => {
    if (!lb.classList.contains('activo')) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? LB_STEP : -LB_STEP;
    _lbZoomBy(delta);
  }, { passive: false });

  /* ── Doble click → reset zoom ── */
  canvas.addEventListener('dblclick', e => {
    e.stopPropagation();
    if (_lbScale > 1) { _lbZoomReset(); }
    else { _lbZoomBy(1.5); }
  });

  /* ── Drag para pan (solo cuando zoom > 1) ── */
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (_lbScale <= 1) return;
    _lbDrag  = true;
    _lbDragX = e.clientX - _lbX;
    _lbDragY = e.clientY - _lbY;
    canvas.classList.add('dragging');
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!_lbDrag) return;
    _lbX = e.clientX - _lbDragX;
    _lbY = e.clientY - _lbDragY;
    _lbApplyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!_lbDrag) return;
    _lbDrag = false;
    document.getElementById('lightboxCanvas')?.classList.remove('dragging');
  });

  /* ── Touch: pinch zoom + pan ── */
  let _touches = [];
  let _pinchDist0 = 0;
  let _scale0     = 1;
  let _panX0 = 0, _panY0 = 0, _touchX0 = 0, _touchY0 = 0;

  canvas.addEventListener('touchstart', e => {
    _touches = Array.from(e.touches);
    if (_touches.length === 2) {
      _pinchDist0 = Math.hypot(
        _touches[0].clientX - _touches[1].clientX,
        _touches[0].clientY - _touches[1].clientY
      );
      _scale0 = _lbScale;
    } else if (_touches.length === 1 && _lbScale > 1) {
      _panX0   = _lbX;
      _panY0   = _lbY;
      _touchX0 = _touches[0].clientX;
      _touchY0 = _touches[0].clientY;
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    _touches = Array.from(e.touches);
    if (_touches.length === 2) {
      const dist = Math.hypot(
        _touches[0].clientX - _touches[1].clientX,
        _touches[0].clientY - _touches[1].clientY
      );
      _lbScale = Math.min(LB_MAX, Math.max(LB_MIN, _scale0 * (dist / _pinchDist0)));
      if (_lbScale === 1) { _lbX = 0; _lbY = 0; }
      _lbApplyTransform();
      _lbShowBadge();
    } else if (_touches.length === 1 && _lbScale > 1) {
      _lbX = _panX0 + (_touches[0].clientX - _touchX0);
      _lbY = _panY0 + (_touches[0].clientY - _touchY0);
      _lbApplyTransform();
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    _touches = Array.from(e.touches);
    if (_lbScale < 1.05) _lbZoomReset();
  });

  /* ── Click en fondo negro (no en imagen) → cerrar ── */
  lb.addEventListener('click', e => {
    if (e.target === lb) cerrarLightbox();
  });
}
