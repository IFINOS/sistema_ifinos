// já deixei pronto o esquema de importar a versão do site... de nada :)
import { createRequire } from "module"; // utilizando essa biblioteca pois o next n deixa usar require :(
const require = createRequire(import.meta.url);
const { version } = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: { NEXT_PUBLIC_SITE_VERSION: version },
  reactCompiler: true,
};

export default nextConfig;
