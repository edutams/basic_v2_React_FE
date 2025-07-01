import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

const SnackbarContext = createContext();

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const [snackbars, setSnackbars] = useState([]);

  const showSnackbar = (message, options = {}) => {
    const {
      severity = 'success',
      title = null,
      duration = 6000,
      action = null,
      variant = 'standard',
      anchorOrigin = { vertical: 'top', horizontal: 'right' },
    } = options;

    const id = Date.now() + Math.random();
    
    const newSnackbar = {
      id,
      message,
      severity,
      title,
      duration,
      action,
      variant,
      anchorOrigin,
      open: true,
    };

    setSnackbars(prev => [...prev, newSnackbar]);

    if (duration > 0) {
      setTimeout(() => {
        hideSnackbar(id);
      }, duration);
    }

    return id;
  };

  const hideSnackbar = (id) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  };

  const hideAllSnackbars = () => {
    setSnackbars([]);
  };

  const showSuccess = (message, options = {}) => 
    showSnackbar(message, { ...options, severity: 'success' });

  const showError = (message, options = {}) => 
    showSnackbar(message, { ...options, severity: 'error' });

  const showWarning = (message, options = {}) => 
    showSnackbar(message, { ...options, severity: 'warning' });

  const showInfo = (message, options = {}) => 
    showSnackbar(message, { ...options, severity: 'info' });

  const value = {
    showSnackbar,
    hideSnackbar,
    hideAllSnackbars,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      
      {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          open={snackbar.open}
          autoHideDuration={snackbar.duration}
          onClose={() => hideSnackbar(snackbar.id)}
          anchorOrigin={snackbar.anchorOrigin}
        >
          <Alert
            onClose={() => hideSnackbar(snackbar.id)}
            severity={snackbar.severity}
            variant={snackbar.variant}
            action={snackbar.action}
          >
            {snackbar.title && <AlertTitle>{snackbar.title}</AlertTitle>}
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};
