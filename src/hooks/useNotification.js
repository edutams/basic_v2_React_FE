import { useSnackbar } from '../context/SnackbarContext';

/**
 * Custom hook for showing notifications
 * Provides a simple API similar to SweetAlert but using Material-UI Snackbar
 */
export const useNotification = () => {
  const { showSuccess, showError, showWarning, showInfo, showSnackbar } = useSnackbar();

  const notify = {
    // Success notifications
    success: (message, title = null) => {
      return showSuccess(message, { title });
    },

    // Error notifications
    error: (message, title = null) => {
      return showError(message, { title });
    },

    // Warning notifications
    warning: (message, title = null) => {
      return showWarning(message, { title });
    },

    // Info notifications
    info: (message, title = null) => {
      return showInfo(message, { title });
    },

    // Custom notification with full options
    custom: (message, options = {}) => {
      return showSnackbar(message, options);
    },

    // SweetAlert-like API for easy migration
    fire: (title, message, severity = 'success') => {
      if (typeof title === 'object') {
        // Handle object parameter like Swal.fire({ title, text, icon })
        const { title: objTitle, text, icon } = title;
        return showSnackbar(text || objTitle, { 
          title: text ? objTitle : null, 
          severity: icon || 'success' 
        });
      }
      
      // Handle string parameters like Swal.fire('Success', 'Message', 'success')
      return showSnackbar(message, { 
        title: title, 
        severity: severity 
      });
    },
  };

  return notify;
};

export default useNotification;
