import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronUp, ChevronDown, Star } from 'lucide-react';
import {
  setCategory,
  setPriceFilter,
  setRating,
  resetFilters,
  fetchHotels
} from '../features/hotels/hotelsSlice';

const RELATED_ITEMS = [
  'Budget Hotels',
  'Luxury Hotels',
  'Resorts',
  'Business Hotels',
  'Family Hotels',
  'Boutique Stays',
  'Beachfront Villas',
  'Mountain Lodges'
];

const BRANDS = [
  { name: '5-Star Luxury', category: 'Luxury Hotels', count: 120, checked: true },
  { name: '4-Star Premium', category: 'Luxury Hotels', count: 78, checked: true },
  { name: 'Resorts & Spa', category: 'Resorts', count: 35, checked: true },
  { name: 'Business Suites', category: 'Business Hotels', count: 89, checked: true },
  { name: 'Family Lodges', category: 'Family Hotels', count: 38, checked: false },
  { name: 'Budget Express', category: 'Budget Hotels', count: 98, checked: false }
];

const ROOM_SIZES = ['1 Bed', '2 Bed', 'Suite', 'Deluxe', 'Villa'];

const RATINGS = [
  { value: '5', stars: 5, checked: true },
  { value: '4', stars: 4, checked: true },
  { value: '3', stars: 3, checked: true },
  { value: '2', stars: 2, checked: true }
];

const HotelSidebar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.hotels);

  // Collapsible section visibility
  const [collapsed, setCollapsed] = useState({
    related: false,
    brands: false,
    price: false,
    size: false,
    ratings: false
  });

  // Local price input states
  const [minPrice, setMinPrice] = useState(filters.minPrice || '0');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '1000');
  const [sliderVal, setSliderVal] = useState(filters.maxPrice || '500');
  const [selectedSize, setSelectedSize] = useState('Suite');

  const toggleSection = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryClick = (cat) => {
    dispatch(setCategory(cat));
    dispatch(fetchHotels());
  };

  const handlePriceApply = (e) => {
    if (e) e.preventDefault();
    dispatch(setPriceFilter({ minPrice, maxPrice }));
    dispatch(fetchHotels());
  };

  const handleSliderChange = (e) => {
    const val = e.target.value;
    setSliderVal(val);
    setMaxPrice(val);
    dispatch(setPriceFilter({ minPrice, maxPrice: val }));
    dispatch(fetchHotels());
  };

  const handleRatingSelect = (val) => {
    const newRating = filters.rating === val ? 'all' : val;
    dispatch(setRating(newRating));
    dispatch(fetchHotels());
  };

  return (
    <aside className="mdb-sidebar-card" aria-label="Filters">
      {/* 1. Related items */}
      <div className="mdb-sidebar-section">
        <div
          className="mdb-section-header"
          onClick={() => toggleSection('related')}
          role="button"
          tabIndex={0}
        >
          <span>Related items</span>
          {collapsed.related ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {!collapsed.related && (
          <ul className="mdb-related-list">
            {RELATED_ITEMS.map((item) => {
              const isActive = filters.category === item;
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(item)}
                    className={`mdb-related-link ${isActive ? 'active' : ''}`}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 2. Brands / Hotel Classes */}
      <div className="mdb-sidebar-section">
        <div
          className="mdb-section-header"
          onClick={() => toggleSection('brands')}
          role="button"
          tabIndex={0}
        >
          <span>Brands</span>
          {collapsed.brands ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {!collapsed.brands && (
          <div className="mdb-brands-list">
            {BRANDS.map((brand) => (
              <label key={brand.name} className="mdb-brand-row">
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input mdb-checkbox"
                    checked={filters.category === brand.category || (filters.category === 'All' && brand.checked)}
                    onChange={() => handleCategoryClick(brand.category)}
                  />
                  <span className="mdb-brand-name">{brand.name}</span>
                </div>
                <span className="mdb-brand-count">{brand.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 3. Price Filter */}
      <div className="mdb-sidebar-section">
        <div
          className="mdb-section-header"
          onClick={() => toggleSection('price')}
          role="button"
          tabIndex={0}
        >
          <span>Price</span>
          {collapsed.price ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {!collapsed.price && (
          <form onSubmit={handlePriceApply} className="mdb-price-filter">
            {/* Range Slider matching image */}
            <div className="mb-3">
              <input
                type="range"
                className="form-range mdb-price-range"
                min="0"
                max="1000"
                step="25"
                value={sliderVal}
                onChange={handleSliderChange}
                aria-label="Price range slider"
              />
            </div>

            {/* Min and Max Input Boxes */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <span className="mdb-input-label">Min</span>
                <input
                  type="text"
                  className="form-control mdb-sidebar-input"
                  value={`$${minPrice}`}
                  onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className="col-6">
                <span className="mdb-input-label">Max</span>
                <input
                  type="text"
                  className="form-control mdb-sidebar-input"
                  value={`$${maxPrice}`}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>

            {/* Full-width white APPLY button */}
            <button
              type="submit"
              className="btn mdb-apply-btn w-100"
            >
              APPLY
            </button>
          </form>
        )}
      </div>

      {/* 4. Room Type / Size */}
      <div className="mdb-sidebar-section">
        <div
          className="mdb-section-header"
          onClick={() => toggleSection('size')}
          role="button"
          tabIndex={0}
        >
          <span>Size</span>
          {collapsed.size ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {!collapsed.size && (
          <div className="mdb-size-grid">
            {ROOM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={`mdb-size-pill ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Ratings */}
      <div className="mdb-sidebar-section">
        <div
          className="mdb-section-header"
          onClick={() => toggleSection('ratings')}
          role="button"
          tabIndex={0}
        >
          <span>Ratings</span>
          {collapsed.ratings ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {!collapsed.ratings && (
          <div className="mdb-ratings-list">
            {RATINGS.map((r) => {
              const isSelected = filters.rating === r.value;
              return (
                <label key={r.value} className="mdb-rating-row" onClick={() => handleRatingSelect(r.value)}>
                  <input
                    type="checkbox"
                    className="form-check-input mdb-checkbox"
                    checked={isSelected || filters.rating === 'all'}
                    onChange={() => handleRatingSelect(r.value)}
                  />
                  <div className="d-flex align-items-center ms-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < r.stars ? '#f59e0b' : '#cbd5e1'}
                        color={i < r.stars ? '#f59e0b' : '#cbd5e1'}
                        className="me-1"
                      />
                    ))}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default HotelSidebar;
