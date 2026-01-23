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
    const restoreUser = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.get('/agent/get-user');
        setUser(res.data?.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('access_token');
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
      const res = await api.post('/agent/login', credentials);

      const { access_token, data: user } = res.data;

      localStorage.setItem('access_token', access_token);

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/agent/register', credentials);
      setUser(credentials);
      setIsAuthenticated(true);
      return { success: true, user: credentials };
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
      localStorage.removeItem('access_token');
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
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
