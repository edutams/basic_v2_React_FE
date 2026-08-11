import { useMemo } from 'react';
import { useSnackbar } from '../context/SnackbarContext';

/**
 * Custom hook for showing notifications
 * Provides a simple API similar to SweetAlert but using Material-UI Snackbar
 */
export const useNotification = () => {
  const { showSuccess, showError, showWarning, showInfo, showSnackbar } = useSnackbar();

  /**
   * Memoized so the `notify` object keeps a stable identity across renders.
   * Creating a fresh object each render breaks `useEffect(..., [notify])`
   * dependencies in consumers and causes infinite re-fetch loops.
   *
   * Safe to memoize once: the underlying snackbar helpers only ever use
   * functional state updates (setSnackbars(prev => ...)), so the closures
   * captured on first render never read stale state.
   */
  const notify = useMemo(
    () => ({
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
            severity: icon || 'success',
          });
        }

        // Handle string parameters like Swal.fire('Success', 'Message', 'success')
        return showSnackbar(message, {
          title: title,
          severity: severity,
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return notify;
};

export default useNotification;
