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
} from '@mui/material';
import { IconSchool, IconUserPlus, IconCheck, IconX } from '@tabler/icons-react';
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
import { Link } from 'react-router';
import {
  getSchools,
  updateSchool,
  deleteSchool,
} from '../../context/AgentContext/services/school.service';

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
  const [agentList] = useState([
    { label: 'Crownbirth - Crownbirth Limited', value: 'crownbirth' },
  ]);
  
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

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await getSchools();
      // Map backend data to frontend field names
      const mappedData = data.map((t) => {
        let colors = {};
        try {
          colors = typeof t.color === 'string' ? JSON.parse(t.color) : (t.color || {});
        } catch (e) {
          console.error('Error parsing color for tenant', t.id);
        }

        return {
          id: t.id,
          institutionName: t.tenant_name,
          schoolUrl: t.domains?.[0]?.domain || '',
          agent: t.agent?.name || 'My Agency',
          gateway: t.tenant_gateway?.name || 'Default',
          date: t.created_at,
          socialLink: t.social_link,
          headerColor: colors.headcolor,
          sidebarColor: colors.sidecolor,
          bodyColor: colors.bodycolor,
          status: t.status === 'active' ? 'Active' : 'Inactive',
          raw: t, // Keep raw data for editing
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
    myRegistered: schoolList.length,
    active: schoolList.filter((s) => s.status === 'Active').length,
    inactive: schoolList.filter((s) => s.status === 'Inactive').length,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Breadcrumb title="School" items={BCrumb} />
      
      {/* Summary Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Total', value: schoolSummary.total, bg: 'primary', icon: <IconSchool width={22} color="#fff" /> },
          { label: 'My Registered', value: schoolSummary.myRegistered, bg: 'secondary', icon: <IconUserPlus width={22} color="#fff" /> },
          { label: 'Active', value: schoolSummary.active, bg: 'success', icon: <IconCheck width={22} color="#fff" /> },
          { label: 'Inactive', value: schoolSummary.inactive, bg: 'warning', icon: <IconX width={22} color="#fff" /> },
        ].map((item, index) => (
          <Paper key={index} elevation={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 2, minHeight: 120 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box width={38} height={38} bgcolor={`${item.bg}.main`} display="flex" alignItems="center" justifyContent="center" borderRadius={1}>
                {item.icon}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.label}</Typography>
                <Typography variant="body2" color="text.secondary">Schools</Typography>
              </Box>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 'bold', fontSize: '36px', color: '#28a745' }}>{item.value}</Typography>
          </Paper>
        ))}
      </Box>

      <BlankCard>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">All Schools</Typography>
            <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<IconUserPlus size={18} />}>
              Register New School
            </Button>
          </Stack>

          <Grid container spacing={2} mb={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Search School Name" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
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
                  <TableCell>School Name</TableCell>
                  <TableCell>Url</TableCell>
                  <TableCell>Date Created</TableCell>
                  <TableCell>Colors</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSchools.length > 0 ? (
                  paginatedSchools.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>{row.institutionName}</Typography>
                      </TableCell>
                      <TableCell>{row.schoolUrl || '-'}</TableCell>
                      <TableCell>{dayjs(row.date).format('DD MMM YYYY')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', width: 40, height: 20, borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                          <Box sx={{ flex: 1, bgcolor: row.headerColor || '#eee' }} />
                          <Box sx={{ flex: 1, bgcolor: row.sidebarColor || '#ddd' }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          size="small"
                          color={row.status === 'Active' ? 'success' : 'default'}
                          variant="light"
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
                          <MenuItem onClick={() => { setEditSchoolData(row.raw); setOpenEditModal(true); handleActionClose(); }}>Edit Details</MenuItem>
                          <MenuItem onClick={() => { setSchoolToDeactivate(row); setOpenDeactivateDialog(true); handleActionClose(); }}>Deactivate</MenuItem>
                          <MenuItem onClick={() => { setSchoolToDelete(row); setOpenDeleteDialog(true); handleActionClose(); }} sx={{ color: 'error.main' }}>Delete</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="textSecondary">No schools found.</Typography>
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

      {/* Modals & Dialogs */}
      <ReusableModal open={openRegisterModal || openEditModal} onClose={handleClose} title={openEditModal ? 'Edit School' : 'Register School'} size="large">
        <RegisterSchoolForm actionType={openEditModal ? 'update' : 'create'} selectedAgent={editSchoolData} onSubmit={handleRefresh} onCancel={handleClose} />
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

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default SchoolDashboard;
