export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/sistema",
          "/api",
          "/login",
          "/cadastrar-se",
          "/recuperar-senha",
          "/meu-perfil",
          "/*/cadastrar",
          "/*/editar",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
