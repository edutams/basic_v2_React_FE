import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  useTheme,
  Tabs,
  Tab,
  alpha,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconWallet,
  IconBuildingBank,
  IconReceipt2,
  IconCoin,
  IconChartPie,
} from '@tabler/icons';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Chart of Accounts',
  },
];

const mockAccounts = [
  { id: '1001', code: '1001', name: 'Cash in Bank', type: 'Asset', balance: 2500000.0, status: 'Active' },
  { id: '1002', code: '1002', name: 'Accounts Receivable', type: 'Asset', balance: 450000.0, status: 'Active' },
  { id: '2001', code: '2001', name: 'Accounts Payable', type: 'Liability', balance: 120000.0, status: 'Active' },
  { id: '2002', code: '2002', name: 'Accrued Expenses', type: 'Liability', balance: 45000.0, status: 'Active' },
  { id: '3001', code: '3001', name: 'Owner Equity', type: 'Equity', balance: 2785000.0, status: 'Active' },
  { id: '4001', code: '4001', name: 'Tuition Fees', type: 'Revenue', balance: 5200000.0, status: 'Active' },
  { id: '4002', code: '4002', name: 'Transport Fees', type: 'Revenue', balance: 800000.0, status: 'Active' },
  { id: '5001', code: '5001', name: 'Staff Salaries', type: 'Expense', balance: 1500000.0, status: 'Active' },
  { id: '5002', code: '5002', name: 'Utilities', type: 'Expense', balance: 125000.0, status: 'Active' },
];

const accountTypes = ['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

const StatCard = ({ title, value, icon: Icon, color, lightColor }) => {
  return (
    <Card elevation={0} sx={{ backgroundColor: lightColor, borderRadius: '16px', border: `1px solid ${alpha(color, 0.2)}`, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(color, 0.2)}` } }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="textSecondary" fontWeight={600} mb={1}>
              {title}
            </Typography>
            <Typography variant="h4" color={color} fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: color, color: '#fff', boxShadow: `0 4px 12px ${alpha(color, 0.4)}` }}>
            <Icon size={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ChartOfAccounts = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const filteredAccounts = mockAccounts.filter(acc => {
    const matchesTab = accountTypes[tabIndex] === 'All' || acc.type === accountTypes[tabIndex];
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || acc.code.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Asset': return 'primary';
      case 'Liability': return 'error';
      case 'Equity': return 'warning';
      case 'Revenue': return 'success';
      case 'Expense': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <PageContainer title="Chart of Accounts" description="Manage Chart of Accounts">
      <Box sx={{ mt: 1 }}>
        <Breadcrumb title="Chart of Accounts" items={BCrumb} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Total Assets" value="₦2,950,000" icon={IconBuildingBank} color="#1E88E5" lightColor={alpha('#1E88E5', 0.1)} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Total Liabilities" value="₦165,000" icon={IconReceipt2} color="#E53935" lightColor={alpha('#E53935', 0.1)} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Total Equity" value="₦2,785,000" icon={IconChartPie} color="#FFB300" lightColor={alpha('#FFB300', 0.1)} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Total Revenue" value="₦6,000,000" icon={IconWallet} color="#43A047" lightColor={alpha('#43A047', 0.1)} />
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', boxShadow: theme.palette.mode === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.05)' }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : '#fbfbfb' }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minWidth: 'auto',
                  px: 3,
                }
              }}
            >
              {accountTypes.map((type, index) => (
                <Tab key={index} label={type} />
              ))}
            </Tabs>

            <Box display="flex" gap={2} alignItems="center">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '8px', minWidth: '250px', backgroundColor: theme.palette.background.paper }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconPlus size={18} />}
                sx={{ borderRadius: '8px', px: 3, py: 1, textTransform: 'none', fontWeight: 600, boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` }}
              >
                Add Account
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Account Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Account Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Balance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
                        {account.code}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {account.name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={account.type}
                          size="small"
                          color={getTypeColor(account.type)}
                          variant="outlined"
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ₦{account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={account.status}
                          size="small"
                          color={getStatusColor(account.status)}
                          sx={{ borderRadius: '6px', fontWeight: 600, height: '24px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" sx={{ mr: 1, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                          <IconEdit size={16} />
                        </IconButton>
                        <IconButton size="small" color="error" sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
                          <IconTrash size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <IconCoin size={48} color={theme.palette.text.disabled} style={{ marginBottom: 16 }} />
                        <Typography variant="h6" color="textSecondary">No Accounts Found</Typography>
                        <Typography variant="body2" color="textSecondary">Try adjusting your search query or tab selection.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default ChartOfAccounts;
