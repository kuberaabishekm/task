import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, X, Image as ImageIcon, MapPin, DollarSign, Star, AlertCircle } from 'lucide-react';
import { createHotel, updateHotel } from '../features/hotels/hotelsSlice';
import { closeAddModal, closeEditModal, addToast } from '../features/ui/uiSlice';
import { getImageUrl } from '../services/api';

const CATEGORIES = [
  'Budget Hotels',
  'Luxury Hotels',
  'Resorts',
  'Business Hotels',
  'Family Hotels'
];

const AVAILABLE_AMENITIES = [
  'Free Wi-Fi',
  'Swimming Pool',
  'Parking',
  'Restaurant',
  'Air Conditioning'
];

const HotelForm = ({ hotelToEdit = null, onClose }) => {
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.hotels);

  const isEditMode = Boolean(hotelToEdit && hotelToEdit.id);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [category, setCategory] = useState('Luxury Hotels');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('4.5');
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Free Wi-Fi',
    'Air Conditioning'
  ]);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  // Populate data when in edit mode
  useEffect(() => {
    if (hotelToEdit) {
      setTitle(hotelToEdit.title || '');
      setDescription(hotelToEdit.description || '');
      setPrice(hotelToEdit.price !== undefined ? String(hotelToEdit.price) : '');
      setLatitude(hotelToEdit.latitude !== undefined ? String(hotelToEdit.latitude) : '');
      setLongitude(hotelToEdit.longitude !== undefined ? String(hotelToEdit.longitude) : '');
      setCategory(hotelToEdit.category || 'Luxury Hotels');
      setLocation(hotelToEdit.location || '');
      setRating(hotelToEdit.rating !== undefined ? String(hotelToEdit.rating) : '4.5');

      if (hotelToEdit.amenities) {
        const amenities = typeof hotelToEdit.amenities === 'string'
          ? hotelToEdit.amenities.split(',').map((a) => a.trim())
          : hotelToEdit.amenities;
        setSelectedAmenities(amenities);
      }

      if (hotelToEdit.image) {
        setImagePreview(getImageUrl(hotelToEdit.image));
      }
    } else {
      // Add mode defaults
      setTitle('');
      setDescription('');
      setPrice('');
      setLatitude('40.7128');
      setLongitude('-74.0060');
      setCategory('Luxury Hotels');
      setLocation('New York, USA');
      setRating('4.5');
      setSelectedAmenities(['Free Wi-Fi', 'Air Conditioning']);
      setImageFile(null);
      setImagePreview('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80');
    }
  }, [hotelToEdit]);

  // Handle File Input Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.mimetype || file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: 'Invalid file format. Please upload a JPG, PNG, WEBP, or GIF image.'
        }));
        return;
      }

      // Validate size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image size exceeds 5MB limit. Please upload a smaller image.'
        }));
        return;
      }

      setImageFile(file);
      setErrors((prev) => {
        const { image, ...rest } = prev;
        return rest;
      });

      // Generate local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Hotel title is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Hotel description is required.';
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = 'Price per night must be greater than 0.';
    }

    const parsedLat = parseFloat(latitude);
    if (latitude === '' || isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      newErrors.latitude = 'Latitude must be a valid number between -90 and 90.';
    }

    const parsedLng = parseFloat(longitude);
    if (longitude === '' || isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      newErrors.longitude = 'Longitude must be a valid number between -180 and 180.';
    }

    if (!isEditMode && !imageFile && !imagePreview) {
      newErrors.image = 'Hotel image is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('price', parseFloat(price));
    formData.append('latitude', parseFloat(latitude));
    formData.append('longitude', parseFloat(longitude));
    formData.append('category', category);
    formData.append('location', location.trim() || 'City Center');
    formData.append('rating', parseFloat(rating));
    formData.append('amenities', selectedAmenities.join(', '));

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imagePreview && !imagePreview.startsWith('data:')) {
      // In edit mode or fallback image URL
      formData.append('image', hotelToEdit?.image || imagePreview);
    }

    try {
      if (isEditMode) {
        await dispatch(updateHotel({ id: hotelToEdit.id, formData })).unwrap();
        dispatch(addToast({ type: 'success', message: 'Hotel updated successfully!' }));
        dispatch(closeEditModal());
      } else {
        await dispatch(createHotel(formData)).unwrap();
        dispatch(addToast({ type: 'success', message: 'Hotel added successfully!' }));
        dispatch(closeAddModal());
      }
      if (onClose) onClose();
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err?.message || 'Failed to save hotel.');
      if (err?.errors) {
        setErrors(err.errors);
      }
      dispatch(addToast({ type: 'error', message: errorMsg }));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3">
        {/* 1. Hotel Title */}
        <div className="col-12">
          <label htmlFor="hotelTitle" className="form-label fw-semibold text-dark">
            Hotel Title <span className="text-danger">*</span>
          </label>
          <input
            id="hotelTitle"
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Grand Palace Hotel & Spa"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
          />
          {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
        </div>

        {/* 2. Category & Location */}
        <div className="col-md-6">
          <label htmlFor="hotelCategory" className="form-label fw-semibold text-dark">
            Category
          </label>
          <select
            id="hotelCategory"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="hotelLocation" className="form-label fw-semibold text-dark">
            City / Location
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light">
              <MapPin size={16} className="text-muted" />
            </span>
            <input
              id="hotelLocation"
              type="text"
              className="form-control"
              placeholder="e.g. Paris, France"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Price & Star Rating */}
        <div className="col-md-6">
          <label htmlFor="hotelPrice" className="form-label fw-semibold text-dark">
            Price Per Night ($) <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light">
              <DollarSign size={16} className="text-muted" />
            </span>
            <input
              id="hotelPrice"
              type="number"
              step="0.01"
              min="0.01"
              className={`form-control ${errors.price ? 'is-invalid' : ''}`}
              placeholder="e.g. 249.00"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: null }));
              }}
            />
          </div>
          {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="hotelRating" className="form-label fw-semibold text-dark">
            Star Rating
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light">
              <Star size={16} className="text-warning" fill="#f59e0b" />
            </span>
            <select
              id="hotelRating"
              className="form-select"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5.0">5.0 - Exceptional</option>
              <option value="4.8">4.8 - Wonderful</option>
              <option value="4.5">4.5 - Excellent</option>
              <option value="4.0">4.0 - Very Good</option>
              <option value="3.5">3.5 - Good</option>
              <option value="3.0">3.0 - Standard</option>
            </select>
          </div>
        </div>

        {/* 4. Latitude and Longitude */}
        <div className="col-md-6">
          <label htmlFor="hotelLatitude" className="form-label fw-semibold text-dark">
            Latitude (-90 to 90) <span className="text-danger">*</span>
          </label>
          <input
            id="hotelLatitude"
            type="number"
            step="0.000001"
            className={`form-control ${errors.latitude ? 'is-invalid' : ''}`}
            placeholder="e.g. 48.858844"
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
              if (errors.latitude) setErrors((prev) => ({ ...prev, latitude: null }));
            }}
          />
          {errors.latitude && <div className="invalid-feedback d-block">{errors.latitude}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="hotelLongitude" className="form-label fw-semibold text-dark">
            Longitude (-180 to 180) <span className="text-danger">*</span>
          </label>
          <input
            id="hotelLongitude"
            type="number"
            step="0.000001"
            className={`form-control ${errors.longitude ? 'is-invalid' : ''}`}
            placeholder="e.g. 2.294351"
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
              if (errors.longitude) setErrors((prev) => ({ ...prev, longitude: null }));
            }}
          />
          {errors.longitude && <div className="invalid-feedback d-block">{errors.longitude}</div>}
        </div>

        {/* 5. Description */}
        <div className="col-12">
          <label htmlFor="hotelDescription" className="form-label fw-semibold text-dark">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="hotelDescription"
            rows="3"
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            placeholder="Provide a detailed description of the property, rooms, amenities, and nearby landmarks..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
            }}
          ></textarea>
          {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
        </div>

        {/* 6. Amenities Selection */}
        <div className="col-12">
          <label className="form-label fw-semibold text-dark d-block">
            Hotel Amenities
          </label>
          <div className="d-flex flex-wrap gap-3">
            {AVAILABLE_AMENITIES.map((amenity) => (
              <div key={amenity} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`form-amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                <label htmlFor={`form-amenity-${amenity}`} className="form-check-label text-secondary">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Hotel Image Upload with Live Preview */}
        <div className="col-12">
          <label htmlFor="hotelImageUpload" className="form-label fw-semibold text-dark">
            Hotel Image {isEditMode ? '(Optional replacement)' : <span className="text-danger">*</span>}
          </label>
          <input
            id="hotelImageUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={`form-control ${errors.image ? 'is-invalid' : ''}`}
            onChange={handleFileChange}
          />
          <small className="text-muted d-block mt-1">
            Accepts JPEG, PNG, WEBP, or GIF (max size: 5MB).
          </small>
          {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}

          {/* Live Image Preview */}
          {imagePreview && (
            <div className="mt-2">
              <span className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Image Preview:</span>
              <div className="image-upload-preview">
                <img
                  src={imagePreview}
                  alt="Hotel preview"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="custom-modal-footer mt-4 px-0 pb-0">
        <button
          type="button"
          onClick={() => {
            if (isEditMode) dispatch(closeEditModal());
            else dispatch(closeAddModal());
            if (onClose) onClose();
          }}
          className="btn btn-outline-secondary"
          disabled={actionLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary-blue d-flex align-items-center gap-2"
          disabled={actionLoading}
        >
          {actionLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
          <span>{isEditMode ? 'Save Changes' : 'Add Hotel'}</span>
        </button>
      </div>
    </form>
  );
};

export default HotelForm;

