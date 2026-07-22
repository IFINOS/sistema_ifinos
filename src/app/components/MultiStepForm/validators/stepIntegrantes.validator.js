export const validate_integrantes = (data) => {
  const errors = {};

  if (!data.integrantes || data.integrantes.length === 0) {
    errors.integrantes = "Adicione pelo menos um integrante.";
    return errors;
  }

  const sem_funcao = data.integrantes.some((i) => !i.funcao);
  if (sem_funcao) {
    errors.integrantes =
      "Todos os integrantes precisam ter uma função selecionada.";
  }

  return errors;
};
