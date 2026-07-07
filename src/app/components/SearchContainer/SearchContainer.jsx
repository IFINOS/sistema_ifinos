"use client";
// Utils
import styles from "./SearchContainer.module.css";
import PropTypes from "prop-types";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useState } from "react";

const SearchContainer = ({ on_search, placeholder, is_loading }) => {
  const [value, setValue] = useState("");

  const handle_submit = (e) => {
    e.preventDefault();
    on_search(value); // passa o valor pra quem usar o componente
  };

  return (
    <form className={styles.search_container} onSubmit={handle_submit}>
      <section className={styles.search_container_input_wrapper}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={styles.search_container_input}
          placeholder={placeholder}
        />
        <div className={styles.search_container_input_icon}>
          <FontAwesomeIcon icon={faSearch} />
        </div>
      </section>
      <button
        disabled={is_loading}
        className={styles.search_container_button}
        type="submit"
      >
        {is_loading ? "Carregando..." : "Pesquisar"}
      </button>
    </form>
  );
};

// estamos usando js e ts então foi preciso baixar uma lib chamada "prop-types" para lidar com tipagem :)

SearchContainer.propTypes = {
  on_search: PropTypes.func.isRequired,
  is_loading: PropTypes.bool.isRe,
  placeholder: PropTypes.string,
};

SearchContainer.defaultProps = {
  placeholder: "Pesquisar...",
  is_loading: false,
};

// Manual de como usar o prop-types

/*
PropTypes.string — texto
PropTypes.number — número
PropTypes.bool — booleano
PropTypes.func — função
PropTypes.array — array
PropTypes.object — objeto
PropTypes.node — qualquer coisa renderizável (JSX, texto, etc)
PropTypes.arrayOf(PropTypes.string) — array de strings
PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }) — objeto com formato específico
E .isRequired em qualquer um deles pra marcar como obrigatório :)
*/

export default SearchContainer;
