export const validate_info_basica = (data) => {
  const errors = {};

  if (!data.titulo || data.titulo.trim().length < 3) {
    errors.titulo = "Título deve ter pelo menos 3 caracteres.";
  } else if (data.titulo.trim().length > 80) {
    errors.titulo = "Título deve ter no máximo 80 caracteres.";
  }

  if (!data.descricao || data.descricao.trim().length < 10) {
    errors.descricao = "Descrição deve ter pelo menos 10 caracteres.";
  }

  return errors;
};
