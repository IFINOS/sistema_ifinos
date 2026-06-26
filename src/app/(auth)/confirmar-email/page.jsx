"use client";
// Utils
import styles from "../layout.module.css";

// Components
import { toast } from "sonner";
import Loading from "@/app/components/Loading/Loading";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState, useEffect } from "react";

const page = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);

  /* NÃO DEIXAR CONSOLE.LOG NO CÓDIGO :) */

  useEffect(() => {
    const email = sessionStorage.getItem("pending_email");
    if (email) {
      setEmail(email);
    } else {
      // sem pending_email, provavelmente acessou direto — redireciona
      window.location.href = "/home";
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handle_resend_email = async () => {
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    if (error) {
      toast.error("Erro ao reenviar email. Tente novamente.");
      setLoading(false);
      return;
    }

    toast.success("Email reenviado! Verifique sua caixa de entrada.");
    setLoading(false);
  };

  return (
    <form className={styles.auth_form}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className={styles.auth_form_title}>Confirme seu email</h1>

          <p>
            Enviamos um email para <b>{email}</b>, acesse para ter sua conta
            validada :)
          </p>

          <button
            onClick={handle_resend_email}
            className={styles.auth_button}
            type="submit"
          >
            Reenviar Email
          </button>
          <span
            style={{
              fontSize: ".875rem",
              color: "var(--primary_red)",
              textAlign: "start",
              fontWeight: "600",
            }}
          >
            *Não se esqueça de verificar no span
          </span>
        </>
      )}
    </form>
  );
};

export default page;
