import React, { createContext, useState, useEffect } from 'react';
import api from '../../api/tenant_api';
import authApi from '../../api/auth';
import { PermissionProvider } from './permissions';
import { validateTenantDomain } from './services/tenant.service';

export const TenantAuthContext = createContext(undefined);

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
  isImpersonated: false,
  impersonatorId: null,
  tenantInfo: null,
};

export const TenantAuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultAuthState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(defaultAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(defaultAuthState.isLoading);
  const [error, setError] = useState(defaultAuthState.error);
  const [permissions, setPermissions] = useState(defaultAuthState.permissions);
  const [isImpersonated, setIsImpersonated] = useState(false);
  const [impersonatorId, setImpersonatorId] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);

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
        const { user: userData, permissions: perms } = res.data;

        setUser(userData);
        setPermissions(perms || []);
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
    checkTenantDomain();
  }, []);
  const checkTenantDomain = async () => {
    if (window.location.pathname === '/school-not-found') return;

    const hostname = window.location.hostname;
    const data = await validateTenantDomain(hostname);

    if (data.status === false) {
      window.location.replace('/school-not-found');
    } else {
      setTenantInfo(data);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/login', credentials);
      const { access_token, user: userData, permissions: perms, roles } = res.data;

      localStorage.setItem('tenant_access_token', access_token);
      setUser(userData);
      setPermissions(perms || []);
      setIsAuthenticated(true);

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
      // Get the stored agent token (if any)
      const agentToken = localStorage.getItem('access_token');
      const impersonatorId = localStorage.getItem('impersonator_id');

      // Try to stop impersonation via direct fetch if we have an agent token
      if (agentToken && impersonatorId) {
        try {
          await api.post('/stop-impersonation');
          await fetch('http://basic_v2.test/api/v1/agent/impersonate/stop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${agentToken}`,
            },
            body: JSON.stringify({ impersonator_id: impersonatorId }),
          });
        } catch (apiErr) {}
      }
    } finally {
      // Clear impersonation data
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('impersonator_id');
      localStorage.removeItem('tenant_access_token');

      setIsImpersonated(false);
      setImpersonatorId(null);

      // Redirect to agent dashboard
      window.location.href = 'http://basic_v2.test:5174';

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
    tenantInfo,
  };

  return (
    <TenantAuthContext.Provider value={contextValue}>
      <PermissionProvider permissions={permissions || []}>{children}</PermissionProvider>
    </TenantAuthContext.Provider>
  );
};
