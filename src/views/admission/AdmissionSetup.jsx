import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { IconEye, IconPencil } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import admissionSetupApi from 'src/api/admissionSetupApi';
import { fetchCurrentSession, fetchSessionTerms } from 'src/api/sessionTermApi';
import CreateAdmissionBatchModal from 'src/components/tenant-components/admission/setup/CreateAdmissionBatchModal';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Admission Setup' },
];

// ── Status chip helper ────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        bgcolor: isActive ? '#dcfce7' : '#fee2e2',
        color: isActive ? '#166534' : '#991b1b',
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
};

// ── Batch status chip ─────────────────────────────────────────────────────────
const BatchStatusChip = ({ status }) => {
  const isOpen = status === 'open';
  return (
    <Chip
      label={isOpen ? 'Open' : 'Close'}
      size="small"
      sx={{
        bgcolor: isOpen ? '#166534' : '#991b1b',
        color: '#fff',
        fontWeight: 700,
        fontSize: 11,
        minWidth: 52,
      }}
    />
  );
};

// ── Yes/No pill ───────────────────────────────────────────────────────────────
const YesNoPill = ({ value }) => (
  <Chip
    label={value ? 'Yes' : 'No'}
    size="small"
    sx={{
      bgcolor: value ? '#166534' : '#f97316',
      color: '#fff',
      fontWeight: 700,
      fontSize: 11,
      minWidth: 36,
    }}
  />
);

// ── Fee pills ─────────────────────────────────────────────────────────────────
const FeePills = ({ requirePayment, appFee, acceptanceFee }) => {
  if (!requirePayment) return <YesNoPill value={false} />;
  return (
    <Stack spacing={0.5}>
      <YesNoPill value />
      {appFee > 0 && (
        <Chip
          label={`Application Fee ₦${Number(appFee).toLocaleString()}`}
          size="small"
          sx={{ bgcolor: '#166534', color: '#fff', fontWeight: 600, fontSize: 10 }}
        />
      )}
      {acceptanceFee > 0 && (
        <Chip
          label={`Acceptance Fee ₦${Number(acceptanceFee).toLocaleString()}`}
          size="small"
          sx={{ bgcolor: '#166534', color: '#fff', fontWeight: 600, fontSize: 10 }}
        />
      )}
    </Stack>
  );
};

