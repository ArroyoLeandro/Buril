/**
 * The catalog categories from COMPONENTS.md, in catalog order, and the category of every planned
 * component by slug. The docs sidebar groups components with it, so an entry in
 * `components.ts` does not have to repeat its category.
 */
export const componentCategories = [
  "Actions",
  "Forms",
  "Content",
  "Feedback",
  "Overlays",
  "Navigation",
  "Advanced",
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export const catalogCategory: Readonly<Record<string, ComponentCategory>> = {
  button: "Actions",
  "icon-button": "Actions",
  link: "Actions",
  field: "Forms",
  input: "Forms",
  textarea: "Forms",
  checkbox: "Forms",
  "radio-group": "Forms",
  switch: "Forms",
  select: "Forms",
  slider: "Forms",
  card: "Content",
  badge: "Content",
  avatar: "Content",
  separator: "Content",
  table: "Content",
  accordion: "Content",
  alert: "Feedback",
  callout: "Feedback",
  spinner: "Feedback",
  skeleton: "Feedback",
  progress: "Feedback",
  toast: "Feedback",
  dialog: "Overlays",
  "alert-dialog": "Overlays",
  drawer: "Overlays",
  sheet: "Overlays",
  popover: "Overlays",
  tooltip: "Overlays",
  "dropdown-menu": "Overlays",
  tabs: "Navigation",
  breadcrumb: "Navigation",
  pagination: "Navigation",
  "skip-link": "Navigation",
  combobox: "Advanced",
  "command-palette": "Advanced",
  "date-picker": "Advanced",
  carousel: "Advanced",
};
