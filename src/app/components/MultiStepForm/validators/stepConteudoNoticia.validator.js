const MAX_RESUMO = 6500;

export const validate_conteudo_noticia = (data) => {
  const errors = {};

  if (!data.titulo || data.titulo.trim().length < 5) {
    errors.titulo = "Título deve ter pelo menos 5 caracteres.";
  } else if (data.titulo.trim().length > 120) {
    errors.titulo = "Título deve ter no máximo 120 caracteres.";
  }

  if (!data.resumo || data.resumo.trim().length < 20) {
    errors.resumo = "O texto da notícia deve ter pelo menos 20 caracteres.";
  } else if (data.resumo.trim().length > MAX_RESUMO) {
    errors.resumo = `O texto da notícia deve ter no máximo ${MAX_RESUMO} caracteres.`;
  }

  return errors;
};
