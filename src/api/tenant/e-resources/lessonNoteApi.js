import tenantApi from '@/api/tenant/tenant_api';

export const tenantLessonNoteApi = {
  index: async () => {
    const response = await tenantApi.get('/e-resources/lesson-note');
    return response.data;
  },
  fetchAndSetupLessonData: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/fetch-and-setup', data);
    return response.data;
  },
  // Split areas of concern of fetch-and-setup: weeks first, then topics for
  // the picked week, then subtopics for the picked topic.
  getSchemeWeeks: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/scheme-weeks', data);
    return response.data;
  },
  getSchemeWeekTopics: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/scheme-weeks/topics', data);
    return response.data;
  },
  getTopicSubtopics: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/topics/subtopics', data);
    return response.data;
  },
  getTeachingSubject: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/teaching-subjects', data);
    return response.data;
  },
  getTeacherSubject: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/teacher-subjects', data);
    return response.data;
  },
  subjTchAll: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/subjects-all', data);
    return response.data;
  },
  getProgramme: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/programmes', data);
    return response.data;
  },
  getClasses: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/classes', data);
    return response.data;
  },
  getSubjects: async (classArmId) => {
    const response = await tenantApi.get(`/e-resources/lesson-note/subjects/${classArmId}`);
    return response.data;
  },
  lessonPlan: async (schemeOfWorkId, staffSubjectId) => {
    const response = await tenantApi.get(
      `/e-resources/lesson-note/plan/${schemeOfWorkId}/${staffSubjectId}`,
    );
    return response.data;
  },
  lessonPlanNote: async (schemeOfWorkId, staffSubjectId) => {
    const response = await tenantApi.get(
      `/e-resources/lesson-note/note/${schemeOfWorkId}/${staffSubjectId}`,
    );
    return response.data;
  },
  subjectContent: async (subjectId, sessTerm, progId, classId) => {
    const response = await tenantApi.get(
      `/e-resources/lesson-note/subject-content/${subjectId}/${sessTerm}/${progId}/${classId}`,
    );
    return response.data;
  },
  getSubjectContentTopic: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/subject-content-topic', data);
    return response.data;
  },
  getLessonPlans: async (schemeOfWorkId, data = {}) => {
    const response = await tenantApi.post(`/e-resources/lesson-note/plans/${schemeOfWorkId}`, data);
    return response.data;
  },
  getLessonNotes: async (schemeOfWorkId, data = {}) => {
    const response = await tenantApi.post(`/e-resources/lesson-note/notes/${schemeOfWorkId}`, data);
    return response.data;
  },
  getLessonVideos: async (schemeOfWorkId, data = {}) => {
    const response = await tenantApi.post(`/e-resources/lesson-note/videos/${schemeOfWorkId}`, data);
    return response.data;
  },
  addlessonNoteContent: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/note', data);
    return response.data;
  },
  lessonPlanContent: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/plan', data);
    return response.data;
  },
  uploadLessonVideo: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/video', data);
    return response.data;
  },
  generateLessonNoteAi: async (schemeOfWorkId, teacherId, data) => {
    const response = await tenantApi.post(
      `/e-resources/lesson-note/note/${schemeOfWorkId}/${teacherId}/generate-ai`,
      data,
    );
    return response.data;
  },
  generateLessonPlanAi: async (schemeOfWorkId, teacherId, data) => {
    const response = await tenantApi.post(
      `/e-resources/lesson-note/plan/${schemeOfWorkId}/${teacherId}/generate-ai`,
      data,
    );
    return response.data;
  },
  generateLessonVideoAi: async (schemeOfWorkId, teacherId, data) => {
    const response = await tenantApi.post(
      `/e-resources/lesson-note/video/${schemeOfWorkId}/${teacherId}/generate-ai`,
      data,
    );
    return response.data;
  },
  updateLessonPlan: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(
      `/e-resources/lesson-note/plan/${schemeOfWorkId}/update`,
      data,
    );
    return response.data;
  },
  approveLessonPlan: async (data) => {
    const response = await tenantApi.post('/e-resources/lesson-note/plan/approve', data);
    return response.data;
  },
  updateLessonNote: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(
      `/e-resources/lesson-note/note/${schemeOfWorkId}/update`,
      data,
    );
    return response.data;
  },
  getTeacherProgress: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(
      `/e-resources/lesson-note/teacher-progress/${schemeOfWorkId}`,
      data,
    );
    return response.data;
  },
  getClassProgress: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(
      `/e-resources/lesson-note/class-progress/${schemeOfWorkId}`,
      data,
    );
    return response.data;
  },
};

export const tenantApprovalApi = {
  index: async () => {
    const response = await tenantApi.get('/e-resources/approval');
    return response.data;
  },
  getLessonApprovalContent: async (data, params) => {
    const response = await tenantApi.post('/e-resources/approval/content', data, { params });
    return response.data;
  },
  approveLessonContent: async (data) => {
    const response = await tenantApi.post('/e-resources/approval/process', data);
    return response.data;
  },
};
