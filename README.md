# Arcana

Aplicación web de tarot moderna, responsive y sin frameworks. La etapa actual incorpora tiradas configurables, estilos interpretativos y los datos completos de las 78 cartas del tarot.

## Ejecutar localmente

Los módulos ES necesitan un servidor local. Desde la carpeta del proyecto puedes usar:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`. También puede publicarse directamente con GitHub Pages desde la raíz del repositorio.

## Estructura

- `index.html`: portada y catálogo inicial.
- `lectura.html`: preparación provisional de cualquier lectura.
- `aprender.html`: curso, prácticas, modo estudio y explorador de las 78 cartas.
- `historial.html`: historial local con búsqueda, filtros y detalle.
- `css/`: variables, reset, componentes y estilos por página.
- `js/`: configuración, datos, componentes y lógica por página.
- `js/data/spreads.js`: fuente única de las 24 tiradas, sus posiciones y reglas.
- `js/data/fields.js`: campos dinámicos, métodos de selección y formatos de consulta.
- `js/data/decks.js`: siete estilos de baraja y sus tonos interpretativos.
- `js/data/cards.js`: entrada pública del mazo completo y datos de los 22 arcanos mayores.
- `js/data/minor-arcana.js`: 56 arcanos menores, generados desde identidades de palo y arquetipos de rango.
- `js/data/cards-validator.js`: validación silenciosa de conteos, unicidad y campos obligatorios.
- `js/components/dynamic-form.js`: generador y validación de formularios según cada tirada.
- `js/services/reading-session.js`: sesión central persistida en `sessionStorage`.
- `js/services/tarot-engine.js`: barajado Fisher–Yates, orientaciones y selección sin repeticiones.
- `js/services/interpretation-engine.js`: interpretación local, análisis de patrones, tonos por baraja y respuesta sí/no.
- `js/data/reading-strategies.js`: estrategias y layouts especializados para las 24 tiradas.
- `js/data/oracle-cards.js`: 24 cartas de oráculo originales para la lectura combinada.
- `js/services/storage-service.js`: lecturas guardadas, favoritos, preferencias y Carta del Día versionados.
- `js/services/share-service.js`: compartir, copiar y exportar con controles de privacidad.
- `js/pages/history.js`: presentación y acciones del historial local.
- `js/data/lessons.js`: currículo responsable de 23 lecciones.
- `js/pages/learn.js`: navegación educativa, ejercicios y progreso local.

El nombre provisional vive en `js/config.js`. El catálogo permite buscar, filtrar y revisar el detalle de cada tirada antes de acceder a su preparación provisional.

La experiencia incluye preparación, barajado, selección, revelación e interpretación local responsable. Todavía no incluye imágenes definitivas ni servicios externos de IA.

## Calidad, privacidad y PWA

- `js/services/sensitive-topic-service.js`: detector local, no diagnóstico, para mostrar orientación responsable ante temas sensibles.
- `privacidad.html`: explica el almacenamiento local, el borrado de datos y las precauciones al compartir.
- `manifest.webmanifest` y `service-worker.js`: instalación como PWA y caché esencial con actualización en segundo plano.
- `offline.html`: respuesta sencilla cuando una ruta todavía no está disponible sin conexión.
- `robots.txt` y `sitemap.xml`: configuración básica de indexación para GitHub Pages.

Para probar la PWA y el modo offline, sirve el proyecto por HTTP, espera a que el Service Worker quede activo y recarga con la red desactivada. Usa `?no-sw` para omitirlo temporalmente y `?debug` para ejecutar las validaciones completas del mazo en consola.
