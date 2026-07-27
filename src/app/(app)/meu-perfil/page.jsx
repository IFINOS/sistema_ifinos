"use client";
// Utils
import { useUser } from "@/context/userContext";
import layout from "../layout.module.css";
import styles from "./page.module.css";

// Components
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Divider from "@/app/components/Divider/Divider";

// Images
import { faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";
import { createClient } from "@/_lib/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

const validate_inputs = ({ nome, email }) => {
  const errors = {};

  if (!nome || nome.trim().length < 3)
    errors.nome = "Nome deve ter pelo menos 3 caracteres.";
  else if (nome.trim().length > 30)
    errors.nome = "Nome deve ter no máximo 30 caracteres.";

  if (!email) errors.email = "Email é obrigatório.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Email inválido.";

  return errors;
};

// página não planejada no design mas segue os mesmos padrões de formulários do site
const page = () => {
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { user, loading: userLoading } = useUser();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setProfileLoading(false);
      return;
    }

    const load_user_info = async () => {
      setProfileLoading(true);

      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, nome")
          .eq("id", user.id)
          .single();

        if (error) {
          toast.error("Ocorreu um erro ao carregar o seu perfil.");
          return;
        }

        setUserData({ ...data, email: user.email });
      } catch (e) {
        toast.error(
          "Erro ao carregar o seu perfil. Tente novamente mais tarde",
        );
        console.error(e);
      } finally {
        setProfileLoading(false);
      }
    };

    load_user_info();
  }, [user, userLoading]);

  const loading = profileLoading || userLoading;
  const showLoading = useSmartLoading(loading);

  const handle_submit = async (e) => {
    e.preventDefault();
    setErrors({});

    const form = new FormData(e.currentTarget);
    const nome = form.get("nome")?.trim();
    const email = form.get("email")?.trim();

    const validationErrors = validate_inputs({ nome, email });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      if (nome !== userData.nome) {
        const { error: nomeError } = await supabase
          .from("usuarios")
          .update({ nome })
          .eq("id", user.id);

        if (nomeError) {
          toast.error("Erro ao atualizar o nome.");
          return;
        }
      }

      if (email !== userData.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        });

        if (emailError) {
          toast.error("Erro ao atualizar o email.");
          return;
        }

        toast.success(
          "Enviamos um link de confirmação para o novo email. A troca só será efetivada após a confirmação.",
        );
      }

      setUserData((prev) => ({ ...prev, nome, email }));
      toast.success("Perfil atualizado com sucesso!");
      location.reload();
    } catch (err) {
      toast.error("Erro desconhecido ao atualizar o perfil.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handle_delete_account = async () => {
    setDeleting(true);

    try {
      const response = await fetch("/api/perfil/deletar", { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Erro ao deletar sua conta.");
        return;
      }

      await supabase.auth.signOut();
      toast.success("Conta desativada com sucesso.");
      window.location.href = "/home";
    } catch (e) {
      toast.error("Erro desconhecido ao deletar sua conta.");
      console.error(e);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <section className={styles.my_profile_wrapper}>
      {showDeleteModal && (
        <div
          className={styles.modal_overlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modal_title}>Deletar conta</h2>
            <p className={styles.modal_description}>
              Tem certeza que deseja deletar sua conta? Esta ação não pode ser
              desfeita.
            </p>
            <section className={styles.modal_actions}>
              <button
                className={styles.modal_cancel_btn}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className={styles.modal_confirm_btn}
                onClick={handle_delete_account}
                disabled={deleting}
              >
                {deleting ? "Deletando..." : "Deletar"}
              </button>
            </section>
          </div>
        </div>
      )}

      {showLoading ? (
        <Loading />
      ) : loading ? null : userData ? (
        <section className={styles.my_profile_wrapper}>
          <h1 className={layout.main_app_title}>Meu Perfil</h1>

          <section className={styles.my_profile_user_info}>
            <h2 className={styles.username}>{userData.nome}</h2>
          </section>

          <Divider color="var(--foreground)" />

          <form className={styles.custom_profile_form} onSubmit={handle_submit}>
            <h2 className={styles.form_title}>Edite suas informações</h2>

            <section className={styles.input_wrapper}>
              <label htmlFor="nome" className={styles.custom_profile_label}>
                Nome
              </label>
              <section className={styles.input_content}>
                <input
                  className={`${styles.custom_profile_input} ${errors.nome ? styles.input_invalid : ""}`}
                  type="text"
                  name="nome"
                  id="nome"
                  defaultValue={userData.nome}
                />

                <div className={styles.icon_container}>
                  <FontAwesomeIcon
                    className={styles.input_icon}
                    icon={faUser}
                    size="lg"
                  />
                </div>
              </section>

              {errors.nome && (
                <span className={styles.field_error}>{errors.nome}</span>
              )}
            </section>

            <section className={styles.input_wrapper}>
              <label htmlFor="email" className={styles.custom_profile_label}>
                Email
              </label>
              <section className={styles.input_content}>
                <input
                  className={`${styles.custom_profile_input} ${errors.email ? styles.input_invalid : ""}`}
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={userData.email}
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

            <button
              className={styles.submit_btn}
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </form>

          <section className={styles.delete_account_wrapper}>
            <h2 className={styles.delete_account_title}>Deletar Conta</h2>

            <Divider color="var(--foreground)" />

            <button
              className={styles.delete_btn}
              onClick={() => setShowDeleteModal(true)}
            >
              Deletar conta
            </button>
          </section>
        </section>
      ) : (
        <p>Não foi possível carregar seu perfil.</p>
      )}
    </section>
  );
};

export default page;
