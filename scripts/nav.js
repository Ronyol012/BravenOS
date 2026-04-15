/**
 * nav.js — Navegación del sitio
 *
 * Controla tres cosas:
 * 1. El nav se oscurece al hacer scroll
 * 2. El menú hamburguesa en móviles
 * 3. El link activo del nav según la sección visible
 */

/* Secciones y sus links correspondientes en el nav */
const SECCIONES = ['servicios', 'proyectos', 'planes', 'nosotros', 'contacto'];

/** Inicializa todos los comportamientos de la navegación */
export function initNav() {
  iniciarScrollNav();
  iniciarNavActivo();
}

/** Oscurece el nav cuando el usuario hace scroll */
function iniciarScrollNav() {
  const nav = document.getElementById('navPrincipal');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('activo', window.scrollY > 40);

    /* Actualiza la barra de progreso de lectura */
    const barra = document.getElementById('barraProgreso');
    if (barra) {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      barra.style.width = pct + '%';
    }
  }, { passive: true });
}

/** Resalta el link del nav según la sección visible */
function iniciarNavActivo() {
  /* IntersectionObserver detecta qué sección está visible */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      SECCIONES.forEach((sec, i) => {
        const link = document.getElementById('nl' + i);
        if (link) link.classList.toggle('activo', sec === id);
      });
    });
  }, { threshold: 0.25, rootMargin: '-15% 0px -65% 0px' });

  /* Observa cada sección */
  SECCIONES.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/** Abre o cierra el menú hamburguesa en móvil */
export function toggleMenuMobile() {
  const btn  = document.getElementById('btnHamburguesa');
  const menu = document.getElementById('menuMobile');
  if (!btn || !menu) return;

  const abierto = menu.classList.toggle('abierto');
  btn.classList.toggle('abierto', abierto);
  document.body.style.overflow = abierto ? 'hidden' : '';
}

/** Cierra el menú mobile (al hacer clic en un link) */
export function cerrarMenuMobile() {
  const btn  = document.getElementById('btnHamburguesa');
  const menu = document.getElementById('menuMobile');
  if (btn)  btn.classList.remove('abierto');
  if (menu) menu.classList.remove('abierto');
  document.body.style.overflow = '';
}
