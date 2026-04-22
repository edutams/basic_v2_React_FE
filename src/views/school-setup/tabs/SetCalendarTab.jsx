import React, { useState, useMemo, useEffect } from 'react';
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
  TableFooter,
  TablePagination,
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
} from '@mui/material';
import { IconDotsVertical, IconPlus } from '@tabler/icons-react';
import { Add as AddIcon } from '@mui/icons-material';
import ParentCard from 'src/components/shared/ParentCard';
import {
  fetchCurrentSession,
  fetchSessionTerms,
  updateDisplayName,
  subscribeSessionTerm,
  fetchTerms,
  toggleSessionTermStatus,
} from '../../../api/sessionTermApi';
import {
  fetchWeeks,
  autoGenerateWeeks,
  addWeek,
  deleteWeek,
  toggleWeekStatus,
  saveWeeks,
} from '../../../api/weekApi';

const SetCalendarTab = ({ onSaveAndContinue }) => {
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = () => {
    setHasChanges(true);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  // Pagination state for Terms table
  const [termsPage, setTermsPage] = useState(0);
  const [termsRowsPerPage, setTermsRowsPerPage] = useState(5);

  // Pagination state for Weeks table
  const [weeksPage, setWeeksPage] = useState(0);
  const [weeksRowsPerPage, setWeeksRowsPerPage] = useState(5);

  // Session and session terms state
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Confirmation Dialogues
  const [confirmSubscribe, setConfirmSubscribe] = useState({ open: false, term: null });
  const [confirmStatus, setConfirmStatus] = useState({ open: false, term: null });

  // Week Management states
  const [weeks, setWeeks] = useState([]);
  const [allLandlordTerms, setAllLandlordTerms] = useState([]);
  const [selectedAppTermId, setSelectedAppTermId] = useState('');
  const [autoGenerateConfig, setAutoGenerateConfig] = useState({
    startDate: '',
    numWeeks: 15,
  });
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch Current Sessions (where is_current is yes)
      const sessionRes = await fetchCurrentSession();
      if (sessionRes.status && sessionRes.data.length > 0) {
        setSessions(sessionRes.data);
        // Preselect the first current session
        const initialSessionId = sessionRes.data[0].id;
        setSelectedSessionId(initialSessionId);
        setCurrentSession(sessionRes.data[0]);

        // Load terms for this session
        await loadSessionTerms(initialSessionId);
      }

      // Fetch all landlord terms for the dropdown
      const termsRes = await fetchTerms();
      if (termsRes.status) {
        setAllLandlordTerms(termsRes.data);
      }
    } catch (error) {
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTerms = async (sessionId) => {
    try {
      const termsRes = await fetchSessionTerms(sessionId);
      if (termsRes.status) {
        setSessionTerms(termsRes.data);
        // Find if there's an active session term to load weeks automatically
        const activeST = termsRes.data.find((t) => t.status === 'active');
        if (activeST && activeST.session_term_id) {
          setActiveSessionTermId(activeST.session_term_id);
          loadWeeksData(activeST.session_term_id);
        } else {
          setActiveSessionTermId(null);
          setWeeks([]);
        }
      }
    } catch (error) {
      showSnackbar('Failed to load session terms', 'error');
    }
  };

  const loadWeeksData = async (stId) => {
    if (!stId) return;
    try {
      const weeksRes = await fetchWeeks(stId);
      if (weeksRes.status) {
        setWeeks(weeksRes.data);
      }
    } catch (error) {
      showSnackbar('Failed to load weeks', 'error');
    }
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle edit term name
  const handleOpenEditModal = () => {
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTerm(null);
    setDisplayName('');
  };

  const handleSaveDisplayName = async () => {
    if (!selectedAppTermId || !displayName.trim()) {
      showSnackbar('Term and Display name are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await updateDisplayName(selectedAppTermId, displayName);
      if (response.status) {
        showSnackbar('Display name updated successfully', 'success');
        handleCloseEditModal();
        loadSessionTerms(selectedSessionId);
      } else {
        showSnackbar(response.message || 'Failed to update display name', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update display name', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    setSelectedSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    setCurrentSession(session);
    loadSessionTerms(sessionId);
  };

  // Handle subscribe click (shows confirmation)
  const handleSubscribeClick = (term) => {
    setConfirmSubscribe({ open: true, term });
  };

  const handleConfirmSubscribe = async () => {
    const term = confirmSubscribe.term;
    setConfirmSubscribe({ open: false, term: null });

    if (!selectedSessionId || !term) return;

    try {
      setLoading(true);
      const response = await subscribeSessionTerm(selectedSessionId, term.app_term_id);
      if (response.status) {
        showSnackbar('Subscribed successfully', 'success');
        loadSessionTerms(selectedSessionId);
      } else {
        showSnackbar(response.message || 'Failed to subscribe', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to subscribe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatusClick = (term) => {
    setConfirmStatus({ open: true, term });
  };

  const handleConfirmToggleStatus = async () => {
    const term = confirmStatus.term;
    setConfirmStatus({ open: false, term: null });

    if (!term || !term.session_term_id) return;

    try {
      setLoading(true);
      const response = await toggleSessionTermStatus(term.session_term_id);

      const isSuccess =
        response.status === true && (!response.data || response.data.status !== false);

      if (isSuccess) {
        showSnackbar(
          `Term ${term.status === 'active' ? 'deactivated' : 'activated'} successfully`,
          'success',
        );
        loadSessionTerms(selectedSessionId);
      } else {
        const errorMessage =
          response.data?.original?.message ||
          response.data?.message ||
          response.message ||
          'Failed to update status';

        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to update status',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };
  // Week Logic
  const handleAutoGenerate = async () => {
    if (!activeSessionTermId || !autoGenerateConfig.startDate) {
      showSnackbar('Set start date first', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await autoGenerateWeeks(activeSessionTermId, {
        start_date: autoGenerateConfig.startDate,
        num_weeks: autoGenerateConfig.numWeeks,
      });
      if (response.status) {
        setWeeks(response.data);
        showSnackbar('Weeks generated successfully', 'success');
        // Refresh session terms to update the Start Date in the main table
        loadSessionTerms(selectedSessionId);
      }
    } catch (error) {
      showSnackbar('Failed to generate weeks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWeekStatus = async (id) => {
    try {
      const response = await toggleWeekStatus(id);
      if (response.status) {
        loadWeeksData(activeSessionTermId);
      }
    } catch (error) {
      showSnackbar('Failed to toggle status', 'error');
    }
  };

  const handleAddWeek = async () => {
    try {
      const response = await addWeek(activeSessionTermId);
      if (response.status) {
        setWeeks(response.data);
        // Refresh session terms to update the Start Date in the main table
        loadSessionTerms(selectedSessionId);
      }
    } catch (error) {
      showSnackbar('Failed to add week', 'error');
    }
  };

  const handleDeleteWeek = async (weekId) => {
    try {
      const response = await deleteWeek(activeSessionTermId, weekId);
      if (response.status) {
        setWeeks(response.data);
        // Refresh session terms to update the Start Date if necessary
        loadSessionTerms(selectedSessionId);
      }
    } catch (error) {
      showSnackbar('Failed to delete week', 'error');
    }
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
  };

  const handleToggleSelect = (termName) => {
    setHasChanges(true);
  };

  // Paginate terms data
  const paginatedTerms = useMemo(() => {
    const start = termsPage * termsRowsPerPage;
    return sessionTerms.slice(start, start + termsRowsPerPage);
  }, [sessionTerms, termsPage, termsRowsPerPage]);

  // Paginate weeks data
  const paginatedWeeks = useMemo(() => {
    const start = weeksPage * weeksRowsPerPage;
    return weeks.slice(start, start + weeksRowsPerPage);
  }, [weeks, weeksPage, weeksRowsPerPage]);

  const handleTermsPageChange = (event, newPage) => {
    setTermsPage(newPage);
  };

  const handleTermsRowsPerPageChange = (event) => {
    setTermsRowsPerPage(parseInt(event.target.value, 10));
    setTermsPage(0);
  };

  const handleWeeksPageChange = (event, newPage) => {
    setWeeksPage(newPage);
  };

  const handleWeeksRowsPerPageChange = (event) => {
    setWeeksRowsPerPage(parseInt(event.target.value, 10));
    setWeeksPage(0);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Manage Sessions Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Manage Sessions</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    handleOpenEditModal();
                  }}
                >
                  Edit Term Name
                </Button>
              </Box>
            }
          >
            {loading && !currentSession ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ minHeight: 200 }}
              >
                <CircularProgress />
              </Box>
            ) : currentSession ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Select Session"
                    value={selectedSessionId}
                    onChange={handleSessionChange}
                    size="small"
                  >
                    {sessions.map((session) => (
                      <MenuItem key={session.id} value={session.id}>
                        {session.sesname}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Paper variant="outlined">
                  <TableContainer>
                    <Table sx={{ whiteSpace: 'nowrap' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Display Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Actual Term</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            Status
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            Start Date
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedTerms.map((item, i) => (
                          <TableRow key={item.app_term_id} hover>
                            <TableCell>{i + 1 + termsPage * termsRowsPerPage}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{item.display_name}</TableCell>
                            <TableCell>{item.term_name}</TableCell>
                            <TableCell align="center">
                              {item.is_subscribed === 'yes' ? (
                                <Chip
                                  label={item.status === 'active' ? 'active' : 'inactive'}
                                  size="small"
                                  sx={{
                                    bgcolor: item.status === 'active' ? '#dcfce7' : '#fef3c7',
                                    color: item.status === 'active' ? '#166534' : '#92400e',
                                    fontWeight: 500,
                                  }}
                                />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {item.start_date || (item.is_subscribed === 'yes' ? 'Not Set' : '-')}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                {item.is_subscribed === 'no' ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleSubscribeClick(item)}
                                    disabled={loading}
                                  >
                                    Subscribe
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color={item.status === 'active' ? 'error' : 'success'}
                                      onClick={() => handleToggleStatusClick(item)}
                                      disabled={loading}
                                    >
                                      {item.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </Button>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>

                      <TableFooter>
                        <TableRow>
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            count={sessionTerms.length}
                            rowsPerPage={termsRowsPerPage}
                            page={termsPage}
                            onPageChange={handleTermsPageChange}
                            onRowsPerPageChange={handleTermsRowsPerPageChange}
                          />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
            ) : (
              <Alert severity="info">No active session found</Alert>
            )}
          </ParentCard>
        </Grid>

        {/* Generate Week Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          {activeSessionTermId && (
            <ParentCard
              id="generate-week-section"
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">Generate Week</Typography>

                  <Box
                    sx={{
                      ml: 'auto',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    }}
                  >
                    <Typography variant="caption">
                      {weeks.length} Weeks • {weeks.length * 5} school days
                    </Typography>
                  </Box>
                </Box>
              }
            >
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TextField
                    label="No. of Weeks"
                    type="number"
                    size="small"
                    sx={{ width: 120 }}
                    value={autoGenerateConfig.numWeeks}
                    onChange={(e) =>
                      setAutoGenerateConfig({
                        ...autoGenerateConfig,
                        numWeeks: parseInt(e.target.value),
                      })
                    }
                  />
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    sx={{ width: 160 }}
                    value={autoGenerateConfig.startDate}
                    onChange={(e) =>
                      setAutoGenerateConfig({ ...autoGenerateConfig, startDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAutoGenerate}
                    disabled={loading || !activeSessionTermId}
                  >
                    Generate
                  </Button>
                  {/* <IconButton color="primary" onClick={handleAddWeek} disabled={!activeSessionTermId}>
                    <AddIcon />
                  </IconButton> */}
                </Box>

                <TableContainer>
                  <Table sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Week</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {weeks.length > 0 ? (
                        paginatedWeeks.map((item, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{item.week_name}</TableCell>
                            <TableCell>{item.start_date || 'N/A'}</TableCell>
                            <TableCell>{item.end_date || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                size="small"
                                onClick={() => handleToggleWeekStatus(item.wk_id)}
                                sx={{
                                  cursor: 'pointer',
                                  bgcolor: item.status === 'active' ? '#dcfce7' : '#fee2e2',
                                  color: item.status === 'active' ? '#166534' : '#991b1b',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="dark"
                                onClick={() => handleDeleteWeek(item.week_id)}
                              >
                                <IconDotsVertical size={16} />{' '}
                                {/* Replace with Trash if available */}
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              No weeks generated yet for this term.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>

                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          count={weeks.length}
                          rowsPerPage={weeksRowsPerPage}
                          page={weeksPage}
                          onPageChange={handleWeeksPageChange}
                          onRowsPerPageChange={handleWeeksRowsPerPageChange}
                        />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              </Paper>
            </ParentCard>
          )}
        </Grid>
      </Grid>

      {/* <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue} disabled={!hasChanges}>
          Save & Continue
        </Button>
      </Box> */}

      {/* Edit Term Name Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Term Name</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Landlord Term"
              value={selectedAppTermId}
              onChange={(e) => setSelectedAppTermId(e.target.value)}
              margin="normal"
            >
              {allLandlordTerms.map((term) => (
                <MenuItem key={term.app_term_id} value={term.app_term_id}>
                  {term.term_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Tenant's Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              margin="normal"
              required
              helperText="Input your own display name for the selected term"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button
            onClick={handleSaveDisplayName}
            variant="contained"
            disabled={loading || !displayName.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Confirmation Dialog */}
      <Dialog
        open={confirmSubscribe.open}
        onClose={() => setConfirmSubscribe({ open: false, term: null })}
      >
        <DialogTitle>Confirm Subscription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to subscribe to{' '}
            <strong>{confirmSubscribe.term?.display_name || 'this term'}</strong> for the selected
            session?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubscribe({ open: false, term: null })}>
            No, Cancel
          </Button>
          <Button onClick={handleConfirmSubscribe} variant="contained" autoFocus disabled={loading}>
            Yes, Subscribe
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog
        open={confirmStatus.open}
        onClose={() => setConfirmStatus({ open: false, term: null })}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            <strong>{confirmStatus.term?.status === 'active' ? 'deactivate' : 'activate'}</strong>{' '}
            the term <strong>{confirmStatus.term?.display_name}</strong>?
            {confirmStatus.term?.status !== 'active' && (
              <Box mt={1}>
                <Typography variant="body2" color="textSecondary">
                  Activating this term will automatically deactivate any other active terms.
                </Typography>
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmStatus({ open: false, term: null })}>Cancel</Button>
          <Button
            onClick={handleConfirmToggleStatus}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SetCalendarTab;
