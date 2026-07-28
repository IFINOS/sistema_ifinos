"use client";
// Utils
import styles from "../layout.module.css";

// Components
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/components/Loading/Loading";

// Images
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState } from "react";

const Page = () => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* NÃO DEIXAR CONSOLE.LOG NO CÓDIGO :) */

  const handle_recover_password = async (e) => {
    e.preventDefault();
    setErrors({});

    const form = new FormData(e.currentTarget);
    const email = form.get("email");

    if (!email) {
      setErrors({ email: "Email é obrigatório." });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // após clicar no link do email, cai no /auth/callback
      // que redireciona para /atualizar-senha
      redirectTo: `${window.location.origin}/auth/callback?next=/atualizar-senha`,
    });

    if (error) {
      toast.error("Erro ao enviar email. Tente novamente.");
      setLoading(false);
      return;
    }

    toast.success("Email enviado! Verifique sua caixa de entrada.");
    setLoading(false);
  };
  return (
    <form onSubmit={handle_recover_password} className={styles.auth_form}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className={styles.auth_form_title}>Recuperar Senha</h1>

          <section className={styles.input_wrapper}>
            <label htmlFor="email" className={styles.auth_label}>
              Email
            </label>

            <section className={styles.input_content}>
              <input
                className={`${styles.auth_input} ${errors.email ? styles.input_invalid : ""}`}
                type="email"
                name="email"
                placeholder="Informe o email que deseja recuperar"
              />
              <div className={styles.icon_container}>
                <FontAwesomeIcon
                  className={styles.input_icon}
                  icon={faEnvelope}
                  size="lg"
                />
              </div>
            </section>

            {errors.email && (
              <span className={styles.field_error}>{errors.email}</span>
            )}
          </section>

          <button className={styles.auth_button} type="submit">
            Enviar
          </button>
        </>
      )}
    </form>
  );
};

export default Page;
