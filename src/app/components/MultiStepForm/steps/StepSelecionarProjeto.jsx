"use client";
// Hooks
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";
import { useUser } from "@/context/userContext";

// Utils
import standardStyles from "./StepStandardStyle.module.css";
import styles from "./StepSelecionarProjeto.module.css";
import PropTypes from "prop-types";

// Components
import { toast } from "sonner";

const supabase = createClient();

const StepSelecionarProjeto = ({ data, errors, onChange }) => {
  const { user, userRole } = useUser();
  const [projetos, setProjetos] = useState([]);
  const [loadingProjetos, setLoadingProjetos] = useState(true);

  const selectedProjeto = data.projeto ?? null;

  useEffect(() => {
    const load_projetos = async () => {
      if (!user) return;

      setLoadingProjetos(true);

      try {
        // admin vê todos os projetos ativos; os demais só os que participam
        let req = supabase
          .from("projetos")
          .select(
            `
            id,
            titulo_projeto,
            tipo_projeto_id,
            registro_ativo,
            tipo_projeto!inner (id, nome),
            usuarios_projetos!inner ( usuario_id )
          `,
          )
          .eq("tipo_projeto", "Projeto")
          .filter("registro_ativo", "eq", true)
          .order("titulo_projeto", { ascending: true });

        if (userRole === "admin") {
          req = supabase
            .from("projetos")
            .select(
              `
              id,
              titulo_projeto,
              tipo_projeto_id,
              tipo_projeto!inner (id, nome),
              usuarios_projetos!inner ( usuario_id )
            `,
            )
            .eq("tipo_projeto.nome", "Projeto")
            .order("titulo_projeto", { ascending: true });
        } else {
          req = req.eq("usuarios_projetos.usuario_id", user.id);
        }

        const { data: result, error } = await req;

        if (error) {
          toast.error("Erro ao carregar projetos disponíveis.");
          return;
        }

        // remove duplicidade que pode surgir do join (mesmo projeto,
        // múltiplas linhas de usuarios_projetos, caso relevante no futuro)
        const unique = Array.from(
          new Map((result ?? []).map((p) => [p.id, p])).values(),
        );

        setProjetos(unique);
      } catch (e) {
        toast.error("Erro desconhecido ao carregar projetos.");
        console.error(e);
      } finally {
        setLoadingProjetos(false);
      }
    };

    load_projetos();
  }, [user, userRole]);

  const handle_select = (projeto) => {
    onChange("projeto", projeto);
  };

  return (
    <section className={standardStyles.step_wrapper}>
      <h3 className={standardStyles.step_title}>
        A qual projeto essa notícia pertence?
      </h3>

      {loadingProjetos ? (
        <p>Carregando projetos...</p>
      ) : projetos.length === 0 ? (
        <p>
          Você não participa de nenhum projeto no momento, então não é possível
          publicar uma notícia.
        </p>
      ) : (
        <section className={styles.projetos_list}>
          {projetos.map((projeto) => {
            const is_selected = selectedProjeto?.id === projeto.id;
            return (
              <button
                key={projeto.id}
                type="button"
                className={`${styles.projeto_item} ${
                  is_selected ? styles.projeto_item_selected : ""
                }`}
                onClick={() => handle_select(projeto)}
              >
                {projeto.titulo_projeto}
              </button>
            );
          })}
        </section>
      )}

      {errors.projeto && (
        <span className={standardStyles.field_error}>{errors.projeto}</span>
      )}
    </section>
  );
};

StepSelecionarProjeto.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default StepSelecionarProjeto;
