// Components
import Image from "next/image";
import Link from "next/link";

// Images
import logo from "@/imgs/logo.svg";

const NotFound = () => {
  return (
    <div className="page">
      <Image
        src={logo}
        alt="Logo"
        width={320}
        height={120}
        style={{ objectFit: "contain" }}
        loading="eager"
      />
      <h1 style={{ textAlign: "center" }}>
        <span style={{ color: "var(--primary_red)" }}>404</span> - Ops, página
        não encontrada :(
      </h1>
      <Link className="back_btn" href="/home">
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default NotFound;
