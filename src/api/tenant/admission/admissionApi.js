import api from '@/api/tenant/tenant_api';

// Get all admission batches for a given session term
export const fetchAdmissionBatches = async (sessionTermId) => {
  const response = await api.get('/admission/batches', {
    params: { session_term_id: sessionTermId },
  });
  return response.data;
};

// Create a new admission batch
export const createAdmissionBatch = async (data) => {
  const response = await api.post('/admission/batches', data);
  return response.data;
};

// Update an existing admission batch
export const updateAdmissionBatch = async (id, data) => {
  const response = await api.put(`/admission/batches/${id}`, data);
  return response.data;
};

// Toggle batch open / close status
export const toggleAdmissionBatchStatus = async (id) => {
  const response = await api.patch(`/admission/batches/${id}/toggle-status`);
  return response.data;
};

// Get entry session term options (current + next term)
export const fetchAdmissionEntrySessionTerm = async (sessionTermId) => {
  const response = await api.get(`/admission/entry-session-terms/${sessionTermId}`);
  return response.data;
};

// Get admission code format (school-level setting)
export const fetchAdmissionCodeFormat = async () => {
  const response = await api.get('/admission/code-format');
  return response.data;
};

// Update admission code format (school-level setting)
export const updateAdmissionCodeFormat = async (data) => {
  const response = await api.put('/admission/code-format', data);
  return response.data;
};


// Get all open admission batches (student-facing)
export const getOpenBatches = () =>
  api.get('/admission/open-batches');

// Admission Applications
export const createAdmissionApplication = async (data, isFormData = false) => {
  const config = isFormData ? {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  } : {};
  
  const response = await api.post('/admission/applications', data, config);
  return response.data;
};

export const updateAdmissionApplication = async (id, data, isFormData = false) => {
  if (isFormData) {
    // For FormData with files, use POST with _method spoofing
    data.append('_method', 'PUT');
    const response = await api.post(`/admission/applications/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // Regular PUT for JSON data
    const response = await api.put(`/admission/applications/${id}`, data);
    return response.data;
  }
};

export const updateAdmissionStage = async (id, stage) => {
  const response = await api.patch(`/admission/applications/${id}/stage`, { stage });
  return response.data;
};

export const updateAdmissionPrintStatus = async (id) => {
  const response = await api.put(`/admission/applications/${id}`, { print_form_status: 'yes' });
  return response.data;
};

export const getAdmissionApplication = async (id) => {
  const response = await api.get(`/admission/applications/${id}`);
  return response.data;
};

export const getAdmissionLetterDetails = async (id) => {
  const response = await api.get(`/admission/applications/${id}/letter`);
  return response.data;
};

export const getUserProspectiveAdmissions = async (sessionTermId = null) => {
  const params = sessionTermId ? { session_term_id: sessionTermId } : {};
  const response = await api.get('/admission/my-prospective-applications', { params });
  return response.data;
};

export const getAllMyAdmissionApplication = async (sessionTermId = null) => {
  const params = sessionTermId ? { session_term_id: sessionTermId } : {};
  const response = await api.get('/admission/all-my-applications', { params });
  return response.data;
};

// ── Parent Dashboard v2 — one endpoint per card, fetched independently ──
const parentParams = (sessionTermId = null) =>
  sessionTermId ? { session_term_id: sessionTermId } : {};

// Finance stat cards (paid / outstanding / pending)
export const getParentFinance = async (sessionTermId = null) => {
  const response = await api.get('/admission/parent/finance', { params: parentParams(sessionTermId) });
  return response.data;
};

// Attendance Overview card (+ Performance Snapshot)
export const getParentAttendance = async (sessionTermId = null) => {
  const response = await api.get('/admission/parent/attendance', { params: parentParams(sessionTermId) });
  return response.data;
};

// Academic Overview + Engagement cards
export const getParentAcademics = async (sessionTermId = null) => {
  const response = await api.get('/admission/parent/academics', { params: parentParams(sessionTermId) });
  return response.data;
};

// Upcoming Events card
export const getParentEvents = async (sessionTermId = null) => {
  const response = await api.get('/admission/parent/events', { params: parentParams(sessionTermId) });
  return response.data;
};

// Teacher Contacts card
export const getParentContacts = async (sessionTermId = null) => {
  const response = await api.get('/admission/parent/contacts', { params: parentParams(sessionTermId) });
  return response.data;
};

// Recent Messages card
export const getParentMessages = async (sessionTermId = null) => {
  const response = await api.get('/admission/parent/messages', { params: parentParams(sessionTermId) });
  return response.data;
};

// Notifications card
export const getParentNotifications = async (sessionTermId = null) => {
  const response = await api.get('/admission/parent/notifications', { params: parentParams(sessionTermId) });
  return response.data;
};

export const getParentInsightsDetail = async (type, sessionTermId = null) => {
  const params = { type };
  if (sessionTermId) params.session_term_id = sessionTermId;
  const response = await api.get('/admission/parent-insights/detail', { params });
  return response.data;
};

export const getParentDashboard = async (sessionTermId = null) => {
  const params = sessionTermId ? { session_term_id: sessionTermId } : {};
  const response = await api.get('/admission/parent-dashboard', { params });
  return response.data;
};

// Admission Payment
export const checkAdmissionPaymentStatus = async (admissionId) => {
  const response = await api.get(`/admission/payments/status/${admissionId}`);
  return response.data;
};

export const initiateAdmissionPayment = async (data) => {
  const response = await api.post('/admission/payments/initiate', data);
  return response.data;
};

// Get admission payment receipt
export const getAdmissionPaymentReceipt = async (admissionId) => {
  const response = await api.get(`/admission/payments/receipt/${admissionId}`);
  return response.data;
};

// States and LGAs
export const getAllStates = async () => {
  try {
    const res = await api.get('state/get_states');
    return res.data?.data;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

export const getLgasByState = async (state_id) => {
  try {
    const res = await api.get(`state/lga/${state_id}/get_lga_by_state_id`);
    return res.data?.data;
  } catch (error) {
    console.error(`Error fetching LGAs for state ${state_id}:`, error);
    throw error;
  }
};
