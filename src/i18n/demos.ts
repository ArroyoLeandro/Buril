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
} as const satisfies Record<string, string>;

export type DemoText = keyof typeof demoText;

/** The demo translator for one locale: English as written, Spanish from `demoText`. */
export function demoTranslator(locale: Locale) {
  return (text: DemoText, values: Record<string, string | number> = {}) =>
    (locale === "es" ? demoText[text] : text).replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
}
