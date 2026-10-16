import tenantApi from '@/api/tenant/tenant_api';

const timetableApi = {
  getStats: (params = {}) => tenantApi.get('/timetable/stats', { params }),
  getClassArmGrid: (classArmId, params = {}) => tenantApi.get(`/timetable/class-arm/${classArmId}`, { params }),
  assignSlot: (data) => tenantApi.post('/timetable/slots', data),
  updateSlot: (id, data) => tenantApi.put(`/timetable/slots/${id}`, data),
  clearSlot: (id) => tenantApi.delete(`/timetable/slots/${id}`),
  clearClassArm: (classArmId, sessionTermId) =>
    tenantApi.delete(`/timetable/class-arm/${classArmId}`, { data: { session_term_id: sessionTermId } }),
  getClassArms: (params = {}) => tenantApi.get('/timetable/class-arms', { params }),
  getSubjects: () => tenantApi.get('/timetable/subjects'),

  getTeacherSchedule: (userId, params = {}) => tenantApi.get(`/timetable/teacher/${userId}`, { params }),
  getMySchedule: (params = {}) => tenantApi.get('/timetable/my-schedule', { params }),

  getPeriods: () => tenantApi.get('/timetable/periods'),
  createPeriod: (data) => tenantApi.post('/timetable/periods', data),
  updatePeriod: (id, data) => tenantApi.put(`/timetable/periods/${id}`, data),
  deletePeriod: (id) => tenantApi.delete(`/timetable/periods/${id}`),

  getRooms: () => tenantApi.get('/timetable/rooms'),
  createRoom: (data) => tenantApi.post('/timetable/rooms', data),
  updateRoom: (id, data) => tenantApi.put(`/timetable/rooms/${id}`, data),
  deleteRoom: (id) => tenantApi.delete(`/timetable/rooms/${id}`),

  getSettings: () => tenantApi.get('/timetable/settings'),
  updateSettings: (data) => tenantApi.put('/timetable/settings', data),
};

export default timetableApi;
