// Components
import Image from "next/image";
import Link from "next/link";

// Images
import logo from "@/imgs/logo.svg";

// Utils 
import styles from "./page.module.css";

const not_found = () => {
  return (
    <div className={styles.page}>
      <Image src={logo} alt="Logo" style={{ objectFit: "contain" }} loading="eager" />
      <h1 style={{textAlign: "center"}}><span style={{color: "var(--primary_red)"}}>404</span> - Ops, página não encontrada :(</h1>
      <Link className={styles.back_btn} href="/">Voltar para a página inicial</Link>
    </div>
  );
};

export default not_found;
