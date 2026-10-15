import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';

import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Skeleton,
  Tabs,
  Tab,
  Badge,
  Autocomplete,
  Slide,
} from '@mui/material';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  PersonOutline as PersonOutlineIcon,
  LinkOff as LinkOffIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import {
  IconEdit,
  IconLink,
  IconSquareToggle,
  IconTrash,
  IconWallet,
  IconMessage,
  IconUser,
} from '@tabler/icons-react';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LinkIcon from '@mui/icons-material/Link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import guardianApi from '@/api/tenant/guardians/parentApi';
import { getClassesWithDivisions } from '@/api/tenant/set-up/tenant-setup';
import ParentModal from '@/components/tenant/parents/ParentModal';
import UploadParentModal from '@/components/tenant/parents/UploadParentModal';
import LinkWardModal from '@/components/tenant/parents/LinkWardModal';
import ViewWardsModal from '@/components/tenant/parents/ViewWardsModal';
import ParentOverviewPanel from '@/components/tenant/parents/ParentOverviewPanel';
import SendMessageModal from '@/components/tenant/parents/SendMessageModal';
import StatCard from 'src/components/shared/StatCard';
import { useNavigate } from 'react-router-dom';
import { TenantAuthContext } from '../../../context/TenantContext/auth';

dayjs.extend(relativeTime);

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Parent Management' }];

// Quick-filter tabs — each sets a specific combination of the underlying
// filters. The Status/Guardian Type/Class/Ward dropdowns stay independently
// controlled (so e.g. "Active" + "Mother" + a class can combine); these
// tabs are shortcuts into the same filter state, not a parallel system.
const TABS = [
  { key: 'all', label: 'All Parents', countKey: 'total' },
  { key: 'active', label: 'Active', countKey: 'active' },
  { key: 'inactive', label: 'Inactive', countKey: 'inactive' },
  { key: 'unlinked', label: 'Unlinked', countKey: 'unlinked' },
  { key: 'recent', label: 'Recently Added', countKey: 'recently_added' },
  { key: 'needs_attention', label: 'Needs Attention', countKey: 'needs_attention' },
];

