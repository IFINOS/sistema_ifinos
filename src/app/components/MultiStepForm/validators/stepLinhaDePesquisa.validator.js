export const validate_linha_pesquisa = (data) => {
  const errors = {};

  if (!data.linha_pesquisa) {
    errors.linha_pesquisa = "Selecione uma linha de pesquisa.";
  }

  return errors;
};
