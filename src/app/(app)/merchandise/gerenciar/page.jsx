"use client";
// Utils
import styles from "./page.module.css";
import { PEDIDO_STATUS_OPTIONS } from "@/_lib/constants/pedidoStatus";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Images
import {
  faPen,
  faTrash,
  faAdd,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import Image from "next/image";
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StatusBadge from "@/app/components/StatusBadge/StatusBadge";

const supabase = createClient();

const Page = () => {
  const [loading, setLoading] = useState(true);
  const showLoading = useSmartLoading(loading);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [openSection, setOpenSection] = useState("produtos");
  const [deletingProductId, setDeletingProductId] = useState(null);

  const load_products = useCallback(async () => {
    try {
      const { data, error, count } = await supabase
        .from("produtos")
        .select("*", { count: "exact" })
        .filter("registro_ativo", "eq", true);

      if (error) {
        toast.error("Ocorreu um erro ao carregar os produtos");
        return;
      }

      setTotalProducts(count ?? 0);
      setProducts(data ?? []);
    } catch (e) {
      toast.error("Ocorreu um erro desconhecido ao carregar os produtos");
      console.error(e);
    }
  }, []);

  const load_orders = useCallback(async () => {
    try {
      const { data, error, count } = await supabase
        .from("pedidos")
        .select(
          `
          id,
          status,
          data_criacao,
          usuarios ( id, nome ),
          produtos_pedidos (
            quantidade,
            unidade,
            valor,
            produtos ( nome )
          )
        `,
          { count: "exact" },
        )
        .filter("registro_ativo", "eq", true)
        .order("data_criacao", { ascending: false });

      if (error) {
        toast.error("Ocorreu um erro ao carregar os pedidos");
        return;
      }

      setTotalOrders(count ?? 0);
      setOrders(data ?? []);
    } catch (e) {
      toast.error("Ocorreu um erro desconhecido ao carregar os pedidos");
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      await Promise.all([load_products(), load_orders()]);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [load_products, load_orders]);

  const handle_status_change = async (pedidoId, novoStatus) => {
    setUpdatingOrderId(pedidoId);

    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: novoStatus })
        .eq("id", pedidoId);

      if (error) {
        toast.error("Erro ao atualizar o status do pedido.");
        return;
      }

      // atualiza localmente sem precisar recarregar tudo
      setOrders((prev) =>
        prev.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, status: novoStatus } : pedido,
        ),
      );

      toast.success("Status atualizado!");
    } catch (e) {
      toast.error("Erro desconhecido ao atualizar o pedido.");
      console.error(e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handle_delete = async () => {
    if (!deletingProductId) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("produtos")
        .update({
          registro_ativo: false,
        })
        .eq("id", deletingProductId);

      if (error) {
        toast.error("Erro ao apagar produto.");
        return;
      }

      toast.success("Projeto deletado com sucesso!");
      setDeletingProductId(null);
      setProducts((prev) => prev.filter((u) => u.id !== deletingProductId));
    } catch (e) {
      toast.error("Erro ao deletar projeto.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggle_section = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <>
      {/* MODAL DE CONFIRMAÇÃO DE DELETE */}
      {deletingProductId && (
        <div
          className={styles.modal_overlay}
          onClick={() => setDeletingUserId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modal_title}>Deletar produto</h2>
            <p className={styles.modal_description}>
              Tem certeza que deseja deletar este produto?
            </p>
            <section className={styles.modal_actions}>
              <button
                className={styles.modal_cancel_btn}
                onClick={() => setDeletingUserId(null)}
              >
                Não Deletar Produto
              </button>
              <button
                className={styles.modal_confirm_btn}
                onClick={handle_delete}
              >
                Deletar Produto
              </button>
            </section>
          </div>
        </div>
      )}

      <section style={{ width: "100%", height: "100%" }}>
        {showLoading ? (
          <section className={styles.manage_merchandise_page_wrapper}>
            <Loading />
          </section>
        ) : loading ? null : (
          <section className={styles.manage_merchandise_page_wrapper}>
            <header className={styles.manage_merchandise_header}>
              <BackButton route="/merchandise" />

              <Link
                href="/merchandise/gerenciar/cadastrar"
                className={styles.register_product_link}
              >
                <FontAwesomeIcon icon={faAdd} size="sm" />
                Cadastrar Produto
              </Link>
            </header>

            <section className={styles.merchandise_infos_wrapper}>
              {/* SEÇÃO DE PRODUTOS */}
              <section className={styles.merchandise_products_wrapper}>
                <header className={styles.header_merchandise_products_wrapper}>
                  <h2 className={styles.info_section_title}>
                    Produtos ({totalProducts})
                  </h2>

                  <button
                    type="button"
                    className={`${styles.info_section_title_icon} ${
                      openSection === "produtos" ? styles.icon_open : ""
                    }`}
                    onClick={() => toggle_section("produtos")}
                  >
                    <FontAwesomeIcon icon={faChevronDown} size="lg" />
                  </button>
                </header>

                {openSection === "produtos" && (
                  <section className={styles.products_container}>
                    {products.length > 0 ? (
                      products.map((produto) => (
                        <section key={produto.id} className={styles.product}>
                          <section className={styles.products_main_info}>
                            <section className={styles.image_wrapper}>
                              <Image
                                src={produto.img_url}
                                fill
                                style={{ objectFit: "contain" }}
                                alt={produto.nome}
                                loading="eager"
                              />
                            </section>

                            <section className={styles.product_info}>
                              <h3 className={styles.product_name}>
                                {produto.nome}
                              </h3>
                              <p className={styles.product_price}>
                                R$ {Number(produto.valor).toFixed(2)}
                              </p>
                            </section>
                          </section>

                          <section className={styles.products_options}>
                            <Link
                              href={`/merchandise/gerenciar/${produto.id}`}
                              className={styles.admin_option}
                            >
                              <FontAwesomeIcon
                                icon={faPen}
                                color="var(--foreground)"
                                size="xl"
                              />
                            </Link>

                            <button
                              type="button"
                              className={styles.admin_option}
                              onClick={() => setDeletingProductId(produto.id)}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                color="var(--primary_red)"
                                size="xl"
                              />
                            </button>
                          </section>
                        </section>
                      ))
                    ) : (
                      <p>Nenhum produto cadastrado.</p>
                    )}
                  </section>
                )}
              </section>

              {/* SEÇÃO DE PEDIDOS */}
              <section className={styles.merchandise_products_wrapper}>
                <header className={styles.header_merchandise_products_wrapper}>
                  <h2 className={styles.info_section_title}>
                    Pedidos ({totalOrders})
                  </h2>

                  <button
                    type="button"
                    className={`${styles.info_section_title_icon} ${
                      openSection === "pedidos" ? styles.icon_open : ""
                    }`}
                    onClick={() => toggle_section("pedidos")}
                  >
                    <FontAwesomeIcon icon={faChevronDown} size="lg" />
                  </button>
                </header>

                {openSection === "pedidos" && (
                  <section className={styles.orders_container}>
                    {orders.length > 0 ? (
                      orders.map((pedido) => (
                        <section key={pedido.id} className={styles.order}>
                          <header className={styles.order_header}>
                            <div>
                              <p className={styles.order_requester}>
                                {pedido.usuarios?.nome ??
                                  "Usuário desconhecido"}
                              </p>
                              <p className={styles.order_date}>
                                {new Date(
                                  pedido.data_criacao,
                                ).toLocaleDateString("pt-BR")}
                              </p>
                            </div>

                            <StatusBadge status={pedido.status} />
                          </header>

                          <section className={styles.order_items}>
                            {(pedido.produtos_pedidos ?? []).map((item, i) => (
                              <p key={i} className={styles.order_item}>
                                {item.quantidade}x {item.produtos?.nome} (
                                {item.unidade}) — R${" "}
                                {(Number(item.valor) * item.quantidade).toFixed(
                                  2,
                                )}
                              </p>
                            ))}
                          </section>

                          <section className={styles.order_footer}>
                            <p className={styles.order_total}>
                              Total: R${" "}
                              {(pedido.produtos_pedidos ?? [])
                                .reduce(
                                  (acc, item) =>
                                    acc + Number(item.valor) * item.quantidade,
                                  0,
                                )
                                .toFixed(2)}
                            </p>

                            <select
                              className={styles.order_status_select}
                              value={pedido.status}
                              disabled={updatingOrderId === pedido.id}
                              onChange={(e) =>
                                handle_status_change(pedido.id, e.target.value)
                              }
                            >
                              {PEDIDO_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </section>
                        </section>
                      ))
                    ) : (
                      <p>Nenhum pedido encontrado.</p>
                    )}
                  </section>
                )}
              </section>
            </section>
          </section>
        )}
      </section>
    </>
  );
};

export default Page;
