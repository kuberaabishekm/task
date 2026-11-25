import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { removeToast } from '../features/ui/uiSlice';

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} className="flex-shrink-0" />;
      case 'error':
        return <AlertCircle size={18} className="flex-shrink-0" />;
      case 'info':
      default:
        return <Info size={18} className="flex-shrink-0" />;
    }
  };

  return (
    <div
      className={`custom-toast ${toast.type}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="d-flex align-items-center gap-2">
        {getIcon()}
        <span style={{ fontSize: '0.875rem' }}>{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="btn btn-link text-white p-0 ms-2"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ToastNotification = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.ui.toasts);

  if (!toasts || toasts.length === 0) return null;

  const handleDismiss = (id) => {
    dispatch(removeToast(id));
  };

  return (
    <div className="toast-container-fixed" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default ToastNotification;

