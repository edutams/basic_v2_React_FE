import tenantApi from '@/api/tenant/tenant_api';

export const fetchDocsManifest = async () => {
  const response = await tenantApi.get('/docs/manifest');
  return response.data;
};

export const fetchDocsPage = async (slug) => {
  const response = await tenantApi.get(`/docs/page/${slug}`);
  return response.data;
};

export const searchDocs = async (query) => {
  const response = await tenantApi.get('/docs/search', { params: { q: query } });
  return response.data;
};

// Screenshots are served through a gated endpoint, not a plain <img src>,
// since the browser never attaches the Authorization/X-Tenant-ID headers
// to a native image request — this returns the blob so the caller can
// turn it into an object URL instead.
export const fetchDocsImage = async (path) => {
  const response = await tenantApi.get(`/docs/image/${path}`, { responseType: 'blob' });
  return response.data;
};
