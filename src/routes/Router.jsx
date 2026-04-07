import { createBrowserRouter } from 'react-router';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';

const hostname = window.location.hostname;
const appMode = import.meta.env.MODE;

const centralDomain =
  appMode === 'production'
    ? import.meta.env.VITE_CENTRAL_DOMAIN_PROD
    : import.meta.env.VITE_CENTRAL_DOMAIN_LOCAL;

const isTenantSubdomain =
  hostname !== centralDomain && hostname !== 'localhost' && hostname !== '127.0.0.1';
  

const Router = isTenantSubdomain ? TenantRoutes : AgentRoutes;

const router = createBrowserRouter(Router);

export default router;
