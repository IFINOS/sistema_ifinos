// Utils
import styles from "./layout.module.css";

// Components
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Image from "next/image";

// Images
import in_development from "@/imgs/coming_soon.svg";

const Layout = () => {
  return (
    <>
      <Header />
      <section className={styles.indevelopment_wrapper}>
        <Image
          src={in_development}
          alt="Em desenvolvimento"
          className={styles.indevelopment_img}
          style={{ objectFit: "contain" }}
          loading="lazy" // estabelecendo um padrão aonde a logo é a prioridade em carregar
        />

        <h1
          style={{
            fontSize: "clamp(1.5rem, calc(.4938vw + 1.4074rem), 2rem)",
          }}
        >
          Esta página está em desenvolvimento
        </h1>
        <p>Estamos trabalhando nisso, volte mais tarde! :)</p>
      </section>
      {/* <Footer /> por hora não irei adicionar o footer */}
    </>
  );
};

export default Layout;
