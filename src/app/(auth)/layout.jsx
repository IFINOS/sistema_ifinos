// Utils
import styles from "./layout.module.css";

// Components
import Image from "next/image";

// Images
import logo from "@/imgs/logo.svg";

const layout = ({ children }) => {
  return (
    <main className={styles.auth_main_wrapper}>
      <Image src={logo} width={280} height={100} alt="Logo" loading="eager" />
      <section className={styles.auth_container}>{children}</section>
    </main>
  );
};

export default layout;
