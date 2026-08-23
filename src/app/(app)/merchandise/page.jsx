"use client";
// Utils
import { formatarTelefone } from "@/_lib/utils/formatPhone";
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
} from "@fortawesome/free-solid-svg-icons";

// Components
import Image from "next/image";
import Loading from "@/app/components/Loading/Loading";
import { toast } from "sonner";
import Divider from "@/app/components/Divider/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const supabase = createClient();

const Page = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [merchandise, setMerchandise] = useState([]);
  const showLoading = useSmartLoading(loading);

  const [cart, setCart] = useState({});

  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    email: "",
    nome_camiseta: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

      setMerchandise(data ?? []);

      setCart((prev) => {
        const next = { ...prev };
        for (const produto of data ?? []) {
          if (!next[produto.id]) {
            next[produto.id] = {
              produto,
              unidade: produto.unidades?.[0] ?? null,
              quantidade: 0,
            };
          }
        }
        return next;
      });
    } catch (e) {
      toast.error("Ocorreu um erro desconhecido ao carregar os produtos");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load_merchandise();
    }, 0);

    return () => clearTimeout(timeout);
  }, [load_merchandise]);

  const set_unidade = (produtoId, unidade) => {
    setCart((prev) => ({
      ...prev,
      [produtoId]: { ...prev[produtoId], unidade },
    }));
  };

  const set_quantidade = (produtoId, quantidade) => {
    setCart((prev) => ({
      ...prev,
      [produtoId]: { ...prev[produtoId], quantidade: Math.max(quantidade, 0) },
    }));
  };

  // só os itens com quantidade > 0 entram de fato no pedido
  const itensDoCarrinho = Object.values(cart).filter(
    (item) => item.quantidade > 0,
  );

  const total = itensDoCarrinho.reduce(
    (acc, item) => acc + Number(item.produto.valor) * item.quantidade,
    0,
  );

  const handle_form_change = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handle_submit = async (e) => {
    e.preventDefault();

    const validationErrors = validate_form();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Confira os campos destacados antes de enviar.");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para fazer um pedido.");
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // 1. cria o pedido — só com os campos que já existem na tabela
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          usuario_id: user.id,
          status: "pendente",
        })
        .select("id")
        .single();

      if (pedidoError) {
        toast.error("Erro ao criar o pedido.");
        return;
      }

      // 2. insere os itens do pedido
      const { error: itensError } = await supabase
        .from("produtos_pedidos")
        .insert(
          itensDoCarrinho.map((item) => ({
            pedido_id: pedido.id,
            produto_id: item.produto.id,
            unidade: item.unidade,
            valor: item.produto.valor,
            quantidade: item.quantidade,
          })),
        );

      if (itensError) {
        toast.error("Pedido criado, mas houve erro ao registrar os itens.");
        return;
      }

      // 3. dispara o email com os dados de contato (nome, whatsapp, email,
      // nome na camiseta, observações) — esses dados NÃO são salvos no banco,
      // vão só no corpo do email para o responsável
      try {
        await fetch("/api/merchandise/pedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedidoId: pedido.id,
            ...formData,
            itens: itensDoCarrinho.map((item) => ({
              nome: item.produto.nome,
              unidade: item.unidade,
              quantidade: item.quantidade,
              valor: item.produto.valor,
            })),
            total,
          }),
        });
      } catch (emailErr) {
        console.error("Erro ao notificar por email:", emailErr);
      }

      toast.success("Pedido enviado com sucesso!");
      setCart({});
      setFormData({
        nome: "",
        whatsapp: "",
        email: "",
        nome_camiseta: "",
        observacoes: "",
      });
      load_merchandise();
    } catch (e) {
      toast.error("Erro desconhecido ao enviar o pedido.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ width: "100%", height: "100%" }}>
      {showLoading ? (
        <section className={styles.merchandise_page_wrapper}>
          <Loading />
        </section>
      ) : loading ? null : (
        <section className={styles.merchandise_page_wrapper}>
          <section className={styles.products_container}>
            {merchandise?.map((produto) => {
              const item = cart[produto.id] ?? {
                unidade: produto.unidades?.[0] ?? null,
                quantidade: 0,
              };

              /* ainda não componentizei pois podem haver outros produtos no fututor */
              return (
                <section key={produto.id} className={styles.product}>
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
                    <h2 className={styles.product_name}>{produto.nome}</h2>
                    <p className={styles.product_price}>
                      R$ {Number(produto.valor).toFixed(2)}
                    </p>
                  </section>

                  <section className={styles.product_unities_wrapper}>
                    {produto.unidades?.map((unidade) => (
                      <button
                        key={unidade}
                        type="button"
                        className={`${styles.unity} ${
                          item.unidade === unidade ? styles.unity_selected : ""
                        }`}
                        onClick={() => set_unidade(produto.id, unidade)}
                      >
                        {unidade}
                      </button>
                    ))}
                  </section>

                  <Divider color="var(--foreground)" />

                  <section className={styles.user_options}>
                    <button
                      type="button"
                      className={styles.quantity_button}
                      onClick={() =>
                        set_quantidade(produto.id, item.quantidade - 1)
                      }
                    >
                      <FontAwesomeIcon icon={faMinus} size="lg" />
                    </button>

                    <p className={styles.product_quantity}>{item.quantidade}</p>

                    <button
                      type="button"
                      className={styles.quantity_button}
                      onClick={() =>
                        set_quantidade(produto.id, item.quantidade + 1)
                      }
                    >
                      <FontAwesomeIcon icon={faPlus} size="lg" />
                    </button>
                  </section>
                </section>
              );
            })}
          </section>

          {itensDoCarrinho.length > 0 && (
            <section className={styles.cart_summary}>
              {itensDoCarrinho.map((item) => (
                <p key={item.produto.id} className={styles.cart_summary_item}>
                  {item.quantidade}x {item.produto.nome} ({item.unidade}) — R${" "}
                  {(Number(item.produto.valor) * item.quantidade).toFixed(2)}
                </p>
              ))}
              <p className={styles.cart_summary_total}>
                Total: R$ {total.toFixed(2)}
              </p>
            </section>
          )}

          {errors.carrinho && (
            <span className={styles.field_error}>{errors.carrinho}</span>
          )}

          <form className={styles.order_form} onSubmit={handle_submit}>
            <section className={styles.inputs_section}>
              <section className={styles.input_wrapper}>
                <label htmlFor="nome" className={styles.order_label}>
                  Nome completo
                </label>
                <input
                  id="nome"
                  className={`${styles.order_input} ${errors.nome ? styles.input_invalid : ""}`}
                  value={formData.nome}
                  onChange={(e) => handle_form_change("nome", e.target.value)}
                />
                {errors.nome && (
                  <span className={styles.field_error}>{errors.nome}</span>
                )}
              </section>

              <section className={styles.input_wrapper}>
                <label htmlFor="whatsapp" className={styles.order_label}>
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  className={`${styles.order_input} ${errors.whatsapp ? styles.input_invalid : ""}`}
                  value={formData.whatsapp}
                  onChange={(e) =>
                    handle_form_change(
                      "whatsapp",
                      formatarTelefone(e.target.value),
                    )
                  }
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                {errors.whatsapp && (
                  <span className={styles.field_error}>{errors.whatsapp}</span>
                )}
              </section>

              <section className={styles.input_wrapper}>
                <label htmlFor="email" className={styles.order_label}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`${styles.order_input} ${errors.email ? styles.input_invalid : ""}`}
                  value={formData.email}
                  onChange={(e) => handle_form_change("email", e.target.value)}
                />
                {errors.email && (
                  <span className={styles.field_error}>{errors.email}</span>
                )}
              </section>

              <section className={styles.input_wrapper}>
                <label htmlFor="nome_camiseta" className={styles.order_label}>
                  Nome para a camiseta (opcional)
                </label>
                <input
                  id="nome_camiseta"
                  className={styles.order_input}
                  value={formData.nome_camiseta}
                  onChange={(e) =>
                    handle_form_change("nome_camiseta", e.target.value)
                  }
                />
              </section>
            </section>

            <section className={styles.input_wrapper}>
              <label htmlFor="observacoes" className={styles.order_label}>
                Observações (opcional)
              </label>
              <textarea
                id="observacoes"
                className={styles.order_textarea}
                rows={4}
                value={formData.observacoes}
                onChange={(e) =>
                  handle_form_change("observacoes", e.target.value)
                }
              />
            </section>

            <button
              type="submit"
              className={styles.submit_order_btn}
              disabled={submitting}
            >
              <FontAwesomeIcon icon={faShoppingCart} size="sm" />
              <span>{submitting ? "Enviando..." : "Enviar Pedido"}</span>
            </button>
          </form>
        </section>
      )}
    </section>
  );
};

export default Page;
