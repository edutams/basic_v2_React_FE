import { createBrowserRouter } from 'react-router';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';
import { validateTenantDomain } from '../context/TenantContext/services/tenant.service';

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
  // status: true  → valid tenant
  // status: false → tenant not found (still need TenantRoutes for /school-not-found)
  Router = TenantRoutes;
}

export { tenantValidation };

const router = createBrowserRouter(Router);

export default router;
