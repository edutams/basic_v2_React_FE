import api from '@/api/tenant/tenant_api';

export const fetchFinancePeriods = async () => {
    const res = await api.get('/finance_reports/periods');
    return res.data;
};

export const fetchIncomeExpenditureSummary = async (params) => {
    const res = await api.get('/finance_reports/income_expenditure_summary', { params });
    return res.data;
};

export const fetchIncomeDetails = async (params) => {
    const res = await api.get('/finance_reports/income_details', { params });
    return res.data;
};

export const fetchExpenditureDetails = async (params) => {
    const res = await api.get('/finance_reports/expenditure_details', { params });
    return res.data;
};

export const fetchIncomeTransactions = async (params) => {
    const res = await api.get('/finance_reports/income_transactions', { params });
    return res.data;
};

export const fetchExpenditureTransactions = async (params) => {
    const res = await api.get('/finance_reports/expenditure_transactions', { params });
    return res.data;
};

export const fetchBalanceSheetSummary = async (params) => {
    const res = await api.get('/finance_reports/balance_sheet_summary', { params });
    return res.data;
};

export const fetchAssetDetails = async (params) => {
    const res = await api.get('/finance_reports/asset_details', { params });
    return res.data;
};

export const fetchLiabilityDetails = async (params) => {
    const res = await api.get('/finance_reports/liability_details', { params });
    return res.data;
};

export const fetchEquityDetails = async (params) => {
    const res = await api.get('/finance_reports/equity_details', { params });
    return res.data;
};

export const fetchCategoryTransactions = async (params) => {
    const res = await api.get('/finance_reports/category_transactions', { params });
    return res.data;
};
