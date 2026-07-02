"use client";
// Utils
import styles from "./page.module.css";
import layout from "../layout.module.css";
import { useUser } from "@/context/userContext";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import {
  faEnvelope,
  faUser,
  faMessage,
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useEffect, useState } from "react";

const page = () => {
  const [inputErrors, setInputErrors] = useState({});
  const { user } = useUser();

  // DEBUG
  // useEffect(() => {
  //   console.log(user);
  // }, [user]);

  const handle_submit = (e) => {
    e.preventDefault();
  };

  return (
    <section className={styles.contact_container}>
      <h1 className={layout.main_app_title}>Fale Conosco</h1>

      <form onSubmit={handle_submit} className={styles.contact_form}>
        <section className={styles.input_wrapper}>
          <label className={styles.input_label} htmlFor="name">
            Nome <FontAwesomeIcon icon={faUser} />
          </label>

          <input
            defaultValue={user ? user.user_metadata.full_name : ""}
            className={styles.input}
            type="text"
            name="name"
            id="name"
          />
        </section>

        <section className={styles.input_wrapper}>
          <label className={styles.input_label} htmlFor="email">
            Email <FontAwesomeIcon icon={faEnvelope} />
          </label>

          <input
            defaultValue={user ? user.email : ""}
            className={styles.input}
            type="email"
            name="email"
            id="email"
          />
        </section>

        <section className={styles.input_wrapper}>
          <label className={styles.input_label} htmlFor="message">
            Mensagem <FontAwesomeIcon icon={faMessage} />
          </label>

          <textarea
            className={styles.message_container}
            name="message"
            id="message"
            maxLength={1500}
            placeholder="Máximo de 1500 caracteres"
          ></textarea>
        </section>

        <button className={styles.send_message_btn} type="submit">
          Enviar
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </section>
  );
};

export default page;
