// Utils
import styles from "./StatusBadge.module.css";
import { PEDIDO_STATUS } from "@/_lib/constants/pedidoStatus";
import PropTypes from "prop-types";

const StatusBadge = ({ status }) => {
  const config = PEDIDO_STATUS[status] ?? { label: status, color: "#999" };

  return (
    <span
      className={styles.status_badge}
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;
