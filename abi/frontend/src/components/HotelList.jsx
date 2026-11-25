import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import HotelCard from './HotelCard';
import Pagination from './Pagination';
import {
  setSortBy,
  setViewMode,
  fetchHotels,
  resetFilters
} from '../features/hotels/hotelsSlice';
import { openAddModal } from '../features/ui/uiSlice';

const HotelList = () => {
  const dispatch = useDispatch();
  const {
    hotels,
    total,
    page,
    limit,
    sortBy,
    viewMode,
    loading,
    error,
    filters
  } = useSelector((state) => state.hotels);

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
    dispatch(fetchHotels());
  };

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(fetchHotels());
  };

  return (
    <section aria-label="Hotel Listings">
      {/* Top Bar matching reference image */}
      <div className="mdb-listing-top-bar d-flex flex-wrap justify-content-between align-items-center mb-3">
        {/* Left: Total items found text + Add Hotel Button */}
        <div className="d-flex align-items-center gap-3">
          <span className="mdb-items-found-text">
            <strong>{total}</strong> items found
          </span>
          <button
            type="button"
            onClick={() => dispatch(openAddModal())}
            className="btn btn-sm mdb-add-hotel-btn d-flex align-items-center gap-1"
            aria-label="Add New Hotel"
          >
            <Plus size={14} />
            <span>Add Hotel</span>
          </button>
        </div>

        {/* Right: Best match dropdown & View switcher */}
        <div className="d-flex align-items-center gap-2">
          {/* Best match dropdown */}
          <div className="mdb-sort-select-wrap">
            <select
              className="form-select form-select-sm mdb-sort-select"
              value={sortBy}
              onChange={handleSortChange}
              aria-label="Sort by"
            >
              <option value="best_match">Best match</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>
          </div>

          {/* View Toggles (List ☰ and Grid ⊞) */}
          <div className="mdb-view-toggle-group">
            <button
              type="button"
              className={`mdb-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => dispatch(setViewMode('list'))}
              title="List view"
              aria-label="List view"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>
            <button
              type="button"
              className={`mdb-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => dispatch(setViewMode('grid'))}
              title="Grid view"
              aria-label="Grid view"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-2" role="alert">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(fetchHotels())}
            className="btn btn-outline-danger btn-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="d-flex flex-column gap-3 my-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card p-3 placeholder-glow border" style={{ minHeight: '160px' }}>
              <div className="row g-0">
                <div className="col-md-3 bg-secondary opacity-25 rounded" style={{ height: '140px' }}></div>
                <div className="col-md-6 px-3">
                  <span className="placeholder col-7 mb-2 d-block"></span>
                  <span className="placeholder col-4 mb-2 d-block"></span>
                  <span className="placeholder col-10 mb-1 d-block"></span>
                  <span className="placeholder col-8 d-block"></span>
                </div>
                <div className="col-md-3 text-end d-flex flex-column justify-content-between">
                  <span className="placeholder col-6 ms-auto mb-2 d-block"></span>
                  <span className="placeholder col-8 ms-auto d-block"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : hotels.length === 0 ? (
        /* Empty State */
        <div className="card text-center p-5 my-4 border">
          <div className="mx-auto mb-3 text-muted">
            <AlertCircle size={44} className="text-secondary opacity-50" />
          </div>
          <h3 className="h5 fw-bold mb-2">No Hotels Found</h3>
          <p className="text-muted mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
            We couldn't find any hotel listings matching your current search and filter settings.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              onClick={handleReset}
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            >
              <RefreshCw size={14} />
              <span>Clear All Filters</span>
            </button>
            <button
              onClick={() => dispatch(openAddModal())}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            >
              <Plus size={14} />
              <span>Add a New Hotel</span>
            </button>
          </div>
        </div>
      ) : (
        /* Product Cards List matching reference image */
        <div>
          {viewMode === 'grid' ? (
            <div className="row g-3">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div>
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} viewMode="list" />
              ))}
            </div>
          )}

          {/* Centered Pagination */}
          <Pagination />
        </div>
      )}
    </section>
  );
};

export default HotelList;
