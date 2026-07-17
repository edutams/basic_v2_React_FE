import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  IconDotsVertical,
  IconNote,
  IconEdit,
  IconEye,
  IconHistory,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useNotification } from '@/hooks/useNotification';
import {
  fetchApplications,
  acceptAdmissionOffer,
  resetAdmissionOffer,
} from '@/api/tenant/admission/admissionProcessingApi';

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

const IndividualProcessingTab = ({ allBatches, onDataChange }) => {
  const navigate = useNavigate();
  const notify = useNotification();

  // ─── Data state ────────────────────────────────────────────────────────
  const [applications, setApplications] = useState([]);

  // ─── Loading state ─────────────────────────────────────────────────────
  const [tableLoading, setTableLoading] = useState(false);

  // ─── Filter state ──────────────────────────────────────────────────────
  const [filter, setFilter] = useState({ appBatchId: '', search: '' });
  const [batchName, setBatchName] = useState('');

  // ─── Pagination state ──────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [meta, setMeta] = useState(null);

  // ─── Menu state ────────────────────────────────────────────────────────
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  // ─── Confirm dialog state ──────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '', // 'accept-offer' | 'reset-offer'
    app: null,
    title: '',
    message: '',
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
  const loadApplications = useCallback(async (filters = null, url = null) => {
    setTableLoading(true);
    try {
      const res = await fetchApplications(filters, url);
      const data = res?.data ?? res ?? [];
      setApplications(Array.isArray(data) ? data : []);
      setMeta(res?.meta ?? res?.pagination ?? null);
    } catch (err) {
      console.error('Failed to load applications:', err);
      notify.error('Failed to load applications');
    } finally {
      setTableLoading(false);
    }
  }, [notify]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleBatchChange = (e) => {
    const id = e.target.value;
    const found = allBatches.find((b) => Number(b.batch_id) === Number(id));
    setBatchName(found ? `${found.sesname} - ${found.prog_name} (${found.batchname})` : '');
    setPage(0);
    setFilter((prev) => ({ ...prev, appBatchId: id }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilter((prev) => ({ ...prev, search: value }));
  };

  const handleSearchKeyUp = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      setFilter((prev) => ({ ...prev, search: e.target.value }));
    }
  };

  const handleFetch = () => {
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

  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  // ─── Confirm dialog handlers ───────────────────────────────────────────
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
        const payload = {
          form_number: app.form_number,
          status: 'no',
          fname: app.fname,
          lname: app.lname,
          mname: app.mname || '',
          batchname: app.batchname,
          prog_name: app.prog_name,
          sesname: app.sesname,
        };
        await resetAdmissionOffer(payload);
        notify.success('Admission offer reset successfully');
      }
      loadApplications(filter);
      if (onDataChange) onDataChange();
    } catch (err) {
      notify.error(err?.response?.data?.message || `Failed to ${type === 'accept-offer' ? 'accept' : 'reset'} admission offer`);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  // ─── Conditional checks for menu items ────────────────────────────────
  const canAcceptOffer = (app) =>
    app?.admission_status === 'admitted' && (app?.accept_admission_offer === 'no' || app?.accept_admission_offer == null);

  const canResetOffer = (app) => app?.accept_admission_offer === 'yes';

  return (
    <Box>
      {/* ── Filters ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Admission Batch</InputLabel>
            <Select
              value={filter.appBatchId}
              label="Admission Batch"
              onChange={handleBatchChange}
            >
              <MenuItem value="">-- Select Admission --</MenuItem>
              {allBatches.map((batch) => (
                <MenuItem key={batch.batch_id} value={String(batch.batch_id)}>
                  {batch.sesname} - {batch.prog_name} ({batch.batchname})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Name Filter"
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

        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={handleFetch}
            disabled={tableLoading}
            sx={{ fontWeight: 600 }}
          >
            {tableLoading ? 'Fetching...' : 'Fetch'}
          </Button>
        </Grid>
      </Grid>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Box variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB'
            }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '4%' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '9%' }}>Form Number</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%' }}>Applicant's Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%' }}>Guardian's Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '16%' }}>Application Batch</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '9%' }} align="center">
                  Form Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '9%' }} align="center">
                  Admission Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '9%' }} align="center">
                  Accept Offer
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '4%' }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : applications.length > 0 ? (
                applications.map((app, index) => (
                  <TableRow key={app.form_number || index} hover>
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
                      <Chip
                        label={app.accept_admission_offer === 'yes' ? 'Yes' : 'No'}
                        size="small"
                        color={offerColors[app.accept_admission_offer] || 'default'}
                        variant={app.accept_admission_offer === 'yes' ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, fontSize: 11, minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, app)}
                      >
                        <IconDotsVertical size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="h6" color="text.secondary" fontWeight={500}>
                        No record found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                        {filter.search
                          ? 'Try adjusting your search terms.'
                          : filter.appBatchId
                            ? 'No applications for the selected batch.'
                            : 'Select an admission batch to view applications.'}
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

      {/* ── Row Action Menu ──────────────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* Process Application Form */}
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

        {/* Edit Application Form */}
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

        {/* View Application Form */}
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

        {/* View Payment History */}
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

        {/* Accept Admission Offer */}
        {activeRow && canAcceptOffer(activeRow) && (
          <MenuItem
            onClick={() => openConfirmAcceptOffer(activeRow)}
            sx={{ color: 'success.main' }}
          >
            <IconCheck size={18} style={{ marginRight: 12 }} />
            Accept Admission Offer
          </MenuItem>
        )}

        {/* Reverse Admission Offer */}
        {activeRow && canResetOffer(activeRow) && (
          <MenuItem
            onClick={() => openConfirmResetOffer(activeRow)}
            sx={{ color: 'error.main' }}
          >
            <IconX size={18} style={{ marginRight: 12 }} />
            Reverse Admission Offer
          </MenuItem>
        )}
      </Menu>

      {/* ── Confirmation Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelConfirm}
        maxWidth="xs"
        fullWidth
      >
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
    </Box>
  );
};

export default IndividualProcessingTab;
