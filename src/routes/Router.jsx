import { createBrowserRouter } from 'react-router';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';

const hostname = window.location.hostname;

const centralDomain =
  hostname === 'localhost' || hostname === '127.0.0.1'
    ? import.meta.env.VITE_CENTRAL_DOMAIN_LOCAL
    : import.meta.env.VITE_CENTRAL_DOMAIN_PROD;

const isTenantSubdomain =
  hostname !== centralDomain && hostname !== 'localhost' && hostname !== '127.0.0.1';

const Router = isTenantSubdomain ? TenantRoutes : AgentRoutes;

const router = createBrowserRouter(Router);

export default router;
