import { createBrowserRouter } from 'react-router';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';

const hostname = window.location.hostname;
const centralHost = import.meta.env.VITE_API_BASE_URL
  ? new URL(import.meta.env.VITE_API_BASE_URL).hostname
  : 'basic_v2.test';

const isTenantSubdomain =
  hostname !== centralHost && hostname !== 'localhost' && hostname !== '127.0.0.1';

const Router = isTenantSubdomain ? TenantRoutes : AgentRoutes;

const router = createBrowserRouter(Router);

export default router;
