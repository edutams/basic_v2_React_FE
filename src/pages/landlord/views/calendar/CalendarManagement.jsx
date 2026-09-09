import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
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
  Skeleton,
  Alert,
  Menu,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconEdit,
  IconDotsVertical,
  IconCheck,
  IconSearch,
  IconX,
  IconCalendarStats,
  IconCircleCheck,
  IconCircleX,
  IconStar,
} from '@tabler/icons-react';
import { IconFilter } from '@tabler/icons-react';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import useNotification from 'src/hooks/useNotification';
import agentApi from '@/api/landlord/landlord_api';

// ─── Mini Stat Card ────────────────────────────────────────────────────────
function MiniStat({ label, value, loading, color, icon: Icon }) {
  return (
    <Box
      sx={{
        flex: '1 1 140px',
        minWidth: 140,
        p: 1.25,
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={50} height={28} />
        ) : (
          <Typography sx={{ fontSize: '20px', fontWeight: 700, color: color || 'text.primary' }}>
            {value}
          </Typography>
        )}
      </Box>
      {Icon && (
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: (theme) => {
              const paletteKey = color ? color.split('.')[0] : 'primary';
              return alpha(theme.palette[paletteKey]?.main ?? theme.palette.primary.main, 0.12);
            },
            color: color || 'primary.main',
          }}
        >
          <Icon size={18} />
        </Box>
      )}
    </Box>
  );
}

