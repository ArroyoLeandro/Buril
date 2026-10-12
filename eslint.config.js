import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import astro from "eslint-plugin-astro";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig(
  // Private, git-ignored folders (planning, task notes, agent tooling) are not linted.
  {
    ignores: [
      "dist/",
      ".astro/",
      "public/r/",
      "node_modules/",
      "pnpm-lock.yaml",
      ".claude/",
      ".planning/",
      "odd/",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // Buril's form controls render native inputs, so a <label> that wraps one is associated.
      "jsx-a11y/label-has-associated-control": [
        "error",
        { controlComponents: ["Checkbox", "Input", "Select", "Switch", "Textarea"] },
      ],
    },
  },
  ...astro.configs.recommended,
  ...astro.configs["flat/jsx-a11y-recommended"],
  {
    files: ["**/*.astro"],
    rules: {
      // A docs table too wide for a phone scrolls in a named region, which must take focus so
      // keyboard users can scroll it (axe: scrollable-region-focusable).
      "astro/jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],
    },
  },
);
