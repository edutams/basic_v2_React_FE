import { useState, useEffect } from 'react';
import {
  Box,
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
  IconButton,
  TextField,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { IconPlus, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import ParentCard from 'src/components/shared/ParentCard';
import { fetchCurrentSession, fetchSessionTerms } from '../../../api/sessionTermApi';
import { fetchHolidays, createHolidays, deleteHoliday } from '../../../api/holidayApi';

const emptyRow = () => ({ name: '', start_date: '', end_date: '' });

const HolidaySection = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTermLabel, setSelectedTermLabel] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Create holiday modal
  const [openModal, setOpenModal] = useState(false);
  const [rows, setRows] = useState([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  // Row action menu
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuHolidayId, setMenuHolidayId] = useState(null);

  const handleMenuOpen = (e, id) => {
    setMenuAnchor(e.currentTarget);
    setMenuHolidayId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuHolidayId(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const res = await fetchCurrentSession();
        if (res.status && res.data.length > 0) {
          setSessions(res.data);
          setSelectedSessionId(res.data[0].id);
        }
      } catch {
        showSnackbar('Failed to load sessions', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  // Load terms when session changes
  useEffect(() => {
    if (!selectedSessionId) return;
    const loadTerms = async () => {
      try {
        const res = await fetchSessionTerms(selectedSessionId);
        if (res.status) {
          const subscribed = res.data.filter((t) => t.is_subscribed === 'yes');
          setSessionTerms(subscribed);
          if (subscribed.length > 0) {
            setSelectedTermId(subscribed[0].session_term_id);
            setSelectedTermLabel(subscribed[0].display_name || subscribed[0].term_name);
          } else {
            setSelectedTermId('');
            setSelectedTermLabel('');
            setHolidays([]);
          }
        }
      } catch {
        showSnackbar('Failed to load terms', 'error');
      }
    };
    loadTerms();
  }, [selectedSessionId]);

  // Load holidays when term changes
  useEffect(() => {
    if (!selectedTermId) return;
    loadHolidays(selectedTermId);
  }, [selectedTermId]);

  const loadHolidays = async (termId) => {
    try {
      setLoading(true);
      const res = await fetchHolidays(termId);
      if (res.status) {
        setHolidays(res.data);
      }
    } catch {
      showSnackbar('Failed to load holidays', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (e) => {
    const termId = e.target.value;
    setSelectedTermId(termId);
    const term = sessionTerms.find((t) => t.session_term_id === termId);
    setSelectedTermLabel(term?.display_name || term?.term_name || '');
  };

  // Modal handlers
  const handleOpenModal = () => {
    setRows([emptyRow()]);
    setErrors([]);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setRows([emptyRow()]);
    setErrors([]);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
    setErrors((prev) => [...prev, {}]);
  };

  const handleRowChange = (index, field, value) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    setErrors((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: undefined } : e)));
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const validateRows = () => {
    const newErrors = rows.map((r) => {
      const e = {};
      if (!r.name.trim()) e.name = 'Required';
      if (!r.start_date) e.start_date = 'Required';
      if (!r.end_date) e.end_date = 'Required';
      return e;
    });
    setErrors(newErrors);
    return newErrors.every((e) => Object.keys(e).length === 0);
  };

  const handleSaveHolidays = async () => {
    if (!validateRows()) return;
    try {
      setSaving(true);
      const res = await createHolidays(selectedTermId, rows);
      if (res.status) {
        showSnackbar('Holidays created successfully');
        handleCloseModal();
        loadHolidays(selectedTermId);
      } else {
        // Map field-level errors from API onto rows
        if (res.errors) {
          const apiErrors = {};
          Object.entries(res.errors).forEach(([idx, fieldErrs]) => {
            apiErrors[parseInt(idx)] = fieldErrs;
          });
          setErrors((prev) => {
            const merged = [...prev];
            Object.entries(apiErrors).forEach(([idx, fieldErrs]) => {
              merged[idx] = { ...(merged[idx] || {}), ...fieldErrs };
            });
            return merged;
          });
        }
        showSnackbar(res.message || 'Failed to create holidays', 'error');
      }
    } catch (err) {
      // Handle 422 validation errors with field-level detail
      const data = err?.response?.data;
      if (data?.errors) {
        const apiErrors = {};
        Object.entries(data.errors).forEach(([idx, fieldErrs]) => {
          apiErrors[parseInt(idx)] = fieldErrs;
        });
        setErrors((prev) => {
          const merged = [...prev];
          Object.entries(apiErrors).forEach(([idx, fieldErrs]) => {
            merged[idx] = { ...(merged[idx] || {}), ...fieldErrs };
          });
          return merged;
        });
        showSnackbar(data.message || 'Validation failed', 'error');
      } else {
        showSnackbar('Failed to create holidays', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null });
    try {
      setLoading(true);
      const res = await deleteHoliday(id);
      if (res.status) {
        showSnackbar('Holiday deleted');
        loadHolidays(selectedTermId);
      } else {
        showSnackbar(res.message || 'Failed to delete', 'error');
      }
    } catch {
      showSnackbar('Failed to delete holiday', 'error');
    } finally {
      setLoading(false);
    }
  };

  const paginatedHolidays = holidays.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get session label for modal title
  const sessionLabel = sessions.find((s) => s.id === selectedSessionId)?.sesname || '';

  return (
    <>
      <ParentCard
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Holidays</Typography>
            <Button
              variant="contained"
              startIcon={<IconPlus size={16} />}
              onClick={handleOpenModal}
              disabled={!selectedTermId}
            >
              Create Holiday
            </Button>
          </Box>
        }
      >
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            select
            label="Session"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {sessions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.sesname}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Term"
            value={selectedTermId}
            onChange={handleTermChange}
            size="small"
            sx={{ minWidth: 160 }}
            disabled={sessionTerms.length === 0}
          >
            {sessionTerms.map((t) => (
              <MenuItem key={t.session_term_id} value={t.session_term_id}>
                {t.display_name || t.term_name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !selectedTermId ? (
          <Alert severity="info">Select a session and term to view holidays.</Alert>
        ) : (
          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Holiday Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedHolidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">No holidays found for this term.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHolidays.map((h, i) => (
                      <TableRow key={h.id} hover>
                        <TableCell>{i + 1 + page * rowsPerPage}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{h.name}</TableCell>
                        <TableCell>{h.start_date}</TableCell>
                        <TableCell>{h.end_date}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, h.id)}
                          >
                            <IconDotsVertical size={16} />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor) && menuHolidayId === h.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem
                              onClick={() => {
                                handleMenuClose();
                                handleDeleteClick(h.id);
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <IconTrash size={16} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={holidays.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, p) => setPage(p)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </ParentCard>

      {/* Create Holiday Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          Create Holiday{sessionLabel && selectedTermLabel ? ` for ${sessionLabel} - ${selectedTermLabel}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<IconPlus size={16} />}
                onClick={handleAddRow}
                size="small"
              >
                Add More
              </Button>
            </Box>
            {rows.map((row, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  label="Holiday Name"
                  value={row.name}
                  onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                  size="small"
                  sx={{ flex: 2 }}
                  error={!!errors[index]?.name}
                  helperText={errors[index]?.name}
                  required
                />
                <TextField
                  label="Start Date"
                  type="date"
                  value={row.start_date}
                  onChange={(e) => handleRowChange(index, 'start_date', e.target.value)}
                  size="small"
                  sx={{ flex: 1.5 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors[index]?.start_date}
                  helperText={errors[index]?.start_date}
                  required
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={row.end_date}
                  onChange={(e) => handleRowChange(index, 'end_date', e.target.value)}
                  size="small"
                  sx={{ flex: 1.5 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors[index]?.end_date}
                  helperText={errors[index]?.end_date}
                  required
                />
                {rows.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRow(index)}
                    sx={{ mt: 0.5 }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHolidays} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Create Holiday'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}>
        <DialogTitle>Delete Holiday</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this holiday?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, id: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </>
  );
};

export default HolidaySection;
