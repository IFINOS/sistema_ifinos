"use client";
// Utils
import styles from "../layout.module.css";

// Components
import { toast } from "sonner";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/components/Loading/Loading";
import Divider from "@/app/components/Divider/Divider";

// Images
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState } from "react";

const page = () => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isShowingPass, setIsShowingPass] = useState(false);
  const [isShowingConfirmPass, setIsShowingConfirmPass] = useState(false);

  const validate_inputs = ({ name, email, password, confirm_password }) => {
    const errors = {};

    if (!name || name.trim().length < 3)
      errors.name = "Nome deve ter pelo menos 3 caracteres.";
    else if (name.trim().length > 30)
      errors.name = "Nome deve ter no máximo 30 caracteres.";

    if (!email) errors.email = "Email é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Email inválido.";

    if (!password || password.length < 8)
      errors.password = "Senha deve ter pelo menos 8 caracteres.";

    if (password !== confirm_password)
      errors.confirm_password = "As senhas não coincidem.";

    return errors;
  };

  /* NÃO DEIXAR CONSOLE.LOG NO CÓDIGO :) */

  const handle_signup = async (e) => {
    e.preventDefault();

    setErrors({});

    const form = new FormData(e.currentTarget);
    // o get acessa o valor do "name" no input
    const name = form.get("name")?.trim();
    const email = form.get("email")?.trim();
    const password = form.get("password");
    const confirm_password = form.get("confirm_password");
    const remember = form.get("remember_user") === "on";

    const errors = validate_inputs({ name, email, password, confirm_password });
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setLoading(true);

    localStorage.setItem("remember_user", JSON.stringify(remember));

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/confirmar-email`,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado.");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
      setLoading(false);
      return;
    }

    // Supabase não retorna "error" quando o email já existe e já foi confirmado
    // (proteção contra email enumeration). Nesse caso, "identities" vem vazio
    // também já resolve o problema do email já cadastrado com google :)
    if (data?.user?.identities?.length === 0) {
      toast.error(
        "Este email já está cadastrado. Faça login ou recupere sua senha.",
      );
      setLoading(false);
      return;
    }

    sessionStorage.setItem("pending_email", email);
    window.location.href = "/confirmar-email";
  };

  /*
    o cadastro com google usa o mesmo fluxo OAuth do login
    o supabase cria a conta automaticamente se o email ainda não existir
    ou faz login se o email já estiver cadastrado
    após autenticar, redireciona para /auth/callback que troca o code por sessão
    e redireciona para /home
  */
  const handle_google_signup = async () => {
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/home`,
      },
    });

    if (error) {
      toast.error("Erro ao cadastrar com o Google. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle_signup} className={styles.auth_form}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className={styles.auth_form_title}>Cadastrar-se</h1>

          <section className={styles.input_wrapper}>
            <label htmlFor="email" className={styles.auth_label}>
              Email
            </label>

            <section className={styles.input_content}>
              <input
                className={`${styles.auth_input} ${errors.email ? styles.input_invalid : ""}`}
                type="email"
                name="email"
                placeholder="exemplo@gmail.com"
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
            <label htmlFor="name" className={styles.auth_label}>
              Nome
            </label>

            <section className={styles.input_content}>
              <input
                className={`${styles.auth_input} ${errors.name ? styles.input_invalid : ""}`}
                type="text"
                name="name"
                placeholder="Máximo de 30 caracteres"
                maxLength={30}
              />
              <div className={styles.icon_container}>
                <FontAwesomeIcon
                  className={styles.input_icon}
                  icon={faUser}
                  size="lg"
                />
              </div>
            </section>

            {errors.name && (
              <span className={styles.field_error}>{errors.name}</span>
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
                placeholder="Mínimo de 8 caracteres"
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

          <section className={styles.input_wrapper}>
            <label htmlFor="confirm_password" className={styles.auth_label}>
              Confirmar Senha
            </label>

            <section className={styles.input_content}>
              <input
                className={`${styles.auth_input} ${errors.confirm_password ? styles.input_invalid : ""}`}
                type={isShowingConfirmPass ? "text" : "password"}
                name="confirm_password"
              />
              <div className={styles.icon_container}>
                <FontAwesomeIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsShowingConfirmPass(!isShowingConfirmPass)}
                  className={styles.input_icon}
                  icon={isShowingConfirmPass ? faEyeSlash : faEye}
                  size="lg"
                />
              </div>
            </section>

            {errors.confirm_password && (
              <span className={styles.field_error}>
                {errors.confirm_password}
              </span>
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
            Criar Conta
          </button>

          <section className={styles.auth_options_header}>
            {/* transformar o divider em componente? */}
            <Divider color="var(--primary_cyan)" />
            <p className={styles.divider_text}>Ou</p>
            <Divider color="var(--primary_cyan)" />
          </section>

          <section className={styles.auth_options_container}>
            <button
              type="button"
              className={styles.auth_option}
              onClick={handle_google_signup}
            >
              <FontAwesomeIcon icon={faGoogle} size="lg" />
              Criar conta com o Google
            </button>

            <Link className={styles.account_support_link} href="/login">
              Já possui uma conta? Faça Login
            </Link>
          </section>
        </>
      )}
    </form>
  );
};

export default page;
