import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, useTheme, Grid, Stack, TextField, IconButton, Menu, MenuItem,
  Button, TableFooter, TablePagination, Snackbar, Alert, Chip, CircularProgress,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
} from '@mui/material';
import { IconSchool, IconUserPlus, IconChartBar, IconEye } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ReusableModal from '../../components/shared/ReusableModal';
import RegisterSchoolForm from '../../components/add-school/component/RegisterSchool';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import BlankCard from '../../components/shared/BlankCard';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ReusablePieChart from '../../components/shared/charts/ReusablePieChart';
import PlanDistributionModal from '../dashboard/components/PlanDistributionModal';
import LoginActivities from '../dashboard/components/LoginActivities';
import TotalSchoolModal from '../dashboard/components/TotalSchoolModal';
import SchoolCategorizationManager from './SchoolCategorizationManager';
import SchoolProfileModal from '../../components/shared/SchoolProfileModal';

import { AuthContext } from '../../context/AgentContext/auth';
import {
  getSchools, updateSchool, deleteSchool,
  getProspectiveTenants, createProspectiveTenant,
  approveProspectiveTenant, rejectProspectiveTenant,
} from '../../context/AgentContext/services/school.service';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'School' }];

const statusChip = (status) => {
  const map = {
    Active: { bg: '#dcfce7', color: '#16a34a' },
    Inactive: { bg: '#ffe4e6', color: '#e11d48' },
    active: { bg: '#dcfce7', color: '#16a34a' },
    inactive: { bg: '#ffe4e6', color: '#e11d48' },
    pending: { bg: '#fef3c7', color: '#d97706' },
    approved: { bg: '#dcfce7', color: '#16a34a' },
    reject: { bg: '#ffe4e6', color: '#e11d48' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <Chip size="small" label={status}
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, borderRadius: '6px', textTransform: 'capitalize' }} />
  );
};

