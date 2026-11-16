# CLAUDE.md

Guía para trabajar en este repositorio. Léela completa antes de escribir código.

## Qué es

Aplicación web para **estudiar la Constitución Política de la República de Guatemala**. Cada persona puede:

- Consultar los artículos organizados por título, capítulo y sección.
- Ver y crear **diagramas de los artículos**: esquemas que muestran la estructura de la Constitución y el contenido de un artículo o de un grupo de artículos (órganos, requisitos, plazos, procedimientos, relaciones entre artículos).
- Explorar el **mapa de relaciones**: qué artículos se conectan entre sí y por qué (remisiones, desarrollo, garantías, límites y afinidad temática).
- Tomar **apuntes** ligados a un artículo o a un diagrama.

Tiene inicio de sesión por SSO y métricas de uso. Interfaz en español (Guatemala). El público son estudiantes de Derecho.

> Nombre de la app: **ConstGua**. Usa `APP_NAME` de `src/config/app.ts`; no lo escribas en duro en componentes.

## Decisiones de producto

Confirmadas por Emanuel el 16 de noviembre de 2026: la columna "Suposición actual" es la decisión vigente. Si alguna cambia, se actualiza esta tabla antes de construir encima.

| Tema                    | Suposición actual                                                                                                                                                  | Alternativas                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Origen de los diagramas | Dos tipos: el mapa de estructura, generado de los datos y de solo lectura, y diagramas propios que cada persona arma sobre uno o varios artículos                  | Solo diagramas prearmados por el equipo; diagramas generados automáticamente del texto     |
| Mapa de relaciones      | Vista de solo lectura generada de `relaciones` del catálogo: al elegir un artículo se muestran sus vecinos, con filtro por tipo de relación                        | Mapa global de todos los artículos a la vez; permitir que cada persona proponga relaciones |
| Motor de diagramas      | Nodos y conexiones con React Flow; un nodo puede representar un artículo                                                                                           | Mermaid a partir de texto, dibujo libre                                                    |
| Catálogo de artículos   | Archivo JSON versionado en el repositorio (`src/data/constitucion.json`); Firestore guarda solo datos de las personas                                              | Colección `articles` en Firestore, de solo lectura para el cliente                         |
| Texto literal           | El catálogo trae el texto de cada artículo, cotejado completo contra el PDF el 16/11/2026; la interfaz lo muestra con una nota de la fuente, sin aviso de revisión | Ocultar el texto hasta terminar el cotejo                                                  |
| Editor de apuntes       | Texto enriquecido con Tiptap, guardado como JSON                                                                                                                   | Markdown plano                                                                             |
| Alcance de los datos    | Cada persona ve solo sus diagramas y apuntes                                                                                                                       | Compartir con otras personas, diagramas públicos                                           |
| Repaso y quiz           | Fuera del alcance inicial; el prototipo anterior ya tiene repetición espaciada y quiz, y se pueden migrar después                                                  | Incluirlos desde la primera versión                                                        |

## Contenido jurídico

Esta regla pesa más que cualquier otra de la guía: **en Derecho la literalidad importa**.

- Nunca escribas, completes ni corrijas de memoria el texto, el número o el epígrafe de un artículo. Todo sale de `src/data/constitucion.json`.
- El catálogo tiene 281 artículos y 27 disposiciones transitorias (308 en total). Las transitorias 23 a 27, de la reforma de 1993, y el artículo 256 (derogado) no tienen epígrafe (`epigrafe: null`). Si un cambio altera esos conteos, detente y avisa.
- Cada artículo lleva `id` (`"1"` a `"281"`, transitorios `"T1"` a `"T27"`), `epigrafe`, `titulo`, `capitulo`, `seccion` (opcional) y `texto` (el cuerpo del artículo, sin el epígrafe). El artículo 256 está derogado y lleva `derogado: true`. La fuente del texto está en `fuenteTexto`.
- El `texto` se extrajo de un PDF y se cotejó completo contra él el 16/11/2026: coincide palabra por palabra y en la división de párrafos (un párrafo por cada `
`; cada inciso es su propio párrafo). El PDF es una edición digital de 2020, no el Diario Oficial, y no se versiona en el repositorio. Nunca "arregles" una redacción que te parezca rara; repórtala para cotejarla contra el PDF.
- Si encuentras una diferencia entre el catálogo y una fuente, no la arregles por tu cuenta: repórtala con el artículo y la fuente.
- No generes resúmenes, interpretaciones ni diagramas de contenido con texto inventado y presentado como si fuera el artículo. Lo que redacta una persona (apuntes, etiquetas de un diagrama propio) se distingue visualmente del texto de la Constitución.
- Los datos de ejemplo y las pruebas usan artículos reales del catálogo, no artículos inventados.

