"use client";
// Utils
import styles from "./layout.module.css";

// Components
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

// Hooks
import { useEffect } from "react";
import { createClient } from "@/_lib/supabase/client";

const Layout = ({ children }) => {
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
      <section className={styles.main_app_wrapper}>{children}</section>
      <Footer />
    </>
  );
};

export default Layout;
