# Braven Studio — Sitio Web

Estudio digital · Santo Domingo, RD · bravenweb.com

---

## Estructura del proyecto

```
braven-studio/
├── index.html              ← Página principal (HTML semántico)
├── netlify.toml            ← Configuración de Netlify
├── .gitignore              ← Archivos ignorados por Git
│
├── assets/
│   └── icons/logo.svg     ← Logo en SVG
│
├── styles/
│   ├── variables.css      ← Colores, tipografía, espaciado ← EDITAR AQUÍ
│   ├── base.css           ← Reset y estilos base
│   ├── animations.css     ← Animaciones y scroll reveal
│   ├── layout.css         ← Hero, nav, footer, secciones
│   ├── components.css     ← Pricing, quiz, formulario, FAQ
│   └── responsive.css     ← Mobile-first breakpoints
│
└── scripts/
    ├── data/
    │   └── content.js     ← Todo el texto ES/EN ← EDITAR AQUÍ
    ├── config.js          ← Precios, tasas, WA ← EDITAR AQUÍ
    ├── utils.js           ← Funciones de ayuda
    ├── theme.js           ← Modo oscuro/claro
    ├── currency.js        ← Cambio de moneda
    ├── nav.js             ← Navegación y hamburguesa
    ├── animations.js      ← Scroll reveal, hero, manifesto
    ├── pricing.js         ← Planes + add-ons
    ├── quiz.js            ← Quiz de recomendación
    ├── form.js            ← Formulario + Netlify Forms
    └── main.js            ← Punto de entrada (conecta todo)
```

---

## Cómo trabajar localmente (VS Code)

1. Descarga o clona el proyecto
2. Abre la carpeta en VS Code
3. Instala la extensión **Live Server** (busca "Live Server" de Ritwick Dey)
4. Clic derecho en `index.html` → **Open with Live Server**
5. El sitio abre en `http://127.0.0.1:5500`

> **¿Por qué Live Server?** El proyecto usa `type="module"` en JavaScript.
> Los módulos no funcionan si abres el archivo directamente desde el explorador
> (protocolo `file://`). Live Server crea un servidor HTTP local que los soporta.
> **No necesitas Node.js, npm, ni ningún otro programa.**

---

## Cómo editar el contenido

### Cambiar precios
Edita `scripts/config.js`:
```js
export const PRECIOS = {
  'BRV-01': 9000,   // ← cambia este número
  ...
};
```

### Cambiar textos (español/inglés)
Edita `scripts/data/content.js` — busca la sección `es:` o `en:`.

### Cambiar colores
Edita `styles/variables.css`:
```css
--color-red:   #ea6969;   /* ← color acento rojo */
--color-navy:  #12182a;   /* ← azul marino principal */
```

---

## Deploy en Netlify

### Opción A — Drag & Drop (más fácil)
1. Ve a [app.netlify.com](https://app.netlify.com)
2. Abre tu site `braven-studio-web`
3. Pestaña **Deploys**
4. Arrastra la carpeta `braven-studio/` al área de deploy

### Opción B — Git + Netlify (recomendado para actualizaciones frecuentes)

**Primera vez:**
```bash
# 1. Crea repo en GitHub (desde github.com)
# 2. En VS Code → Terminal:
git init
git add .
git commit -m "primer commit"
git remote add origin https://github.com/TU-USUARIO/braven-studio.git
git push -u origin main

# 3. En Netlify → "Add new site" → "Import from Git" → selecciona el repo
```

**Cada actualización:**
```bash
git add .
git commit -m "descripción del cambio"
git push
# Netlify hace el deploy automáticamente en ~30 segundos
```

---

## Número de WhatsApp
El número actual es `18298052619`. Para cambiarlo busca esa cadena en:
- `index.html` (2 veces: botón WA y botón CTA)
- `scripts/config.js` → `WA_NUMERO`

---

## Formulario de contacto
El formulario usa **Netlify Forms** — no necesita backend ni código extra.
Al hacer deploy, Netlify detecta el atributo `netlify` en el `<form>` y
activa la recepción de mensajes automáticamente. Los ves en:
Netlify → tu sitio → **Forms**.
