import tenantApi from '@/api/tenant/tenant_api';

const timetableApi = {
  getStats: (params = {}) => tenantApi.get('/timetable/stats', { params }),
  getAttendanceComplianceReport: (params = {}) => tenantApi.get('/timetable/attendance-compliance-report', { params }),
  saveSnapshot: (sessionTermId) => tenantApi.post('/timetable/save', { session_term_id: sessionTermId }),
  getClassArmGrid: (classArmId, params = {}) => tenantApi.get(`/timetable/class-arm/${classArmId}`, { params }),
  assignSlot: (data) => tenantApi.post('/timetable/slots', data),
  updateSlot: (id, data) => tenantApi.put(`/timetable/slots/${id}`, data),
  clearSlot: (id) => tenantApi.delete(`/timetable/slots/${id}`),
  clearClassArm: (classArmId, sessionTermId) =>
    tenantApi.delete(`/timetable/class-arm/${classArmId}`, { data: { session_term_id: sessionTermId } }),
  getClassArms: (params = {}) => tenantApi.get('/timetable/class-arms', { params }),
  getSubjects: (params = {}) => tenantApi.get('/timetable/subjects', { params }),

  autoFillClassArm: (classArmId) => tenantApi.post(`/timetable/auto-fill/${classArmId}`),
  autoFillAllClasses: () => tenantApi.post('/timetable/auto-fill-all'),
  copyPeriod: (data) => tenantApi.post('/timetable/copy-period', data),
  swapPeriods: (data) => tenantApi.post('/timetable/swap-periods', data),

  getTeacherSchedule: (userId, params = {}) => tenantApi.get(`/timetable/teacher/${userId}`, { params }),
  getMySchedule: (params = {}) => tenantApi.get('/timetable/my-schedule', { params }),
  getMyScheduleOverview: (params = {}) => tenantApi.get('/timetable/my-schedule-overview', { params }),
  getMyLearnerScheduleOverview: (params = {}) => tenantApi.get('/timetable/my-learner-schedule-overview', { params }),
  getTeacherScheduleOverview: (userId, params = {}) => tenantApi.get(`/timetable/teacher/${userId}/overview`, { params }),
  markAttendance: (data) => tenantApi.post('/timetable/occurrences/attend', data),
  cancelClass: (data) => tenantApi.post('/timetable/occurrences/cancel', data),

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

  getBasicSettings: () => tenantApi.get('/timetable/basic-settings'),
  previewSchedule: (data) => tenantApi.post('/timetable/preview-schedule', data),
  saveSchedule: (data) => tenantApi.post('/timetable/save-schedule', data),
};

export default timetableApi;
