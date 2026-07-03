"use client";
// Utils
import styles from "./layout.module.css";

// Components
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Image from "next/image";

// Images
import in_development from "@/imgs/coming_soon.svg";

// Hooks
import { useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";

const Layout = () => {
  useEffect(() => {
    const pending = sessionStorage.getItem("pending_email");
    if (!pending) return;

    // só remove se o usuário estiver autenticado
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) sessionStorage.removeItem("pending_email");
    });
  }, []);
  return (
    <>
      <Header />
      <section className={styles.indevelopment_wrapper}>
        <Image
          src={in_development}
          alt="Em desenvolvimento"
          className={styles.indevelopment_img}
          style={{ objectFit: "contain" }}
          loading="eager" // estabelecendo um padrão aonde a logo é a prioridade em carregar
        />

        <h1
          style={{
            fontSize: "clamp(1.5rem, calc(.4938vw + 1.4074rem), 2rem)",
          }}
        >
          Esta página está em desenvolvimento
        </h1>
        <p>Estamos trabalhando nisso, volte mais tarde! :)</p>
      </section>
      <Footer />
    </>
  );
};

export default Layout;
