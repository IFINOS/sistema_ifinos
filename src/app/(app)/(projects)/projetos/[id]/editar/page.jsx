"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useUser } from "@/context/userContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Utils
import layout from "../../../layout.module.css";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import { toast } from "sonner";
import Loading from "@/app/components/Loading/Loading";
import MultiStepForm from "@/app/components/MultiStepForm/MultiStepForm";
import StepInfoBasica from "@/app/components/MultiStepForm/steps/StepInfoBasica";
import StepTags from "@/app/components/MultiStepForm/steps/StepTags";
import StepIntegrantes from "@/app/components/MultiStepForm/steps/StepIntegrantes";

// Validators
import { validate_info_basica } from "@/app/components/MultiStepForm/validators/stepInfoBasica.validator";
import { validate_tags } from "@/app/components/MultiStepForm/validators/stepTags.validator";
import { validate_integrantes } from "@/app/components/MultiStepForm/validators/stepIntegrantes.validator";

const supabase = createClient();

const STEPS = [
  {
    key: "info",
    label: "Informações",
    component: StepInfoBasica,
    validator: validate_info_basica,
  },
  { key: "tags", label: "Tags", component: StepTags, validator: validate_tags },
  {
    key: "integrantes",
    label: "Integrantes",
    component: StepIntegrantes,
    validator: validate_integrantes,
  },
];

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useUser();
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    const load_project = async () => {
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
            projetos_tags ( tags ( id, nome ) ),
            usuarios_projetos ( funcao, usuarios ( id, nome, avatar_url ) )
          `,
          )
          .eq("id", id)
          .single();

        if (error) {
          toast.error("Projeto não encontrado.");
          return;
        }

        setProjectData(data);
      } catch (e) {
        toast.error("Erro desconhecido ao carregar o projeto.");
        console.error(e);
      } finally {
        setProjectLoading(false);
      }
    };

    load_project();
  }, [id]);

  const loading = projectLoading || userLoading;
  const showLoading = useSmartLoading(loading);

  const canEdit =
    !loading &&
    projectData &&
    (userRole === "admin" ||
      projectData.usuarios_projetos?.some(
        (up) => up.usuarios?.id === user?.id,
      ));

  const handle_submit = async (formData) => {
    try {
      // 1. atualiza os campos básicos do projeto
      const { error: projetoError } = await supabase
        .from("projetos")
        .update({
          titulo_projeto: formData.titulo,
          descricao: formData.descricao,
        })
        .eq("id", id);

      if (projetoError) {
        toast.error("Erro ao atualizar projeto.");
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

      // 3. diff dos integrantes
      const currentIntegranteIds = (projectData.usuarios_projetos ?? []).map(
        (up) => up.usuarios?.id,
      );
      const newIntegrantes = formData.integrantes ?? [];
      const newIntegranteIds = newIntegrantes.map((i) => i.id);

      const integrantesToRemove = currentIntegranteIds.filter(
        (uid) => !newIntegranteIds.includes(uid),
      );
      const integrantesToAdd = newIntegrantes.filter(
        (i) => !currentIntegranteIds.includes(i.id),
      );
      // integrantes que já existiam mas podem ter trocado de função
      const integrantesToUpdate = newIntegrantes.filter((i) => {
        const existing = (projectData.usuarios_projetos ?? []).find(
          (up) => up.usuarios?.id === i.id,
        );
        return existing && existing.funcao !== i.funcao;
      });

      if (integrantesToRemove.length > 0) {
        await supabase
          .from("usuarios_projetos")
          .delete()
          .eq("projeto_id", id)
          .in("usuario_id", integrantesToRemove);
      }

      if (integrantesToAdd.length > 0) {
        await supabase.from("usuarios_projetos").insert(
          integrantesToAdd.map((i) => ({
            projeto_id: id,
            usuario_id: i.id,
            funcao: i.funcao,
          })),
        );
      }

      for (const integrante of integrantesToUpdate) {
        await supabase
          .from("usuarios_projetos")
          .update({ funcao: integrante.funcao })
          .eq("projeto_id", id)
          .eq("usuario_id", integrante.id);
      }

      toast.success("Projeto atualizado com sucesso!");
      router.push(`/projetos/${id}`);
    } catch (e) {
      toast.error("Erro desconhecido ao atualizar projeto.");
      console.error(e);
    }
  };

  if (showLoading) return <Loading />;

  if (loading) return null;

  if (!projectData) return <p>Projeto não encontrado.</p>;

  if (!canEdit) return <p>Você não tem permissão para editar este projeto.</p>;

  const initial_data = {
    titulo: projectData.titulo_projeto,
    descricao: projectData.descricao,
    tags: (projectData.projetos_tags ?? []).flatMap((pt) =>
      Array.isArray(pt.tags) ? pt.tags : pt.tags ? [pt.tags] : [],
    ),
    integrantes: (projectData.usuarios_projetos ?? []).map((up) => ({
      ...up.usuarios,
      funcao: up.funcao,
    })),
  };

  return (
    <section className={layout.register_project_main_page}>
      <BackButton />
      <h1 className={layout.main_app_title}>Editar Projeto</h1>

      <section className={layout.create_project_form_wrapper}>
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
