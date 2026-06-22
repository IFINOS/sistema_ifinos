"use client";
// Utils
import styles from "../layout.module.css";

// Components
import { toast } from "sonner";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState } from "react";

const page = () => {
  const supabase = createClient();
  const [errors, setErrors] = useState({});

  const validate_inputs = () => {};

  const handle_submit = (e) => {
    e.preventDefault();
  };

  return (
    <form className={styles.auth_form}>
      <h1 className={styles.auth_form_title}>Cadastrar-se</h1>

      <section className={styles.input_wrapper}>
        <label htmlFor="email" className={styles.auth_label}>
          Email
        </label>
        <input
          className={styles.auth_input}
          type="email"
          name="email"
          id="email"
          placeholder="exemplo@gmail.com"
        />
      </section>

      <section className={styles.input_wrapper}>
        <label htmlFor="username" className={styles.auth_label}>
          Nome de Usuário
        </label>
        <input
          className={styles.auth_input}
          type="text"
          name="username"
          id="username"
          placeholder="Máximo de 30 caracteres"
          maxLength={30}
        />
      </section>

      <section className={styles.input_wrapper}>
        <label htmlFor="password" className={styles.auth_label}>
          Senha
        </label>
        <input
          className={styles.auth_input}
          type="password"
          name="password"
          id="password"
          placeholder="Mínimo de 8 caracteres"
        />
      </section>

      <section className={styles.input_wrapper}>
        <label htmlFor="confirm_password" className={styles.auth_label}>
          Confirmar Senha
        </label>
        <input
          className={styles.auth_input}
          type="password"
          name="confirm_password"
          id="confirm_password"
          placeholder=""
        />
      </section>

      <section className={styles.user_options}>
        <section className={styles.remember_user_container}>
          <input
            className={styles.remember_user_input}
            type="checkbox"
            name="remember_user"
            id="remember_user"
          />
          <label className={styles.remember_user_label} htmlFor="remember_user">
            Lembre-me
          </label>
        </section>

        <Link className={styles.account_support_link} href="/recuperar-senha">
          Esqueceu a senha?
        </Link>
      </section>

      <button className={styles.auth_button} type="submit">
        Criar Conta
      </button>

      <section className={styles.auth_options_header}>
        {/* transformar o divider em componente? */}
        <div className={styles.divider}></div>
        <p className={styles.divider_text}>Ou</p>
        <div className={styles.divider}></div>
      </section>

      <section className={styles.auth_options_container}>
        <button className={styles.auth_option}>
          <FontAwesomeIcon icon={faGoogle} size="lg" />
          Criar conta com o Google
        </button>

        <Link className={styles.account_support_link} href="/login">
          Já possui uma conta? Faça Login
        </Link>
      </section>
    </form>
  );
};

export default page;
