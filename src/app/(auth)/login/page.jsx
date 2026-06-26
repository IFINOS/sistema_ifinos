"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState } from "react";

// Utils
import styles from "../layout.module.css";

// Images
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowRightToBracket,
  faEnvelope,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Link from "next/link";
import Loading from "@/app/components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";

const page = () => {
  const [errors, setErrors] = useState({});
  const [isShowingPass, setIsShowingPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle_login = async (e) => {
    e.preventDefault();
    setErrors({});

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    if (!email) {
      setErrors({ email: "Email é obrigatório." });
      return;
    }
    if (!password) {
      setErrors({ password: "Senha é obrigatória." });
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        sessionStorage.setItem("pending_email", email);
        window.location.href = "/confirmar-email";
        return;
      }
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos.");
      } else {
        toast.error("Erro ao fazer login. Tente novamente.");
      }
      setLoading(false);
      return;
    }

    // pega o parâmetro ?next= da URL se existir
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/";
    window.location.href = next;
  };

  return (
    <form onSubmit={handle_login} className={styles.auth_form}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className={styles.auth_form_title}>Login</h1>

          <section className={styles.input_wrapper}>
            <label htmlFor="email" className={styles.auth_label}>
              Email
            </label>
            <section className={styles.input_content}>
              <input
                className={`${styles.auth_input} ${errors.email ? styles.input_invalid : ""}`}
                type="email"
                name="email"
                id="email"
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

          <section className={styles.input_wrapper}>
            <label htmlFor="password" className={styles.auth_label}>
              Senha
            </label>
            <section className={styles.input_content}>
              <input
                className={`${styles.auth_input} ${errors.password ? styles.input_invalid : ""}`}
                type={isShowingPass ? "text" : "password"}
                name="password"
                id="password"
              />

              <div className={styles.icon_container}>
                <FontAwesomeIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsShowingPass(!isShowingPass)}
                  className={styles.input_icon}
                  icon={isShowingPass ? faEyeSlash : faEye}
                  size="lg"
                />
              </div>
            </section>

            {errors.password && (
              <span className={styles.field_error}>{errors.password}</span>
            )}
          </section>

          <section className={styles.user_options}>
            <section className={styles.remember_user_container}>
              <input
                className={styles.remember_user_input}
                type="checkbox"
                name="remember_user"
                id="remember_user"
              />
              <label
                className={styles.remember_user_label}
                htmlFor="remember_user"
              >
                Lembre-me
              </label>
            </section>

            <Link
              className={styles.account_support_link}
              href="/recuperar-senha"
            >
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
        </>
      )}
    </form>
  );
};

export default page;
