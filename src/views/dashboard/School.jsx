import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  useTheme,
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Grid,
  Stack,
  TextField,
  IconButton,
  Menu,
  Button,
  TableFooter,
  TablePagination,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  IconSchool,
  IconUserPlus,
  IconCheck,
  IconX,
  IconSettings,
  IconUsers,
  IconChartBar,
} from '@tabler/icons-react';
import ReusableModal from '../../components/shared/ReusableModal';
import RegisterSchoolForm from '../../components/add-school/component/RegisterSchool';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ManageTenantDomain from '../../components/add-school/component/ManageSchoolDomain';
import ManageSchoolGateway from '../../components/add-school/component/ManageSchoolGateway';
import ChangeAgent from '../../components/add-school/component/ChangeAgent';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import BlankCard from '../../components/shared/BlankCard';
import ChangeColorScheme from '../../components/add-school/component/ChangeColorScheme';
import SchoolCategorizationManager from './SchoolCategorizationManager';
import { Link } from 'react-router';
import {
  getSchools,
  updateSchool,
  deleteSchool,
} from '../../context/AgentContext/services/school.service';

import agentApi from '../../api/agent';

import DashboardStatCard from '../../components/shared/cards/DashboardStatCard';
import ReusableBarChart from '../../components/shared/charts/ReusableBarChart';
import ReusablePieChart from '../../components/shared/charts/ReusablePieChart';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'School' }];

