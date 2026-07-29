import { createBrowserRouter } from 'react-router-dom';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';
import { validateTenantDomain } from '../api/tenant/set-up/tenant-setup';

const hostname = window.location.hostname;

const centralDomain = import.meta.env.DEV
  ? new URL(import.meta.env.VITE_CENTRAL_DOMAIN_LOCAL).hostname
  : import.meta.env.VITE_CENTRAL_DOMAIN_PROD;

const isCentralDomain =
  hostname === centralDomain || hostname === 'localhost' || hostname === '127.0.0.1';

let tenantValidation = null;
let Router = AgentRoutes;

if (!isCentralDomain) {
  tenantValidation = await validateTenantDomain(hostname);
  // status: true / type: 'tenant'  → valid school → TenantRoutes
  // status: true / type: 'organization'  → organization domain → AgentRoutes
  // status: false → unknown domain → AgentRoutes (fallback)
  if (tenantValidation?.status === true && tenantValidation?.type === 'tenant') {
    Router = TenantRoutes;
  }
}

export { tenantValidation };

const router = createBrowserRouter(Router);

export default router;
