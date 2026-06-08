// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import { faCopyright } from "@fortawesome/free-regular-svg-icons";

// Utils
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer_wrapper}>
      <p className={styles.site_version}>
        {process.env.NEXT_PUBLIC_SITE_VERSION}
      </p>
      <p className={styles.copy_warning}>
        <FontAwesomeIcon icon={faCopyright} size="sm" />
        <span>ifinos - {new Date().getFullYear()}</span>
      </p>
    </footer>
  );
};

export default Footer;
