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
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import {
  fetchBatchClasses,
  fetchApplicationsByClass,
  batchProcessAdmissions,
} from '@/api/tenant/admission/admissionProcessingApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

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

  // ─── Filter state ──────────────────────────────────────────────────────
  const [filter, setFilter] = useState({ appBatchId: '', classId: '', search: '' });

  // ─── Pagination state ──────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [meta, setMeta] = useState(null);

  // ─── Batch processing modal state ──────────────────────────────────────
  const [batchModal, setBatchModal] = useState({
    open: false,
    action: '', // 'admit' | 'decline' | 'revoke'
    programmes: [],
    classes: [],
    classArms: [],
    selectedProgramme: '',
    selectedClass: '',
    selectedClassArm: '',
    rejectionReason: '',
    revokedReason: '',
  });

  // ─── Data helpers ──────────────────────────────────────────────────────
  const getFullName = (app) => {
    const parts = [app.lname, app.fname, app.mname].filter(Boolean);
    return parts.join('  ') || '—';
  };

  const getBatchLabel = (app) => {
    const parts = [app.sesname, app.prog_name, app.batchname].filter(Boolean);
    return parts.length ? `${parts[0]} - ${parts[1]} (${parts[2]})` : '—';
  };

  const getFormSubmitLabel = (value) => (value === 'yes' ? 'Submitted' : 'Not Submitted');

  // ─── API calls ─────────────────────────────────────────────────────────
  const loadBatchClasses = useCallback(async (batchId) => {
    try {
      const res = await fetchBatchClasses(batchId);
      const list = Array.isArray(res?.data) ? res.data : [];
      setBatchClasses(list);
    } catch (err) {
      console.error('Failed to load batch classes:', err);
      notify.error('Failed to load batch classes');
    }
  }, [notify]);

  const loadApplications = useCallback(async (filters = null) => {
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
    } catch (err) {
      console.error('Failed to load applications:', err);
      notify.error('Failed to load applications');
    } finally {
      setTableLoading(false);
    }
  }, [notify]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleBatchChange = async (e) => {
    const id = e.target.value;
    setPage(0);
    setFilter({ appBatchId: id, classId: '', search: '' });
    setBatchClasses([]);
    setApplications([]);
    setSelectedApplications(new Set());
    
    if (id) {
      await loadBatchClasses(id);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFilter((prev) => ({ ...prev, classId }));
    setApplications([]);
    setSelectedApplications(new Set());
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

  // ─── Batch processing modal handlers ───────────────────────────────────
  const openBatchModal = async (action) => {
    if (selectedApplications.size === 0) {
      notify.warning('Please select at least one application');
      return;
    }

    try {
      const programmesRes = await fetchProgrammes();
      const programmes = Array.isArray(programmesRes?.data) ? programmesRes.data : [];

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
      });
    } catch (err) {
      notify.error('Failed to load programmes');
    }
  };

  const handleProgrammeChange = async (e) => {
    const progId = e.target.value;
    setBatchModal((prev) => ({ ...prev, selectedProgramme: progId, selectedClass: '', selectedClassArm: '', classes: [], classArms: [] }));

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
    setBatchModal((prev) => ({ ...prev, selectedClass: classId, selectedClassArm: '', classArms: [] }));

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
    const { action, selectedProgramme, selectedClass, selectedClassArm, rejectionReason, revokedReason } = batchModal;

    // Validation
    if (action === 'admit' && (!selectedProgramme || !selectedClass || !selectedClassArm)) {
      notify.warning('Please select programme, class, and class arm for admission');
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

      await batchProcessAdmissions(payload);
      notify.success(`Successfully ${action === 'admit' ? 'admitted' : action === 'decline' ? 'declined' : 'revoked'} ${selectedApplications.size} application(s)`);
      
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
  const someSelected = selectedApplications.size > 0 && selectedApplications.size < applications.length;

  return (
    <Box>
      {/* ── Filters ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Admission Batch</InputLabel>
            <Select
              value={filter.appBatchId}
              label="Admission Batch"
              onChange={handleBatchChange}
            >
              <MenuItem value="">-- Select Batch --</MenuItem>
              {allBatches.map((batch) => (
                <MenuItem key={batch.batch_id} value={String(batch.batch_id)}>
                  {batch.sesname} - {batch.prog_name} ({batch.batchname})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small" disabled={!filter.appBatchId}>
            <InputLabel>Class</InputLabel>
            <Select
              value={filter.classId}
              label="Class"
              onChange={handleClassChange}
            >
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

        <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={handleFetch}
              disabled={tableLoading || !filter.appBatchId || !filter.classId}
            >
              {tableLoading ? 'Fetching...' : 'Filter'}
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              fullWidth
              onClick={() => openBatchModal('admit')}
              disabled={selectedApplications.size === 0}
            >
              Process All
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Action Buttons ────────────────────────────────────────────── */}
      {/* {applications.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => openBatchModal('admit')}
            disabled={selectedApplications.size === 0}
          >
            Admit Selected ({selectedApplications.size})
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => openBatchModal('decline')}
            disabled={selectedApplications.size === 0}
          >
            Decline Selected ({selectedApplications.size})
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => openBatchModal('revoke')}
            disabled={selectedApplications.size === 0}
          >
            Revoke Selected ({selectedApplications.size})
          </Button>
        </Stack>
      )} */}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB'
            }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '5%' }}>
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    disabled={applications.length === 0}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '5%' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '12%' }}>Form Number</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '23%' }}>Applicant's Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '20%' }}>Application Batch</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '12%' }} align="center">
                  Form Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '13%' }} align="center">
                  Admission Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
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
      </Paper>

      {/* ── Batch Processing Modal ────────────────────────────────────── */}
      <Dialog
        open={batchModal.open}
        onClose={handleCloseBatchModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Batch {batchModal.action === 'admit' ? 'Admission' : batchModal.action === 'decline' ? 'Decline' : 'Revocation'}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You are about to {batchModal.action} <strong>{selectedApplications.size}</strong> application(s).
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
                        {prog.programme_name}
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
                        {cls.class_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={!batchModal.selectedClass}>
                  <InputLabel>Class Arm *</InputLabel>
                  <Select
                    value={batchModal.selectedClassArm}
                    label="Class Arm *"
                    onChange={(e) => setBatchModal((prev) => ({ ...prev, selectedClassArm: e.target.value }))}
                  >
                    <MenuItem value="">-- Select Class Arm --</MenuItem>
                    {batchModal.classArms.map((arm) => (
                      <MenuItem key={arm.id} value={arm.id}>
                        {arm.arm_name}
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
                onChange={(e) => setBatchModal((prev) => ({ ...prev, rejectionReason: e.target.value }))}
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
                onChange={(e) => setBatchModal((prev) => ({ ...prev, revokedReason: e.target.value }))}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={handleCloseBatchModal} disabled={processing}>
            Cancel
          </Button>
          <Button
            size="small"
            color={batchModal.action === 'decline' || batchModal.action === 'revoke' ? 'error' : 'success'}
            onClick={handleConfirmBatchProcess}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Confirm ${batchModal.action === 'admit' ? 'Admission' : batchModal.action === 'decline' ? 'Decline' : 'Revocation'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchProcessingTab;
