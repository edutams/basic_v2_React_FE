import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../../api/tenant_api';
import authApi from '../../api/auth';
import { PermissionProvider } from './permissions';
import { validateTenantDomain } from './services/tenant.service';
import { CustomizerContext } from '../CustomizerContext';
import tenantApi from '../../api/tenant_api';

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
  const [roles, setRoles] = useState([]);
  const [isImpersonated, setIsImpersonated] = useState(false);
  const [impersonatorId, setImpersonatorId] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);

  const { setPrimaryColor } = useContext(CustomizerContext);

  const checkTenantDomain = async () => {
    if (window.location.pathname === '/school-not-found') return;

    const hostname = window.location.hostname;
    const data = await validateTenantDomain(hostname);

    if (!data || data.status === false) {
      window.location.replace('/school-not-found');
    } else {
      setTenantInfo(data);
      // Apply the org's brand color immediately — even on public pages
      if (data.primary_color) {
        setPrimaryColor(data.primary_color);
      }
    }
  };

  const fetchTenantOnboardingInfo = async () => {
    try {
      const res = await tenantApi.get('/school_setup/get_current_tenant');
      const freshData = res.data?.data;
      if (freshData) {
        setTenantInfo((prev) => ({ ...prev, ...freshData }));
      }
      await refreshTenantInfo();
    } catch (err) {
      console.error('Failed to fetch tenant onboarding info', err);
    }
  };

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
        const res = await api.get('/me');
        const { user: userData, permissions: perms, roles: userRoles, primary_color } = res.data;

        setUser(userData);
        setPermissions(perms || []);
        setRoles(userRoles || []);
        setIsAuthenticated(true);

        // Restore the agent's primary_color as the tenant's theme color
        if (primary_color) {
          setPrimaryColor(primary_color);
        }

        await fetchTenantOnboardingInfo();
      } catch (err) {
        localStorage.removeItem('tenant_access_token');
        localStorage.removeItem('isImpersonating');
        localStorage.removeItem('impersonator_id');
        setUser(null);
        setIsAuthenticated(false);
        setIsImpersonated(false);
        setImpersonatorId(null);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
    checkTenantDomain();
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem('tenant_access_token');
      localStorage.removeItem('tenant_token_expires_in');
      localStorage.removeItem('tenant_user');
      localStorage.removeItem('tenant_permissions');
      localStorage.removeItem('tenant_roles');

      setUser(null);
      setIsAuthenticated(false);
      setIsImpersonated(false);
      setImpersonatorId(null);
      setPrimaryColor(null);
      // TenantProtectedRoute will catch isAuthenticated: false
      // and redirect to /login with state={{ from: location }}
    };

    window.addEventListener('tenant_auth:expired', handleAuthExpired);
    return () => window.removeEventListener('tenant_auth:expired', handleAuthExpired);
  }, []);

  // const refreshTenantInfo = async () => {
  //   const hostname = window.location.hostname;
  //   const data = await validateTenantDomain(hostname);
  //   if (data && data.status !== false) {
  //     setTenantInfo(data);
  //   }
  // };

  const refreshTenantInfo = async () => {
    try {
      const res = await tenantApi.get('/school_setup/get_academic_info');
      const { academic_session, academic_term, academic_week, logo_url } = res.data;
      setTenantInfo((prev) => ({ ...prev, academic_session, academic_term, academic_week, logo_url }));
    } catch (err) {
      console.error('Failed to refresh academic info', err);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/login', credentials);
      const {
        access_token,
        expires_in,
        user: userData,
        permissions: perms,
        roles,
        primary_color,
      } = res.data;

      localStorage.setItem('tenant_access_token', access_token);
      localStorage.setItem('tenant_token_expires_in', String(expires_in));
      localStorage.setItem('tenant_user', JSON.stringify(userData));
      localStorage.setItem('tenant_permissions', JSON.stringify(perms || []));
      localStorage.setItem('tenant_roles', JSON.stringify(roles || []));

      setUser(userData);
      setPermissions(perms || []);
      setRoles(roles || []);
      setIsAuthenticated(true);

      // Set the agent's primary_color as the tenant's theme color
      if (primary_color) {
        setPrimaryColor(primary_color);
      }

      await fetchTenantOnboardingInfo();

      return { success: true, user: { ...userData, roles: roles || [] } };
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
      localStorage.removeItem('tenant_token_expires_in');
      localStorage.removeItem('tenant_user');
      localStorage.removeItem('tenant_permissions');
      localStorage.removeItem('tenant_roles');

      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Logout failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setPrimaryColor(null);
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
    roles,
    isParent:
      Array.isArray(roles) && roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'parent'),
    isImpersonated,
    impersonatorId,
    stopImpersonation,
    tenantInfo,
    refreshTenantInfo,
  };

  return (
    <TenantAuthContext.Provider value={contextValue}>
      <PermissionProvider permissions={permissions || []}>{children}</PermissionProvider>
    </TenantAuthContext.Provider>
  );
};
