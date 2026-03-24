import api from '../auth';

// PHET API Service
// Handles all API calls for PHET subjects and topics

const phetApi = {
  /**
   * Get all subjects
   * @param {Object} params - Query parameters (page, limit, search, status)
   */
  getSubjects: async (params = {}) => {
    const response = await api.get('/agent/phet/subjects', { params });
    return response.data.data;
  },

  /**
   * Get a single subject by ID
   * @param {number|string} id - Subject ID
   */
  getSubject: async (id) => {
    const response = await api.get(`/agent/phet/subjects/${id}`);
    return response.data.data;
  },

  /**
   * Create a new subject
   * @param {Object} data - Subject data
   */
  createSubject: async (data) => {
    const response = await api.post('/agent/phet/subjects', data);
    return response.data.data;
  },

  /**
   * Update an existing subject
   * @param {number|string} id - Subject ID
   * @param {Object} data - Subject data to update
   */
  updateSubject: async (id, data) => {
    const response = await api.put(`/agent/phet/subjects/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a subject
   * @param {number|string} id - Subject ID
   */
  deleteSubject: async (id) => {
    const response = await api.delete(`/agent/phet/subjects/${id}`);
    return response.data.data;
  },

  /**
   * Get all topics
   * @param {Object} params - Query parameters (page, limit, search, status, subject_id)
   */
  getTopics: async (params = {}) => {
    const response = await api.get('/agent/phet/topics', { params });
    return response.data.data;
  },

  /**
   * Get topics by subject ID
   * @param {number|string} subjectId - Subject ID
   */
  getTopicsBySubject: async (subjectId) => {
    const response = await api.get(`/agent/phet/subjects/${subjectId}/topics`);
    return response.data.data;
  },

  /**
   * Get a single topic by ID
   * @param {number|string} id - Topic ID
   */
  getTopic: async (id) => {
    const response = await api.get(`/agent/phet/topics/${id}`);
    return response.data.data;
  },

  /**
   * Create a new topic
   * @param {Object} data - Topic data
   */
  createTopic: async (data) => {
    const response = await api.post('/agent/phet/topics', data);
    return response.data.data;
  },

  /**
   * Update an existing topic
   * @param {number|string} id - Topic ID
   * @param {Object} data - Topic data to update
   */
  updateTopic: async (id, data) => {
    const response = await api.put(`/agent/phet/topics/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a topic
   * @param {number|string} id - Topic ID
   */
  deleteTopic: async (id) => {
    const response = await api.delete(`/agent/phet/topics/${id}`);
    return response.data.data;
  },
};

export default phetApi;
