import { useContext } from 'react';
import { AuthContext } from '../context/AgentContext/auth';
import { TenantAuthContext } from '../context/TenantContext/auth';


export const useAuth = () => {
  const agentContext = useContext(AuthContext);
  const tenantContext = useContext(TenantAuthContext);

  // Use the context whose provider is actually mounted in this app instance.
  // TenantAuthContext is only provided inside the tenant app, so if it exists
  // and has an authenticated (or loading) session, prefer it.
  // AgentContext is only provided inside the landlord/agent app.
  if (tenantContext !== undefined) {
    return tenantContext;
  }

  if (agentContext !== undefined) {
    return agentContext;
  }

  throw new Error('useAuth must be used within an AuthProvider or TenantAuthProvider');
};

export default useAuth;
