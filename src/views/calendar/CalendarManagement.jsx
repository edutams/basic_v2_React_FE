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
} from '@mui/material';
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconEdit,
} from '@tabler/icons-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
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
        <Button variant="contained" color="error" onClick={onConfirm}>Yes, Proceed</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Sortable Row Wrapper ──────────────────────────────────────────────────
function SortableRow({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f0f4ff' : undefined,
  };
  return (
    <TableRow ref={setNodeRef} style={style} hover>
      <TableCell sx={{ width: 32, color: 'text.disabled', cursor: disabled ? 'default' : 'grab', px: 1 }}>
        {!disabled && <span {...attributes} {...listeners}><IconGripVertical size={18} /></span>}
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
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.get('/agent/calendar/sessions');
      setSessions(res.data);
    } catch { notify.error('Failed to load sessions'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const openCreate = () => { setEditTarget(null); setForm({ sesname: '', status: 'active', is_current: 'no' }); setErrors({}); setCreateOpen(true); };
  const openEdit = (s) => { setEditTarget(s); setForm({ sesname: s.sesname, status: s.status, is_current: s.is_current }); setErrors({}); setCreateOpen(true); };
  const closeDialog = () => { setCreateOpen(false); setEditTarget(null); setErrors({}); };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(sessions, sessions.findIndex(s => s.id === active.id), sessions.findIndex(s => s.id === over.id));
    setSessions(reordered);
    try { await agentApi.put('/agent/calendar/sessions/reorder', { ids: reordered.map(s => s.id) }); }
    catch { notify.error('Failed to save order'); fetchSessions(); }
  };

  const validate = () => {
    const errs = {};
    if (!form.sesname || !/^\d{4}\/\d{4}$/.test(form.sesname)) errs.sesname = 'Must be YYYY/YYYY (e.g. 2024/2025)';
    if (!form.status) errs.status = 'Required';
    if (!form.is_current) errs.is_current = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editTarget) {
        await agentApi.put(`/agent/calendar/sessions/${editTarget.id}`, form);
        notify.success('Session updated');
      } else {
        await agentApi.post('/agent/calendar/sessions', form);
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

  const handleDelete = (s) => setConfirm({
    open: true,
    title: 'Delete Session',
    message: `Delete "${s.sesname}"? This cannot be undone.`,
    onConfirm: async () => {
      setConfirm(p => ({ ...p, open: false }));
      try { await agentApi.delete(`/agent/calendar/sessions/${s.id}`); notify.success('Session deleted'); fetchSessions(); }
      catch (err) { notify.error(err.response?.data?.message || 'Failed to delete'); }
    },
  });

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Academic Sessions</Typography>
        {isLevel1 && <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={openCreate}>New Session</Button>}
      </Box>
      {!isLevel1 && <Alert severity="info" sx={{ mb: 2 }}>Only Level 1 agents can manage global sessions.</Alert>}
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
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : sessions.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No sessions found</TableCell></TableRow>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sessions.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {sessions.map((s, idx) => (
                    <SortableRow key={s.id} id={s.id} disabled={!isLevel1}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{s.sesname}</TableCell>
                      <TableCell>{s.sort_order}</TableCell>
                      <TableCell>
                        <Chip label={s.is_current === 'yes' ? 'Yes' : 'No'} size="small"
                          color={s.is_current === 'yes' ? 'primary' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip label={s.status.toUpperCase()} size="small"
                          color={s.status === 'active' ? 'success' : 'error'} />
                      </TableCell>
                      {isLevel1 && (
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEdit(s)}>
                              <IconEdit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(s)}>
                              <IconTrash size={16} />
                            </IconButton>
                          </Tooltip>
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
            fullWidth label="Session Name (e.g. 2024/2025)" value={form.sesname}
            error={!!errors.sesname} helperText={errors.sesname}
            onChange={e => {
              setErrors(p => ({ ...p, sesname: undefined }));
              const raw = e.target.value;
              if (raw.length < form.sesname.length) { setForm(p => ({ ...p, sesname: raw })); return; }
              const digitsOnly = raw.replace(/[^0-9/]/g, '');
              const pure = digitsOnly.replace(/\//g, '');
              if (pure.length === 4 && !digitsOnly.includes('/')) {
                const year = parseInt(pure, 10);
                setForm(p => ({ ...p, sesname: `${year}/${year + 1}` }));
              } else if (pure.length > 4) { return; }
              else { setForm(p => ({ ...p, sesname: digitsOnly })); }
            }}
            margin="normal" inputProps={{ maxLength: 9, placeholder: '2024/2025' }}
          />
          <TextField fullWidth select label="Status" value={form.status}
            error={!!errors.status} helperText={errors.status}
            onChange={e => { setErrors(p => ({ ...p, status: undefined })); setForm(p => ({ ...p, status: e.target.value })); }} margin="normal">
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField fullWidth select label="Set as Current Session?" value={form.is_current}
            error={!!errors.is_current} helperText={errors.is_current}
            onChange={e => { setErrors(p => ({ ...p, is_current: undefined })); setForm(p => ({ ...p, is_current: e.target.value })); }} margin="normal">
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editTarget ? 'Save Changes' : 'Create Session'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm(p => ({ ...p, open: false }))} />
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
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.get('/agent/calendar/terms');
      setTerms(res.data);
    } catch { notify.error('Failed to load terms'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTerms(); }, [fetchTerms]);

  const openCreate = () => { setEditTarget(null); setForm({ term_name: '', status: 'active' }); setErrors({}); setCreateOpen(true); };
  const openEdit = (t) => { setEditTarget(t); setForm({ term_name: t.term_name, status: t.status }); setErrors({}); setCreateOpen(true); };
  const closeDialog = () => { setCreateOpen(false); setEditTarget(null); setErrors({}); };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(terms, terms.findIndex(t => t.id === active.id), terms.findIndex(t => t.id === over.id));
    setTerms(reordered);
    try { await agentApi.put('/agent/calendar/terms/reorder', { ids: reordered.map(t => t.id) }); }
    catch { notify.error('Failed to save order'); fetchTerms(); }
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
        await agentApi.put(`/agent/calendar/terms/${editTarget.id}`, form);
        notify.success('Term updated');
      } else {
        await agentApi.post('/agent/calendar/terms', form);
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

  const handleDelete = (t) => setConfirm({
    open: true,
    title: 'Delete Term',
    message: `Delete "${t.term_name}"? This cannot be undone.`,
    onConfirm: async () => {
      setConfirm(p => ({ ...p, open: false }));
      try { await agentApi.delete(`/agent/calendar/terms/${t.id}`); notify.success('Term deleted'); fetchTerms(); }
      catch (err) { notify.error(err.response?.data?.message || 'Failed to delete'); }
    },
  });

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Academic Terms</Typography>
        {isLevel1 && <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={openCreate}>New Term</Button>}
      </Box>
      {!isLevel1 && <Alert severity="info" sx={{ mb: 2 }}>Only Level 1 agents can manage global terms.</Alert>}
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
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : terms.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No terms found</TableCell></TableRow>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={terms.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {terms.map((t, idx) => (
                    <SortableRow key={t.id} id={t.id} disabled={!isLevel1}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{t.term_name}</TableCell>
                      <TableCell>{t.sort_order}</TableCell>
                      <TableCell>
                        <Chip label={t.status.toUpperCase()} size="small"
                          color={t.status === 'active' ? 'success' : 'error'} />
                      </TableCell>
                      {isLevel1 && (
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEdit(t)}>
                              <IconEdit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(t)}>
                              <IconTrash size={16} />
                            </IconButton>
                          </Tooltip>
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
          <TextField fullWidth label="Term Name (e.g. First Term)" value={form.term_name}
            error={!!errors.term_name} helperText={errors.term_name}
            onChange={e => { setErrors(p => ({ ...p, term_name: undefined })); setForm(p => ({ ...p, term_name: e.target.value })); }}
            margin="normal" />
          <TextField fullWidth select label="Status" value={form.status}
            error={!!errors.status} helperText={errors.status}
            onChange={e => { setErrors(p => ({ ...p, status: undefined })); setForm(p => ({ ...p, status: e.target.value })); }} margin="normal">
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editTarget ? 'Save Changes' : 'Create Term'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm(p => ({ ...p, open: false }))} />
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
  const notify = useNotification();
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, sRes, tRes] = await Promise.all([
        agentApi.get('/agent/calendar/mappings'),
        agentApi.get('/agent/calendar/sessions'),
        agentApi.get('/agent/calendar/terms'),
      ]);
      setMappings(mRes.data); setSessions(sRes.data); setTerms(tRes.data);
    } catch { notify.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(mappings, mappings.findIndex(m => m.id === active.id), mappings.findIndex(m => m.id === over.id));
    setMappings(reordered);
    try { await agentApi.put('/agent/calendar/mappings/reorder', { ids: reordered.map(m => m.id) }); }
    catch { notify.error('Failed to save order'); fetchAll(); }
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
      await agentApi.post('/agent/calendar/mappings', form);
      notify.success('Mapping saved');
      setDialogOpen(false); setErrors({}); setForm({ session_id: '', term_id: '', status: 'active' });
      fetchAll();
    } catch (err) { notify.error(err.response?.data?.message || 'Failed to save mapping'); }
  };

  const handleDelete = (m) => setConfirm({
    open: true, title: 'Delete Mapping',
    message: `Delete "${m.session?.sesname} / ${m.term?.term_name}"? This cannot be undone.`,
    onConfirm: async () => {
      setConfirm(p => ({ ...p, open: false }));
      try { await agentApi.delete(`/agent/calendar/mappings/${m.id}`); notify.success('Mapping removed'); fetchAll(); }
      catch (err) { notify.error(err.response?.data?.message || 'Failed'); }
    },
  });

  const handleActivate = (m) => setConfirm({
    open: true, title: 'Activate Mapping',
    message: `Activate "${m.session?.sesname} / ${m.term?.term_name}"? All others will be set to inactive.`,
    onConfirm: async () => {
      setConfirm(p => ({ ...p, open: false }));
      try { await agentApi.put(`/agent/calendar/mappings/${m.id}/activate`); notify.success('Mapping activated'); fetchAll(); }
      catch (err) { notify.error(err.response?.data?.message || 'Failed'); }
    },
  });

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>My Session–Term Mappings</Typography>
        <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setDialogOpen(true)}>Add Mapping</Button>
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
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : mappings.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No mappings yet. Add a session-term pair.</TableCell></TableRow>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={mappings.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  {mappings.map((m, idx) => (
                    <SortableRow key={m.id} id={m.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{m.session?.sesname}</TableCell>
                      <TableCell>{m.term?.term_name}</TableCell>
                      <TableCell>{m.sort_order}</TableCell>
                      <TableCell>
                        <Chip label={m.status.toUpperCase()} size="small"
                          color={m.status === 'active' ? 'success' : 'error'} />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        {m.status === 'inactive' && (
                          <Button size="small" variant="outlined" color="success" sx={{ mr: 1 }} onClick={() => handleActivate(m)}>
                            Activate
                          </Button>
                        )}
                        <Tooltip title="Delete">
                          <IconButton color="error" size="small" onClick={() => handleDelete(m)}>
                            <IconTrash size={16} />
                          </IconButton>
                        </Tooltip>
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
          <TextField fullWidth select label="Session" value={form.session_id}
            error={!!errors.session_id} helperText={errors.session_id}
            onChange={e => { setErrors(p => ({ ...p, session_id: undefined })); setForm(p => ({ ...p, session_id: e.target.value })); }} margin="normal">
            <MenuItem value="">Select Session</MenuItem>
            {sessions.map(s => <MenuItem key={s.id} value={s.id}>{s.sesname}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Term" value={form.term_id}
            error={!!errors.term_id} helperText={errors.term_id}
            onChange={e => { setErrors(p => ({ ...p, term_id: undefined })); setForm(p => ({ ...p, term_id: e.target.value })); }} margin="normal">
            <MenuItem value="">Select Term</MenuItem>
            {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Status" value={form.status}
            error={!!errors.status} helperText={errors.status}
            onChange={e => { setErrors(p => ({ ...p, status: undefined })); setForm(p => ({ ...p, status: e.target.value })); }} margin="normal">
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save Mapping</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog {...confirm} onCancel={() => setConfirm(p => ({ ...p, open: false }))} />
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
        <ParentCard title="Session–Term Mappings"><MappingsPanel /></ParentCard>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Calendar Management" items={BCrumb} />
      <ParentCard title="Calendar Management">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tab label="Sessions" />
          <Tab label="Terms" />
          <Tab label="My Mappings" />
        </Tabs>
        <TabPanel value={tab} index={0}><SessionsPanel isLevel1={isLevel1} /></TabPanel>
        <TabPanel value={tab} index={1}><TermsPanel isLevel1={isLevel1} /></TabPanel>
        <TabPanel value={tab} index={2}><MappingsPanel /></TabPanel>
      </ParentCard>
    </>
  );
};

export default CalendarManagement;
