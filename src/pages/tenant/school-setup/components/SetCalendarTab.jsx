import { useState, useEffect, useLayoutEffect, useRef, useContext } from 'react';
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
  useTheme,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconTrash } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import ArrowHint from '@/components/shared/ArrowHint';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import {
  fetchCurrentSession,
  fetchSessionTerms,
  updateDisplayName,
  subscribeSessionTerm,
  fetchTerms,
  toggleSessionTermStatus,
} from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchWeeks,
  autoGenerateWeeks,
  toggleWeekStatus,
  deleteWeek,
} from '@/api/tenant/term-weeks/weekApi';

const SetCalendarTab = ({ onSaveAndContinue, onUpdate, onReadyChange }) => {
  const { refreshTenantInfo } = useContext(TenantAuthContext);
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Session and session terms state
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [openEditModal, setOpenEditModal] = useState(false);
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
    numWeeks: 0,
  });
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);
  const [confirmDeleteWeek, setConfirmDeleteWeek] = useState(false);

  // ── Hint positioning ─────────────────────────────────────────────────────
  const generateBtnRef = useRef(null);
  const paperRef = useRef(null);
  const actionBtnRef = useRef(null); // ref on first row's ⋮ button
  const tableWrapRef = useRef(null); // ref on the Box wrapping the table
  const [hintStyle, setHintStyle] = useState(null);
  const [actionHintStyle, setActionHintStyle] = useState(null);

  useEffect(() => {
    if (weeks.length > 0) {
      setAutoGenerateConfig((prev) => ({
        ...prev,
        numWeeks: weeks.length,
      }));
    }
  }, [weeks]);

  useLayoutEffect(() => {
    const btn = generateBtnRef.current;
    const paper = paperRef.current;
    if (!btn || !paper) return;

    const calc = () => {
      const btnRect = btn.getBoundingClientRect();
      const paperRect = paper.getBoundingClientRect();
      setHintStyle({
        top: btnRect.bottom - paperRect.top + 6,
        left: btnRect.left - paperRect.left,
        width: btnRect.width,
      });
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(paper);
    return () => ro.disconnect();
  }, [weeks.length, activeSessionTermId, sessionTerms.length]);

  // Measure the ⋮ action button in the first row
  useLayoutEffect(() => {
    const btn = actionBtnRef.current;
    const wrap = tableWrapRef.current;
    if (!btn || !wrap) return;

    const calc = () => {
      const btnRect = btn.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      setActionHintStyle({
        // Place hint below the button, aligned to its left edge
        top: btnRect.bottom - wrapRect.top + 6,
        left: btnRect.left - wrapRect.left - 80, // offset left so bubble doesn't overlap button
      });
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [sessionTerms.length]);

  useEffect(() => {
    loadData();
    refreshTenantInfo();
  }, []);

  // Notify parent when stage is completable: subscribed term + weeks generated
  useEffect(() => {
    const isReady = sessionTerms.some((t) => t.is_subscribed === 'yes') && weeks.length > 0;
    onReadyChange?.(isReady);
  }, [sessionTerms, weeks, onReadyChange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetchCurrentSession();
      if (sessionRes.status && sessionRes.data.length > 0) {
        setSessions(sessionRes.data);
        const initialSessionId = sessionRes.data[0].id;
        setSelectedSessionId(initialSessionId);
        setCurrentSession(sessionRes.data[0]);
        await loadSessionTerms(initialSessionId);
      }
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

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
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
        if (onUpdate) onUpdate();
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
        await refreshTenantInfo();
        if (onUpdate) onUpdate();
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
        await refreshTenantInfo();
        if (onUpdate) onUpdate();
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

  const handleAutoGenerate = async () => {
    if (!activeSessionTermId || !autoGenerateConfig.startDate) {
      showSnackbar('Set start date first', 'error');
      return;
    }

    if (autoGenerateConfig.numWeeks < 1 || autoGenerateConfig.numWeeks > 15) {
      showSnackbar('Number of weeks must be between 1 and 15', 'error');
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

        setAutoGenerateConfig((prev) => ({
          ...prev,
          numWeeks: response.data.length,
        }));

        showSnackbar('Weeks generated successfully', 'success');
        loadSessionTerms(selectedSessionId);
        refreshTenantInfo();
      } else {
        showSnackbar(response.message || 'Failed to generate weeks', 'error');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to generate weeks';
      showSnackbar(msg, 'error');
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

  const handleDeleteLastWeek = async () => {
    if (!weeks.length || !activeSessionTermId) return;
    const lastWeek = weeks[weeks.length - 1];
    try {
      setLoading(true);
      const response = await deleteWeek(activeSessionTermId, lastWeek.week_id);
      if (response.status) {
        setWeeks(response.data);
        showSnackbar('Last week removed successfully', 'success');
      } else {
        showSnackbar(response.message || 'Failed to delete week', 'error');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to delete week';
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <ParentCard>
        <Grid container spacing={3}>
          {/* ── Manage Sessions ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ParentCard
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">Manage Sessions</Typography>
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

                  <Box ref={tableWrapRef} sx={{ position: 'relative' }}>
                    <Paper variant="outlined">
                      <TableContainer>
                        <Table sx={{ whiteSpace: 'nowrap' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Display Name</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                Status
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                Action
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sessionTerms.map((item, i) => (
                              <TableRow key={item.app_term_id} hover>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{item.display_name}</TableCell>
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
                                  <IconButton
                                    ref={i === 0 ? actionBtnRef : null}
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, item)}
                                  >
                                    <MoreVertIcon size={18} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>

                    {/* Subscribe hint — measured from the first row's ⋮ button */}
                    {!sessionTerms.some((t) => t.is_subscribed === 'yes') && actionHintStyle && (
                      <ArrowHint
                        show
                        label="Click ⋮ to subscribe"
                        direction="up-right"
                        mode="persistent"
                        delay="0.8s"
                        position={{
                          position: 'absolute',
                          top: actionHintStyle.top,
                          left: actionHintStyle.left,
                          zIndex: 10,
                        }}
                      />
                    )}
                  </Box>
                </>
              ) : (
                <Alert severity="info">No active session found</Alert>
              )}
            </ParentCard>
          </Grid>

          {/* ── Generate Week ── */}
          <Grid size={{ xs: 12, md: 6 }}>
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
              {activeSessionTermId ? (
                // paperRef anchors the hint position calculations
                <Paper ref={paperRef} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                  <Box
                    sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}
                  >
                    <TextField
                      label="No. of Weeks"
                      type="number"
                      size="small"
                      sx={{ width: { xs: '100%', sm: 120 } }}
                      value={autoGenerateConfig.numWeeks}
                      onChange={(e) =>
                        setAutoGenerateConfig({
                          ...autoGenerateConfig,
                          numWeeks: parseInt(e.target.value),
                        })
                      }
                      inputProps={{
                        min: 1,
                        max: 15,
                      }}
                    />
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      sx={{ width: { xs: '100%', sm: 160 } }}
                      value={autoGenerateConfig.startDate}
                      onChange={(e) =>
                        setAutoGenerateConfig({ ...autoGenerateConfig, startDate: e.target.value })
                      }
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    {/* generateBtnRef targets this button exactly */}
                    <Button
                      ref={generateBtnRef}
                      variant="contained"
                      onClick={handleAutoGenerate}
                      disabled={loading || !activeSessionTermId}
                      size="small"
                      sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
                    >
                      Generate
                    </Button>
                  </Box>

                  {/* ── Generate hint  ── */}
                  {sessionTerms.some((t) => t.is_subscribed === 'yes') &&
                    weeks.length === 0 &&
                    hintStyle && (
                      <ArrowHint
                        show
                        label="Set dates &amp; click Generate ☝️"
                        direction="up-right"
                        mode="persistent"
                        delay="0.3s"
                        position={{
                          position: 'absolute',
                          top: hintStyle.top,
                          left: hintStyle.left,
                          width: hintStyle.width,
                          zIndex: 10,
                        }}
                      />
                    )}

                  <TableContainer sx={{ maxHeight: 320, overflowY: 'auto' }}>
                    <Table stickyHeader sx={{ whiteSpace: 'nowrap' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Week</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: 48 }} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {weeks.length > 0 ? (
                          weeks.map((item, i) => {
                            const isLast = i === weeks.length - 1;
                            return (
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
                                <TableCell align="center">
                                  {isLast && (
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => setConfirmDeleteWeek(true)}
                                      disabled={loading}
                                      title="Remove last week"
                                    >
                                      <IconTrash size={15} />
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
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
                    </Table>
                  </TableContainer>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ mt: 3 }}>
                  No weeks generated yet. Subscribe to a term first to set the weeks
                </Alert>
              )}
            </ParentCard>
          </Grid>
        </Grid>
      </ParentCard>

      {/* ── Edit Term Name Modal ── */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Term Name</DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              select
              fullWidth
              label="Select Landlord Term"
              value={selectedAppTermId}
              onChange={(e) => setSelectedAppTermId(e.target.value)}
              margin="normal"
              size="small"
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
              size="small"
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
            size="small"
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Subscription Confirmation ── */}
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

      {/* ── Status Toggle Confirmation ── */}
      <Dialog
        open={confirmStatus.open}
        onClose={() => setConfirmStatus({ open: false, term: null })}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography>
              Are you sure you want to{' '}
              <strong>{confirmStatus.term?.status === 'active' ? 'deactivate' : 'activate'}</strong>{' '}
              the term <strong>{confirmStatus.term?.display_name}</strong>?
            </Typography>
            {confirmStatus.term?.status !== 'active' && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Activating this term will automatically deactivate any other active terms.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setConfirmStatus({ open: false, term: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmToggleStatus}
            variant="contained"
            color="primary"
            disabled={loading}
            size="small"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Last Week Confirmation ── */}
      <Dialog open={confirmDeleteWeek} onClose={() => setConfirmDeleteWeek(false)}>
        <DialogTitle>Remove Last Week</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{weeks[weeks.length - 1]?.week_name}</strong>?
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setConfirmDeleteWeek(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={loading}
            onClick={() => {
              setConfirmDeleteWeek(false);
              handleDeleteLastWeek();
            }}
          >
            Yes, Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
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

      {/* ── Action Menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {selectedItem?.is_subscribed === 'no' ? (
          <MenuItem
            onClick={() => {
              handleSubscribeClick(selectedItem);
              handleMenuClose();
            }}
          >
            Subscribe
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleToggleStatusClick(selectedItem);
              handleMenuClose();
            }}
            sx={{ color: selectedItem?.status === 'active' ? 'error.main' : 'success.main' }}
          >
            {selectedItem?.status === 'active' ? 'Deactivate' : 'Activate'}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default SetCalendarTab;
