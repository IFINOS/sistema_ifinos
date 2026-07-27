"use client";
// Utils
import projectsLayout from "../layout.module.css";
import { useUser } from "@/context/userContext";

// Hooks
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Components
import SearchContainer from "@/app/components/SearchContainer/SearchContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Loading from "@/app/components/Loading/Loading";
import ProjectContainer from "@/app/components/ProjectContainer/ProjectContainer";

// Images
import {
  faAdd,
  faScrewdriverWrench,
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

  const load_projects = async (page = 0, query = "") => {
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
          tipo_projeto!inner ( id, nome ),
          status_projeto ( id, nome ),
          projetos_tags (
            tags ( id, nome )
          )`,
          { count: "exact" },
        )
        .filter("registro_ativo", "eq", true)
        .eq("tipo_projeto.nome", "Projeto")
        .order("titulo_projeto", { ascending: true })
        .range(from, to);

      if (query) {
        req = req.ilike("titulo_projeto", `%${query}%`);
      }

      const { data, error, count } = await req;

      if (error) {
        toast.error("Erro ao carregar projetos.");
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
        "Ocorreu um erro desconhecido ao carregar os projetos. Por favor tente novamente mais tarde",
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load_projects(currentPage, searchQuery);
    }, 0);

    return () => clearTimeout(timeout);
  }, [currentPage, searchQuery]);

  const handle_search = (value) => {
    setSearchQuery(value);
    setCurrentPage(0); // volta pra primeira página ao buscar
  };

  return (
    <section style={{ width: "100%", height: "100%" }}>
      <section className={projectsLayout.projects_page_header}>
        <SearchContainer
          placeholder="Buscar projetos..."
          is_loading={loading}
          on_search={handle_search}
        />
        {(userRole === "admin" || userRole === "professor") && (
          <Link
            className={projectsLayout.register_project}
            href="/projetos/cadastrar"
          >
            <FontAwesomeIcon icon={faAdd} size="sm" />
            <span>Adicionar Projeto</span>
          </Link>
        )}
      </section>

      {showLoading ? (
        <section className={projectsLayout.projects_wrapper}>
          <Loading />
        </section>
      ) : loading ? null : (
        <section>
          <section className={projectsLayout.projects_wrapper}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectContainer
                  key={project.id}
                  icon={faScrewdriverWrench}
                  project_obj={project}
                >
                  <Link
                    href={`/projetos/${project.id}`}
                    className={projectsLayout.project_details}
                  >
                    Ver detalhes
                  </Link>
                </ProjectContainer>
              ))
            ) : (
              <p>Nenhum projeto encontrado.</p>
            )}
          </section>

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <section className={projectsLayout.pagination}>
              <button
                className={projectsLayout.pagination_btn}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${projectsLayout.pagination_btn} ${
                    currentPage === i
                      ? projectsLayout.pagination_btn_active
                      : ""
                  }`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className={projectsLayout.pagination_btn}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </section>
          )}
        </section>
      )}
    </section>
  );
};

export default Page;
