// Utils
import styles from "./NewsContainer.module.css";
import PropTypes from "prop-types";

// Components
import Link from "next/link";

const NewsContainer = ({ news_obj }) => {
  const limit_description = (text) => {
    return text.length > 200 ? text.slice(0, 200) + "..." : text;
  };

  const format_date = (date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className={styles.news_container}>
      <header className={styles.news_header}>
        <Link href={`home/${news_obj.id}`}>
          <h2 className={styles.title}>{news_obj.titulo_publicacao}</h2>
        </Link>
        <p className={styles.date}>{format_date(news_obj.data_publicacao)}</p>
      </header>

      <section className={styles.news_description}>
        {news_obj.resumo ? (
          <p className={styles.description}>
            {limit_description(news_obj.resumo)}
            <Link href={`/home/${news_obj.id}`} className={styles.read_more}>
              {" "}
              Ler mais
            </Link>
          </p>
        ) : (
          <Link href={`/home/${news_obj.id}`} className={styles.read_more}>
            Ler mais...
          </Link>
        )}
      </section>
    </section>
  );
};

NewsContainer.PropTypes = {
  news_obj: PropTypes.object,
};

export default NewsContainer;
