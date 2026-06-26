/*
  Grupos cadastrados na tabela grupos:
  - Visitantes       → role: visitor  (usuário padrão com login)
  - Membros de Projetos → role: member (alunos, bolsistas, integrantes)
  - Professores      → role: professor (professores e orientadores)
  - Administradores  → role: admin    (acesso total)
 */

export const ROLE_LEVEL = {
  visitor: 0,
  member: 1,
  professor: 2,
  admin: 3,
};

const GROUP_NAME_TO_ROLE = {
  visitantes: "visitor",
  "membros de projetos": "member",
  professores: "professor",
  administradores: "admin",
};

export function getRoleFromGroups(groupNames) {
  let highest = "visitor";

  groupNames.forEach((name) => {
    // Normaliza para evitar problemas com espaços ou maiúsculas
    const normalizedName = name.trim().toLowerCase();
    const role = GROUP_NAME_TO_ROLE[normalizedName];

    // compara o nível numérico do role encontrado com o maior até agora
    // ex: ROLE_LEVEL['admin'] (3) > ROLE_LEVEL['visitor'] (0) = atualiza
    // ex: ROLE_LEVEL['visitor'] (0) > ROLE_LEVEL['admin'] (3) = ignora
    if (role && ROLE_LEVEL[role] > ROLE_LEVEL[highest]) {
      highest = role;
    }
  });

  // retorna o role de maior nível encontrado entre todos os grupos do usuário
  return highest;
}

export function hasMinimumRole(userRole, required) {
  // compara numericamente se o role do usuário é maior ou igual ao exigido
  // ex: professor (2) >= member (1) = true, pode acessar
  // ex: visitor (0) >= member (1)   = false, sem permissão
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[required];
}
