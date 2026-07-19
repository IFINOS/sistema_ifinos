"use client";
// Utils
import styles from "./page.module.css";

// Hooks
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";

// Components
import SearchContainer from "@/app/components/SearchContainer/SearchContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Loading from "@/app/components/Loading/Loading";
import ProjectContainer from "@/app/components/ProjectContainer/ProjectContainer";

// Images
import { faAdd, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const supaase = createClient();

const page = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const load_projects = async () => {
    setLoading(true);

    try {
      const { data, error } = await supaase
        .from("projetos")
        .select(
          `
            id,
            titulo_projeto,
            descricao,
            data_criacao,
            tipo_projeto_id,
            status_projeto_id,
            tipo_projeto!inner ( id, nome ),
            status_projeto ( id, nome ),
            projetos_tags (
              tags ( id, nome )
            )`,
        )
        .filter("registro_ativo", "eq", true)
        .eq("tipo_projeto.nome", "Projeto");

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
    load_projects();
  }, []);

  const handle_search = () => {};

  return (
    <>
      <section className={styles.projects_page_header}>
        <SearchContainer
          placeholder="Buscar projetos..."
          is_loading={loading}
          on_search={handle_search}
        />
        <Link className={styles.register_project} href="/projetos/cadastrar">
          <FontAwesomeIcon icon={faAdd} size="sm" />
          <span>Adicionar Projeto</span>
        </Link>
      </section>

      {loading ? (
        <Loading />
      ) : (
        <section className={styles.projects_wrapper}>
          {projects.map((project) => (
            <ProjectContainer
              key={project.id}
              icon={faScrewdriverWrench}
              project_obj={project}
            >
              <Link
                href={`/projetos/${project.id}`}
                className={styles.project_details}
              >
                Ver detalhes
              </Link>
            </ProjectContainer>
          ))}
        </section>
      )}
    </>
  );
};

export default page;
