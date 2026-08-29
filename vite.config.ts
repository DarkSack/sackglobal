import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Separa las dependencias en trozos estables.
         *
         * Antes todo —React, el router, Supabase, los iconos y el código
         * propio— salía en un único fichero de más de 500 KB. Al margen
         * del peso, cualquier cambio en el código invalidaba la caché
         * del navegador para todo el conjunto.
         *
         * Troceado así, actualizar el portafolio solo obliga a volver a
         * descargar el trozo del código propio: React y compañía se
         * quedan en la caché entre despliegues, que es donde más se nota.
         *
         * SweetAlert2 no aparece aquí porque ya se importa bajo demanda
         * desde `lib/notify`, así que Rollup le da su propio trozo.
         */
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
