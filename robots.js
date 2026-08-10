export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/sistema/', '/confirmar-senha', '/atualizar-senha'],
    },
    sitemap: 'https://ifinos.vercel.app/sitemap.xml',
  };
}