import api from '@/api/tenant/tenant_api';

// Comprehensive per-student payment history — every channel (online, post
// cash, bank teller), unlike the Transactions Overview page which only
// shows online ones. Reachable by bursary staff (any student), a parent
// (their own wards), or a student (themselves) — the backend enforces who
// may view whom, not just the UI.

// The parent's own wards (for the ward-selector, each with class/arm/
// programme) plus the guardian's own identity + wallet — a parent has no
// fees of their own, so "myself" means payments they made, not a fee record.
export const fetchMyWards = async () => {
  const res = await api.get('/bursary/payment_history/my_wards');
  return res.data;
};

// Every payment a parent personally made, on behalf of any of their wards.
export const fetchPaymentsIMade = async ({
  session_id,
  session_term_id,
  pay_type,
  status,
  page,
  per_page,
} = {}) => {
  const res = await api.get('/bursary/payment_history/my_payments_made', {
    params: { session_id, session_term_id, pay_type, status, page, per_page },
  });
  return res.data;
};

// Students registered in a class arm, for the staff Programme/Class/Student
// picker. Staff-only — not the Result Module's teacher-scoped equivalent.
export const fetchPaymentHistoryClassStudents = async (class_arm_id, session_term_id) => {
  const res = await api.get('/bursary/payment_history/class_students', {
    params: { class_arm_id, session_term_id },
  });
  return res.data;
};

// Compulsory/optional due-paid-balance summary card for one student/term.
// Pass session_term_id for one specific term, or session_id alone to total
// across every term in that session.
export const fetchPaymentHistorySummary = async ({ user_id, session_id, session_term_id } = {}) => {
  const res = await api.get('/bursary/payment_history/summary', {
    params: { user_id, session_id, session_term_id },
  });
  return res.data;
};

// The paginated transaction list for one student, optionally filtered.
export const fetchPaymentHistoryTransactions = async ({
  user_id,
  session_id,
  session_term_id,
  pay_type,
  status,
  payment_name_id,
  page,
  per_page,
} = {}) => {
  const res = await api.get('/bursary/payment_history/transactions', {
    params: { user_id, session_id, session_term_id, pay_type, status, payment_name_id, page, per_page },
  });
  return res.data;
};

// Payment-name filter options, scoped to what this student has transacted against.
export const fetchPaymentHistoryPaymentNameOptions = async (user_id) => {
  const res = await api.get('/bursary/payment_history/payment_name_options', {
    params: { user_id },
  });
  return res.data;
};

// Session-term filter options, scoped to terms this student has transacted in.
export const fetchPaymentHistorySessionTermOptions = async (user_id) => {
  const res = await api.get('/bursary/payment_history/session_term_options', {
    params: { user_id },
  });
  return res.data;
};

// Debounced free-text student search (name or admission no) for staff — a
// faster path to a student than the Programme/Class cascade.
export const searchPaymentHistoryStudents = async (q) => {
  const res = await api.get('/bursary/payment_history/search_students', {
    params: { q },
  });
  return res.data;
};

// Re-verify one ONLINE transaction against the payment gateway. Ownership-
// checked backend-side, so a parent/student may only requery their own/ward's
// transactions; restricted to ONLINE (CASH/BANK_TELLER have no gateway record).
export const requeryPaymentHistoryTransaction = async (id) => {
  const res = await api.get('/bursary/payment_history/requery_transaction', {
    params: { id },
  });
  return res.data;
};
