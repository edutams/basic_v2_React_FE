import { useState, useCallback } from 'react';
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
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Divider,
  IconButton,
  Menu,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { IconCheck } from '@tabler/icons-react';
import { useNotification } from '@/hooks/useNotification';
import {
  fetchBatchClasses,
  fetchApplicationsByClass,
  batchProcessAdmissions,
  downloadAdmissionTemplate,
  uploadAdmissionTemplate,
} from '@/api/tenant/admission/admissionProcessingApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchAdmissionCodeFormat } from '@/api/tenant/admission/admissionApi';
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

const BatchProcessingTab = ({ allBatches, onDataChange }) => {
  const notify = useNotification();

  // ─── Data state ────────────────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [batchClasses, setBatchClasses] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState(new Set());

  // ─── Loading state ─────────────────────────────────────────────────────
  const [tableLoading, setTableLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // ─── Tab state ─────────────────────────────────────────────────────────
  const [statusTab, setStatusTab] = useState(0); // 0 = Pending, 1 = Processed

  // ─── Filter state ──────────────────────────────────────────────────────
  const [filter, setFilter] = useState({ appBatchId: '', classId: '', status: 'pending', search: '' });

  // ─── Pagination state ──────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [meta, setMeta] = useState(null);

  // ─── Batch processing modal state ──────────────────────────────────────
  const [batchModal, setBatchModal] = useState({
    open: false,
    action: '',
    programmes: [],
    classes: [],
    classArms: [],
    selectedProgramme: '',
    selectedClass: '',
    selectedClassArm: '',
    rejectionReason: '',
    revokedReason: '',
    hasCodeFormat: false,
    admissionPrefix: '',
  });

  // ─── Menu state ────────────────────────────────────────────────────────
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  // ─── View admission modal state ────────────────────────────────────────
  const [viewModal, setViewModal] = useState({
    open: false,
    formNumber: '',
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
    return parts.join('  ') || '—';
  };

  const getGuardianName = (app) => {
    const parts = [app.guardian_lname, app.guardian_fname, app.guardian_mname].filter(Boolean);
    return parts.join(' ') || '—';
  };

  const getBatchLabel = (app) => {
    const parts = [app.sesname, app.prog_name, app.batchname].filter(Boolean);
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
      if (!filters?.appBatchId || !filters?.classId) {
        setApplications([]);
        return;
      }

      setTableLoading(true);
      try {
        const res = await fetchApplicationsByClass(filters);
        const data = res?.data ?? res ?? [];
        setApplications(Array.isArray(data) ? data : []);
        setMeta(res?.meta ?? res?.pagination ?? null);
        setSelectedApplications(new Set());
        setHasFetched(true);
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
    const newStatus = newValue === 0 ? 'pending' : 'processed';
    setFilter((prev) => ({ ...prev, status: newStatus }));
    setSelectedApplications(new Set());
    setApplications([]);
    setHasFetched(false);
  };

  const handleBatchChange = async (e) => {
    const id = e.target.value;
    setPage(0);
    const currentStatus = statusTab === 0 ? 'pending' : 'processed';
    setFilter({ appBatchId: id, classId: '', status: currentStatus, search: '' });
    setBatchClasses([]);
    setApplications([]);
    setSelectedApplications(new Set());
    setHasFetched(false);

    if (id) {
      await loadBatchClasses(id);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFilter((prev) => ({ ...prev, classId }));
    setApplications([]);
    setSelectedApplications(new Set());
    setHasFetched(false);
  };

  const handleSearchChange = (e) => {
    setFilter((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleFetch = () => {
    if (!filter.appBatchId || !filter.classId) {
      notify.warning('Please select both batch and class');
      return;
    }
    setPage(0);
    loadApplications(filter);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    const payload = { ...filter, page: newPage + 1, per_page: rowsPerPage };
    loadApplications(payload);
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    const payload = { ...filter, page: 1, per_page: newRowsPerPage };
    loadApplications(payload);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFormNumbers = new Set(applications.map((app) => app.form_number));
      setSelectedApplications(allFormNumbers);
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

  const handleMenuOpen = (event, app) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedApp(null);
  };

  const handleViewAdmission = (formNumber) => {
    setViewModal({ open: true, formNumber });
    handleMenuClose();
  };

  const handleCloseViewModal = () => {
    setViewModal({ open: false, formNumber: '' });
  };

  // ─── Download Template handlers ────────────────────────────────────────
  const handleOpenDownloadModal = async () => {
    if (!filter.appBatchId || !filter.classId) {
      notify.warning('Please select both batch and class first');
      return;
    }

    try {
      const programmesRes = await fetchProgrammes();
      const programmes = Array.isArray(programmesRes?.data) ? programmesRes.data : [];
      setDownloadModal({
        open: true,
        programmes,
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
      selectedClassArm: '',
      classes: [],
      classArms: [],
    }));

    if (progId) {
      try {
        const classesRes = await fetchClassesByProgramme(progId);
        const classes = Array.isArray(classesRes?.data) ? classesRes.data : [];
        setDownloadModal((prev) => ({ ...prev, classes }));
      } catch (err) {
        notify.error('Failed to load classes');
      }
    }
  };

  const handleClassChangeDownload = (e) => {
    const classId = e.target.value;
    setDownloadModal((prev) => ({
      ...prev,
      selectedClass: classId,
    }));
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
      });

      // Trigger blob download
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
    setUploadModal({
      open: true,
      file: null,
      uploading: false,
      result: null,
    });
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

  // ─── Batch processing modal handlers ───────────────────────────────────
  const openBatchModal = async (action) => {
    // If filter is set to 'pending', auto-select all visible applications
    if (selectedApplications.size === 0) {
      if (filter.status === 'pending' && applications.length > 0) {
        const allFormNumbers = new Set(applications.map((app) => app.form_number));
        setSelectedApplications(allFormNumbers);
      } else {
        notify.warning('Please select at least one application');
        return;
      }
    }

    try {
      const [programmesRes, codeFormatRes] = await Promise.all([
        fetchProgrammes(),
        fetchAdmissionCodeFormat(),
      ]);
      const programmes = Array.isArray(programmesRes?.data) ? programmesRes.data : [];
      const hasCodeFormat = !!codeFormatRes?.data?.code_format;

      setBatchModal({
        open: true,
        action,
        programmes,
        classes: [],
        classArms: [],
        selectedProgramme: '',
        selectedClass: '',
        selectedClassArm: '',
        rejectionReason: '',
        revokedReason: '',
        hasCodeFormat,
        admissionPrefix: '',
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
        const classes = Array.isArray(classesRes?.data) ? classesRes.data : [];
        setBatchModal((prev) => ({ ...prev, classes }));
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
        const armsRes = await fetchClassArmsByClass(classId);
        const arms = Array.isArray(armsRes?.data) ? armsRes.data : [];
        setBatchModal((prev) => ({ ...prev, classArms: arms }));
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
      rejectionReason,
      revokedReason,
      hasCodeFormat,
      admissionPrefix,
    } = batchModal;

    // Validation
    if (action === 'admit' && (!selectedProgramme || !selectedClass || !selectedClassArm)) {
      notify.warning('Please select programme, class, and class arm for admission');
      return;
    }

    if (action === 'admit' && !hasCodeFormat && !admissionPrefix.trim()) {
      notify.warning('Please enter an admission prefix or set up an admission code format');
      return;
    }

    if (action === 'decline' && !rejectionReason) {
      notify.warning('Please provide a rejection reason');
      return;
    }

    if (action === 'revoke' && !revokedReason) {
      notify.warning('Please provide a revocation reason');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        action,
        form_numbers: Array.from(selectedApplications),
        programme_id: selectedProgramme || null,
        class_id: selectedClass || null,
        class_arm_id: selectedClassArm || null,
        rejection_reason: rejectionReason || null,
        revoked_reason: revokedReason || null,
      };

      // Only send admission_prefix when there's no auto-generation
      if (!hasCodeFormat && admissionPrefix.trim()) {
        payload.admission_prefix = admissionPrefix.trim();
      }

      await batchProcessAdmissions(payload);
      notify.success(
        `Successfully ${action === 'admit' ? 'admitted' : action === 'decline' ? 'declined' : 'revoked'} ${selectedApplications.size} application(s)`,
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

  const allSelected = applications.length > 0 && selectedApplications.size === applications.length;
  const someSelected =
    selectedApplications.size > 0 && selectedApplications.size < applications.length;

  return (
    <Box>
      {/* ── Status Tabs ──────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={statusTab}
          onChange={handleStatusTabChange}
          aria-label="application status tabs"
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
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                  }}
                />
                Pending Applications
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                Processed Applications
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Admission Batch</InputLabel>
            <Select value={filter.appBatchId} label="Admission Batch" onChange={handleBatchChange}>
              <MenuItem value="">-- Select Batch --</MenuItem>
              {allBatches.map((batch) => (
                <MenuItem key={batch.batch_id} value={String(batch.batch_id)}>
                  {batch.sesname} - {batch.prog_name} ({batch.batchname})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 2.5 }}>
          <FormControl fullWidth size="small" disabled={!filter.appBatchId}>
            <InputLabel>Class</InputLabel>
            <Select value={filter.classId} label="Class" onChange={handleClassChange}>
              <MenuItem value="">-- Select Class --</MenuItem>
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
            placeholder="Search by name"
            size="small"
            value={filter.search}
            onChange={handleSearchChange}
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
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={handleFetch}
            disabled={tableLoading || !filter.appBatchId || !filter.classId}
          >
            {tableLoading ? 'Fetching...' : 'Filter'}
          </Button>
        </Grid>
      </Grid>

      {/* ── Info Banner ────────────────────────────────────────────────── */}
      {statusTab === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Only <strong>Pending</strong> applications can be batch
            processed. Switch to the <strong>Processed</strong> tab to view admitted, declined, or
            revoked applications.
          </Typography>
        </Alert>
      )}

      {/* ── Download/Upload Template Buttons + Process All ──────────── */}

      {hasFetched && statusTab === 0 && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleOpenDownloadModal}
              disabled={!filter.appBatchId || !filter.classId}
            >
              Download Template
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadIcon />}
              onClick={handleOpenUploadModal}
              disabled={!filter.appBatchId || !filter.classId}
            >
              Upload Template
            </Button>
            {applications.length > 0 && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<IconCheck size={18} />}
                onClick={() => openBatchModal('admit')}
                disabled={!hasFetched}
                sx={{ fontWeight: 600 }}
              >
                Process All ({selectedApplications.size || applications.length})
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* ── Action Buttons ────────────────────────────────────────────── */}
      {/* {applications.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => openBatchModal('admit')}
            disabled={selectedApplications.size === 0 || filter.status =='admitted'}
          >
            Admit Selected ({selectedApplications.size})
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => openBatchModal('decline')}
            disabled={selectedApplications.size === 0 || filter.status =='declined'}
          >
            Decline Selected ({selectedApplications.size})
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => openBatchModal('revoke')}
            disabled={selectedApplications.size === 0 || filter.status =='revoked'}
          >
            Revoke Selected ({selectedApplications.size})
          </Button>
        </Stack>
      )} */}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Box variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '4%' }}>
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    disabled={applications.length === 0}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '3%' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }}>Form Number</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%' }}>Applicant's Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%' }}>Guardian's Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }}>Intending Class</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '13%' }}>Application Batch</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '9%' }} align="center">
                  Form Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '9%' }} align="center">
                  Admission Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : applications.length > 0 ? (
                applications.map((app, index) => (
                  <TableRow key={app.form_number || index} hover>
                    <TableCell>
                      <Checkbox
                        size="small"
                        checked={selectedApplications.has(app.form_number)}
                        onChange={() => handleSelectOne(app.form_number)}
                      />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {app.form_number}
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
                      <Typography variant="body2" fontWeight={600}>
                        {app.intending_class_code || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{getBatchLabel(app)}</Typography>
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
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, app)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl) && selectedApp?.form_number === app.form_number}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        <MenuItem onClick={() => handleViewAdmission(app.form_number)}>
                          View Details
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="h6" color="text.secondary" fontWeight={500}>
                        No record found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                        {filter.appBatchId && filter.classId
                          ? 'No applications for the selected batch and class.'
                          : 'Select a batch and class to view applications.'}
                      </Typography>
                    </Stack>
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

      {/* ── Batch Processing Modal ────────────────────────────────────── */}
      <Dialog open={batchModal.open} onClose={handleCloseBatchModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Batch{' '}
          {batchModal.action === 'admit'
            ? 'Admission'
            : batchModal.action === 'decline'
              ? 'Decline'
              : 'Revocation'}
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
                        {arm.arm_names}
                        {arm.student_count !== undefined && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            ({arm.student_count})
                          </Typography>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* ── Admission Prefix (only when code format is NOT configured) ── */}
                {!batchModal.hasCodeFormat && (
                  <TextField
                    fullWidth
                    size="small"
                    label="Admission Number Prefix *"
                    placeholder="e.g. ADM/2026/STU/"
                    value={batchModal.admissionPrefix}
                    onChange={(e) =>
                      setBatchModal((prev) => ({ ...prev, admissionPrefix: e.target.value }))
                    }
                    helperText="Enter a prefix — the system will append sequential numbers (e.g. ADM/2026/STU/0001, ADM/2026/STU/0002, ...)"
                    required
                  />
                )}
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

            {batchModal.action === 'revoke' && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Revocation Reason *"
                placeholder="Enter reason for revoking these admissions"
                value={batchModal.revokedReason}
                onChange={(e) =>
                  setBatchModal((prev) => ({ ...prev, revokedReason: e.target.value }))
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
            color={
              batchModal.action === 'decline' || batchModal.action === 'revoke'
                ? 'error'
                : 'success'
            }
            onClick={handleConfirmBatchProcess}
            disabled={processing}
          >
            {processing
              ? 'Processing...'
              : `Confirm ${batchModal.action === 'admit' ? 'Admission' : batchModal.action === 'decline' ? 'Decline' : 'Revocation'}`}
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
            startIcon={
              downloading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />
            }
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
              programme, class, and <strong>Class Arm</strong> column (P) from the downloaded
              template will be used to assign each applicant to their programme, class, and arm.
            </Typography>

            {/* ── File Upload Area ── */}
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

            {uploadModal.uploading && <CircularProgress size={20} sx={{ alignSelf: 'center' }} />}

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
            startIcon={
              uploadModal.uploading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <UploadIcon />
              )
            }
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

export default BatchProcessingTab;
