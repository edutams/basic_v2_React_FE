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
  Avatar,
  Tooltip,
} from '@mui/material';
import Link from '@mui/material/Link';
import { IconUserPlus, IconChartBar, IconEye } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonIcon from '@mui/icons-material/Person';
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
    deleteProspectiveTenant,
  
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
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, borderRadius: '6px', fontSize: '11px' }}
    />
  );
};

const getSpaContact = (row) => {
  const spa = row?.administrator_info?.school_spa;
  if (spa)
    return {
      name: `${spa.admin_first_name || ''} ${spa.admin_last_name || ''}`.trim(),
      email: spa.admin_email || '—',
      phone: spa.admin_phone || '—',
      image: spa.admin_image || '',
    };
  return {
    name: `${row?.admin_fname || ''} ${row?.admin_lname || ''}`.trim() || '—',
    email: row?.admin_email || '—',
    phone: row?.admin_phone || '—',
    image: '',
  };
};

const getOwnerContact = (row) => {
  const o = row?.administrator_info?.school_owner;
  if (o)
    return {
      name: `${o.school_owner_first_name || ''} ${o.school_owner_last_name || ''}`.trim(),
      email: o.school_owner_email || '—',
      phone: o.school_owner_phone || '—',
      gender: o.school_owner_gender || '',
      image: o.school_owner_image || '',
    };
  return {
    name: `${row?.owner_fname || ''} ${row?.owner_lname || ''}`.trim() || '—',
    email: row?.owner_email || '—',
    phone: row?.owner_phone || '—',
    gender: '',
    image: '',
  };
};

