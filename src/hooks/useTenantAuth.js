import { useContext } from 'react';
import { TenantAuthContext } from '../context/TenantContext/auth';

export const useTenantAuth = () => {
  const context = useContext(TenantAuthContext);

  if (!context) {
    console.error('useTenantAuth context is undefined!');
    throw new Error('useTenantAuth must be used within a TenantAuthProvider');
  }

  return context;
};

export default useTenantAuth;
