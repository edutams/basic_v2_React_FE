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
        // const res = await api.get('/agent/get-agent');
        // setUser(res.data?.data);
        const res = await api.get('/agent/get_agent');
        const userData = res.data?.user || res.data?.data;
        console.log('restoreUser user data:', userData);
        setUser(userData);
        setIsAuthenticated(!!userData);
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

      const { access_token, expires_in, user: apiUser, data: apiData } = res.data;
      const userData = apiUser || apiData;
      console.log('login user data:', userData);

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('token_expires_in', expires_in.toString());
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
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
      const msg = err.response?.data?.error || 'Registration failed';
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
      const msg = err.response?.data?.error || 'Logout failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateAgentProfile = async (data, isMultipart = false) => {
    setError(null);
    try {
      const res = await api.post('/agent/update_agent_profile', data, {
        headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      const userData = res.data?.user || res.data?.data;
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
      await api.put('/agent/change_password', passwordData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Password change failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const refreshToken = async () => {
    try {
      await api.post('/agent/refresh_token');
    } catch (err) {
      console.error('Token refresh failed', err);
    }
  };

  const impersonateAgent = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post(`/agent/impersonate/agent/${id}`);
      const { access_token, expires_in, user: apiUser, data: apiData } = res.data;
      const userData = apiUser || apiData;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('token_expires_in', expires_in.toString());
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Impersonation failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
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
    updateAgentProfile,
    changePassword,
    refreshToken,
    impersonateAgent,
    clearError,
  };


  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
