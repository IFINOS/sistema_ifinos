"use client";
// Utils
import styles from "./page.module.css";
import layout from "../../layout.module.css";

// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useUser } from "@/context/userContext";
import { useState, useEffect, useCallback } from "react";
import { useSmartLoading } from "@/_lib/hooks/useSmartLoading";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";
import StatusBadge from "@/app/components/StatusBadge/StatusBadge";
import Pagination from "@/app/components/Pagination/Pagination";

const ORDERS_PER_PAGE = 8;

const supabase = createClient();

const Page = () => {
  const { user, loading: userLoading } = useUser();
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [confirmingCancelId, setConfirmingCancelId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  const loading = ordersLoading || userLoading;
  const showLoading = useSmartLoading(loading);

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

  const load_orders = useCallback(
    async (page = 0) => {
      if (!user) return;

      setOrdersLoading(true);

      try {
        const from = page * ORDERS_PER_PAGE;
        const to = from + ORDERS_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from("pedidos")
          .select(
            `
            id,
            status,
            data_criacao,
            produtos_pedidos (
              quantidade,
              unidade,
              valor,
              produtos ( nome, img_url )
            )
          `,
            { count: "exact" },
          )
          .eq("usuario_id", user.id)
          .filter("registro_ativo", "eq", true)
          .order("data_criacao", { ascending: false })
          .range(from, to);

        if (error) {
          toast.error("Erro ao carregar seus pedidos.");
          return;
        }

        setOrders(data ?? []);
        setTotalOrders(count ?? 0);
      } catch (e) {
        toast.error("Erro desconhecido ao carregar seus pedidos.");
        console.error(e);
      } finally {
        setOrdersLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      const timeout = setTimeout(() => {
        setOrdersLoading(false);
      }, 0);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      load_orders(currentPage);
    }, 0);

    return () => clearTimeout(timeout);
  }, [user, userLoading, currentPage, load_orders]);

  const handle_cancel = async (pedidoId) => {
    setCancelingId(pedidoId);

    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: "cancelado" })
        .eq("id", pedidoId)
        .eq("usuario_id", user.id);

      if (error) {
        toast.error("Erro ao cancelar o pedido.");
        return;
      }

      setOrders((prev) =>
        prev.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, status: "cancelado" } : pedido,
        ),
      );

      toast.success("Pedido cancelado.");
    } catch (e) {
      toast.error("Erro desconhecido ao cancelar o pedido.");
      console.error(e);
    } finally {
      setCancelingId(null);
      setConfirmingCancelId(null);
    }
  };

  return (
    <>
      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
      {confirmingCancelId && (
        <div
          className={styles.modal_overlay}
          onClick={() => setConfirmingCancelId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modal_title}>Cancelar Pedido</h2>
            <p className={styles.modal_description}>
              Tem certeza que deseja cancelar este pedido?
            </p>
            <section className={styles.modal_actions}>
              <button
                className={styles.modal_cancel_btn}
                onClick={() => setConfirmingCancelId(null)}
              >
                Não Cancelar Pedido
              </button>
              <button
                className={styles.modal_confirm_btn}
                onClick={() => handle_cancel(confirmingCancelId)}
                disabled={cancelingId === confirmingCancelId}
              >
                {cancelingId === confirmingCancelId
                  ? "Cancelando..."
                  : "Cancelar Pedido"}
              </button>
            </section>
          </div>
        </div>
      )}

      <section style={{ width: "100%", height: "100%" }}>
        <BackButton route="/merchandise" />
        <h1 className={layout.main_app_title}>Meus Pedidos</h1>

        {showLoading ? (
          <Loading />
        ) : loading ? null : (
          <>
            <section className={styles.orders_wrapper}>
              {orders.length > 0 ? (
                orders.map((pedido) => {
                  const total = (pedido.produtos_pedidos ?? []).reduce(
                    (acc, item) => acc + Number(item.valor) * item.quantidade,
                    0,
                  );

                  const canCancel = pedido.status === "pendente";

                  return (
                    <section key={pedido.id} className={styles.order}>
                      <header className={styles.order_header}>
                        <p className={styles.order_date}>
                          Pedido em{" "}
                          {new Date(pedido.data_criacao).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                        <StatusBadge status={pedido.status} />
                      </header>

                      <section className={styles.order_items}>
                        {(pedido.produtos_pedidos ?? []).map((item, i) => (
                          <p key={i} className={styles.order_item}>
                            {item.quantidade}x {item.produtos?.nome} (
                            {item.unidade}) — R${" "}
                            {(Number(item.valor) * item.quantidade).toFixed(2)}
                          </p>
                        ))}
                      </section>

                      <footer className={styles.order_footer}>
                        <p className={styles.order_total}>
                          Total: R$ {total.toFixed(2)}
                        </p>

                        {canCancel && (
                          <button
                            type="button"
                            className={styles.cancel_btn}
                            onClick={() => setConfirmingCancelId(pedido.id)}
                          >
                            Cancelar Pedido
                          </button>
                        )}
                      </footer>
                    </section>
                  );
                })
              ) : (
                <p>Você ainda não fez nenhum pedido.</p>
              )}
            </section>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </section>
    </>
  );
};

export default Page;
