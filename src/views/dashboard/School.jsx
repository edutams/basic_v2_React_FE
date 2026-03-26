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

// import DashboardStatCard from '../../components/shared/cards/DashboardStatCard';
// import ReusableBarChart from '../../components/shared/charts/ReusableBarChart';
import ReusablePieChart from '../../components/shared/charts/ReusablePieChart';
import PlanDistributionModal from '../dashboard/components/PlanDistributionModal';
import LoginActivities from '../dashboard/components/LoginActivities';
import TotalSchoolModal from '../dashboard/components/TotalSchoolModal';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'School' }];

const SchoolDashboard = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
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

  const [openPlanDistributionModal, setOpenPlanDistributionModal] = useState(false);
  const [openLoggedInUsersModal, setOpenLoggedInUsersModal] = useState(false);
  const [openTotalSchoolModal, setOpenTotalSchoolModal] = useState(false);

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
      const mappedData = data.map((t) => {
        let colors = {};
        try {
          if (t.color && typeof t.color === 'string') {
            const parsed = JSON.parse(t.color);
            if (parsed.headcolor && parsed.headcolor !== 'default') {
              colors = parsed;
            }
          }

          if (t.headcolor && t.headcolor !== 'default') {
            colors.headcolor = t.headcolor;
          }
          if (t.sidecolor && t.sidecolor !== 'default') {
            colors.sidecolor = t.sidecolor;
          }
          if (t.bodycolor && t.bodycolor !== 'default') {
            colors.bodycolor = t.bodycolor;
          }
        } catch (e) {
          console.error('Error parsing color for tenant', t.id, e);
        }

        const eduTiers = t.schoolCategories?.map((cat) => cat.name) || [];
        const flatEduTiers = t.school_categories?.map((cat) => cat.name) || [];
        const allEduTiers = eduTiers.length > 0 ? eduTiers : flatEduTiers;

        const schoolDivisions = t.school_divisions?.map((div) => div.name) || [];

        let planSubstitute = t.payModuleType || null;
        let populationSubstitute = null;
        if (t.modular) {
          try {
            const modularArr = typeof t.modular === 'string' ? JSON.parse(t.modular) : t.modular;
            populationSubstitute = modularArr.length;
          } catch (e) {}
        }

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
          schoolCategories: allEduTiers,
          schoolDivisions: schoolDivisions,
          plan: planSubstitute,
          population: populationSubstitute,

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
      let status = school.status == 'active' ? 'inactive' : 'active';
      await updateSchool(school.id, { status: status });
      // await updateSchool(school.id, { status: 'inactive' });
      await fetchSchools();
      setOpenDeactivateDialog(false);
      setSnackbarMessage('School ' + status + ' successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to ' + status + ' school');
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
      // response IS already the data (agentApi returns response.data)
      // console.log('impersonate response:', response);

      if (response.status === 'success' && response.redirect_url) {
        window.open(response.redirect_url, '_blank');
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

  const isActive = String(schoolToDeactivate?.status).trim().toLowerCase() === 'active';

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

  const primaryLevels = ['Creche', 'Nursery', 'Primary'];
  const secondaryLevels = ['Junior Secondary', 'Senior Secondary', 'Vocational', 'Tertiary'];

  const schoolSummary = {
    total: schoolList.length,
    active: schoolList.filter((s) => s.status === 'Active').length,
    inactive: schoolList.filter((s) => s.status === 'Inactive').length,
    subAgents: 0,

    primary: schoolList.filter((s) => s.schoolDivisions?.some((d) => primaryLevels.includes(d)))
      .length,

    secondary: schoolList.filter((s) => s.schoolDivisions?.some((d) => secondaryLevels.includes(d)))
      .length,
  };

  const planSeries = [40, 15, 35, 10];

  const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];

  const planData = [
    { name: 'Freemium', value: 40, color: '#EC468C' },
    { name: 'Basic', value: 15, color: '#7987FF' },
    { name: 'Basic +', value: 35, color: '#FFA5CB' },
    { name: 'Basic ++', value: 10, color: '#8B48E3' },
  ];

  const planColors = planData.map((p) => p.color);

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
        {/* <Paper
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
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
            <IconSchool size={50} color={theme.palette.mode === 'dark' ? '#1DA1F2' : '#1DA1F2'} />

            <Box textAlign="right">
              <Typography
                sx={{
                  fontSize: 40,
                  fontWeight: 'bold',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F',
                  lineHeight: 1,
                }}
              >
                {schoolSummary.total}
              </Typography>

              <Typography variant="h5" color="text.primary">
                Total Schools
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ color: '#52932E', fontSize: 13, fontWeight: 'bold' }}>
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
            <Typography sx={{ color: theme.palette.error.main, fontSize: 13, fontWeight: 'bold' }}>
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
        </Paper> */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total School
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setOpenTotalSchoolModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              background: '#E6F7F1',
              borderRadius: 1,
              px: 3,
              py: 1,
              // width: '50%',
              // maxWidth: 250,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: '#2CA87F',
              }}
            >
              {schoolSummary.total}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="text.primary">
                Active School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{schoolSummary.active}</Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Inactive School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {schoolSummary.inactive}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Subscriptions
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setOpenTotalSchoolModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              background: '#EEF2FF',
              borderRadius: 1,
              px: 3,
              py: 1,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: '#4A3AFF',
              }}
            >
              {schoolSummary.total}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="text.primary">
                Primary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {schoolSummary.primary}
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Secondary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {schoolSummary.secondary}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            // px: 3,
            // py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            // mb={2}
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.primary">
              Login Activities
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setOpenPlanDistributionModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              px: 3,
              // py: 1,
              mt: 1,
            }}
          >
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
                    color: theme.palette.error.main,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* <Paper
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: theme.palette.mode === 'dark' ? '#fff' : '#5C5C5C',
              bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F8F8F8',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#fff' : '#5E5E5E',
              }}
            >
              Login Activities
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setOpenLoggedInUsersModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Divider />

          <Box sx={{ p: 2 }}>
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
                    color: theme.palette.error.main,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper> */}

        <Paper
          sx={{
            // px: 3,
            // py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            // mb={2}
            sx={{
              p: 2,
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
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setOpenPlanDistributionModal(true)}
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
              <ReusablePieChart
                series={planSeries}
                colors={planColors}
                labels={planLabels}
                height={180}
                hideCard
              />
            </Box>
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
                          {row.plan || row.population ? (
                            <Stack direction="column" spacing={0.5}>
                              {row.plan && (
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{ textTransform: 'capitalize' }}
                                >
                                  {row.plan}
                                </Typography>
                              )}
                              {row.population !== null && row.population !== undefined && (
                                <Typography variant="caption" color="textSecondary">
                                  Modules: {row.population}
                                </Typography>
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.headerColor || row.sidebarColor || row.bodyColor ? (
                            <Box
                              sx={{
                                display: 'inline-block',
                                width: 40,
                                height: 30,
                                borderRadius: '5px',
                                overflow: 'hidden',
                              }}
                              title={`Header: ${row.headerColor} | Sidebar: ${row.sidebarColor} | Body: ${row.bodyColor}`}
                            >
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '30%',
                                  backgroundColor: row.headerColor,
                                  borderRadius: 0,
                                }}
                              />
                              <Box sx={{ display: 'flex', height: '70%' }}>
                                <Box
                                  sx={{
                                    width: '50%',
                                    height: '100%',
                                    backgroundColor: row.sidebarColor,
                                    borderRadius: 0,
                                  }}
                                />
                                <Box
                                  sx={{
                                    width: '50%',
                                    height: '100%',
                                    backgroundColor: row.bodyColor,
                                    borderRadius: 0,
                                  }}
                                />
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
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
                            // onClick={() => {
                            //   setEditSchoolData(row.raw);
                            //   setOpenEditModal(true);
                            //   handleActionClose();
                            // }}
                            >
                              Details
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSchoolToDeactivate(row);
                                setOpenDeactivateDialog(true);
                                handleActionClose();
                              }}
                            >
                              {row?.status?.trim().toLowerCase() === 'active'
                                ? 'Deactivate'
                                : 'Activate'}
                            </MenuItem>
                            <MenuItem
                            // onClick={() => {
                            //   setSchoolToDeactivate(row);
                            //   setOpenDeactivateDialog(true);
                            //   handleActionClose();
                            // }}
                            >
                              School
                            </MenuItem>
                            <MenuItem
                            // onClick={() => {
                            //   setSchoolToDeactivate(row);
                            //   setOpenDeactivateDialog(true);
                            //   handleActionClose();
                            // }}
                            >
                              Change
                            </MenuItem>
                            {/* <MenuItem
                              onClick={() => {
                                setSchoolToDelete(row);
                                setOpenDeleteDialog(true);
                                handleActionClose();
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              Delete
                            </MenuItem> */}
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
        title={isActive ? 'Deactivate School' : 'Activate School'}
        message={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${
          schoolToDeactivate?.institutionName
        }?`}
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        severity={isActive ? 'warning' : 'success'}
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

      <PlanDistributionModal
        open={openPlanDistributionModal}
        onClose={() => setOpenPlanDistributionModal(false)}
      />
      <LoginActivities
        open={openLoggedInUsersModal}
        onClose={() => setOpenLoggedInUsersModal(false)}
      />
      <TotalSchoolModal
        open={openTotalSchoolModal}
        onClose={() => setOpenTotalSchoolModal(false)}
      />
    </LocalizationProvider>
  );
};

export default SchoolDashboard;