const getHeadContact = (row) => {
  const h = row?.administrator_info?.school_head;
  if (h)
    return {
      name: `${h.school_head_first_name || ''} ${h.school_head_last_name || ''}`.trim(),
      email: h.school_head_email || '—',
      phone: h.school_head_phone || '—',
      gender: h.school_head_gender || '',
      image: h.school_head_image || '',
    };
  return { name: '—', email: '—', phone: '—', gender: '', image: '' };
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

// ── PersonCard (used inside ReviewModal) ──────────────────────────────────────

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
      {!image && <PersonIcon sx={{ fontSize: 35 }} />}
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
              <PersonIcon sx={{ fontSize: 90, color: '#9e9e9e' }} />
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
                  <strong>Agent:</strong> {agent.org_name || agent.name}
                  {agent.email ? ` · ${agent.email}` : ''}
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

        <Box
          sx={{
            px: 3,
            py: 1.5,
            m: 3,
            borderTop: '1px solid #f0f0f0',
            bgcolor: '#EEF4FF',
            borderLeft: '4px solid #3B82F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            borderRadius: 1,
            gap: 1,
          }}
        >
          {/* LEFT */}
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 700 }}>
              Submitted:
            </Box>{' '}
            <Box component="span" sx={{ color: '#6b7280' }}>
              {formatDate(prospect.created_at)}
            </Box>
          </Typography>

          {/* RIGHT */}
          {prospect.approved_by && prospect.approved_at && (
            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Approved by & Reviewed by:
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
          sx={{ borderRadius: 2, textTransform: 'none' }}
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

// ── Shared table header style ─────────────────────────────────────────────────

const thSx = {
  fontWeight: 700,
  fontSize: '11px',
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  py: 1.5,
};

// ── ProspectRow (used in All Applications + Pending tabs) ─────────────────────

const ProspectRow = ({ row, index, onReview, onDelete, showDelete = false }) => {
  const spa = getSpaContact(row);
  const agent = row.agent;

  const sanitize = (str) =>
    str?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9.-]/g, '');

  const domainHost = agent?.organization_domain
    ? `${sanitize(row.tenant_short_name)}.${sanitize(agent.organization_domain)}`
    : sanitize(row.tenant_short_name) || '';

  const prospectiveUrl = domainHost ? `https://${domainHost}` : null;

  return (
    <TableRow hover>
      <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>{index}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar src={row.logo || row.image} sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}>
            {!row.logo && !row.image && <PersonIcon sx={{ color: '#000', fontSize: 28 }} />}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {row.tenant_name}
            </Typography>
            <Link href={prospectiveUrl} target="_blank" rel="noopener noreferrer" underline="hover">
              <Typography variant="caption" color="text.secondary">
                {prospectiveUrl || 'No domain available'}
              </Typography>
            </Link>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar src={spa.image} sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}>
            {!spa.image && <PersonIcon sx={{ color: '#000', fontSize: 28 }} />}
          </Avatar>
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
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={agent?.organization_logo || agent?.logo}
            sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
          >
            {!agent?.organization_logo && !agent?.logo && <BusinessIcon sx={{ color: '#000' }} />}
          </Avatar>
          <Box>
            <Typography variant="caption" fontWeight={600} display="block">
              {agent?.organization_name || agent?.org_name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {agent?.organization_email || agent?.email || ''}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {formatDate(row.created_at)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {row?.approved_by?.full_name
            ? `${row.approved_by.full_name} · ${formatDate(row.approved_at)}`
            : '—'}
        </Typography>
      </TableCell>
      <TableCell>
        <StatusChip status={row.status} />
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
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
            {row.status?.toLowerCase() === 'approved' ? 'View' : 'Review'}
          </Button>
          {showDelete && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onDelete(row)}
              sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '12px' }}
            >
              Delete
            </Button>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const SchoolDashboard = () => {
  const { impersonateTenant } = useContext(AuthContext);
  const theme = useTheme();

  // ── State ─────────────────────────────────────────────────────────────────
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

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      // console.log('Fetching schools from API...');
      const data = await getSchools();
      // console.log('Schools fetched successfully:', data);
      setSchoolList(
        (data || []).map((t) => {
          // Parse school_divisions if it's a JSON string
          let schoolDivisions = [];
          if (t.school_divisions) {
            if (typeof t.school_divisions === 'string') {
              try {
                schoolDivisions = JSON.parse(t.school_divisions);
              } catch (e) {
                schoolDivisions = [];
              }
            } else if (Array.isArray(t.school_divisions)) {
              schoolDivisions = t.school_divisions;
            }
          }

          return {
            id: t.id,
            institutionName: t.tenant_name,
            schoolUrl: t.domains?.[0]?.domain
              ? `https://${t.domains[0].domain}`
              : '',
            agent: t.organization?.organization_name || '',
            agentEmail: t.organization?.organization_email || '',
            agentImage: t.organization?.organization_logo || '',
            schoolImage: t.image || t.logo || '',
            contactName:
              `${t.administrator_info?.school_spa?.admin_first_name || ''} ${t.administrator_info?.school_spa?.admin_last_name || ''}`.trim(),
            contactEmail: t.administrator_info?.school_spa?.admin_email || t.tenant_email || '',
            contactPhone: t.administrator_info?.school_spa?.admin_phone || '',
            contactImage: t.administrator_info?.school_spa?.admin_image || '',
            status: t.status,
            // school_type 
            schoolType: (() => {
              try {
                const raw = t.school_type;
                if (!raw) return [];
                if (Array.isArray(raw)) return raw.map((v) => String(v).toLowerCase());
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed.map((v) => String(v).toLowerCase()) : [String(parsed).toLowerCase()];
              } catch {
                return t.school_type ? [String(t.school_type).toLowerCase()] : [];
              }
            })(),
            // subscribed = school has been approved (has a domain provisioned) will ingrtate with subscription data later to determine active subscription 
            subscribed: !!(t.domains?.[0]?.domain),
            approvedAt: t.approved_at,
            approvedBy: t.approved_by?.full_name,
            schoolDivisions: Array.isArray(schoolDivisions)
              ? schoolDivisions.map((d) => (typeof d === 'object' ? d.name : d))
              : [],
            raw: t,
          };
        }),
      );
    } catch (error) {
      console.error('❌ Error fetching schools:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error message:', error?.message);
      notify(
        'Failed to fetch schools: ' + (error?.response?.data?.message || error?.message),
        'error',
      );
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

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  const handleDeleteProspect = async (row) => {
    setSchoolToDelete(row);
    setOpenDeleteDialog(true);
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const pendingProspects = prospectList.filter((p) => p.status === 'pending');

  const subscribedSchools = schoolList.filter((s) => s.subscribed);

  const schoolSummary = {
    total: schoolList.length,
    active: schoolList.filter((s) => s.status === 'active').length,
    inactive: schoolList.filter((s) => s.status === 'inactive').length,
    pending: pendingProspects.length,
    // subscribed = school has been approved (has a domain provisioned) will ingrtate with subscription data later to determine active subscription 
    subscriptions: subscribedSchools.length,
    // Primary/Secondary based on school_type field, only for subscribed schools
    primary: subscribedSchools.filter((s) => s.schoolType?.includes('primary')).length,
    secondary: subscribedSchools.filter((s) => s.schoolType?.includes('secondary')).length,
  };

  const filterByName = (arr, key = 'tenant_name') =>
    !nameValue
      ? arr
      : arr.filter((r) =>
          (r[key] || r.institutionName || '').toLowerCase().includes(nameValue.toLowerCase()),
        );

  const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const isActive = String(schoolToDeactivate?.status).toLowerCase() === 'active';

  const planSeries = [40, 15, 35, 10];
  const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];
  const planColors = ['#EC468C', '#7987FF', '#FFA5CB', '#8B48E3'];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Breadcrumb title="School" items={BCrumb} />

      {/* ── Stat Cards ── */}
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

      {/* ── Tabs + Tables ── */}
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
          {/* Search + Add button */}
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
                      <TableCell sx={thSx}>Approved By</TableCell>
                      <TableCell sx={thSx}>Status</TableCell>
                      <TableCell sx={thSx} align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginate(filterByName(prospectList)).length > 0 ? (
                      paginate(filterByName(prospectList)).map((row, i) => (
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
                        count={filterByName(prospectList).length}
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
                    <TableCell sx={thSx}>Approved By</TableCell>
                    <TableCell sx={thSx}>Status</TableCell>
                    <TableCell sx={thSx} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginate(filterByName(pendingProspects)).length > 0 ? (
                    paginate(filterByName(pendingProspects)).map((row, i) => (
                      <ProspectRow
                        key={row.id}
                        row={row}
                        index={page * rowsPerPage + i + 1}
                        onReview={(r) => {
                          setReviewProspect(r);
                          setReviewOpen(true);
                        }}
                        onDelete={handleDeleteProspect}
                        showDelete
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
                      count={filterByName(pendingProspects).length}
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

          {/* ── Tab 2: Approved Schools (from schoolList / fetchSchools) ── */}
          {activeTab === 2 &&
            (loading ? (
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
                      <TableCell sx={thSx}>Approved By</TableCell>
                      <TableCell sx={thSx}>Status</TableCell>
                      <TableCell sx={thSx} align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginate(
                      filterByName(
                        schoolList.filter((s) => s.status === 'approved' || s.status === 'active'),
                        'institutionName',
                      ),
                    ).length > 0 ? (
                      paginate(
                        filterByName(
                          schoolList.filter(
                            (s) => s.status === 'approved' || s.status === 'active',
                          ),
                          'institutionName',
                        ),
                      ).map((row, i) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>
                            {page * rowsPerPage + i + 1}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar
                                src={row.schoolImage}
                                sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                              >
                                {!row.schoolImage && (
                                  <PersonIcon sx={{ color: '#000', fontSize: 28 }} />
                                )}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {row.institutionName}
                                </Typography>
                                <Link
                                  href={row.schoolUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  underline="hover"
                                >
                                  <Typography variant="caption" color="text.secondary">
                                    {row.schoolUrl}
                                  </Typography>
                                </Link>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar
                                src={row.contactImage}
                                sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                              >
                                {!row.contactImage && (
                                  <PersonIcon sx={{ color: '#000', fontSize: 28 }} />
                                )}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" fontWeight={600} display="block">
                                  {row.contactName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  {row.contactEmail}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.contactPhone}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar
                                src={row.agentImage}
                                sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                              >
                                {!row.agentImage && <BusinessIcon sx={{ color: '#000' }} />}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" fontWeight={600} display="block">
                                  {row.agent}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.agentEmail}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {row.approvedBy} at {formatDate(row.approvedAt)}
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
                              <MenuItem
                                onClick={() => {
                                  setSchoolToDeactivate(row);
                                  setOpenDeactivateDialog(true);
                                  handleActionClose();
                                }}
                                // sx={{ color: row.status === 'active' ? 'warning.main' : 'success.main' }}
                              >
                                {row.status === 'active' ? 'Deactivate' : 'Activate'}
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
                        count={
                          filterByName(
                            schoolList.filter(
                              (s) => s.status === 'approved' || s.status === 'active',
                            ),
                            'institutionName',
                          ).length
                        }
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
        </Box>
      </BlankCard>

      {/* ── Modals ── */}
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
        onClose={() => { setOpenDeleteDialog(false); setSchoolToDelete(null); }}
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
