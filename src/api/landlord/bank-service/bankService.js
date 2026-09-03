import api from "@/api/landlord/landlord_api";

export const fetchBankServices = async () => {
    const res = await api.get('/v1/landlord/bank_service/fetch_bank_services');
    return res.data;
};

export const saveBankService = async (data) => {
    const res = await api.post('/v1/landlord/bank_service/save_bank_services', data);
    return res.data;
};

export const fetchSkoolPayBanks = async (organizationId) => {
    const res = await api.get('/v1/landlord/bank_service/fetch_skoolpay_banks', {
        params: { organization_id: organizationId },
    });
    return res.data;
};