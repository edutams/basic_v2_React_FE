import React, { createContext, useState, useEffect } from 'react';
import api from '../../api/auth';

export const AuthContext = createContext(undefined);

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultAuthState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(defaultAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(defaultAuthState.isLoading);
  const [error, setError] = useState(defaultAuthState.error);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ---------------- Auth functions ----------------

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const userData = await api.get('/agent/get-agent'); // cookie sent automatically
      setUser(userData.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginRes = await api.post('/agent/login', credentials);
      const { access_token, data: userData } = loginRes.data;

      localStorage.setItem('access_token', access_token);

      setUser(userData.data);
      setIsAuthenticated(true);

      return { success: true, user: userData.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';

      setError(msg);

      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/agent/register', userData);
      const currentUser = await api.get('/agent/get-agent');
      setUser(currentUser.data);
      setIsAuthenticated(true);
      return { success: true, user: currentUser.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
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
      await api.post('/agent/logout');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Logout failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.put('/agent/update-user', updatedData);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      await api.post('/agent/refresh-token');
      await checkAuthStatus();
    } catch (err) {
      console.error('Token refresh failed', err);
    }
  };

  const clearError = () => setError(null);

  // ---------------- Context value ----------------
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser,
    refreshToken,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
