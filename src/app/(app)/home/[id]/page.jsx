"use client";
// Utils
import styles from "./page.module.css";
import { useUser } from "@/context/userContext";

// Hooks
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/_lib/supabase/client";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Components
import Loading from "@/app/components/Loading/Loading";
import BackButton from "@/app/components/BackButton/BackButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { toast } from "sonner";

// Images
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const supabase = createClient();

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState(null);
  const [deletingNewsId, setDeletingNewsId] = useState(null);
  const { userRole, user } = useUser();
  const router = useRouter();
  const { id } = useParams();

  const showLoading = useSmartLoading(loading);

  const search_news = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("noticias")
        .select(
          `id, 
          titulo_publicacao,
          resumo,  
          usuario_id (nome),
          projeto_id (titulo_projeto), 
          registro_ativo, 
          img_url, 
          data_publicacao`,
        )
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Erro ao carregar a notícia.");
        return;
      }

      if (!data.registro_ativo) {
        router.push("/home");
        return;
      }

      setNews(data);
    } catch (e) {
      toast.error(
        "Ocorreu um erro desconhecido ao carregar as notícias. Por favor tente novamente mais tarde",
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      search_news();
    }, 0);

    return () => clearTimeout(timeout);
  }, [search_news]);

  const handle_delete = async () => {
    try {
      const { error } = await supabase
        .from("noticias")
        .update({
          registro_ativo: false,
        })
        .eq("id", deletingNewsId);

      if (error) {
        toast.error("Erro ao apagar notícia.");
        return;
      }

      toast.success("Notícia excluída com sucesso!");
      router.push("/home");
    } catch (e) {
      toast.error("Erro desconhecido ao deletar a notícia.");
      console.error(e);
    }
  };

  const canDelete =
    !loading && news && (userRole === "admin" || news.usuario_id === user?.id);

  const canEdit =
    !loading && news && (userRole === "admin" || news.usuario_id === user?.id);

  const format_date = (date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section style={{ width: "100%", height: "100%" }}>
      {/* MODAL DE CONFIRMAÇÃO DE DELETE */}
      {deletingNewsId && (
        <div
          className={styles.modal_overlay}
          onClick={() => setDeletingNewsId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modal_title}>Deletar notícia</h2>
            <p className={styles.modal_description}>
              Tem certeza que deseja deletar esta notícia?
            </p>
            <section className={styles.modal_actions}>
              <button
                className={styles.modal_cancel_btn}
                onClick={() => setDeletingProjectId(null)}
              >
                Não Deletar Notícia
              </button>
              <button
                className={styles.modal_confirm_btn}
                onClick={handle_delete}
              >
                Deletar Notícia
              </button>
            </section>
          </div>
        </div>
      )}

      {showLoading ? (
        <section className={styles.news_details_wrapper}>
          <Loading />
        </section>
      ) : loading ? null : news ? (
        <section>
          <section className={styles.news_details_wrapper}>
            <BackButton />
            <header className={styles.news_details_header}>
              <h1 className={styles.news_title}>{news.titulo_publicacao}</h1>

              <section className={styles.news_options}>
                {canDelete && (
                  <button
                    type="button"
                    className={styles.delete_btn}
                    onClick={() => setDeletingNewsId(news.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} size="lg" />
                  </button>
                )}

                {canEdit && (
                  <button
                    type="button"
                    className={styles.edit_btn}
                    onClick={() => router.push(`/home/${id}/editar`)}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} size="xl" />
                  </button>
                )}
              </section>

              <p className={styles.publication_date}>
                {format_date(news.data_publicacao)}
              </p>

              <p>
                Escrito por:{" "}
                <span className={styles.autor}>{news.usuario_id.nome}</span>
              </p>

              <p>
                Projeto relacionado:{" "}
                <span className={styles.related_project}>
                  {news.projeto_id?.titulo_projeto}
                </span>
              </p>
            </header>

            {news.img_url && (
              <section className={styles.image_wrapper}>
                <Image
                  src={news.img_url}
                  fill
                  style={{
                    objectFit: "contain",
                  }}
                  alt="Foto Notícia"
                  loading="eager"
                />
              </section>
            )}

            <section className={styles.article}>{news.resumo}</section>
          </section>
        </section>
      ) : (
        <p>Notícia não encontrada.</p>
      )}
    </section>
  );
};

export default Page;
