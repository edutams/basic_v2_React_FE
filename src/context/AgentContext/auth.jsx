import React, { createContext, useState, useEffect } from 'react';
import api from '../../api/auth';
import { PermissionProvider } from './permissions';
import axios from 'axios';

export const AuthContext = createContext(undefined);

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
};

const tokenManager = {
  get: () => localStorage.getItem('access_token'),

  set: (token) => {
    localStorage.setItem('access_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('isImpersonating');
    localStorage.removeItem('impersonator_id');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('roles');
    delete axios.defaults.headers.common['Authorization'];
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultAuthState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(defaultAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(defaultAuthState.isLoading);
  const [error, setError] = useState(defaultAuthState.error);
  const [permissions, setPermissions] = useState(defaultAuthState.permissions);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatorId, setImpersonatorId] = useState(null);

  useEffect(() => {
    const token = tokenManager.get();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const restoreUser = async () => {
      const token = tokenManager.get();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const storedUser = localStorage.getItem('user');
        const storedPermissions = localStorage.getItem('permissions');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
          setIsImpersonating(localStorage.getItem('isImpersonating') === 'true');
          setImpersonatorId(localStorage.getItem('impersonator_id') ?? null);
          setIsAuthenticated(true);
        } else {
          tokenManager.clear();
          setIsAuthenticated(false);
        }
      } catch {
        tokenManager.clear();
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
      const res = await api.post('/landlord/v1/auth/login', credentials);

      const { access_token, expires_in, user, permissions, roles } = res.data;

      tokenManager.set(access_token);
      localStorage.setItem('token_expires_in', String(expires_in));
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(permissions || []));
      localStorage.setItem('roles', JSON.stringify(roles || []));

      const userData = user;
      setUser(userData);
      setPermissions(permissions || []);
      setIsAuthenticated(true);
      setIsImpersonating(false);
      setImpersonatorId(null);

      return { success: true, user: userData };
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
    try {
      await api.post('/landlord/v1/auth/logout');
    } catch {
      /* best-effort */
    } finally {
      tokenManager.clear();
      setUser(null);
      setIsAuthenticated(false);
      setIsImpersonating(false);
      setImpersonatorId(null);
      setIsLoading(false);
    }
    return { success: true };
  };

  const register = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/landlord/v1/auth/register', credentials);
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

  const updateAgentProfile = async (data, isMultipart = false) => {
    setError(null);
    try {
      const res = await api.post('/landlord/v1/update_agent_profile', data, {
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
      await api.put('/landlord/v1/change_password', passwordData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Password change failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const refreshToken = async () => {
    try {
      await api.post('/landlord/v1/refresh_token');
    } catch (err) {
      console.error('Token refresh failed', err);
    }
  };

  const impersonateAgent = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post(`/landlord/v1/impersonate/agent/${id}`);
      const { access_token, expires_in, user: apiUser, data: apiData, impersonator_id } = res.data;

      // Replace token atomically
      tokenManager.set(access_token);
      localStorage.setItem('token_expires_in', String(expires_in));

      const userData = apiUser || apiData;
      setUser(userData);
      setIsAuthenticated(true);
      setIsImpersonating(true);
      setImpersonatorId(impersonator_id);

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Impersonation failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const impersonateTenant = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post(`/landlord/v1/impersonate/tenant/${id}`);
      const { access_token, expires_in, user: apiUser, data: apiData, redirect_url } = res.data;

      // Check if there's a redirect URL (open in new tab approach)
      if (redirect_url) {
        window.open(redirect_url, '_blank');
        return { success: true, redirect_url };
      }

      // Otherwise, replace token atomically (same as agent impersonation)
      if (access_token) {
        tokenManager.set(access_token);
        localStorage.setItem('token_expires_in', String(expires_in));

        const userData = apiUser || apiData;
        setUser(userData);
        setIsAuthenticated(true);
        setIsImpersonating(true);

        return { success: true, user: userData };
      }

      return { success: false, error: 'No valid response from server' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Tenant impersonation failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const stopImpersonation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Send impersonator_id as fallback; backend prefers JWT claims
      const res = await api.post('/landlord/v1/impersonate/stop', {
        impersonator_id: impersonatorId,
      });

      const { access_token, user: apiUser, data: apiData } = res.data;

      tokenManager.set(access_token);

      const userData = apiUser || apiData;
      setUser(userData);
      setIsImpersonating(false);
      setImpersonatorId(null);
      
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('impersonator_id');
      localStorage.setItem('user', JSON.stringify(userData));

      window.location.href = '/';
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to stop impersonation';
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
    impersonateTenant,
    stopImpersonation,
    impersonatorId,
    isImpersonating,
    clearError,
    permissions,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <PermissionProvider permissions={permissions || []}>{children}</PermissionProvider>
    </AuthContext.Provider>
  );
};