// ─── Inline Filter Bar (replaces the old side drawer) ─────────────────────
function InlineFilterBar({
  searchPlaceholder,
  draft,
  onDraftChange,
  onApply,
  onReset,
  hasActiveFilters,
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={draft.search}
        onChange={(e) => onDraftChange({ ...draft, search: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onApply();
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={16} />
            </InputAdornment>
          ),
          endAdornment: draft.search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onDraftChange({ ...draft, search: '' })}>
                <IconX size={14} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{ minWidth: 240 }}
      />
      <TextField
        size="small"
        select
        label="Status"
        value={draft.status}
        onChange={(e) => onDraftChange({ ...draft, status: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </TextField>
      <Button variant="contained" size="small" startIcon={<IconFilter size={16} />} onClick={onApply}>
        Filter
      </Button>
      {hasActiveFilters && (
        <Button size="small" onClick={onReset}>
          Reset
        </Button>
      )}
    </Box>
  );
}

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
        <Button variant="contained" size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" color="error" onClick={onConfirm}>
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
const SessionsPanel = forwardRef(function SessionsPanel({ isLevel1, onStatsChange }, ref) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // session being edited
  const [form, setForm] = useState({ session_name: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterDraft, setFilterDraft] = useState({ search: '', status: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', status: '' });
  const [submitting, setSubmitting] = useState(false);
  const [setCurrentOpen, setSetCurrentOpen] = useState(false);
  const [reordering, setReordering] = useState(false);
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const [stats, setStats] = useState({ total: 0, active: 0, current: '—' });

  // Search/status are sent to the backend as query params — never filtered
  // client-side — so `sessions` here is already exactly what should render.
  const fetchSessions = useCallback(async (filters) => {
    setLoading(true);
    try {
      const res = await agentApi.get('/v1/landlord/calendar/sessions', { params: filters });
      setSessions(res.data.data);
      setStats(res.data.stats);
    } catch {
      notify.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions(activeFilters);
  }, [fetchSessions, activeFilters]);

  // Reported up so the page-level stats row (above the tabs) can show
  // whichever tab is active, instead of duplicating a stats row per panel.
  useEffect(() => {
    onStatsChange?.({ stats, loading });
  }, [stats, loading, onStatsChange]);

  const handleFilterApply = () => {
    setActiveFilters(filterDraft);
  };

  const handleFilterReset = () => {
    setFilterDraft({ search: '', status: '' });
    setActiveFilters({ search: '', status: '' });
  };

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== '').length;

  const openCreate = () => {
    setEditTarget(null);
    setForm({ session_name: '', status: 'active' });
    setErrors({});
    setCreateOpen(true);
  };

  // Exposed so the parent can trigger "New Session" and a manual refresh
  // from the tab bar / page-level stats row, instead of down here.
  useImperativeHandle(ref, () => ({ openCreate, refresh: () => fetchSessions(activeFilters) }));

  const openEdit = (s) => {
    setEditTarget(s);
    setForm({ session_name: s.session_name, status: s.status });
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

    // Update sort_order values locally to reflect the new order
    const updatedSessions = reordered.map((session, index) => ({
      ...session,
      sort_order: index + 1,
    }));

    setSessions(updatedSessions);
    setReordering(true);
    try {
      await agentApi.put('/v1/landlord/calendar/sessions/reorder', {
        ids: reordered.map((s) => s.id),
      });
      notify.success('Session order updated successfully');
      // Refresh data to ensure consistency with backend
      fetchSessions(activeFilters);
    } catch {
      notify.error('Failed to save order');
      fetchSessions(activeFilters);
    } finally {
      setReordering(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.session_name || !/^\d{4}\/\d{4}$/.test(form.session_name))
      errs.session_name = 'Must be YYYY/YYYY (e.g. 2024/2025)';
    if (!form.status) errs.status = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      if (editTarget) {
        await agentApi.put(`/v1/landlord/calendar/sessions/${editTarget.id}`, form);
        notify.success('Session updated');
      } else {
        await agentApi.post('/v1/landlord/calendar/sessions', form);
        notify.success('Session created');
      }
      closeDialog();
      fetchSessions(activeFilters);
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      if (Object.keys(serverErrors).length) setErrors(serverErrors);
      else notify.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = (s) => {
    const isInactive = s.status?.toLowerCase() === 'inactive';

    setConfirm({
      open: true,
      title: isInactive ? 'Activate Session' : 'De-activate Session',
      message: isInactive ? `Activate "${s.session_name}"?` : `De-activate "${s.session_name}"?`,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await agentApi.put(`/v1/landlord/calendar/sessions/${s.id}/toggle-status`);
          notify.success(isInactive ? 'Session activated' : 'Session de-activated');
          fetchSessions(activeFilters);
        } catch (err) {
          notify.error(err.response?.data?.message || 'Failed to update');
        }
      },
    });
  };

  const handleEdit = (s) => {
    handleMenuClose();
    openEdit(s);
  };

  const handleDeactivateClick = (s) => {
    handleMenuClose();
    handleDeactivate(s);
  };

  const handleMenuOpen = (event, session) => {
    setAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSession(null);
  };

  const handleSetCurrent = (s) => {
    handleMenuClose();
    setSelectedSession(s);
    setForm({ is_current: s.is_current });
    setSetCurrentOpen(true);
  };

  const handleSetCurrentSubmit = async () => {
    try {
      setSubmitting(true);
      await agentApi.put(`/v1/landlord/calendar/sessions/${selectedSession.id}`, {
        ...selectedSession,
        is_current: form.is_current,
      });
      notify.success('Current session updated');
      setSetCurrentOpen(false);
      fetchSessions(activeFilters);
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update current session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!isLevel1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Only Level 1 agents can manage global sessions.
        </Alert>
      )}
      <InlineFilterBar
        searchPlaceholder="Search by session name…"
        draft={filterDraft}
        onDraftChange={setFilterDraft}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        hasActiveFilters={activeFilterCount > 0}
      />
      {isLevel1 && sessions.length > 1 && (
        <Alert severity="info" icon={<IconGripVertical size={16} />} sx={{ mb: 2 }}>
          Drag the grip handle on the left to reorder sessions.
        </Alert>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <TableContainer>
          <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1.5 } }}>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
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
              {loading || reordering ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" width={j === 0 ? 30 : 60} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No sessions found
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={sessions.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sessions.map((s, idx) => (
                    <SortableRow key={s.id} id={s.id} disabled={!isLevel1}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{s.session_name}</TableCell>
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
                          label={s.status}
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
                            <MenuItem onClick={() => handleSetCurrent(s)}>
                              <IconPlus size={16} style={{ marginRight: 8 }} />
                              {s.is_current === 'yes' ? 'Unset as Current' : 'Set as Current'}
                            </MenuItem>
                            {s.status?.toLowerCase() === 'inactive' ? (
                              <MenuItem onClick={() => handleDeactivateClick(s)}>
                                <IconCheck size={16} style={{ marginRight: 8 }} />
                                Activate
                              </MenuItem>
                            ) : (
                              <MenuItem
                                onClick={() => handleDeactivateClick(s)}
                                sx={{ color: 'error.main' }}
                              >
                                <IconTrash size={16} style={{ marginRight: 8 }} />
                                De-activate
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      )}
                    </SortableRow>
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>

      {/* Create / Edit Dialog */}
      <Dialog open={createOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Session' : 'Create New Session'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Session Name (e.g. 2024/2025)"
            value={form.session_name}
            error={!!errors.session_name}
            helperText={errors.session_name}
            onChange={(e) => {
              setErrors((p) => ({ ...p, session_name: undefined }));
              const raw = e.target.value;
              if (raw.length < (form.session_name || '').length) {
                setForm((p) => ({ ...p, session_name: raw }));
                return;
              }
              const digitsOnly = raw.replace(/[^0-9/]/g, '');
              const parts = digitsOnly.split('/');
              if (parts[0].length === 4) {
                const firstYear = parseInt(parts[0], 10);
                const nextYear = (firstYear + 1).toString();
                if (parts.length === 1) {
                  setForm((p) => ({ ...p, session_name: `${parts[0]}/${nextYear}` }));
                  return;
                }
                if (parts.length === 2) {
                  if (nextYear.startsWith(parts[1])) {
                    setForm((p) => ({ ...p, session_name: digitsOnly }));
                  }
                  return;
                }
              }
              if (parts.length === 1 && parts[0].length <= 4) {
                setForm((p) => ({ ...p, session_name: parts[0] }));
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
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={closeDialog}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Skeleton variant="text" width={80} height={20} />
            ) : editTarget ? (
              'Save Changes'
            ) : (
              'Create Session'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Set Current Session Dialog */}
      <Dialog
        open={setCurrentOpen}
        onClose={() => setSetCurrentOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Set Current Session</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Updating current session status for <strong>{selectedSession?.session_name}</strong>
          </Typography>
          <TextField
            fullWidth
            select
            label="Is Current Session?"
            value={form.is_current || 'no'}
            onChange={(e) => setForm((p) => ({ ...p, is_current: e.target.value }))}
            margin="normal"
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setSetCurrentOpen(false)}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSetCurrentSubmit} disabled={submitting}>
            {submitting ? <Skeleton variant="text" width={80} height={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm((p) => ({ ...p, open: false }))} />
    </>
  );
});

// ─── Terms Panel ───────────────────────────────────────────────────────────
const TermsPanel = forwardRef(function TermsPanel({ isLevel1, onStatsChange }, ref) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ term_name: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [filterDraft, setFilterDraft] = useState({ search: '', status: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', status: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Search/status are sent to the backend as query params — never filtered
  // client-side — so `terms` here is already exactly what should render.
  const fetchTerms = useCallback(async (filters) => {
    setLoading(true);
    try {
      const res = await agentApi.get('/v1/landlord/calendar/terms', { params: filters });
      setTerms(res.data.data);
      setStats(res.data.stats);
    } catch {
      notify.error('Failed to load terms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms(activeFilters);
  }, [fetchTerms, activeFilters]);

  // Reported up so the page-level stats row (above the tabs) can show
  // whichever tab is active, instead of duplicating a stats row per panel.
  useEffect(() => {
    onStatsChange?.({ stats, loading });
  }, [stats, loading, onStatsChange]);

  const handleFilterApply = () => {
    setActiveFilters(filterDraft);
  };

  const handleFilterReset = () => {
    setFilterDraft({ search: '', status: '' });
    setActiveFilters({ search: '', status: '' });
  };

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== '').length;

  const openCreate = () => {
    setEditTarget(null);
    setForm({ term_name: '', status: 'active' });
    setErrors({});
    setCreateOpen(true);
  };

  // Exposed so the page-level stats row can trigger a manual refresh for
  // whichever tab is active.
  useImperativeHandle(ref, () => ({ openCreate, refresh: () => fetchTerms(activeFilters) }));

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

    // Update sort_order values locally to reflect the new order
    const updatedTerms = reordered.map((term, index) => ({
      ...term,
      sort_order: index + 1,
    }));

    setTerms(updatedTerms);
    setReordering(true);
    try {
      await agentApi.put('/v1/landlord/calendar/terms/reorder', {
        ids: reordered.map((t) => t.id),
      });
      notify.success('Term order updated successfully');
      // Refresh data to ensure consistency with backend
      fetchTerms(activeFilters);
    } catch {
      notify.error('Failed to save order');
      fetchTerms(activeFilters);
    } finally {
      setReordering(false);
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
      setSubmitting(true);
      if (editTarget) {
        await agentApi.put(`/v1/landlord/calendar/terms/${editTarget.id}`, form);
        notify.success('Term updated');
      } else {
        await agentApi.post('/v1/landlord/calendar/terms', form);
        notify.success('Term created');
      }
      closeDialog();
      fetchTerms(activeFilters);
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      if (Object.keys(serverErrors).length) setErrors(serverErrors);
      else notify.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = (t) => {
    const isInactive = t.status?.toLowerCase() === 'inactive';

    setConfirm({
      open: true,
      title: isInactive ? 'Activate Term' : 'De-activate Term',
      message: isInactive ? `Activate "${t.term_name}"?` : `De-activate "${t.term_name}"?`,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await agentApi.put(`/v1/landlord/calendar/terms/${t.id}/toggle-status`);
          notify.success(isInactive ? 'Term activated' : 'Term de-activated');
          fetchTerms(activeFilters);
        } catch (err) {
          notify.error(err.response?.data?.message || 'Failed to update');
        }
      },
    });
  };

  const handleEdit = (t) => {
    handleMenuClose();
    openEdit(t);
  };

  const handleDeactivateClick = (t) => {
    handleMenuClose();
    handleDeactivate(t);
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
      {!isLevel1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Only Level 1 agents can manage global terms.
        </Alert>
      )}
      <InlineFilterBar
        searchPlaceholder="Search by term name…"
        draft={filterDraft}
        onDraftChange={setFilterDraft}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        hasActiveFilters={activeFilterCount > 0}
      />
      {isLevel1 && terms.length > 1 && (
        <Alert severity="info" icon={<IconGripVertical size={16} />} sx={{ mb: 2 }}>
          Drag the grip handle on the left to reorder terms.
        </Alert>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <TableContainer>
          <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1.5 } }}>
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
              {loading || reordering ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" width={j === 0 ? 30 : 60} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : terms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No terms found
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={terms.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {terms.map((t, idx) => (
                    <SortableRow key={t.id} id={t.id} disabled={!isLevel1}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{t.term_name}</TableCell>
                      <TableCell>{t.sort_order}</TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          size="small"
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
                            {t.status?.toLowerCase() === 'inactive' ? (
                              <MenuItem onClick={() => handleDeactivateClick(t)}>
                                <IconCheck size={16} style={{ marginRight: 8 }} />
                                Activate
                              </MenuItem>
                            ) : (
                              <MenuItem
                                onClick={() => handleDeactivateClick(t)}
                                sx={{ color: 'error.main' }}
                              >
                                <IconTrash size={16} style={{ marginRight: 8 }} />
                                De-activate
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      )}
                    </SortableRow>
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>

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
          <Button variant="contained" size="small" onClick={closeDialog}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Skeleton variant="text" width={80} height={20} />
            ) : editTarget ? (
              'Save Changes'
            ) : (
              'Create Term'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm((p) => ({ ...p, open: false }))} />
    </>
  );
});

// ─── Main Page ─────────────────────────────────────────────────────────────
const EMPTY_STATS = { stats: {}, loading: true };

const CalendarManagement = () => {
  const [tab, setTab] = useState(0);
  const agentRaw = localStorage.getItem('agent') || sessionStorage.getItem('agent');
  const agent = agentRaw ? JSON.parse(agentRaw) : null;
  const isLevel1 = !agent?.parent_id;
  const sessionsPanelRef = useRef(null);
  const termsPanelRef = useRef(null);

  // Fed by each panel (see onStatsChange) so this one row at the very top of
  // the page can show live totals for whichever tab is active, instead of a
  // stats row duplicated inside every tab panel.
  const [sessionStats, setSessionStats] = useState(EMPTY_STATS);
  const [termStats, setTermStats] = useState(EMPTY_STATS);

  const active = tab === 0 ? sessionStats : termStats;

  return (
    <>
      <Breadcrumb title="Calendar Management" items={BCrumb} />

      {/* Page-level live stats — reflects whichever tab is active */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        {tab === 0 ? (
          <>
            <MiniStat
              label="Total Sessions"
              value={active.stats.total}
              loading={active.loading}
              icon={IconCalendarStats}
            />
            <MiniStat
              label="Active"
              value={active.stats.active}
              loading={active.loading}
              color="success.main"
              icon={IconCircleCheck}
            />
            <MiniStat
              label="Current Session"
              value={active.stats.current}
              loading={active.loading}
              color="primary.main"
              icon={IconStar}
            />
          </>
        ) : (
          <>
            <MiniStat
              label="Total Terms"
              value={active.stats.total}
              loading={active.loading}
              icon={IconCalendarStats}
            />
            <MiniStat
              label="Active"
              value={active.stats.active}
              loading={active.loading}
              color="success.main"
              icon={IconCircleCheck}
            />
            <MiniStat
              label="Inactive"
              value={active.stats.inactive}
              loading={active.loading}
              color="error.main"
              icon={IconCircleX}
            />
          </>
        )}
      </Box>

      <ParentCard sx={{ px: 0.5, py: 0, '& .MuiCardContent-root': { p: 0, pt: 0 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ minHeight: 36, py: 0, borderBottom: 0 }}
          >
            <Tab label="Sessions" />
            <Tab label="Terms" />
          </Tabs>
          {isLevel1 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<IconPlus />}
              onClick={() =>
                tab === 0
                  ? sessionsPanelRef.current?.openCreate()
                  : termsPanelRef.current?.openCreate()
              }
              sx={{ mr: 1.5 }}
            >
              {tab === 0 ? 'New Session' : 'New Term'}
            </Button>
          )}
        </Box>
        <TabPanel value={tab} index={0}>
          <SessionsPanel ref={sessionsPanelRef} isLevel1={isLevel1} onStatsChange={setSessionStats} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <TermsPanel ref={termsPanelRef} isLevel1={isLevel1} onStatsChange={setTermStats} />
        </TabPanel>
      </ParentCard>
    </>
  );
};

export default CalendarManagement;
