"use client";
// Hooks
import { useState, useEffect } from "react";

// Utils
import styles from "./MultiStepForm.module.css";

const MultiStepForm = ({
  steps,
  initial_data,
  on_submit,
  submit_label = "Cadastrar",
}) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initial_data);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const is_last_step = step === steps.length - 1;
  const CurrentStep = steps[step].component;

  // revalida o step atual sempre que os dados mudam, e limpa erros já corrigidos
  useEffect(() => {
    const validator = steps[step].validator;
    if (!validator) return;

    const current_errors = validator(formData);

    const timeout = setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev };
        let changed = false;

        for (const key of Object.keys(prev)) {
          if (!current_errors[key]) {
            delete next[key];
            changed = true;
          } else if (current_errors[key] !== prev[key]) {
            next[key] = current_errors[key];
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [formData, step, steps]);

  const update_field = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handle_next = () => {
    const validator = steps[step].validator;
    const step_errors = validator ? validator(formData) : {};

    if (Object.keys(step_errors).length > 0) {
      setErrors(step_errors);
      return;
    }

    setErrors({});
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handle_back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handle_submit = async (e) => {
    e.preventDefault();

    const validator = steps[step].validator;
    const step_errors = validator ? validator(formData) : {};

    if (Object.keys(step_errors).length > 0) {
      setErrors(step_errors);
      return;
    }

    setSubmitting(true);
    try {
      await on_submit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handle_submit} className={styles.multi_step_form}>
      <section className={styles.progress_wrapper}>
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={`${styles.progress_step} ${
              i === step ? styles.progress_step_active : ""
            } ${i < step ? styles.progress_step_done : ""}`}
          >
            <span className={styles.progress_step_number}>{i + 1}</span>
            <span className={styles.progress_step_label}>{s.label}</span>
          </div>
        ))}
      </section>

      <section className={styles.step_content}>
        <CurrentStep data={formData} errors={errors} onChange={update_field} />
      </section>

      <section className={styles.form_nav}>
        {step > 0 && (
          <button
            type="button"
            className={styles.back_btn}
            onClick={handle_back}
          >
            Voltar
          </button>
        )}

        {!is_last_step ? (
          <button
            key="next-btn"
            type="button"
            className={styles.next_btn}
            onClick={handle_next}
          >
            Próximo
          </button>
        ) : (
          <button
            key="submit-btn"
            type="submit"
            className={styles.submit_btn}
            disabled={submitting}
          >
            {submitting ? "Enviando..." : submit_label}
          </button>
        )}
      </section>
    </form>
  );
};

export default MultiStepForm;
