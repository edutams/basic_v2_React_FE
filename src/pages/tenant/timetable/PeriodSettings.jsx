import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import {
  Box,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  IconButton,
  Chip,
  Checkbox,
  FormControlLabel,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'School Day & Period Settings' }];

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const emptyPeriodForm = { id: null, label: '', start_time: '', end_time: '', is_break: false };
const emptyRoomForm = { id: null, name: '', capacity: '', type: '' };

const PeriodSettings = () => {
  const notify = useNotification();

  const [periods, setPeriods] = useState([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodForm, setPeriodForm] = useState(null);
  const [periodSaving, setPeriodSaving] = useState(false);
  const [periodDeleteTarget, setPeriodDeleteTarget] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomForm, setRoomForm] = useState(null);
  const [roomSaving, setRoomSaving] = useState(false);
  const [roomDeleteTarget, setRoomDeleteTarget] = useState(null);

  const [schoolDays, setSchoolDays] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fetchPeriods = useCallback(async () => {
    setPeriodsLoading(true);
    try {
      const res = await timetableApi.getPeriods();
      setPeriods(res.data.data || []);
    } catch {
      notify.error('Failed to load periods');
    } finally {
      setPeriodsLoading(false);
    }
  }, [notify]);

  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const res = await timetableApi.getRooms();
      setRooms(res.data.data || []);
    } catch {
      notify.error('Failed to load rooms');
    } finally {
      setRoomsLoading(false);
    }
  }, [notify]);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await timetableApi.getSettings();
      setSchoolDays(res.data.data?.school_days || []);
    } catch {
      notify.error('Failed to load school-day settings');
    } finally {
      setSettingsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchPeriods();
    fetchRooms();
    fetchSettings();
  }, [fetchPeriods, fetchRooms, fetchSettings]);

  // ── Periods ──────────────────────────────────────────────────────────
  const openAddPeriod = () => setPeriodForm({ ...emptyPeriodForm });
  const openEditPeriod = (p) =>
    setPeriodForm({ id: p.id, label: p.label, start_time: p.start_time?.slice(0, 5) || '', end_time: p.end_time?.slice(0, 5) || '', is_break: p.is_break });

  const handleSavePeriod = async () => {
    if (!periodForm.label || !periodForm.start_time || !periodForm.end_time) return;
    setPeriodSaving(true);
    try {
      const payload = { label: periodForm.label, start_time: periodForm.start_time, end_time: periodForm.end_time, is_break: periodForm.is_break };
      if (periodForm.id) {
        await timetableApi.updatePeriod(periodForm.id, payload);
        notify.success('Period updated successfully');
      } else {
        await timetableApi.createPeriod(payload);
        notify.success('Period created successfully');
      }
      setPeriodForm(null);
      fetchPeriods();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save period');
    } finally {
      setPeriodSaving(false);
    }
  };

  const handleDeletePeriod = async () => {
    try {
      await timetableApi.deletePeriod(periodDeleteTarget.id);
      notify.success('Period deleted successfully');
      setPeriodDeleteTarget(null);
      fetchPeriods();
    } catch {
      notify.error('Failed to delete period');
    }
  };

  const movePeriod = async (period, direction) => {
    const sorted = [...periods].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((p) => p.id === period.id);
    const swapWith = direction === 'up' ? sorted[idx - 1] : sorted[idx + 1];
    if (!swapWith) return;
    try {
      await Promise.all([
        timetableApi.updatePeriod(period.id, { order: swapWith.order }),
        timetableApi.updatePeriod(swapWith.id, { order: period.order }),
      ]);
      fetchPeriods();
    } catch {
      notify.error('Failed to reorder periods');
    }
  };

  // ── Rooms ────────────────────────────────────────────────────────────
  const openAddRoom = () => setRoomForm({ ...emptyRoomForm });
  const openEditRoom = (r) => setRoomForm({ id: r.id, name: r.name, capacity: r.capacity || '', type: r.type || '' });

  const handleSaveRoom = async () => {
    if (!roomForm.name) return;
    setRoomSaving(true);
    try {
      const payload = { name: roomForm.name, capacity: roomForm.capacity || null, type: roomForm.type || null };
      if (roomForm.id) {
        await timetableApi.updateRoom(roomForm.id, payload);
        notify.success('Room updated successfully');
      } else {
        await timetableApi.createRoom(payload);
        notify.success('Room created successfully');
      }
      setRoomForm(null);
      fetchRooms();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save room');
    } finally {
      setRoomSaving(false);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await timetableApi.deleteRoom(roomDeleteTarget.id);
      notify.success('Room deleted successfully');
      setRoomDeleteTarget(null);
      fetchRooms();
    } catch {
      notify.error('Failed to delete room');
    }
  };

  // ── School days ──────────────────────────────────────────────────────
  const toggleDay = (day) => {
    setSchoolDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSaveSchoolDays = async () => {
    setSettingsSaving(true);
    try {
      await timetableApi.updateSettings({ school_days: schoolDays });
      notify.success('School days updated successfully');
    } catch {
      notify.error('Failed to update school days');
    } finally {
      setSettingsSaving(false);
    }
  };

  const sortedPeriods = [...periods].sort((a, b) => a.order - b.order);

  return (
    <PageContainer title="School Day & Period Settings" description="Configure school days, periods, breaks and rooms used to build the timetable.">
      <Breadcrumb title="School Day & Period Settings" items={BCrumb} />

      <Stack spacing={2}>
        <ParentCard title={<Typography variant="h5">School Days</Typography>}>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {WEEKDAYS.map((day) => (
              <FormControlLabel
                key={day}
                control={<Checkbox size="small" checked={schoolDays.includes(day)} onChange={() => toggleDay(day)} disabled={settingsLoading} />}
                label={<Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{day}</Typography>}
              />
            ))}
          </Stack>
          <Button variant="contained" size="small" onClick={handleSaveSchoolDays} disabled={settingsSaving || settingsLoading}>
            Save School Days
          </Button>
        </ParentCard>

        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5">Periods</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openAddPeriod}>
                Add Period
              </Button>
            </Box>
          }
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 90 }}>Order</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periodsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton variant="text" height={28} />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedPeriods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No periods configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                sortedPeriods.map((p, idx) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Stack direction="row" spacing={0.25}>
                        <IconButton size="small" disabled={idx === 0} onClick={() => movePeriod(p, 'up')}>
                          <ArrowUpwardIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton size="small" disabled={idx === sortedPeriods.length - 1} onClick={() => movePeriod(p, 'down')}>
                          <ArrowDownwardIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>{p.label}</TableCell>
                    <TableCell>{p.start_time?.slice(0, 5)}</TableCell>
                    <TableCell>{p.end_time?.slice(0, 5)}</TableCell>
                    <TableCell>
                      {p.is_break ? <Chip size="small" label="Break" color="warning" /> : <Chip size="small" label="Teaching" color="success" />}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openEditPeriod(p)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setPeriodDeleteTarget(p)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ParentCard>

        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5">Rooms</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openAddRoom}>
                Add Room
              </Button>
            </Box>
          }
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton variant="text" height={28} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No rooms added yet.
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MeetingRoomIcon fontSize="small" sx={{ color: '#2563EB' }} />
                        <Typography variant="body2">{r.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{r.type || '—'}</TableCell>
                    <TableCell>{r.capacity || '—'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openEditRoom(r)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setRoomDeleteTarget(r)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ParentCard>
      </Stack>

      <Dialog open={Boolean(periodForm)} onClose={() => setPeriodForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{periodForm?.id ? 'Edit Period' : 'Add Period'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              size="small"
              fullWidth
              value={periodForm?.label || ''}
              onChange={(e) => setPeriodForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Period 1 or Morning Break"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Start time"
                type="time"
                size="small"
                fullWidth
                value={periodForm?.start_time || ''}
                onChange={(e) => setPeriodForm((f) => ({ ...f, start_time: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End time"
                type="time"
                size="small"
                fullWidth
                value={periodForm?.end_time || ''}
                onChange={(e) => setPeriodForm((f) => ({ ...f, end_time: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <FormControlLabel
              control={<Switch checked={Boolean(periodForm?.is_break)} onChange={(e) => setPeriodForm((f) => ({ ...f, is_break: e.target.checked }))} />}
              label="This is a break (not a teaching period)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setPeriodForm(null)}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSavePeriod} disabled={periodSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(periodDeleteTarget)} onClose={() => setPeriodDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Period</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{periodDeleteTarget?.label}</strong>? Any timetable periods already assigned to it will be deleted too.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setPeriodDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="contained" size="small" color="error" onClick={handleDeletePeriod} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(roomForm)} onClose={() => setRoomForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{roomForm?.id ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" size="small" fullWidth value={roomForm?.name || ''} onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label="Type (optional)" size="small" fullWidth placeholder="e.g. classroom, lab" value={roomForm?.type || ''} onChange={(e) => setRoomForm((f) => ({ ...f, type: e.target.value }))} />
            <TextField
              label="Capacity (optional)"
              type="number"
              size="small"
              fullWidth
              value={roomForm?.capacity || ''}
              onChange={(e) => setRoomForm((f) => ({ ...f, capacity: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setRoomForm(null)}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSaveRoom} disabled={roomSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(roomDeleteTarget)} onClose={() => setRoomDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{roomDeleteTarget?.name}</strong>? Periods assigned to this room will keep their subject/teacher but lose the room.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setRoomDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="contained" size="small" color="error" onClick={handleDeleteRoom} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PeriodSettings;
