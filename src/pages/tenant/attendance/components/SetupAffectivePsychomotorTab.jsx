import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Chip,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';

// ── Theme-aware sub-card ─────────────────────────────────────────
const DomainCard = ({ title, children, color, isEmpty, onSync }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : theme.palette.grey[200]}`,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.grey[200]}`,
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="#fff">
          {title}
        </Typography>
        {isEmpty && onSync && (
          <Button
            size="small"
            variant="contained"
            color="inherit"
            startIcon={<SyncIcon />}
            onClick={onSync}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Sync
          </Button>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Paper>
  );
};

// ── Main Component ───────────────────────────────────────────────
const SetupAffectivePsychomotorTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── State ─────────────────────────────────────────────────────
  const [affectives, setAffectives] = useState([]);
  const [psychomotors, setPsychomotors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, type: '', domain: null });
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', domain: null });
  const [deleting, setDeleting] = useState(false);

  // Add new state
  const [addModal, setAddModal] = useState({ open: false, type: '' });
  const [addName, setAddName] = useState('');

  // ── Fetch Domains ─────────────────────────────────────────────
  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [affRes, psyRes] = await Promise.all([
        resultSetupApi.getAffectiveDomains(),
        resultSetupApi.getPsychomotorDomains(),
      ]);

      setAffectives(affRes.data?.data || []);
      setPsychomotors(psyRes.data?.data || []);
    } catch (e) {
      console.error('Failed to fetch domains:', e);
      setError('Failed to load domain configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // ── Handlers ──────────────────────────────────────────────────

  // Sync Configuration
  const handleSync = async () => {
    setSyncing(true);
    try {
      await resultSetupApi.syncConfig();
      await fetchDomains();
    } catch (e) {
      console.error('Sync failed:', e);
      setError('Failed to synchronize configuration.');
    } finally {
      setSyncing(false);
    }
  };

  // Open Edit Modal
  const openEdit = (type, domain) => {
    setEditModal({ open: true, type, domain });
    setEditName(domain.name);
  };

  // Close Edit Modal
  const closeEdit = () => {
    setEditModal({ open: false, type: '', domain: null });
    setEditName('');
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const saveFn = editModal.type === 'affective'
        ? resultSetupApi.saveAffectiveDomain
        : resultSetupApi.savePsychomotorDomain;

      await saveFn({ id: editModal.domain.id, name: editName.trim() });
      await fetchDomains();
      closeEdit();
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  // Open Delete Confirm
  const openDelete = (type, domain) => {
    setDeleteConfirm({ open: true, type, domain });
  };

  // Close Delete Confirm
  const closeDelete = () => {
    setDeleteConfirm({ open: false, type: '', domain: null });
  };

  // Confirm Delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const deleteFn = deleteConfirm.type === 'affective'
        ? resultSetupApi.deleteAffectiveDomain
        : resultSetupApi.deletePsychomotorDomain;

      await deleteFn(deleteConfirm.domain.id);
      await fetchDomains();
      closeDelete();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setDeleting(false);
    }
  };

  // Open Add Modal
  const openAdd = (type) => {
    setAddModal({ open: true, type });
    setAddName('');
  };

  // Close Add Modal
  const closeAdd = () => {
    setAddModal({ open: false, type: '' });
    setAddName('');
  };

  // Confirm Add
  const handleAdd = async () => {
    if (!addName.trim()) return;
    setSaving(true);
    try {
      const saveFn = addModal.type === 'affective'
        ? resultSetupApi.saveAffectiveDomain
        : resultSetupApi.savePsychomotorDomain;

      await saveFn({ name: addName.trim() });
      await fetchDomains();
      closeAdd();
    } catch (e) {
      console.error('Add failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = affectives.length === 0 && psychomotors.length === 0;

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 1 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Sync Banner when empty */}
      {isEmpty && !loading && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: '16px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : theme.palette.grey[200]}`,
            textAlign: 'center',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
          }}
        >
          <SyncIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Affective & Psychomotor Domain Not Configured
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            The affective and psychomotor domain keys are yet to be configured.
            Click the <b>Sync Configuration</b> button below to synchronize the configuration
            and create the default domain keys for the current session term.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Configuration'}
          </Button>
        </Paper>
      )}

      {/* Two-column Domain Tables */}
      {!isEmpty && (
        <>
          {/* Action Bar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Manage affective and psychomotor domain keys for the current session term.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={syncing ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Resync'}
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {/* Affective Domain Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DomainCard
                title="Affective Domain"
                color={theme.palette.success.main}
                isEmpty={affectives.length === 0}
                onSync={handleSync}
              >
                {/* <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={() => openAdd('affective')}
                  >
                    Add Key
                  </Button>
                </Box> */}
                {affectives.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No affective domain keys configured.
                  </Typography>
                ) : (
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Key</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {affectives.map((af, idx) => (
                          <TableRow key={af.id} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {af.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={af.status === 'active' ? 'Active' : 'Inactive'}
                                size="small"
                                color={af.status === 'active' ? 'success' : 'default'}
                                variant="soft"
                                sx={{ fontWeight: 600, fontSize: '11px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => openEdit('affective', af)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => openDelete('affective', af)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DomainCard>
            </Grid>

            {/* Psychomotor Domain Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DomainCard
                title="Psychomotor Domain"
                color={theme.palette.primary.main}
                isEmpty={psychomotors.length === 0}
                onSync={handleSync}
              >
                {/* <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={() => openAdd('psychomotor')}
                  >
                    Add Skill
                  </Button>
                </Box> */}
                {psychomotors.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No psychomotor domain keys configured.
                  </Typography>
                ) : (
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Skill</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {psychomotors.map((ps, idx) => (
                          <TableRow key={ps.id} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {ps.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={ps.status === 'active' ? 'Active' : 'Inactive'}
                                size="small"
                                color={ps.status === 'active' ? 'success' : 'default'}
                                variant="soft"
                                sx={{ fontWeight: 600, fontSize: '11px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => openEdit('psychomotor', ps)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => openDelete('psychomotor', ps)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DomainCard>
            </Grid>
          </Grid>
        </>
      )}

      {/* ── Edit Modal ───────────────────────────────────── */}
      <Dialog open={editModal.open} onClose={closeEdit} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit {editModal.type === 'affective' ? 'Affective Domain' : 'Psychomotor Skill'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={saving || !editName.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Modal ────────────────────────────────────── */}
      <Dialog open={addModal.open} onClose={closeAdd} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Add {addModal.type === 'affective' ? 'Affective Domain Key' : 'Psychomotor Skill'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAdd}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={saving || !addName.trim()}
          >
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────── */}
      <Dialog open={deleteConfirm.open} onClose={closeDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{' '}
            <Typography component="span" fontWeight={700}>
              "{deleteConfirm.domain?.name}"
            </Typography>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDelete}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SetupAffectivePsychomotorTab;
