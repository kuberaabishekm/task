import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { X } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import HotelSidebar from '../components/HotelSidebar';
import HotelList from '../components/HotelList';
import HotelForm from '../components/HotelForm';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ToastNotification from '../components/ToastNotification';
import { fetchHotels } from '../features/hotels/hotelsSlice';
import { closeAddModal, closeEditModal } from '../features/ui/uiSlice';

const HotelListingPage = () => {
  const dispatch = useDispatch();
  const { isAddModalOpen, isEditModalOpen, hotelToEdit } = useSelector((state) => state.ui);
  const { total, filters } = useSelector((state) => state.hotels);

  // Initial fetch on component mount
  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  const pageTitle = filters.search
    ? `Hotels Search: "${filters.search}" - Hotel Listing Management`
    : `Hotels - Find Your Perfect Stay (${total} Available)`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Explore and manage world-class hotels, budget stays, luxury resorts, and family suites with verified prices and interactive location maps."
        />
        <meta property="og:title" content="Hotels - Find Your Perfect Stay" />
        <meta property="og:description" content="Browse verified hotel listings with transparent pricing and live location coordinates." />
      </Helmet>

      {/* Main Navbar */}
      <Navbar />

      {/* Blue Full-Width Page Header with Breadcrumbs */}
      <PageHeader
        title="Hotels"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Library", path: "/" },
          { label: "Data", active: true }
        ]}
      />

      {/* Main Two-Column Content Area */}
      <main className="container pb-5">
        <div className="row g-4">
          {/* Left Column: Filter Sidebar */}
          <div className="col-12 col-md-4 col-lg-3">
            <HotelSidebar />
          </div>

          {/* Right Column: Hotel Listing Area */}
          <div className="col-12 col-md-8 col-lg-9">
            <HotelList />
          </div>
        </div>
      </main>

      {/* Add Hotel Modal */}
      {isAddModalOpen && (
        <div className="custom-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="addModalTitle">
          <div className="custom-modal-dialog">
            <div className="custom-modal-header">
              <h5 className="modal-title mb-0 fs-6 fw-bold" id="addModalTitle">
                Add New Hotel Listing
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => dispatch(closeAddModal())}
                aria-label="Close modal"
              ></button>
            </div>
            <div className="custom-modal-body">
              <HotelForm onClose={() => dispatch(closeAddModal())} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {isEditModalOpen && hotelToEdit && (
        <div className="custom-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="editModalTitle">
          <div className="custom-modal-dialog">
            <div className="custom-modal-header">
              <h5 className="modal-title mb-0 fs-6 fw-bold" id="editModalTitle">
                Edit Hotel: {hotelToEdit.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => dispatch(closeEditModal())}
                aria-label="Close modal"
              ></button>
            </div>
            <div className="custom-modal-body">
              <HotelForm hotelToEdit={hotelToEdit} onClose={() => dispatch(closeEditModal())} />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal />

      {/* Floating Notifications */}
      <ToastNotification />
    </>
  );
};

export default HotelListingPage;

