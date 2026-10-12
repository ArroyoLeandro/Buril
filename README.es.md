# Buril UI

[English](./README.md) · **Español**

Componentes de React accesibles, listos para copiar y pegar, con una estética de grabado sobre papel. Construidos desde cero, estilizados con Tailwind CSS y distribuidos como código fuente que te pertenece.

> **Estado: desarrollo inicial.** Button, Icon Button, Link, Skip Link, Field, Input, Textarea y Checkbox están disponibles, con tests y páginas de documentación. El registry todavía no está publicado: los comandos de abajo usan el dominio de ejemplo `example.com`, que cambiará cuando el sitio esté en línea.

## Por qué Buril

| Principio | Qué significa |
|-----------|---------------|
| **El código es tuyo** | Los componentes se copian en tu proyecto, no se instalan como una dependencia en tiempo de ejecución. Puedes editarlos sin restricciones. |
| **Accesible por defecto** | Todos los componentes apuntan a WCAG 2.2 AA y siguen su patrón de la [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/). |
| **La plataforma primero** | `<dialog>` nativo, el atributo `popover` y HTML semántico antes que cualquier solución en JavaScript. |
| **Construido desde cero** | Sin primitivas de UI headless. El comportamiento (foco, teclado, ARIA) se escribe y se prueba aquí. |
| **Personalizable** | Los componentes usan solo tokens de diseño semánticos. Puedes cambiar la paleta sin tocar ningún componente. |

## Instalación

Buril es un [registry compatible con shadcn](https://ui.shadcn.com/docs/registry). En un proyecto configurado con shadcn (con un archivo `components.json`), instala Button desde su URL:

```bash
npx shadcn@latest add https://example.com/r/button.json
```

También puedes registrar el namespace `@buril` una sola vez e instalar los componentes por nombre:

```bash
npx shadcn@latest registry add @buril=https://example.com/r/{name}.json
npx shadcn@latest add @buril/button
```

Los ejemplos usan npx. Con otros gestores de paquetes, reemplaza `npx` por `pnpm dlx`, `yarn dlx` o `bunx --bun`.

Los componentes usan los tokens estándar de shadcn y el helper `cn()` que tu proyecto ya tiene, así que instalarlos no cambia tu tema. La documentación muestra el código fuente de cada componente, leído del mismo archivo que distribuye el registry.

### Tema opcional

La paleta de Buril se instala por separado:

```bash
npx shadcn@latest add @buril/theme
```

Reemplaza los tokens de color de shadcn por los valores de Buril para los modos claro y oscuro, y agrega dos tokens decorativos, `--decor` y `--grid`. Además, sigue el esquema de color del sistema sin JavaScript: la paleta oscura se aplica con `prefers-color-scheme: dark`, salvo que `<html>` tenga la clase `light`, y la variante `dark:` sigue la misma regla. Para forzar el modo claro, el selector de tema debe poner `class="light"` en `<html>`; next-themes con `attribute="class"` ya lo hace.

## Estilo visual

El tema por defecto combina el grabado impreso con una terminal:

- Tinta sobre papel crudo. El color primario es tinta en modo claro y hueso en modo oscuro.
- El rojo laca se reserva para el anillo de foco, la decoración y las acciones destructivas, así que el rojo siempre tiene un significado.
- Una fuente pixel para los títulos y una sans-serif neutra para el cuerpo de texto.
- Líneas de grilla finas, botones en forma de píldora y tramados CSS opcionales.

Los modos claro y oscuro vienen incluidos desde la primera versión. Los elementos decorativos son opcionales, así que los componentes también funcionan con un tema neutro.

## Hoja de ruta

| Fase | Enfoque | Ejemplos |
|------|---------|----------|
| **1** | Fundamentos | Button, Field, Input, Checkbox, Radio Group, Switch, Card, Alert |
| **2** | Lo que hace útil a la librería | Dialog, Popover, Tooltip, Tabs, Toast, Dropdown Menu |
| **3** | Componentes complejos | Combobox, Command Palette, Date Picker, Carousel |

Primero React. Hay una versión para Angular prevista para una etapa posterior.

En [COMPONENTS.md](./COMPONENTS.md) (en inglés) están el catálogo completo, las reglas de accesibilidad obligatorias y la definición de terminado. En [CONTRIBUTING.md](./CONTRIBUTING.md) (en inglés) están la configuración local, los scripts y los tests.

## Stack técnico

- **Componentes:** React, TypeScript, Tailwind CSS v4
- **Posicionamiento:** [Floating UI](https://floating-ui.com/) (`@floating-ui/dom`) para tooltips, popovers y menús (previsto)
- **Sitio de documentación:** [Astro](https://astro.build/) con demos de React en vivo
- **Tests:** Vitest, Testing Library y axe

## Licencia

[MIT](./LICENSE)
