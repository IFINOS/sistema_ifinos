"use client";
// Hooks
import { useState } from "react";
import { createClient } from "@/_lib/supabase/client";

// Utils
import styles from "./AdminProjectControls.module.css";
import PropTypes from "prop-types";

// Components
import { toast } from "sonner";
import StepIntegrantes from "@/app/components/MultiStepForm/steps/StepIntegrantes";

const supabase = createClient();

const STATUS_OPTIONS = ["Ativo", "Em pausa", "Encerrado"];

/*
  EXPLICAÇÃO PARA LEIGOS :)

  esse bloco só aparece pra admin, na tela de edição de projeto/demanda

  ele permite trocar o status (Ativo/Em pausa/Encerrado) livremente,
  mas a troca de TIPO (Demanda -> Projeto) tem uma trava a mais:
  como Projeto tem integrantes e Demanda não, forçamos o admin a
  já selecionar pelo menos um integrante antes de confirmar a troca,
  pra não criar um "projeto órfão" sem ninguém vinculado
*/
const AdminProjectControls = ({
  projectId,
  currentStatus,
  currentTipo,
  onUpdated,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [tipo, setTipo] = useState(currentTipo);
  const [integrantesParaConversao, setIntegrantesParaConversao] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isConvertingToProjeto = tipo === "Projeto" && currentTipo === "Demanda";

  const handle_save = async () => {
    setError("");

    if (isConvertingToProjeto && integrantesParaConversao.length === 0) {
      setError(
        "Para converter uma demanda em projeto, adicione pelo menos um integrante.",
      );
      return;
    }

    setSaving(true);

    try {
      // busca o id do tipo/status selecionados
      const [
        { data: tipoData, error: tipoError },
        { data: statusData, error: statusError },
      ] = await Promise.all([
        supabase.from("tipo_projeto").select("id").eq("nome", tipo).single(),
        supabase
          .from("status_projeto")
          .select("id")
          .eq("nome", status)
          .single(),
      ]);

      if (tipoError || statusError || !tipoData || !statusData) {
        toast.error("Erro ao identificar tipo/status selecionados.");
        return;
      }

      // atualiza o projeto
      const { error: updateError } = await supabase
        .from("projetos")
        .update({
          tipo_projeto_id: tipoData.id,
          status_projeto_id: statusData.id,
        })
        .eq("id", projectId);

      if (updateError) {
        toast.error("Erro ao atualizar status/tipo.");
        return;
      }

      // se está convertendo demanda -> projeto, insere os integrantes
      // selecionados nessa mesma ação
      if (isConvertingToProjeto) {
        const { error: integrantesError } = await supabase
          .from("usuarios_projetos")
          .insert(
            integrantesParaConversao.map((integrante) => ({
              projeto_id: projectId,
              usuario_id: integrante.id,
              funcao: integrante.funcao,
            })),
          );

        if (integrantesError) {
          toast.error(
            "Status/tipo atualizados, mas houve erro ao vincular os integrantes.",
          );
          return;
        }
      }

      toast.success("Alterações administrativas salvas!");
      onUpdated?.();
    } catch (e) {
      toast.error("Erro desconhecido ao salvar alterações.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.admin_controls_wrapper}>
      <h2 className={styles.admin_controls_title}>Área Administrativa</h2>

      <section className={styles.admin_controls_row}>
        <section className={styles.admin_field}>
          <label className={styles.admin_label}>Status</label>
          <select
            className={styles.admin_select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </section>

        <section className={styles.admin_field}>
          <label className={styles.admin_label}>Tipo</label>
          <select
            className={styles.admin_select}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="Projeto">Projeto</option>
            <option value="Demanda">Demanda</option>
          </select>
        </section>
      </section>

      {isConvertingToProjeto && (
        <section className={styles.conversion_warning}>
          <p className={styles.conversion_warning_text}>
            Você está convertendo esta demanda em projeto. Selecione pelo menos
            um integrante para continuar:
          </p>

          <StepIntegrantes
            data={{ integrantes: integrantesParaConversao }}
            errors={{}}
            onChange={(_, value) => setIntegrantesParaConversao(value)}
          />
        </section>
      )}

      {error && <span className={styles.field_error}>{error}</span>}

      <button
        type="button"
        className={styles.save_admin_btn}
        onClick={handle_save}
        disabled={saving}
      >
        {saving ? "Salvando..." : "Salvar Alterações Administrativas"}
      </button>
    </section>
  );
};

AdminProjectControls.propTypes = {
  projectId: PropTypes.string.isRequired,
  currentStatus: PropTypes.string.isRequired,
  currentTipo: PropTypes.string.isRequired,
  onUpdated: PropTypes.func,
};

export default AdminProjectControls;
