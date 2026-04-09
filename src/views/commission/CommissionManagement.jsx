import React, { useState } from 'react';
import { useNavigate } from 'react-router';
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
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import CommissionSummaryCards from './components/CommissionSummaryCards';
import CommissionTable from './components/CommissionTable';
import { SetCommissionModal, ChangeCommissionTypeModal } from './components/CommissionModals';
import CommissionDetailsModal from './components/CommissionDetailsModal';
import { mockCommissionData } from './mockData';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/agent', title: 'Agent' },
  { title: 'Manage Commission' },
];

const CommissionManagement = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('1');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleMyCommissionClick = (type) => {
    if (type === 'subscription') {
      navigate('/commission/subscription');
    } else if (type === 'transaction') {
      navigate('/commission/transaction');
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

  const handleEditCommission = (agent) => {
    setSelectedAgent(agent);
    setEditModalOpen(true);
  };

  const handleChangeType = (agent) => {
    setSelectedAgent(agent);
    setTypeModalOpen(true);
  };

  const handleViewDetails = (agent) => {
    setSelectedAgent(agent);
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
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            {/* Dynamic Title */}
            <Typography variant="h4" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
              {(() => {
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
                startIcon={<IconLayoutDashboard size={18} />}
                onClick={() =>
                  handleMyCommissionClick(value === '3' ? 'subscription' : 'transaction')
                }
                sx={{
                  bgcolor: '#3949ab',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#303f9f' },
                }}
              >
                {value === '3' ? 'My Commission by Subscription' : 'My Commission by Transaction'}
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
        agent={selectedAgent}
      />
      <ChangeCommissionTypeModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        agent={selectedAgent}
      />
      <CommissionDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        agent={selectedAgent}
      />
    </PageContainer>
  );
};

export default CommissionManagement;
