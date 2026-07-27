"use client";
// Hooks
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Divider from "../../Divider/Divider";

// Images
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// Utils
import styles from "./StepIntegrantes.module.css";
import standardStyles from "./StepStandardStyle.module.css";
import PropTypes from "prop-types";

const supabase = createClient();

// papel do usuário dentro do projeto — independente do grupo de permissão do sistema
const FUNCOES_PROJETO = [
  "Orientador",
  "Professor",
  "Estudante",
  "Bolsista",
  "Voluntário",
];

const StepIntegrantes = ({ data, errors, onChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const selectedIntegrantes = data.integrantes ?? [];

  useEffect(() => {
    if (!searchValue.trim()) {
      const clearTimeout_ = setTimeout(() => {
        setSearchResults([]);
      }, 0);
      return () => clearTimeout(clearTimeout_);
    }

    const timeout = setTimeout(async () => {
      setSearching(true);

      const { data: usuarios, error } = await supabase
        .from("usuarios")
        .select("id, nome, avatar_url")
        .filter("registro_ativo", "eq", true)
        .ilike("nome", `%${searchValue}%`)
        .limit(5);

      if (!error) setSearchResults(usuarios ?? []);
      setSearching(false);
    }, 650); // debounce para a busca não ser tão estranha :)

    return () => clearTimeout(timeout);
  }, [searchValue]);

  const add_integrante = (usuario) => {
    const already_added = selectedIntegrantes.some((i) => i.id === usuario.id);
    if (already_added) return;

    onChange("integrantes", [
      ...selectedIntegrantes,
      { ...usuario, funcao: null },
    ]);
    setSearchValue("");
    setSearchResults([]);
  };

  const remove_integrante = (usuarioId) => {
    onChange(
      "integrantes",
      selectedIntegrantes.filter((i) => i.id !== usuarioId),
    );
  };

  const set_funcao = (usuarioId, funcao) => {
    onChange(
      "integrantes",
      selectedIntegrantes.map((i) =>
        i.id === usuarioId ? { ...i, funcao } : i,
      ),
    );
  };

  return (
    <section className={standardStyles.step_wrapper}>
      <h3 className={standardStyles.step_title}>Registrar integrantes</h3>

      <section className={styles.search_wrapper}>
        <input
          className={standardStyles.step_input}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Buscar usuário pelo nome..."
        />

        {searching && (
          <span className={styles.searching_label}>Buscando...</span>
        )}

        {searchResults.length > 0 && (
          <ul className={styles.search_results}>
            {searchResults.map((usuario) => (
              <li key={usuario.id}>
                <button
                  type="button"
                  className={styles.search_result_item}
                  onClick={() => add_integrante(usuario)}
                >
                  {usuario.nome}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {errors.integrantes && (
        <span className={standardStyles.field_error}>{errors.integrantes}</span>
      )}

      <section className={styles.selected_wrapper}>
        {selectedIntegrantes.map((integrante) => (
          <div key={integrante.id} className={styles.selected_item}>
            <div className={styles.selected_item_header}>
              <span className={styles.selected_name}>{integrante.nome}</span>
              <button
                type="button"
                className={styles.remove_btn}
                onClick={() => remove_integrante(integrante.id)}
              >
                <FontAwesomeIcon icon={faTrash} size="lg" />
              </button>
            </div>

            <Divider color="var(--dark_gray)" />

            <div className={styles.funcao_chips_wrapper}>
              {FUNCOES_PROJETO.map((funcao) => {
                const is_selected = integrante.funcao === funcao;
                return (
                  <button
                    key={funcao}
                    type="button"
                    className={`${styles.funcao_chip} ${
                      is_selected ? styles.funcao_chip_selected : ""
                    }`}
                    onClick={() => set_funcao(integrante.id, funcao)}
                  >
                    {funcao}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </section>
  );
};

StepIntegrantes.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default StepIntegrantes;
