"use client";
// Utils
import styles from "./page.module.css";
import layout from "../../layout.module.css";
import { useUser } from "@/context/userContext";

// Components
import { toast } from "sonner";
import BackButton from "@/app/components/BackButton/BackButton";
import Loading from "@/app/components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/_lib/supabase/client";
import { useRouter } from "next/navigation";

const page = () => {
  const supabase = createClient();
  const { id } = useParams();
  const { user, userRole, userLoading } = useUser();
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const load_project_from_id = async (id) => {
      setProjectLoading(true);

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
            criado_por,
            tipo_projeto_id,
            status_projeto_id,
            registro_ativo,
            tipo_projeto ( id, nome ),
            status_projeto ( id, nome ),
            projetos_tags (
              tags ( id, nome )
            ),
            usuarios_projetos (
              funcao,
              usuarios ( id, nome, avatar_url )
            )
          `,
          )
          .eq("id", id)
          .single();

        if (!data.registro_ativo) router.push("/projetos");

        if (error) {
          toast.error("Projeto não encontrado.");
          return;
        }

        const flattened = {
          ...data,
          tags: (data.projetos_tags ?? []).flatMap((pt) =>
            Array.isArray(pt.tags) ? pt.tags : pt.tags ? [pt.tags] : [],
          ),
          integrantes:
            data.usuarios_projetos?.map((up) => ({
              ...up.usuarios,
              funcao: up.funcao,
            })) ?? [],
        };

        setProjectData(flattened);
      } catch (e) {
        toast.error(
          "Ocorreu um erro desconhecido. Tente novamente mais tarde.",
        );
        console.error(e);
      } finally {
        setProjectLoading(false);
      }
    };

    load_project_from_id(id);
  }, [id]);

  // só considera "pronto" quando os dados do projeto E o usuário já resolveram
  const loading = projectLoading || userLoading;

  const canDelete =
    !loading &&
    projectData &&
    (userRole === "admin" || projectData.criado_por === user?.id);

  const canEdit =
    !loading &&
    projectData &&
    (userRole === "admin" ||
      projectData.usuarios_projetos?.some(
        (up) => up.usuarios?.id === user?.id,
      ));

  const handle_delete = async (projetoId) => {
    try {
      // busca o id do status "Encerrado" (ou o nome que você usar pra "desativado")
      const { data: statusEncerrado, error: statusError } = await supabase
        .from("status_projeto")
        .select("id")
        .eq("nome", "Em pausa")
        .single();

      if (statusError || !statusEncerrado) {
        toast.error("Erro ao identificar o status de encerramento.");
        return;
      }

      const { error } = await supabase
        .from("projetos")
        .update({
          registro_ativo: false,
          status_projeto_id: statusEncerrado.id,
        })
        .eq("id", projetoId);

      if (error) {
        toast.error("Erro ao apagar projeto.");
        return;
      }

      toast.success("Projeto apagado com sucesso!");
    } catch (e) {
      toast.error("Erro desconhecido ao apagar projeto.");
      console.error(e);
    }
  };

  return (
    <section className={styles.project_details_wrapper}>
      {loading ? (
        <Loading />
      ) : projectData ? (
        <section className={styles.project_details_wrapper}>
          <BackButton route="/projetos" />

          <section className={styles.project_details_header}>
            <h1 className={layout.main_app_title}>
              {projectData.titulo_projeto}
            </h1>

            {canDelete && (
              <button
                type="button"
                className={styles.delete_btn}
                onClick={() => handle_delete(projectData.id)}
              >
                <FontAwesomeIcon icon={faTrash} size="xl" />
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                className={styles.edit_btn}
                onClick={() => router.push(`/projetos/${id}/editar`)}
              >
                <FontAwesomeIcon icon={faPenToSquare} size="xl" />
              </button>
            )}
          </section>

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
