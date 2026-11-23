import { IconDatabase, IconShieldCheck, IconScale, IconCoin, IconFolder } from '@tabler/icons';

export const CATEGORIES = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenditure'];

// Code prefix, icon and color per category — shared between the accounts
// table, the category filter pills and the Add Account modal's "Smart
// Suggestion" so every surface agrees on the same scheme.
export const CATEGORY_META = {
  Assets: { prefix: 1, bg: '#DBEAFE', color: '#2563EB', icon: IconDatabase },
  Liabilities: { prefix: 2, bg: '#F3E8FF', color: '#9333EA', icon: IconShieldCheck },
  Expenditure: { prefix: 3, bg: '#FEE2E2', color: '#DC2626', icon: IconFolder },
  Income: { prefix: 4, bg: '#FEF3C7', color: '#D97706', icon: IconCoin },
  Equity: { prefix: 5, bg: '#DCFCE7', color: '#16A34A', icon: IconScale },
};

// Badge colors for the "Account Type" column — Detail accounts accept
// posted transactions directly, Header accounts are summary/parent rows.
export const ACCOUNT_TYPE_META = {
  Detail: { bg: '#DBEAFE', color: '#2563EB' },
  Header: { bg: '#E2E8F0', color: '#475569' },
};

export const POSTING_ALLOWED_META = {
  true: { bg: '#DCFCE7', color: '#15803D' },
  false: { bg: '#F1F5F9', color: '#64748B' },
};

export function suggestAccountCode(category, existingAccounts) {
  const meta = CATEGORY_META[category];
  if (!meta) return '';
  const countInCategory = existingAccounts.filter((a) => a.category === category).length;
  return `${meta.prefix}.${countInCategory + 1}`;
}
