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

// Step 1 of the bank-account setup flow — validates the bank/account number
// combination and returns the resolved account name, for the user to confirm
// before anything is actually saved.
export const resolveAccount = async ({ organizationId, bank, accountNumber }) => {
    const res = await api.post('/v1/landlord/bank_service/resolve_account', {
        organization_id: organizationId,
        bank,
        account_number: accountNumber,
    });
    return res.data;
};

// Step 2 — persists the bank account once the resolved name has been
// confirmed. `name`/`email`/`phone` are the organization's own contact
// details (used to register the payee with the gateway).
export const saveAccount = async ({ organizationId, bank, accountNumber, name, email, phone, orgTitle }) => {
    const res = await api.post('/v1/landlord/bank_service/save_account', {
        id: organizationId,
        bank,
        account_number: accountNumber,
        name,
        email,
        phone,
        org_title: orgTitle,
    });
    return res.data;
};