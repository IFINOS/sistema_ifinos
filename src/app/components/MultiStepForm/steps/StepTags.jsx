"use client";
// Hooks
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";

// Utils
import styles from "./StepTags.module.css";
import standardStyles from "./StepStandardStyle.module.css";
import PropTypes from "prop-types";

// Components
import { toast } from "sonner";

const supabase = createClient();

const StepTags = ({ data, errors, onChange }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedTags = data.tags ?? [];

  useEffect(() => {
    const load_tags = async () => {
      const { data: tags, error } = await supabase
        .from("tags")
        .select("id, nome")
        .filter("registro_ativo", "eq", true)
        .order("nome", { ascending: true });

      if (error) {
        toast.error("Erro ao carregar tags.");
        return;
      }

      setAvailableTags(tags ?? []);
    };

    load_tags();
  }, []);

  const toggle_tag = (tag) => {
    const already_selected = selectedTags.some((t) => t.id === tag.id);

    if (already_selected) {
      onChange(
        "tags",
        selectedTags.filter((t) => t.id !== tag.id),
      );
    } else {
      onChange("tags", [...selectedTags, tag]);
    }
  };

  const handle_create_tag = async () => {
    const trimmed = newTagName.trim();

    if (!trimmed) return;

    setCreating(true);

    try {
      const { data: created, error } = await supabase
        .from("tags")
        .insert({ nome: trimmed })
        .select("id, nome")
        .single();

      if (error) {
        toast.error("Erro ao criar tag. Você tem permissão para isso?");
        return;
      }

      setAvailableTags((prev) => [...prev, created]);
      onChange("tags", [...selectedTags, created]);
      setNewTagName("");
      toast.success("Tag criada!");
    } catch (e) {
      toast.error("Erro desconhecido ao criar tag.");
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className={standardStyles.step_wrapper}>
      <h3 className={standardStyles.step_title}>Selecione as tags</h3>

      <section className={styles.tags_wrapper}>
        {availableTags.map((tag) => {
          const is_selected = selectedTags.some((t) => t.id === tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              className={`${styles.tag_chip} ${is_selected ? styles.tag_chip_selected : ""}`}
              onClick={() => toggle_tag(tag)}
            >
              {tag.nome}
            </button>
          );
        })}
      </section>

      {errors.tags && (
        <span className={standardStyles.field_error}>{errors.tags}</span>
      )}

      <section className={styles.create_tag_wrapper}>
        <input
          className={styles.step_input}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Não encontrou a tag? Crie uma nova"
          maxLength={40}
        />
        <button
          type="button"
          className={styles.create_tag_btn}
          onClick={handle_create_tag}
          disabled={creating || !newTagName.trim()}
        >
          {creating ? "Criando..." : "Criar"}
        </button>
      </section>
    </section>
  );
};

StepTags.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default StepTags;
