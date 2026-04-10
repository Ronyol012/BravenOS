/**
 * animations.js — Animaciones del sitio
 *
 * Controla tres tipos de animaciones:
 * 1. Scroll Reveal: elementos que aparecen al hacer scroll
 * 2. Hero: animaciones de entrada al cargar la página
 * 3. Manifesto: frases y contadores que se animan
 */

/* ── Scroll Reveal ────────────────────────────────────────── */

/** IntersectionObserver que detecta cuando un elemento entra en la pantalla */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });

/** Registra todos los elementos con clases .sr, .sr-izquierda, etc. */
export function initScrollReveal() {
  document.querySelectorAll('.sr, .sr-izquierda, .sr-derecha, .sr-escala')
    .forEach(el => revealObserver.observe(el));
}

/* ── Hero ─────────────────────────────────────────────────── */

/** Dispara las animaciones del hero al cargar la página */
export function animarHero() {
  setTimeout(() => {
    /* Palabras del título aparecen deslizándose */
    document.querySelectorAll('.hero__palabra-serif, .hero__palabra-sans')
      .forEach(w => w.classList.add('visible'));

    /* Subtítulo, CTAs, línea acento, pie y tarjeta aparecen */
    ['heroSubtitulo', 'heroCtas', 'heroAccent', 'heroPie', 'heroTarjeta', 'heroStat1', 'heroStat2']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('visible');
      });

    /* Barras de progreso de la tarjeta se animan */
    document.querySelectorAll('.barra__relleno')
      .forEach(b => b.classList.add('animando'));
  }, 80);
}

/* ── Manifesto ────────────────────────────────────────────── */

let manifestoActivado  = false;
let contadoresActivados = false;

/** Observer del manifesto: activa frases y contadores al llegar */
const manifestoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animarFrasesManifesto();
    animarContadores();
    manifestoObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

export function initManifesto() {
  const el = document.getElementById('manifestoTexto');
  if (el) manifestoObserver.observe(el);
}

/** Resetea el manifesto (para cuando cambia el idioma) */
export function resetManifesto() {
  manifestoActivado   = false;
  contadoresActivados = false;
}

/** Anima las frases del manifesto una por una */
function animarFrasesManifesto() {
  if (manifestoActivado) return;
  manifestoActivado = true;
  [0, 1, 2].forEach(i => {
    setTimeout(() => {
      const el = document.getElementById('mf' + i);
      if (el) el.classList.add('visible');
    }, i * 130);
  });
}

/**
 * Anima los contadores del manifesto (0 → número final).
 * Los stats vienen del contenido del idioma actual.
 */
export function animarContadores(stats) {
  if (contadoresActivados || !stats) return;
  contadoresActivados = true;

  stats.forEach((stat, i) => {
    const el = document.getElementById('statNum' + i);
    if (!el) return;

    setTimeout(() => {
      let actual  = 0;
      const total = stat.valor;
      const paso  = Math.max(1, Math.round(total / (1600 / 16)));

      const timer = setInterval(() => {
        actual = Math.min(actual + paso, total);
        el.innerHTML = actual + '<span class="texto-acento">' + stat.sufijo + '</span>';
        if (actual >= total) {
          clearInterval(timer);
          el.closest('.stat-celda')?.classList.add('contado');
        }
      }, 16);
    }, i * 160);
  });
}

/* ── Parallax del hero ────────────────────────────────────── */

/** Mueve el orbe y el texto de fondo con el mouse */
export function initParallax() {
  window.addEventListener('mousemove', e => {
    const bg  = document.getElementById('heroBgTexto');
    const orb = document.getElementById('heroOrb');

    if (bg) {
      const x = (e.clientX / innerWidth  - 0.5) * 32;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      bg.style.transform = `translate(${x}px,${y}px)`;
    }
    if (orb) {
      const ox = (e.clientX / innerWidth  - 0.5) * 48;
      const oy = (e.clientY / innerHeight - 0.5) * 24;
      orb.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
    }
  }, { passive: true });
}
