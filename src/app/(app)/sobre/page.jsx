// Utils
import styles from "./page.module.css";
import layout from "../layout.module.css";

const page = () => {
  return (
    <section className={styles.about_texts_container}>
      <h1 className={layout.main_app_title}>Sobre o IFINOS</h1>
      <p className={styles.about_text}>
        Essa página foi criada para compartilhar as ações e os resultados de
        pesquisa do grupo ifinos. O trabalho começou como um grupo de estudos do
        campus Assis Chateaubriand do IFPR, chamado de Grupo de Estudos em
        Computação Física e Sistemas Embarcados, e evoluiu para um Grupo de
        Pesquisas cadastrado no{" "}
        <a
          className={styles.about_link}
          href="http://dgp.cnpq.br/dgp/espelhogrupo/3372312546337683"
        >
          Diretório de Grupos do CNPq
        </a>
        , a partir da união com o Grupo de Pesquisas gesin (Energias,
        Sustentabilidade, Inovação e Mobilidades).
      </p>

      <p className={styles.about_text}>
        A página é resultado do trabalho de estudantes participantes dos
        projetos do grupo.
      </p>

      <p className={styles.about_text}>
        Sua criação iniciou-se com a aluna{" "}
        <b>Roberta Aparecida da Silva Alcântara</b>, então no segundo ano do
        Curso Técnico em Informática Integrado ao Ensino Médio (IIN2014).
      </p>

      <p className={styles.about_text}>
        Na sequência, o aluno <b>Gabriel Raimundo Santos</b>, do primeiro
        semestre do Curso Técnico Subsequente em Eletromecânica (ELM2016), ficou
        responsável por reorganizar os tópicos existentes na página. Trabalhou
        em conjunto com <b>Kassume Elisângela de Freitas Wakimoto Luquini</b>,
        então estudante do primeiro ano do Curso de Tecnologia em Análise e
        Desenvolvimento de Sistemas (TADS2016).
      </p>

      <p className={styles.about_text}>
        Posteriormente, a página esteve a cargo do aluno{" "}
        <b>Samuel Stephan Milczuk</b>, estudante do primeiro ano do Curso de
        Tecnologia em Análise e Desenvolvimento de Sistemas (TADS2017) que, além
        de fazer a manutenção da página, trabalhou na sua evolução visual.
      </p>

      <p className={styles.about_text}>
        Em seguida, a manutenção e a evolução visual do site foram assumidas por{" "}
        <b>Paola Julie dos Santos da Silva</b>, na época aluna do IFPR no curso
        de programação de sistemas básicos (Do Zero ao Um) e, posteriormente,
        estudante de Análise e Desenvolvimento de Sistemas no Biopark.
      </p>
    </section>
  );
};

export default page;
