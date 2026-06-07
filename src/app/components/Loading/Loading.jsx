// Utils
import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.loading_container}>
      <div className={styles.spinner} />
      <p>Carregando...</p>
    </div>
  );
};

export default Loading;
