"use client";
// Utils
import styles from "./page.module.css";
import projectsLayout from "../layout.module.css";
import { useUser } from "@/context/userContext";

// Hooks
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/_lib/supabase/client";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Components
import SearchContainer from "@/app/components/SearchContainer/SearchContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Loading from "@/app/components/Loading/Loading";
import ProjectContainer from "@/app/components/ProjectContainer/ProjectContainer";
import Pagination from "@/app/components/Pagination/Pagination";

// Images
import {
  faAdd,
  faLightbulb,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const PROJECTS_PER_PAGE = 10;

const supabase = createClient();

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const showLoading = useSmartLoading(loading);
  const { userRole } = useUser();

  const totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

  const load_projects = useCallback(async (page = 0, query = "") => {
    setLoading(true);

    try {
      const from = page * PROJECTS_PER_PAGE;
      const to = from + PROJECTS_PER_PAGE - 1;

      let req = supabase
        .from("projetos")
        .select(
          `
          id,
          titulo_projeto,
          descricao,
          data_criacao,
          tipo_projeto_id,
          status_projeto_id,
          registro_ativo,
           usuarios!criado_por (id,nome),
          tipo_projeto!inner ( id, nome ),
          status_projeto ( id, nome ),
          projetos_tags (
            tags ( id, nome )
          )`,
          { count: "exact" },
        )
        .filter("registro_ativo", "eq", true)
        .eq("tipo_projeto.nome", "Demanda")
        .order("titulo_projeto", { ascending: true })
        .range(from, to);

      if (query) {
        req = req.ilike("titulo_projeto", `%${query}%`);
      }

      const { data, error, count } = await req;

      if (error) {
        toast.error("Erro ao carregar demandas.");
        return;
      }

      // isso aqui é uma obra de arte...
      const flattened = (data ?? []).map((project) => ({
        ...project,
        tags: project.projetos_tags?.map((p) => p.tags) ?? [],
      }));

      setProjects(flattened);
      setTotalProjects(count ?? 0);
    } catch (e) {
      toast.error(
        "Ocorreu um erro desconhecido ao carregar as demandas. Por favor tente novamente mais tarde",
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []); // array vazio: a função não depende de nenhum state/prop externo (supabase é constante do módulo)

  useEffect(() => {
    const timeout = setTimeout(() => {
      load_projects(currentPage, searchQuery);
    }, 0);

    return () => clearTimeout(timeout);
  }, [currentPage, searchQuery, load_projects]);

  const handle_search = (value) => {
    setSearchQuery(value);
    setCurrentPage(0); // volta pra primeira página ao buscar
  };

  return (
    <section style={{ width: "100%", height: "100%" }}>
      <section className={projectsLayout.projects_page_header}>
        <SearchContainer
          placeholder="Buscar demanda..."
          is_loading={loading}
          on_search={handle_search}
        />
        {(userRole === "admin" || userRole === "professor") && (
          <Link
            className={projectsLayout.register_project}
            href="/demandas/cadastrar"
          >
            <FontAwesomeIcon icon={faAdd} size="sm" />
            <span>Criar Demanda</span>
          </Link>
        )}
      </section>

      {showLoading ? (
        <section className={projectsLayout.projects_wrapper}>
          <Loading />
        </section>
      ) : loading ? null : (
        <>
          <section className={projectsLayout.projects_wrapper}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectContainer
                  key={project.id}
                  icon={faLightbulb}
                  project_obj={project}
                >
                  <section className={styles.user_project_info}>
                    <section className={styles.project_info}>
                      <p className={styles.info}>
                        Enviado por: {project.usuarios.nome}
                      </p>
                      <p className={styles.info}>
                        Criado em:{" "}
                        {new Date(project.data_criacao).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </section>

                    <Link
                      href={`/demandas/${project.id}`}
                      className={projectsLayout.project_details}
                    >
                      Ver detalhes
                    </Link>
                  </section>
                </ProjectContainer>
              ))
            ) : (
              <p>Nenhum projeto encontrado.</p>
            )}

            {/* PAGINAÇÃO */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </section>
        </>
      )}
    </section>
  );
};

export default Page;
