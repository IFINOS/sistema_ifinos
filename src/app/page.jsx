// Utils
import styles from "./page.module.css";

// Components
import Image from "next/image";

// Images
import logo from "../imgs/logo.svg";

export default function Home() {
  return (
    <div className={styles.page}>
      <Image src={logo} alt="Logo" style={{ objectFit: "contain" }} />
      <h1>Em breve...</h1>
    </div>
  );
}
