import { useContext } from 'react';
import { TenantAuthContext } from '../context/TenantContext/auth';

export const useTenantAuth = () => {
  const context = useContext(TenantAuthContext);

  if (!context) {
    throw new Error('useTenantAuth must be used within a TenantAuthProvider');
  }

  return context;
};

export default useTenantAuth;
