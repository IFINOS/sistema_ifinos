"use client";
// Utils
import styles from "./Pagination.module.css";
import { get_pagination_range } from "@/_lib/utils/paginate";
import PropTypes from "prop-types";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
}) => {
  if (totalPages <= 1) return null;

  const pages = get_pagination_range(
    currentPage,
    totalPages,
    siblingCount,
    boundaryCount,
  );

  return (
    <section className={styles.pagination}>
      <button
        className={styles.pagination_btn}
        onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className={styles.pagination_dots}>
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`${styles.pagination_btn} ${
              currentPage === page ? styles.pagination_btn_active : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page + 1}
          </button>
        ),
      )}

      <button
        className={styles.pagination_btn}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
        disabled={currentPage === totalPages - 1}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </section>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
};

export default Pagination;
