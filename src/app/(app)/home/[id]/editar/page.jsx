"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useUser } from "@/context/userContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Utils
import styles from "./page.module.css";
import layout from "../../../layout.module.css";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import { toast } from "sonner";
import Loading from "@/app/components/Loading/Loading";
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
    key: "project",
    label: "Projeto",
    component: StepSelecionarProjeto,
    validator: validate_selecionar_projeto,
  },
  {
    key: "content",
    label: "Conteúdo",
    component: StepConteudoNoticia,
    validator: validate_conteudo_noticia,
  },
  {
    key: "image",
    label: "Imagem",
    component: StepImagemNoticia,
    validator: validate_imagem_noticia,
  },
];

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useUser();
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    const load_news = async () => {
      setNewsLoading(true);

      try {
        const { data, error } = await supabase
          .from("noticias")
          .select(
            `
            id,
            titulo_publicacao,
            resumo,
            usuario_id,
            projeto_id,
            registro_ativo,
            img_url,
            data_publicacao,
            usuarios!usuario_id ( id, nome ),
            projetos!projeto_id ( id, titulo_projeto )
          `,
          )
          .eq("id", id)
          .single();

        if (error) {
          toast.error("Notícia não encontrada.");
          return;
        }

        setNewsData(data);
      } catch (e) {
        toast.error("Erro desconhecido ao carregar a notícia.");
        console.error(e);
      } finally {
        setNewsLoading(false);
      }
    };

    load_news();
  }, [id]);

  const loading = newsLoading || userLoading;
  const showLoading = useSmartLoading(loading);

  const canEdit =
    !loading &&
    newsData &&
    (userRole === "admin" || newsData.usuario_id === user?.id);

  const handle_submit = async (formData) => {
    try {
      const { error: noticiaError } = await supabase
        .from("noticias")
        .update({
          titulo_publicacao: formData.titulo,
          resumo: formData.resumo,
          projeto_id: formData.projeto?.id,
          img_url: formData.img_url,
        })
        .eq("id", id);

      if (noticiaError) {
        toast.error("Erro ao atualizar notícia.");
        return;
      }

      toast.success("Notícia atualizada com sucesso!");
      router.push(`/home/${id}`);
    } catch (e) {
      toast.error("Erro desconhecido ao atualizar notícia.");
      console.error(e);
    }
  };

  if (showLoading) return <Loading />;

  if (loading) return null;

  if (!newsData) return <p>Notícia não encontrada.</p>;

  if (!canEdit) return <p>Você não tem permissão para editar esta notícia.</p>;

  const initial_data = {
    projeto: newsData.projetos
      ? {
          id: newsData.projetos.id,
          titulo_projeto: newsData.projetos.titulo_projeto,
        }
      : null,
    titulo: newsData.titulo_publicacao,
    resumo: newsData.resumo,
    img_url: newsData.img_url,
  };

  return (
    <section className={styles.register_news_main_page}>
      <BackButton />
      <h1 className={layout.main_app_title}>Editar Notícia</h1>

      <section className={styles.create_news_form_wrapper}>
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
