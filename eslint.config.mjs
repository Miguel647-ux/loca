import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Pattern légitime : synchronisation state local ↔ URL
      // après navigation externe (retour-arrière, etc.).
      // Utilisé dans les composants de recherche.
      "react-hooks/set-state-in-effect": "off",

      // Warning React Compiler — `form.watch()` de react-hook-form
      // n'est pas memoizable. Comportement connu et attendu.
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;