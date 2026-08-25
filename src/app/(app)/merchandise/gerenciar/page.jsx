"use client";
// Utils
import styles from "./page.module.css";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useUser } from "@/context/userContext";
import { useState, useEffect, useCallback } from "react";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Images
import {
  faMinus,
  faPlus,
  faShoppingCart,
  faTrash,
  faAdd,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Image from "next/image";
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";
import Divider from "@/app/components/Divider/Divider";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const supabase = createClient();

const Page = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const showLoading = useSmartLoading(loading);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     load_merchandise();
  //   }, 0);

  //   return () => clearTimeout(timeout);
  // }, [load_merchandise]);

  const validate_form = () => {
    const newErrors = {};

    if (itensDoCarrinho.length === 0) {
      newErrors.carrinho = "Adicione pelo menos um item ao carrinho.";
    }
    if (!formData.nome || formData.nome.trim().length < 3) {
      newErrors.nome = "Informe seu nome completo.";
    }
    if (
      !formData.whatsapp ||
      formData.whatsapp.replace(/\D/g, "").length < 10
    ) {
      newErrors.whatsapp = "Informe um número de WhatsApp válido.";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Informe um email válido.";
    }

    return newErrors;
  };

  const handle_submit = async () => {};

  return (
    <section style={{ width: "100%", height: "100%" }}>
      {showLoading ? (
        <section className={styles.manage_merchandise_page_wrapper}>
          <Loading />
        </section>
      ) : loading ? null : (
        <section className={styles.manage_merchandise_page_wrapper}>
          <header className={styles.manage_merchandise_header}>
            <Link
              href="/merchandise/gerenciar/cadastrar"
              className={styles.register_product_link}
            >
              <FontAwesomeIcon icon={faAdd} size="sm" />
              Cadastrar Produto
            </Link>
          </header>

          <section className={styles.merchandise_infos_wrapper}>
            {/* Dividir  */}
          </section>
        </section>
      )}
    </section>
  );
};

export default Page;
