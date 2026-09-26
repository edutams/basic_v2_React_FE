import api from '@/api/tenant/tenant_api';

export const fetchStudentsForClass = async ({ classArmId, sessionTermId }) => {
    const res = await api.get('/bursary/payment_category/students_by_class', {
        params: { class_arm_id: classArmId, session_term_id: sessionTermId },
    });
    return res.data;
};

export const fetchRemapPreview = async ({ userId, sessionTermId, newCategoryId }) => {
    const res = await api.get('/bursary/payment_category/remap_preview', {
        params: { user_id: userId, session_term_id: sessionTermId, new_category_id: newCategoryId },
    });
    return res.data;
};

export const applyCategoryRemap = async ({ userId, sessionTermId, newCategoryId, mappings }) => {
    const res = await api.post('/bursary/payment_category/remap_apply', {
        user_id: userId,
        session_term_id: sessionTermId,
        new_category_id: newCategoryId,
        mappings,
    });
    return res.data;
};

export const assignCategory = async ({ userId, sessionTermId, categoryId }) => {
    const res = await api.post('/bursary/payment_category/assign', {
        user_id: userId,
        session_term_id: sessionTermId,
        category_id: categoryId,
    });
    return res.data;
};
