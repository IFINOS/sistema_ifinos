"use client";
// Hooks
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

// Utils
import styles from "./ThemeToggle.module.css";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // evita mismatch de hidratação: só renderiza o ícone real
  // depois que o componente montou no client
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      className={styles.theme_toggle_btn}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Alternar tema claro/escuro"
    >
      <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
    </button>
  );
};

export default ThemeToggle;
