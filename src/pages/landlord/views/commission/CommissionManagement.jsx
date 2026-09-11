import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  useTheme,
  TablePagination,
  Button,
  Stack,
} from '@mui/material';
import {
  IconLayoutDashboard,
  IconWallet,
  IconReceipt,
  IconCoins,
  IconPigMoney,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import CommissionTable from './components/CommissionTable';
import { SetCommissionModal, ChangeCommissionTypeModal } from './components/CommissionModals';
import CommissionDetailsModal from './components/CommissionDetailsModal';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import useAuth from 'src/hooks/useAuth';
import StatCard from 'src/components/shared/StatCard';
import { getStats, getOrganizations } from '@/api/landlord/commission/commissionApi';

const formatNaira = (value) =>
  `₦ ${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Backend returns commission_type as lowercase 'subscription'/'transaction'
// — the table/modals display it capitalized.
const mapOrganization = (org) => ({
  id: org.id,
  agentName: org.organization_name,
  email: org.organization_email,
  commissionTypeRaw: org.commission_type,
  commissionType: org.commission_type === 'transaction' ? 'Transaction' : 'Subscription',
  schools: org.schools_count,
  commission: org.commission,
  commissionPercentage: `${org.commission ?? 0}%`,
  status: org.status,
  earnings: formatNaira(org.earnings),
});

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/Organization', title: 'Organization' },
  { title: 'Manage Commission' },
];

const CommissionManagement = () => {
  const { user: currentUser } = useAuth();
  const [value, setValue] = useState('1');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const organizationId = currentUser?.organization?.id || currentUser?.organization_id;

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await getStats({ organizationId });
        if (!cancelled && res.status) setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch commission stats', error);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);

  const fetchOrganizations = async () => {
    setOrganizationsLoading(true);
    try {
      const res = await getOrganizations();
      if (res.status) setOrganizations((res.data || []).map(mapOrganization));
    } catch (error) {
      console.error('Failed to fetch organizations', error);
    } finally {
      setOrganizationsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Volume is a count, not a currency figure — everything else here is a
  // real Naira amount pulled from the organization's own SkoolPay wallet.
  const summaryStats = [
    {
      title: 'Total Transaction Value',
      value: formatNaira(stats?.totalTransactionValue),
      icon: IconWallet,
    },
    {
      title: 'Total Transaction Volume',
      value: (stats?.totalTransactionVolume ?? 0).toLocaleString(),
      icon: IconReceipt,
    },
    { title: 'Total Commission', value: formatNaira(stats?.totalCommission), icon: IconCoins },
    { title: 'My Commission', value: formatNaira(stats?.myCommission), icon: IconPigMoney },
  ];

  const handleMyCommissionClick = (type) => {
    // Opens in a new browser tab instead of navigating away from the
    // Commission Management tab the agent was already on.
    const url = type === 'subscription' ? '/commission/subscription' : '/commission/transaction';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    setPage(0);
  };

  const handleEditCommission = (Organization) => {
    setSelectedOrganization(Organization);
    setEditModalOpen(true);
  };

  const handleChangeType = (Organization) => {
    setSelectedOrganization(Organization);
    setTypeModalOpen(true);
  };

  const handleViewDetails = (Organization) => {
    setSelectedOrganization(Organization);
    setDetailsModalOpen(true);
  };

  const getFilteredData = () => {
    if (value === '3') return organizations.filter((a) => a.commissionTypeRaw === 'subscription');
    if (value === '4') return organizations.filter((a) => a.commissionTypeRaw === 'transaction');
    return organizations;
  };

  const getTitle = () => {
    switch (value) {
      case '1':
        return 'Organization Overview';
      case '2':
        return 'Manage Organization Commission';
      case '3':
        return 'Commission by Subscription';
      case '4':
        return 'Commission by Transaction';
      default:
        return 'Organization Overview';
    }
  };

  return (
    <PageContainer title="Manage Commission" description="Commission management dashboard">
      <Breadcrumb title="Manage Commission" items={BCrumb} />

      <Box sx={{ mb: 1.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {summaryStats.map((stat, index) => (
            <StatCard
              key={index}
              count={stat.value}
              label={stat.title}
              icon={stat.icon}
              colorIndex={index}
              loading={statsLoading}
            />
          ))}
        </Stack>
      </Box>

      <Box
        mt={1.5}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1.5, pb: 0 }}>
          <Tabs
            value={value}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              label="Overview"
              value="1"
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
            />
            <Tab
              label="Manage"
              value="2"
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
            />
            <Tab
              label="Commission by Subscription"
              value="3"
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
            />
            <Tab
              label="Commission by Transaction"
              value="4"
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
            />
            <Tab
              label="My Plan"
              value="5"
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
              sx={{ display: currentUser?.access_level === 1 ? 'none' : 'block' }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              mb: 1.5,
            }}
          >
            {/* Dynamic Title */}
            <Typography variant="h4" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
              {(() => {
                switch (value) {
                  case '1':
                    return 'Organization Overview';
                  case '2':
                    return 'Manage Organization Commission';
                  case '3':
                    return 'Commission by Subscription';
                  case '4':
                    return 'Commission by Transaction';
                  default:
                    return '';
                }
              })()}
            </Typography>

            {value === '1' && (
              <Select value="2026" size="small" sx={{ borderRadius: '8px', minWidth: 100 }}>
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            )}

            {(value === '3' || value === '4') && (
              <Button
                variant="contained"
                size="small"
                startIcon={<IconLayoutDashboard />}
                onClick={() =>
                  handleMyCommissionClick(value === '3' ? 'subscription' : 'transaction')
                }
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {value === '3' ? 'My Commission by Subscription' : 'My Commission by Transaction'}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  {value === '3' ? 'My Subscription' : 'My Transaction'}
                </Box>
              </Button>
            )}
          </Box>

          {/* Paginated Table */}
          {(() => {
            const filteredData = getFilteredData();
            const paginatedData = filteredData.slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage,
            );

            return (
              <>
                <CommissionTable
                  data={paginatedData}
                  activeTab={value}
                  onEditCommission={handleEditCommission}
                  onChangeType={handleChangeType}
                  onViewDetails={handleViewDetails}
                  rowsPerPage={rowsPerPage}
                />
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  component="Box"
                  sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                />
              </>
            );
          })()}
        </Box>
      </Box>

      <SetCommissionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        agent={selectedOrganization}
        onSaved={fetchOrganizations}
      />
      <ChangeCommissionTypeModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        agent={selectedOrganization}
        onSaved={fetchOrganizations}
      />
      <CommissionDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        agent={selectedOrganization}
      />
    </PageContainer>
  );
};

export default CommissionManagement;
