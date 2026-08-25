/*
   Hierarquia:
    - visitor:   apenas acessa o site, sem conteúdo restrito
    - member:    alunos, bolsistas, integrantes de projetos
    - professor: professores e orientadores
    - admin:     acesso total
 */

// define o role mínimo exigido para acessar cada rota :D
export const ROUTE_PERMISSIONS = {
  "/meu-perfil": "visitor",
  "/projetos/cadastrar": "professor",
  "/projetos/editar": "member",
  "/demandas/cadastrar": "professor",
  "/noticias/cadastrar": "member",
  "/merchandise/gerenciar": "professor",
  "/sistema": "admin",
  "/api/admin": "admin",
  "/api/perfil": "visitor",
};

// rotas que terminam com um sufixo específico, independente do que vem no meio
export const ROUTE_SUFFIX_PERMISSIONS = {
  "/editar": "visitor", // qualquer logado pode tentar acessar; a página decide se pode editar de fato
};

export function getRequiredRole(pathname) {
  // checa sufixo primeiro (mais específico pro caso de rotas dinâmicas tipo /projetos/[id]/editar)
  const suffixMatch = Object.keys(ROUTE_SUFFIX_PERMISSIONS).find((suffix) =>
    pathname.endsWith(suffix),
  );
  if (suffixMatch) return ROUTE_SUFFIX_PERMISSIONS[suffixMatch];

  // isso é uma obra de arte :0
  const match = Object.keys(ROUTE_PERMISSIONS)
    // filtra só as rotas que são prefixo do pathname atual
    // ex: pathname '/projetos/cadastrar' → passa '/projetos' e '/projetos/cadastrar'
    // ex: pathname '/sistema' → passa só '/sistema'
    .filter((route) => pathname.startsWith(route))

    // ordena do mais longo para o mais curto
    // '/projetos/cadastrar' (20 chars) vem antes de '/projetos' (9 chars)
    // isso garante que a rota mais específica sempre vence
    .sort((a, b) => b.length - a.length)[0]; // ex: '/projetos/cadastrar' em vez de '/projetos'

  return match ? ROUTE_PERMISSIONS[match] : null; // null = rota pública (sem login)
}
