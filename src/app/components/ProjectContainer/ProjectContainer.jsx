// Utils
import styles from "./ProjectContainer.module.css";
import PropTypes from "prop-types";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ProjectContainer = ({ project_obj, icon, children }) => {
  const limit_description = (text) => {
    return text.length > 200 ? text.slice(0, 200) + "..." : text;
  };

  return (
    <section className={styles.project_container}>
      <section className={styles.content_wrapper}>
        <header className={styles.content_header}>
          <section className={styles.img_wrapper}>
            <div className={styles.project_icon}>
              <FontAwesomeIcon icon={icon} size="xl" />
            </div>
          </section>

          <section className={styles.project_infos_header}>
            <h2 className={styles.project_title}>
              {project_obj.titulo_projeto}
            </h2>

            <section className={styles.project_tags_wrapper}>
              {project_obj.tags?.map((tag) => (
                <span key={tag.id} className={styles.project_tag}>
                  {tag.nome}
                </span>
              ))}
            </section>
          </section>
        </header>

        <p className={styles.project_description}>
          {limit_description(project_obj.descricao)}
        </p>

        <section className={styles.infos}>{children}</section>
      </section>
    </section>
  );
};

ProjectContainer.propTypes = {
  project_obj: PropTypes.object,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node,
};

export default ProjectContainer;
