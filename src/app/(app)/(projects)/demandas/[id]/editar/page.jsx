"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useUser } from "@/context/userContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Utils
import layout from "../../../layout.module.css";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import { toast } from "sonner";
import Loading from "@/app/components/Loading/Loading";
import MultiStepForm from "@/app/components/MultiStepForm/MultiStepForm";
import StepInfoBasica from "@/app/components/MultiStepForm/steps/StepInfoBasica";
import StepTags from "@/app/components/MultiStepForm/steps/StepTags";
import AdminProjectControls from "@/app/components/AdminProjectControls/AdminProjectControls";

// Validators
import { validate_info_basica } from "@/app/components/MultiStepForm/validators/stepInfoBasica.validator";
import { validate_tags } from "@/app/components/MultiStepForm/validators/stepTags.validator";

const supabase = createClient();

const STEPS = [
  {
    key: "info",
    label: "Informações",
    component: StepInfoBasica,
    validator: validate_info_basica,
  },
  { key: "tags", label: "Tags", component: StepTags, validator: validate_tags },
];

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useUser();
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    const load_demanda = async () => {
      setProjectLoading(true);

      try {
        const { data, error } = await supabase
          .from("projetos")
          .select(
            `
            id,
            titulo_projeto,
            descricao,
            criado_por,
            status_projeto ( id, nome ),
            tipo_projeto ( id, nome ),
            projetos_tags ( tags ( id, nome ) ),
            usuarios_projetos ( funcao, usuarios ( id, nome,avatar_url ) )
            `,
          )
          .eq("id", id)
          .single();

        if (error) {
          toast.error("Demanda não encontrada.");
          return;
        }

        setProjectData(data);
      } catch (e) {
        toast.error("Erro desconhecido ao carregar a demanda.");
        console.error(e);
      } finally {
        setProjectLoading(false);
      }
    };

    load_demanda();
  }, [id]);

  const loading = projectLoading || userLoading;
  const showLoading = useSmartLoading(loading);

  const canEdit =
    !loading &&
    projectData &&
    (userRole === "admin" || projectData.criado_por === user?.id);

  const handle_submit = async (formData) => {
    try {
      // 1. atualiza os campos básicos da demanda
      const { error: projetoError } = await supabase
        .from("projetos")
        .update({
          titulo_projeto: formData.titulo,
          descricao: formData.descricao,
        })
        .eq("id", id);

      if (projetoError) {
        toast.error("Erro ao atualizar demanda.");
        return;
      }

      // 2. diff das tags
      const currentTagIds = (projectData.projetos_tags ?? [])
        .flatMap((pt) =>
          Array.isArray(pt.tags) ? pt.tags : pt.tags ? [pt.tags] : [],
        )
        .map((t) => t.id);
      const newTagIds = (formData.tags ?? []).map((t) => t.id);

      const tagsToRemove = currentTagIds.filter(
        (tid) => !newTagIds.includes(tid),
      );
      const tagsToAdd = newTagIds.filter((tid) => !currentTagIds.includes(tid));

      if (tagsToRemove.length > 0) {
        await supabase
          .from("projetos_tags")
          .delete()
          .eq("projeto_id", id)
          .in("tags_id", tagsToRemove);
      }

      if (tagsToAdd.length > 0) {
        await supabase
          .from("projetos_tags")
          .insert(
            tagsToAdd.map((tagId) => ({ projeto_id: id, tags_id: tagId })),
          );
      }

      toast.success("Demanda atualizada com sucesso!");
      router.push(`/demandas/${id}`);
    } catch (e) {
      toast.error("Erro desconhecido ao atualizar demanda.");
      console.error(e);
    }
  };

  if (showLoading) return <Loading />;

  if (loading) return null;

  if (!projectData) return <p>Demanda não encontrada.</p>;

  if (!canEdit) return <p>Você não tem permissão para editar esta demanda.</p>;

  const initial_data = {
    titulo: projectData.titulo_projeto,
    descricao: projectData.descricao,
    tags: (projectData.projetos_tags ?? []).flatMap((pt) =>
      Array.isArray(pt.tags) ? pt.tags : pt.tags ? [pt.tags] : [],
    ),
  };

  return (
    <section className={layout.register_project_main_page}>
      <BackButton />
      <h1 className={layout.main_app_title}>Editar Demanda</h1>

      <section className={layout.create_project_form_wrapper}>
        {userRole === "admin" && (
          <AdminProjectControls
            projectId={id}
            currentStatus={projectData.status_projeto?.nome}
            currentTipo={projectData.tipo_projeto?.nome}
            onUpdated={() => router.push("/demandas")}
          />
        )}

        <MultiStepForm
          steps={STEPS}
          initial_data={initial_data}
          on_submit={handle_submit}
          submit_label="Salvar Alterações"
        />
      </section>
    </section>
  );
};

export default Page;