### Relaciones entre artículos

El catálogo trae en `relaciones` un análisis de cómo se conectan los artículos:

- `relaciones.entreArticulos[]`: `{ desde, hacia, tipo, nota, cotejo }`, con ids del catálogo.
- `cotejo` dice qué tan revisada está cada relación: `cita_textual` (el texto de un artículo cita expresamente al otro), `texto_leido` (se revisó contra el pasaje del artículo) o `pendiente` (propuesta sin cotejar).
- `relaciones.haciaBloques[]`: relaciones de un artículo con un capítulo completo (`haciaBloque` con `titulo`, `capitulo` y el rango de artículos).
- `relaciones.tipos`: `remision`, `desarrollo`, `garantia`, `limite` y `tematica`, cada uno con su definición. `tematica` no tiene dirección; los demás van de `desde` a `hacia`.

Reglas:

- Ese análisis **no es fuente oficial ni doctrina**: se elaboró con asistencia de IA y está marcado `verificado: false`. La interfaz no muestra el texto de `relaciones.advertencia` (decisión de Emanuel del 16/11/2026): en la lista y en el mapa muestra solo el aviso "Validar sugerencia", presenta como "relación sugerida" todo lo que no sea `cita_textual` y permite filtrar por `cotejo`.
- No agregues, quites ni reescribas relaciones por tu cuenta. Los cambios al análisis los decide Emanuel; tú solo los aplicas cuando te los pida, artículo por artículo.
- Una prueba valida que todo `desde` y `hacia` exista en el catálogo, que no haya pares duplicados y que cada `tipo` y cada `cotejo` estén definidos.
- Las relaciones que agregue una persona en sus propios diagramas viven en Firestore, dentro de su diagrama, y nunca se mezclan con las del catálogo.

## Stack

