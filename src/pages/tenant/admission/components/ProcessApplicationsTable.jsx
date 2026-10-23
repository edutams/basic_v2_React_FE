import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Divider,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  FileDownload as ExportIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { IconNote, IconEdit, IconEye, IconHistory, IconCheck, IconX } from '@tabler/icons-react';
import { useNotification } from '@/hooks/useNotification';
import {
  fetchApplications,
  fetchBatchClasses,
  acceptAdmissionOffer,
  resetAdmissionOffer,
  batchProcessAdmissions,
  downloadAdmissionTemplate,
  uploadAdmissionTemplate,
  exportApplications,
} from '@/api/tenant/admission/admissionProcessingApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchActiveCategories } from '@/api/tenant/bursary/bursarySettingsApi';
import ViewAdmissionModal from './ViewAdmissionModal';

const statusColors = {
  admitted: 'success',
  declined: 'error',
  pending: 'warning',
  revoked: 'error',
};

const formSubmitColors = {
  yes: 'success',
  no: 'warning',
};

const offerColors = {
  yes: 'info',
  no: 'default',
};

// Status tabs shown in the unified table — "All" and "Accepted Offers" are
// each a different filter dimension than the other three (All = no status
// filter at all; Accepted Offers = accept_admission_offer, not
// admission_status), so the index-to-status mapping below is deliberately
// not a simple enum walk.
const STATUS_TABS = [
  {
    label: 'Pending Applications',
    status: 'pending',
    statsKey: 'pending',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
  },
  {
    label: 'Admitted',
    status: 'admitted',
    statsKey: 'admitted',
    badgeBg: '#DCFCE7',
    badgeColor: '#15803D',
  },
  {
    label: 'Declined',
    status: 'declined',
    statsKey: 'declined',
    badgeBg: '#FEE2E2',
    badgeColor: '#B91C1C',
  },
  {
    label: 'Accepted Offers',
    status: 'accepted_offer',
    statsKey: 'accepted_offers',
    badgeBg: '#DBEAFE',
    badgeColor: '#1D4ED8',
  },
  {
    label: 'All Applications',
    status: '',
    statsKey: 'applications',
    badgeBg: '#E2E8F0',
    badgeColor: '#475569',
  },
];

const TABLE_COLUMN_COUNT = 14;

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton variant="rounded" width={18} height={18} />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width={16} />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="70%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="60%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="80%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="75%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="85%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="60%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="70%" />
    </TableCell>
    <TableCell align="center">
      <Skeleton variant="rounded" width={70} height={20} sx={{ mx: 'auto' }} />
    </TableCell>
    <TableCell align="center">
      <Skeleton variant="rounded" width={70} height={20} sx={{ mx: 'auto' }} />
    </TableCell>
    <TableCell align="center">
      <Skeleton variant="rounded" width={50} height={20} sx={{ mx: 'auto' }} />
    </TableCell>
    <TableCell align="center">
      <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
    </TableCell>
    <TableCell align="center">
      <Skeleton variant="circular" width={22} height={22} sx={{ mx: 'auto' }} />
    </TableCell>
  </TableRow>
);

/**
 * Unified "Process Applications" table — merges what used to be two
 * separate tabs (Individual Processing / Batch Processing) into one page,
 * per the CEO-approved design: stat cards (rendered by the parent) + a
 * single table with All/Pending/Admitted/Declined/Accepted Offers filter
 * tabs, checkbox selection, bulk admit/decline, Excel template
 * download/upload (carried over from the old Batch Processing tab so that
 * capability isn't lost), and an export of the current filtered view.
 */
