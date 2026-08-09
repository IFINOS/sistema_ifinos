"use client";
// Utils
import standardStyles from "./StepStandardStyle.module.css";
import PropTypes from "prop-types";

const MAX_RESUMO = 6500;
const MIN_RESUMO = 20;

const StepConteudoNoticia = ({ data, errors, onChange }) => {
  const resumoLength = data.resumo?.length ?? 0;

  const isResumoTooShort = resumoLength > 0 && resumoLength < MIN_RESUMO;

  return (
    <section className={standardStyles.step_wrapper}>
      <section className={standardStyles.input_wrapper}>
        <label htmlFor="titulo" className={standardStyles.step_label}>
          Título
        </label>
        <input
          id="titulo"
          className={`${standardStyles.step_input} ${errors.titulo ? standardStyles.input_invalid : ""}`}
          type="text"
          value={data.titulo ?? ""}
          onChange={(e) => onChange("titulo", e.target.value)}
          placeholder="Máximo de 120 caracteres"
          maxLength={120}
        />
        {errors.titulo && (
          <span className={standardStyles.field_error}>{errors.titulo}</span>
        )}
      </section>

      <section className={standardStyles.input_wrapper}>
        <label htmlFor="resumo" className={standardStyles.step_label}>
          Texto da notícia
        </label>
        <textarea
          id="resumo"
          className={`${standardStyles.step_textarea} ${
            errors.resumo || isResumoTooShort
              ? standardStyles.input_invalid
              : ""
          }`}
          value={data.resumo ?? ""}
          onChange={(e) => onChange("resumo", e.target.value)}
          placeholder="Mínimo de 20 caracteres"
          rows={10}
          maxLength={MAX_RESUMO}
        />
        <p
          className={`${standardStyles.char_counter} ${
            resumoLength >= MAX_RESUMO || isResumoTooShort
              ? standardStyles.char_counter_limit
              : ""
          }`}
        >
          {resumoLength}/{MAX_RESUMO}
        </p>

        {errors.resumo && (
          <span className={standardStyles.field_error}>{errors.resumo}</span>
        )}
      </section>
    </section>
  );
};

StepConteudoNoticia.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default StepConteudoNoticia;
