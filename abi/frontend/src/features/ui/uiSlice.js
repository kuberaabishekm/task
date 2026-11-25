import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAddModalOpen: false,
  isEditModalOpen: false,
  hotelToEdit: null,
  isDeleteModalOpen: false,
  hotelToDelete: null,
  toasts: [],
  wishlist: [1, 3], // Sample initial wishlist items
  bookings: [2]     // Sample initial booked items
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddModal: (state) => {
      state.isAddModalOpen = true;
      state.hotelToEdit = null;
    },
    closeAddModal: (state) => {
      state.isAddModalOpen = false;
    },
    openEditModal: (state, action) => {
      state.hotelToEdit = action.payload;
      state.isEditModalOpen = true;
    },
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.hotelToEdit = null;
    },
    openDeleteModal: (state, action) => {
      state.hotelToDelete = action.payload;
      state.isDeleteModalOpen = true;
    },
    closeDeleteModal: (state) => {
      state.isDeleteModalOpen = false;
      state.hotelToDelete = null;
    },
    addToast: (state, action) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      state.toasts.push({
        id,
        type: action.payload.type || 'info', // 'success' | 'error' | 'info'
        message: action.payload.message
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleWishlist: (state, action) => {
      const id = action.payload;
      if (state.wishlist.includes(id)) {
        state.wishlist = state.wishlist.filter((wId) => wId !== id);
      } else {
        state.wishlist.push(id);
      }
    },
    addBooking: (state, action) => {
      const id = action.payload;
      if (!state.bookings.includes(id)) {
        state.bookings.push(id);
      }
    }
  }
});

export const {
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  addToast,
  removeToast,
  toggleWishlist,
  addBooking
} = uiSlice.actions;

export default uiSlice.reducer;