// ── Review Modal ─────────────────────────────────────────────────────────────
const ReviewModal = ({ open, onClose, prospect, onApprove, onReject, loading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!prospect) return null;

  const field = (label, value) => (
    <Box mb={1.5}>
      <Typography variant="caption" color="textSecondary" fontWeight={600}>{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Review Application — {prospect.tenant_name}
        <Chip size="small" label={prospect.status}
          sx={{
            ml: 2, textTransform: 'capitalize',
            bgcolor: prospect.status === 'pending' ? '#fef3c7' : prospect.status === 'approved' ? '#dcfce7' : '#ffe4e6',
            color: prospect.status === 'pending' ? '#d97706' : prospect.status === 'approved' ? '#16a34a' : '#e11d48',
            fontWeight: 600
          }} />
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">School Info</Typography>
            {field('School Name', prospect.tenant_name)}
            {field('Short Name', prospect.tenant_short_name)}
            {field('School Email', prospect.tenant_email)}
            {field('Address', prospect.address)}
            {field('State / LGA', prospect.state_lga?.state?.stname
              ? `${prospect.state_lga.state.stname} / ${prospect.state_lga.lganame}`
              : null)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Owner Details</Typography>
            {field('Owner Name', `${prospect.owner_fname} ${prospect.owner_lname}`)}
            {field('Owner Email', prospect.owner_email)}
            {field('Owner Phone', prospect.owner_phone)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Admin Details</Typography>
            {field('Admin Name', `${prospect.admin_fname} ${prospect.admin_lname}`)}
            {field('Admin Email', prospect.admin_email)}
            {field('Admin Phone', prospect.admin_phone)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} mb={1} color="primary">Agent</Typography>
            {field('Agent', prospect.agent?.org_name || prospect.agent?.name)}
            {field('Agent Email', prospect.agent?.email)}
            {field('Session Term', prospect.session_term)}
            {field('Social Link', prospect.social_link)}
          </Grid>
          {prospect.rejection_reason && (
            <Grid item xs={12}>
              <Alert severity="error">Rejection reason: {prospect.rejection_reason}</Alert>
            </Grid>
          )}
          {showRejectInput && (
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Rejection Reason (optional)"
                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">Close</Button>
        {prospect.status === 'pending' && (
          <>
            {!showRejectInput ? (
              <Button variant="outlined" color="error" startIcon={<CancelOutlinedIcon />}
                onClick={() => setShowRejectInput(true)} disabled={loading}>
                Reject
              </Button>
            ) : (
              <Button variant="contained" color="error" startIcon={<CancelOutlinedIcon />}
                onClick={() => onReject(prospect.id, rejectReason)} disabled={loading}>
                {loading ? <CircularProgress size={18} /> : 'Confirm Reject'}
              </Button>
            )}
            <Button variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />}
              onClick={() => onApprove(prospect.id)} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : 'Submit for Approval'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SchoolDashboard = () => {
  const { impersonateTenant } = useContext(AuthContext);
  const theme = useTheme();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const [schoolList, setSchoolList] = useState([]);
  const [prospectList, setProspectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prospectLoading, setProspectLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [nameValue, setNameValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editSchoolData, setEditSchoolData] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [schoolToDeactivate, setSchoolToDeactivate] = useState(null);

  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewProspect, setReviewProspect] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openTotalSchoolModal, setOpenTotalSchoolModal] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchools();
      setSchoolList((data || []).map((t) => ({
        id: t.id,
        institutionName: t.tenant_name,
        schoolUrl: t.domains?.[0]?.domain || '',
        agent: t.agent?.org_name || t.agent?.name || 'My Agency',
        agentEmail: t.agent?.email || '',
        agentImage: t.agent?.image || '',
        schoolImage: t.image || t.logo || '',
        contactEmail: t.admin_email || '',
        contactPhone: t.admin_phone || t.phone || '',
        status: t.status,
        schoolDivisions: t.school_divisions?.map((d) => d.name) || [],
        raw: t,
      })));
    } catch {
      notify('Failed to fetch schools', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProspects = useCallback(async () => {
    setProspectLoading(true);
    try {
      const data = await getProspectiveTenants();
      console.log('[School.jsx] prospective data:', data);
      setProspectList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[School.jsx] fetchProspects error:', err);
      notify(err?.message || 'Failed to fetch applications', 'error');
    } finally {
      setProspectLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
    fetchProspects();
  }, [fetchSchools, fetchProspects]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleActionClick = (e, rowId) => { setActionAnchorEl(e.currentTarget); setActiveRow(rowId); };
  const handleActionClose = () => { setActionAnchorEl(null); setActiveRow(null); };

  const handleRefresh = async () => {
    await fetchSchools();
    await fetchProspects();
    setOpenRegisterModal(false);
    setOpenEditModal(false);
    setEditSchoolData(null);
    notify('Action completed successfully');
  };

  const handleDeactivate = async (school) => {
    try {
      const newStatus = school.status === 'active' ? 'inactive' : 'active';
      await updateSchool(school.id, { status: newStatus });
      await fetchSchools();
      setOpenDeactivateDialog(false);
      notify(`School ${newStatus} successfully`);
    } catch {
      notify('Failed to update school status', 'error');
    }
  };

  const handleDelete = async (school) => {
    try {
      await deleteSchool(school.id);
      await fetchSchools();
      setOpenDeleteDialog(false);
      notify('School deleted successfully');
    } catch {
      notify('Failed to delete school', 'error');
    }
  };

  const handleLoginAsAdmin = async (school) => {
    handleActionClose();
    try {
      const result = await impersonateTenant(school.id);
      if (result.success) {
        if (result.redirect_url) window.open(result.redirect_url, '_blank');
        else { localStorage.setItem('isImpersonating', 'true'); localStorage.setItem('impersonator_id', school.id); }
      } else {
        notify(result.error || 'Failed to login as admin', 'error');
      }
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to login as admin', 'error');
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approveProspectiveTenant(id);
      await fetchProspects();
      await fetchSchools();
      setReviewOpen(false);
      notify('School approved and provisioned successfully');
    } catch (err) {
      notify(err?.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id, reason) => {
    setActionLoading(true);
    try {
      await rejectProspectiveTenant(id, reason);
      await fetchProspects();
      setReviewOpen(false);
      notify('Application rejected');
    } catch {
      notify('Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const pendingProspects = prospectList.filter((p) => p.status === 'pending');
  const approvedSchools = schoolList;

  const filteredAll = prospectList.filter((p) =>
    !nameValue || p.tenant_name?.toLowerCase().includes(nameValue.toLowerCase())
  );
  const filteredSchools = schoolList.filter((s) =>
    !nameValue || s.institutionName?.toLowerCase().includes(nameValue.toLowerCase())
  );
  const filteredPending = pendingProspects.filter((p) =>
    !nameValue || p.tenant_name?.toLowerCase().includes(nameValue.toLowerCase())
  );
  const filteredApproved = approvedSchools.filter((s) =>
    !nameValue || s.institutionName?.toLowerCase().includes(nameValue.toLowerCase())
  );

  const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const primaryLevels = ['Creche', 'Nursery', 'Primary'];
  const secondaryLevels = ['Junior Secondary', 'Senior Secondary', 'Vocational', 'Tertiary'];

  const schoolSummary = {
    total: schoolList.length,
    active: schoolList.filter((s) => s.status === 'active').length,
    inactive: schoolList.filter((s) => s.status === 'inactive').length,
    pending: pendingProspects.length,
    primary: schoolList.filter((s) => s.schoolDivisions?.some((d) => primaryLevels.includes(d))).length,
    secondary: schoolList.filter((s) => s.schoolDivisions?.some((d) => secondaryLevels.includes(d))).length,
  };

  const planSeries = [40, 15, 35, 10];
  const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];
  const planColors = ['#EC468C', '#7987FF', '#FFA5CB', '#8B48E3'];

  const isActive = String(schoolToDeactivate?.status).toLowerCase() === 'active';

  // ── Shared table header cell style ────────────────────────────────────────
  const thSx = { fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Breadcrumb title="School" items={BCrumb} />

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Total School</Typography>
            <Box
              sx={{ width: 30, height: 30, borderRadius: 1, background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => setOpenTotalSchoolModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>
          <Box sx={{ background: '#E6F7F1', borderRadius: 1, px: 3, py: 1, display: 'inline-flex', alignItems: 'center', mb: 4 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2CA87F' }}>{schoolSummary.total}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" color="text.primary">Active School</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{schoolSummary.active}</Typography>
            </Box>
            <Box sx={{ width: '1px', height: 40, background: '#E5E7EB' }} />
            <Box>
              <Typography variant="h6" color="text.primary">Inactive School</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{schoolSummary.inactive}</Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Subscriptions</Typography>
            <Box sx={{ width: 30, height: 30, borderRadius: 1, background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>
          <Box sx={{ background: '#EEF2FF', borderRadius: 1, px: 3, py: 1, display: 'inline-flex', alignItems: 'center', mb: 4 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#4A3AFF' }}>{schoolSummary.total}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" color="text.primary">Primary School</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{schoolSummary.primary}</Typography>
            </Box>
            <Box sx={{ width: '1px', height: 40, background: '#E5E7EB' }} />
            <Box>
              <Typography variant="h6" color="text.primary">Secondary School</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{schoolSummary.secondary}</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" color="text.primary">Login Activities</Typography>
            <Box
              sx={{ bgcolor: '#3d3d3d', p: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#111' } }}
              onClick={() => setOpenLoginModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>
          <Box sx={{ px: 3, mt: 1 }}>
            {[{ label: 'Teacher:', value: 0 }, { label: 'SPA', value: 0 }, { label: 'Student', value: 0 }, { label: 'Parent', value: 0 }].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h5" color="text.primary">{item.label}</Typography>
                <Typography variant="h5" sx={{ color: theme.palette.error.main }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper
          sx={{
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" color="text.primary">Plan Distribution</Typography>
            <Box
              sx={{ width: 30, height: 30, background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => setOpenPlanModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>
          <Box sx={{ height: 170, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <ReusablePieChart series={planSeries} colors={planColors} labels={planLabels} height={180} hideCard />
          </Box>
        </Paper>
      </Box>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <BlankCard>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setPage(0); setNameValue(''); }}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '14px' } }}>
            <Tab label="Application" />
            <Tab label={<Stack direction="row" spacing={1} alignItems="center">
              <span>Pending Approvals</span>
              {pendingProspects.length > 0 && (
                <Chip size="small" label={pendingProspects.length}
                  sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700, height: 20, fontSize: '11px' }} />
              )}
            </Stack>} />
            <Tab label="Approved" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Search + Add button row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
            <TextField size="small" label="Search by name" value={nameValue}
              onChange={(e) => { setNameValue(e.target.value); setPage(0); }}
              sx={{ minWidth: 260 }} />
            {activeTab === 0 && (
              <Button variant="contained" startIcon={<IconUserPlus size={18} />}
                onClick={() => setOpenRegisterModal(true)}
                sx={{ bgcolor: '#3949ab', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#303f9f' } }}>
                Add New School
              </Button>
            )}
          </Stack>

          {/* ── Tab 0: Application — all prospective records ── */}
          {activeTab === 0 && (
            prospectLoading ? (
              <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={thSx}>S/N</TableCell>
                      <TableCell sx={thSx}>School Name</TableCell>
                      <TableCell sx={thSx}>Admin Contact</TableCell>
                      <TableCell sx={thSx}>Agent</TableCell>
                      <TableCell sx={thSx}>Submitted</TableCell>
                      <TableCell sx={thSx}>Status</TableCell>
                      <TableCell sx={thSx} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginate(filteredAll).length > 0 ? paginate(filteredAll).map((row, i) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>{row.tenant_name}</Typography>
                          <Typography variant="caption" color="textSecondary">{row.tenant_short_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block">{row.admin_email}</Typography>
                          <Typography variant="caption" color="textSecondary">{row.admin_phone}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.agent?.org_name || row.agent?.name || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</Typography>
                        </TableCell>
                        <TableCell>{statusChip(row.status)}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" startIcon={<IconEye size={14} />}
                            onClick={() => { setReviewProspect(row); setReviewOpen(true); }}
                            sx={{ textTransform: 'none', borderRadius: '6px' }}>
                            View / Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">No applications found.</Typography>
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination rowsPerPageOptions={[5, 10, 25]} count={filteredAll.length}
                        rowsPerPage={rowsPerPage} page={page}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            )
          )}

          {/* ── Tab 1: Pending Approvals ─────────────────────────────── */}
          {activeTab === 1 && (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={thSx}>S/N</TableCell>
                    <TableCell sx={thSx}>School Name</TableCell>
                    <TableCell sx={thSx}>Admin Contact</TableCell>
                    <TableCell sx={thSx}>Agent</TableCell>
                    <TableCell sx={thSx}>Submitted</TableCell>
                    <TableCell sx={thSx}>Status</TableCell>
                    <TableCell sx={thSx} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginate(filteredPending).length > 0 ? paginate(filteredPending).map((row, i) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700}>{row.tenant_name}</Typography>
                        <Typography variant="caption" color="textSecondary">{row.tenant_short_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">{row.admin_email}</Typography>
                        <Typography variant="caption" color="textSecondary">{row.admin_phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.agent?.org_name || row.agent?.name || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</Typography>
                      </TableCell>
                      <TableCell>{statusChip(row.status)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" startIcon={<IconEye size={14} />}
                          onClick={() => { setReviewProspect(row); setReviewOpen(true); }}
                          sx={{ textTransform: 'none', borderRadius: '6px' }}>
                          View / Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="textSecondary">No pending applications.</Typography>
                    </TableCell></TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination rowsPerPageOptions={[5, 10, 25]} count={filteredPending.length}
                      rowsPerPage={rowsPerPage} page={page}
                      onPageChange={(_, p) => setPage(p)}
                      onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}

          {/* ── Tab 2: Approved ──────────────────────────────────────── */}
          {activeTab === 2 && (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={thSx}>S/N</TableCell>
                    <TableCell sx={thSx}>School Name</TableCell>
                    <TableCell sx={thSx}>Contact</TableCell>
                    <TableCell sx={thSx}>Agent</TableCell>
                    <TableCell sx={thSx}>Status</TableCell>
                    <TableCell sx={thSx} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginate(filteredApproved).length > 0 ? paginate(filteredApproved).map((row, i) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <img src={row.schoolImage || '/src/assets/images/users/default_avatar.png'}
                            alt={row.institutionName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{row.institutionName}</Typography>
                            <Typography variant="caption" color="textSecondary">{row.schoolUrl}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">{row.contactEmail}</Typography>
                        <Typography variant="caption" color="textSecondary">{row.contactPhone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.agent}</Typography>
                      </TableCell>
                      <TableCell>{statusChip(row.status)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleActionClick(e, row.id)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu anchorEl={actionAnchorEl} open={Boolean(actionAnchorEl) && activeRow === row.id} onClose={handleActionClose}
                          PaperProps={{ sx: { borderRadius: '8px', minWidth: 160 } }}>
                          <MenuItem onClick={() => { setSelectedProfile(row); setProfileModalOpen(true); handleActionClose(); }}>View School Profile</MenuItem>
                          <MenuItem onClick={() => handleLoginAsAdmin(row)}>Login As Admin</MenuItem>
                          <MenuItem onClick={() => { setEditSchoolData(row.raw); setOpenEditModal(true); handleActionClose(); }}>Edit School</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography color="textSecondary">No approved schools yet.</Typography>
                    </TableCell></TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination rowsPerPageOptions={[5, 10, 25]} count={filteredApproved.length}
                      rowsPerPage={rowsPerPage} page={page}
                      onPageChange={(_, p) => setPage(p)}
                      onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </Box>
      </BlankCard>

      {/* ── Modals & Dialogs ───────────────────────────────────────────────── */}
      <SchoolProfileModal 
        open={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
        school={selectedProfile} 
      />

      <ReusableModal open={openRegisterModal || openEditModal} onClose={() => { setOpenRegisterModal(false); setOpenEditModal(false); setEditSchoolData(null); }}
        title={openEditModal ? 'Edit School' : 'Register School'} size="large">
        <RegisterSchoolForm
          actionType={openEditModal ? 'update' : 'create'}
          selectedSchool={editSchoolData}
          onSubmit={handleRefresh}
          onCancel={() => { setOpenRegisterModal(false); setOpenEditModal(false); setEditSchoolData(null); }}
          useProspective={!openEditModal}
        />
      </ReusableModal>

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)}
        prospect={reviewProspect} onApprove={handleApprove} onReject={handleReject} loading={actionLoading} />

      <ConfirmationDialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => handleDelete(schoolToDelete)} title="Delete School"
        message={`Are you sure you want to delete ${schoolToDelete?.institutionName}? This is irreversible.`}
        confirmText="Delete" severity="error" />

      <ConfirmationDialog open={openDeactivateDialog} onClose={() => setOpenDeactivateDialog(false)}
        onConfirm={() => handleDeactivate(schoolToDeactivate)}
        title={isActive ? 'Deactivate School' : 'Activate School'}
        message={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${schoolToDeactivate?.institutionName}?`}
        confirmText={isActive ? 'Deactivate' : 'Activate'} severity={isActive ? 'warning' : 'success'} />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PlanDistributionModal open={openPlanModal} onClose={() => setOpenPlanModal(false)} />
      <LoginActivities open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
      <TotalSchoolModal open={openTotalSchoolModal} onClose={() => setOpenTotalSchoolModal(false)} />
    </LocalizationProvider >
  );
};

export default SchoolDashboard;
