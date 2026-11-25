import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchHotelsApi,
  fetchHotelByIdApi,
  createHotelApi,
  updateHotelApi,
  deleteHotelApi
} from '../../services/api';

// Async Thunks
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, page, limit, sortBy } = getState().hotels;
      const params = {
        page,
        limit,
        sortBy,
        search: filters.search || undefined,
        minPrice: filters.minPrice !== '' ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice !== '' ? filters.maxPrice : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        rating: filters.rating !== 'all' ? filters.rating : undefined,
        location: filters.location || undefined,
        amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined
      };

      const data = await fetchHotelsApi(params);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch hotels.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchHotelByIdApi(id);
      return data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch hotel details.';
      return rejectWithValue(msg);
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const data = await createHotelApi(formData);
      dispatch(fetchHotels());
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create hotel.';
      const errors = err.response?.data?.errors || null;
      return rejectWithValue({ message: msg, errors });
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const data = await updateHotelApi(id, formData);
      dispatch(fetchHotels());
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update hotel.';
      const errors = err.response?.data?.errors || null;
      return rejectWithValue({ message: msg, errors });
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const data = await deleteHotelApi(id);
      dispatch(fetchHotels());
      return { id, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete hotel.';
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  hotels: [],
  currentHotel: null,
  total: 0,
  page: 1,
  limit: 5,
  totalPages: 1,
  sortBy: 'best_match',
  viewMode: 'list', // 'list' or 'grid'
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    category: 'All',
    rating: 'all',
    location: '',
    amenities: []
  },
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null
};

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setPriceFilter: (state, action) => {
      state.filters.minPrice = action.payload.minPrice;
      state.filters.maxPrice = action.payload.maxPrice;
      state.page = 1;
    },
    setCategory: (state, action) => {
      state.filters.category = action.payload;
      state.page = 1;
    },
    setRating: (state, action) => {
      state.filters.rating = action.payload;
      state.page = 1;
    },
    setLocationFilter: (state, action) => {
      state.filters.location = action.payload;
      state.page = 1;
    },
    toggleAmenity: (state, action) => {
      const amenity = action.payload;
      if (state.filters.amenities.includes(amenity)) {
        state.filters.amenities = state.filters.amenities.filter((a) => a !== amenity);
      } else {
        state.filters.amenities.push(amenity);
      }
      state.page = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        minPrice: '',
        maxPrice: '',
        category: 'All',
        rating: 'all',
        location: '',
        amenities: []
      };
      state.sortBy = 'best_match';
      state.page = 1;
    },
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
    clearHotelMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch hotels.';
      })

      // Fetch Hotel By ID
      .addCase(fetchHotelById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to fetch hotel details.';
      })

      // Create Hotel
      .addCase(createHotel.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Hotel created successfully!';
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to create hotel.';
      })

      // Update Hotel
      .addCase(updateHotel.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Hotel updated successfully!';
        state.currentHotel = action.payload.data;
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to update hotel.';
      })

      // Delete Hotel
      .addCase(deleteHotel.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Hotel deleted successfully!';
        state.hotels = state.hotels.filter((h) => h.id !== action.payload.id);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to delete hotel.';
      });
  }
});

export const {
  setSearch,
  setPriceFilter,
  setCategory,
  setRating,
  setLocationFilter,
  toggleAmenity,
  setSortBy,
  setViewMode,
  setPage,
  resetFilters,
  clearCurrentHotel,
  clearHotelMessages
} = hotelsSlice.actions;

export default hotelsSlice.reducer;

