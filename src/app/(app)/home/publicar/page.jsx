"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

// Utils
import styles from "./page.module.css";
import layout from "../../layout.module.css";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import { toast } from "sonner";
import MultiStepForm from "@/app/components/MultiStepForm/MultiStepForm";
import StepSelecionarProjeto from "@/app/components/MultiStepForm/steps/StepSelecionarProjeto";
import StepConteudoNoticia from "@/app/components/MultiStepForm/steps/StepConteudoNoticia";
import StepImagemNoticia from "@/app/components/MultiStepForm/steps/StepImagemNoticia";

// Validators
import { validate_selecionar_projeto } from "@/app/components/MultiStepForm/validators/stepSelecionarProjeto.validator";
import { validate_conteudo_noticia } from "@/app/components/MultiStepForm/validators/stepConteudoNoticia.validator";
import { validate_imagem_noticia } from "@/app/components/MultiStepForm/validators/stepImagemNoticia.validator";

const supabase = createClient();

const STEPS = [
  {
    key: "projeto",
    label: "Projeto",
    component: StepSelecionarProjeto,
    validator: validate_selecionar_projeto,
  },
  {
    key: "conteudo",
    label: "Conteúdo",
    component: StepConteudoNoticia,
    validator: validate_conteudo_noticia,
  },
  {
    key: "imagem",
    label: "Imagem",
    component: StepImagemNoticia,
    validator: validate_imagem_noticia,
  },
];

const Page = () => {
  const router = useRouter();
  const { user } = useUser();

  const handle_submit = async (formData) => {
    try {
      const { data: noticia, error: noticiaError } = await supabase
        .from("noticias")
        .insert({
          titulo_publicacao: formData.titulo,
          resumo: formData.resumo,
          img_url: formData.img_url,
          projeto_id: formData.projeto.id,
          usuario_id: user.id,
          data_publicacao: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (noticiaError) {
        toast.error("Erro ao publicar notícia.");
        return;
      }

      toast.success("Notícia publicada com sucesso!");
      router.push(`/home/${noticia.id}`);
    } catch (e) {
      toast.error("Erro desconhecido ao publicar notícia.");
      console.error(e);
    }
  };

  return (
    <section className={styles.register_news_main_page}>
      <BackButton />
      <h1 className={layout.main_app_title}>Publicar Notícia</h1>

      <section className={styles.create_news_form_wrapper}>
        <MultiStepForm
          steps={STEPS}
          initial_data={{
            projeto: null,
            titulo: "",
            resumo: "",
            img_url: null,
          }}
          on_submit={handle_submit}
          submit_label="Publicar Notícia"
        />
      </section>
    </section>
  );
};

export default Page;
