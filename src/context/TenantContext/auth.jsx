import React, { createContext, useState, useEffect } from 'react';
import api from '../../api/tenant_api';
import authApi from '../../api/auth';
import { PermissionProvider } from './permissions';

export const TenantAuthContext = createContext(undefined);

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
  isImpersonated: false,
  impersonatorId: null,
};

export const TenantAuthProvider = ({ children }) => {
  // console.log('TenantAuthProvider rendering');
  const [user, setUser] = useState(defaultAuthState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(defaultAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(defaultAuthState.isLoading);
  const [error, setError] = useState(defaultAuthState.error);
  const [permissions, setPermissions] = useState(defaultAuthState.permissions);
  const [isImpersonated, setIsImpersonated] = useState(false);
  const [impersonatorId, setImpersonatorId] = useState(null);

  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('tenant_access_token');

      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // Check if this is an impersonation token
      const isImpersonating = localStorage.getItem('isImpersonating') === 'true';
      const impId = localStorage.getItem('impersonator_id');
      setIsImpersonated(isImpersonating);
      setImpersonatorId(impId);

      setIsLoading(true);
      try {
        const res = await api.get('/get-user');

        const payload = res.data?.data;

        setUser(payload.user);
        setPermissions(payload.permissions || []);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('tenant_access_token');
        localStorage.removeItem('isImpersonating');
        localStorage.removeItem('impersonator_id');
        setUser(null);
        setIsAuthenticated(false);
        setIsImpersonated(false);
        setImpersonatorId(null);
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

      const { access_token, data: userData } = res.data;

      localStorage.setItem('tenant_access_token', access_token);
      setUser(userData);
      setPermissions(userData.permissions || []);
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

  const stopImpersonation = async () => {
    setIsLoading(true);
    try {
      // Call the agent API to stop impersonation
      const impersonatorId = localStorage.getItem('impersonator_id');
      await authApi.post('/agent/impersonate/stop', {
        impersonator_id: impersonatorId,
      });

      // Clear impersonation data
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('impersonator_id');
      localStorage.removeItem('tenant_access_token');

      setIsImpersonated(false);
      setImpersonatorId(null);

      // Redirect to agent dashboard
      window.location.href = 'http://basic_v2.test:5174';

      return { success: true };
    } catch (err) {
      console.error('Failed to stop impersonation:', err);
      // Even if API fails, allow user to return to agent
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('impersonator_id');
      localStorage.removeItem('tenant_access_token');
      setIsImpersonated(false);
      setImpersonatorId(null);
      window.location.href = 'http://basic_v2.test:5174';
      return { success: true };
    } finally {
      setIsLoading(false);
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
    permissions,
    isImpersonated,
    impersonatorId,
    stopImpersonation,
  };

  // console.log('TenantAuthProvider contextValue:', contextValue);

  return (
    <TenantAuthContext.Provider value={contextValue}>
      <PermissionProvider permissions={permissions || []}>{children}</PermissionProvider>
    </TenantAuthContext.Provider>
  );
};
