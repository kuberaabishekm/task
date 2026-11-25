import axios from 'axios';

// Backend API Base URL
export const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000
});

/**
 * Fetch hotels with filters, pagination and sorting
 */
export const fetchHotelsApi = async (params = {}) => {
  const response = await api.get('/hotels', { params });
  return response.data;
};

/**
 * Fetch single hotel details by ID
 */
export const fetchHotelByIdApi = async (id) => {
  const response = await api.get(`/hotels/${id}`);
  return response.data;
};

/**
 * Create a new hotel (FormData with multipart/form-data)
 */
export const createHotelApi = async (formData) => {
  const response = await api.post('/hotels', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Update existing hotel by ID
 */
export const updateHotelApi = async (id, formData) => {
  const response = await api.put(`/hotels/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Delete hotel by ID
 */
export const deleteHotelApi = async (id) => {
  const response = await api.delete(`/hotels/${id}`);
  return response.data;
};

/**
 * Helper to resolve image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Local upload path
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default api;

