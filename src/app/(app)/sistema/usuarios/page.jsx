"use client";
// Hooks
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Utils
import styles from "./page.module.css";

// Images
import {
  faUser,
  faPen,
  faTrash,
  faEnvelope,
  faFloppyDisk,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Components
import SearchContainer from "@/app/components/SearchContainer/SearchContainer";
import Divider from "@/app/components/Divider/Divider";
import { toast } from "sonner";
import Loading from "@/app/components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

// NÃO DEIXAR CONSOLE.LOG :)

const USERS_PER_PAGE = 10;

// instância única fora do componente
const supabase = createClient();

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editForm, setEditForm] = useState({
    email: "",
    nome: "",
    grupoId: "",
  });
  const showLoading = useSmartLoading(loading);

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  const load_groups = async () => {
    try {
      const { data, error } = await supabase.from("grupos").select("id, nome");
      if (error) {
        console.error(error);
        return;
      }
      setRoles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const load_users = async (page = 0, query = "") => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/usuarios?page=${page}&query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Erro ao carregar usuários.");
        return;
      }

      setUsers(result.users);
      setTotalUsers(result.count ?? 0);
    } catch (e) {
      toast.error("Erro ao carregar usuários");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load_data = async () => {
      setLoading(true);
      await Promise.all([load_users(0), load_groups()]);
      setLoading(false);
    };
    load_data();
  }, []);

  // recarrega quando muda de página ou busca
  useEffect(() => {
    const timeout = setTimeout(() => {
      load_users(currentPage, searchQuery);
    }, 0);

    return () => clearTimeout(timeout);
  }, [currentPage, searchQuery]);

  const handle_search = (value) => {
    setSearchQuery(value);
    setCurrentPage(0); // volta para a primeira página ao buscar
  };

  const handle_edit_open = (user) => {
    setEditingUserId(editingUserId === user.id ? null : user.id);
    setEditForm({
      email: user.email ?? "",
      nome: user.nome ?? "",
      grupoId: "",
    });
    setErrors({});
  };

  const handle_save = async (userId) => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: editForm.email || undefined,
          nome: editForm.nome || undefined,
          grupoId: editForm.grupoId || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Erro ao salvar alterações.");
        return;
      }

      toast.success("Usuário atualizado com sucesso!");
      setEditingUserId(null);
      location.reload();
      await load_users(currentPage, searchQuery);
    } catch (e) {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handle_delete = async () => {
    if (!deletingUserId) return;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/usuarios?userId=${deletingUserId}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Erro ao deletar usuário");
        return;
      }

      toast.success("Usuário deletado com sucesso!");
      setDeletingUserId(null);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUserId));
      setTotalUsers((prev) => prev - 1);
    } catch (e) {
      toast.error("Erro ao deletar usuário.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MODAL DE CONFIRMAÇÃO DE DELETE */}
      {deletingUserId && (
        <div
          className={styles.modal_overlay}
          onClick={() => setDeletingUserId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modal_title}>Deletar usuário</h2>
            <p className={styles.modal_description}>
              Tem certeza que deseja deletar este usuário?
            </p>
            <section className={styles.modal_actions}>
              <button
                className={styles.modal_cancel_btn}
                onClick={() => setDeletingUserId(null)}
              >
                Não Deletar Usuário
              </button>
              <button
                className={styles.modal_confirm_btn}
                onClick={handle_delete}
              >
                Deletar Usuário
              </button>
            </section>
          </div>
        </div>
      )}

      <section style={{ width: "min(100%, 50rem)", maxWidth: "100%" }}>
        <SearchContainer
          placeholder="Buscar usuários..."
          is_loading={loading}
          on_search={handle_search}
        />
      </section>

      {showLoading ? (
        <Loading />
      ) : loading ? null : (
        <>
          <section className={styles.users_wrapper}>
            {users.length > 0 ? (
              users.map((user) => (
                <section key={user.id} className={styles.user_container}>
                  <header className={styles.user_container_header}>
                    <section className={styles.user_name}>
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          width={35}
                          height={35}
                          style={{ objectFit: "contain", borderRadius: "50%" }}
                          alt="User Avatar"
                          loading="lazy"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUser}
                          size="xl"
                          color="var(--foreground)"
                        />
                      )}
                      <p style={{ fontWeight: 500 }}>{user.nome}</p>
                    </section>

                    <section className={styles.admin_options_container}>
                      <button
                        className={styles.admin_option}
                        onClick={() => handle_edit_open(user)}
                      >
                        <FontAwesomeIcon
                          icon={faPen}
                          color="var(--foreground)"
                          size="xl"
                        />
                      </button>

                      <button
                        className={styles.admin_option}
                        onClick={() => setDeletingUserId(user.id)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          color="var(--primary_red)"
                          size="xl"
                        />
                      </button>
                    </section>
                  </header>

                  {editingUserId === user.id && (
                    <>
                      <Divider color="var(--foreground)" />

                      <section className={styles.edit_infos_container}>
                        <section className={styles.input_wrapper}>
                          <label
                            htmlFor={`email-${user.id}`}
                            className={styles.edit_info_label}
                          >
                            Trocar email
                          </label>
                          <section className={styles.input_content}>
                            <input
                              className={`${styles.edit_info_input} ${errors.email ? styles.input_invalid : ""}`}
                              type="email"
                              id={`email-${user.id}`}
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                            />
                            <div className={styles.icon_container}>
                              <FontAwesomeIcon
                                className={styles.input_icon}
                                icon={faEnvelope}
                                size="lg"
                              />
                            </div>
                          </section>
                        </section>

                        <section className={styles.input_wrapper}>
                          <label
                            htmlFor={`nome-${user.id}`}
                            className={styles.edit_info_label}
                          >
                            Trocar nome do usuário
                          </label>
                          <section className={styles.input_content}>
                            <input
                              className={`${styles.edit_info_input} ${errors.nome ? styles.input_invalid : ""}`}
                              type="text"
                              id={`nome-${user.id}`}
                              value={editForm.nome}
                              placeholder="Máximo de 64 caracteres"
                              maxLength={64}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  nome: e.target.value,
                                }))
                              }
                            />
                            <div className={styles.icon_container}>
                              <FontAwesomeIcon
                                className={styles.input_icon}
                                icon={faUser}
                                size="lg"
                              />
                            </div>
                          </section>
                        </section>

                        <section className={styles.input_wrapper}>
                          <label
                            htmlFor={`group-${user.id}`}
                            className={styles.edit_info_label}
                          >
                            Trocar o grupo do usuário
                          </label>
                          <section className={styles.input_content}>
                            <select
                              style={{ cursor: "pointer" }}
                              className={styles.edit_info_input}
                              id={`group-${user.id}`}
                              value={editForm.grupoId}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  grupoId: e.target.value,
                                }))
                              }
                            >
                              <option value="">{user.grupo_nome}</option>
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.nome}
                                </option>
                              ))}
                            </select>
                            <div className={styles.icon_container}>
                              <FontAwesomeIcon
                                className={styles.input_icon}
                                icon={faUser}
                                size="lg"
                              />
                            </div>
                          </section>
                        </section>
                      </section>

                      <button
                        className={styles.save_btn}
                        onClick={() => handle_save(user.id)}
                      >
                        <FontAwesomeIcon icon={faFloppyDisk} />
                        <span>Salvar</span>
                      </button>
                    </>
                  )}
                </section>
              ))
            ) : (
              <p>Nenhum usuário encontrado.</p>
            )}
          </section>

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <section className={styles.pagination}>
              <button
                className={styles.pagination_btn}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.pagination_btn} ${currentPage === i ? styles.pagination_btn_active : ""}`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className={styles.pagination_btn}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </section>
          )}
        </>
      )}
    </>
  );
};

export default Page;
