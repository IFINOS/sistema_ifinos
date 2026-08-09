export const validate_selecionar_projeto = (data) => {
  const errors = {};

  if (!data.projeto) {
    errors.projeto = "Selecione um projeto para vincular a notícia.";
  }

  return errors;
};
