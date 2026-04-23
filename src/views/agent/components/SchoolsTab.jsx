import React, { useState, useEffect, useCallback } from 'react';
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
import {
  IconGridDots,
  IconPlus,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import ReusableModal from '../../../components/shared/ReusableModal';
import RegisterSchoolForm from '../../../components/add-school/component/RegisterSchool';
import {
  getProspectiveTenants,
  getSchools,
  approveProspectiveTenant,
  rejectProspectiveTenant,
} from '../../../context/AgentContext/services/school.service';
import SchoolProfileModal from '../../../components/shared/SchoolProfileModal';
import FilterSideDrawer from '../../../components/shared/FilterSideDrawer';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

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
  const owner = row?.administrator_info?.school_owner;
  if (owner)
    return {
      name: `${owner.school_owner_first_name || ''} ${owner.school_owner_last_name || ''}`.trim(),
      email: owner.school_owner_email || '—',
      phone: owner.school_owner_phone || '—',
      gender: owner.school_owner_gender || '',
      image: owner.school_owner_image || '',
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
  const head = row?.administrator_info?.school_head;
  if (head)
    return {
      name: `${head.school_head_first_name || ''} ${head.school_head_last_name || ''}`.trim(),
      email: head.school_head_email || '—',
      phone: head.school_head_phone || '—',
      gender: head.school_head_gender || '',
      image: head.school_head_image || '',
    };
  return { name: '—', email: '—', phone: '—', gender: '', image: '' };
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Submitted: {formatDate(prospect.created_at)}
            </Typography>
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

// ── ProspectRow ───────────────────────────────────────────────────────────────

const ProspectRow = ({ row, index, onReview }) => {
  const spa = getSpaContact(row);
  const agent = row.agent;
  return (
    <TableRow hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
      <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>{index}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar src={row.logo || row.image} sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}>
            {!row.logo && !row.image && <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
              {row.tenant_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.tenant_short_name}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar src={spa.image} sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}>
            {!spa.image && <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />}
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
          <Avatar src={agent?.organization_logo} sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}>
            {!agent?.organization_logo && <BusinessIcon sx={{ color: '#000' }} />}
          </Avatar>
          <Box>
            <Typography variant="caption" fontWeight={600} display="block">
              {agent?.organization_name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {agent?.organization_email || ''}
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

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewProspect, setReviewProspect] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

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

  const [feedback, setFeedback] = useState(null);
  const notify = (msg, severity = 'success') => {
    setFeedback({ msg, severity });
    setTimeout(() => setFeedback(null), 3500);
  };

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
  const handleFilterApply = (filterValues) => {
    setActiveFilters(filterValues);
    setPage(0);
  };

  const handleFilterReset = () => {
    setActiveFilters({});
    setPage(0);
  };

  useEffect(() => {
    fetchProspects();
    fetchSchools();
  }, [fetchProspects, fetchSchools]);

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

  const pendingProspects = prospectList.filter((p) => p.status === 'pending');

  const filter = (arr, key = 'tenant_name') => {
    let result = arr;

    // search bar
    if (nameValue) {
      result = result.filter((r) =>
        (r[key] || r.institutionName || '').toLowerCase().includes(nameValue.toLowerCase()),
      );
    }

    // drawer filters
    if (activeFilters.name) {
      result = result.filter((r) =>
        (r[key] || r.institutionName || '')
          .toLowerCase()
          .includes(activeFilters.name.toLowerCase()),
      );
    }
    if (activeFilters.status) {
      result = result.filter((r) => r.status === activeFilters.status);
    }
    if (activeFilters.date_from) {
      result = result.filter((r) => r.created_at && r.created_at >= activeFilters.date_from);
    }
    if (activeFilters.date_to) {
      result = result.filter((r) => r.created_at && r.created_at <= activeFilters.date_to);
    }

    return result;
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const thSx = {
    fontWeight: 700,
    fontSize: '11px',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    py: 1.5,
  };

  const prospectTableHead = (
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
  );

  return (
    <Box>
      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
          {feedback.msg}
        </Alert>
      )}

      {/* Header */}
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

      {/* Tabs */}
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
        {/* Toolbar: Search | Add + Show Filters */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          spacing={2}
          mb={3}
        >
          {/* Left: search */}
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

          {/* Right: Add + Show Filters */}
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

        {/* Tab 0: All Applications */}
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
                {prospectTableHead}
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

        {/* Tab 1: Pending Approvals */}
        {activeTab === 1 &&
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
                {prospectTableHead}
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
          ))}

        {/* Tab 2: Approved Schools */}
        {activeTab === 2 &&
          (schoolLoading ? (
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
                    <TableCell sx={thSx}>Admin Contact</TableCell>
                    <TableCell sx={thSx}>Organisation</TableCell>
                    <TableCell sx={thSx}>Status</TableCell>
                    <TableCell sx={thSx} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginate(filter(schoolList, 'tenant_name')).length > 0 ? (
                    paginate(filter(schoolList, 'tenant_name')).map((row, i) => {
                      const spa = getSpaContact(row);
                      const org = row.organization;
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>
                            {page * rowsPerPage + i + 1}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar
                                src={row.image || row.logo}
                                sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                              >
                                {!row.image && !row.logo && (
                                  <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />
                                )}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {row.tenant_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.domains?.[0]?.domain || ''}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar
                                src={spa.image}
                                sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                              >
                                {!spa.image && (
                                  <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />
                                )}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" fontWeight={600} display="block">
                                  {spa.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
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
                                src={org?.organization_logo}
                                sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                              >
                                {!org?.organization_logo && <BusinessIcon sx={{ color: '#000' }} />}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" fontWeight={600} display="block">
                                  {org?.organization_name || '—'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {org?.organization_email || ''}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={row.status} />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setActiveRow(row);
                              }}
                            >
                              <IconDotsVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                      count={filter(schoolList, 'tenant_name').length}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 170 } }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setProfileModalOpen(true);
          }}
        >
          View School Profile
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Edit Record</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <SchoolProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        school={activeRow}
      />

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        prospect={reviewProspect}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
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
      <FilterSideDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={schoolFilterDefs}
        title="Filter Schools"
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </Box>
  );
};

export default SchoolsTab;
