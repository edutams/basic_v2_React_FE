import {
  IconBooks,
  IconDeviceLaptop,
  IconTool,
  IconPencil,
  IconToolsKitchen2,
  IconShieldCheck,
  IconPlant2,
  IconBolt,
} from '@tabler/icons';

// Color + icon per vendor category — shared between the category filter,
// the table's category chip, and the vendor row's icon badge.
export const VENDOR_CATEGORY_META = {
  'Books & Learning Materials': { bg: '#DBEAFE', color: '#2563EB', icon: IconBooks },
  'ICT / Technology': { bg: '#F3E8FF', color: '#9333EA', icon: IconDeviceLaptop },
  'Facilities & Maintenance': { bg: '#CCFBF1', color: '#0D9488', icon: IconTool },
  'Office & Stationery Supplies': { bg: '#FEF3C7', color: '#D97706', icon: IconPencil },
  'Catering & Welfare': { bg: '#FEE2E2', color: '#DC2626', icon: IconToolsKitchen2 },
  'Security Services': { bg: '#DCFCE7', color: '#15803D', icon: IconShieldCheck },
  'Agricultural Supplies': { bg: '#DCFCE7', color: '#16A34A', icon: IconPlant2 },
  'Electrical & Utilities': { bg: '#FEF9C3', color: '#CA8A04', icon: IconBolt },
};

export const VENDOR_CATEGORIES = Object.keys(VENDOR_CATEGORY_META);

export const STATUS_META = {
  Active: { bg: '#DCFCE7', color: '#15803D' },
  Inactive: { bg: '#F1F5F9', color: '#64748B' },
};

export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n}`;
}

export const mockVendors = [
  {
    id: '1',
    name: 'Alpha Books Ltd',
    category: 'Books & Learning Materials',
    contactPerson: 'Mr. Segun Adebayo',
    phone: '0803 123 4567',
    email: 'sales@alphabooks.com',
    tin: '0123456789',
    address: '12 Education Close, Ikeja, Lagos.',
    status: 'Active',
    transactions: 12,
    totalSpend: 8750000,
    rating: 4.5,
    yearsActive: 2,
  },
  {
    id: '2',
    name: 'TechNova Solutions',
    category: 'ICT / Technology',
    contactPerson: 'Ms. Fatima Salisu',
    phone: '0905 678 4321',
    email: 'info@technova.com',
    tin: '0234567891',
    address: '45 Allen Avenue, Ikeja, Lagos.',
    status: 'Active',
    transactions: 9,
    totalSpend: 5400000,
    rating: 4.2,
    yearsActive: 3,
  },
  {
    id: '3',
    name: 'CleanPro Services',
    category: 'Facilities & Maintenance',
    contactPerson: 'Mr. Adewale Musa',
    phone: '0806 321 9876',
    email: 'contact@cleanpro.ng',
    tin: '0345678912',
    address: '8 Simbiat Abiola Way, Ikeja, Lagos.',
    status: 'Active',
    transactions: 20,
    totalSpend: 2100000,
    rating: 4.0,
    yearsActive: 4,
  },
  {
    id: '4',
    name: 'Prime Stationery Stores',
    category: 'Office & Stationery Supplies',
    contactPerson: 'Mrs. Bola Okon',
    phone: '0812 334 5566',
    email: 'orders@primestationery.com',
    tin: '0456789123',
    address: '3 Opebi Road, Ikeja, Lagos.',
    status: 'Active',
    transactions: 15,
    totalSpend: 1800000,
    rating: 4.3,
    yearsActive: 2,
  },
  {
    id: '5',
    name: 'Royal Caterers Ltd',
    category: 'Catering & Welfare',
    contactPerson: 'Mr. Tunde Lawal',
    phone: '0809 445 6677',
    email: 'catering@royalcaterers.ng',
    tin: '0567891234',
    address: '21 Toyin Street, Ikeja, Lagos.',
    status: 'Inactive',
    transactions: 6,
    totalSpend: 950000,
    rating: 3.6,
    yearsActive: 1,
  },
  {
    id: '6',
    name: 'SafeGuard Security',
    category: 'Security Services',
    contactPerson: 'Mr. Kabir Yakubu',
    phone: '0810 998 7766',
    email: 'admin@safeguard.com',
    tin: '0678912345',
    address: '17 Awolowo Road, Ikeja, Lagos.',
    status: 'Active',
    transactions: 24,
    totalSpend: 6200000,
    rating: 4.7,
    yearsActive: 5,
  },
  {
    id: '7',
    name: 'GreenField Farms',
    category: 'Agricultural Supplies',
    contactPerson: 'Mr. Idowu Adeyemi',
    phone: '0815 667 8899',
    email: 'sales@greenfield.ng',
    tin: '0789123456',
    address: '5 Agric Road, Ikorodu, Lagos.',
    status: 'Active',
    transactions: 8,
    totalSpend: 1250000,
    rating: 4.1,
    yearsActive: 2,
  },
  {
    id: '8',
    name: 'PowerTech Electricals',
    category: 'Electrical & Utilities',
    contactPerson: 'Engr. Chioma Nwosu',
    phone: '0807 221 3344',
    email: 'support@powertech.ng',
    tin: '0891234567',
    address: '9 Adeniran Ogunsanya St, Surulere, Lagos.',
    status: 'Active',
    transactions: 11,
    totalSpend: 3400000,
    rating: 4.4,
    yearsActive: 3,
  },
];

export const spendTrend = [
  { month: 'Jan', spend: 2800000 },
  { month: 'Feb', spend: 3100000 },
  { month: 'Mar', spend: 2600000 },
  { month: 'Apr', spend: 3600000 },
  { month: 'May', spend: 4100000 },
  { month: 'Jun', spend: 3400000 },
  { month: 'Jul', spend: 3900000 },
  { month: 'Aug', spend: 4400000 },
  { month: 'Sep', spend: 4700000 },
  { month: 'Oct', spend: 4300000 },
  { month: 'Nov', spend: 4900000 },
  { month: 'Dec', spend: 5200000 },
];

export const quickInsights = [
  'Vendor spend is up by 18.4% compared to last year.',
  'No outstanding balance.',
  'Rating remains excellent (4.5/5).',
];
