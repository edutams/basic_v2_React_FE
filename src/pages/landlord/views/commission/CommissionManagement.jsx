import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { IconLayoutDashboard, IconChartBar, IconSchool } from '@tabler/icons-react';
import PageContainer from '../../../../components/container/PageContainer';
import Breadcrumb from '../../../../layouts/landlord/shared/breadcrumb/Breadcrumb';
import CommissionSummaryCards from './components/CommissionSummaryCards';
import CommissionTable from './components/CommissionTable';
import { SetCommissionModal, ChangeCommissionTypeModal } from './components/CommissionModals';
import CommissionDetailsModal from './components/CommissionDetailsModal';
import { mockCommissionData } from './mockData';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import useAuth from 'src/hooks/useAuth';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/Organization', title: 'Organization' },
  { title: 'Manage Commission' },
];

const CommissionManagement = () => {
  const navigate = useNavigate();
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

  const handleMyCommissionClick = (type) => {
    if (type === 'subscription') {
      navigate('/agent/commission/subscription');
    } else if (type === 'transaction') {
      navigate('/agent/commission/transaction');
    }
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
    if (value === '3') return mockCommissionData.filter((a) => a.commissionType === 'Subscription');
    if (value === '4') return mockCommissionData.filter((a) => a.commissionType === 'Transaction');
    return mockCommissionData;
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

      <Box mt={3}>
        <CommissionSummaryCards />
      </Box>

      <Box
        mt={4}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pb: 0 }}>
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

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              mb: 3,
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
                size="small"
                startIcon={<IconLayoutDashboard size={18} />}
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
        Organization={selectedOrganization}
      />
      <ChangeCommissionTypeModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        Organization={selectedOrganization}
      />
      <CommissionDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        Organization={selectedOrganization}
      />
    </PageContainer>
  );
};

export default CommissionManagement;
