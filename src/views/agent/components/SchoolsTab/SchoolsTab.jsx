import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  useTheme,
  Stack,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  IconGridDots,
  IconUserPlus,
  IconAdjustmentsHorizontal,
  IconChartBar,
} from '@tabler/icons-react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ReusableModal from '../../../../components/shared/ReusableModal';
import RegisterSchoolForm from '../../../../components/add-school/component/RegisterSchool';
import ConfirmationDialog from '../../../../components/shared/ConfirmationDialog';

import {
  getProspectiveTenants,
  getSchools,
  approveProspectiveTenant,
  rejectProspectiveTenant,
  updateSchool,
} from '../../../../context/AgentContext/services/school.service';
import SchoolProfileModal from '../../../../components/shared/SchoolProfileModal';
import FilterSideDrawer from '../../../../components/shared/FilterSideDrawer';
import ReusablePieChart from '../../../../components/shared/charts/ReusablePieChart';
import PlanDistributionModal from '../../../dashboard/components/PlanDistributionModal';
import LoginActivities from '../../../dashboard/components/LoginActivities';
import TotalSchoolModal from '../../../dashboard/components/TotalSchoolModal';

import {
  getSpaContact,
  getOwnerContact,
  getHeadContact,
  formatDate,
  StatusChip,
} from './schoolTabHelpers';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AllApplicationsTab from './AllApplicationsTab';
import PendingApprovalsTab from './PendingApprovalsTab';
import ApprovedSchoolsTab from './ApprovedSchoolsTab';

// ── PersonCard ────────────────────────────────────────────────────────────────

