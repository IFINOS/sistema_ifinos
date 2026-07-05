// já deixei pronto o esquema de importar a versão do site... de nada :)
import { createRequire } from "module"; // utilizando essa biblioteca pois o next n deixa usar require :(
const require = createRequire(import.meta.url);
const { version } = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: { NEXT_PUBLIC_SITE_VERSION: version },
  reactCompiler: true,
  images: {
    remotePatterns: [
      // adicionando a permissão de pegar a url de avatar do usuároo
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
