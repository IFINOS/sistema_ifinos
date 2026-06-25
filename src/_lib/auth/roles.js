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

// recebe array de nomes de grupos e retorna o role mais alto
export function getRoleFromGroups(groupNames) {
  let highest = "visitor"; // assumindo o menor role possível

  // percorre cada nome de grupo que o usuário possui
  // um usuário pode ter mais de um grupo no banco
  for (const name of groupNames) {
    const role = GROUP_NAME_TO_ROLE[name.toLowerCase()] ?? "visitor";

    // compara o nível numérico do role encontrado com o maior até agora
    // ex: ROLE_LEVEL['admin'] (3) > ROLE_LEVEL['visitor'] (0) = atualiza
    // ex: ROLE_LEVEL['visitor'] (0) > ROLE_LEVEL['admin'] (3) = ignora
    if (ROLE_LEVEL[role] > ROLE_LEVEL[highest]) {
      highest = role;
    }
  }

  // retorna o role de maior nível encontrado entre todos os grupos do usuário
  return highest;
}

export function hasMinimumRole(userRole, required) {
  // compara numericamente se o role do usuário é maior ou igual ao exigido
  // ex: professor (2) >= member (1) = true, pode acessar
  // ex: visitor (0) >= member (1)   = false, sem permissão
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[required];
}
