"use client";
// Utils
import projectLayout from "../../layout.module.css";
import layout from "../../../layout.module.css";
import { useUser } from "@/context/userContext";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

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
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const showLoading = useSmartLoading();
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

        if (!data.registro_ativo) router.push("/demandas");

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
    (userRole === "admin" || projectData.criado_por === user?.id);

  const handle_delete = async () => {
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
        .eq("id", deletingProjectId);

      if (error) {
        toast.error("Erro ao apagar projeto.");
        return;
      }

      toast.success("Projeto apagado com sucesso!");
      router.push("/demandas");
    } catch (e) {
      toast.error("Erro desconhecido ao apagar projeto.");
      console.error(e);
    }
  };

  return (
    <section className={projectLayout.project_details_wrapper}>
      {/* MODAL DE CONFIRMAÇÃO DE DELETE */}
      {deletingProjectId && (
        <div
          className={projectLayout.modal_overlay}
          onClick={() => setDeletingProjectId(null)}
        >
          <div
            className={projectLayout.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={projectLayout.modal_title}>Deletar demanda</h2>
            <p className={projectLayout.modal_description}>
              Tem certeza que deseja deletar esta demanda?
            </p>
            <section className={projectLayout.modal_actions}>
              <button
                className={projectLayout.modal_cancel_btn}
                onClick={() => setDeletingProjectId(null)}
              >
                Não Deletar Demanda
              </button>
              <button
                className={projectLayout.modal_confirm_btn}
                onClick={handle_delete}
              >
                Deletar Demanda
              </button>
            </section>
          </div>
        </div>
      )}

      {showLoading ? (
        <Loading />
      ) : loading ? null : projectData ? (
        <section className={projectLayout.project_details_wrapper}>
          <BackButton route="/demandas" />

          <section className={projectLayout.project_details_header}>
            <h1
              className={`${layout.main_app_title} ${projectLayout.project_details_title}`}
            >
              {projectData.titulo_projeto}
            </h1>
          </section>

          <section className={projectLayout.project_options}>
            {canDelete && (
              <button
                type="button"
                className={projectLayout.delete_btn}
                onClick={() => setDeletingProjectId(projectData.id)}
              >
                <FontAwesomeIcon icon={faTrash} size="lg" />
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                className={projectLayout.edit_btn}
                onClick={() => router.push(`/demandas/${id}/editar`)}
              >
                <FontAwesomeIcon icon={faPenToSquare} size="xl" />
              </button>
            )}
          </section>

          <section className={projectLayout.project_tags_wrapper}>
            {projectData.tags.map((tag) => (
              <span key={tag.id} className={projectLayout.project_tag}>
                {tag.nome}
              </span>
            ))}
          </section>

          <p className={projectLayout.project_status_wrapper}>
            Status do projeto:{" "}
            <span className={projectLayout.project_status}>
              {projectData.status_projeto.nome}
            </span>
          </p>

          <p className={projectLayout.project_description}>
            {projectData.descricao}
          </p>
        </section>
      ) : (
        <p>Projeto não encontrado.</p>
      )}
    </section>
  );
};

export default page;
