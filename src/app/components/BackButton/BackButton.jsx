// Utils
import styles from "./BackButton.module.css";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import { faReply } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <button className={styles.back_btn} onClick={() => router.back()}>
      <FontAwesomeIcon icon={faReply} size="lg" />
      <span>Voltar</span>
    </button>
  );
};

export default BackButton;
