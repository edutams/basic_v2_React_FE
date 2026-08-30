import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '@/api/landlord/landlord_api';
import { PermissionProvider } from './permissions';
import axios from 'axios';
import { CustomizerContext } from '../CustomizerContext';
import { safeWindowOpen } from '@/utils/safeWindowOpen';

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
    localStorage.removeItem('permissions');
    localStorage.removeItem('token_expires_in');
    localStorage.removeItem('user');
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
  const [originalUser, setOriginalUser] = useState(null);

  const { setPrimaryColor } = useContext(CustomizerContext);

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
        // Always fetch fresh from server — permissions are never read from localStorage
        const res = await api.get('/v1/landlord/auth/me');
        const { user: freshUser, permissions: freshPermissions } = res.data;

        const storedOriginal = localStorage.getItem('original_user');
        const isImp = localStorage.getItem('isImpersonating') === 'true';
        const storedImpersonatorId = localStorage.getItem('impersonator_id');

        // Always sync localStorage user to whatever server says
        localStorage.setItem('user', JSON.stringify(freshUser));

        setUser(freshUser);
        setPermissions(freshPermissions || []);
        setIsAuthenticated(true);
        setIsImpersonating(isImp);

        if (isImp && storedImpersonatorId) {
          setImpersonatorId(storedImpersonatorId);
        }

        if (isImp && storedOriginal) {
          setOriginalUser(JSON.parse(storedOriginal));
        } else {
          setOriginalUser(freshUser);
        }

        if (freshUser?.organization?.primary_color) {
          setPrimaryColor(freshUser.organization.primary_color);
        }
      } catch (e) {
        // Token is invalid or expired — clear everything
        console.error(e);
        tokenManager.clear();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      tokenManager.clear();
      setUser(null);
      setIsAuthenticated(false);
      setIsImpersonating(false);
      setImpersonatorId(null);
      setPrimaryColor(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/v1/landlord/auth/login', credentials);

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

      // Set the organization's primary_color as the theme color
      if (userData?.organization?.primary_color) {
        setPrimaryColor(userData.organization.primary_color);
      }

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/v1/landlord/auth/logout');
    } catch {
      /* best-effort */
    } finally {
      tokenManager.clear();
      setUser(null);
      setIsAuthenticated(false);
      setIsImpersonating(false);
      setImpersonatorId(null);
      setPrimaryColor(null);
      setIsLoading(false);
    }
    return { success: true };
  };

  const register = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/v1/landlord/auth/register', credentials);
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
      const res = await api.post('/v1/landlord/update_agent_profile', data, {
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
    const response = await api.put('/v1/landlord/change_password', passwordData);

    return response.data;
  };

  const refreshToken = async () => {
    try {
      const res = await api.post('/v1/landlord/auth/refresh_token');
      const { access_token, expires_in } = res.data;
      tokenManager.set(access_token);
      localStorage.setItem('token_expires_in', String(expires_in));
      return true;
    } catch (err) {
      console.error('Token refresh failed', err);
      tokenManager.clear();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const impersonateAgent = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post(`/v1/landlord/impersonate/agent/${id}`);

      const { access_token, expires_in, user: apiUser, data: apiData, impersonator_id } = res.data;

      // Save current user as original BEFORE switching
      if (user) {
        localStorage.setItem('original_user', JSON.stringify(user));
        setOriginalUser(user);
      }

      tokenManager.set(access_token);
      localStorage.setItem('token_expires_in', String(expires_in));
      localStorage.setItem('isImpersonating', 'true');
      localStorage.setItem('impersonator_id', impersonator_id || id);

      const newUser = apiUser || apiData;
      localStorage.setItem('user', JSON.stringify(newUser));

      // Fetch the agent's actual permissions fresh
      const meRes = await api.get('/v1/landlord/auth/me');
      const freshPermissions = meRes.data?.permissions || [];

      localStorage.setItem('permissions', JSON.stringify(freshPermissions));

      setUser(newUser);
      setPermissions(freshPermissions);
      setIsImpersonating(true);
      setImpersonatorId(impersonator_id || id);

      if (newUser?.organization?.primary_color) {
        setPrimaryColor(newUser.organization.primary_color);
      }

      return { success: true, user: newUser };
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
      const res = await api.post(`/v1/landlord/impersonate/tenant/${id}`);
      const { access_token, expires_in, user: apiUser, data: apiData, redirect_url } = res.data;

      // Check if there's a redirect URL (open in new tab approach)
      if (redirect_url) {
        if (!safeWindowOpen(redirect_url)) {
          return { success: false, error: 'Received an invalid redirect URL' };
        }
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
    try {
      const res = await api.post('/v1/landlord/impersonate/stop');
      const { access_token, user: apiUser, data: apiData } = res.data;

      tokenManager.set(access_token);

      const restoredUser = apiUser || apiData;

      //  Write the restored admin back to localStorage
      localStorage.setItem('user', JSON.stringify(restoredUser));
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('impersonator_id');
      localStorage.removeItem('original_user');

      setUser(restoredUser);
      setIsImpersonating(false);
      setImpersonatorId(null);
      setOriginalUser(null);

      if (restoredUser?.organization?.primary_color) {
        setPrimaryColor(restoredUser.organization.primary_color);
      }

      window.location.href = '/agent';
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
    originalUser,
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
