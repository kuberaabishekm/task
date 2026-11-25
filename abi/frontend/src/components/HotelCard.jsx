import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Star,
  MapPin,
  Compass,
  Edit2,
  Trash2,
  Heart
} from 'lucide-react';
import { getImageUrl } from '../services/api';
import { openEditModal, openDeleteModal, toggleWishlist } from '../features/ui/uiSlice';

const HotelCard = ({ hotel, viewMode = 'list' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wishlist } = useSelector((state) => state.ui);
  const isWishlisted = wishlist.includes(hotel.id);

  const imageUrl = getImageUrl(hotel.image);
  const ratingValue = parseFloat(hotel.rating) || 4.5;
  const priceValue = parseFloat(hotel.price).toFixed(2);
  const originalPrice = (parseFloat(hotel.price) * 1.25).toFixed(2);
  const lat = parseFloat(hotel.latitude).toFixed(4);
  const lng = parseFloat(hotel.longitude).toFixed(4);

  const handleEditClick = (e) => {
    e.stopPropagation();
    dispatch(openEditModal(hotel));
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    dispatch(openDeleteModal(hotel));
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleWishlist(hotel.id));
  };

  // ----------------------------------------------------
  // GRID VIEW (Responsive Columns)
  // ----------------------------------------------------
  if (viewMode === 'grid') {
    return (
      <article className="col-12 col-md-6 col-lg-4 mb-3" aria-label={`Hotel ${hotel.title}`}>
        <div className="card h-100 mdb-product-card">
          <div className="mdb-card-img-wrap p-2 text-center bg-light">
            <img
              src={imageUrl}
              alt={hotel.title}
              className="mdb-product-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          <div className="card-body p-3 d-flex flex-column">
            <Link to={`/hotels/${hotel.id}`} className="mdb-card-title text-truncate d-block">
              {hotel.title}
            </Link>

            <div className="d-flex align-items-center gap-1 my-1">
              <span className="d-flex text-warning">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < Math.round(ratingValue) ? '#f59e0b' : '#cbd5e1'}
                    color={i < Math.round(ratingValue) ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
              </span>
              <span className="mdb-rating-num ms-1">{ratingValue.toFixed(1)}</span>
              <span className="text-muted ms-1 small">154 orders</span>
            </div>

            <p className="mdb-card-desc mb-2">
              {hotel.description}
            </p>

            <div className="mt-auto pt-2 border-top">
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <div>
                  <span className="mdb-price-main">${priceValue}</span>
                  <span className="mdb-price-original ms-2">${originalPrice}</span>
                </div>
                <span className="mdb-shipping-free">Free cancellation</span>
              </div>

              <div className="d-flex gap-2">
                <Link
                  to={`/hotels/${hotel.id}`}
                  className="btn mdb-btn-buy flex-grow-1"
                >
                  BUY THIS
                </Link>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`btn mdb-btn-heart ${isWishlisted ? 'active' : ''}`}
                  title="Wishlist"
                >
                  <Heart size={15} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#6c757d'} />
                </button>
              </div>

              {/* Management actions */}
              <div className="d-flex justify-content-end gap-2 mt-2 pt-1 border-top">
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="btn btn-link btn-sm text-secondary p-0"
                  style={{ fontSize: '0.75rem' }}
                >
                  <Edit2 size={12} className="me-1" /> Edit
                </button>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>|</span>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="btn btn-link btn-sm text-danger p-0"
                  style={{ fontSize: '0.75rem' }}
                >
                  <Trash2 size={12} className="me-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ----------------------------------------------------
  // LIST VIEW (EXACT MATCH TO REFERENCE IMAGE PRODUCT CARDS)
  // ----------------------------------------------------
  return (
    <article className="card mdb-product-card mb-3" aria-label={`Hotel ${hotel.title}`}>
      <div className="row g-0 align-items-center">
        {/* LEFT: Product / Hotel Image */}
        <div className="col-12 col-md-3 text-center p-3">
          <div className="mdb-card-img-wrap">
            <img
              src={imageUrl}
              alt={hotel.title}
              className="mdb-product-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
        </div>

        {/* CENTER: Title, Rating & 154 orders, 3-line Description Snippet */}
        <div className="col-12 col-md-6 p-3">
          <Link to={`/hotels/${hotel.id}`} className="mdb-card-title">
            {hotel.title}
          </Link>

          <div className="d-flex align-items-center gap-1 my-1">
            <span className="d-flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(ratingValue) ? '#f59e0b' : '#cbd5e1'}
                  color={i < Math.round(ratingValue) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </span>
            <span className="mdb-rating-num ms-1">{ratingValue.toFixed(1)}</span>
            <span className="text-muted ms-2 small">154 orders</span>
          </div>

          <p className="mdb-card-desc mb-2">
            {hotel.description}
          </p>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
            <span className="mdb-meta-tag">
              <MapPin size={12} className="me-1 text-muted" />
              {hotel.location || 'Paris, France'}
            </span>
            <span className="mdb-meta-tag">
              <Compass size={12} className="me-1 text-muted" />
              Lat: {lat}, Lng: {lng}
            </span>
            {hotel.category && (
              <span className="mdb-meta-tag bg-light">
                {hotel.category}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: Price $34,50 ($49.99 strikethrough), Free shipping, BUY THIS & Heart buttons */}
        <div className="col-12 col-md-3 p-3 text-md-end border-md-start">
          <div className="mb-2">
            <span className="mdb-price-main">${priceValue}</span>
            <span className="mdb-price-original ms-2">${originalPrice}</span>
          </div>

          <div className="mb-3">
            <span className="mdb-shipping-free">Free shipping</span>
          </div>

          <div className="d-flex justify-content-md-end align-items-center gap-2 mb-2">
            <Link
              to={`/hotels/${hotel.id}`}
              className="btn mdb-btn-buy"
            >
              BUY THIS
            </Link>

            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`btn mdb-btn-heart ${isWishlisted ? 'active' : ''}`}
              title="Add to wishlist"
              aria-label="Wishlist"
            >
              <Heart
                size={16}
                fill={isWishlisted ? '#ef4444' : 'none'}
                color={isWishlisted ? '#ef4444' : '#6c757d'}
              />
            </button>
          </div>

          {/* Quick Management Actions for Hotel Listing */}
          <div className="d-flex justify-content-md-end gap-2 pt-1 border-top" style={{ fontSize: '0.78rem' }}>
            <button
              type="button"
              onClick={handleEditClick}
              className="btn btn-link btn-sm text-secondary p-0"
              style={{ fontSize: '0.78rem' }}
            >
              <Edit2 size={12} className="me-1" /> Edit
            </button>
            <span className="text-muted">|</span>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="btn btn-link btn-sm text-danger p-0"
              style={{ fontSize: '0.78rem' }}
            >
              <Trash2 size={12} className="me-1" /> Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
