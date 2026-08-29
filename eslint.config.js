import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// ══════════════════════════════════════════════════════════════════
// Configuración de ESLint 9 (flat config)
//
// El proyecto tenía el script `npm run lint` pero ningún fichero de
// configuración, así que siempre fallaba con "couldn't find
// eslint.config.js". Esto lo deja funcionando.
//
// Reglas elegidas para que el lint sirva de algo y no de estorbo: las
// de corrección (hooks mal usados, variables sin usar) avisan de
// verdad; las de estilo se dejan fuera, que para eso está el formateo.
// ══════════════════════════════════════════════════════════════════

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "*.tsbuildinfo"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Vite necesita que cada módulo exporte solo componentes para que
      // el hot reload conserve el estado. Aviso, no error: hay casos
      // legítimos (constantes junto al componente que las usa).
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Un argumento o variable sin usar suele ser un descuido, pero el
      // prefijo `_` sirve para decir "ya sé, lo ignoro a propósito".
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // `any` desactiva el chequeo de tipos justo donde más falta hace.
      "@typescript-eslint/no-explicit-any": "error",

      // Aviso, no error, y con motivo.
      //
      // La regla persigue los `setState` síncronos dentro de un efecto,
      // que provocan un render de más. Pero también marca el patrón
      // "efecto que lanza una carga asíncrona y guarda el resultado",
      // que es la forma que tiene cualquier fetch hecho a mano —aquí,
      // `useCachedResource`—. La alternativa sería meter react-query,
      // y este proyecto está justamente recortando el bundle.
      //
      // Se deja visible como aviso para que no se normalice, en lugar
      // de apagarla del todo.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Los scripts sueltos corren en Node, no en el navegador.
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },
);
