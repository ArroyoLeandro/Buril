# Buril UI

[English](./README.md) · **Español**

Componentes de React accesibles, listos para copiar y pegar, con una estética de grabado sobre papel. Construidos desde cero, estilizados con Tailwind CSS y distribuidos como código fuente que te pertenece.

> **Estado: planificación inicial.** Todavía no hay componentes publicados. Por ahora, este repositorio contiene el catálogo de componentes y las reglas de accesibilidad que todos cumplirán.

## Por qué Buril

| Principio | Qué significa |
|-----------|---------------|
| **El código es tuyo** | Los componentes se copian en tu proyecto, no se instalan como una dependencia en tiempo de ejecución. Puedes editarlos sin restricciones. |
| **Accesible por defecto** | Todos los componentes apuntan a WCAG 2.2 AA y siguen su patrón de la [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/). |
| **La plataforma primero** | `<dialog>` nativo, el atributo `popover` y HTML semántico antes que cualquier solución en JavaScript. |
| **Construido desde cero** | Sin primitivas de UI headless. El comportamiento (foco, teclado, ARIA) se escribe y se prueba aquí. |
| **Personalizable** | Los componentes usan solo tokens de diseño semánticos. Puedes cambiar la paleta sin tocar ningún componente. |

## Uso previsto

Buril será un [registry compatible con shadcn](https://ui.shadcn.com/docs/registry). Podrás instalar un componente y sus dependencias con el gestor de paquetes que ya utilizas:

```bash
npx shadcn@latest add <buril-registry-url>/button.json
```

Además, cada componente tendrá un botón de copiar en la documentación, generado a partir del mismo archivo fuente.

## Estilo visual

El tema por defecto combina el grabado impreso con una terminal:

- Una sola tinta bermellón sobre papel crudo, dividida en un acento decorativo y un acento más fuerte que cumple AA para texto.
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

En [COMPONENTS.md](./COMPONENTS.md) (en inglés) están el catálogo completo, las reglas de accesibilidad obligatorias y la definición de terminado.

## Stack técnico

- **Componentes:** React, TypeScript, Tailwind CSS v4
- **Posicionamiento:** [Floating UI](https://floating-ui.com/) (`@floating-ui/dom`) para tooltips, popovers y menús
- **Sitio de documentación:** [Astro](https://astro.build/) con demos de React en vivo
- **Tests:** Vitest, Testing Library y axe

## Licencia

[MIT](./LICENSE)
