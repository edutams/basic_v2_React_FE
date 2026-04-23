import { createBrowserRouter } from 'react-router';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';
import { validateTenantDomain } from '../context/TenantContext/services/tenant.service';

const hostname = window.location.hostname;
const data = await validateTenantDomain(hostname);

const isTenant = data?.status === true;
const Router = isTenant ? TenantRoutes : AgentRoutes;

const router = createBrowserRouter(Router);

export default router;
