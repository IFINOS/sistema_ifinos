export const validate_imagem_noticia = (data) => {
  const errors = {};

  if (!data.img_url) {
    errors.img_url = "Envie uma imagem de capa para a notícia.";
  }

  return errors;
};
