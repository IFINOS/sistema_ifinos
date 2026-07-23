"use client";

// Utils
import standardStyle from "./StepStandardStyle.module.css";
import PropTypes from "prop-types";

const MAX_DESCRIPTION = 500;

const StepInfoBasica = ({ data, errors, onChange }) => {
  const descriptionLength = data.descricao?.length ?? 0;

  return (
    <section className={standardStyle.step_wrapper}>
      <section className={standardStyle.input_wrapper}>
        <label htmlFor="titulo" className={standardStyle.step_label}>
          Título
        </label>
        <input
          id="titulo"
          className={`${standardStyle.step_input} ${errors.titulo ? standardStyle.input_invalid : ""}`}
          type="text"
          value={data.titulo ?? ""}
          onChange={(e) => onChange("titulo", e.target.value)}
          placeholder="Máximo de 80 caracteres"
          maxLength={80}
        />
        {errors.titulo && (
          <span className={standardStyle.field_error}>{errors.titulo}</span>
        )}
      </section>

      <section className={standardStyle.input_wrapper}>
        <label htmlFor="descricao" className={standardStyle.step_label}>
          Descrição
        </label>
        <textarea
          id="descricao"
          className={`${standardStyle.step_textarea} ${errors.descricao ? standardStyle.input_invalid : ""}`}
          value={data.descricao ?? ""}
          onChange={(e) => onChange("descricao", e.target.value)}
          placeholder="Mínimo de 10 caracteres"
          rows={5}
          maxLength={MAX_DESCRIPTION}
        />
        <p
          className={`${standardStyle.char_counter} ${
            descriptionLength >= MAX_DESCRIPTION || descriptionLength < 10
              ? standardStyle.char_counter_limit
              : ""
          }`}
        >
          {descriptionLength}/{MAX_DESCRIPTION}
        </p>

        {errors.descricao && (
          <span className={standardStyle.field_error}>{errors.descricao}</span>
        )}
      </section>
    </section>
  );
};

StepInfoBasica.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default StepInfoBasica;
