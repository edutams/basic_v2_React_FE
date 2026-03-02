import { useContext } from 'react';
import { AuthContext } from '../context/AgentContext/auth';
import { TenantAuthContext } from '../context/TenantContext/auth';


export const useAuth = () => {
  const agentContext = useContext(AuthContext);
  const tenantContext = useContext(TenantAuthContext);

  const context = agentContext || tenantContext;

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider or TenantAuthProvider');
  }

  return context;
};

export default useAuth;
