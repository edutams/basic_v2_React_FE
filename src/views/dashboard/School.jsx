import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  Stack,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TableFooter,
  TablePagination,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Avatar,
  Tooltip,
} from '@mui/material';
import { IconSchool, IconUserPlus, IconChartBar, IconEye, IconBuilding } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
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
import SchoolProfileModal from '../../components/shared/SchoolProfileModal';

import { AuthContext } from '../../context/AgentContext/auth';
import {
  getSchools,
  updateSchool,
  deleteSchool,
  getProspectiveTenants,
  approveProspectiveTenant,
  rejectProspectiveTenant,
} from '../../context/AgentContext/services/school.service';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'School' }];

// ── helpers ───────────────────────────────────────────────────────────────────

const statusConfig = {
  active: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  Active: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  inactive: { bg: '#ffe4e6', color: '#e11d48', label: 'Inactive' },
  Inactive: { bg: '#ffe4e6', color: '#e11d48', label: 'Inactive' },
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  approved: { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
  rejected: { bg: '#ffe4e6', color: '#e11d48', label: 'Rejected' },
};

const StatusChip = ({ status }) => {
  const s = statusConfig[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <Chip
      size="small"
      label={s.label}
      sx={{
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 600,
        borderRadius: '6px',
        textTransform: 'capitalize',
        fontSize: '11px',
      }}
    />
  );
};

/** Pull SPA contact from administrator_info or fall back to legacy flat fields */
const getSpaContact = (row) => {
  const spa = row?.administrator_info?.school_spa;
  if (spa) {
    return {
      name: `${spa.admin_first_name || ''} ${spa.admin_last_name || ''}`.trim(),
      email: spa.admin_email || '—',
      phone: spa.admin_phone || '—',
    };
  }
  // legacy fallback
  return {
    name: `${row?.admin_fname || ''} ${row?.admin_lname || ''}`.trim() || '—',
    email: row?.admin_email || '—',
    phone: row?.admin_phone || '—',
  };
};

const getOwnerContact = (row) => {
  const owner = row?.administrator_info?.school_owner;
  if (owner) {
    return {
      name: `${owner.school_owner_first_name || ''} ${owner.school_owner_last_name || ''}`.trim(),
      email: owner.school_owner_email || '—',
      phone: owner.school_owner_phone || '—',
    };
  }
  return {
    name: `${row?.owner_fname || ''} ${row?.owner_lname || ''}`.trim() || '—',
    email: row?.owner_email || '—',
    phone: row?.owner_phone || '—',
  };
};

const getHeadContact = (row) => {
  const head = row?.administrator_info?.school_head;
  if (head) {
    return {
      name: `${head.school_head_first_name || ''} ${head.school_head_last_name || ''}`.trim(),
      email: head.school_head_email || '—',
      phone: head.school_head_phone || '—',
    };
  }
  return { name: '—', email: '—', phone: '—' };
};

// ── Review Modal ──────────────────────────────────────────────────────────────

const PersonCard = ({ title, name, gender, email, phone, image }) => (
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
    }}
  >
    <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Avatar
      src={image}
      alt={name}
      sx={{ width: 52, height: 52, bgcolor: '#e0e0e0', color: '#9e9e9e', fontSize: 22 }}
    >
      {!image && <PersonOutlineIcon sx={{ fontSize: 28 }} />}
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

  const ownerGender = prospect.administrator_info?.school_owner?.school_owner_gender || '';
  const spaGender = prospect.administrator_info?.school_spa?.admin_gender || '';
  const headGender = prospect.administrator_info?.school_head?.school_head_gender || '';
  const spaImage = prospect.administrator_info?.school_spa?.admin_image || '';
  const headImage = prospect.administrator_info?.school_head?.school_head_image || '';
  const ownerImage = prospect.administrator_info?.school_owner?.school_owner_image || '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header bar */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="#000">
          Review Application
        </Typography>
        <StatusChip status={prospect.status} />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* School hero section */}
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
          {/* Logo placeholder */}
          <Box
            sx={{
              width: 90,
              height: 80,
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              bgcolor: '#f9fafb',
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              src={prospect.logo || prospect.image}
              variant="rounded"
              sx={{
                width: 90,
                height: 80,
                borderRadius: 2,
                bgcolor: '#e8eaf6',
                fontSize: 28,
                color: '#3949ab',
              }}
            >
              {prospect.tenant_short_name?.[0] || '🏫'}
            </Avatar>
          </Box>

          {/* School details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.5 }}>
              {prospect.tenant_name}
            </Typography>

            {/* Location + type chips row */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
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

            {/* Address */}
            <Stack direction="row" spacing={0.5} alignItems="flex-start">
              <Typography variant="body2" color="text.secondary">
                <strong>School Address:</strong> {prospect.address || '—'}
                {stateName ? `, ${stateName} State, Nigeria` : ''}
              </Typography>
            </Stack>

            {/* Agent row */}
            {agent && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <BusinessIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                <Typography variant="caption" color="text.secondary">
                  <strong>Agent:</strong> {agent.org_name || agent.name}
                  {agent.email ? ` · ${agent.email}` : ''}
                </Typography>
              </Stack>
            )}

            {/* Submitted */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Submitted:{' '}
              {prospect.created_at
                ? new Date(prospect.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </Typography>
          </Box>
        </Box>

        {/* Person cards */}
        <Box sx={{ px: 3, py: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <PersonCard
            title="School Owner"
            name={owner.name}
            gender={ownerGender}
            email={owner.email}
            phone={owner.phone}
            image={ownerImage}
          />
          <PersonCard
            title="School Head"
            name={head.name}
            gender={headGender}
            email={head.email}
            phone={head.phone}
            image={headImage}
          />
          <PersonCard
            title="School SPA/Admin"
            name={spa.name}
            gender={spaGender}
            email={spa.email}
            phone={spa.phone}
            image={spaImage}
          />
        </Box>

        {/* Rejection reason */}
        {prospect.rejection_reason && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <strong>Rejection reason:</strong> {prospect.rejection_reason}
            </Alert>
          </Box>
        )}

        {/* Reject textarea */}
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

// ── Prospect Table Row ────────────────────────────────────────────────────────

const ProspectRow = ({ row, index, onReview }) => {
  const spa = getSpaContact(row);
  const agent = row.agent;
  return (
    <TableRow hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
      <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>{index}</TableCell>
      <TableCell>
        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
          {row.tenant_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.tenant_short_name}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <PersonOutlineIcon sx={{ fontSize: 16, color: '#9ca3af', mt: '2px' }} />
          <Box>
            <Typography variant="caption" fontWeight={600} display="block">
              {spa.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {spa.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {spa.phone}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <BusinessIcon sx={{ fontSize: 16, color: '#9ca3af', mt: '2px' }} />
          <Box>
            <Typography variant="caption" fontWeight={600} display="block">
              {agent?.org_name || agent?.name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {agent?.email || ''}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </Typography>
      </TableCell>
      <TableCell>
        <StatusChip status={row.status} />
      </TableCell>
      <TableCell align="right">
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconEye size={14} />}
          onClick={() => onReview(row)}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            borderColor: '#3949ab',
            color: '#3949ab',
            '&:hover': { bgcolor: '#3949ab', color: '#fff' },
          }}
        >
          Review
        </Button>
      </TableCell>
    </TableRow>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const SchoolDashboard = () => {
  const { impersonateTenant } = useContext(AuthContext);
  const theme = useTheme();

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

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchools();
      setSchoolList(
        (data || []).map((t) => ({
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
        })),
      );
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
      setProspectList(Array.isArray(data) ? data : []);
    } catch (err) {
      notify(err?.message || 'Failed to fetch applications', 'error');
    } finally {
      setProspectLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
    fetchProspects();
  }, [fetchSchools, fetchProspects]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleActionClick = (e, rowId) => {
    setActionAnchorEl(e.currentTarget);
    setActiveRow(rowId);
  };
  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActiveRow(null);
  };

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
        else {
          localStorage.setItem('isImpersonating', 'true');
          localStorage.setItem('impersonator_id', school.id);
        }
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const pendingProspects = prospectList.filter((p) => p.status === 'pending');
  const primaryLevels = ['Creche', 'Nursery', 'Primary'];
  const secondaryLevels = ['Junior Secondary', 'Senior Secondary', 'Vocational', 'Tertiary'];

  const schoolSummary = {
    total: schoolList.length,
    active: schoolList.filter((s) => s.status === 'active').length,
    inactive: schoolList.filter((s) => s.status === 'inactive').length,
    pending: pendingProspects.length,
    primary: schoolList.filter((s) => s.schoolDivisions?.some((d) => primaryLevels.includes(d)))
      .length,
    secondary: schoolList.filter((s) => s.schoolDivisions?.some((d) => secondaryLevels.includes(d)))
      .length,
  };

  const filter = (arr, key = 'tenant_name') =>
    !nameValue
      ? arr
      : arr.filter((r) =>
          (r[key] || r.institutionName || '').toLowerCase().includes(nameValue.toLowerCase()),
        );

  const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const planSeries = [40, 15, 35, 10];
  const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];
  const planColors = ['#EC468C', '#7987FF', '#FFA5CB', '#8B48E3'];
  const isActive = String(schoolToDeactivate?.status).toLowerCase() === 'active';

  const thSx = {
    fontWeight: 700,
    fontSize: '11px',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    py: 1.5,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Breadcrumb title="School" items={BCrumb} />

      {/* Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
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
              {schoolSummary.total}
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

      {/* Tabs + Tables */}
      <BlankCard>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
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

        <Box sx={{ p: 3 }}>
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
            {activeTab === 0 && (
              <Button
                variant="contained"
                startIcon={<IconUserPlus size={18} />}
                onClick={() => setOpenRegisterModal(true)}
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
          </Stack>

          {/* ── Tab 0: All Applications ── */}
          {activeTab === 0 &&
            (prospectLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={thSx}>#</TableCell>
                      <TableCell sx={thSx}>School</TableCell>
                      <TableCell sx={thSx}>Admin Contact (SPA)</TableCell>
                      <TableCell sx={thSx}>Organisation</TableCell>
                      <TableCell sx={thSx}>Submitted</TableCell>
                      <TableCell sx={thSx}>Status</TableCell>
                      <TableCell sx={thSx} align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginate(filter(prospectList)).length > 0 ? (
                      paginate(filter(prospectList)).map((row, i) => (
                        <ProspectRow
                          key={row.id}
                          row={row}
                          index={page * rowsPerPage + i + 1}
                          onReview={(r) => {
                            setReviewProspect(r);
                            setReviewOpen(true);
                          }}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No applications found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        count={filter(prospectList).length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            ))}

          {/* ── Tab 1: Pending Approvals ── */}
          {activeTab === 1 && (
            <TableContainer
              component={Paper}
              elevation={0}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <Table>
                <TableHead sx={{ bgcolor: '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={thSx}>#</TableCell>
                    <TableCell sx={thSx}>School</TableCell>
                    <TableCell sx={thSx}>Admin Contact (SPA)</TableCell>
                    <TableCell sx={thSx}>Organisation</TableCell>
                    <TableCell sx={thSx}>Submitted</TableCell>
                    <TableCell sx={thSx}>Status</TableCell>
                    <TableCell sx={thSx} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginate(filter(pendingProspects)).length > 0 ? (
                    paginate(filter(pendingProspects)).map((row, i) => (
                      <ProspectRow
                        key={row.id}
                        row={row}
                        index={page * rowsPerPage + i + 1}
                        onReview={(r) => {
                          setReviewProspect(r);
                          setReviewOpen(true);
                        }}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No pending applications.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={filter(pendingProspects).length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, p) => setPage(p)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}

          {/* ── Tab 2: Approved Schools ── */}
          {activeTab === 2 && (
            <TableContainer
              component={Paper}
              elevation={0}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <Table>
                <TableHead sx={{ bgcolor: '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={thSx}>#</TableCell>
                    <TableCell sx={thSx}>School</TableCell>
                    <TableCell sx={thSx}>Admin Contact</TableCell>
                    <TableCell sx={thSx}>Organisation</TableCell>
                    <TableCell sx={thSx}>Status</TableCell>
                    <TableCell sx={thSx} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginate(filter(schoolList, 'institutionName')).length > 0 ? (
                    paginate(filter(schoolList, 'institutionName')).map((row, i) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>
                          {page * rowsPerPage + i + 1}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={row.schoolImage}
                              alt={row.institutionName}
                              sx={{ width: 34, height: 34, fontSize: '13px', bgcolor: '#3949ab' }}
                            >
                              {row.institutionName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{ lineHeight: 1.3 }}
                              >
                                {row.institutionName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {row.schoolUrl}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <PersonOutlineIcon sx={{ fontSize: 16, color: '#9ca3af', mt: '2px' }} />
                            <Box>
                              <Typography variant="caption" display="block">
                                {row.contactEmail}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {row.contactPhone}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <BusinessIcon sx={{ fontSize: 16, color: '#9ca3af', mt: '2px' }} />
                            <Typography variant="caption" fontWeight={600}>
                              {row.agent}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={row.status} />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleActionClick(e, row.id)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={actionAnchorEl}
                            open={Boolean(actionAnchorEl) && activeRow === row.id}
                            onClose={handleActionClose}
                            PaperProps={{ sx: { borderRadius: 2, minWidth: 170 } }}
                          >
                            <MenuItem
                              onClick={() => {
                                setSelectedProfile(row);
                                setProfileModalOpen(true);
                                handleActionClose();
                              }}
                            >
                              View School Profile
                            </MenuItem>
                            <MenuItem onClick={() => handleLoginAsAdmin(row)}>
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
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No approved schools yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={filter(schoolList, 'institutionName').length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, p) => setPage(p)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </Box>
      </BlankCard>

      {/* Modals */}
      <SchoolProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        school={selectedProfile}
      />

      <ReusableModal
        open={openRegisterModal || openEditModal}
        onClose={() => {
          setOpenRegisterModal(false);
          setOpenEditModal(false);
          setEditSchoolData(null);
        }}
        title={openEditModal ? 'Edit School' : 'Register School'}
        size="large"
      >
        <RegisterSchoolForm
          actionType={openEditModal ? 'update' : 'create'}
          selectedSchool={editSchoolData}
          onSubmit={handleRefresh}
          onCancel={() => {
            setOpenRegisterModal(false);
            setOpenEditModal(false);
            setEditSchoolData(null);
          }}
          useProspective={!openEditModal}
        />
      </ReusableModal>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        prospect={reviewProspect}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => handleDelete(schoolToDelete)}
        title="Delete School"
        message={`Are you sure you want to delete ${schoolToDelete?.institutionName}? This is irreversible.`}
        confirmText="Delete"
        severity="error"
      />

      <ConfirmationDialog
        open={openDeactivateDialog}
        onClose={() => setOpenDeactivateDialog(false)}
        onConfirm={() => handleDeactivate(schoolToDeactivate)}
        title={isActive ? 'Deactivate School' : 'Activate School'}
        message={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${
          schoolToDeactivate?.institutionName
        }?`}
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        severity={isActive ? 'warning' : 'success'}
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

      <PlanDistributionModal open={openPlanModal} onClose={() => setOpenPlanModal(false)} />
      <LoginActivities open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
      <TotalSchoolModal
        open={openTotalSchoolModal}
        onClose={() => setOpenTotalSchoolModal(false)}
      />
    </LocalizationProvider>
  );
};

export default SchoolDashboard;
