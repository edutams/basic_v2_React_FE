import tenantApi from '@/api/tenant/tenant_api';

const impersonationApi = {
    impersonateStaff: (staffId) => tenantApi.post(`/impersonate/staff/${staffId}`),
    impersonateStudent: (studentId) => tenantApi.post(`/impersonate/student/${studentId}`),
    impersonateParent: (parentId) => tenantApi.post(`/impersonate/parent/${parentId}`),
    stopImpersonation: () => tenantApi.post('/impersonate/stop'),
};

export default impersonationApi;