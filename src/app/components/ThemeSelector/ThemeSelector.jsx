"use client";
// Hooks
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Utils
import styles from "./ThemeSelector.module.css";
import { THEMES } from "@/_lib/constants/themes";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // evita mismatch de hidratação: só sabe o tema real depois de montar no client
  // useEffect(() => setMounted(true), []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section className={styles.theme_selector_wrapper}>
      {THEMES.map((option) => {
        const isSelected = theme === option.id;

        return (
          <button
            key={option.id}
            type="button"
            className={`${styles.theme_card} ${
              isSelected ? styles.theme_card_selected : ""
            }`}
            onClick={() => setTheme(option.id)}
          >
            <span className={styles.theme_preview}>
              {option.preview.map((cor, i) => (
                <span
                  key={i}
                  className={styles.theme_preview_color}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </span>

            <span className={styles.theme_label}>{option.label}</span>
          </button>
        );
      })}
    </section>
  );
};

export default ThemeSelector;
