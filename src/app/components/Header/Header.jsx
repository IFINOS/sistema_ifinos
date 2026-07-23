"use client";
// Utils
import styles from "./Header.module.css";
import format_name from "@/_lib/format_nickname";

// Components
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Hooks
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/userContext";
import { createClient } from "@/_lib/supabase/client";

// Images
import logo from "@/imgs/logo.svg";
import {
  faArrowRightToBracket,
  faBars,
  faUserPlus,
  faUser,
  faChevronDown,
  faUsers,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

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
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [username, setUsername] = useState("");
  const { user, logout, userRole } = useUser();

  useEffect(() => {
    const get_user_name = async () => {
      if (!user?.id) return;

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(error);
          return;
        }

        setUsername(data.nome);
      } catch (e) {
        console.error(e);
      }
    };

    get_user_name();
  }, [user]);

  // fecha ao clicar fora :)
  useEffect(() => {
    const handle_click_outside = (e) => {
      if (!e.target.closest(".sistema_wrapper")) setIsSystemOpen(false);
    };
    document.addEventListener("click", handle_click_outside);
    return () => document.removeEventListener("click", handle_click_outside);
  }, []);

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

          {userRole == "admin" && (
            <li className="sistema_wrapper" style={{ position: "relative" }}>
              <button
                className={`${styles.link} ${styles.system_btn} ${pathname.includes("/sistema") || isSystemOpen ? styles.current_link : ""} `}
                onClick={() => setIsSystemOpen(!isSystemOpen)}
              >
                Sistema
                <FontAwesomeIcon
                  icon={faChevronDown}
                  size="xs"
                  style={{
                    marginLeft: 4,
                    transition: "transform 0.2s",
                    transform: isSystemOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {isSystemOpen && (
                <div className={styles.system_dropdown}>
                  <Link
                    className={styles.dropdown_links}
                    href="/sistema/usuarios"
                    onClick={() => setIsSystemOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUsers} size="sm" />
                    Usuários
                  </Link>
                  <Link
                    className={styles.dropdown_links}
                    href="/sistema/configuracoes"
                    onClick={() => setIsSystemOpen(false)}
                  >
                    <FontAwesomeIcon icon={faCog} size="sm" />
                    Configurações
                  </Link>
                </div>
              )}
            </li>
          )}
        </ul>

        <section className={styles.user_options}>
          {user ? (
            <>
              <Link href="/meu-perfil" className={styles.user_options_link}>
                {user?.user_metadata.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    width={25}
                    height={25}
                    loading="lazy"
                    alt="Avatar"
                    style={{ objectFit: "contain", borderRadius: "50%" }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} size="sm" />
                )}
                <span>
                  {username
                    ? username.length > 15
                      ? format_name(username)
                      : username
                    : "Carregando..."}
                </span>
              </Link>

              <button onClick={() => logout()} className={styles.logout_btn}>
                <FontAwesomeIcon icon={faArrowRightToBracket} size="sm" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.user_options_link}>
                <FontAwesomeIcon icon={faArrowRightToBracket} size="sm" />
                <span>Entrar</span>
              </Link>

              <Link href="/cadastrar-se" className={styles.user_options_link}>
                <FontAwesomeIcon icon={faUserPlus} size="sm" />
                <span>Cadastrar-se</span>
              </Link>
            </>
          )}
        </section>
      </section>

      {/* ================================================================= */}
      {/* LINKS PARA MOBILE */}
      {/* ================================================================= */}

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
            {userRole == "admin" && (
              <li style={{ "--i": links.length }} className="sistema_wrapper">
                <button
                  className={`${styles.link} ${styles.system_btn} ${pathname.includes("/sistema") ? styles.current_link : ""}`}
                  onClick={() => setIsSystemOpen((prev) => !prev)}
                >
                  Sistema
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    size="xs"
                    style={{
                      marginLeft: 4,
                      transition: "transform 0.2s",
                      transform: isSystemOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>

                <div
                  className={`${styles.submenu_system} ${isSystemOpen ? styles.submenu_system_open : ""}`}
                >
                  <Link
                    className={styles.submenu_system_link}
                    href="/sistema/usuarios"
                    onClick={() => {
                      setIsSystemOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faUsers} size="sm" />
                    Usuários
                  </Link>
                  <Link
                    className={styles.submenu_system_link}
                    href="/sistema/configuracoes"
                    onClick={() => {
                      setIsSystemOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faCog} size="sm" />
                    Configurações
                  </Link>
                </div>
              </li>
            )}
          </ul>

          <section className={styles.mobile_user_options}>
            {user ? (
              <>
                <Link href="/login" className={styles.user_options_link}>
                  {user?.user_metadata.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      width={25}
                      height={25}
                      loading="lazy"
                      alt="Avatar"
                      style={{ objectFit: "contain", borderRadius: "50%" }}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} size="sm" />
                  )}
                  <span>
                    {username
                      ? username.length > 15
                        ? format_name(username)
                        : username
                      : "Carregando..."}
                  </span>
                </Link>

                <button onClick={logout} className={styles.logout_btn}>
                  <FontAwesomeIcon icon={faArrowRightToBracket} size="sm" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.user_options_link}>
                  <FontAwesomeIcon icon={faArrowRightToBracket} size="sm" />
                  <span>Entrar</span>
                </Link>

                <Link href="/cadastrar-se" className={styles.user_options_link}>
                  <FontAwesomeIcon icon={faUserPlus} size="sm" />
                  <span>Cadastrar-se</span>
                </Link>
              </>
            )}
          </section>
        </section>
      </section>
    </header>
  );
};

export default Header;
