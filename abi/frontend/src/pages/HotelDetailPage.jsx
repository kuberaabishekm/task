import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Star,
  MapPin,
  Compass,
  ArrowLeft,
  Edit2,
  Trash2,
  Heart,
  Share2,
  Check,
  LocateFixed,
  CalendarCheck,
  ShieldCheck,
  Wifi,
  Car,
  UtensilsCrossed,
  Waves,
  Wind
} from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import HotelForm from '../components/HotelForm';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ToastNotification from '../components/ToastNotification';
import { fetchHotelById } from '../features/hotels/hotelsSlice';
import {
  openEditModal,
  openDeleteModal,
  toggleWishlist,
  addBooking,
  addToast,
  closeEditModal
} from '../features/ui/uiSlice';
import { getImageUrl } from '../services/api';

// Reliable Leaflet Marker Icon configuration
const hotelMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically re-center map if coordinates change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

const HotelDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentHotel, detailLoading, error } = useSelector((state) => state.hotels);
  const { wishlist, isEditModalOpen } = useSelector((state) => state.ui);

  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelById(id));
      window.scrollTo(0, 0);
    }
  }, [id, dispatch]);

  const isWishlisted = currentHotel ? wishlist.includes(currentHotel.id) : false;

  // Browser Geolocation Handler with graceful denial handling
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      dispatch(addToast({
        type: 'error',
        message: 'Geolocation is not supported by your browser.'
      }));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        dispatch(addToast({
          type: 'success',
          message: 'Your current location detected and mapped alongside the hotel.'
        }));
      },
      (geoError) => {
        setLocating(false);
        let msg = 'Location request was denied. Hotel location remains pinned.';
        if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'The request to obtain your location timed out.';
        }
        dispatch(addToast({ type: 'info', message: msg }));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleBookNow = () => {
    if (!currentHotel) return;
    dispatch(addBooking(currentHotel.id));
    dispatch(addToast({
      type: 'success',
      message: `Reservation confirmed for "${currentHotel.title}"! Added to My Bookings.`
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      dispatch(addToast({ type: 'info', message: 'Hotel link copied to clipboard!' }));
    }
  };

  if (detailLoading) {
    return (
      <>
        <Navbar />
        <PageHeader title="Hotel Details" subtitle="Loading hotel data..." />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Retrieving property details & location coordinates...</p>
        </div>
      </>
    );
  }

  if (error || !currentHotel) {
    return (
      <>
        <Navbar />
        <PageHeader title="Hotel Not Found" subtitle="Requested hotel could not be retrieved" />
        <div className="container py-5">
          <div className="card text-center p-5 border">
            <h3 className="h5 fw-bold mb-2">Hotel Listing Not Available</h3>
            <p className="text-muted mb-4">{error || 'The requested hotel listing does not exist.'}</p>
            <Link to="/" className="btn btn-primary-blue mx-auto d-inline-flex align-items-center gap-1">
              <ArrowLeft size={16} />
              <span>Back to Hotels Listing</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const lat = parseFloat(currentHotel.latitude);
  const lng = parseFloat(currentHotel.longitude);
  const validCoordinates = !isNaN(lat) && !isNaN(lng);
  const mapCenter = validCoordinates ? [lat, lng] : [48.8588, 2.2943];
  const ratingValue = parseFloat(currentHotel.rating) || 4.5;
  const priceValue = parseFloat(currentHotel.price).toFixed(2);
  const imageUrl = getImageUrl(currentHotel.image);

  const amenitiesList = currentHotel.amenities
    ? (typeof currentHotel.amenities === 'string' ? currentHotel.amenities.split(',').map((a) => a.trim()) : currentHotel.amenities)
    : [];

  const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('wi-fi') || lower.includes('wifi')) return <Wifi size={16} className="text-primary" />;
    if (lower.includes('pool')) return <Waves size={16} className="text-info" />;
    if (lower.includes('parking')) return <Car size={16} className="text-secondary" />;
    if (lower.includes('restaurant') || lower.includes('dining')) return <UtensilsCrossed size={16} className="text-danger" />;
    if (lower.includes('air conditioning') || lower.includes('ac')) return <Wind size={16} className="text-primary" />;
    return <Check size={16} className="text-success" />;
  };

  return (
    <>
      <Helmet>
        <title>{`${currentHotel.title} - Hotelier Listing`}</title>
        <meta name="description" content={currentHotel.description?.substring(0, 160)} />
        <meta property="og:title" content={`${currentHotel.title} - $${priceValue}/night`} />
        <meta property="og:description" content={currentHotel.description} />
        <meta property="og:image" content={imageUrl} />
      </Helmet>

      <Navbar />

      <PageHeader
        title={currentHotel.title}
        subtitle={currentHotel.location || 'Find your perfect stay'}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Hotels", path: "/" },
          { label: currentHotel.title, active: true }
        ]}
      />

      <main className="container pb-5">
        {/* Top Navigation Row */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <ArrowLeft size={16} />
            <span>Back to All Hotels</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => dispatch(toggleWishlist(currentHotel.id))}
              className={`btn btn-sm ${isWishlisted ? 'btn-danger' : 'btn-outline-danger'} d-flex align-items-center gap-1`}
              aria-label="Wishlist toggle"
            >
              <Heart size={15} fill={isWishlisted ? '#ffffff' : 'none'} />
              <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>

            <button
              onClick={handleShare}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              aria-label="Share listing"
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>

            <button
              onClick={() => dispatch(openEditModal(currentHotel))}
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
              aria-label="Edit hotel"
            >
              <Edit2 size={15} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => dispatch(openDeleteModal(currentHotel))}
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              aria-label="Delete hotel"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* Main Details (Col-8) */}
          <div className="col-12 col-lg-8">
            <div className="hotel-detail-card">
              {/* Hotel Image with Category Badge */}
              <div className="position-relative">
                <img
                  src={imageUrl}
                  alt={`High resolution view of ${currentHotel.title}`}
                  className="hotel-detail-img-main"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                {currentHotel.category && (
                  <span className="hotel-category-badge" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    {currentHotel.category}
                  </span>
                )}
              </div>

              {/* Title, Rating, Location */}
              <div className="p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <h2 className="fs-3 fw-bold text-dark mb-0">{currentHotel.title}</h2>
                  <div className="d-flex align-items-center gap-1 bg-light border px-2 py-1 rounded">
                    <span className="d-flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          fill={i < Math.round(ratingValue) ? '#f59e0b' : 'none'}
                          color={i < Math.round(ratingValue) ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </span>
                    <span className="fw-bold ms-1" style={{ fontSize: '0.9rem' }}>{ratingValue.toFixed(1)}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted mb-3">
                  <MapPin size={16} className="text-primary flex-shrink-0" />
                  <span className="fs-6">{currentHotel.location || 'Central Location'}</span>
                </div>

                {/* Description */}
                <hr className="my-3" />
                <h3 className="fs-5 fw-bold text-dark mb-2">About This Property</h3>
                <p className="text-secondary" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {currentHotel.description}
                </p>

                {/* Amenities List */}
                <hr className="my-3" />
                <h3 className="fs-5 fw-bold text-dark mb-3">Featured Amenities</h3>
                <div className="row g-2">
                  {amenitiesList.map((amenity, idx) => (
                    <div key={idx} className="col-12 col-sm-6">
                      <div className="d-flex align-items-center gap-2 p-2 rounded bg-light border">
                        {getAmenityIcon(amenity)}
                        <span className="text-dark" style={{ fontSize: '0.9rem' }}>{amenity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Location Map Section */}
                <hr className="my-4" />
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="fs-5 fw-bold text-dark mb-1">Interactive Location Map</h3>
                    <p className="text-muted small mb-0">
                      Exact geographic coordinates: <strong>{lat.toFixed(6)}</strong>, <strong>{lng.toFixed(6)}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleLocateMe}
                    disabled={locating}
                    className="btn btn-outline-blue btn-sm d-flex align-items-center gap-1"
                    title="Find your distance to this hotel"
                  >
                    <LocateFixed size={15} />
                    <span>{locating ? 'Locating...' : 'Locate My Position'}</span>
                  </button>
                </div>

                {/* Interactive Leaflet Map */}
                <div className="map-container-box">
                  {validCoordinates ? (
                    <MapContainer
                      center={mapCenter}
                      zoom={14}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <MapRecenter center={mapCenter} />
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* Hotel Marker with Actual Coordinates */}
                      <Marker position={[lat, lng]} icon={hotelMarkerIcon}>
                        <Popup>
                          <div style={{ maxWidth: '200px' }}>
                            <img
                              src={imageUrl}
                              alt={currentHotel.title}
                              style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' }}
                            />
                            <strong style={{ fontSize: '0.9rem', display: 'block' }}>{currentHotel.title}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#3B73C5', fontWeight: 'bold' }}>
                              ${priceValue} / night
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              📍 {lat.toFixed(4)}, {lng.toFixed(4)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Optional User Geolocation Marker */}
                      {userLocation && (
                        <Marker position={userLocation}>
                          <Popup>
                            <strong>Your Detected Location</strong>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                      Map coordinates are invalid for this property.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Booking & Highlights (Col-4) */}
          <div className="col-12 col-lg-4">
            {/* Booking Card */}
            <div className="card border p-4 mb-4 shadow-sm" style={{ borderRadius: '6px' }}>
              <div className="d-flex justify-content-between align-items-baseline mb-3">
                <div>
                  <span className="hotel-price-value" style={{ fontSize: '2rem' }}>${priceValue}</span>
                  <span className="text-muted ms-1" style={{ fontSize: '0.85rem' }}>/ night</span>
                </div>
                <span className="badge bg-success">Best Rate</span>
              </div>

              <div className="border rounded p-2 mb-3 bg-light" style={{ fontSize: '0.85rem' }}>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Rating:</span>
                  <span className="fw-semibold">{ratingValue.toFixed(1)} / 5.0</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Category:</span>
                  <span className="fw-semibold">{currentHotel.category || 'Luxury'}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Cancellation:</span>
                  <span className="text-success fw-semibold">Free cancellation</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="btn btn-primary-blue w-100 py-2 d-flex align-items-center justify-content-center gap-2 fs-6 fw-bold mb-2 shadow-sm"
              >
                <CalendarCheck size={18} />
                <span>Reserve Room Now</span>
              </button>

              <p className="text-center text-muted small mb-0">
                You won't be charged yet. Instant confirmation.
              </p>
            </div>

            {/* Property Guarantee Card */}
            <div className="card border p-3 bg-white" style={{ borderRadius: '6px' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <ShieldCheck size={20} className="text-primary" />
                <h4 className="fs-6 fw-bold mb-0">Hotelier Guarantee</h4>
              </div>
              <ul className="list-unstyled text-muted small mb-0">
                <li className="mb-1">✓ Verified coordinates and physical address.</li>
                <li className="mb-1">✓ 24/7 customer support via phone or email.</li>
                <li>✓ Best price matching guarantee.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Hotel Modal */}
      {isEditModalOpen && (
        <div className="custom-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="editModalTitle">
          <div className="custom-modal-dialog">
            <div className="custom-modal-header">
              <h5 className="modal-title mb-0 fs-6 fw-bold" id="editModalTitle">
                Edit Hotel: {currentHotel.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => dispatch(closeEditModal())}
                aria-label="Close modal"
              ></button>
            </div>
            <div className="custom-modal-body">
              <HotelForm hotelToEdit={currentHotel} onClose={() => dispatch(closeEditModal())} />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal />

      {/* Notifications */}
      <ToastNotification />
    </>
  );
};

export default HotelDetailPage;

