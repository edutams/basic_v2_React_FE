import landlordApi from '@/api/landlord/landlord_api';

export const fetchDocsManifest = async () => {
  const response = await landlordApi.get('/v1/landlord/docs/manifest');
  return response.data;
};

export const fetchDocsPage = async (slug) => {
  const response = await landlordApi.get(`/v1/landlord/docs/page/${slug}`);
  return response.data;
};

export const searchDocs = async (query) => {
  const response = await landlordApi.get('/v1/landlord/docs/search', { params: { q: query } });
  return response.data;
};

// See the tenant docsApi's identical comment — a plain <img src> never
// carries the Authorization header this endpoint needs.
export const fetchDocsImage = async (path) => {
  const response = await landlordApi.get(`/v1/landlord/docs/image/${path}`, {
    responseType: 'blob',
  });
  return response.data;
};
