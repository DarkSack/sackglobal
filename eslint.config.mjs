import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ══════════════════════════════════════════════════════════════════
// ESLint 9 (flat config) con las reglas de Next.
//
// Se mantienen las dos decisiones del proyecto anterior: `any` es un
// error y las variables sin usar también, salvo con prefijo `_`.
// ══════════════════════════════════════════════════════════════════

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default config;
