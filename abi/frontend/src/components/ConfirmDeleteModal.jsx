import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { deleteHotel } from '../features/hotels/hotelsSlice';
import { closeDeleteModal, addToast } from '../features/ui/uiSlice';

const ConfirmDeleteModal = () => {
  const dispatch = useDispatch();
  const { isDeleteModalOpen, hotelToDelete } = useSelector((state) => state.ui);
  const { actionLoading } = useSelector((state) => state.hotels);

  if (!isDeleteModalOpen || !hotelToDelete) return null;

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteHotel(hotelToDelete.id)).unwrap();
      dispatch(addToast({
        type: 'success',
        message: `Hotel "${hotelToDelete.title}" was deleted successfully.`
      }));
      dispatch(closeDeleteModal());
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: typeof err === 'string' ? err : 'Failed to delete hotel.'
      }));
    }
  };

  return (
    <div
      className="custom-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deleteModalTitle"
    >
      <div className="custom-modal-dialog" style={{ maxWidth: '480px' }}>
        <div className="custom-modal-header bg-danger text-white">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} />
            <h5 className="modal-title mb-0 fs-6 fw-bold" id="deleteModalTitle">
              Confirm Hotel Deletion
            </h5>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => dispatch(closeDeleteModal())}
            aria-label="Close"
          ></button>
        </div>

        <div className="custom-modal-body py-4">
          <p className="mb-2">
            Are you sure you want to permanently delete <strong>"{hotelToDelete.title}"</strong>?
          </p>
          <div className="alert alert-warning py-2 mb-0" style={{ fontSize: '0.85rem' }}>
            <small>
              This action cannot be undone. The hotel record and its associated uploaded image will be permanently removed from PostgreSQL.
            </small>
          </div>
        </div>

        <div className="custom-modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => dispatch(closeDeleteModal())}
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
            onClick={handleConfirmDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <Trash2 size={15} />
            )}
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