- React + TypeScript (modo `strict`) con Vite.
- React Router para rutas.
- Firebase: Authentication, Cloud Firestore, Analytics y Hosting. SDK modular (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/analytics`); nunca el SDK `compat`.
- `@xyflow/react` (React Flow) para el lienzo de diagramas; un algoritmo de disposición automática (por ejemplo `dagre` o `elkjs`) para el mapa de estructura.
- Tiptap para apuntes.
- Vitest + React Testing Library para pruebas; `@firebase/rules-unit-testing` con el emulador para las reglas.
- ESLint + Prettier.

Antes de instalar una dependencia, revisa su versión estable actual y su documentación; no asumas APIs de memoria. No agregues librerías de UI (MUI, Tailwind, Bootstrap): la interfaz sale del sistema de diseño propio (ver "Línea gráfica").

## Comandos

```bash
npm run dev            # servidor local de Vite
npm run emulators      # emuladores de Auth y Firestore
npm run test           # pruebas unitarias y de componentes
npm run test:rules     # pruebas de firestore.rules contra el emulador
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run build          # build de producción
```

Una tarea no está terminada si `lint`, `typecheck` y `test` no pasan. Si cambiaste `firestore.rules` o el modelo de datos, corre también `test:rules`.

## Estructura

```
src/
  app/            # arranque, rutas, proveedores (auth, tema)
  config/         # app.ts, firebase.ts (lee variables VITE_FIREBASE_*)
  data/           # constitucion.json (catálogo de artículos) y su esquema de validación
  features/
    auth/         # inicio de sesión, guardas de ruta, hook useAuth
    constitution/ # catálogo: búsqueda, navegación por título/capítulo/sección, vista de artículo
    diagrams/     # mapa de estructura, mapa de relaciones, lienzo de diagramas propios, servicio de Firestore
    notes/        # editor de apuntes por artículo o diagrama, servicio de Firestore
    metrics/      # track(), registro de actividad
  ui/             # componentes del sistema de diseño (Button, TextField, Card, Chip…)
  styles/         # tokens.css (generado del sistema de diseño), base.css
firestore.rules
firestore.indexes.json
firebase.json
```

- El catálogo se lee solo a través de `features/constitution/catalog.ts` (`getArticle(id)`, `listByBlock(...)`, `search(...)`, `getRelated(id)`); ningún componente importa el JSON directamente.
- Los componentes de `features/` nunca importan `firebase/*` directamente: pasan por el servicio de su feature (`diagrams/service.ts`, `notes/service.ts`).
- Un componente por archivo; hooks con prefijo `use`; nombres de archivos de componentes en `PascalCase.tsx`.

## Autenticación (SSO)

- El único proveedor es **Google**, con Firebase Authentication (`GoogleAuthProvider`). Decisión confirmada: no agregues Microsoft, Apple, correo y contraseña, enlace mágico ni inicio anónimo, y no dejes otros proveedores habilitados en la consola de Firebase.
- No hay registro con correo y contraseña ni recuperación de contraseña. La pantalla de ingreso tiene un solo botón: "Ingresar con Google".
- Usa `signInWithPopup` y, si el navegador bloquea la ventana, `signInWithRedirect`.
- Toda ruta salvo `/ingresar` exige sesión. La guarda vive en `features/auth/RequireAuth.tsx`.
- Al primer ingreso crea `users/{uid}`; en cada ingreso actualiza `lastSeenAt` (ver "Métricas").
- Las reglas de Firestore exigen `request.auth.token.firebase.sign_in_provider == "google.com"` además de la sesión.
- Por ahora entra cualquier cuenta de Google. Si más adelante se restringe a un dominio, valida el dominio en las reglas de Firestore con `request.auth.token.email` y `email_verified`, no solo en el cliente.
- Nunca guardes tokens en `localStorage` por tu cuenta; deja la persistencia al SDK.

## Modelo de datos (Firestore)

```
users/{uid}
  displayName, email, photoURL, createdAt, lastSeenAt

diagrams/{diagramId}
  ownerId, title, articleIds[], nodes[], edges[], viewport, createdAt, updatedAt
  # nodo: { id, type: "article" | "concept" | "group", articleId?, label?, position }

notes/{noteId}
  ownerId, title, content (JSON de Tiptap), articleId?, diagramId?, createdAt, updatedAt

metrics_daily/{yyyy-mm-dd}/users/{uid}
  firstSeenAt        # un documento por persona por día
```

Reglas del modelo:

- Los artículos no se copian a Firestore: diagramas y apuntes guardan solo el `articleId` y la interfaz resuelve epígrafe y texto desde el catálogo. Así una corrección del catálogo llega a todo sin migrar datos.
- Un nodo de tipo `article` muestra siempre el número y el epígrafe del catálogo; la persona no puede editarlos. Los nodos `concept` y `group` llevan texto propio de la persona.
- `articleIds[]` del diagrama se mantiene sincronizado con sus nodos `article`, para poder consultar "diagramas de este artículo" con `array-contains`.
- El mapa de estructura (títulos, capítulos, secciones, artículos) y el mapa de relaciones se generan del catálogo en el cliente y no se guardan en Firestore.

- Todo documento de contenido lleva `ownerId`, `createdAt` y `updatedAt` (`serverTimestamp()`).
- Un documento de Firestore admite como máximo 1 MiB. Si un diagrama se acerca a ese tamaño, avisa a la persona y no guardes; no partas documentos sin acordarlo antes.
- Guarda con autoguardado diferido (debounce de 1 a 2 segundos), nunca en cada tecla o cada movimiento de nodo.
- Suscripciones `onSnapshot` solo en hooks, con limpieza al desmontar. Listas siempre con `limit` y orden por `updatedAt`.
- Si una consulta necesita índice compuesto, agrégalo a `firestore.indexes.json` en el mismo cambio.

## Reglas de seguridad

- Negar todo por defecto. Cada colección se abre de forma explícita.
- `diagrams` y `notes`: leer y escribir solo si `request.auth.uid == resource.data.ownerId`; al crear, `request.resource.data.ownerId == request.auth.uid`; `ownerId` no se puede cambiar.
- `users/{uid}`: solo su dueño.
- `metrics_daily/{day}/users/{uid}`: cada persona crea únicamente su propio documento; nadie lo lee desde el cliente.
- Valida tipos y tamaños en las reglas (por ejemplo, largo máximo de `title`, y que `articleId` tenga el formato de un id del catálogo).
- Todo cambio de reglas va con su prueba en `test:rules`: un caso que debe pasar y uno que debe fallar.

## Métricas de uso

Objetivo: saber cuántas personas usan la app (por día, semana y mes) y qué funciones usan.

- **Conteo confiable, en Firestore:** al iniciar sesión, y como máximo una vez por día por persona, crea `metrics_daily/{yyyy-mm-dd}/users/{uid}` y actualiza `users/{uid}.lastSeenAt`. Personas activas por día = cantidad de documentos de ese día (consulta de agregación `count()` desde consola o un script de administración, no desde el cliente).
- **Comportamiento, en Firebase Analytics:** llama siempre a `track(evento, params)` de `features/metrics/track.ts`; nunca a `logEvent` directo. Analytics puede estar bloqueado por el navegador, por eso no es la fuente del conteo de personas.
- Eventos iniciales: `login`, `article_open`, `article_search`, `constitution_parts_open`, `structure_map_open`, `relation_map_open`, `diagram_create`, `diagram_open`, `diagram_export`, `note_create`, `note_open`. Los eventos de artículo llevan `article_id` para saber qué partes de la Constitución se estudian más. Agrega eventos nuevos a la lista de `track.ts`, con nombres en `snake_case`.
- **Privacidad:** ningún evento lleva contenido de diagramas o apuntes, títulos, términos de búsqueda, correos ni nombres. Solo ids y conteos.
- La fecha del día se calcula en la zona `America/Guatemala`.

## Línea gráfica: Material Base

La interfaz sigue el sistema de diseño **Material Base** (Material Design 3, esquema azul). Los valores están en `src/styles/tokens.css`; ese archivo se genera del sistema de diseño y **no se edita a mano**.

Reglas que no se negocian:

- **Tokens siempre.** Ningún color, radio, sombra o espaciado en hexadecimal o píxeles sueltos dentro de componentes: usa `var(--primary)`, `var(--space-4)`, `var(--shape-md)`, etc.
- **Color por pares.** Todo relleno lleva su texto `on-…` (`primary` con `on-primary`, `secondary-container` con `on-secondary-container`). Nunca blanco o negro literal sobre un relleno.
- **Superficies.** Fondo `surface`, texto `on-surface`, texto secundario `on-surface-variant`. Separa niveles con `surface-container-*` antes de usar sombras.
- **Una sola acción `primary` por vista.** Las demás bajan a tonal, delineado o texto.
- **Error** solo para errores, y siempre con palabra o icono, nunca solo color.
- **Temas claro y oscuro** deben funcionar siempre. Sin degradados.
- **Tipografía.** Solo Roboto en pesos 400 y 500 (Roboto Mono para código). Usa la escala Material (`display-*`, `headline-*`, `title-*`, `body-*`, `label-*`); texto por defecto `body-medium`; botones, pestañas y chips `label-large`. Sin negrita 700 ni cursiva para jerarquía.
- **Espaciado y forma.** Retícula de 4 px con `space-*`. Márgenes laterales `space-4` en móvil y `space-6` en tablet y escritorio. Zona táctil mínima de 48 px. Botones `shape-full`, chips `shape-sm`, tarjetas `shape-md`, campos `shape-xs`, diálogos `shape-xl`.
- **Elevación.** Sombras solo en lo que flota (`elevation-1` en tarjeta elevada, `elevation-3` en FAB y diálogos).
- **Foco.** Anillo de 2 px en `primary`, separado 2 px del control.
- **Iconos.** Material Symbols Outlined, 24 px, peso 400, del color del texto que acompañan. Sin emoji ni caracteres Unicode como iconos.
- **Navegación.** Barra inferior en móvil con tres a cinco destinos; riel o cajón en pantallas anchas. Fondo `surface-container`, indicador activo en `secondary-container`. Barra superior en `surface` con título en `title-large`.
- **Formularios.** Campos delineados, una columna, etiqueta siempre visible, texto de apoyo en `body-small`.
- **Logotipo.** Bandera de Guatemala en franjas (celeste, blanco, celeste, sin escudo de armas) con un quetzal simplificado en la franja blanca, junto al nombre en texto (`AppLogo` de `src/ui/`) y como favicon (`public/favicon.svg`). El dibujo vive en `src/ui/brandMark.ts` y sus colores en los tokens `--flag-*` y `--quetzal-*`, iguales en ambos temas. El logotipo es decorativo: el nombre siempre va en texto al lado. Decisión de Emanuel del 16/11/2026.

Componentes base en `src/ui/`: `Button` (relleno, tonal, delineado, texto), `TextField`, `Card` (elevada, rellena, delineada), `Chip`. Antes de crear un componente nuevo, revisa si se resuelve componiendo estos. El lienzo de React Flow y el editor de Tiptap también se estilizan con los tokens: nodos, conexiones, selección y barra de herramientas no usan los colores por defecto de la librería.

Nodos del diagrama: artículo en tarjeta delineada (`surface`, borde `outline-variant`, número en `label-large` y epígrafe en `body-medium`); concepto de la persona en `secondary-container`; grupo (título, capítulo, sección) en `surface-container`; nodo seleccionado con borde de 2 px en `primary`. Conexiones en `outline`. En el mapa de relaciones cada tipo se distingue por el trazo y una etiqueta de texto, no solo por color: `remision` línea continua con flecha, `desarrollo` continua delgada con flecha, `garantia` y `limite` con flecha y etiqueta visible, `tematica` punteada sin flecha. El texto literal de un artículo se muestra en `body-large`.

### Textos de la interfaz

- Español, tuteando, frases cortas, acciones en imperativo: "Guarda los cambios".
- Mayúscula inicial solo en la primera palabra de títulos, botones y etiquetas: "Crear diagrama", "Ver artículo".
- Etiquetas de botón: verbo o verbo más objeto, de una a tres palabras.
- Sin emoji ni signos de exclamación.
- Los errores dicen qué pasó y qué hacer: "No se pudo guardar. Revisa tu conexión e intenta de nuevo."

## Accesibilidad

- Todo lo que se hace con ratón se puede hacer con teclado, incluido mover y conectar nodos.
- Contraste mínimo 4.5:1 en texto y 3:1 en bordes de controles e iconos, en ambos temas.
- Controles con nombre accesible; iconos decorativos con `aria-hidden`.
- Respeta `prefers-reduced-motion`.

## Seguridad y secretos

- La configuración web de Firebase va en variables `VITE_FIREBASE_*` de `.env.local` (no se sube al repositorio); deja un `.env.example` actualizado.
- Ninguna llave de cuenta de servicio en el repositorio ni en el cliente.
- La seguridad se garantiza en `firestore.rules`, no en el cliente: asume que cualquier validación del navegador se puede saltar.
- No registres en consola ni en métricas datos personales o contenido de las personas.
- Sanitiza cualquier HTML antes de renderizarlo; no uses `dangerouslySetInnerHTML` con contenido de usuarios.

## Forma de trabajo

- Cambios pequeños y enfocados; un commit por cambio lógico, mensajes en español y en imperativo ("Agrega autoguardado de diagramas").
- No hagas commit ni push sin que se te pida.
- Si una tarea toca el modelo de datos, las reglas o el SSO, explica primero el plan y espera confirmación.
- No dejes código muerto, `console.log` ni `any` sin justificar.
- Si algo de esta guía choca con lo que se te pide, dilo antes de seguir.
