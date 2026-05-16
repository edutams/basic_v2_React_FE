import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../../api/tenant_api';
import authApi from '../../api/auth';
import { PermissionProvider } from './permissions';
import { validateTenantDomain } from './services/tenant.service';
import { CustomizerContext } from '../CustomizerContext';
import tenantApi from '../../api/tenant_api';
import impersonationApi from '../../api/tenant/impersonationApi';

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

  // ── shared internal helper ──────────────────────────────────────────
  const _applyImpersonationToken = (res) => {
    const { access_token, expires_in } = res.data;

    // Preserve the admin token so stopImpersonation can restore it
    const currentToken = localStorage.getItem('tenant_access_token');
    if (currentToken) {
      localStorage.setItem('tenant_original_access_token', currentToken);
    }

    localStorage.setItem('tenant_access_token', access_token);
    localStorage.setItem('tenant_token_expires_in', String(expires_in));
    localStorage.setItem('isImpersonating', 'true');
  };

  // ── impersonateStaff ────────────────────────────────────────────────
  const impersonateStaff = async (staffId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await impersonationApi.impersonateStaff(staffId);
      _applyImpersonationToken(res);

      // Fetch the staff user's profile with the new token
      const meRes = await api.get('/me');
      const { user: staffUser, permissions: perms, roles: userRoles } = meRes.data;

      setUser(staffUser);
      setPermissions(perms || []);
      setRoles(userRoles || []);
      setIsImpersonated(true);
      setIsAuthenticated(true);

      return { success: true, user: staffUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Staff impersonation failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── impersonateStudent ──────────────────────────────────────────────
  const impersonateStudent = async (studentId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await impersonationApi.impersonateStudent(studentId);
      _applyImpersonationToken(res);

      const meRes = await api.get('/me');
      const { user: studentUser, permissions: perms, roles: userRoles } = meRes.data;

      setUser(studentUser);
      setPermissions(perms || []);
      setRoles(userRoles || []);
      setIsImpersonated(true);
      setIsAuthenticated(true);

      return { success: true, user: studentUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Student impersonation failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── impersonateParent ───────────────────────────────────────────────
  const impersonateParent = async (parentId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await impersonationApi.impersonateParent(parentId);
      _applyImpersonationToken(res);

      const meRes = await api.get('/me');
      const { user: parentUser, permissions: perms, roles: userRoles } = meRes.data;

      setUser(parentUser);
      setPermissions(perms || []);
      setRoles(userRoles || []);
      setIsImpersonated(true);
      setIsAuthenticated(true);

      return { success: true, user: parentUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Parent impersonation failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

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
      const res = await impersonationApi.stopImpersonation();
      const { access_token } = res.data;

      // Restore admin token
      localStorage.setItem('tenant_access_token', access_token);
      localStorage.removeItem('tenant_original_access_token');
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('impersonator_id');

      // Re-fetch admin profile
      const meRes = await api.get('/me');
      const { user: adminUser, permissions: perms, roles: userRoles } = meRes.data;

      setUser(adminUser);
      setPermissions(perms || []);
      setRoles(userRoles || []);
      setIsImpersonated(false);
      setImpersonatorId(null);
      setIsAuthenticated(true);

      window.location.reload();

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to stop impersonation';
      setError(msg);
      return { success: false, error: msg };
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
    roles,
    isParent:
      Array.isArray(roles) && roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'parent'),
    isImpersonated,
    impersonatorId,
    impersonateStaff,
    impersonateStudent,
    impersonateParent,
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