const ProcessApplicationsTable = ({ allBatches, onDataChange, stats }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();

  // ─── Data state ────────────────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState(new Set());

  // ─── Loading state ─────────────────────────────────────────────────────
  const [tableLoading, setTableLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Deep-link support: the Admission Dashboard's stat cards navigate here
  // with `state: { status }` so the matching tab is pre-selected on arrival
  // instead of always defaulting to Pending Applications.
  const requestedStatus = location.state?.status;
  const initialStatusTab =
    requestedStatus !== undefined
      ? Math.max(
          STATUS_TABS.findIndex((tab) => tab.status === requestedStatus),
          0,
        )
      : 0;

  // ─── Tab state ─────────────────────────────────────────────────────────
  const [statusTab, setStatusTab] = useState(initialStatusTab); // index into STATUS_TABS

  // ─── Filter state ──────────────────────────────────────────────────────
  const [filter, setFilter] = useState({
    appBatchId: '',
    classId: '',
    status: requestedStatus !== undefined ? STATUS_TABS[initialStatusTab].status : '',
    search: '',
  });
  const [batchClasses, setBatchClasses] = useState([]);

  // ─── Pagination state ──────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [meta, setMeta] = useState(null);

  // ─── Row menu state ────────────────────────────────────────────────────
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  // ─── Bulk Actions dropdown state ──────────────────────────────────────
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);

  // ─── View admission modal state ───────────────────────────────────────
  const [viewModal, setViewModal] = useState({ open: false, formNumber: '' });

  // ─── Confirm dialog state (accept/reset offer) ────────────────────────
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '', // 'accept-offer' | 'reset-offer'
    app: null,
    title: '',
    message: '',
  });

  // ─── Admit/Decline bulk modal state ────────────────────────────────────
  const [batchModal, setBatchModal] = useState({
    open: false,
    action: '', // 'admit' | 'decline'
    programmes: [],
    classes: [],
    classArms: [],
    categories: [],
    selectedProgramme: '',
    selectedClass: '',
    selectedClassArm: '',
    selectedPayCategory: '',
    rejectionReason: '',
  });

  // ─── Download Template modal state ─────────────────────────────────────
  const [downloadModal, setDownloadModal] = useState({
    open: false,
    programmes: [],
    classes: [],
    selectedProgramme: '',
    selectedClass: '',
  });
  const [downloading, setDownloading] = useState(false);

  // ─── Upload Template modal state ───────────────────────────────────────
  const [uploadModal, setUploadModal] = useState({
    open: false,
    file: null,
    uploading: false,
    result: null,
  });

  // ─── Data helpers ──────────────────────────────────────────────────────
  const getFullName = (app) => {
    const parts = [app.lname, app.fname, app.mname].filter(Boolean);
    return parts.join(' ') || '—';
  };

  const getGuardianName = (app) => {
    const parts = [app.guardian_lname, app.guardian_fname, app.guardian_mname].filter(Boolean);
    return parts.join(' ') || '—';
  };

  const getBatchLabel = (app) => {
    const parts = [app.session_name, app.prog_name, app.batchname].filter(Boolean);
    return parts.length ? `${parts[0]} - ${parts[1]} (${parts[2]})` : '—';
  };

  const getFormSubmitLabel = (value) => (value === 'yes' ? 'Submitted' : 'Not Submitted');

  // ─── API calls ─────────────────────────────────────────────────────────
  const loadBatchClasses = useCallback(
    async (batchId) => {
      try {
        const res = await fetchBatchClasses(batchId);
        const list = Array.isArray(res?.data) ? res.data : [];
        setBatchClasses(list);
      } catch (err) {
        console.error('Failed to load batch classes:', err);
        notify.error('Failed to load batch classes');
      }
    },
    [notify],
  );

  const loadApplications = useCallback(
    async (filters = null) => {
      setTableLoading(true);
      try {
        const res = await fetchApplications(filters);
        const data = res?.data ?? res ?? [];
        setApplications(Array.isArray(data) ? data : []);
        setMeta(res?.meta ?? res?.pagination ?? null);
        setSelectedApplications(new Set());
      } catch (err) {
        console.error('Failed to load applications:', err);
        notify.error('Failed to load applications');
      } finally {
        setTableLoading(false);
      }
    },
    [notify],
  );

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleStatusTabChange = (_, newValue) => {
    setStatusTab(newValue);
    setPage(0);
    const newStatus = STATUS_TABS[newValue].status;
    const nextFilter = { ...filter, status: newStatus };
    setFilter(nextFilter);
    setSelectedApplications(new Set());
    if (nextFilter.appBatchId) {
      loadApplications(nextFilter);
    }
  };

  const handleBatchChange = (e) => {
    const id = e.target.value;
    setPage(0);
    setFilter((prev) => ({ ...prev, appBatchId: id, classId: '' }));
    setBatchClasses([]);
    setApplications([]);
    setSelectedApplications(new Set());
    if (id) {
      loadBatchClasses(id);
    }
  };

  const handleClassChange = (e) => {
    setFilter((prev) => ({ ...prev, classId: e.target.value }));
  };

  const handleSearchChange = (e) => {
    setFilter((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleSearchKeyUp = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      loadApplications({ ...filter, search: e.target.value, page: 1, per_page: rowsPerPage });
    }
  };

  const handleFetch = () => {
    setPage(0);
    loadApplications(filter);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    loadApplications({ ...filter, page: newPage + 1, per_page: rowsPerPage });
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadApplications({ ...filter, page: 1, per_page: newRowsPerPage });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApplications(new Set(applications.map((app) => app.form_number)));
    } else {
      setSelectedApplications(new Set());
    }
  };

  const handleSelectOne = (formNumber) => {
    setSelectedApplications((prev) => {
      const next = new Set(prev);
      if (next.has(formNumber)) {
        next.delete(formNumber);
      } else {
        next.add(formNumber);
      }
      return next;
    });
  };

  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportApplications(filter);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Applications exported successfully');
    } catch (err) {
      notify.error('Failed to export applications');
    } finally {
      setExporting(false);
    }
  };

  // ─── Confirm dialog handlers (accept/reset offer) ─────────────────────
  const openConfirmAcceptOffer = (app) => {
    handleMenuClose();
    setConfirmDialog({
      open: true,
      type: 'accept-offer',
      app,
      title: 'Accept Admission Offer',
      message: `Are you sure you want to accept the admission offer for ${getFullName(app)} (${app.form_number})?`,
    });
  };

  const openConfirmResetOffer = (app) => {
    handleMenuClose();
    setConfirmDialog({
      open: true,
      type: 'reset-offer',
      app,
      title: 'Reverse Admission Offer',
      message: `Are you sure you want to reverse the admission offer for ${getFullName(app)} (${app.form_number})?`,
    });
  };

  const handleConfirmAction = async () => {
    const { type, app } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, open: false }));

    try {
      if (type === 'accept-offer') {
        await acceptAdmissionOffer(app);
        notify.success('Admission offer accepted successfully');
      } else if (type === 'reset-offer') {
        await resetAdmissionOffer({
          form_number: app.form_number,
          status: 'no',
          fname: app.fname,
          lname: app.lname,
          mname: app.mname || '',
          batchname: app.batchname,
          prog_name: app.prog_name,
          session_name: app.session_name,
        });
        notify.success('Admission offer reset successfully');
      }
      loadApplications(filter);
      if (onDataChange) onDataChange();
    } catch (err) {
      notify.error(
        err?.response?.data?.message ||
          `Failed to ${type === 'accept-offer' ? 'accept' : 'reset'} admission offer`,
      );
    }
  };

  const handleCancelConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const canAcceptOffer = (app) =>
    app?.admission_status === 'admitted' &&
    (app?.accept_admission_offer === 'no' || app?.accept_admission_offer == null);

  const canResetOffer = (app) => app?.accept_admission_offer === 'yes';

  // ─── Bulk Actions: Admit / Decline ─────────────────────────────────────
  const openBatchModal = async (action) => {
    setBulkMenuAnchor(null);
    if (selectedApplications.size === 0) {
      notify.warning('Please select at least one application');
      return;
    }

    try {
      const [programmesRes, categoriesRes] = await Promise.all([
        fetchProgrammes(),
        fetchActiveCategories(),
      ]);
      setBatchModal({
        open: true,
        action,
        programmes: Array.isArray(programmesRes?.data) ? programmesRes.data : [],
        classes: [],
        classArms: [],
        categories: Array.isArray(categoriesRes?.data) ? categoriesRes.data : [],
        selectedProgramme: '',
        selectedClass: '',
        selectedClassArm: '',
        selectedPayCategory: '',
        rejectionReason: '',
      });
    } catch (err) {
      notify.error('Failed to load programmes');
    }
  };

  const handleProgrammeChange = async (e) => {
    const progId = e.target.value;
    setBatchModal((prev) => ({
      ...prev,
      selectedProgramme: progId,
      selectedClass: '',
      selectedClassArm: '',
      classes: [],
      classArms: [],
    }));
    if (progId) {
      try {
        const classesRes = await fetchClassesByProgramme(progId);
        setBatchModal((prev) => ({
          ...prev,
          classes: Array.isArray(classesRes?.data) ? classesRes.data : [],
        }));
      } catch (err) {
        notify.error('Failed to load classes');
      }
    }
  };

  const handleClassChangeModal = async (e) => {
    const classId = e.target.value;
    setBatchModal((prev) => ({
      ...prev,
      selectedClass: classId,
      selectedClassArm: '',
      classArms: [],
    }));
    if (classId) {
      try {
        const armsRes = await fetchClassArmsByClass(classId, {
          programme_id: batchModal.selectedProgramme,
        });
        setBatchModal((prev) => ({
          ...prev,
          classArms: Array.isArray(armsRes?.data) ? armsRes.data : [],
        }));
      } catch (err) {
        notify.error('Failed to load class arms');
      }
    }
  };

  const handleCloseBatchModal = () => {
    setBatchModal((prev) => ({ ...prev, open: false }));
  };

  const handleConfirmBatchProcess = async () => {
    const {
      action,
      selectedProgramme,
      selectedClass,
      selectedClassArm,
      selectedPayCategory,
      rejectionReason,
    } = batchModal;

    if (
      action === 'admit' &&
      (!selectedProgramme || !selectedClass || !selectedClassArm || !selectedPayCategory)
    ) {
      notify.warning('Please select programme, class, class arm, and pay category for admission');
      return;
    }
    if (action === 'decline' && !rejectionReason) {
      notify.warning('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await batchProcessAdmissions({
        action,
        form_numbers: Array.from(selectedApplications),
        programme_id: selectedProgramme || null,
        class_id: selectedClass || null,
        class_arm_id: selectedClassArm || null,
        bursary_payment_category_id: selectedPayCategory || null,
        rejection_reason: rejectionReason || null,
      });
      notify.success(
        `Successfully ${action === 'admit' ? 'admitted' : 'declined'} ${selectedApplications.size} application(s)`,
      );
      handleCloseBatchModal();
      loadApplications(filter);
      if (onDataChange) onDataChange();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Batch processing failed');
    } finally {
      setProcessing(false);
    }
  };

  // ─── Download Template handlers ────────────────────────────────────────
  const handleOpenDownloadModal = async () => {
    setBulkMenuAnchor(null);
    if (!filter.appBatchId || !filter.classId) {
      notify.warning('Please select both batch and class first');
      return;
    }
    if (selectedApplications.size === 0) {
      notify.warning('Please select at least one applicant to include in the download');
      return;
    }
    try {
      const programmesRes = await fetchProgrammes();
      setDownloadModal({
        open: true,
        programmes: Array.isArray(programmesRes?.data) ? programmesRes.data : [],
        classes: [],
        selectedProgramme: '',
        selectedClass: '',
      });
    } catch (err) {
      notify.error('Failed to load programmes');
    }
  };

  const handleProgrammeChangeDownload = async (e) => {
    const progId = e.target.value;
    setDownloadModal((prev) => ({
      ...prev,
      selectedProgramme: progId,
      selectedClass: '',
      classes: [],
    }));
    if (progId) {
      try {
        const classesRes = await fetchClassesByProgramme(progId);
        setDownloadModal((prev) => ({
          ...prev,
          classes: Array.isArray(classesRes?.data) ? classesRes.data : [],
        }));
      } catch (err) {
        notify.error('Failed to load classes');
      }
    }
  };

  const handleClassChangeDownload = (e) => {
    setDownloadModal((prev) => ({ ...prev, selectedClass: e.target.value }));
  };

  const handleDownloadTemplate = async () => {
    const { selectedProgramme, selectedClass } = downloadModal;
    if (!selectedClass) {
      notify.warning('Please select a class');
      return;
    }
    setDownloading(true);
    try {
      const res = await downloadAdmissionTemplate({
        batch_id: filter.appBatchId,
        intend_class_id: filter.classId,
        programme_id: selectedProgramme,
        class_id: selectedClass,
        form_numbers: Array.from(selectedApplications),
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'admission_applicants_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Template downloaded successfully');
      setDownloadModal((prev) => ({ ...prev, open: false }));
    } catch (err) {
      notify.error('Failed to download template');
    } finally {
      setDownloading(false);
    }
  };

  const handleCloseDownloadModal = () => {
    setDownloadModal((prev) => ({ ...prev, open: false }));
  };

  // ─── Upload Template handlers ──────────────────────────────────────────
  const handleOpenUploadModal = () => {
    setBulkMenuAnchor(null);
    if (!filter.appBatchId || !filter.classId) {
      notify.warning('Please select both batch and class first');
      return;
    }
    setUploadModal({ open: true, file: null, uploading: false, result: null });
  };

  const handleUploadFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadModal((prev) => ({ ...prev, file, result: null }));
    }
    e.target.value = '';
  };

  const handleUploadTemplate = async () => {
    const { file } = uploadModal;
    if (!file) {
      notify.warning('Please select a file to upload');
      return;
    }
    setUploadModal((prev) => ({ ...prev, uploading: true, result: null }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batch_id', filter.appBatchId);
      const res = await uploadAdmissionTemplate(formData);
      setUploadModal((prev) => ({
        ...prev,
        open: false,
        uploading: false,
        result: { severity: 'success', message: res?.message || 'Upload completed' },
        file: null,
      }));
      loadApplications(filter);
      if (onDataChange) onDataChange();
    } catch (err) {
      setUploadModal((prev) => ({
        ...prev,
        uploading: false,
        result: {
          severity: 'error',
          message: err?.response?.data?.message || 'Upload failed. Please try again.',
        },
      }));
    }
  };

  const handleViewDetails = () => {
    setViewModal({ open: true, formNumber: activeRow?.form_number });
    handleMenuClose();
  };

  const handleCloseViewModal = () => {
    setViewModal({ open: false, formNumber: '' });
  };

  const allSelected = applications.length > 0 && selectedApplications.size === applications.length;
  const someSelected =
    selectedApplications.size > 0 && selectedApplications.size < applications.length;
  const canBulkProcess = filter.appBatchId && applications.length > 0;

  return (
    <Box>
      {/* ── Status Tabs ──────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mt: -1 }}>
        <Tabs
          value={statusTab}
          onChange={handleStatusTabChange}
          aria-label="application status tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              minHeight: 40,
              px: 3,
            },
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.label}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {tab.label}
                  <Box
                    component="span"
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 0.6,
                      borderRadius: '10px',
                      bgcolor: tab.badgeBg,
                      color: tab.badgeColor,
                      fontSize: 18,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stats?.[tab.statsKey] ?? 0}
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Admission Batch</InputLabel>
            <Select value={filter.appBatchId} label="Admission Batch" onChange={handleBatchChange}>
              <MenuItem value="">-- Select Admission --</MenuItem>
              {allBatches.map((batch) => (
                <MenuItem key={batch.batch_id} value={String(batch.batch_id)}>
                  {batch.session_name} - {batch.prog_name} ({batch.batchname})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 2.5 }}>
          <FormControl fullWidth size="small" disabled={!filter.appBatchId}>
            <InputLabel>Class</InputLabel>
            <Select value={filter.classId} label="Class" onChange={handleClassChange}>
              <MenuItem value="">-- All Classes --</MenuItem>
              {batchClasses.map((cls) => (
                <MenuItem key={cls.id} value={String(cls.id)}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, form number, guardian..."
            size="small"
            value={filter.search}
            onChange={handleSearchChange}
            onKeyUp={handleSearchKeyUp}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3.5 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={handleFetch}
              disabled={tableLoading || !filter.appBatchId}
              sx={{ fontWeight: 600, flex: 1 }}
            >
              {tableLoading ? 'Fetching...' : 'Fetch'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon fontSize="small" />}
              onClick={handleExport}
              disabled={exporting || applications.length === 0}
              sx={{ flexShrink: 0 }}
            >
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
              disabled={!canBulkProcess}
              sx={{ flexShrink: 0 }}
            >
              Bulk Actions
            </Button>
            <Menu
              anchorEl={bulkMenuAnchor}
              open={Boolean(bulkMenuAnchor)}
              onClose={() => setBulkMenuAnchor(null)}
            >
              <MenuItem onClick={() => openBatchModal('admit')} sx={{ color: 'success.main' }}>
                <IconCheck size={16} style={{ marginRight: 10 }} />
                Admit Selected ({selectedApplications.size})
              </MenuItem>
              <MenuItem onClick={() => openBatchModal('decline')} sx={{ color: 'error.main' }}>
                <IconX size={16} style={{ marginRight: 10 }} />
                Decline Selected ({selectedApplications.size})
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleOpenDownloadModal}>
                <DownloadIcon fontSize="small" style={{ marginRight: 10 }} />
                Download Template
              </MenuItem>
              <MenuItem onClick={handleOpenUploadModal}>
                <UploadIcon fontSize="small" style={{ marginRight: 10 }} />
                Upload Template
              </MenuItem>
            </Menu>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
              }}
            >
              <TableRow>
                <TableCell sx={{ width: '3%' }}>
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    disabled={applications.length === 0}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '2%' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }}>Form Number</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }}>Admission No</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '11%' }}>Applicant's Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }}>Guardian's Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '11%' }}>Application Batch</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '7%' }}>Intending Class</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }}>Admitted Class</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '7%' }} align="center">
                  Form Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '7%' }} align="center">
                  Admission Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '6%' }} align="center">
                  Accept Offer
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">
                  Form Submit Date
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '4%' }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : applications.length > 0 ? (
                applications.map((app, index) => (
                  <TableRow
                    key={app.form_number || index}
                    hover
                    selected={selectedApplications.has(app.form_number)}
                  >
                    <TableCell>
                      <Checkbox
                        size="small"
                        checked={selectedApplications.has(app.form_number)}
                        onChange={() => handleSelectOne(app.form_number)}
                      />
                    </TableCell>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {app.form_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {app.admission_no || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{getFullName(app)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {getGuardianName(app)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{getBatchLabel(app)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {app.intending_class_code || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {app.admitted_class_code || '—'} {app.admitted_class_arm_name || ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getFormSubmitLabel(app.form_submit_status)}
                        size="small"
                        color={formSubmitColors[app.form_submit_status] || 'default'}
                        sx={{ fontWeight: 600, fontSize: 11, minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={app.admission_status || 'pending'}
                        size="small"
                        color={statusColors[app.admission_status] || 'warning'}
                        sx={{ fontWeight: 600, fontSize: 11, minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={app.accept_admission_offer === 'yes' ? 'Yes' : 'No'}
                        size="small"
                        color={offerColors[app.accept_admission_offer] || 'default'}
                        variant={app.accept_admission_offer === 'yes' ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, fontSize: 11, minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {app.form_submit_completion
                          ? new Date(app.form_submit_completion).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, app)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={TABLE_COLUMN_COUNT} align="center" sx={{ py: 6 }}>
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                      {filter.search
                        ? 'No record found. Try adjusting your search terms.'
                        : filter.appBatchId
                          ? 'No applications found for the selected filters.'
                          : 'Select an admission batch to view applications.'}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 30, 50]}
                  count={meta?.total || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Row Action Menu ──────────────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            const form_number = activeRow?.form_number;
            handleMenuClose();
            if (form_number) navigate(`/admission/process-form/${form_number}`);
          }}
        >
          <IconNote size={18} style={{ marginRight: 12 }} />
          Process Application Form
        </MenuItem>

        <MenuItem
          onClick={() => {
            const form_number = activeRow?.form_number;
            handleMenuClose();
            if (form_number) navigate(`/admission/edit-form/${form_number}`);
          }}
        >
          <IconEdit size={18} style={{ marginRight: 12 }} />
          Edit Application Form
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            const form_number = activeRow?.form_number;
            handleMenuClose();
            if (form_number) navigate(`/admission/print-application/${form_number}`);
          }}
        >
          <IconEye size={18} style={{ marginRight: 12 }} />
          View Application Form
        </MenuItem>

        <MenuItem onClick={handleViewDetails}>
          <IconEye size={18} style={{ marginRight: 12 }} />
          View Details
        </MenuItem>

        <MenuItem
          onClick={() => {
            const form_number = activeRow?.form_number;
            handleMenuClose();
            if (form_number) navigate(`/admission/payment-history/${form_number}`);
          }}
        >
          <IconHistory size={18} style={{ marginRight: 12 }} />
          View Payment History
        </MenuItem>

        <Divider />

        {activeRow && canAcceptOffer(activeRow) && (
          <MenuItem
            onClick={() => openConfirmAcceptOffer(activeRow)}
            sx={{ color: 'success.main' }}
          >
            <IconCheck size={18} style={{ marginRight: 12 }} />
            Accept Admission Offer
          </MenuItem>
        )}

        {activeRow && canResetOffer(activeRow) && (
          <MenuItem onClick={() => openConfirmResetOffer(activeRow)} sx={{ color: 'error.main' }}>
            <IconX size={18} style={{ marginRight: 12 }} />
            Reverse Admission Offer
          </MenuItem>
        )}
      </Menu>

      {/* ── Accept/Reverse Offer Confirmation ────────────────────────────── */}
      <Dialog open={confirmDialog.open} onClose={handleCancelConfirm} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={handleCancelConfirm}>
            Cancel
          </Button>
          <Button
            size="small"
            color={confirmDialog.type === 'reset-offer' ? 'error' : 'primary'}
            onClick={handleConfirmAction}
          >
            {confirmDialog.type === 'reset-offer' ? 'Yes, Reverse' : 'Yes, Accept'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Admit / Decline Bulk Modal ────────────────────────────────── */}
      <Dialog open={batchModal.open} onClose={handleCloseBatchModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Bulk {batchModal.action === 'admit' ? 'Admission' : 'Decline'}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You are about to {batchModal.action} <strong>{selectedApplications.size}</strong>{' '}
              application(s).
            </Typography>

            {batchModal.action === 'admit' && (
              <>
                <Alert severity="info" sx={{ mb: 0.5 }}>
                  This records the admission decision only — each guardian still needs to accept the
                  offer (paying any acceptance fee first) before their ward's account and admission
                  number are created.
                </Alert>

                <FormControl fullWidth size="small">
                  <InputLabel>Programme *</InputLabel>
                  <Select
                    value={batchModal.selectedProgramme}
                    label="Programme *"
                    onChange={handleProgrammeChange}
                  >
                    <MenuItem value="">-- Select Programme --</MenuItem>
                    {batchModal.programmes.map((prog) => (
                      <MenuItem key={prog.id} value={prog.id}>
                        {prog.programme_code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={!batchModal.selectedProgramme}>
                  <InputLabel>Class *</InputLabel>
                  <Select
                    value={batchModal.selectedClass}
                    label="Class *"
                    onChange={handleClassChangeModal}
                  >
                    <MenuItem value="">-- Select Class --</MenuItem>
                    {batchModal.classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.class_code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={!batchModal.selectedClass}>
                  <InputLabel>Class Arm *</InputLabel>
                  <Select
                    value={batchModal.selectedClassArm}
                    label="Class Arm *"
                    onChange={(e) =>
                      setBatchModal((prev) => ({ ...prev, selectedClassArm: e.target.value }))
                    }
                  >
                    <MenuItem value="">-- Select Class Arm --</MenuItem>
                    {batchModal.classArms.map((arm) => (
                      <MenuItem key={arm.id} value={arm.id}>
                        {arm.class_arm_names}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Pay Category *</InputLabel>
                  <Select
                    value={batchModal.selectedPayCategory}
                    label="Pay Category *"
                    onChange={(e) =>
                      setBatchModal((prev) => ({ ...prev, selectedPayCategory: e.target.value }))
                    }
                  >
                    <MenuItem value="">-- Select Pay Category --</MenuItem>
                    {(batchModal.categories || []).map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {batchModal.action === 'decline' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection Reason *"
                placeholder="Enter reason for declining these applications"
                value={batchModal.rejectionReason}
                onChange={(e) =>
                  setBatchModal((prev) => ({ ...prev, rejectionReason: e.target.value }))
                }
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={handleCloseBatchModal}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            size="small"
            color={batchModal.action === 'decline' ? 'error' : 'success'}
            onClick={handleConfirmBatchProcess}
            disabled={processing}
          >
            {processing
              ? 'Processing...'
              : `Confirm ${batchModal.action === 'admit' ? 'Admission' : 'Decline'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Download Template Modal ──────────────────────────────────── */}
      <Dialog open={downloadModal.open} onClose={handleCloseDownloadModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Download Admission Template</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Select the programme and class to generate an Excel template with all admission
              applicants. The template will include a <strong>Class Arm</strong> column — fill in
              the arm name for each applicant before uploading.
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Programme *</InputLabel>
              <Select
                value={downloadModal.selectedProgramme}
                label="Programme *"
                onChange={handleProgrammeChangeDownload}
              >
                <MenuItem value="">-- Select Programme --</MenuItem>
                {downloadModal.programmes.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.programme_code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={!downloadModal.selectedProgramme}>
              <InputLabel>Class *</InputLabel>
              <Select
                value={downloadModal.selectedClass}
                label="Class *"
                onChange={handleClassChangeDownload}
              >
                <MenuItem value="">-- Select Class --</MenuItem>
                {downloadModal.classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.class_code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={handleCloseDownloadModal}
            disabled={downloading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={downloading ? undefined : <DownloadIcon />}
            onClick={handleDownloadTemplate}
            disabled={!downloadModal.selectedClass || downloading}
          >
            {downloading ? 'Downloading...' : 'Download Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Upload Template Modal ──────────────────────────────────────── */}
      <Dialog
        open={uploadModal.open}
        onClose={() => setUploadModal((prev) => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Admission Template</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Upload the completed admission template (.xlsx) to bulk admit applicants. The
              programme, class, and <strong>Class Arm</strong> column from the downloaded template
              will be used to assign each applicant to their programme, class, and arm.
            </Typography>

            <Box
              onClick={() => document.getElementById('upload-admission-file-input')?.click()}
              sx={{
                border: '2px dashed',
                borderColor: uploadModal.file ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: uploadModal.file ? 'primary.lighter' : 'background.default',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
              }}
            >
              <UploadIcon sx={{ fontSize: 36, opacity: 0.6 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {uploadModal.file ? uploadModal.file.name : 'Click to select an Excel file (.xlsx)'}
              </Typography>
            </Box>

            <input
              id="upload-admission-file-input"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleUploadFileChange}
            />

            {uploadModal.result && (
              <Alert severity={uploadModal.result.severity}>{uploadModal.result.message}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setUploadModal((prev) => ({ ...prev, open: false }))}
            disabled={uploadModal.uploading}
          >
            {uploadModal.result?.severity === 'success' ? 'Close' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={uploadModal.uploading ? undefined : <UploadIcon />}
            onClick={handleUploadTemplate}
            disabled={!uploadModal.file || uploadModal.uploading}
          >
            {uploadModal.uploading ? 'Uploading...' : 'Upload Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Admission Modal ──────────────────────────────────────── */}
      <ViewAdmissionModal
        open={viewModal.open}
        onClose={handleCloseViewModal}
        formNumber={viewModal.formNumber}
      />
    </Box>
  );
};

export default ProcessApplicationsTable;
