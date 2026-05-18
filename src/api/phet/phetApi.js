import api from '../auth';

const phetApi = {
  /**
   * @param {Object} params
   */
  getSubjects: async (params = {}) => {
    const response = await api.get('v1/landlord/phet/subjects', { params });
    return response.data.data;
  },

  /**
   * @param {number|string} id
   */
  getSubject: async (id) => {
    const response = await api.get(`v1/landlord/phet/subjects/${id}`);
    return response.data.data;
  },

  /**
   * @param {Object} data
   */
  createSubject: async (data) => {
    const response = await api.post('v1/landlord/phet/subjects', data);
    return response.data.data;
  },

  /**
   * @param {number|string} id
   * @param {Object} data
   */
  updateSubject: async (id, data) => {
    const response = await api.put(`v1/landlord/phet/subjects/${id}`, data);
    return response.data.data;
  },

  /**
   * @param {number|string} id
   */
  deleteSubject: async (id) => {
    const response = await api.delete(`v1/landlord/phet/subjects/${id}`);
    return response.data.data;
  },

  /**
   * @param {Object} params
   */
  getTopics: async (params = {}) => {
    const response = await api.get('v1/landlord/phet/topics', { params });
    return response.data.data;
  },

  /**
   * @param {number|string} subjectId
   */
  getTopicsBySubject: async (subjectId) => {
    const response = await api.get(`v1/landlord/phet/subjects/${subjectId}/topics`);
    return response.data.data;
  },

  /**
   * @param {number|string} id
   */
  getTopic: async (id) => {
    const response = await api.get(`v1/landlord/phet/topics/${id}`);
    return response.data.data;
  },

  /**
   * Create a new topic
   * @param {Object} data
   */
  createTopic: async (data) => {
    const response = await api.post('v1/landlord/phet/topics', data);
    return response.data.data;
  },

  /**
   * @param {number|string} id
   * @param {Object} data
   */
  updateTopic: async (id, data) => {
    const response = await api.put(`v1/landlord/phet/topics/${id}`, data);
    return response.data.data;
  },

  /**
   * @param {number|string} id
   */
  deleteTopic: async (id) => {
    const response = await api.delete(`v1/landlord/phet/topics/${id}`);
    return response.data.data;
  },

  /**
   * @param {Object} params
   */
  getSimulationLinks: async (params = {}) => {
    const response = await api.get('v1/landlord/phet/simulation-links', { params });
    return response.data.data;
  },

  /**s
   * @param {number|string} id
   */
  getSimulationLink: async (id) => {
    const response = await api.get(`v1/landlord/phet/simulation-links/${id}`);
    return response.data.data;
  },

  /**
   * Create a new simulation link
   * @param {Object} data
   */
  createSimulationLink: async (data) => {
    const response = await api.post('v1/landlord/phet/simulation-links', data);
    return response.data.data;
  },

  /**
   * @param {number|string} id
   * @param {Object} data
   */
  updateSimulationLink: async (id, data) => {
    const response = await api.put(`v1/landlord/phet/simulation-links/${id}`, data);
    return response.data.data;
  },

  /**
   * @param {number|string} id
   */
  deleteSimulationLink: async (id) => {
    const response = await api.delete(`v1/landlord/phet/simulation-links/${id}`);
    return response.data.data;
  },

  getSubjectsForDropdown: async () => {
    const response = await api.get('v1/landlord/phet/subjects', { params: { limit: 1000 } });
    return response.data.data;
  },

  getTopicsForDropdown: async (subjectId = null) => {
    const params = subjectId ? { subject_id: subjectId, limit: 1000 } : { limit: 1000 };
    const response = await api.get('v1/landlord/phet/topics', { params });
    return response.data.data;
  },
};

export default phetApi;
