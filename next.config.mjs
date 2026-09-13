// já deixei pronto o esquema de importar a versão do site... de nada :)
import { createRequire } from "module"; // utilizando essa biblioteca pois o next n deixa usar require :(
const require = createRequire(import.meta.url);
const { version } = require("./package.json");

const is_dev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: { NEXT_PUBLIC_SITE_VERSION: version },
  reactCompiler: true,
  images: {
    remotePatterns: [
      // adicionando a permissão de pegar a url de avatar do usuário
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "frame-ancestors 'none'",
              "frame-src https://vlibras.gov.br",
              `script-src 'self' 'unsafe-inline'${is_dev ? " 'unsafe-eval'" : ""} https://vlibras.gov.br https://cdn.jsdelivr.net`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://vlibras.gov.br https://cdn.jsdelivr.net",
              "img-src 'self' data: https://lh3.googleusercontent.com https://res.cloudinary.com https://vlibras.gov.br https://cdn.jsdelivr.net",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vlibras.gov.br",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
