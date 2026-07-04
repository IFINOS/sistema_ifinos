"use client";
// Utils
import styles from "./page.module.css";
import layout from "../layout.module.css";
import { useUser } from "@/context/userContext";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";

// Images
import {
  faEnvelope,
  faUser,
  faMessage,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useState } from "react";

const page = () => {
  const [inputErrors, setInputErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { user } = useUser();

  const validate_inputs = ({ nome, email, mensagem }) => {
    const errors = {};

    if (!nome) errors.nome = "Nome obrigatório";
    else if (nome.length < 3) errors.nome = "Nome muito curto";

    if (!email) errors.email = "Email obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Email inválido";
    else if (user && email !== user.email)
      errors.email = "Email diferente do cadastrado";

    if (!mensagem) errors.mensagem = "Mensagem obrigatória";
    else if (mensagem.length < 10) errors.mensagem = "Mensagem muito curta";

    return errors;
  };

  const handle_submit = async (e) => {
    e.preventDefault();

    setInputErrors({});

    const form_data = new FormData(e.currentTarget);
    const nome = form_data.get("nome")?.trim();
    const email = form_data.get("email")?.trim();
    const mensagem = form_data.get("mensagem")?.trim();

    const errors = validate_inputs({ nome, email, mensagem });
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem }),
      });

      if (!res.ok) throw new Error();

      toast.success("Mensagem enviada com sucesso!");
      setFormKey((prev) => prev + 1); // força o reset dos inputs no form
    } catch (e) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.contact_container}>
      <h1 className={layout.main_app_title}>Fale Conosco</h1>

      <form
        key={formKey}
        onSubmit={handle_submit}
        className={styles.contact_form}
      >
        <section className={styles.input_wrapper}>
          <label className={styles.input_label} htmlFor="nome">
            Nome <FontAwesomeIcon icon={faUser} />
          </label>

          <input
            defaultValue={user ? user.user_metadata.full_name : ""}
            className={`${styles.input} ${inputErrors.nome ? layout.input_invalid : ""}`}
            type="text"
            name="nome"
            id="nome"
          />

          {inputErrors.nome && (
            <span className={layout.field_error}>{inputErrors.nome}</span>
          )}
        </section>

        <section className={styles.input_wrapper}>
          <label className={styles.input_label} htmlFor="email">
            Email <FontAwesomeIcon icon={faEnvelope} />
          </label>

          <input
            defaultValue={user ? user.email : ""}
            className={`${styles.input} ${inputErrors.email ? layout.input_invalid : ""}`}
            type="email"
            name="email"
            id="email"
          />

          {inputErrors.email && (
            <span className={layout.field_error}>{inputErrors.email}</span>
          )}
        </section>

        <section className={styles.input_wrapper}>
          <label className={styles.input_label} htmlFor="mensagem">
            Mensagem <FontAwesomeIcon icon={faMessage} />
          </label>

          <textarea
            className={`${styles.message_container} ${inputErrors.mensagem ? layout.input_invalid : ""}`}
            name="mensagem"
            id="mensagem"
            maxLength={1500}
            placeholder="Máximo de 1500 caracteres"
          ></textarea>

          {inputErrors.mensagem && (
            <span className={layout.field_error}>{inputErrors.mensagem}</span>
          )}
        </section>

        {inputErrors.geral && (
          <span className={layout.field_error}>{inputErrors.geral}</span>
        )}

        <button
          className={styles.send_message_btn}
          type="submit"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar"}
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </section>
  );
};

export default page;
