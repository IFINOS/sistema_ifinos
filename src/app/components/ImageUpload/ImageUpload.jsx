"use client";
// Hooks
import { useState, useRef } from "react";

// Utils
import styles from "./ImageUpload.module.css";
import PropTypes from "prop-types";

// Components
import { toast } from "sonner";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";

const ImageUpload = ({ value, onChange, uploadEndpoint, error }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handle_file_change = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.");
      return;
    }

    setUploading(true);

    try {
      const signResponse = await fetch(uploadEndpoint, { method: "POST" });
      const signData = await signResponse.json();

      if (!signResponse.ok) {
        toast.error(signData.error ?? "Erro ao autorizar o upload.");
        return;
      }

      const { signature, timestamp, folder, apiKey, cloudName } = signData;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        toast.error("Erro ao enviar a imagem. Tente novamente.");
        return;
      }

      onChange(uploadResult.secure_url);
    } catch (err) {
      toast.error("Erro desconhecido ao enviar a imagem.");
      console.error(err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handle_remove_image = () => {
    onChange(null);
  };

  return (
    <section className={styles.upload_wrapper}>
      {value ? (
        <section className={styles.preview_wrapper}>
          <Image
            src={value}
            alt="Prévia da imagem"
            width={480}
            height={270}
            className={styles.preview_image}
          />
          <button
            type="button"
            className={styles.remove_btn}
            onClick={handle_remove_image}
          >
            <FontAwesomeIcon icon={faXmark} />
            Remover imagem
          </button>
        </section>
      ) : (
        <label className={styles.upload_dropzone}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handle_file_change}
            disabled={uploading}
            className={styles.upload_input}
          />
          <FontAwesomeIcon icon={faUpload} size="xl" />
          <span>
            {uploading ? "Enviando..." : "Clique para selecionar uma imagem"}
          </span>
        </label>
      )}

      {error && <span className={styles.field_error}>{error}</span>}
    </section>
  );
};

ImageUpload.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  uploadEndpoint: PropTypes.string.isRequired,
  error: PropTypes.string,
};

export default ImageUpload;
