import { createBrowserRouter } from 'react-router';
import TenantRoutes from './TenantRoutes';
import AgentRoutes from './AgentRoutes';
import { validateTenantDomain } from '../context/TenantContext/services/tenant.service';

const hostname = window.location.hostname;
const data = await validateTenantDomain(hostname);
// console.log(data, 9998);

const Router = data?.status === false ? AgentRoutes : TenantRoutes;

const router = createBrowserRouter(Router);

export default router;
