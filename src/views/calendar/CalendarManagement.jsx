import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
} from '@mui/material';
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconEdit,
  IconDotsVertical,
} from '@tabler/icons-react';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import FilterSideDrawer from 'src/components/shared/FilterSideDrawer';
import useNotification from 'src/hooks/useNotification';
import agentApi from 'src/api/auth';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Calendar Management' }];

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

// ─── Confirmation Dialog ───────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ pt: 1 }}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Yes, Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Sortable Row Wrapper ──────────────────────────────────────────────────
function SortableRow({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f0f4ff' : undefined,
  };
  return (
    <TableRow ref={setNodeRef} style={style} hover>
      <TableCell
        sx={{ width: 32, color: 'text.disabled', cursor: disabled ? 'default' : 'grab', px: 1 }}
      >
        {!disabled && (
          <span {...attributes} {...listeners}>
            <IconGripVertical size={18} />
          </span>
        )}
      </TableCell>
      {children}
    </TableRow>
  );
}

// ─── Sessions Panel ────────────────────────────────────────────────────────
function SessionsPanel({ isLevel1 }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // session being edited
  const [form, setForm] = useState({ sesname: '', status: 'active', is_current: 'no' });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const sessionFilterDefs = [
    { key: 'search', label: 'Session Name', type: 'text', placeholder: 'Search by session name…' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'is_current',
      label: 'Current Session',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
  ];

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.get('/landlord/v1/calendar/sessions');
      setSessions(res.data);
    } catch {
      notify.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = !activeFilters.search
      ? true
      : session.sesname.toLowerCase().includes(activeFilters.search.toLowerCase());
    const matchesStatus = !activeFilters.status ? true : session.status === activeFilters.status;
    const matchesCurrent = !activeFilters.is_current
      ? true
      : session.is_current === activeFilters.is_current;
    return matchesSearch && matchesStatus && matchesCurrent;
  });

  const handleFilterApply = (filterValues) => {
    setActiveFilters(filterValues);
  };

  const handleFilterReset = () => {
    setActiveFilters({});
  };

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== '').length;

  const openCreate = () => {
    setEditTarget(null);
    setForm({ sesname: '', status: 'active', is_current: 'no' });
    setErrors({});
    setCreateOpen(true);
  };
  const openEdit = (s) => {
    setEditTarget(s);
    setForm({ sesname: s.sesname, status: s.status, is_current: s.is_current });
    setErrors({});
    setCreateOpen(true);
  };
  const closeDialog = () => {
    setCreateOpen(false);
    setEditTarget(null);
    setErrors({});
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(
      sessions,
      sessions.findIndex((s) => s.id === active.id),
      sessions.findIndex((s) => s.id === over.id),
    );
    setSessions(reordered);
    try {
      await agentApi.put('/landlord/v1/calendar/sessions/reorder', {
        ids: reordered.map((s) => s.id),
      });
    } catch {
      notify.error('Failed to save order');
      fetchSessions();
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.sesname || !/^\d{4}\/\d{4}$/.test(form.sesname))
      errs.sesname = 'Must be YYYY/YYYY (e.g. 2024/2025)';
    if (!form.status) errs.status = 'Required';
    if (!form.is_current) errs.is_current = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editTarget) {
        await agentApi.put(`/landlord/v1/calendar/sessions/${editTarget.id}`, form);
        notify.success('Session updated');
      } else {
        await agentApi.post('/landlord/v1/calendar/sessions', form);
        notify.success('Session created');
      }
      closeDialog();
      fetchSessions();
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      if (Object.keys(serverErrors).length) setErrors(serverErrors);
      else notify.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = (s) =>
    setConfirm({
      open: true,
      title: 'Delete Session',
      message: `Delete "${s.sesname}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await agentApi.delete(`/landlord/v1/calendar/sessions/${s.id}`);
          notify.success('Session deleted');
          fetchSessions();
        } catch (err) {
          notify.error(err.response?.data?.message || 'Failed to delete');
        }
      },
    });

  const handleEdit = (s) => {
    handleMenuClose();
    openEdit(s);
  };

  const handleDeleteClick = (s) => {
    handleMenuClose();
    handleDelete(s);
  };

  const handleMenuOpen = (event, session) => {
    setAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSession(null);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Academic Sessions</Typography>
        {isLevel1 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ minWidth: 140 }}
            >
              Filters
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  color="primary"
                  sx={{
                    ml: 1,
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Button>
            <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={openCreate}>
              New Session
            </Button>
          </Box>
        )}
      </Box>
      {!isLevel1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Only Level 1 agents can manage global sessions.
        </Alert>
      )}
      {isLevel1 && sessions.length > 1 && (
        <Alert severity="info" icon={<IconGripVertical size={16} />} sx={{ mb: 2 }}>
          Drag the grip handle on the left to reorder sessions.
        </Alert>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 32 }} />
              <TableCell>S/N</TableCell>
              <TableCell>Session Name</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Current</TableCell>
              <TableCell>Status</TableCell>
              {isLevel1 && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No sessions found
                </TableCell>
              </TableRow>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredSessions.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredSessions.map((s, idx) => (
                    <SortableRow key={s.id} id={s.id} disabled={!isLevel1}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{s.sesname}</TableCell>
                      <TableCell>{s.sort_order}</TableCell>
                      <TableCell>
                        <Chip
                          label={s.is_current === 'yes' ? 'Yes' : 'No'}
                          size="small"
                          sx={{
                            bgcolor:
                              s.is_current === 'yes'
                                ? (theme) => theme.palette.primary.light
                                : (theme) => theme.palette.error.light,
                            color:
                              s.is_current === 'yes'
                                ? (theme) => theme.palette.primary.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={s.status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor:
                              s.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                            color:
                              s.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      {isLevel1 && (
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <IconButton onClick={(e) => handleMenuOpen(e, s)}>
                            <IconDotsVertical size={18} />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedSession?.id === s.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleEdit(s)}>
                              <IconEdit size={16} style={{ marginRight: 8 }} />
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleDeleteClick(s)}
                              sx={{ color: 'error.main' }}
                            >
                              <IconTrash size={16} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      )}
                    </SortableRow>
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={createOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Session' : 'Create New Session'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Session Name (e.g. 2024/2025)"
            value={form.sesname}
            error={!!errors.sesname}
            helperText={errors.sesname}
            onChange={(e) => {
              setErrors((p) => ({ ...p, sesname: undefined }));
              const raw = e.target.value;
              if (raw.length < (form.sesname || '').length) {
                setForm((p) => ({ ...p, sesname: raw }));
                return;
              }
              const digitsOnly = raw.replace(/[^0-9/]/g, '');
              const parts = digitsOnly.split('/');
              if (parts[0].length === 4) {
                const firstYear = parseInt(parts[0], 10);
                const nextYear = (firstYear + 1).toString();
                if (parts.length === 1) {
                  setForm((p) => ({ ...p, sesname: `${parts[0]}/${nextYear}` }));
                  return;
                }
                if (parts.length === 2) {
                  if (nextYear.startsWith(parts[1])) {
                    setForm((p) => ({ ...p, sesname: digitsOnly }));
                  }
                  return;
                }
              }
              if (parts.length === 1 && parts[0].length <= 4) {
                setForm((p) => ({ ...p, sesname: parts[0] }));
              }
            }}
            margin="normal"
            inputProps={{ maxLength: 9, placeholder: '2024/2025' }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={form.status}
            error={!!errors.status}
            helperText={errors.status}
            onChange={(e) => {
              setErrors((p) => ({ ...p, status: undefined }));
              setForm((p) => ({ ...p, status: e.target.value }));
            }}
            margin="normal"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Set as Current Session?"
            value={form.is_current}
            error={!!errors.is_current}
            helperText={errors.is_current}
            onChange={(e) => {
              setErrors((p) => ({ ...p, is_current: undefined }));
              setForm((p) => ({ ...p, is_current: e.target.value }));
            }}
            margin="normal"
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editTarget ? 'Save Changes' : 'Create Session'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm((p) => ({ ...p, open: false }))} />

      {/* Filter Side Drawer */}
      <FilterSideDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={sessionFilterDefs}
        title="Filter Sessions"
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </>
  );
}

// ─── Terms Panel ───────────────────────────────────────────────────────────
function TermsPanel({ isLevel1 }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ term_name: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const termFilterDefs = [
    { key: 'search', label: 'Term Name', type: 'text', placeholder: 'Search by term name…' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.get('/landlord/v1/calendar/terms');
      setTerms(res.data);
    } catch {
      notify.error('Failed to load terms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const filteredTerms = terms.filter((term) => {
    const matchesSearch = !activeFilters.search
      ? true
      : term.term_name.toLowerCase().includes(activeFilters.search.toLowerCase());
    const matchesStatus = !activeFilters.status ? true : term.status === activeFilters.status;
    return matchesSearch && matchesStatus;
  });

  const handleFilterApply = (filterValues) => {
    setActiveFilters(filterValues);
  };

  const handleFilterReset = () => {
    setActiveFilters({});
  };

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== '').length;

  const openCreate = () => {
    setEditTarget(null);
    setForm({ term_name: '', status: 'active' });
    setErrors({});
    setCreateOpen(true);
  };
  const openEdit = (t) => {
    setEditTarget(t);
    setForm({ term_name: t.term_name, status: t.status });
    setErrors({});
    setCreateOpen(true);
  };
  const closeDialog = () => {
    setCreateOpen(false);
    setEditTarget(null);
    setErrors({});
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(
      terms,
      terms.findIndex((t) => t.id === active.id),
      terms.findIndex((t) => t.id === over.id),
    );
    setTerms(reordered);
    try {
      await agentApi.put('/landlord/v1/calendar/terms/reorder', {
        ids: reordered.map((t) => t.id),
      });
    } catch {
      notify.error('Failed to save order');
      fetchTerms();
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.term_name?.trim()) errs.term_name = 'Term name is required';
    if (!form.status) errs.status = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editTarget) {
        await agentApi.put(`/landlord/v1/calendar/terms/${editTarget.id}`, form);
        notify.success('Term updated');
      } else {
        await agentApi.post('/landlord/v1/calendar/terms', form);
        notify.success('Term created');
      }
      closeDialog();
      fetchTerms();
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      if (Object.keys(serverErrors).length) setErrors(serverErrors);
      else notify.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = (t) =>
    setConfirm({
      open: true,
      title: 'Delete Term',
      message: `Delete "${t.term_name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await agentApi.delete(`/landlord/v1/calendar/terms/${t.id}`);
          notify.success('Term deleted');
          fetchTerms();
        } catch (err) {
          notify.error(err.response?.data?.message || 'Failed to delete');
        }
      },
    });

  const handleEdit = (t) => {
    handleMenuClose();
    openEdit(t);
  };

  const handleDeleteClick = (t) => {
    handleMenuClose();
    handleDelete(t);
  };

  const handleMenuOpen = (event, term) => {
    setAnchorEl(event.currentTarget);
    setSelectedTerm(term);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTerm(null);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Academic Terms</Typography>
        {isLevel1 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ minWidth: 140 }}
            >
              Filters
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  color="primary"
                  sx={{
                    ml: 1,
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Button>
            <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={openCreate}>
              New Term
            </Button>
          </Box>
        )}
      </Box>
      {!isLevel1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Only Level 1 agents can manage global terms.
        </Alert>
      )}
      {isLevel1 && terms.length > 1 && (
        <Alert severity="info" icon={<IconGripVertical size={16} />} sx={{ mb: 2 }}>
          Drag the grip handle on the left to reorder terms.
        </Alert>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 32 }} />
              <TableCell>S/N</TableCell>
              <TableCell>Term Name</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              {isLevel1 && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredTerms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No terms found
                </TableCell>
              </TableRow>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredTerms.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTerms.map((t, idx) => (
                    <SortableRow key={t.id} id={t.id} disabled={!isLevel1}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{t.term_name}</TableCell>
                      <TableCell>{t.sort_order}</TableCell>
                      <TableCell>
                        <Chip
                          label={t.status.toUpperCase()}
                          size="small"
                          // color={getStatusColor(t.status)}
                          // sx={{ borderRadius: '8px' }}
                          sx={{
                            bgcolor:
                              t.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                            color:
                              t.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      {isLevel1 && (
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <IconButton onClick={(e) => handleMenuOpen(e, t)}>
                            <IconDotsVertical size={18} />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedTerm?.id === t.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleEdit(t)}>
                              <IconEdit size={16} style={{ marginRight: 8 }} />
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleDeleteClick(t)}
                              sx={{ color: 'error.main' }}
                            >
                              <IconTrash size={16} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      )}
                    </SortableRow>
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={createOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Term' : 'Create New Term'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Term Name (e.g. First Term)"
            value={form.term_name}
            error={!!errors.term_name}
            helperText={errors.term_name}
            onChange={(e) => {
              setErrors((p) => ({ ...p, term_name: undefined }));
              setForm((p) => ({ ...p, term_name: e.target.value }));
            }}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={form.status}
            error={!!errors.status}
            helperText={errors.status}
            onChange={(e) => {
              setErrors((p) => ({ ...p, status: undefined }));
              setForm((p) => ({ ...p, status: e.target.value }));
            }}
            margin="normal"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editTarget ? 'Save Changes' : 'Create Term'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm((p) => ({ ...p, open: false }))} />

      {/* Filter Side Drawer */}
      <FilterSideDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={termFilterDefs}
        title="Filter Terms"
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </>
  );
}

// ─── Mappings Panel ────────────────────────────────────────────────────────
function MappingsPanel() {
  const [mappings, setMappings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ session_id: '', term_id: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, sRes, tRes] = await Promise.all([
        agentApi.get('/landlord/v1/calendar/mappings'),
        agentApi.get('/landlord/v1/calendar/sessions'),
        agentApi.get('/landlord/v1/calendar/terms'),
      ]);
      setMappings(mRes.data);
      setSessions(sRes.data);
      setTerms(tRes.data);
    } catch {
      notify.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(
      mappings,
      mappings.findIndex((m) => m.id === active.id),
      mappings.findIndex((m) => m.id === over.id),
    );
    setMappings(reordered);
    try {
      await agentApi.put('/landlord/v1/calendar/mappings/reorder', {
        ids: reordered.map((m) => m.id),
      });
    } catch {
      notify.error('Failed to save order');
      fetchAll();
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.session_id) errs.session_id = 'Select a session';
    if (!form.term_id) errs.term_id = 'Select a term';
    if (!form.status) errs.status = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await agentApi.post('/landlord/v1/calendar/mappings', form);
      notify.success('Mapping saved');
      setDialogOpen(false);
      setErrors({});
      setForm({ session_id: '', term_id: '', status: 'active' });
      fetchAll();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save mapping');
    }
  };

  const handleDelete = (m) =>
    setConfirm({
      open: true,
      title: 'Delete Mapping',
      message: `Delete "${m.session?.sesname} / ${m.term?.term_name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await agentApi.delete(`/landlord/v1/calendar/mappings/${m.id}`);
          notify.success('Mapping removed');
          fetchAll();
        } catch (err) {
          notify.error(err.response?.data?.message || 'Failed');
        }
      },
    });

  const handleActivate = (m) =>
    setConfirm({
      open: true,
      title: 'Activate Mapping',
      message: `Activate "${m.session?.sesname} / ${m.term?.term_name}"? All others will be set to inactive.`,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await agentApi.put(`/landlord/v1/calendar/mappings/${m.id}/activate`);
          notify.success('Mapping activated');
          fetchAll();
        } catch (err) {
          notify.error(err.response?.data?.message || 'Failed');
        }
      },
    });

  const handleMenuOpen = (event, mapping) => {
    setAnchorEl(event.currentTarget);
    setSelectedMapping(mapping);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMapping(null);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">My Session–Term Mappings</Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus size={16} />}
          onClick={() => setDialogOpen(true)}
        >
          Add Mapping
        </Button>
      </Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Tenants only see the session-term pairs you've mapped here.
        {mappings.length > 1 && <> Drag the grip handle to reorder.</>}
      </Alert>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 32 }} />
              <TableCell>S/N</TableCell>
              <TableCell>Session</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : mappings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No mappings yet. Add a session-term pair.
                </TableCell>
              </TableRow>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={mappings.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {mappings.map((m, idx) => (
                    <SortableRow key={m.id} id={m.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{m.session?.sesname}</TableCell>
                      <TableCell>{m.term?.term_name}</TableCell>
                      <TableCell>{m.sort_order}</TableCell>
                      <TableCell>
                        <Chip
                          label={m.status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor:
                              m.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                            color:
                              m.status?.toLowerCase() === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton onClick={(e) => handleMenuOpen(e, m)}>
                          <IconDotsVertical size={18} />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedMapping?.id === m.id}
                          onClose={handleMenuClose}
                        >
                          {m.status === 'inactive' && (
                            <MenuItem
                              onClick={() => {
                                handleMenuClose();
                                handleActivate(m);
                              }}
                            >
                              Activate
                            </MenuItem>
                          )}
                          <MenuItem
                            onClick={() => {
                              handleMenuClose();
                              handleDelete(m);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <IconTrash size={16} style={{ marginRight: 8 }} />
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </SortableRow>
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Session–Term Mapping</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            select
            label="Session"
            value={form.session_id}
            error={!!errors.session_id}
            helperText={errors.session_id}
            onChange={(e) => {
              setErrors((p) => ({ ...p, session_id: undefined }));
              setForm((p) => ({ ...p, session_id: e.target.value }));
            }}
            margin="normal"
          >
            <MenuItem value="">Select Session</MenuItem>
            {sessions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.sesname}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Term"
            value={form.term_id}
            error={!!errors.term_id}
            helperText={errors.term_id}
            onChange={(e) => {
              setErrors((p) => ({ ...p, term_id: undefined }));
              setForm((p) => ({ ...p, term_id: e.target.value }));
            }}
            margin="normal"
          >
            <MenuItem value="">Select Term</MenuItem>
            {terms.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.term_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Status"
            value={form.status}
            error={!!errors.status}
            helperText={errors.status}
            onChange={(e) => {
              setErrors((p) => ({ ...p, status: undefined }));
              setForm((p) => ({ ...p, status: e.target.value }));
            }}
            margin="normal"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save Mapping
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm((p) => ({ ...p, open: false }))} />
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
const CalendarManagement = () => {
  const [tab, setTab] = useState(0);
  const agentRaw = localStorage.getItem('agent') || sessionStorage.getItem('agent');
  const agent = agentRaw ? JSON.parse(agentRaw) : null;
  const isLevel1 = !agent?.parent_id;

  if (!isLevel1) {
    return (
      <>
        <Breadcrumb title="Calendar Management" items={BCrumb} />
        <ParentCard title="Session–Term Mappings">
          <MappingsPanel />
        </ParentCard>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Calendar Management" items={BCrumb} />
      <ParentCard>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
        >
          <Tab label="Sessions" />
          <Tab label="Terms" />
          {/* <Tab label="My Mappings" /> */}
        </Tabs>
        <TabPanel value={tab} index={0}>
          <SessionsPanel isLevel1={isLevel1} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <TermsPanel isLevel1={isLevel1} />
        </TabPanel>
        {/* <TabPanel value={tab} index={2}>
          <MappingsPanel />
        </TabPanel> */}
      </ParentCard>
    </>
  );
};

export default CalendarManagement;
