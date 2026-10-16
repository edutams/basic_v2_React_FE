import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from 'src/components/shared/StatCard';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { getClassesWithDivisions } from '@/api/tenant/set-up/tenant-setup';
import {
  Box,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DomainIcon from '@mui/icons-material/Domain';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Generate Timetable' }];

const SUBJECT_FALLBACK_COLOR = '#64748B';
const ARM_DOT_COLORS = ['#2563EB', '#16A34A', '#9333EA', '#D97706', '#DC2626', '#0891B2'];

const armLabel = (arm) => {
  const names = arm?.class_arm_names;
  return Array.isArray(names) ? names.filter(Boolean).join(', ') : names || '—';
};

const pct = (num, den) => (den ? Math.round((num / den) * 100) : 0);

const GenerateTimetable = () => {
  const notify = useNotification();

  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  const [classes, setClasses] = useState([]);
  const [programmeClassId, setProgrammeClassId] = useState('');

  const [arms, setArms] = useState([]);
  const [visibleArmIds, setVisibleArmIds] = useState(new Set());
  const [armsLoading, setArmsLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [rooms, setRooms] = useState([]);

  const [periods, setPeriods] = useState([]);
  const [gridByArm, setGridByArm] = useState({});
  const [gridLoading, setGridLoading] = useState(false);

  const [assignTarget, setAssignTarget] = useState(null); // {anchorEl, armId, periodId}
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await timetableApi.getStats();
      setStats(res.data.data || {});
    } catch {
      notify.error('Failed to load timetable stats');
    } finally {
      setStatsLoading(false);
    }
  }, [notify]);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await getClassesWithDivisions();
      const flat = [];
      (data || []).forEach((division) => {
        (division.programmes || []).forEach((programme) => {
          (programme.classes || []).forEach((cls) => {
            flat.push({ id: cls.pivot?.id, label: `${programme.programme_code} - ${cls.class_code}` });
          });
        });
      });
      setClasses(flat);
      setProgrammeClassId((prev) => prev || flat[0]?.id || '');
    } catch {
      notify.error('Failed to load classes');
    }
  }, [notify]);

  const fetchSubjectsAndRooms = useCallback(async () => {
    try {
      const [subRes, roomRes] = await Promise.all([timetableApi.getSubjects(), timetableApi.getRooms()]);
      setSubjects(subRes.data.data || []);
      setRooms(roomRes.data.data || []);
    } catch {
      notify.error('Failed to load subjects/rooms');
    }
  }, [notify]);

  useEffect(() => {
    fetchStats();
    fetchClasses();
    fetchSubjectsAndRooms();
  }, [fetchStats, fetchClasses, fetchSubjectsAndRooms]);

  const fetchArms = useCallback(async () => {
    if (!programmeClassId) {
      setArms([]);
      return;
    }
    setArmsLoading(true);
    try {
      const res = await timetableApi.getClassArms({ programme_class_id: programmeClassId });
      const list = res.data.data || [];
      setArms(list);
      setVisibleArmIds(new Set(list.map((a) => a.id)));
    } catch {
      notify.error('Failed to load class arms');
    } finally {
      setArmsLoading(false);
    }
  }, [programmeClassId, notify]);

  useEffect(() => {
    fetchArms();
  }, [fetchArms]);

  const fetchGrid = useCallback(async () => {
    if (arms.length === 0) {
      setPeriods([]);
      setGridByArm({});
      return;
    }
    setGridLoading(true);
    try {
      const results = await Promise.all(arms.map((arm) => timetableApi.getClassArmGrid(arm.id)));
      const rows0 = results[0]?.data?.data || [];
      const byArm = {};
      arms.forEach((arm, idx) => {
        const rows = results[idx]?.data?.data || [];
        byArm[arm.id] = {};
        rows.forEach((row) => {
          byArm[arm.id][row.period.id] = row.slot;
        });
      });
      setPeriods(rows0.map((row) => row.period));
      setGridByArm(byArm);
    } catch {
      notify.error('Failed to load the timetable grid');
    } finally {
      setGridLoading(false);
    }
  }, [arms, notify]);

  useEffect(() => {
    fetchGrid();
  }, [fetchGrid]);

  const refreshAll = () => {
    fetchStats();
    fetchGrid();
  };

  const toggleArmVisible = (armId) => {
    setVisibleArmIds((prev) => {
      const next = new Set(prev);
      if (next.has(armId)) {
        next.delete(armId);
      } else {
        next.add(armId);
      }
      return next;
    });
  };

  const visibleArms = useMemo(() => arms.filter((a) => visibleArmIds.has(a.id)), [arms, visibleArmIds]);
  const nonBreakPeriods = useMemo(() => periods.filter((p) => !p.is_break), [periods]);

  const armCompletion = (armId) => {
    const assigned = nonBreakPeriods.filter((p) => gridByArm[armId]?.[p.id]).length;
    return { assigned, total: nonBreakPeriods.length, percent: pct(assigned, nonBreakPeriods.length) };
  };

  const openAssign = (e, armId, periodId) => {
    const slot = gridByArm[armId]?.[periodId];
    setAssignTarget({ anchorEl: e.currentTarget, armId, periodId });
    setAssignSubjectId(slot?.subject_id || '');
    setAssignRoomId(slot?.room_id || '');
    setAssignError('');
  };

  const closeAssign = () => setAssignTarget(null);

  const handleSaveAssign = async () => {
    if (!assignSubjectId || !assignTarget) return;
    setAssignSaving(true);
    setAssignError('');
    const slot = gridByArm[assignTarget.armId]?.[assignTarget.periodId];
    try {
      const payload = {
        class_arm_id: assignTarget.armId,
        period_id: assignTarget.periodId,
        subject_id: assignSubjectId,
        room_id: assignRoomId || null,
      };
      if (slot?.id) {
        await timetableApi.updateSlot(slot.id, payload);
      } else {
        await timetableApi.assignSlot(payload);
      }
      notify.success('Period assigned successfully');
      closeAssign();
      refreshAll();
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign period');
    } finally {
      setAssignSaving(false);
    }
  };

  const handleRemoveAssign = async () => {
    const slot = gridByArm[assignTarget.armId]?.[assignTarget.periodId];
    if (!slot?.id) return;
    setAssignSaving(true);
    try {
      await timetableApi.clearSlot(slot.id);
      notify.success('Period cleared');
      closeAssign();
      refreshAll();
    } catch {
      notify.error('Failed to clear period');
    } finally {
      setAssignSaving(false);
    }
  };

  const handleClearClass = async () => {
    setClearing(true);
    try {
      await Promise.all(Array.from(visibleArmIds).map((armId) => timetableApi.clearClassArm(armId)));
      notify.success('Class timetable cleared');
      setClearConfirmOpen(false);
      refreshAll();
    } catch {
      notify.error('Failed to clear class timetable');
    } finally {
      setClearing(false);
    }
  };

  const filteredSubjects = subjects.filter((s) => (s.subject_name || '').toLowerCase().includes(subjectSearch.toLowerCase()));
  const selectedClassLabel = classes.find((c) => c.id === programmeClassId)?.label;

  return (
    <PageContainer title="Generate Timetable" description="Assign subjects to each period and class arm. The system validates and helps build a conflict-free timetable.">
      <Breadcrumb title="Generate Timetable" items={BCrumb} />

      <Box sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
          <StatCard
            count={`${stats.periods_assigned ?? 0} / ${stats.periods_target ?? 0}`}
            label="Timetable Completion"
            icon={CalendarMonthIcon}
            colorIndex={0}
            loading={statsLoading}
            subtitle={`${stats.unassigned_periods ?? 0} periods unassigned`}
            tooltip="Periods assigned vs. total possible periods (non-break periods × active class arms) this term."
            progress={pct(stats.periods_assigned, stats.periods_target)}
          />
          <StatCard
            count={stats.total_class_arms ?? 0}
            label="Classes & Arms"
            icon={DomainIcon}
            colorIndex={1}
            loading={statsLoading}
            subtitle={`${stats.total_classes ?? 0} classes`}
            tooltip="Total active classes and class arms in the school."
          />
          <StatCard
            count={`${stats.subjects_used ?? 0} of ${stats.subjects_total ?? 0}`}
            label="Subject Allocation"
            icon={MenuBookIcon}
            colorIndex={2}
            loading={statsLoading}
            subtitle="Subjects used in the timetable"
            tooltip="Subjects scheduled at least once vs. total active subjects."
            progress={pct(stats.subjects_used, stats.subjects_total)}
          />
          <StatCard
            count={stats.teachers_assigned ?? 0}
            label="Teacher Utilisation"
            icon={PersonIcon}
            colorIndex={3}
            loading={statsLoading}
            subtitle={`of ${stats.teachers_total ?? 0} teaching staff`}
            tooltip="Teachers with at least one class/subject allocation this term."
            progress={pct(stats.teachers_assigned, stats.teachers_total)}
          />
          <StatCard
            count={stats.conflicts ?? 0}
            label="Conflicts & Issues"
            icon={WarningAmberIcon}
            colorIndex={4}
            loading={statsLoading}
            subtitle={`${stats.unassigned_periods ?? 0} unassigned periods`}
            tooltip="Scheduling conflicts detected — assigning a period that would double-book a teacher or room is blocked before it happens."
          />
          <StatCard
            count={stats.rooms_in_use ?? 0}
            label="Room/Facility Usage"
            icon={MeetingRoomIcon}
            colorIndex={0}
            loading={statsLoading}
            subtitle={`of ${stats.rooms_total ?? 0} rooms`}
            tooltip="Rooms currently assigned to at least one period this term."
            progress={pct(stats.rooms_in_use, stats.rooms_total)}
          />
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems="flex-start">
        <ParentCard
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
            '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
          }}
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h5">{selectedClassLabel ? `Timetable for ${selectedClassLabel}` : 'Timetable'}</Typography>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel>Class</InputLabel>
                <Select value={programmeClassId} label="Class" onChange={(e) => setProgrammeClassId(e.target.value)}>
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          }
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 130 }}>Period / Time</TableCell>
                  {visibleArms.map((arm, idx) => {
                    const c = armCompletion(arm.id);
                    return (
                      <TableCell key={arm.id} align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ARM_DOT_COLORS[idx % ARM_DOT_COLORS.length] }} />
                          <Typography variant="subtitle2" fontWeight={700}>
                            {armLabel(arm)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {c.assigned}/{c.total} ({c.percent}%)
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {gridLoading || armsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      {visibleArms.map((arm) => (
                        <TableCell key={arm.id}>
                          <Skeleton variant="rounded" height={44} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleArms.length + 1} align="center">
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        No periods configured yet — set them up in School Day &amp; Period Settings first.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) =>
                    period.is_break ? (
                      <TableRow key={period.id}>
                        <TableCell
                          colSpan={visibleArms.length + 1}
                          align="center"
                          sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 700, py: 0.75 }}
                        >
                          {period.label} — {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={period.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {period.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
                          </Typography>
                        </TableCell>
                        {visibleArms.map((arm) => {
                          const slot = gridByArm[arm.id]?.[period.id];
                          return (
                            <TableCell key={arm.id} align="center" onClick={(e) => openAssign(e, arm.id, period.id)} sx={{ cursor: 'pointer' }}>
                              {slot ? (
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.25,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1.5,
                                    bgcolor: `${slot.subject_color || SUBJECT_FALLBACK_COLOR}1A`,
                                    minWidth: 100,
                                  }}
                                >
                                  <Chip
                                    size="small"
                                    label={slot.subject_name}
                                    sx={{
                                      bgcolor: slot.subject_color || SUBJECT_FALLBACK_COLOR,
                                      color: '#fff',
                                      fontWeight: 700,
                                      height: 20,
                                      '& .MuiChip-label': { px: 1 },
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {slot.teacher_name || 'No teacher assigned'}
                                  </Typography>
                                </Box>
                              ) : (
                                <Button size="small" startIcon={<AddIcon fontSize="small" />} sx={{ fontSize: '0.7rem' }}>
                                  Add
                                </Button>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ),
                  )
                )}
              </TableBody>
            </Table>
          </Box>
        </ParentCard>

        <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          <Stack spacing={1.5}>
            <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Class Arms
              </Typography>
              <Stack spacing={0.25}>
                {arms.map((arm, idx) => (
                  <FormControlLabel
                    key={arm.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={visibleArmIds.has(arm.id)}
                        onChange={() => toggleArmVisible(arm.id)}
                        sx={{ color: ARM_DOT_COLORS[idx % ARM_DOT_COLORS.length], '&.Mui-checked': { color: ARM_DOT_COLORS[idx % ARM_DOT_COLORS.length] } }}
                      />
                    }
                    label={<Typography variant="body2">{armLabel(arm)}</Typography>}
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Subjects
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="Search subjects..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                sx={{ mb: 1 }}
              />
              <Stack spacing={0.5} sx={{ maxHeight: 240, overflowY: 'auto' }}>
                {filteredSubjects.map((s) => (
                  <Stack key={s.id} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color || SUBJECT_FALLBACK_COLOR, flexShrink: 0 }} />
                    <Typography variant="body2" noWrap>
                      {s.subject_name}
                    </Typography>
                    {s.subject_code && (
                      <Typography variant="caption" color="text.secondary">
                        {s.subject_code}
                      </Typography>
                    )}
                  </Stack>
                ))}
                {filteredSubjects.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No subjects match.
                  </Typography>
                )}
              </Stack>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
                <Tooltip title="Coming soon">
                  <span>
                    <Button fullWidth disabled size="small" startIcon={<AutoAwesomeIcon fontSize="small" />} variant="outlined">
                      Auto Fill This Class
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Coming soon">
                  <span>
                    <Button fullWidth disabled size="small" startIcon={<ContentCopyIcon fontSize="small" />} variant="outlined">
                      Copy Period to Other Arms
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Coming soon">
                  <span>
                    <Button fullWidth disabled size="small" startIcon={<SwapHorizIcon fontSize="small" />} variant="outlined">
                      Swap Periods
                    </Button>
                  </span>
                </Tooltip>
                <Button
                  fullWidth
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteSweepIcon fontSize="small" />}
                  onClick={() => setClearConfirmOpen(true)}
                  disabled={visibleArmIds.size === 0}
                >
                  Clear This Class
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <Popover
        open={Boolean(assignTarget)}
        anchorEl={assignTarget?.anchorEl}
        onClose={closeAssign}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Assign Period
            </Typography>
            <IconButton size="small" onClick={closeAssign} sx={{ color: 'error.main' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {assignError && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {assignError}
            </Alert>
          )}

          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select value={assignSubjectId} label="Subject" onChange={(e) => setAssignSubjectId(e.target.value)}>
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Room (optional)</InputLabel>
              <Select value={assignRoomId} label="Room (optional)" onChange={(e) => setAssignRoomId(e.target.value)}>
                <MenuItem value="">No room</MenuItem>
                {rooms.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {assignTarget && gridByArm[assignTarget.armId]?.[assignTarget.periodId] && (
                <Button size="small" color="error" onClick={handleRemoveAssign} disabled={assignSaving}>
                  Remove
                </Button>
              )}
              <Button size="small" variant="contained" onClick={handleSaveAssign} disabled={!assignSubjectId || assignSaving}>
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>

      <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Clear This Class</DialogTitle>
        <DialogContent>
          <Typography>
            This will remove every assigned period from <strong>{visibleArmIds.size}</strong> visible class arm(s) of{' '}
            <strong>{selectedClassLabel}</strong> for the current term. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" size="small" onClick={() => setClearConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" size="small" color="error" onClick={handleClearClass} disabled={clearing} autoFocus>
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default GenerateTimetable;
