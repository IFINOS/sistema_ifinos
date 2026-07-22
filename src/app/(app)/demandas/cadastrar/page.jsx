"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useRouter } from "next/navigation";

// Utils
import styles from "./page.module.css";
import layout from "../../layout.module.css";
import { useUser } from "@/context/userContext";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import { toast } from "sonner";
import MultiStepForm from "@/app/components/MultiStepForm/MultiStepForm";
import StepInfoBasica from "@/app/components/MultiStepForm/steps/StepInfoBasica";
import StepTags from "@/app/components/MultiStepForm/steps/StepTags";

// Validators
import { validate_info_basica } from "@/app/components/MultiStepForm/validators/stepInfoBasica.validator";
import { validate_tags } from "@/app/components/MultiStepForm/validators/stepTags.validator";

const STEPS = [
  {
    key: "info",
    label: "Informações",
    component: StepInfoBasica,
    validator: validate_info_basica,
  },
  { key: "tags", label: "Tags", component: StepTags, validator: validate_tags },
];

const page = () => {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useUser();

  const handle_submit = async (formData) => {
    try {
      const { data: tipoProjeto, error: tipoError } = await supabase
        .from("tipo_projeto")
        .select("id")
        .eq("nome", "Demanda")
        .single();

      if (tipoError || !tipoProjeto) {
        toast.error("Erro ao identificar o tipo do projeto.");
        return;
      }

      const { data: statusAtivo, error: statusError } = await supabase
        .from("status_projeto")
        .select("id")
        .eq("nome", "Ativo")
        .single();

      if (statusError || !statusAtivo) {
        toast.error("Erro ao identificar o status do projeto.");
        return;
      }

      const { data: projeto, error: projetoError } = await supabase
        .from("projetos")
        .insert({
          titulo_projeto: formData.titulo,
          descricao: formData.descricao,
          tipo_projeto_id: tipoProjeto.id,
          status_projeto_id: statusAtivo.id,
          criado_por: user.id,
        })
        .select("id")
        .single();

      if (projetoError) {
        toast.error("Erro ao criar projeto.");
        return;
      }

      // insere as tags da demanda
      if (formData.tags?.length > 0) {
        const { error: tagsError } = await supabase
          .from("projetos_tags")
          .insert(
            formData.tags.map((tag) => ({
              projeto_id: projeto.id,
              tags_id: tag.id,
            })),
          );

        if (tagsError) {
          toast.error("Demanda criada, mas houve erro ao vincular tags.");
        }
      }

      toast.success("Demanda cadastrada com sucesso!");
      router.push(`/demandas/${projeto.id}`);
    } catch (e) {
      toast.error("Erro desconhecido ao cadastrar demanda.");
      console.error(e);
    }
  };

  return (
    <section className={styles.register_project_main_page}>
      <BackButton />
      <h1 className={layout.main_app_title}>Cadastrar Demanda</h1>

      <section className={styles.create_project_form_wrapper}>
        <MultiStepForm
          steps={STEPS}
          initial_data={{
            titulo: "",
            descricao: "",
            tags: [],
          }}
          on_submit={handle_submit}
          submit_label="Cadastrar Demanda"
        />
      </section>
    </section>
  );
};

export default page;
