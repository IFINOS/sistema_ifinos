"use client";
// Utils
import styles from "../layout.module.css";

// Components
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/components/Loading/Loading";

// Images
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState } from "react";

const page = () => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isShowingPass, setIsShowingPass] = useState(false);
  const [isShowingConfirmPass, setIsShowingConfirmPass] = useState(false);

  /* NÃO DEIXAR CONSOLE.LOG NO CÓDIGO :) */

  const handle_update_password = async (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const password = form.get("password");
    const confirm_password = form.get("confirm_password");

    if (!password || password.length < 8) {
      setErrors({ password: "Senha deve ter pelo menos 8 caracteres." });
      return;
    }

    if (password !== confirm_password) {
      setErrors({ confirm_password: "As senhas não coincidem." });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Erro ao atualizar senha. Tente novamente.");
      setLoading(false);
      return;
    }

    toast.success("Senha atualizada com sucesso!");
    window.location.href = "/login";
  };

  return (
    <form onSubmit={handle_update_password} className={styles.auth_form}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className={styles.auth_form_title}>Atualizar Senha</h1>

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

          <button className={styles.auth_button} type="submit">
            Atualizar
          </button>
        </>
      )}
    </form>
  );
};

export default page;