// ── View/Edit icon pair ───────────────────────────────────────────────────────
const ViewEditPair = ({ onView, onEdit }) => (
  <Stack direction="row" spacing={0.5}>
    <Tooltip title="View">
      <IconButton
        size="small"
        onClick={onView}
        sx={{ bgcolor: 'primary.light', borderRadius: 1, p: 0.5 }}
      >
        <IconEye size={14} color="#1976d2" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Edit">
      <IconButton
        size="small"
        onClick={onEdit}
        sx={{ bgcolor: '#e8f5e9', borderRadius: 1, p: 0.5 }}
      >
        <IconPencil size={14} color="#2e7d32" />
      </IconButton>
    </Tooltip>
  </Stack>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AdmissionSetup = () => {
  // ── Session / term state ──────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [selectedTermLabel, setSelectedTermLabel] = useState('');

  // ── Batches state ─────────────────────────────────────────────────────────
  const [batches, setBatches] = useState([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTerm, setMenuTerm] = useState(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [editBatch, setEditBatch] = useState(null);

  // ── Confirm dialogs ───────────────────────────────────────────────────────
  const [confirmToggleBatch, setConfirmToggleBatch] = useState({ open: false, batch: null });

  // ── Load sessions on mount ────────────────────────────────────────────────
  useEffect(() => {
    loadSessions();
  }, []);

  // ── Load batches when selected term changes ───────────────────────────────
  useEffect(() => {
    if (selectedTermId) {
      loadBatches(selectedTermId);
    } else {
      setBatches([]);
    }
  }, [selectedTermId]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await fetchCurrentSession();
      if (res.status && res.data.length > 0) {
        setSessions(res.data);
        const firstId = res.data[0].id;
        setSelectedSessionId(firstId);
        await loadSessionTerms(firstId);
      }
    } catch {
      showSnackbar('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTerms = async (sessionId) => {
    try {
      const res = await fetchSessionTerms(sessionId);
      if (res.status) {
        setSessionTerms(res.data);
        // Auto-select the active term
        const active = res.data.find((t) => t.status === 'active');
        if (active) {
          setSelectedTermId(active.session_term_id);
          setSelectedTermLabel(active.display_name);
        } else if (res.data.length > 0) {
          setSelectedTermId(res.data[0].session_term_id);
          setSelectedTermLabel(res.data[0].display_name);
        }
      }
    } catch {
      showSnackbar('Failed to load session terms', 'error');
    }
  };

  const loadBatches = async (termId) => {
    try {
      setBatchesLoading(true);
      const res = await admissionSetupApi.getBatchesByTerm(termId);
      if (res.status) {
        setBatches(res.data);
      }
    } catch {
      // Silently handle — batches may not exist yet
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  };

  // ── Session change ────────────────────────────────────────────────────────
  const handleSessionChange = (e) => {
    const id = e.target.value;
    setSelectedSessionId(id);
    setSelectedTermId(null);
    setSelectedTermLabel('');
    setBatches([]);
    loadSessionTerms(id);
  };

  // ── Term row click ────────────────────────────────────────────────────────
  const handleTermSelect = (term) => {
    setSelectedTermId(term.session_term_id);
    setSelectedTermLabel(term.display_name);
  };

  // ── Term action menu ──────────────────────────────────────────────────────
  const handleMenuOpen = (e, term) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuTerm(term);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTerm(null);
  };

  // ── Batch toggle status ───────────────────────────────────────────────────
  const handleToggleBatchStatus = async () => {
    const batch = confirmToggleBatch.batch;
    setConfirmToggleBatch({ open: false, batch: null });
    if (!batch) return;
    try {
      setBatchesLoading(true);
      const res = await admissionSetupApi.toggleBatchStatus(batch.id);
      if (res.status) {
        showSnackbar(`Batch ${batch.status === 'open' ? 'closed' : 'opened'} successfully`);
        loadBatches(selectedTermId);
      } else {
        showSnackbar(res.message || 'Failed to update batch status', 'error');
      }
    } catch {
      showSnackbar('Failed to update batch status', 'error');
    } finally {
      setBatchesLoading(false);
    }
  };

  // ── Batch created / updated callback ─────────────────────────────────────
  const handleBatchSaved = () => {
    setCreateBatchOpen(false);
    setEditBatch(null);
    if (selectedTermId) loadBatches(selectedTermId);
  };

  return (
    <PageContainer title="Admission Setup" description="Manage admission batches">
      {/* ── Breadcrumb ── */}
      <Breadcrumb title="Admission Setup" items={BCrumb} />

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── LEFT: Manage Admissions ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ParentCard title="Manage Admissions">
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                {/* Session term dropdown */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Select Session Term"
                    value={selectedSessionId}
                    onChange={handleSessionChange}
                    size="small"
                  >
                    {sessions.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.sesname}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Session terms table */}
                {sessionTerms.length === 0 ? (
                  <Alert severity="info">No session terms found.</Alert>
                ) : (
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Session</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                              Status
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sessionTerms.map((term, i) => {
                            const isSelected = selectedTermId === term.session_term_id;
                            return (
                              <TableRow
                                key={term.session_term_id ?? term.app_term_id}
                                hover
                                selected={isSelected}
                                onClick={() => handleTermSelect(term)}
                                sx={{ cursor: 'pointer' }}
                              >
                                <TableCell>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: isSelected ? 700 : 400 }}>
                                  {term.display_name}
                                </TableCell>
                                <TableCell align="center">
                                  {term.is_subscribed === 'yes' ? (
                                    <StatusChip status={term.status} />
                                  ) : (
                                    <Typography variant="caption" color="text.disabled">
                                      —
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, term)}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </>
            )}
          </ParentCard>
        </Grid>

        {/* ── RIGHT: Manage Admission Batches ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">
                  Manage Admission Batches
                  {selectedTermLabel ? ` For ${selectedTermLabel}` : ''}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  disabled={!selectedTermId}
                  onClick={() => setCreateBatchOpen(true)}
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap', ml: 2 }}
                >
                  Create New Admission
                </Button>
              </Box>
            }
          >
            {!selectedTermId ? (
              <Alert severity="info">Select a session term on the left to manage batches.</Alert>
            ) : batchesLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={28} />
              </Box>
            ) : batches.length === 0 ? (
              <Alert severity="info">
                No admission batches yet for this term. Click &quot;Create New Admission&quot; to
                add one.
              </Alert>
            ) : (
              <Paper variant="outlined">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Batch Name</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Entrance Exam
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Require Payment
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          App Instruction
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Admission Letter
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {batches.map((batch, i) => (
                        <TableRow key={batch.id} hover>
                          <TableCell>{i + 1}</TableCell>

                          <TableCell sx={{ fontWeight: 600 }}>
                            {batch.batch_name ?? `Batch ${i + 1}`}
                          </TableCell>

                          {/* Entrance Exam */}
                          <TableCell align="center">
                            {batch.has_entrance_exam ? (
                              <Chip
                                label="Set E-Exam"
                                size="small"
                                sx={{
                                  bgcolor: '#166534',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: 10,
                                }}
                              />
                            ) : (
                              <YesNoPill value={false} />
                            )}
                          </TableCell>

                          {/* Require Payment */}
                          <TableCell align="center">
                            <FeePills
                              requirePayment={batch.require_payment}
                              appFee={batch.application_fee}
                              acceptanceFee={batch.acceptance_fee}
                            />
                          </TableCell>

                          {/* App Instruction */}
                          <TableCell align="center">
                            <ViewEditPair
                              onView={() => {}}
                              onEdit={() => {}}
                            />
                          </TableCell>

                          {/* Admission Letter */}
                          <TableCell align="center">
                            <ViewEditPair
                              onView={() => {}}
                              onEdit={() => {}}
                            />
                          </TableCell>

                          {/* Status */}
                          <TableCell align="center">
                            <BatchStatusChip status={batch.status} />
                          </TableCell>

                          {/* Action */}
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditBatch(batch);
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </ParentCard>
        </Grid>
      </Grid>

      {/* ── Term action menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            handleTermSelect(menuTerm);
            handleMenuClose();
          }}
        >
          View Batches
        </MenuItem>
      </Menu>

      {/* ── Batch action menu (edit row) ── */}
      {editBatch && (
        <Menu
          anchorEl={null}
          open={Boolean(editBatch)}
          onClose={() => setEditBatch(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              setCreateBatchOpen(true);
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Batch
          </MenuItem>
          <MenuItem
            onClick={() => {
              setConfirmToggleBatch({ open: true, batch: editBatch });
              setEditBatch(null);
            }}
            sx={{ color: editBatch?.status === 'open' ? 'error.main' : 'success.main' }}
          >
            {editBatch?.status === 'open' ? 'Close Batch' : 'Open Batch'}
          </MenuItem>
        </Menu>
      )}

      {/* ── Create / Edit Batch Modal ── */}
      <CreateAdmissionBatchModal
        open={createBatchOpen || Boolean(editBatch && createBatchOpen)}
        onClose={() => {
          setCreateBatchOpen(false);
          setEditBatch(null);
        }}
        sessionTermId={selectedTermId}
        sessionTermLabel={selectedTermLabel}
        batch={editBatch}
        onSaved={handleBatchSaved}
      />

      {/* ── Toggle batch status confirmation ── */}
      <Dialog
        open={confirmToggleBatch.open}
        onClose={() => setConfirmToggleBatch({ open: false, batch: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmToggleBatch.batch?.status === 'open' ? 'Close Batch' : 'Open Batch'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            <strong>
              {confirmToggleBatch.batch?.status === 'open' ? 'close' : 'open'}
            </strong>{' '}
            <strong>{confirmToggleBatch.batch?.batch_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setConfirmToggleBatch({ open: false, batch: null })}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color={confirmToggleBatch.batch?.status === 'open' ? 'error' : 'success'}
            onClick={handleToggleBatchStatus}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AdmissionSetup;
