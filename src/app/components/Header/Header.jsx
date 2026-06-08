"use client";
// Utils
import styles from "./Header.module.css";

// Components
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Hooks
import { useState } from "react";
import { usePathname } from "next/navigation";

// Images
import logo from "@/imgs/logo.svg";
import {
  faArrowRightToBracket,
  faBars,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
faArrowRightToBracket;
faUserPlus;

const links = [
  { id: 1, content: "Home", path: "/home" },
  { id: 2, content: "Projetos", path: "/projetos" },
  { id: 3, content: "Demandas", path: "/demandas" },
  { id: 4, content: "Merchandise", path: "/merchandise" },
  { id: 5, content: "Sobre", path: "/sobre" },
  { id: 6, content: "Fale Conosco", path: "/fale-conosco" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className={styles.header_wrapper}>
      <Image
        src={logo}
        width={200}
        height={100}
        alt="Logo"
        loading="eager"
        className={styles.logo}
        style={{ objectFit: "contain" }}
      />

      {/* LINKS PARA DESKTOP */}
      <section className={styles.desktop_links_wrapper}>
        <ul className={styles.desktop_links}>
          {links.map((link) => (
            <li key={link.id}>
              <Link
                className={`${styles.link} 
                  ${pathname.includes(link.path) ? styles.current_link : ""}
                `}
                href={link.path}
              >
                {link.content}
              </Link>
            </li>
          ))}
        </ul>

        <section className={styles.user_options}>
          <Link href="/login" className={styles.user_options_link}>
            <FontAwesomeIcon icon={faArrowRightToBracket} size="sm" />
            <span>Entrar</span>
          </Link>

          <Link href="/cadastrar-se" className={styles.user_options_link}>
            <FontAwesomeIcon icon={faUserPlus} size="sm" />
            <span>Cadastrar-se</span>
          </Link>
        </section>
      </section>

      {/* LINKS PARA MOBILE */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`${styles.mobile_btn} ${isMenuOpen ? styles.mobile_btn_open : ""}`}
      >
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>

      <section
        className={`${styles.mobile_menu} ${isMenuOpen ? styles.mobile_menu_open : ""}`}
        aria-hidden={!isMenuOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsMenuOpen(false);
        }}
      >
        <section className={styles.mobile_menu_inner}>
          <ul className={styles.mobile_links}>
            {links.map((link, i) => (
              <li key={link.id} style={{ "--i": i }}>
                <Link
                  className={`${styles.link} ${pathname.includes(link.path) ? styles.current_link : ""}`}
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.content}
                </Link>
              </li>
            ))}
          </ul>

          <section className={styles.mobile_user_options}>
            <Link
              href="/login"
              className={styles.user_options_link}
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faArrowRightToBracket} size="sm" />
              <span>Entrar</span>
            </Link>
            <Link
              href="/cadastrar-se"
              className={styles.user_options_link}
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faUserPlus} size="sm" />
              <span>Cadastrar-se</span>
            </Link>
          </section>
        </section>
      </section>
    </header>
  );
};

export default Header;
