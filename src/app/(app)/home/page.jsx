"use client";
// Utils
import layout from "../(projects)/layout.module.css";
import styles from "./page.module.css";
import { useUser } from "@/context/userContext";

// Components
import SearchContainer from "@/app/components/SearchContainer/SearchContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";
import Link from "next/link";
import NewsContainer from "@/app/components/NewsContainer/NewsContainer";
import Pagination from "@/app/components/Pagination/Pagination";

// Images
import { faAdd } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";
import { createClient } from "@/_lib/supabase/client";
import { useState, useEffect, useCallback } from "react";

const NEWS_PER_PAGE = 8; // a estrutura das notícias vai ser maior do que os outros componentes de projetos/demandas

const supabase = createClient();

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [totalNews, setTotalNews] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const showLoading = useSmartLoading(loading);
  const { userRole } = useUser();

  const totalPages = Math.ceil(totalNews / NEWS_PER_PAGE);

  const load_news = useCallback(async (page = 0, query = "") => {
    setLoading(true);

    try {
      const from = page * NEWS_PER_PAGE;
      const to = from + NEWS_PER_PAGE - 1;

      let req = supabase
        .from("noticias")
        .select(
          `
            id,
            titulo_publicacao,
            resumo,
            usuario_id,
            registro_ativo,
            data_publicacao
        `,
          { count: "exact" },
        )
        .filter("registro_ativo", "eq", true)
        .not("data_publicacao", "is", null)
        .order("data_publicacao", { ascending: false })
        .range(from, to);

      if (query) {
        req = req.ilike("titulo_publicacao", `%${query}%`);
      }

      const { data, error, count } = await req;

      if (error) {
        toast.error("Erro ao carregar notícias.");
        return;
      }

      setNews(data ?? []);
      setTotalNews(count ?? 0);
    } catch (e) {
      toast.error(
        "Ocorreu um erro desconhecido ao carregar as notícias. Por favor tente novamente mais tarde",
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load_news(currentPage, searchQuery);
    }, 0);

    return () => clearTimeout(timeout);
  }, [currentPage, searchQuery, load_news]);

  const handle_search = (value) => {
    setSearchQuery(value);
    setCurrentPage(0);
  };

  return (
    <section style={{ width: "100%", height: "100%" }}>
      <section className={layout.news_page_header}>
        <SearchContainer
          placeholder="Buscar notícias..."
          is_loading={loading}
          on_search={handle_search}
        />
        {(userRole === "admin" || userRole === "professor") && (
          <Link className={layout.register_news} href="/home/publicar">
            <FontAwesomeIcon icon={faAdd} size="sm" />
            <span>Publicar Notícia</span>
          </Link>
        )}
      </section>

      {showLoading ? (
        <section className={layout.news_wrapper}>
          <Loading />
        </section>
      ) : loading ? null : (
        <section className={layout.news_wrapper}>
          {news.length > 0 ? (
            news.map((newsData) => (
              <NewsContainer key={newsData.id} news_obj={newsData} />
            ))
          ) : (
            <p>Nenhuma notícia encontrada.</p>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      )}
    </section>
  );
};

export default Page;
