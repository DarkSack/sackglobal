# 🌐 Portfolio

Portfolio personal de **Johan Jafet (Sack)**, construido con **Astro** siguiendo el enfoque _JSON-driven_ del template `minimalist-portfolio-json`. Todo el contenido del CV vive en archivos JSON y se renderiza como una landing estática, rápida y accesible.

---

## ✨ Características

- ⚡ Sitio 100% estático generado con **Astro 4**.
- 🌍 Multi-idioma: `cv.json` (ES) y `cv_english.json` (EN).
- 🎨 Diseño minimalista, responsive y optimizado para impresión (PDF).
- ⌨️ Paleta de comandos con **ninja-keys** (búsqueda rápida por teclado).
- 🔍 SEO friendly y metadatos completos.

---

## 🛠️ Stack

- **Framework:** Astro 4
- **Lenguaje:** TypeScript
- **Contenido:** JSON (`cv.json`, `cv_english.json`)
- **UX:** ninja-keys (command palette)

---

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev           # http://localhost:4321

# Build de producción
npm run build

# Previsualizar el build
npm run preview
```

---

## 📁 Estructura

```
Portfolio/
├── src/
│   ├── components/     # Componentes Astro
│   ├── layouts/
│   ├── pages/
│   └── icons/
├── public/             # Imágenes, favicon
├── cv.json             # Datos del CV en español
├── cv_english.json     # Datos del CV en inglés
├── logo.png
├── portada.png
├── astro.config.mjs
└── tsconfig.json
```

---

## ✍️ Editar el contenido

Toda la información del portfolio (experiencia, educación, proyectos, skills, contacto) se edita directamente en:

- `cv.json` — versión en español
- `cv_english.json` — versión en inglés

Solo modifica el JSON y ejecuta `npm run build`.

---

## 📄 Licencia

Ver [LICENSE.txt](./LICENSE.txt).

---

Hecho con ❤️ por **Sack**.