const SchoolDashboard = () => {
  const theme = useTheme();
  const [schoolList, setSchoolList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [nameValue, setNameValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editSchoolData, setEditSchoolData] = useState(null);
  const [openTenantModal, setOpenTenantModal] = useState(false);
  const [selectedTenantDomain, setSelectedTenantDomain] = useState(null);
  const [openGatewayModal, setOpenGatewayModal] = useState(false);
  const [openAgentModal, setOpenAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentList] = useState([{ label: 'Crownbirth - Crownbirth Limited', value: 'crownbirth' }]);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [schoolToDeactivate, setSchoolToDeactivate] = useState(null);

  const [openClear2FAConfirm, setOpenClear2FAConfirm] = useState(false);
  const [selectedSchoolFor2FA, setSelectedSchoolFor2FA] = useState(null);
  const [openFixImageConfirm, setOpenFixImageConfirm] = useState(false);

  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [openColorSchemeModal, setOpenColorSchemeModal] = useState(false);
  const [selectedSchoolForColor, setSelectedSchoolForColor] = useState(null);

  const [filterClicked, setFilterClicked] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await getSchools();
      // Map backend data to frontend field names
      const mappedData = data.map((t) => {
        let colors = {};
        try {
          colors = typeof t.color === 'string' ? JSON.parse(t.color) : t.color || {};
        } catch (e) {
          console.error('Error parsing color for tenant', t.id);
        }

        // Extract education tiers from schoolCategories
        const eduTiers = t.schoolCategories?.map((cat) => cat.name) || [];

        // Extract school divisions (Primary, Junior, Senior)
        const schoolDivisions = t.school_divisions?.map((div) => div.name) || [];

        return {
          id: t.id,
          institutionName: t.tenant_name,
          schoolUrl: t.domains?.[0]?.domain || '',
          agent: t.agent?.name || 'My Agency',
          agentEmail: t.agent?.email || '',
          agentImage: t.agent?.image || '',
          schoolImage: t.image || t.logo || '',
          gateway: t.tenant_gateway?.name || 'Default',
          date: t.created_at,
          socialLink: t.social_link,
          contactEmail: t.admin_email || '',
          contactPhone: t.admin_phone || t.phone || '',
          headerColor: colors.headcolor,
          sidebarColor: colors.sidecolor,
          bodyColor: colors.bodycolor,
          status: t.status === 'active' ? 'Active' : 'Inactive',
          schoolCategories: eduTiers,
          schoolDivisions: schoolDivisions,

          raw: t,
        };
      });
      setSchoolList(mappedData);
    } catch (err) {
      console.error('Failed to fetch schools', err);
      setSnackbarMessage('Failed to fetch schools');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleActionClick = (event, rowId) => {
    setActionAnchorEl(event.currentTarget);
    setActiveRow(rowId);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActiveRow(null);
  };

  const handleOpen = () => setOpenRegisterModal(true);
  const handleClose = () => {
    setOpenRegisterModal(false);
    setOpenEditModal(false);
    setEditSchoolData(null);
  };

  const handleRefresh = async () => {
    await fetchSchools();
    handleClose();
    setSnackbarMessage('Action completed successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeactivateSchool = async (school) => {
    try {
      await updateSchool(school.id, { status: 'inactive' });
      await fetchSchools();
      setOpenDeactivateDialog(false);
      setSnackbarMessage('School deactivated successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to deactivate school');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleDeleteSchool = async (school) => {
    try {
      await deleteSchool(school.id);
      await fetchSchools();
      setOpenDeleteDialog(false);
      setSnackbarMessage('School deleted successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete school');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleLoginAsAdmin = async (school) => {
    try {
      const response = await agentApi.impersonateTenant(school.id);
      if (response.status === 'success') {
        if (response.redirect_url) {
          window.open(response.redirect_url, '_blank');
        } else if (response.access_token) {
          localStorage.setItem('impersonation_token', response.access_token);
          localStorage.setItem('impersonated_tenant_id', school.id);
          window.open(`https://${school.schoolUrl}/dashboard`, '_blank');
        }
      } else {
        setSnackbarMessage(response.error || 'Failed to login as admin');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Failed to login as admin', err);
      setSnackbarMessage(err.response?.data?.error || 'Failed to login as admin');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    handleActionClose();
  };

  const filteredSchools = schoolList.filter((school) => {
    const matchesName = nameValue
      ? school.institutionName?.toLowerCase().includes(nameValue.toLowerCase())
      : true;

    const matchesDateRange =
      (!fromDate || dayjs(school.date).isAfter(fromDate.subtract(1, 'day'))) &&
      (!toDate || dayjs(school.date).isBefore(toDate.add(1, 'day')));

    return matchesName && matchesDateRange;
  });

  const paginatedSchools = filteredSchools.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const schoolSummary = {
    total: schoolList.length,
    active: schoolList.filter((s) => s.status === 'Active').length,
    inactive: schoolList.filter((s) => s.status === 'Inactive').length,
    subAgents: 0,
    primary: schoolList.filter((s) => s.schoolDivisions?.includes('Primary')).length,
    junior: schoolList.filter((s) => s.schoolDivisions?.includes('Junior')).length,
    senior: schoolList.filter((s) => s.schoolDivisions?.includes('Senior')).length,
  };

  const planSeries = [40, 15, 35, 10];

  const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];

  const planData = [
    { name: 'Freemium', value: 40, color: '#7987FF' },
    { name: 'Basic', value: 15, color: '#FFA5CB' },
    { name: 'Basic +', value: 35, color: '#EC468C' },
    { name: 'Basic ++', value: 10, color: '#8B48E3' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Breadcrumb title="School" items={BCrumb} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* TOTAL SCHOOL */}
        <Paper
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2,
            background: '#FFFFFF',
          }}
        >
          {/* Header */}
          <Box
            mb={3}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.secondary">
              Onboarding
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <IconSchool size={50} color="#1DA1F2" />

            <Box textAlign="right">
              <Typography
                sx={{
                  fontSize: 40,
                  fontWeight: 'bold',
                  color: '#1E3A5F',
                  lineHeight: 1,
                }}
              >
                {schoolSummary.total}
              </Typography>

              <Typography variant="h5" color="text.primary">
                Total School
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ color: '#52932E', fontSize: 15, fontWeight: 'bold' }}>
              Active School
            </Typography>

            <Chip
              label={schoolSummary.active}
              size="small"
              sx={{
                background: '#BEEAA6',
                color: '#0D47A1',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 4,
              }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: '#B02D2D', fontSize: 15, fontWeight: 'bold' }}>
              Inactive School
            </Typography>

            <Chip
              label={schoolSummary.inactive}
              size="small"
              sx={{
                background: '#F96459',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 4,
              }}
            />
          </Box>
        </Paper>

        <Paper
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2,
            background: '#FFFFFF',
          }}
        >
          {/* Header */}
          <Box
            mb={3}
            sx={{
              // p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.secondary">
              Subscriptions
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <IconSchool size={50} color="#1DA1F2" />

            <Box textAlign="right">
              <Typography
                sx={{
                  fontSize: 40,
                  fontWeight: 'bold',
                  color: '#1E3A5F',
                  lineHeight: 1,
                }}
              >
                {schoolSummary.total}
              </Typography>
              <Typography variant="h5" color="text.primary">
                Total School
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ color: '#52932E', fontSize: 15, fontWeight: 'bold' }}>
              Primary School
            </Typography>

            <Chip
              label={schoolSummary.primary}
              size="small"
              sx={{
                background: '#52932E',
                color: '#FFFFFF',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 4,
              }}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: '#52932E', fontSize: 15, fontWeight: 'bold' }}>
              Senior School
            </Typography>

            <Chip
              label={schoolSummary.senior}
              size="small"
              sx={{
                background: '#52932E',
                color: '#FFFFFF',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 4,
              }}
            />
          </Box>
        </Paper>
        <Paper
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2,
            background: '#FFFFFF',
          }}
        >
          {/* Header */}
          <Box
            mb={2}
            sx={{
              // p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.primary">
              Plan Distribution
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                height: 170,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <ReusablePieChart series={planSeries} labels={planLabels} height={180} hideCard />
            </Box>
          </Box>
        </Paper>

        {/* SUB AGENTS */}
        <Paper
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#5C5C5C',
              bgcolor: '#F8F8F8',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#5E5E5E',
              }}
            >
              Login Activities
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Divider />

          {/* Body */}
          <Box sx={{ px: 2, py: 3 }}>
            {[
              { label: 'Teacher:', value: 0 },
              { label: 'SPA', value: 0 },
              { label: 'Student', value: 0 },
              { label: 'Parent', value: 0 },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="h5" color="text.primary">
                  {item.label}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: '#E10600',
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="school dashboard tabs">
          <Tab icon={<IconSchool size={20} />} iconPosition="start" label="Schools List" />
          <Tab
            icon={<IconSettings size={20} />}
            iconPosition="start"
            label="School Configuration"
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <BlankCard>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">All Schools</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                startIcon={<IconUserPlus size={18} />}
              >
                Add New School
              </Button>
            </Stack>

            <Grid container spacing={2} mb={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search School Name"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" fullWidth onClick={fetchSchools} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Refresh'}
                </Button>
              </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S/N</TableCell>
                    <TableCell>School Name</TableCell>
                    {/* <TableCell>Url</TableCell> */}
                    <TableCell>Contact Details</TableCell>
                    <TableCell>Agent In Charge</TableCell>
                    <TableCell>Plan (Population)</TableCell>
                    <TableCell>Color Scheme</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSchools.length > 0 ? (
                    paginatedSchools.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          {/* <Typography variant="subtitle2" fontWeight={600}>
                            {row.institutionName}
                          </Typography> */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img
                              src={row.schoolImage || '/src/assets/images/users/default_avatar.png'}
                              alt={row.institutionName}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />

                            <Box>
                              <Typography variant="subtitle2">{row.institutionName}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {/* <TableCell>{row.schoolUrl || '-'}</TableCell> */}
                        <TableCell>
                          {row.contactEmail || row.contactPhone ? (
                            <>
                              {row.contactEmail && (
                                <Typography variant="body2">{row.contactEmail}</Typography>
                              )}
                              {row.contactPhone && (
                                <Typography variant="caption" display="block" color="textSecondary">
                                  {row.contactPhone}
                                </Typography>
                              )}
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img
                              src={row.agentImage || '/src/assets/images/users/default_avatar.png'}
                              alt={row.agent}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />

                            <Box>
                              <Typography variant="subtitle2">{row.agent || '-'}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {row.agentEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          {row.schoolCategories?.length > 0 ? (
                            <Stack direction="row" spacing={0.5}>
                              {row.schoolCategories.map((cat, idx) => (
                                <Chip key={idx} label={cat} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="column" spacing={0.5}>
                            {row.headerColor && (
                              <Typography variant="caption" color="textSecondary">
                                Header: {row.headerColor}
                              </Typography>
                            )}
                            {row.sidebarColor && (
                              <Typography variant="caption" color="textSecondary">
                                Sidebar: {row.sidebarColor}
                              </Typography>
                            )}
                            {row.bodyColor && (
                              <Typography variant="caption" color="textSecondary">
                                Body: {row.bodyColor}
                              </Typography>
                            )}
                            {!row.headerColor && !row.sidebarColor && !row.bodyColor && (
                              <Typography variant="caption" color="textSecondary">
                                -
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {/* <Chip
                            label={row.status}
                            size="small"
                            color={row.status === 'Active' ? 'success' : 'default'}
                            variant="light"
                          /> */}
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{
                              bgcolor:
                                row.status === 'Active'
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.error.light,
                              color:
                                row.status === 'Active'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.error.main,
                              borderRadius: '8px',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton onClick={(e) => handleActionClick(e, row.id)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={actionAnchorEl}
                            open={Boolean(actionAnchorEl) && activeRow === row.id}
                            onClose={handleActionClose}
                          >
                            <MenuItem
                              onClick={() => {
                                handleLoginAsAdmin(row);
                              }}
                            >
                              Login As Admin
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setEditSchoolData(row.raw);
                                setOpenEditModal(true);
                                handleActionClose();
                              }}
                            >
                              Edit School
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSchoolToDeactivate(row);
                                setOpenDeactivateDialog(true);
                                handleActionClose();
                              }}
                            >
                              Deactivate
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSchoolToDelete(row);
                                setOpenDeleteDialog(true);
                                handleActionClose();
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="textSecondary">
                          No schools found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={filteredSchools.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        </BlankCard>
      )}

      {activeTab === 1 && <SchoolCategorizationManager />}

      {/* Modals & Dialogs */}
      <ReusableModal
        open={openRegisterModal || openEditModal}
        onClose={handleClose}
        title={openEditModal ? 'Edit School' : 'Register School'}
        size="large"
      >
        <RegisterSchoolForm
          actionType={openEditModal ? 'update' : 'create'}
          selectedSchool={editSchoolData}
          onSubmit={handleRefresh}
          onCancel={handleClose}
        />
      </ReusableModal>

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => handleDeleteSchool(schoolToDelete)}
        title="Delete School"
        message={`Are you sure you want to delete ${schoolToDelete?.institutionName}? This action is irreversible.`}
        confirmText="Delete"
        severity="error"
      />

      <ConfirmationDialog
        open={openDeactivateDialog}
        onClose={() => setOpenDeactivateDialog(false)}
        onConfirm={() => handleDeactivateSchool(schoolToDeactivate)}
        title="Deactivate School"
        message={`Are you sure you want to deactivate ${schoolToDeactivate?.institutionName}?`}
        confirmText="Deactivate"
        severity="warning"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default SchoolDashboard;
