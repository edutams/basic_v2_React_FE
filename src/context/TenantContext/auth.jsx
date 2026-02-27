import React, { createContext, useState, useEffect } from 'react';
import api from '../../api/tenant_api';

export const TenantAuthContext = createContext(undefined);

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const TenantAuthProvider = ({ children }) => {
  console.log('TenantAuthProvider rendering');
  const [user, setUser] = useState(defaultAuthState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(defaultAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(defaultAuthState.isLoading);
  const [error, setError] = useState(defaultAuthState.error);

  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('tenant_access_token');

      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.get('/get-user');
        // The backend returns the user object directly
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('tenant_access_token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/login', credentials);

      const { access_token, data: user } = res.data;
      
      localStorage.setItem('tenant_access_token', access_token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/logout');
      localStorage.removeItem('tenant_access_token');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Logout failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  
  const updateAgentProfile = async (data, isMultipart = false) => {
    setError(null);
    try {
      const res = await api.put('/update-user', data, {
        headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      const userData = res.data?.data || res.data;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Update failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const changePassword = async (passwordData) => {
    setError(null);
    try {
      await api.put('/change-password', passwordData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Password change failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateAgentProfile,
    changePassword,
    clearError,
  };

  console.log('TenantAuthProvider contextValue:', contextValue);

  return <TenantAuthContext.Provider value={contextValue}>{children}</TenantAuthContext.Provider>;
};
