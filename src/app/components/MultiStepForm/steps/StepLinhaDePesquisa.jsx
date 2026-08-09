"use client";
// Hooks
import { useState, useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";

// Utils
import standardStyles from "./StepStandardStyle.module.css";
import styles from "./StepLinhaDePesquisa.module.css";
import PropTypes from "prop-types";

// Components
import { toast } from "sonner";

const supabase = createClient();

const StepLinhaPesquisa = ({ data, errors, onChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const [linhas, setLinhas] = useState([]);
  const [loadingLinhas, setLoadingLinhas] = useState(true);

  const selectedLinha = data.linha_pesquisa ?? null;

  useEffect(() => {
    const load_linhas = async () => {
      setLoadingLinhas(true);

      try {
        let req = supabase
          .from("linha_de_pesquisa")
          .select("id, nome")
          .filter("registro_ativo", "eq", true)
          .order("nome", { ascending: true })
          .limit(5);

        if (searchValue) {
          req = req.ilike("nome", `%${searchValue}%`);
        }

        const { data: result, error } = await req;

        if (error) {
          toast.error("Erro ao carregar linhas de pesquisa.");
          return;
        }

        setLinhas(result ?? []);
      } catch (e) {
        toast.error("Erro desconhecido ao carregar linhas de pesquisa.");
        console.error(e);
      } finally {
        setLoadingLinhas(false);
      }
    };

    const timeout = setTimeout(load_linhas, 650); // debounce simples da busca
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const handle_select = (linha) => {
    // clicar de novo na já selecionada desmarca (comportamento de toggle único)
    if (selectedLinha?.id === linha.id) {
      onChange("linha_pesquisa", null);
    } else {
      onChange("linha_pesquisa", linha);
    }
  };

  return (
    <section className={standardStyles.step_wrapper}>
      <h3 className={standardStyles.step_title}>
        Qual a linha de pesquisa deste projeto?
      </h3>

      <input
        className={standardStyles.step_input}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Buscar linha de pesquisa..."
      />

      {loadingLinhas ? (
        <p>Carregando...</p>
      ) : linhas.length === 0 ? (
        <p>Nenhuma linha de pesquisa encontrada.</p>
      ) : (
        <section className={styles.linhas_list}>
          {linhas.map((linha) => {
            const is_selected = selectedLinha?.id === linha.id;
            return (
              <button
                key={linha.id}
                type="button"
                className={`${styles.linha_item} ${
                  is_selected ? styles.linha_item_selected : ""
                }`}
                onClick={() => handle_select(linha)}
              >
                {linha.nome}
              </button>
            );
          })}
        </section>
      )}

      {errors.linha_pesquisa && (
        <span className={standardStyles.field_error}>
          {errors.linha_pesquisa}
        </span>
      )}
    </section>
  );
};

StepLinhaPesquisa.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default StepLinhaPesquisa;
