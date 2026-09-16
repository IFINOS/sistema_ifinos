"use client";
// Hooks
import { createClient } from "@/_lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Utils
import styles from "./page.module.css";
import layout from "../../../layout.module.css";

// Components
import BackButton from "@/app/components/BackButton/BackButton";
import { toast } from "sonner";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const supabase = createClient();

const validate_form = (data) => {
  const errors = {};

  if (!data.nome || data.nome.trim().length < 3) {
    errors.nome = "Nome deve ter pelo menos 3 caracteres.";
  }

  if (!data.valor || Number(data.valor) <= 0) {
    errors.valor = "Informe um valor válido.";
  }

  if (!data.quantidade || Number(data.quantidade) < 0) {
    errors.quantidade = "Informe uma quantidade válida.";
  }

  if (!data.unidades || data.unidades.length === 0) {
    errors.unidades = "Adicione pelo menos um tamanho/unidade.";
  }

  if (!data.img_url) {
    errors.img_url = "Envie uma imagem do produto.";
  }

  return errors;
};

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valor: "",
    quantidade: "",
    unidades: [],
    img_url: null,
  });
  const [novaUnidade, setNovaUnidade] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handle_change = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const add_unidade = () => {
    const valor = novaUnidade.trim().toUpperCase();
    if (!valor) return;
    if (formData.unidades.includes(valor)) {
      toast.error("Essa unidade já foi adicionada.");
      return;
    }

    handle_change("unidades", [...formData.unidades, valor]);
    setNovaUnidade("");
  };

  const remove_unidade = (unidade) => {
    handle_change(
      "unidades",
      formData.unidades.filter((u) => u !== unidade),
    );
  };

  const handle_unidade_keydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add_unidade();
    }
  };

  const handle_submit = async (e) => {
    e.preventDefault();

    const validationErrors = validate_form(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Confira os campos destacados antes de enviar.");
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const { data: produto, error } = await supabase
        .from("produtos")
        .insert({
          nome: formData.nome,
          descricao: formData.descricao || null,
          valor: Number(formData.valor),
          quantidade: Number(formData.quantidade),
          unidades: formData.unidades,
          img_url: formData.img_url,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Erro ao cadastrar produto.");
        return;
      }

      toast.success("Produto cadastrado com sucesso!");
      router.push("/merchandise/gerenciar");
    } catch (e) {
      toast.error("Erro desconhecido ao cadastrar produto.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.register_product_main_page}>
      <header className={styles.header_register_product_main_page}>
        <BackButton />
        <h1 className={layout.main_app_title}>Cadastrar Produto</h1>
      </header>

      <form className={styles.product_form} onSubmit={handle_submit}>
        <section className={styles.input_wrapper}>
          <label htmlFor="nome" className={styles.product_label}>
            Nome do produto
          </label>
          <input
            id="nome"
            className={`${styles.product_input} ${errors.nome ? styles.input_invalid : ""}`}
            value={formData.nome}
            onChange={(e) => handle_change("nome", e.target.value)}
          />
          {errors.nome && (
            <span className={styles.field_error}>{errors.nome}</span>
          )}
        </section>

        <section className={styles.input_wrapper}>
          <label htmlFor="descricao" className={styles.product_label}>
            Descrição (opcional)
          </label>
          <textarea
            id="descricao"
            className={styles.product_textarea}
            rows={4}
            value={formData.descricao}
            onChange={(e) => handle_change("descricao", e.target.value)}
          />
        </section>

        <section className={styles.input_row}>
          <section className={styles.input_wrapper}>
            <label htmlFor="valor" className={styles.product_label}>
              Valor (R$)
            </label>
            <input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              className={`${styles.product_input} ${errors.valor ? styles.input_invalid : ""}`}
              value={formData.valor}
              onChange={(e) => handle_change("valor", e.target.value)}
            />
            {errors.valor && (
              <span className={styles.field_error}>{errors.valor}</span>
            )}
          </section>

          <section className={styles.input_wrapper}>
            <label htmlFor="quantidade" className={styles.product_label}>
              Quantidade em estoque
            </label>
            <input
              id="quantidade"
              type="number"
              min="0"
              className={`${styles.product_input} ${errors.quantidade ? styles.input_invalid : ""}`}
              value={formData.quantidade}
              onChange={(e) => handle_change("quantidade", e.target.value)}
            />
            {errors.quantidade && (
              <span className={styles.field_error}>{errors.quantidade}</span>
            )}
          </section>
        </section>

        <section className={styles.input_wrapper}>
          <label htmlFor="unidade" className={styles.product_label}>
            Tamanhos / Unidades disponíveis
          </label>
          <section className={styles.add_unidade_wrapper}>
            <input
              id="unidade"
              className={styles.product_input}
              value={novaUnidade}
              onChange={(e) => setNovaUnidade(e.target.value)}
              onKeyDown={handle_unidade_keydown}
              placeholder="Ex: P, M, G, Único..."
            />
            <button
              type="button"
              className={styles.add_unidade_btn}
              onClick={add_unidade}
            >
              Adicionar
            </button>
          </section>

          {formData.unidades.length > 0 && (
            <section className={styles.unidades_chips_wrapper}>
              {formData.unidades.map((unidade) => (
                <span key={unidade} className={styles.unidade_chip}>
                  {unidade}
                  <button
                    type="button"
                    onClick={() => remove_unidade(unidade)}
                    className={styles.remove_chip_btn}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </span>
              ))}
            </section>
          )}

          {errors.unidades && (
            <span className={styles.field_error}>{errors.unidades}</span>
          )}
        </section>

        <section className={styles.input_wrapper}>
          <label className={styles.product_label}>Imagem do produto</label>
          <ImageUpload
            value={formData.img_url}
            onChange={(url) => handle_change("img_url", url)}
            uploadEndpoint="/api/upload/produto"
            error={errors.img_url}
          />
        </section>

        <button
          type="submit"
          className={styles.submit_btn}
          disabled={submitting}
        >
          {submitting ? "Cadastrando..." : "Cadastrar Produto"}
        </button>
      </form>
    </section>
  );
};

export default Page;
