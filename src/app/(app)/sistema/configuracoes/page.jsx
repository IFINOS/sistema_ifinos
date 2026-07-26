"use client";
// Hooks
import { useEffect, useState } from "react";

// Images
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/components/Loading/Loading";

// Utils
import styles from "./page.module.css";
import { createClient } from "@/_lib/supabase/client";
import { toast } from "sonner";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

const page = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const showLoading = useSmartLoading();

  useEffect(() => {
    const load_email = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("configuracoes_sistema")
          .select("email_responsavel_produtos");

        if (error) {
          toast.error("Erro ao carregar email.");
          return;
        }

        setInputValue(data[0].email_responsavel_produtos);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load_email();
  }, []);

  const handle_submit = async (e) => {
    e.preventDefault();

    if (!inputValue) {
      setInputError("Email é obrigatório.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      setInputError("Email inválido.");
      return;
    }

    try {
      setLoading(true);
      setInputError("");

      const { error } = await supabase
        .from("configuracoes_sistema")
        .update({
          email_responsavel_produtos: inputValue,
        })
        .eq("id", "9cbc9c0f-a668-448d-8874-58a67832ec05"); // absolute cinema

      if (error) {
        toast.error("Erro ao atualizar o email");
        console.error(error);
        return;
      }

      toast.success("Email atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        display: "flex",
        alignItems: "flex-start",
        textAlign: "start",
      }}
    >
      {showLoading ? (
        <Loading />
      ) : loading ? null : (
        <form onSubmit={handle_submit}>
          <section className={styles.input_wrapper}>
            <label htmlFor="email" className={styles.edit_info_label}>
              Editar email do responsável pelo merchandise
            </label>
            <section className={styles.input_content}>
              <input
                className={`${styles.edit_info_input} ${inputError ? styles.input_invalid : ""}`}
                type="email"
                id="email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className={styles.icon_container}>
                <FontAwesomeIcon
                  className={styles.input_icon}
                  icon={faEnvelope}
                  size="lg"
                />
              </div>
            </section>

            {inputError && (
              <span className={styles.field_error}>{inputError}</span>
            )}
          </section>

          <button className={styles.save_btn} type="submit">
            Atualizar
          </button>
        </form>
      )}
    </section>
  );
};

export default page;
