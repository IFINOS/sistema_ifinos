"use client";
// Utils
import styles from "./page.module.css";
import layout from "../../layout.module.css";

// Components
import { toast } from "sonner";
import Loading from "@/app/components/Loading/Loading";
import BackButton from "@/app/components/BackButton/BackButton";

// Hooks
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/_lib/supabase/client";

const supabase = createClient();

const page = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);

  // NÃO DEIXAR CONSOLE.LOG() NO CÓDIGO :)
  // VEZES EM QUE DEIXEI CONSOLE.LOG() NO CÓDIGO(): 1

  useEffect(() => {
    const load_project_from_id = async (id) => {
      try {
        if (!id) {
          toast.error("Id não encontrado");
          return;
        }

        const { data, error } = await supabase
          .from("projetos")
          .select(
            `
            id,
            titulo_projeto,
            descricao,
            data_criacao,
            tipo_projeto_id,
            status_projeto_id,
            tipo_projeto ( id, nome ),
            status_projeto ( id, nome ),
            projetos_tags (
              tags ( id, nome )
            ),
            usuarios_projetos (
              funcao,
              usuarios ( id, nome, avatar_url )
            )`,
          )
          .eq("id", id)
          .single();

        if (error) {
          toast.error("Projeto não encontrado.");
          return;
        }

        const flattened = {
          ...data,
          tags: data.projetos_tags?.map((p) => p.tags) ?? [],
          integrantes: data.usuarios_projetos?.map((p) => ({
            ...p.usuarios,
            funcao: p.funcao,
          })),
        };

        setProjectData(flattened);
      } catch (e) {
        toast.error(
          "Ocorreu um erro desconhecido. Tente novamente mais tarde.",
        );
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load_project_from_id(id);
  }, [id]);

  return (
    <section>
      {loading ? (
        <Loading />
      ) : projectData ? (
        <section className={styles.project_details_wrapper}>
          <BackButton />

          <h1 className={layout.main_app_title}>
            {projectData.titulo_projeto}
          </h1>

          <section className={styles.project_tags_wrapper}>
            {projectData.tags.map((tag) => (
              <span key={tag.id} className={styles.project_tag}>
                {tag.nome}
              </span>
            ))}
          </section>

          <p className={styles.project_status_wrapper}>
            Status do projeto:{" "}
            <span className={styles.project_status}>
              {projectData.status_projeto.nome}
            </span>
          </p>

          <p className={styles.project_description}>{projectData.descricao}</p>

          <section className={styles.integrantes_wrapper}>
            <h2 style={{ marginBottom: ".6rem" }}>Integrantes</h2>
            <section className={styles.integrantes_list}>
              {projectData.integrantes.map((integrante) => (
                <div
                  key={integrante.id}
                  className={styles.integrante_container}
                >
                  <span>{integrante.nome}</span>
                  <div className={styles.integrante_divider}></div>
                  <span className={styles.integrante_funcao}>
                    {integrante.funcao}
                  </span>
                </div>
              ))}
            </section>
          </section>
        </section>
      ) : (
        <p>Projeto não encontrado.</p>
      )}
    </section>
  );
};

export default page;
