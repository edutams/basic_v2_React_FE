import api from './auth';


export const fetchOverview = () => api.get('/v1/landlord/analytics/overview').then(r => r.data);

export const fetchSchoolGrowth = (params) => api.get('/v1/landlord/analytics/school-growth', { params }).then(r => r.data);

export const fetchEnrollments = (params) => api.get('/v1/landlord/analytics/enrollments', { params }).then(r => r.data);

export const fetchGeographic = () => api.get('/v1/landlord/analytics/geographic').then(r => r.data);

export const fetchOnboardingFunnel = () => api.get('/v1/landlord/analytics/onboarding-funnel').then(r => r.data);

export const fetchPerSchool = (params) => api.get('/v1/landlord/analytics/per-school', { params }).then(r => r.data);