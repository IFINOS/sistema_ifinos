"use client";
// Utils
import { useUser } from "@/context/userContext";
import layout from "../layout.module.css";
import styles from "./page.module.css";

// Components
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";

// Hooks
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";
import { createClient } from "@/_lib/supabase/client";
import { useEffect, useState } from "react";

// página não planejada no design mas segue os mesmos padrões de formulários do site
const page = () => {
  const supabase = createClient();
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { user, loading: userLoading } = useUser();

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

        setUserData(data);
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

  return (
    <section className={styles.my_profile_wrapper}>
      {showLoading ? (
        <Loading />
      ) : loading ? // ainda carregando de verdade, só que dentro da janela de delay do
      // useSmartLoading — não mostra nada aqui pra evitar o "flash" do
      // fallback de erro aparecendo antes da hora
      null : userData ? (
        <section className={styles.my_profile_wrapper}>
          <h1 className={layout.main_app_title}>Meu Perfil</h1>

          <section className={styles.my_profile_user_info}>
            <h2>{userData.nome}</h2>
          </section>
        </section>
      ) : (
        <p>Não foi possível carregar seu perfil.</p>
      )}
    </section>
  );
};

export default page;
