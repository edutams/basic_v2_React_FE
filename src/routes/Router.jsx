import { createBrowserRouter } from 'react-router-dom';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';
import DomainNotFoundRoutes from './DomainNotFoundRoutes';
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
  // status: true / type: 'tenant'       → valid school       → TenantRoutes
  // status: true / type: 'organization' → organization domain → AgentRoutes
  // status: false, or the request itself failed (null)        → DomainNotFoundRoutes
  //   (a mistyped/unknown school subdomain must never silently render the
  //   agent portal under what still looks like a school's own address)
  if (tenantValidation?.status === true && tenantValidation?.type === 'tenant') {
    Router = TenantRoutes;
  } else if (tenantValidation?.status !== true) {
    Router = DomainNotFoundRoutes;
  }
}

export { tenantValidation };

const router = createBrowserRouter(Router);

export default router;
