import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPage, fetchHotels } from '../features/hotels/hotelsSlice';

const Pagination = () => {
  const dispatch = useDispatch();
  const { page, totalPages, total } = useSelector((state) => state.hotels);

  const pagesCount = Math.max(totalPages, 5); // Display 1 2 3 4 5 like in the reference screenshot

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(setPage(newPage));
    dispatch(fetchHotels());
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const pagesArray = [];
  for (let i = 1; i <= pagesCount; i++) {
    pagesArray.push(i);
  }

  return (
    <nav className="d-flex justify-content-center my-4" aria-label="Pagination">
      <ul className="mdb-pagination">
        {/* Previous */}
        <li>
          <button
            type="button"
            className="mdb-page-btn"
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous"
          >
            &lt;
          </button>
        </li>

        {/* Page numbers */}
        {pagesArray.map((num) => (
          <li key={num}>
            <button
              type="button"
              className={`mdb-page-btn ${num === page ? 'active' : ''}`}
              onClick={() => handlePageChange(num)}
              aria-label={`Page ${num}`}
            >
              {num}
            </button>
          </li>
        ))}

        {/* Next */}
        <li>
          <button
            type="button"
            className="mdb-page-btn"
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Next"
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
