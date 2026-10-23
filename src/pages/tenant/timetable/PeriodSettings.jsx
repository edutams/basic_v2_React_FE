import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';

const DAY_COLUMNS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DEFAULT_BREAKS = [
  { label: 'Morning Break', start_time: '10:10', end_time: '10:30' },
  { label: 'Lunch Break', start_time: '12:50', end_time: '13:10' },
];

const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatTime12h = (time24) => {
  if (!time24) return '—';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

const formatDuration = (minutes) => {
  if (minutes == null || Number.isNaN(minutes)) return '—';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes} mins`;
};

const rowDuration = (row) => {
  const start = toMinutes(row.start_time);
  const end = toMinutes(row.end_time);
  return start != null && end != null ? end - start : null;
};

const PeriodSettings = () => {
  const notify = useNotification();

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [dayStart, setDayStart] = useState('07:30');
  const [dayEnd, setDayEnd] = useState('15:50');
  const [lessonDuration, setLessonDuration] = useState(40);
  const [breaks, setBreaks] = useState(DEFAULT_BREAKS);

  const [schedule, setSchedule] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const loadSettings = useCallback(
    async (autoPreview = true) => {
      setLoadingSettings(true);
      try {
        const res = await timetableApi.getBasicSettings();
        const data = res.data.data || {};
        const nextStart = data.day_start_time || '07:30';
        const nextEnd = data.day_end_time || '15:50';
        const nextDuration = data.lesson_duration_minutes || 40;
        const nextBreaks = data.breaks?.length ? data.breaks : DEFAULT_BREAKS;

        setDayStart(nextStart);
        setDayEnd(nextEnd);
        setLessonDuration(nextDuration);
        setBreaks(nextBreaks);

        if (autoPreview && data.day_start_time) {
          const previewRes = await timetableApi.previewSchedule({
            day_start_time: nextStart,
            day_end_time: nextEnd,
            lesson_duration_minutes: nextDuration,
            breaks: nextBreaks,
          });
          setSchedule(previewRes.data.data || []);
          setHasGenerated(true);
        }
      } catch {
        notify.error('Failed to load saved settings');
      } finally {
        setLoadingSettings(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateBreak = (index, field, value) => {
    setBreaks((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  const removeBreak = (index) => {
    setBreaks((prev) => prev.filter((_, i) => i !== index));
  };

  const addBreak = () => {
    setBreaks((prev) => [
      ...prev,
      { label: `Break ${prev.length + 1}`, start_time: '', end_time: '' },
    ]);
  };

  const handleGenerate = async () => {
    setGenerateError('');
    if (!dayStart || !dayEnd || !lessonDuration) {
      setGenerateError('Set the school day start/end time and lesson duration first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await timetableApi.previewSchedule({
        day_start_time: dayStart,
        day_end_time: dayEnd,
        lesson_duration_minutes: lessonDuration,
        breaks: breaks.filter((b) => b.label && b.start_time && b.end_time),
      });
      setSchedule(res.data.data || []);
      setHasGenerated(true);
    } catch (err) {
      setGenerateError(
        err.response?.data?.message ||
          'Failed to generate schedule — check your times for overlaps.',
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setHasGenerated(false);
    setSchedule([]);
    setGenerateError('');
    loadSettings(false);
  };

  const handlePreviewPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await timetableApi.previewSchedulePdf({
        day_start_time: dayStart,
        day_end_time: dayEnd,
        lesson_duration_minutes: lessonDuration,
        breaks: breaks.filter((b) => b.label && b.start_time && b.end_time),
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      notify.error('Failed to generate PDF preview');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await timetableApi.saveSchedule({
        day_start_time: dayStart,
        day_end_time: dayEnd,
        lesson_duration_minutes: lessonDuration,
        breaks: breaks.filter((b) => b.label && b.start_time && b.end_time),
        confirm: true,
      });
      notify.success('Schedule saved successfully');
      setSaveConfirmOpen(false);
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    const periodRows = schedule.filter((r) => !r.is_break);
    const breakRows = schedule.filter((r) => r.is_break);
    const totalTeachingMinutes = periodRows.reduce((sum, r) => sum + (rowDuration(r) || 0), 0);

    return {
      totalPeriods: periodRows.length,
      breaksCount: breakRows.length,
      breaksDurationLabel: breakRows.map((r) => formatDuration(rowDuration(r))).join(' + '),
      totalSchoolHours: formatDuration(totalTeachingMinutes),
    };
  }, [schedule]);

  return (
    <PageContainer
      title="School Day & Period Settings"
      description="Enter the key time settings below and generate the timetable schedule for the weekdays."
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: '#2563EB',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarMonthIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              School Day & Period Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter the key time settings below and generate the timetable schedule for the
              weekdays.
            </Typography>
          </Box>
        </Stack>
        <Breadcrumbs separator="›">
          <Link
            component={RouterLink}
            to="/school-dashboard"
            underline="hover"
            color="text.secondary"
          >
            Dashboard
          </Link>
          <Link
            component={RouterLink}
            to="/timetable/generate"
            underline="hover"
            color="text.secondary"
          >
            Timetable Manager
          </Link>
          <Typography color="text.primary">School Day & Period Settings</Typography>
        </Breadcrumbs>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems="stretch">
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', lg: 380 },
            flexShrink: 0,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: '4px solid #2563EB',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { lg: 'calc(100vh - 230px)' },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25, flexShrink: 0 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: '#2563EB',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              1
            </Box>
            <Typography variant="h6" fontWeight={800}>
              Basic Settings
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexShrink: 0 }}>
            Set the school day start and end time, lesson duration and break times.
          </Typography>

          {loadingSettings ? (
            <Stack spacing={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={48} />
              ))}
            </Stack>
          ) : (
            <Stack spacing={1.75} sx={{ flex: 1, overflowY: 'auto', minHeight: 0, pr: 0.5 }}>
              <Stack spacing={0.15}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  School Day Start Time
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon sx={{ color: '#16A34A', flexShrink: 0 }} />
                  <TextField
                    type="time"
                    size="small"
                    sx={{ width: 160 }}
                    value={dayStart}
                    onChange={(e) => setDayStart(e.target.value)}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    24-hr · {formatTime12h(dayStart)}
                  </Typography>
                </Stack>
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  School Day End Time
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon sx={{ color: '#DC2626', flexShrink: 0 }} />
                  <TextField
                    type="time"
                    size="small"
                    sx={{ width: 160 }}
                    value={dayEnd}
                    onChange={(e) => setDayEnd(e.target.value)}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    24-hr · {formatTime12h(dayEnd)}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <HourglassBottomIcon sx={{ color: '#9333EA', flexShrink: 0 }} />
                <TextField
                  label="Lesson Duration"
                  type="number"
                  size="small"
                  sx={{ width: 190 }}
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(Number(e.target.value))}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography variant="caption" color="text.secondary">
                          mins
                        </Typography>
                      ),
                    },
                  }}
                />
              </Stack>
              <Alert
                severity="info"
                icon={false}
                sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 600, py: 0.5 }}
              >
                Each class period will last {lessonDuration || 0} minutes.
              </Alert>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.3 }}>
                <FreeBreakfastIcon sx={{ color: '#D97706' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Break Times
                </Typography>
              </Stack>
              {breaks.map((b, idx) => (
                <Stack
                  key={idx}
                  spacing={0.75}
                  sx={{ bgcolor: idx % 2 === 0 ? '#FEF3C7' : '#DCFCE7', borderRadius: 1.5, p: 0.5 }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <TextField
                      size="small"
                      variant="standard"
                      value={b.label}
                      onChange={(e) => updateBreak(idx, 'label', e.target.value)}
                      placeholder="Break name"
                      slotProps={{ input: { disableUnderline: true, sx: { fontWeight: 700 } } }}
                    />
                    <IconButton
                      size="small"
                      sx={{ color: 'error.main' }}
                      onClick={() => removeBreak(idx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      type="time"
                      size="small"
                      value={b.start_time}
                      onChange={(e) => updateBreak(idx, 'start_time', e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      –
                    </Typography>
                    <TextField
                      type="time"
                      size="small"
                      value={b.end_time}
                      onChange={(e) => updateBreak(idx, 'end_time', e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ flex: 1, textAlign: 'right' }}
                    >
                      {rowDuration(b) != null ? `(${formatDuration(rowDuration(b))})` : ''}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon fontSize="small" />}
                onClick={addBreak}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Break
              </Button>

              {generateError && <Alert severity="error">{generateError}</Alert>}

              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleGenerate}
                  disabled={generating}
                  sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
                >
                  Generate Schedule
                </Button>
                <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset}>
                  Reset
                </Button>
              </Stack>

              <Alert
                severity="info"
                icon={false}
                sx={{ bgcolor: '#F1F5F9', color: 'text.secondary', fontWeight: 500 }}
              >
                The system will automatically calculate all class periods for Monday to Friday based
                on the settings above. You can then review the timetable time schedule on the right.
              </Alert>
            </Stack>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: '4px solid #9333EA',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { lg: 'calc(100vh - 230px)' },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.25, flexShrink: 0 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: '#9333EA',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                2
              </Box>
              <Typography variant="h6" fontWeight={800}>
                Generated Timetable Schedule
              </Typography>
            </Stack>
            {hasGenerated && (
              <Chip
                size="small"
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label="Auto Generated"
                color="success"
                variant="outlined"
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexShrink: 0 }}>
            This is the time schedule for all weekdays (Monday to Friday) based on your settings.
          </Typography>

          {!hasGenerated ? (
            <Alert severity="info">
              Click "Generate Schedule" to preview the periods and breaks before saving.
            </Alert>
          ) : (
            <Stack sx={{ flex: 1, minHeight: 0 }}>
              <Box sx={{ flex: 1, overflow: 'auto', mb: 1.5 }}>
                <Table
                  size="small"
                  sx={{
                    '& .MuiTableCell-root': {
                      py: 0.5,
                      px: 1,
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap',
                    },
                    '& .MuiTableCell-head': { fontWeight: 800, bgcolor: '#F1F5F9' },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Duration</TableCell>
                      {DAY_COLUMNS.map((d) => (
                        <TableCell key={d}>{d}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.map((row, idx) => {
                      const duration = formatDuration(rowDuration(row));
                      if (row.is_break) {
                        const isLunch = row.label.toLowerCase().includes('lunch');
                        return (
                          <TableRow key={idx} sx={{ bgcolor: isLunch ? '#DCFCE7' : '#FEF3C7' }}>
                            <TableCell>—</TableCell>
                            <TableCell>
                              {formatTime12h(row.start_time)} – {formatTime12h(row.end_time)}
                            </TableCell>
                            <TableCell>{duration}</TableCell>
                            {DAY_COLUMNS.map((d) => (
                              <TableCell
                                key={d}
                                sx={{ fontWeight: 800, color: isLunch ? '#166534' : '#92400E' }}
                              >
                                {row.label}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700 }}>{row.order}</TableCell>
                          <TableCell>
                            {formatTime12h(row.start_time)} – {formatTime12h(row.end_time)}
                          </TableCell>
                          <TableCell>{duration}</TableCell>
                          {DAY_COLUMNS.map((d) => (
                            <TableCell key={d}>{row.label}</TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mb: 1.5, flexShrink: 0 }}
              >
                <Paper
                  elevation={0}
                  sx={{ flex: '1 1 130px', bgcolor: '#DBEAFE', borderRadius: 2, p: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MenuBookIcon sx={{ color: '#1D4ED8', fontSize: 22 }} />
                    <Typography variant="h5" fontWeight={900} color="#1D4ED8" lineHeight={1}>
                      {summary.totalPeriods}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#1E3A8A"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    Total Periods / day
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{ flex: '1 1 130px', bgcolor: '#FEF3C7', borderRadius: 2, p: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalCafeIcon sx={{ color: '#B45309', fontSize: 22 }} />
                    <Typography variant="h5" fontWeight={900} color="#B45309" lineHeight={1}>
                      {summary.breaksCount}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#92400E"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    Breaks ({summary.breaksDurationLabel})
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{ flex: '1 1 130px', bgcolor: '#F3E8FF', borderRadius: 2, p: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleIcon sx={{ color: '#7E22CE', fontSize: 22 }} />
                    <Typography variant="h5" fontWeight={900} color="#7E22CE" lineHeight={1}>
                      {summary.totalSchoolHours}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#6B21A8"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    School Hours / day
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{ flex: '1 1 130px', bgcolor: '#FEE2E2', borderRadius: 2, p: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventAvailableIcon sx={{ color: '#B91C1C', fontSize: 22 }} />
                    <Typography variant="h5" fontWeight={900} color="#B91C1C" lineHeight={1}>
                      5 Days
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#991B1B"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    Monday – Friday
                  </Typography>
                </Paper>
              </Stack>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handlePreviewPdf}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? 'Generating...' : 'Preview as PDF'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => setSaveConfirmOpen(true)}
                  sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
                >
                  Save Settings
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Stack>

      <Dialog
        open={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Save Schedule</DialogTitle>
        <DialogContent>
          <Typography>
            This replaces the entire period schedule with what's shown on the right.{' '}
            <strong>
              Any timetable periods already assigned to a class (in Generate Timetable) will be
              cleared
            </strong>
            , since they're tied to the periods being replaced. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="inherit"
            size="small"
            onClick={() => setSaveConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={handleSaveSettings}
            disabled={saving}
            autoFocus
          >
            Save & Replace
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PeriodSettings;
