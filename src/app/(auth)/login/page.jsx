"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState } from "react";

// Utils
import styles from "../layout.module.css";

// Images
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faArrowRightToBracket, faR } from "@fortawesome/free-solid-svg-icons";

// Components
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const page = () => {
  const supabase = createClient();
  const [errors, setErrors] = useState({});

  const validate_inputs = () => {};

  const handle_submit = (e) => {
    e.preventDefault();
  };

  return (
    <form className={styles.auth_form}>
      <h1 className={styles.auth_form_title}>Login</h1>

      <section className={styles.input_wrapper}>
        <label htmlFor="email" className={styles.auth_label}>
          Email
        </label>
        <input
          className={styles.auth_input}
          type="email"
          name="email"
          id="email"
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
        <FontAwesomeIcon icon={faArrowRightToBracket} />
        Entrar
      </button>

      <section className={styles.auth_options_header}>
        {/* transformar o divider em componente? */}
        <div className={styles.divider}></div>
        <p className={styles.divider_text}>Ou</p>
        <div className={styles.divider}></div>
      </section>

      <section className={styles.auth_options_container}>
        <button className={styles.auth_option}>
          <FontAwesomeIcon icon={faGoogle} />
          Criar conta com o Google
        </button>

        <Link className={styles.account_support_link} href="/cadastrar-se">
          Ainda não possui uma conta? Crie uma
        </Link>
      </section>
    </form>
  );
};

export default page;
