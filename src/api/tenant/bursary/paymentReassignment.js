import api from '@/api/tenant/tenant_api';

export const fetchStuckPayments = async ({ userId }) => {
    const res = await api.get('/bursary/payment_reassignment/stuck_payments', {
        params: { user_id: userId },
    });
    return res.data;
};

export const searchTargetSchedules = async ({ userId, sessionTermId, search }) => {
    const res = await api.get('/bursary/payment_reassignment/search_target_schedules', {
        params: { user_id: userId, session_term_id: sessionTermId, search },
    });
    return res.data;
};

export const reassignPayment = async ({ userId, transactionIds, targetScheduleId }) => {
    const res = await api.post('/bursary/payment_reassignment/reassign', {
        user_id: userId,
        transaction_ids: transactionIds,
        target_schedule_id: targetScheduleId,
    });
    return res.data;
};
