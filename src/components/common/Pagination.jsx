import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Pagination component.
 *
 * @param {number} currentPage  - 1-indexed current page
 * @param {number} totalPages   - Total number of pages
 * @param {function} onPageChange - Called with new page number
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2; // pages around the current page
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  const btnBase =
    'inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900';
  const activeBtn = `${btnBase} bg-primary-600 text-white shadow-soft`;
  const inactiveBtn = `${btnBase} text-secondary-600 dark:text-slate-300 hover:bg-secondary-100 dark:hover:bg-slate-800`;
  const disabledBtn = `${btnBase} text-secondary-300 dark:text-slate-600 cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1 mt-6" aria-label="Pagination">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={currentPage === 1 ? disabledBtn : inactiveBtn}
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      {/* First page + ellipsis */}
      {left > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={inactiveBtn}>1</button>
          {left > 2 && <span className="px-1 text-secondary-400">…</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={p === currentPage ? activeBtn : inactiveBtn}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {/* Last page + ellipsis */}
      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span className="px-1 text-secondary-400">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={inactiveBtn}>{totalPages}</button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? disabledBtn : inactiveBtn}
        aria-label="Next page"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
