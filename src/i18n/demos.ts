import type { Locale } from "./ui";

/**
 * Spanish for every string the live demos and the landing panels show or announce, keyed by the
 * English text. Demos write `t("Save changes")`, so the English stays readable in the source and
 * TypeScript rejects a string missing here. `{name}` placeholders are filled from `values`.
 * Terminology follows the glossary in `ui.ts`.
 */
export const demoText = {
  // Landing: sign-in panel
  Email: "Correo electrónico",
  Password: "Contraseña",
  "Keep me signed in": "Mantener la sesión iniciada",
  "Sign in": "Iniciar sesión",
  "Signing in…": "Iniciando sesión…",
  "Enter an email address, like name@example.com.":
    "Escribe un correo electrónico, como nombre@example.com.",
  "Enter your password.": "Escribe tu contraseña.",
  "Signed in as {email}. Nothing was sent: this form is a demo.":
    "Sesión iniciada como {email}. No se envió nada: este formulario es una demostración.",
  // Landing: settings panel
  "Email notifications": "Notificaciones por correo",
  On: "Sí",
  Off: "No",
  "Email notifications turned on.": "Notificaciones por correo activadas.",
  "Email notifications turned off.": "Notificaciones por correo desactivadas.",
  Digest: "Resumen",
  Daily: "Diario",
  Weekly: "Semanal",
  Never: "Nunca",
  "Digest set to {value}.": "Resumen: {value}.",
  Language: "Idioma",
  "Language set to {value}.": "Idioma: {value}.",
  // Landing: buttons panel
  Publish: "Publicar",
  "Publishing…": "Publicando…",
  "Published.": "Publicado.",
  "Save draft": "Guardar borrador",
  Preview: "Vista previa",
  Cancel: "Cancelar",
  Delete: "Eliminar",
  // Component demos: shared
  Variants: "Variantes",
  Sizes: "Tamaños",
  // Text that Field and Link write themselves
  "(required)": "(obligatorio)",
  "Error:": "Error:",
  "(opens in a new tab)": "(se abre en una pestaña nueva)",
  // Alert
  "New version available": "Nueva versión disponible",
  "Reload the page to get the latest components.":
    "Recarga la página para obtener los componentes más recientes.",
  "Payment failed": "Error en el pago",
  "Your card was declined. Update it to keep your plan.":
    "Se rechazó tu tarjeta. Actualízala para mantener tu plan.",
  "Draft saved": "Borrador guardado",
  "Saved once.": "Guardado una vez.",
  "Saved {count} times.": "Guardado {count} veces.",
  // Badge
  New: "Nuevo",
  Draft: "Borrador",
  Beta: "Beta",
  Failed: "Fallido",
  "Order 1042": "Pedido 1042",
  Shipped: "Enviado",
  Processing: "En preparación",
  "Mark order 1042 as shipped": "Marcar el pedido 1042 como enviado",
  "Mark order 1042 as processing": "Marcar el pedido 1042 como en preparación",
  "Order 1042 marked as shipped.": "Pedido 1042 marcado como enviado.",
  "Order 1042 marked as processing.": "Pedido 1042 marcado como en preparación.",
  // Button
  Loading: "Carga",
  "Save changes": "Guardar cambios",
  "Start loading": "Iniciar la carga",
  "Stop loading": "Detener la carga",
  "Saving changes…": "Guardando cambios…",
  "Changes saved.": "Cambios guardados.",
  "The loading button stays focusable and keeps its name. The status message above announces progress, because screen readers generally do not announce":
    "El botón en carga sigue siendo enfocable y conserva su nombre. El mensaje de estado de arriba anuncia el progreso, porque los lectores de pantalla, en general, no anuncian",
  "on a button.": "en un botón.",
  Disabled: "Deshabilitado",
  "As a link": "Como enlace",
  "Back home": "Volver al inicio",
  // Card
  "Starter plan": "Plan básico",
  "For a single project.": "Para un solo proyecto.",
  "Three seats": "Tres puestos",
  "10 GB of storage": "10 GB de almacenamiento",
  "Choose Starter": "Elegir el plan básico",
  "Accessible forms": "Formularios accesibles",
  "Labels, help text and errors, wired by the Field.":
    "Etiquetas, textos de ayuda y errores, conectados por el Field.",
  "Read the guide": "Lee la guía",
  // Checkbox
  Toppings: "Ingredientes",
  "All toppings": "Todos los ingredientes",
  Cheese: "Queso",
  Mushrooms: "Champiñones",
  Olives: "Aceitunas",
  "Gift wrap (unavailable)": "Envoltorio de regalo (no disponible)",
  // Field
  "Enter your email address.": "Escribe tu correo electrónico.",
  "Enter an email address like name@example.com.":
    "Escribe un correo electrónico como nombre@example.com.",
  "Subscribed {email}.": "Suscripción confirmada para {email}.",
  "We only use it to send the newsletter.": "Solo lo usamos para enviarte el boletín.",
  Subscribe: "Suscribirme",
  // Icon Button
  "Add item ({size})": "Agregar elemento ({size})",
  "Add item": "Agregar elemento",
  "Close panel": "Cerrar panel",
  "Close notice": "Cerrar aviso",
  "Delete item": "Eliminar elemento",
  "Loading and disabled": "Carga y deshabilitado",
  "Refresh results": "Actualizar resultados",
  "Refreshing results…": "Actualizando resultados…",
  Motion: "Movimiento",
  "Hover over each button or reach it with Tab. Each gesture plays once, and only when reduced motion is off.":
    "Pasa el puntero por cada botón o llega a él con Tab. Cada gesto se reproduce una vez, y solo si no se pidió movimiento reducido.",
  "Close dialog": "Cerrar diálogo",
  "Delete draft": "Eliminar borrador",
  Notifications: "Notificaciones",
  "Reload page": "Recargar página",
  "Send message": "Enviar mensaje",
  "Back to top": "Volver arriba",
  Like: "Me gusta",
  "Open in a new tab": "Abrir en una pestaña nueva",
  // Input
  "Usernames cannot contain spaces.": "El nombre de usuario no puede tener espacios.",
  "Full name": "Nombre completo",
  Username: "Nombre de usuario",
  "Letters, numbers and dashes.": "Letras, números y guiones.",
  "Account ID": "ID de cuenta",
  "Assigned when you sign up.": "Se asigna al registrarte.",
  "Promo code": "Código promocional",
  "Not available on the free plan.": "No disponible en el plan gratuito.",
  // Link
  "Start with the": "Empieza por la",
  "Button docs": "documentación del Button",
  "Muted links suit secondary text, such as a":
    "Los enlaces atenuados sirven para texto secundario, como un",
  "footer link": "enlace del pie de página",
  "Opens in a new tab": "Se abre en una pestaña nueva",
  "Buril follows the": "Buril sigue el",
  "APG link pattern": "patrón de enlace de la APG",
  // Motion
  "Simulate reduced motion": "Simular movimiento reducido",
  "It applies to this demo only. If your system already asks for reduced motion, the demo stays still either way.":
    "Solo se aplica a esta demo. Si tu sistema ya pide movimiento reducido, la demo se queda quieta en cualquier caso.",
  "Accept the terms": "Acepto los términos",
  // Radio Group
  Delivery: "Entrega",
  Standard: "Estándar",
  "3 to 5 days": "de 3 a 5 días",
  Express: "Exprés",
  "next day": "al día siguiente",
  Pickup: "Recoger en tienda",
  "from the shop": "en la tienda",
  "Drone (unavailable)": "Dron (no disponible)",
  "Delivery: {name}, {detail}.": "Entrega: {name}, {detail}.",
  // Select
  Small: "Pequeña",
  Medium: "Mediana",
  Large: "Grande",
  "Choose a size.": "Elige una talla.",
  "Added size {size} to the cart.": "Se agregó la talla {size} al carrito.",
  Size: "Talla",
  "See the size chart for measurements.": "Consulta la tabla de tallas para ver las medidas.",
  "Choose a size": "Elige una talla",
  Color: "Color",
  "Only one color is in stock.": "Solo queda un color disponible.",
  Ink: "Tinta",
  "Add to cart": "Agregar al carrito",
  // Separator
  "Accessible components you copy and own.": "Componentes accesibles que copias y haces tuyos.",
  Project: "Proyecto",
  Docs: "Documentación",
  Components: "Componentes",
  Home: "Inicio",
  // Skeleton
  "Profile loaded.": "Perfil cargado.",
  Profile: "Perfil",
  "Writes the first programs.": "Escribe los primeros programas.",
  "Reload profile": "Recargar el perfil",
  // Skip Link
  Bold: "Negrita",
  Italic: "Cursiva",
  Underline: "Subrayado",
  Link: "Enlace",
  Quote: "Cita",
  "Skip to the demo content": "Saltar al contenido de la demo",
  Formatting: "Formato",
  "Demo content": "Contenido de la demo",
  "Tab into this box and the skip link appears first. Press Enter and focus lands here, past the toolbar.":
    "Entra en este recuadro con Tab y el enlace de salto aparece primero. Pulsa Enter y el foco llega aquí, después de la barra de herramientas.",
  // Spinner
  "Lovely contrast.": "Qué buen contraste.",
  "Works with NVDA.": "Funciona con NVDA.",
  "Ship it.": "Listo para publicar.",
  "Loading files": "Cargando archivos",
  "Loading photos": "Cargando fotos",
  "Loading videos": "Cargando videos",
  "Load comments": "Cargar comentarios",
  Comments: "Comentarios",
  "Loading comments": "Cargando comentarios",
  "{count} comments loaded.": "{count} comentarios cargados.",
  // Switch
  "Push notifications": "Notificaciones push",
  "Push notifications turned on.": "Notificaciones push activadas.",
  "Push notifications turned off.": "Notificaciones push desactivadas.",
  "SMS notifications": "Notificaciones por SMS",
  // Textarea
  "Shorten the message to {limit} characters or fewer.":
    "Acorta el mensaje a {limit} caracteres o menos.",
  Message: "Mensaje",
  "Up to {limit} characters.": "Hasta {limit} caracteres.",
} as const satisfies Record<string, string>;

export type DemoText = keyof typeof demoText;

/**
 * Links in demos for one locale: `href("/docs")` stays as written in English and moves under
 * `/es/` in Spanish, so a demo never sends a Spanish reader to an English page. Every page a demo
 * links to exists in both languages, which the page parity test checks.
 */
export function demoHref(locale: Locale) {
  return (path: string) => (locale === "es" ? (path === "/" ? "/es/" : `/es${path}`) : path);
}

/** The demo translator for one locale: English as written, Spanish from `demoText`. */
export function demoTranslator(locale: Locale) {
  return (text: DemoText, values: Record<string, string | number> = {}) =>
    (locale === "es" ? demoText[text] : text).replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
}