const ParentManagement = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const { impersonateParent } = useContext(TenantAuthContext);

  const [impersonateGuardianConfirmOpen, setImpersonateGuardianConfirmOpen] = useState(false);
  const [guardianToImpersonate, setGuardianToImpersonate] = useState(null);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('');
  const [classId, setClassId] = useState('');
  const [wardFilter, setWardFilter] = useState(null);
  const [wardOptions, setWardOptions] = useState([]);
  const [wardSearchLoading, setWardSearchLoading] = useState(false);

  const [classes, setClasses] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    linked: 0,
    unlinked: 0,
    recently_added: 0,
    needs_attention: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState(new Set());

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [parentModalAction, setParentModalAction] = useState('create');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);

  const [toggleStatusModalOpen, setToggleStatusModalOpen] = useState(false);
  const [parentToToggle, setParentToToggle] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [linkWardModalOpen, setLinkWardModalOpen] = useState(false);
  const [wardParent, setWardParent] = useState(null);

  // view wards modal (read-only quick peek — the detail drawer's Wards tab
  // covers the full view, this is just the fast "how many/who" click from
  // the table without opening the whole drawer)
  const [viewWardsModalOpen, setViewWardsModalOpen] = useState(false);
  const [viewWardsGuardian, setViewWardsGuardian] = useState(null);

  // detail drawer (click a row)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerGuardian, setDrawerGuardian] = useState(null);


  // send message modal — guardians is an array so it covers both the
  // per-row action and the bulk-selected action with the same component
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [sendMessageGuardians, setSendMessageGuardians] = useState([]);

  const handleApplySearch = () => {
    setSearch(searchInput.trim());
    setPage(0);
  };

  const tabFilters = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return { status: 'active' };
      case 'inactive':
        return { status: 'inactive' };
      case 'unlinked':
        return { linked: 'no' };
      case 'recent':
        return { recent_days: 7 };
      case 'needs_attention':
        return { needs_attention: true };
      default:
        return {};
    }
  }, [activeTab]);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await guardianApi.getAll({
        page: page + 1,
        per_page: rowsPerPage,
        search,
        ...(classId && { class_id: classId }),
        ...(statusFilter && { status: statusFilter }),
        ...(relationshipFilter && { relationship: relationshipFilter }),
        ...(wardFilter && { ward_id: wardFilter.id }),
        ...tabFilters,
      });
      setRows(res?.data?.data ?? []);
      setTotal(res?.data?.meta?.total ?? 0);
      setSelectedIds(new Set());
    } catch {
      notify.error('Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, classId, statusFilter, relationshipFilter, wardFilter, tabFilters]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await guardianApi.getStats();
      setStats(
        res?.data?.data ?? {
          total: 0,
          active: 0,
          inactive: 0,
          linked: 0,
          unlinked: 0,
          recently_added: 0,
          needs_attention: 0,
        },
      );
    } catch {
      notify.error('Failed to fetch stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await getClassesWithDivisions();
      const flat = [];
      (data || []).forEach((division) => {
        (division.programmes || []).forEach((programme) => {
          (programme.classes || []).forEach((cls) => {
            flat.push({
              id: cls.id,
              label: `${programme.programme_code} - ${cls.class_code}`,
            });
          });
        });
      });
      setClasses(flat);
    } catch {
      notify.error('Failed to fetch classes');
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Reset to page 1 whenever a filter changes shape, so a filter change
  // never strands the user on a now-empty page.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, classId, statusFilter, relationshipFilter, wardFilter, activeTab]);

  const handleWardSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setWardOptions([]);
      return;
    }
    setWardSearchLoading(true);
    try {
      const res = await guardianApi.searchLearners({ search: query });
      setWardOptions(res?.data?.data ?? []);
    } catch {
      setWardOptions([]);
    } finally {
      setWardSearchLoading(false);
    }
  }, []);

  const confirmImpersonateGuardian = (row) => {
    setGuardianToImpersonate(row);
    setImpersonateGuardianConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmedImpersonateGuardian = async () => {
    if (!guardianToImpersonate) return;

    const result = await impersonateParent(guardianToImpersonate?.user?.id);
    if (result.success) {
      notify.success(
        `Now logged in as ${guardianToImpersonate.user?.fname} ${guardianToImpersonate.user?.lname}`,
      );
      navigate('/dashboard');
    } else {
      notify.error(result.error);
    }
    setImpersonateGuardianConfirmOpen(false);
    setGuardianToImpersonate(null);
  };

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenAdd = () => {
    setSelectedRow(null);
    setParentModalAction('create');
    setParentModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setSelectedRow(row);
    setParentModalAction('update');
    setParentModalOpen(true);
    handleMenuClose();
    setDrawerOpen(false);
  };

  const handleOpenDelete = (row) => {
    setParentToDelete(row);
    setDeleteModalOpen(true);
    handleMenuClose();
    setDrawerOpen(false);
  };

  const handleOpenLinkWard = (row) => {
    setWardParent(row);
    setLinkWardModalOpen(true);
    handleMenuClose();
  };

  const handleToggleStatus = (row) => {
    handleMenuClose();
    setParentToToggle(row);
    setToggleStatusModalOpen(true);
  };

  const isGuardianActive = (row) => (row?.user?.status ?? 'active') === 'active';

  const handleConfirmToggle = async () => {
    try {
      await guardianApi.toggleStatus(parentToToggle.user_id);
      notify.success(
        `Parent account ${isGuardianActive(parentToToggle) ? 'deactivated' : 'activated'} successfully`,
      );
      setToggleStatusModalOpen(false);
      setParentToToggle(null);
      setDrawerOpen(false);
      fetchParents();
      fetchStats();
    } catch {
      notify.error('Failed to update parent status');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await guardianApi.remove(parentToDelete.user_id);
      notify.success('Parent deleted successfully');
      setDeleteModalOpen(false);
      setParentToDelete(null);
      setDrawerOpen(false);
      fetchParents();
      fetchStats();
    } catch {
      notify.error('Failed to delete parent');
    }
  };

  const handleParentUpdate = () => {
    fetchParents();
    fetchStats();
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await guardianApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'parent_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Template downloaded');
    } catch {
      notify.error('Failed to download template');
    }
  };

  const handleUploadTemplate = async (file) => {
    const res = await guardianApi.uploadTemplate(file);
    let message = res?.data?.message || 'Upload complete';
    const warnings = res?.data?.data?.warnings || [];
    if (warnings.length) {
      message += `\n\n${warnings.join('\n')}`;
    }
    fetchParents();
    fetchStats();
    return { message, hasWarnings: warnings.length > 0 };
  };

  const hasFilters =
    search !== '' || classId !== '' || statusFilter !== '' || relationshipFilter !== '' || !!wardFilter;

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setClassId('');
    setStatusFilter('');
    setRelationshipFilter('');
    setWardFilter(null);
    setActiveTab('all');
    setPage(0);
  };

  const relationshipLabel = (rel) => {
    if (!rel) return '—';
    return rel.charAt(0).toUpperCase() + rel.slice(1);
  };

  const statusColor = (status) => (status === 'active' ? 'success' : 'default');

  // ─── Row selection (bulk actions) ───────────────────────────────────────
  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? new Set(rows.map((r) => r.user_id)) : new Set());
  };

  // Checking the checkbox both toggles bulk-selection AND opens the
  // overview panel for that row — per design, either clicking the row or
  // its checkbox should surface the panel.
  const handleSelectRow = (row) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.user_id)) {
        next.delete(row.user_id);
      } else {
        next.add(row.user_id);
      }
      return next;
    });
    setDrawerGuardian(row);
    setDrawerOpen(true);
  };

  const selectedRows = rows.filter((r) => selectedIds.has(r.user_id));

  const handleBulkSendMessage = () => {
    setSendMessageGuardians(selectedRows);
    setSendMessageOpen(true);
  };

  const [bulkDeactivateConfirmOpen, setBulkDeactivateConfirmOpen] = useState(false);
  const toDeactivateCount = selectedRows.filter(isGuardianActive).length;

  const handleBulkDeactivate = async () => {
    const toDeactivate = selectedRows.filter(isGuardianActive);
    if (toDeactivate.length === 0) {
      notify.error('All selected parents are already inactive');
      setBulkDeactivateConfirmOpen(false);
      return;
    }
    try {
      await Promise.all(toDeactivate.map((r) => guardianApi.toggleStatus(r.user_id)));
      notify.success(`${toDeactivate.length} parent account(s) deactivated`);
      setBulkDeactivateConfirmOpen(false);
      fetchParents();
      fetchStats();
    } catch {
      notify.error('Failed to deactivate one or more selected parents');
    }
  };

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map((r) => guardianApi.remove(r.user_id)));
      notify.success(`${selectedRows.length} parent(s) deleted`);
      setBulkDeleteConfirmOpen(false);
      fetchParents();
      fetchStats();
    } catch {
      notify.error('Failed to delete one or more selected parents');
    }
  };

  const [bulkLinkWardOpen, setBulkLinkWardOpen] = useState(false);

  return (
    <PageContainer title="Parent Management" description="Manage parents and guardians">
      <Breadcrumb title="Parent Management" items={BCrumb} />

      {/* ── Stat Cards ── */}
      <Box sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard
            count={stats.total}
            label="Total Parents"
            icon={FamilyRestroomIcon}
            colorIndex={0}
            loading={statsLoading}
            subtitle="All registered parents/guardians"
            tooltip="All registered parents/guardians."
          />
          <StatCard
            count={stats.active}
            label="Active Parents"
            icon={PeopleIcon}
            colorIndex={1}
            loading={statsLoading}
            subtitle="Parents with active access"
            tooltip="Parents with active portal access."
          />
          <StatCard
            count={stats.inactive}
            label="Inactive Parents"
            icon={AccessTimeIcon}
            colorIndex={3}
            loading={statsLoading}
            subtitle="Not yet activated"
            tooltip="Parents whose access has been deactivated."
          />
          <StatCard
            count={stats.linked}
            label="Parents Linked"
            icon={LinkIcon}
            colorIndex={2}
            loading={statsLoading}
            subtitle="Connected to at least one ward"
            tooltip="Connected to at least one ward."
          />
          <StatCard
            count={stats.unlinked}
            label="Unlinked Parents"
            icon={LinkOffIcon}
            colorIndex={4}
            loading={statsLoading}
            subtitle="No ward linked"
            tooltip="No ward linked yet."
          />
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems="flex-start">
      <ParentCard
        sx={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
          '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
        }}
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="h5">Parents & Guardians</Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
              <Button variant="contained" size="small" sx={{ width: { xs: '100%', sm: 'auto' } }} color="primary" onClick={handleOpenAdd}>
                Add Single Parent
              </Button>
              <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Download Template
              </Button>
              <Button variant="contained" size="small" startIcon={<UploadIcon />} onClick={() => setUploadModalOpen(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Upload Template
              </Button>
            </Box>
          </Box>
        }
      >
        {/* ── tabs ── */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.key}
              value={t.key}
              label={
                t.key === 'needs_attention' ? (
                  <Badge badgeContent={stats[t.countKey] ?? 0} color="error" sx={{ pr: 1 }}>
                    {t.label}
                  </Badge>
                ) : (
                  `${t.label} (${stats[t.countKey] ?? 0})`
                )
              }
            />
          ))}
        </Tabs>

        {/* ── filters ── */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, phone, email or child's name..."
            value={searchInput}
            size="small"
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            sx={{ width: { xs: '100%', sm: 300, md: 320 } }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Guardian Type</InputLabel>
            <Select label="Guardian Type" value={relationshipFilter} onChange={(e) => setRelationshipFilter(e.target.value)}>
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="father">Father</MenuItem>
              <MenuItem value="mother">Mother</MenuItem>
              <MenuItem value="guardian">Guardian</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Class</InputLabel>
            <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            size="small"
            sx={{ minWidth: 200 }}
            options={wardOptions}
            loading={wardSearchLoading}
            value={wardFilter}
            onChange={(_, value) => setWardFilter(value)}
            onInputChange={(_, value) => handleWardSearch(value)}
            getOptionLabel={(o) => o.name || ''}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => <TextField {...params} label="Ward" placeholder="Search a ward..." />}
          />

          {hasFilters && (
            <Button variant="contained" color="primary" size="small" onClick={resetFilters} sx={{ height: 40 }}>
              Reset
            </Button>
          )}
        </Box>

        {/* ── bulk action bar ── */}
        {selectedIds.size > 0 && (
          <Alert
            severity="info"
            sx={{ mb: 1.5 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" startIcon={<IconMessage size={16} />} onClick={handleBulkSendMessage}>
                  Send Message
                </Button>
                <Button variant="contained" size="small" startIcon={<IconLink size={16} />} onClick={() => setBulkLinkWardOpen(true)}>
                  Link Ward
                </Button>
                <Button variant="contained" size="small" startIcon={<IconSquareToggle size={16} />} onClick={() => setBulkDeactivateConfirmOpen(true)}>
                  Deactivate
                </Button>
                <Button variant="contained" size="small" color="error" startIcon={<IconTrash size={16} />} onClick={() => setBulkDeleteConfirmOpen(true)}>
                  Delete
                </Button>
              </Stack>
            }
          >
            {selectedIds.size} selected
          </Alert>
        )}

        <Box>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      indeterminate={selectedIds.size > 0 && selectedIds.size < rows.length}
                      checked={rows.length > 0 && selectedIds.size === rows.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>Parent / Guardian</TableCell>
                  <TableCell>Contact Information</TableCell>
                  <TableCell align="center">Wards</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="rounded" width={18} height={18} /></TableCell>
                      <TableCell><Skeleton variant="text" width={20} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={36} height={36} />
                          <Skeleton variant="text" width={140} height={20} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={90} height={16} />
                      </TableCell>
                      <TableCell align="center"><Skeleton variant="rounded" width={50} height={22} sx={{ borderRadius: '12px', mx: 'auto' }} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px' }} /></TableCell>
                      <TableCell><Skeleton variant="text" width={90} /></TableCell>
                      <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                ) : rows.length > 0 ? (
                  rows.map((row, index) => {
                    const isHighlighted =
                      selectedIds.has(row.user_id) || (drawerOpen && drawerGuardian?.user_id === row.user_id);

                    return (
                    <TableRow
                      key={row.user_id}
                      hover
                      selected={isHighlighted}
                      onClick={() => {
                        setDrawerGuardian(row);
                        setDrawerOpen(true);
                        setSelectedIds(new Set([row.user_id]));
                      }}
                      sx={{
                        cursor: 'pointer',
                        borderLeft: '3px solid transparent',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(89, 49, 150, 0.14)',
                          borderLeft: '3px solid #593196',
                        },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(89, 49, 150, 0.2)' },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selectedIds.has(row.user_id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleSelectRow(row)}
                        />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={row.user?.avatar || row.user?.image || ''} alt={row.user?.fname} sx={{ width: 36, height: 36 }}>
                            <PersonOutlineIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {row.user ? `${row.title ? row.title + ' ' : ''}${row.user.fname} ${row.user.lname}` : '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {relationshipLabel(row.relationship)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{row.user?.phone || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.user?.email || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                        <Box
                          sx={{
                            bgcolor: row.wards_count > 0 ? '#F0F9FF' : '#FEF3C7',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            justifyContent: 'center',
                          }}
                        >
                          {row.wards_count > 0 ? (
                            <PeopleIcon sx={{ fontSize: 15, color: '#2563EB' }} />
                          ) : (
                            <WarningAmberIcon sx={{ fontSize: 15, color: '#B45309' }} />
                          )}
                          <Typography variant="subtitle2">
                            <Link
                              sx={{ cursor: 'pointer' }}
                              onClick={() => {
                                setViewWardsGuardian(row);
                                setViewWardsModalOpen(true);
                              }}
                            >
                              {row.wards_count ?? 0} linked
                            </Link>
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.user?.status ?? 'active'}
                          color={statusColor(row.user?.status)}
                          size="small"
                          sx={{
                            bgcolor: isGuardianActive(row) ? (theme) => theme.palette.success.light : (theme) => theme.palette.error.light,
                            color: isGuardianActive(row) ? (theme) => theme.palette.success.main : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.user?.last_active_at ? dayjs(row.user.last_active_at).fromNow() : 'Never'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVertIcon />
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedRow?.user_id === row.user_id} onClose={handleMenuClose}>
                          <MenuItem onClick={() => confirmImpersonateGuardian(row)}>
                            <IconUser size={18} style={{ marginRight: 8 }} />
                            Login As Parent
                          </MenuItem>
                          <MenuItem onClick={() => { setSendMessageGuardians([row]); setSendMessageOpen(true); handleMenuClose(); }}>
                            <IconMessage size={18} style={{ marginRight: 8 }} />
                            Send Message
                          </MenuItem>
                          <MenuItem onClick={() => { setViewWardsGuardian(row); setViewWardsModalOpen(true); handleMenuClose(); }}>
                            <IconWallet size={18} style={{ marginRight: 8 }} />
                            View Wallet & Transactions
                          </MenuItem>
                          <MenuItem onClick={() => handleOpenEdit(row)}>
                            <IconEdit size={18} style={{ marginRight: 8 }} />
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleOpenLinkWard(row)}>
                            <IconLink size={18} style={{ marginRight: 8 }} />
                            Link Ward
                          </MenuItem>
                          <MenuItem onClick={() => handleToggleStatus(row)}>
                            <IconSquareToggle size={18} style={{ marginRight: 8 }} />
                            {isGuardianActive(row) ? 'Deactivate' : 'Activate'}
                          </MenuItem>
                          <MenuItem onClick={() => handleOpenDelete(row)} sx={{ color: 'error.main' }}>
                            <IconTrash size={18} style={{ marginRight: 8 }} />
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Alert severity="info" sx={{ mb: 3, justifyContent: 'center', textAlign: 'center', '& .MuiAlert-icon': { mr: 1.5 } }}>
                        {hasFilters ? 'No parents match the current search.' : 'No parents found. Add a parent to get started.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        </Box>
      </ParentCard>

      <Slide direction="left" in={drawerOpen} mountOnEnter unmountOnExit>
        <Box sx={{ width: { xs: '100%', lg: 420 }, flexShrink: 0 }}>
          <ParentOverviewPanel
            guardian={drawerGuardian}
            onClose={() => setDrawerOpen(false)}
            onEdit={handleOpenEdit}
            onLinkWard={handleOpenLinkWard}
            onToggleStatus={handleToggleStatus}
            onDelete={handleOpenDelete}
            onImpersonate={confirmImpersonateGuardian}
            onSendMessage={(g) => {
              setSendMessageGuardians([g]);
              setSendMessageOpen(true);
            }}
          />
        </Box>
      </Slide>
      </Stack>

      <ParentModal
        open={parentModalOpen}
        onClose={() => setParentModalOpen(false)}
        actionType={parentModalAction}
        selectedParent={selectedRow}
        onParentUpdate={handleParentUpdate}
      />

      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Parent</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{parentToDelete?.user ? `${parentToDelete.user.fname} ${parentToDelete.user.lname}` : 'this parent'}</strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" color="error" onClick={handleConfirmDelete} autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkDeleteConfirmOpen} onClose={() => setBulkDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Selected Parents</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedRows.length}</strong> selected parent(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setBulkDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" color="error" onClick={handleBulkDelete} autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={toggleStatusModalOpen} onClose={() => setToggleStatusModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{isGuardianActive(parentToToggle) ? 'Deactivate Parent Account' : 'Activate Parent Account'}</DialogTitle>
        <DialogContent>
          <Typography>
            This will <strong>{isGuardianActive(parentToToggle) ? 'revoke login access from' : 'restore login access for'}</strong>{' '}
            <strong>{parentToToggle?.user ? `${parentToToggle.user.fname} ${parentToToggle.user.lname}` : 'this parent'}</strong>
            {isGuardianActive(parentToToggle) ? ' — they will no longer be able to log in' : ', letting them log in again'}. It does not change any other parent record details.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setToggleStatusModalOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" color={isGuardianActive(parentToToggle) ? 'error' : 'success'} onClick={handleConfirmToggle} autoFocus>
            {isGuardianActive(parentToToggle) ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkDeactivateConfirmOpen} onClose={() => setBulkDeactivateConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Deactivate Selected Parents</DialogTitle>
        <DialogContent>
          <Typography>
            This will revoke login access from <strong>{toDeactivateCount}</strong> of the <strong>{selectedRows.length}</strong> selected
            parent(s) (already-inactive ones are skipped). It does not delete any records or unlink any wards.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setBulkDeactivateConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" color="error" onClick={handleBulkDeactivate} autoFocus>Deactivate</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={impersonateGuardianConfirmOpen}
        onClose={() => { setImpersonateGuardianConfirmOpen(false); setGuardianToImpersonate(null); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Login as Parent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to login as <strong>{guardianToImpersonate?.user?.fname} {guardianToImpersonate?.user?.lname}</strong>? You can return to your account at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => { setImpersonateGuardianConfirmOpen(false); setGuardianToImpersonate(null); }}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleConfirmedImpersonateGuardian} sx={{ bgcolor: '#593196', '&:hover': { bgcolor: '#4a2880' }, color: '#fff' }}>Yes, Login As</Button>
        </DialogActions>
      </Dialog>

      <UploadParentModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleUploadTemplate} />

      <LinkWardModal
        open={linkWardModalOpen}
        onClose={() => setLinkWardModalOpen(false)}
        parent={wardParent}
        onSaved={() => { fetchParents(); fetchStats(); }}
      />

      {/* Bulk "Link Ward" — same search-and-pick flow, applied additively
          to every selected guardian at once (e.g. linking both parents of a
          new student in one go). */}
      <LinkWardModal
        open={bulkLinkWardOpen}
        onClose={() => setBulkLinkWardOpen(false)}
        parent={selectedRows[0] ?? null}
        onSaved={async (wardIds) => {
          await Promise.all(
            selectedRows.slice(1).map(async (g) => {
              const existing = (await guardianApi.getWards(g.user_id))?.data?.data ?? [];
              const existingIds = existing.map((w) => w.id);
              await guardianApi.syncWards(g.user_id, Array.from(new Set([...existingIds, ...wardIds])));
            }),
          );
          fetchParents();
          fetchStats();
        }}
      />

      <ViewWardsModal open={viewWardsModalOpen} onClose={() => setViewWardsModalOpen(false)} guardian={viewWardsGuardian} />

      <SendMessageModal
        open={sendMessageOpen}
        onClose={() => setSendMessageOpen(false)}
        guardians={sendMessageGuardians}
        onSent={() => setSelectedIds(new Set())}
      />
    </PageContainer>
  );
};

export default ParentManagement;
