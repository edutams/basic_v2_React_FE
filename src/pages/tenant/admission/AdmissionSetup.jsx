import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { MoreVert as MoreVertIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { IconEye, IconPencil } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import AdmissionLetterEditor from '@/components/tenant/admission/setup/AdmissionLetterEditor';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Admission Setup' }];

const DUMMY_SESSIONS = [
  { id: 1, sesname: '2025/2026' },
  { id: 2, sesname: '2024/2025' },
];

const DUMMY_SESSION_TERMS = {
  1: [
    {
      session_term_id: 101,
      app_term_id: 1,
      display_name: '2025/2026 First Term',
      status: 'active',
      is_subscribed: 'yes',
    },
    {
      session_term_id: 102,
      app_term_id: 2,
      display_name: '2025/2026 Second Term',
      status: 'inactive',
      is_subscribed: 'yes',
    },
    {
      session_term_id: 103,
      app_term_id: 3,
      display_name: '2025/2026 Third Term',
      status: 'inactive',
      is_subscribed: 'yes',
    },
  ],
  2: [
    {
      session_term_id: 201,
      app_term_id: 1,
      display_name: '2024/2025 First Term',
      status: 'inactive',
      is_subscribed: 'yes',
    },
    {
      session_term_id: 202,
      app_term_id: 2,
      display_name: '2024/2025 Second Term',
      status: 'inactive',
      is_subscribed: 'yes',
    },
  ],
};

const DUMMY_BATCHES = {
  101: [
    {
      id: 1,
      batch_name: 'Batch 1',
      has_entrance_exam: false,
      require_payment: true,
      application_fee: 5000,
      acceptance_fee: 15000,
      app_instruction: 'Fill all fields carefully.',
      admission_letter_template: '',
      status: 'close',
    },
    {
      id: 2,
      batch_name: 'Batch 2',
      has_entrance_exam: false,
      require_payment: true,
      application_fee: 5000,
      acceptance_fee: 15000,
      app_instruction: '',
      admission_letter_template: '',
      status: 'close',
    },
    {
      id: 3,
      batch_name: 'Batch 3',
      has_entrance_exam: true,
      require_payment: true,
      application_fee: 5000,
      acceptance_fee: 15000,
      app_instruction: '',
      admission_letter_template: '',
      status: 'open',
    },
    {
      id: 4,
      batch_name: 'Batch 4',
      has_entrance_exam: true,
      require_payment: true,
      application_fee: 5000,
      acceptance_fee: 15000,
      app_instruction: '',
      admission_letter_template: '',
      status: 'open',
    },
    {
      id: 5,
      batch_name: 'Batch 5',
      has_entrance_exam: true,
      require_payment: true,
      application_fee: 5000,
      acceptance_fee: 15000,
      app_instruction: '',
      admission_letter_template: '',
      status: 'open',
    },
  ],
  102: [],
};

const StatusChip = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        bgcolor: isActive ? 'success.light' : 'error.light',
        color: isActive ? 'success.dark' : 'error.dark',
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
};
const BatchStatusChip = ({ status }) => {
  const isOpen = status === 'open';
  return (
    <Chip
      label={isOpen ? 'Open' : 'Close'}
      size="small"
      sx={{
        bgcolor: isOpen ? 'success.light' : 'error.light',
        color: isOpen ? 'success.dark' : 'error.dark',
        fontWeight: 700,
        fontSize: 11,
        minWidth: 52,
      }}
    />
  );
};

const YesNoPill = ({ value }) => (
  <Chip
    label={value ? 'Yes' : 'No'}
    size="small"
    sx={{
      bgcolor: value ? 'primary.light' : 'warning.light',
      color: value ? 'primary.main' : 'warning.main',
      fontWeight: 700,
      fontSize: 11,
      minWidth: 36,
    }}
  />
);

