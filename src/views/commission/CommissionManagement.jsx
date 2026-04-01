import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  useTheme,
  TablePagination,
} from '@mui/material';
import { IconLayoutDashboard, IconChartBar, IconSchool } from '@tabler/icons-react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import CommissionSummaryCards from './components/CommissionSummaryCards';
import CommissionTable from './components/CommissionTable';
import { SetCommissionModal, ChangeCommissionTypeModal } from './components/CommissionModals';
import { mockCommissionData } from './mockData';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/agent', title: 'Agent' },
  { title: 'Manage Commission' },
];

const CommissionManagement = () => {
  const [value, setValue] = useState('1');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    setPage(0); // Reset to first page when tab changes
  };

  const handleEditCommission = (agent) => {
    setSelectedAgent(agent);
    setEditModalOpen(true);
  };

  const handleChangeType = (agent) => {
    setSelectedAgent(agent);
    setTypeModalOpen(true);
  };

  // Filter data based on tab
  const getFilteredData = () => {
    if (value === '3') return mockCommissionData.filter((a) => a.commissionType === 'Subscription');
    if (value === '4') return mockCommissionData.filter((a) => a.commissionType === 'Transaction');
    return mockCommissionData;
  };

  const getTitle = () => {
    switch (value) {
      case '1':
        return 'Agent Overview';
      case '2':
        return 'Manage Agent Commission';
      case '3':
        return 'Commission by Subscription';
      case '4':
        return 'Commission by Transaction';
      default:
        return 'Agent Overview';
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
            //   textColor="inherit"
            //   indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              label="Overview"
              value="1"
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
              // sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              label="Manage"
              value="2"
              // icon={<IconChartBar size={18} />}
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
              // sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              label="Commission by Subscription"
              value="3"
              // icon={<IconSchool size={18} />}
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
              // sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              label="Commission by Transaction"
              value="4"
              // icon={<IconChartBar size={18} />}
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
              // sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: theme.palette.text.primary }}
            ></Typography>
            {value === '1' && (
              <Select value="2026" size="small" sx={{ borderRadius: '8px', minWidth: 100 }}>
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            )}
          </Box>

          {/* Paginated data */}
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
        agent={selectedAgent}
      />
      <ChangeCommissionTypeModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        agent={selectedAgent}
      />
    </PageContainer>
  );
};

export default CommissionManagement;
