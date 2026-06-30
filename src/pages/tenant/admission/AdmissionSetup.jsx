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
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import AdmissionLetterEditor from '@/components/tenant/admission/setup/AdmissionLetterEditor';
import {
  fetchSessions,
  fetchSessionTermsBySession,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import {
  fetchAdmissionBatches,
  toggleAdmissionBatchStatus,
  updateAdmissionBatch,
} from '@/api/tenant/admission/admissionApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Admission Setup' }];

// helper — safely extract array from various API response shapes
const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
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
  const [selectedSessionTermId, setSelectedSessionTermId] = useState(null);
  const [selectedSessionTermLabel, setSelectedSessionTermLabel] = useState('');

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
  const [letterEditorContent, setLetterEditorContent] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionTermId) {
      loadBatches(selectedSessionTermId);
    } else {
      setBatches([]);
    }
  }, [selectedSessionTermId]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetchSessions();
      const list = extractList(res);
      setSessions(list);
      if (list.length > 0) {
        setSelectedSessionId(list[0].id);
        await loadSessionTerms(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
      showSnackbar('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTerms = async (sessionId) => {
    try {
      const res = await fetchSessionTermsBySession(sessionId);
      const session_terms = extractList(res);
      setSessionTerms(session_terms);
      const selected = session_terms[0] ?? null;
      if (selected) {
        setSelectedSessionTermId(selected.id);
        setSelectedSessionTermLabel(
          `${selected.session.sesname} - ${selected.display_term.display_name}`,
        );
      } else {
        setSelectedSessionTermId(null);
        setSelectedSessionTermLabel('');
      }
    } catch (err) {
      console.error('Failed to load session terms', err);
      showSnackbar('Failed to load session terms', 'error');
    }
  };

  const loadBatches = async (termId) => {
    setBatchesLoading(true);
    try {
      const res = await fetchAdmissionBatches(termId);
      setBatches(extractList(res));
    } catch (err) {
      console.error('Failed to load batches', err);
      showSnackbar('Failed to load admission batches', 'error');
    } finally {
      setBatchesLoading(false);
    }
  };

  const handleSessionChange = (e) => {
    const id = Number(e.target.value);
    setSelectedSessionId(id);
    setSelectedSessionTermId(null);
    setSelectedSessionTermLabel('');
    setBatches([]);
    loadSessionTerms(id);
  };

  const handleTermSelect = (session_term) => {
    setSelectedSessionTermId(session_term.id);
    setSelectedSessionTermLabel(
      `${session_term.session.sesname} - ${session_term.display_term.display_name}`,
    );
  };

  const handleMenuOpen = (e, session_term) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuTerm(session_term);
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

  const handleToggleBatchStatus = async () => {
    const batch = confirmToggleBatch.batch;
    setConfirmToggleBatch({ open: false, batch: null });
    if (!batch) return;
    // Optimistic update
    const newStatus = batch.status === 'open' ? 'close' : 'open';
    setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, status: newStatus } : b)));
    try {
      await toggleAdmissionBatchStatus(batch.id);
      showSnackbar(`Batch ${newStatus === 'open' ? 'opened' : 'closed'} successfully`);
    } catch (err) {
      // Revert on failure
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: batch.status } : b)),
      );
      showSnackbar('Failed to update batch status', 'error');
    }
  };

  const handleSaveAdmissionLetter = async () => {
    if (!letterEditorBatch) return;

    try {
      const payload = {
        admission_letter_template: letterEditorContent,
      };

      await updateAdmissionBatch(letterEditorBatch.id, payload);

      // Update the batch in the local state
      setBatches((prev) =>
        prev.map((b) =>
          b.id === letterEditorBatch.id
            ? { ...b, admission_letter_template: letterEditorContent }
            : b,
        ),
      );

      showSnackbar('Admission letter saved successfully');
      setLetterEditorOpen(false);
    } catch (err) {
      console.error('Failed to save admission letter', err);
      showSnackbar('Failed to save admission letter', 'error');
    }
  };

  const handleCreateBatch = () => {
    navigate('/admission-setup/create-batch', {
      state: {
        sessionId: selectedSessionId,
        sessionTermId: selectedSessionTermId,
        sessionTermLabel: selectedSessionTermLabel,
      },
    });
  };

  const handleEditBatch = (batch) => {
    setBatchMenuAnchor(null);
    setMenuBatch(null);
    navigate(`/admission-setup/edit-batch/${batch.id}`, {
      state: {
        batch,
        sessionId: selectedSessionId,
        sessionTermId: selectedSessionTermId,
        sessionTermLabel: selectedSessionTermLabel,
      },
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
                  <Paper>
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
                          {sessionTerms.map((session_term, i) => {
                            const isSelected = selectedSessionTermId === session_term.id;
                            return (
                              <TableRow
                                key={session_term.id}
                                hover
                                selected={isSelected}
                                onClick={() => handleTermSelect(session_term)}
                                sx={{ cursor: 'pointer' }}
                              >
                                <TableCell>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: isSelected ? 700 : 400 }}>
                                  {session_term?.session?.sesname}{' '}
                                  {session_term?.display_term?.display_name}
                                </TableCell>
                                <TableCell align="center">
                                  {session_term?.is_subscribed === 'yes' ? (
                                    <StatusChip status={session_term?.status} />
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
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={{ xs: 1.5, sm: 0 }}
              >
                <Typography variant="h5">
                  Manage Admission Batches
                  {selectedSessionTermLabel && (
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
                        {selectedSessionTermLabel}
                      </Box>
                    </>
                  )}
                </Typography>
                <Button variant="contained" size="small" // startIcon={<AddIcon />}
                  disabled={!selectedSessionTermId}
                  onClick={handleCreateBatch}
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap', ml: { xs: 0, sm: 2 } }}
                >
                  Create New Admission
                </Button>
              </Box>
            }
          >
            {!selectedSessionTermId ? (
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
              <Paper>
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
                        {/* <TableCell align="center" sx={{ fontWeight: 700 }}>
                          App Instruction
                        </TableCell> */}
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

                          <TableCell sx={{ fontWeight: 600 }}>{batch.batch_name}</TableCell>

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
                          {/* <TableCell align="center">
                            <ViewEditPair onView={() => { }} onEdit={() => { }} />
                          </TableCell> */}

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
          <Button variant="contained" size="small" onClick={() => setConfirmToggleBatch({ open: false, batch: null })}>
            Cancel
          </Button>
          <Button variant="contained" size="small" color={confirmToggleBatch.batch?.status === 'open' ? 'error' : 'success'} onClick={handleToggleBatchStatus}>
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
            {selectedSessionTermLabel && (
              <Typography variant="caption" color="text.secondary">
                {selectedSessionTermLabel}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          <AdmissionLetterEditor
            key={`${letterEditorBatch?.id}-${letterEditorReadOnly}`}
            initialContent={letterEditorBatch?.admission_letter_template ?? ''}
            readOnly={letterEditorReadOnly}
            onChange={(html) => {
              setLetterEditorContent(html);
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="contained" size="small" onClick={() => setLetterEditorOpen(false)} color="inherit">
            {letterEditorReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!letterEditorReadOnly && (
            <Button variant="contained" size="small" onClick={handleSaveAdmissionLetter} sx={{ fontWeight: 700 }}>
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
