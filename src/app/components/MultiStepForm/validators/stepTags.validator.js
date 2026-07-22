export const validate_tags = (data) => {
  const errors = {};

  if (!data.tags || data.tags.length === 0) {
    errors.tags = "Selecione pelo menos uma tag.";
  }

  return errors;
};
