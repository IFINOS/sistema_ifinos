"use client";
// Utils
import styles from "../layout.module.css";

// Components
import { toast } from "sonner";

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
    <form>
      <h1>Cadastrar-se</h1>

      <section className={styles.input_wrapper}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="exemplo@gmail.com"
        />
      </section>

      <section className={styles.input_wrapper}>
        <label htmlFor="username">Nome de Usuário</label>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Máximo de 30 caracteres"
          maxLength={30}
        />
      </section>

      <section className={styles.input_wrapper}>
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Mínimo de 8 caracteres"
        />
      </section>

      <section className={styles.input_wrapper}>
        <label htmlFor="confirm_password">Confirmar Senha</label>
        <input
          type="password"
          name="confirm_password"
          id="confirm_password"
          placeholder=""
        />
      </section>

      <section className={styles.user_options}>
        <section className={styles}></section>
      </section>
    </form>
  );
};

export default page;