const FeePills = ({ requirePayment, appFee, acceptanceFee }) => {
  if (!requirePayment) return <YesNoPill value={false} />;
  return (
    <Stack spacing={0.5}>
      <YesNoPill value />
      {appFee > 0 && (
        <Chip
          label={`Application Fee ₦${Number(appFee).toLocaleString()}`}
          size="small"
          sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 10 }}
        />
      )}
      {acceptanceFee > 0 && (
        <Chip
          label={`Acceptance Fee ₦${Number(acceptanceFee).toLocaleString()}`}
          size="small"
          sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 10 }}
        />
      )}
    </Stack>
  );
};

const ViewEditPair = ({ onView, onEdit }) => (
  <Stack direction="row" spacing={0.5}>
    <Tooltip title="View">
      <IconButton
        size="small"
        onClick={onView}
        sx={{
          bgcolor: 'primary.light',
          color: 'primary.main',
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconEye size={14} sx={{ color: 'primary.main' }} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Edit">
      <IconButton
        size="small"
        onClick={onEdit}
        sx={{
          bgcolor: 'success.light',
          color: 'success.main',
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconPencil size={14} />
      </IconButton>
    </Tooltip>
  </Stack>
);

const AdmissionSetup = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [selectedTermLabel, setSelectedTermLabel] = useState('');

  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTerm, setMenuTerm] = useState(null);

  const [batchMenuAnchor, setBatchMenuAnchor] = useState(null);
  const [menuBatch, setMenuBatch] = useState(null);

  const [confirmToggleBatch, setConfirmToggleBatch] = useState({ open: false, batch: null });

  const [letterEditorOpen, setLetterEditorOpen] = useState(false);
  const [letterEditorBatch, setLetterEditorBatch] = useState(null);
  const [letterEditorReadOnly, setLetterEditorReadOnly] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedTermId) {
      loadBatches(selectedTermId);
    } else {
      setBatches([]);
    }
  }, [selectedTermId]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadSessions = () => {
    setLoading(true);
    setTimeout(() => {
      setSessions(DUMMY_SESSIONS);
      setSelectedSessionId(DUMMY_SESSIONS[0].id);
      loadSessionTerms(DUMMY_SESSIONS[0].id);
      setLoading(false);
    }, 300);
  };

  const loadSessionTerms = (sessionId) => {
    const terms = DUMMY_SESSION_TERMS[sessionId] ?? [];
    setSessionTerms(terms);
    const active = terms.find((t) => t.status === 'active');
    const first = terms[0];
    const selected = active ?? first ?? null;
    if (selected) {
      setSelectedTermId(selected.session_term_id);
      setSelectedTermLabel(selected.display_name);
    } else {
      setSelectedTermId(null);
      setSelectedTermLabel('');
    }
  };

  const loadBatches = (termId) => {
    setBatchesLoading(true);
    setTimeout(() => {
      setBatches(DUMMY_BATCHES[termId] ?? []);
      setBatchesLoading(false);
    }, 200);
  };

  const handleSessionChange = (e) => {
    const id = Number(e.target.value);
    setSelectedSessionId(id);
    setSelectedTermId(null);
    setSelectedTermLabel('');
    setBatches([]);
    loadSessionTerms(id);
  };

  const handleTermSelect = (term) => {
    setSelectedTermId(term.session_term_id);
    setSelectedTermLabel(term.display_name);
  };

  const handleMenuOpen = (e, term) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuTerm(term);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTerm(null);
  };

  const handleToggleTermStatus = () => {
    if (!menuTerm) return;
    setSessionTerms((prev) =>
      prev.map((term) =>
        term.session_term_id === menuTerm.session_term_id
          ? { ...term, status: term.status === 'active' ? 'inactive' : 'active' }
          : term,
      ),
    );
    showSnackbar(
      `Term ${menuTerm.display_name} ${menuTerm.status === 'active' ? 'deactivated' : 'activated'} successfully`,
      'success',
    );
    handleMenuClose();
  };

  const handleToggleBatchStatus = () => {
    const batch = confirmToggleBatch.batch;
    setConfirmToggleBatch({ open: false, batch: null });
    if (!batch) return;
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batch.id ? { ...b, status: b.status === 'open' ? 'close' : 'open' } : b,
      ),
    );
    showSnackbar(`Batch ${batch.status === 'open' ? 'closed' : 'opened'} successfully`);
  };

  const handleCreateBatch = () => {
    navigate('/admission-setup/create-batch', {
      state: { termId: selectedTermId, termLabel: selectedTermLabel },
    });
  };

  const handleEditBatch = (batch) => {
    setBatchMenuAnchor(null);
    setMenuBatch(null);
    navigate(`/admission-setup/edit-batch/${batch.id}`, {
      state: { batch, termId: selectedTermId, termLabel: selectedTermLabel },
    });
  };

  return (
    <PageContainer title="Admission Setup" description="Manage admission batches">
      <Breadcrumb title="Admission Setup" items={BCrumb} />

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 4 }}>
          <ParentCard title="Manage Admissions">
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
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
                                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, term)}>
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

        <Grid size={{ xs: 12, md: 8 }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">
                  Manage Admission Batches
                  {selectedTermLabel && (
                    <>
                      {' '}
                      For{' '}
                      <Box
                        component="span"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                        }}
                      >
                        {selectedTermLabel}
                      </Box>
                    </>
                  )}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  disabled={!selectedTermId}
                  onClick={handleCreateBatch}
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
              <Alert
                severity="info"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                No admission batches yet for this term. Click "Create New Admission" to add one.
              </Alert>
            ) : (
              <Paper variant="outlined">
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
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
                                  bgcolor: 'success.light',
                                  color: 'success.dark',
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
                            <ViewEditPair onView={() => {}} onEdit={() => {}} />
                          </TableCell>

                          {/* Admission Letter */}
                          <TableCell align="center">
                            <ViewEditPair
                              onView={() => {
                                setLetterEditorBatch(batch);
                                setLetterEditorReadOnly(true);
                                setLetterEditorOpen(true);
                              }}
                              onEdit={() => {
                                setLetterEditorBatch(batch);
                                setLetterEditorReadOnly(false);
                                setLetterEditorOpen(true);
                              }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <BatchStatusChip status={batch.status} />
                          </TableCell>

                          {/* Action */}
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBatchMenuAnchor(e.currentTarget);
                                setMenuBatch(batch);
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
        <MenuItem
          sx={{ color: menuTerm?.status === 'active' ? 'error.main' : 'success.main' }}
          onClick={handleToggleTermStatus}
        >
          {menuTerm?.status === 'active' ? 'Deactivate Term' : 'Activate Term'}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={batchMenuAnchor}
        open={Boolean(batchMenuAnchor)}
        onClose={() => {
          setBatchMenuAnchor(null);
          setMenuBatch(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleEditBatch(menuBatch)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Batch
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmToggleBatch({ open: true, batch: menuBatch });
            setBatchMenuAnchor(null);
            setMenuBatch(null);
          }}
          sx={{ color: menuBatch?.status === 'open' ? 'error.main' : 'success.main' }}
        >
          {menuBatch?.status === 'open' ? 'Close Batch' : 'Open Batch'}
        </MenuItem>
      </Menu>

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
            <Box component="span">
              {confirmToggleBatch.batch?.status === 'open' ? 'close' : 'open'}
            </Box>{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {confirmToggleBatch.batch?.batch_name}
            </Box>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setConfirmToggleBatch({ open: false, batch: null })}>
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

      <Dialog
        open={letterEditorOpen}
        onClose={() => setLetterEditorOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {letterEditorReadOnly ? 'View' : 'Edit'} Admission Letter —{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {letterEditorBatch?.batch_name ?? ''}
              </Box>
            </Typography>
            {selectedTermLabel && (
              <Typography variant="caption" color="text.secondary">
                {selectedTermLabel}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          <AdmissionLetterEditor
            key={`${letterEditorBatch?.id}-${letterEditorReadOnly}`}
            readOnly={letterEditorReadOnly}
            onChange={(html) => {
              console.log('Letter content for batch', letterEditorBatch?.id, html);
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setLetterEditorOpen(false)} color="inherit">
            {letterEditorReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!letterEditorReadOnly && (
            <Button
              variant="contained"
              onClick={() => {
                showSnackbar('Admission letter saved successfully');
                setLetterEditorOpen(false);
              }}
              sx={{ fontWeight: 700 }}
            >
              Save Letter
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
