"use client";
// Utils
import styles from "./page.module.css";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Images
import {
  faMinus,
  faPlus,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Image from "next/image";
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";
import Divider from "@/app/components/Divider/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const supabase = createClient();

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [merchandise, setMerchandise] = useState([]);
  const [unitySelected, setUnitySelected] = useState(0);
  const showLoading = useSmartLoading(loading);

  const load_merchandise = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .filter("registro_ativo", "eq", true);

      if (error) {
        toast.error("Ocorreu um erro ao carregar os produtos");
        return;
      }

      console.log(data);
      setMerchandise(data);
    } catch (e) {
      toast.error("Ocorreu um erro desconhecido ao carregar os produtos");
      console.error(e);
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load_merchandise();
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section style={{ width: "100%", height: "100%" }}>
      {showLoading ? (
        <section className={styles.merchandise_page_wrapper}>
          <Loading />
        </section>
      ) : loading ? null : (
        <section className={styles.merchandise_page_wrapper}>
          <section className={styles.products_container}>
            {merchandise?.map((produto) => (
              <section key={produto.id} className={styles.product}>
                <section className={styles.image_wrapper}>
                  <Image
                    src={produto.img_url}
                    fill
                    style={{
                      objectFit: "contain",
                    }}
                    alt="Foto Notícia"
                    loading="eager"
                  />
                </section>

                <section className={styles.product_info}>
                  <h2 className={styles.product_name}>{produto.nome}</h2>
                  <p className={styles.product_price}>
                    R$ {produto.valor.toFixed(2)}
                  </p>
                </section>

                <section className={styles.product_unities_wrapper}>
                  {produto.unidades.map((unidade, index) => (
                    <button
                      key={index}
                      className={`${styles.unity} ${
                        unitySelected === index ? styles.unity_selected : ""
                      }`}
                      onClick={() => setUnitySelected(index)}
                    >
                      {unidade}
                    </button>
                  ))}
                </section>

                <Divider color="var(--foreground)" />

                <section className={styles.user_options}>
                  <button className={styles.quantity_button}>
                    <FontAwesomeIcon icon={faMinus} size="lg" />
                  </button>

                  <p className={styles.product_quantity}>0</p>

                  <button className={styles.quantity_button}>
                    <FontAwesomeIcon icon={faPlus} size="lg" />
                  </button>
                </section>

                <button className={styles.add_to_cart}>
                  <FontAwesomeIcon icon={faShoppingCart} size="sm" />
                  <span>Adicionar ao Carrinho</span>
                </button>
              </section>
            ))}
          </section>
        </section>
      )}
    </section>
  );
};

export default Page;
