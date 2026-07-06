"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState, useEffect } from "react";

// Utils
import styles from "./page.module.css";

// Images
import {
  faUser,
  faPen,
  faTrash,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

// Components
import SearchContainer from "@/app/components/SearchContainer/SearchContainer";
import Divider from "@/app/components/Divider/Divider";
import { toast } from "sonner";
import Loading from "@/app/components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

const page = () => {
  const [loading, setLoading] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // NÃO DEIXAR CONSOLE.LOG :)

  useEffect(() => {
    const load_users = async () => {
      setLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .range(0, 0); // maximizando em 10 usuários por chamada e separando em páginas de usuários

        if (error) {
          console.error(error);
          return;
        }

        // console.log(data);
        setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load_users();
  }, []);

  const handle_search = (value) => {
    if (!value) {
      toast.error("Entre com um valor para a pesquisa");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    try {
      setSearchQuery(value);
    } catch (e) {
      throw new Error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SearchContainer
        placeholder="Buscar usuários..."
        is_loading={loading}
        on_search={handle_search}
      />

      {loading ? (
        <Loading />
      ) : (
        <section className={styles.users_wrapper}>
          {users ? (
            <>
              {users.map((user) => (
                <section key={user?.id} className={styles.user_container}>
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
                      <p>{user.nome}</p>
                    </section>

                    <section className={styles.admin_options_container}>
                      <button className={styles.admin_option}>
                        <FontAwesomeIcon
                          icon={faPen}
                          color="var(--foreground)"
                          size="xl"
                        />
                      </button>

                      <button className={styles.admin_option}>
                        <FontAwesomeIcon
                          icon={faTrash}
                          color="var(--primary_red)"
                          size="xl"
                        />
                      </button>
                    </section>
                  </header>

                  <Divider color="var(--foreground)" />

                  <section className={styles.edit_infos_container}>
                    <section className={styles.input_wrapper}>
                      <label htmlFor="email" className={styles.edit_info_label}>
                        Trocar email
                      </label>

                      <section className={styles.input_content}>
                        <input
                          className={`${styles.edit_info_input} ${errors.email ? styles.input_invalid : ""}`}
                          type="email"
                          name="email"
                          placeholder=""
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
                      <label htmlFor="email" className={styles.edit_info_label}>
                        Trocar nome do usuário
                      </label>

                      <section className={styles.input_content}>
                        <input
                          className={`${styles.edit_info_input} ${errors.email ? styles.input_invalid : ""}`}
                          type="text"
                          name="nome"
                          placeholder=""
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
                      <label htmlFor="email" className={styles.edit_info_label}>
                        Trocar o grupo do usuário
                      </label>

                      <section className={styles.input_content}>
                        <input
                          className={`${styles.edit_info_input} ${errors.email ? styles.input_invalid : ""}`}
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
                    </section>
                  </section>
                </section>
              ))}
            </>
          ) : (
            <p>não</p>
          )}
        </section>
      )}
    </>
  );
};

export default page;