const PersonCard = ({ title, name, gender, email, phone, image, bgColor }) => (
  <Box
    sx={{
      flex: 1,
      border: '1px solid #e5e7eb',
      borderRadius: 2,
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1.5,
      minWidth: 0,
      bgcolor: bgColor || '#F7F8FA',
    }}
  >
    <Typography variant="subtitle2" fontWeight={700}>
      {title}
    </Typography>
    <Avatar src={image} sx={{ width: 52, height: 52, bgcolor: '#fff', color: '#9e9e9e' }}>
      {!image && <PersonOutlineIcon sx={{ fontSize: 35 }} />}
    </Avatar>
    <Box sx={{ width: '100%' }}>
      {[
        ['Name', name],
        ['Sex', gender],
        ['Email', email],
        ['Phone', phone],
      ].map(([label, val]) => (
        <Box key={label} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
          <Typography variant="caption" fontWeight={700} sx={{ minWidth: 42, color: '#374151' }}>
            {label}:
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {val || '—'}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

// ── ReviewModal ───────────────────────────────────────────────────────────────

const ReviewModal = ({ open, onClose, prospect, onApprove, onReject, loading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    if (!open) {
      setRejectReason('');
      setShowRejectInput(false);
    }
  }, [open]);

  if (!prospect) return null;

  const spa = getSpaContact(prospect);
  const owner = getOwnerContact(prospect);
  const head = getHeadContact(prospect);
  const lga = prospect.state_lga?.lganame || prospect.state_lga?.lga_name || '';
  const stateName = prospect.state_lga?.state?.state_name || '';
  const agent = prospect.agent;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Review Application
        </Typography>
        <StatusChip status={prospect.status} />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* School hero */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: 'flex',
            gap: 3,
            alignItems: 'flex-start',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Avatar
            src={prospect.logo || prospect.image}
            variant="rounded"
            sx={{
              width: 120,
              height: 120,
              borderRadius: 2,
              bgcolor: '#e8eaf6',
              fontSize: 28,
              color: '#3949ab',
              flexShrink: 0,
            }}
          >
            {!prospect.logo && !prospect.image && (
              <PersonOutlineIcon sx={{ fontSize: 90, color: '#9e9e9e' }} />
            )}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
              {prospect.tenant_name}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              {lga && (
                <Typography variant="body2" color="text.secondary">
                  {lga}
                </Typography>
              )}
              {stateName && (
                <Chip
                  label={stateName.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: '#5e35b1',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '10px',
                    height: 20,
                    borderRadius: '4px',
                  }}
                />
              )}
              {prospect.session_term && (
                <Chip
                  label={prospect.session_term}
                  size="small"
                  sx={{
                    bgcolor: '#2e7d32',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '10px',
                    height: 20,
                    borderRadius: '4px',
                  }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              <strong>Address:</strong> {prospect.address || '—'}
              {stateName ? `, ${stateName} State, Nigeria` : ''}
            </Typography>
            {agent && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <BusinessIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                <Typography variant="caption" color="text.secondary">
                  <strong>Agent:</strong> {agent.organization_name || agent.org_name || agent.name}
                  {agent.organization_email || agent.email
                    ? ` · ${agent.organization_email || agent.email}`
                    : ''}
                </Typography>
              </Stack>
            )}
          </Box>
        </Box>

        {/* Person cards */}
        <Box sx={{ px: 3, py: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <PersonCard
            title="School Owner"
            name={owner.name}
            gender={owner.gender}
            email={owner.email}
            phone={owner.phone}
            image={owner.image}
            bgColor="#EEF2FF"
          />
          <PersonCard
            title="School Head"
            name={head.name}
            gender={head.gender}
            email={head.email}
            phone={head.phone}
            image={head.image}
            bgColor="#ECFDF5"
          />
          <PersonCard
            title="School SPA"
            name={spa.name}
            gender={prospect.administrator_info?.school_spa?.admin_gender || ''}
            email={spa.email}
            phone={spa.phone}
            image={spa.image}
            bgColor="#FFF7ED"
          />
        </Box>

        {/* Submitted / Approved-by banner */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            mx: 3,
            mb: 2,
            bgcolor: '#EEF4FF',
            borderLeft: '4px solid #3B82F6',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 700 }}>
              Submitted:
            </Box>{' '}
            <Box component="span" sx={{ color: '#6b7280' }}>
              {formatDate(prospect.created_at)}
            </Box>
          </Typography>
          {prospect.approved_by && prospect.approved_at && (
            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Approved by &amp; Reviewed by:
              </Box>{' '}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {prospect.approved_by?.full_name ||
                  `${prospect.approved_by?.fname || ''} ${prospect.approved_by?.lname || ''}`.trim() ||
                  '—'}
              </Box>{' '}
              <Box component="span" sx={{ color: '#6b7280' }}>
                at {formatDate(prospect.approved_at)}
              </Box>
            </Typography>
          )}
        </Box>

        {prospect.rejection_reason && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <strong>Rejection reason:</strong> {prospect.rejection_reason}
            </Alert>
          </Box>
        )}
        {showRejectInput && (
          <Box sx={{ px: 3, pb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none', minWidth: 80 }}
        >
          Close
        </Button>
        {prospect.status === 'pending' && (
          <>
            {!showRejectInput ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setShowRejectInput(true)}
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Reject
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => onReject(prospect.id, rejectReason)}
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Confirm Reject'}
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => onApprove(prospect.id)}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' },
              }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Approve & Provision'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ── Main SchoolsTab ───────────────────────────────────────────────────────────

const SchoolsTab = ({ onAddSchool, organizationId = null }) => {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [nameValue, setNameValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [prospectList, setProspectList] = useState([]);
  const [schoolList, setSchoolList] = useState([]);
  const [prospectLoading, setProspectLoading] = useState(true);
  const [schoolLoading, setSchoolLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [schoolToDeactivate, setSchoolToDeactivate] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewProspect, setReviewProspect] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSchool, setProfileSchool] = useState(null);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const isActive = schoolToDeactivate
    ? String(schoolToDeactivate.status || '').toLowerCase() === 'active'
    : false;

  // Analytics modals
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openTotalSchoolModal, setOpenTotalSchoolModal] = useState(false);

  const schoolFilterDefs = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    { key: 'name', label: 'School Name', type: 'text', placeholder: 'Filter by name…' },
    { key: 'date_from', label: 'Submitted From', type: 'date' },
    { key: 'date_to', label: 'Submitted To', type: 'date' },
  ];

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchProspects = useCallback(async () => {
    setProspectLoading(true);
    try {
      const data = await getProspectiveTenants();
      const all = Array.isArray(data) ? data : [];
      setProspectList(
        organizationId
          ? all.filter((p) => String(p.organization_id) === String(organizationId))
          : all,
      );
    } catch (err) {
      notify(err?.message || 'Failed to fetch applications', 'error');
    } finally {
      setProspectLoading(false);
    }
  }, [organizationId]);

  const fetchSchools = useCallback(async () => {
    setSchoolLoading(true);
    try {
      const data = await getSchools();
      const all = Array.isArray(data) ? data : [];
      setSchoolList(
        organizationId
          ? all.filter((s) => String(s.organization_id) === String(organizationId))
          : all,
      );
    } catch (err) {
      notify(err?.message || 'Failed to fetch schools', 'error');
    } finally {
      setSchoolLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchProspects();
    fetchSchools();
  }, [fetchProspects, fetchSchools]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilterApply = (v) => {
    setActiveFilters(v);
    setPage(0);
  };
  const handleFilterReset = () => {
    setActiveFilters({});
    setPage(0);
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

  const handleDeactivate = async (school) => {
    if (!school) return;

    try {
      const newStatus =
        school.status === 'active' || school.status === 'Active' ? 'inactive' : 'active';

      await updateSchool(school.id, { status: newStatus });

      notify(`School successfully ${newStatus === 'active' ? 'activated' : 'deactivated'}`);

      await fetchSchools();
      await fetchProspects();
      setOpenDeactivateDialog(false);
      setSchoolToDeactivate(null);
    } catch (err) {
      notify('Failed to update school status', 'error');
    }
  };

  const handleEdit = (school) => {
    setSelectedSchool(school);
    setOpenEditModal(true);
  };
  const handleViewProfile = (school) => {
    setProfileSchool(school);
    setProfileModalOpen(true);
  };

  const handleConfirmDeleteProspect = async () => {
    try {
      await deleteProspectiveTenant(schoolToDelete.id);
      await fetchProspects();
      setOpenDeleteDialog(false);
      setSchoolToDelete(null);
      notify('Application deleted successfully');
    } catch (err) {
      notify(err?.message || 'Failed to delete application', 'error');
    }
  };

  // ── Derived / summary ─────────────────────────────────────────────────────

  const pendingProspects = prospectList.filter((p) => p.status === 'pending');
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const getSchoolType = (s) => {
    const raw = s.raw || s;
    try {
      const t = raw.school_type;
      if (!t) return [];
      if (Array.isArray(t)) return t.map((v) => String(v).toLowerCase());
      const parsed = JSON.parse(t);
      return Array.isArray(parsed)
        ? parsed.map((v) => String(v).toLowerCase())
        : [String(parsed).toLowerCase()];
    } catch {
      return raw.school_type ? [String(raw.school_type).toLowerCase()] : [];
    }
  };

  const subscribedSchools = schoolList.filter((s) => !!(s.raw || s).domains?.[0]?.domain);

  const schoolSummary = {
    total: schoolList.length,
    active: schoolList.filter((s) => (s.raw || s).status === 'active').length,
    inactive: schoolList.filter((s) => (s.raw || s).status === 'inactive').length,
    pending: pendingProspects.length,
    subscriptions: subscribedSchools.length,
    primary: subscribedSchools.filter((s) => getSchoolType(s).includes('primary')).length,
    secondary: subscribedSchools.filter((s) => getSchoolType(s).includes('secondary')).length,
  };

  const planSeries = [40, 15, 35, 10];
  const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];
  const planColors = ['#EC468C', '#7987FF', '#FFA5CB', '#8B48E3'];

  const sharedTabProps = { page, setPage, rowsPerPage, setRowsPerPage, nameValue, activeFilters };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* ── Analytics Cards ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Total Schools */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #f0f0f0',
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Total Schools
              </Typography>
              <Tooltip title="View breakdown">
                <IconButton
                  size="small"
                  onClick={() => setOpenTotalSchoolModal(true)}
                  sx={{ bgcolor: '#5C5C5C', borderRadius: 1, '&:hover': { bgcolor: '#333' } }}
                >
                  <IconChartBar size={18} color="#fff" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                bgcolor: '#E6F7F1',
                borderRadius: 1,
                px: 2,
                py: 0.75,
                display: 'inline-flex',
                mb: 3,
              }}
            >
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#2CA87F' }}>
                {schoolSummary.total}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
                <Typography fontWeight={600}>{schoolSummary.active}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Inactive
                </Typography>
                <Typography fontWeight={600}>{schoolSummary.inactive}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Subscriptions */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #f0f0f0',
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Subscriptions
              </Typography>
              <IconButton
                size="small"
                sx={{ bgcolor: '#5C5C5C', borderRadius: 1, '&:hover': { bgcolor: '#333' } }}
              >
                <IconChartBar size={18} color="#fff" />
              </IconButton>
            </Box>
            <Box
              sx={{
                bgcolor: '#EEF2FF',
                borderRadius: 1,
                px: 2,
                py: 0.75,
                display: 'inline-flex',
                mb: 3,
              }}
            >
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#4A3AFF' }}>
                {schoolSummary.subscriptions}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Primary
                </Typography>
                <Typography fontWeight={600}>{schoolSummary.primary}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Secondary
                </Typography>
                <Typography fontWeight={600}>{schoolSummary.secondary}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Login Activities */}
          <Paper
            sx={{
              borderRadius: 2,
              border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #f0f0f0',
            }}
          >
            <Box
              sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Login Activities
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOpenLoginModal(true)}
                sx={{ bgcolor: '#3d3d3d', borderRadius: 1, '&:hover': { bgcolor: '#111' } }}
              >
                <IconChartBar size={18} color="#fff" />
              </IconButton>
            </Box>
            <Box sx={{ px: 2, pb: 2 }}>
              {[
                ['Teacher', 0],
                ['SPA', 0],
                ['Student', 0],
                ['Parent', 0],
              ].map(([label, val]) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.5,
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    {val}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Plan Distribution */}
          <Paper
            sx={{
              borderRadius: 2,
              border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #f0f0f0',
            }}
          >
            <Box
              sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Plan Distribution
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOpenPlanModal(true)}
                sx={{ bgcolor: '#5C5C5C', borderRadius: 1, '&:hover': { bgcolor: '#333' } }}
              >
                <IconChartBar size={18} color="#fff" />
              </IconButton>
            </Box>
            <Box sx={{ height: 160, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <ReusablePieChart
                series={planSeries}
                colors={planColors}
                labels={planLabels}
                height={170}
                hideCard
              />
            </Box>
          </Paper>
        </Box>

        {/* ── List header ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: '#2ca87f',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <IconGridDots size={16} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              List Of School
            </Typography>
          </Box>
        </Box>

        {/* ── Tabs ── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              setActiveTab(v);
              setPage(0);
              setNameValue('');
            }}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                minHeight: 48,
              },
            }}
          >
            <Tab label="All Applications" />
            <Tab
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>Pending Approvals</span>
                  {pendingProspects.length > 0 && (
                    <Chip
                      size="small"
                      label={pendingProspects.length}
                      sx={{
                        bgcolor: '#fef3c7',
                        color: '#d97706',
                        fontWeight: 700,
                        height: 18,
                        fontSize: '11px',
                      }}
                    />
                  )}
                </Stack>
              }
            />
            <Tab label="Approved Schools" />
          </Tabs>
        </Box>

        <Box sx={{ pt: 3 }}>
          {/* Toolbar */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={2}
            mb={3}
          >
            <TextField
              size="small"
              placeholder="Search by name…"
              value={nameValue}
              onChange={(e) => {
                setNameValue(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Stack direction="row" spacing={1.5} alignItems="center">
              {activeTab === 0 && (
                <Button
                  variant="contained"
                  startIcon={<IconUserPlus size={18} />}
                  onClick={() => setOpenAddModal(true)}
                  sx={{
                    bgcolor: '#3949ab',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    '&:hover': { bgcolor: '#303f9f' },
                  }}
                >
                  Add New School
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<IconAdjustmentsHorizontal size={18} />}
                onClick={() => setFilterDrawerOpen(true)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2.5,
                  borderColor: activeFilterCount > 0 ? '#3949ab' : 'divider',
                  color: activeFilterCount > 0 ? '#3949ab' : 'text.secondary',
                  fontWeight: activeFilterCount > 0 ? 700 : 400,
                  '&:hover': { borderColor: '#3949ab', color: '#fff' },
                }}
              >
                Show Filters
                {activeFilterCount > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 0.8,
                      py: 0.1,
                      bgcolor: '#3949ab',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      lineHeight: 1.6,
                    }}
                  >
                    {activeFilterCount}
                  </Box>
                )}
              </Button>
            </Stack>
          </Stack>

          {/* Tab panels */}
          {activeTab === 0 && (
            <AllApplicationsTab
              {...sharedTabProps}
              prospectList={prospectList}
              prospectLoading={prospectLoading}
              onReview={(row) => {
                setReviewProspect(row);
                setReviewOpen(true);
              }}
            />
          )}
          {activeTab === 1 && (
            <PendingApprovalsTab
              {...sharedTabProps}
              prospectList={prospectList}
              prospectLoading={prospectLoading}
              onReview={(row) => {
                setReviewProspect(row);
                setReviewOpen(true);
              }}
            />
          )}
          {activeTab === 2 && (
            <ApprovedSchoolsTab
              {...sharedTabProps}
              schoolList={schoolList}
              schoolLoading={schoolLoading}
              onViewProfile={handleViewProfile}
              onEdit={handleEdit}
              onDeactivate={(school) => {
                setSchoolToDeactivate(school);
                setOpenDeactivateDialog(true);
              }}
            />
          )}
        </Box>

        {/* ── Modals & overlays ── */}
        <ReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          prospect={reviewProspect}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />

        <SchoolProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          school={profileSchool}
        />

        <ReusableModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          title="Register School"
          size="large"
        >
          <RegisterSchoolForm
            actionType="create"
            onSubmit={() => {
              setOpenAddModal(false);
              fetchProspects();
            }}
            onCancel={() => setOpenAddModal(false)}
            useProspective
          />
        </ReusableModal>

        <ReusableModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          title="Edit School"
          size="large"
        >
          <RegisterSchoolForm
            actionType="update"
            selectedSchool={selectedSchool}
            onSubmit={() => {
              setOpenEditModal(false);
              fetchProspects();
              fetchSchools();
            }}
            onCancel={() => setOpenEditModal(false)}
            useProspective={false}
          />
        </ReusableModal>

        <ConfirmationDialog
          open={openDeleteDialog}
          onClose={() => {
            setOpenDeleteDialog(false);
            setSchoolToDelete(null);
          }}
          onConfirm={handleConfirmDeleteProspect}
          title="Delete Application"
          message={`Are you sure you want to delete the application for "${schoolToDelete?.tenant_name || schoolToDelete?.institutionName}"? This is irreversible.`}
          confirmText="Delete"
          severity="error"
        />

        <ConfirmationDialog
          open={openDeactivateDialog}
          onClose={() => setOpenDeactivateDialog(false)}
          onConfirm={() => handleDeactivate(schoolToDeactivate)}
          title={isActive ? 'Deactivate School' : 'Activate School'}
          message={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${schoolToDeactivate?.institutionName}?`}
          confirmText={isActive ? 'Deactivate' : 'Activate'}
          severity={isActive ? 'warning' : 'success'}
        />

        <FilterSideDrawer
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          filters={schoolFilterDefs}
          title="Filter Schools"
          onApply={handleFilterApply}
          onReset={handleFilterReset}
        />

        <PlanDistributionModal open={openPlanModal} onClose={() => setOpenPlanModal(false)} />
        <LoginActivities open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
        <TotalSchoolModal
          open={openTotalSchoolModal}
          onClose={() => setOpenTotalSchoolModal(false)}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default SchoolsTab;
