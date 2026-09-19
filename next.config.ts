import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El despliegue actual en Vercel tiene las variables con el prefijo
  // de Vite. Se reexportan con el nombre de Next para que el cambio de
  // framework no obligue a tocar la configuración del proyecto.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.VITE_SUPABASE_ANON_KEY ??
      "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
