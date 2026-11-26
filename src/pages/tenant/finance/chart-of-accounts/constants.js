import { IconDatabase, IconShieldCheck, IconScale, IconCoin, IconFolder } from '@tabler/icons';

// Order and prefixes match the backend's seeded chart_of_accounts roots
// (code "1".."5"): Assets, Liabilities, Equity, Income, Expenditure.
export const CATEGORIES = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenditure'];

export const CATEGORY_META = {
  Assets: { prefix: 1, bg: '#DBEAFE', color: '#2563EB', icon: IconDatabase },
  Liabilities: { prefix: 2, bg: '#F3E8FF', color: '#9333EA', icon: IconShieldCheck },
  Equity: { prefix: 3, bg: '#DCFCE7', color: '#16A34A', icon: IconScale },
  Income: { prefix: 4, bg: '#FEF3C7', color: '#D97706', icon: IconCoin },
  Expenditure: { prefix: 5, bg: '#FEE2E2', color: '#DC2626', icon: IconFolder },
};

// Every category has exactly 2 fixed classification values a detail account
// must carry — Assets/Liabilities/Equity use Current vs Non-Current,
// Income/Expenditure use Fees Collection vs Non-Fees Collection. This is a
// plain field on the detail account itself, not a separate account row to
// nest under (there's no "X.1 Non-Current Assets" row any more — see the
// backend's ChartOfAccountSeeder docblock).
export const CLASSIFICATIONS_BY_CATEGORY = {
  Assets: [
    { key: 'non_current', label: 'Non-Current Assets' },
    { key: 'current', label: 'Current Assets' },
  ],
  Liabilities: [
    { key: 'non_current', label: 'Non-Current Liabilities' },
    { key: 'current', label: 'Current Liabilities' },
  ],
  Equity: [
    { key: 'non_current', label: 'Non-Current Equity' },
    { key: 'current', label: 'Current Equity' },
  ],
  Income: [
    { key: 'fees_collection', label: 'Fees Collection' },
    { key: 'non_fees_collection', label: 'Non-Fees Collection' },
  ],
  Expenditure: [
    { key: 'fees_collection', label: 'Fees Collection' },
    { key: 'non_fees_collection', label: 'Non-Fees Collection' },
  ],
};

export const CATEGORY_API_VALUE = {
  Assets: 'assets',
  Liabilities: 'liabilities',
  Equity: 'equity',
  Income: 'income',
  Expenditure: 'expenditure',
};

export const CATEGORY_LABEL_FROM_API = Object.fromEntries(
  Object.entries(CATEGORY_API_VALUE).map(([label, value]) => [value, label]),
);

export function classificationLabel(category, classificationKey) {
  const match = (CLASSIFICATIONS_BY_CATEGORY[category] || []).find((c) => c.key === classificationKey);
  return match?.label || classificationKey;
}
