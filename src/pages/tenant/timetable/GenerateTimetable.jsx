import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { getClassesWithDivisions } from '@/api/tenant/set-up/tenant-setup';
import tenantApi from '@/api/tenant/tenant_api';
import { getSubjectColor } from '@/utils/subjectColor';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
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
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  Menu,
  Avatar,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DomainIcon from '@mui/icons-material/Domain';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalculateIcon from '@mui/icons-material/Calculate';
import ScienceIcon from '@mui/icons-material/Science';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TranslateIcon from '@mui/icons-material/Translate';
import ComputerIcon from '@mui/icons-material/Computer';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import GrassIcon from '@mui/icons-material/Grass';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const ARM_DOT_COLORS = ['#2563EB', '#16A34A', '#9333EA', '#D97706', '#DC2626', '#0891B2'];

const SUBJECT_ICON_RULES = [
  [/math/i, CalculateIcon],
  [/english|literature/i, MenuBookIcon],
  [/science|biology|chemistry|physics/i, ScienceIcon],
  [/geography/i, PublicIcon],
  [/government|civic/i, AccountBalanceIcon],
  [/physical|health|sport/i, FitnessCenterIcon],
  [/french|yoruba|igbo|hausa|language/i, TranslateIcon],
  [/computer|ict/i, ComputerIcon],
  [/creative|art|music/i, PaletteIcon],
  [/religio|bible|quran|islamic|christian/i, AutoStoriesIcon],
  [/business|commerce|account/i, BusinessCenterIcon],
  [/history/i, HistoryEduIcon],
  [/agric/i, GrassIcon],
];

const getSubjectIcon = (name = '') => (SUBJECT_ICON_RULES.find(([re]) => re.test(name)) || [])[1] || MenuBookIcon;
const getBreakIcon = (label = '') => (/lunch/i.test(label) ? RestaurantIcon : LocalCafeIcon);

const armLabel = (arm) => {
  const names = arm?.class_arm_names;
  return Array.isArray(names) ? names.filter(Boolean).join(', ') : names || '—';
};

const pct = (num, den) => (den ? Math.round((num / den) * 100) : 0);

const LegendDot = ({ color, label }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);

const DividedStat = ({ value1, label1, color1, value2, label2, color2 }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} divider={<Divider orientation="vertical" flexItem />}>
    <Box>
      <Typography variant="h6" fontWeight={800} lineHeight={1.2} color={color1}>
        {value1}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label1}
      </Typography>
    </Box>
    <Box>
      <Typography variant="h6" fontWeight={800} lineHeight={1.2} color={color2}>
        {value2}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label2}
      </Typography>
    </Box>
  </Stack>
);

const BarWithPct = ({ value, mainLabel, subLabel, barColor, legend }) => (
  <>
    <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
      {mainLabel}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {subLabel}
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 } }}
      />
      <Typography variant="caption" fontWeight={800} sx={{ flexShrink: 0 }}>
        {value}%
      </Typography>
    </Stack>
    <Stack direction="row" spacing={1.5}>{legend}</Stack>
  </>
);

const StatCardShell = ({ icon: Icon, iconColor, title, tooltip, loading, children, linkText, linkIcon: LinkIcon, onLinkClick, accent }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      p: 1.25,
      border: '1px solid',
      borderColor: accent ? `${accent}40` : 'divider',
      bgcolor: accent ? `${accent}0D` : 'background.paper',
      minWidth: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 0.75, flexShrink: 0 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1.25,
          bgcolor: `${iconColor}1A`,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {loading ? <Skeleton variant="circular" width={16} height={16} /> : <Icon sx={{ fontSize: 17 }} />}
      </Box>
      <Typography variant="body2" fontWeight={700} sx={{ flex: 1, fontSize: '0.8rem', lineHeight: 1.25 }}>
        {title}
      </Typography>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0, mt: 0.25 }} />
        </Tooltip>
      )}
    </Stack>
    {loading ? (
      <Skeleton variant="text" width="70%" height={30} />
    ) : (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{children}</Box>
    )}
    {linkText && (
      <Button
        size="small"
        onClick={onLinkClick}
        startIcon={LinkIcon ? <LinkIcon sx={{ fontSize: 13 }} /> : null}
        endIcon={<ChevronRightIcon sx={{ fontSize: 13 }} />}
        sx={{ mt: 0.75, fontSize: '0.68rem', p: 0, minWidth: 0, color: accent || 'primary.main', justifyContent: 'flex-start', flexShrink: 0 }}
      >
        {linkText}
      </Button>
    )}
  </Paper>
);

const GenerateTimetable = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  const [academicInfo, setAcademicInfo] = useState({ academic_session: '', academic_term: '' });

  const [divisionsData, setDivisionsData] = useState([]);
  const [programmeId, setProgrammeId] = useState('');
  const [programmeClassId, setProgrammeClassId] = useState('');

  const [arms, setArms] = useState([]);
  const [visibleArmIds, setVisibleArmIds] = useState(new Set());
  const [armsLoading, setArmsLoading] = useState(false);
  const [armMenuAnchor, setArmMenuAnchor] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [quickPickSubjectId, setQuickPickSubjectId] = useState('');
  const [rooms, setRooms] = useState([]);

  const [teachers, setTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [rightTab, setRightTab] = useState(0);

  const [periods, setPeriods] = useState([]);
  const [gridByArm, setGridByArm] = useState({});
  const [gridLoading, setGridLoading] = useState(false);

  const [assignTarget, setAssignTarget] = useState(null);
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearArmTarget, setClearArmTarget] = useState(null);

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

  const fetchAcademicInfo = useCallback(async () => {
    try {
      const res = await tenantApi.get('/school_setup/get_academic_info');
      setAcademicInfo(res.data || {});
    } catch {
      // Non-critical — the filter chips just stay blank.
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const data = await getClassesWithDivisions();
      setDivisionsData(data || []);
    } catch {
      notify.error('Failed to load classes');
    }
  }, [notify]);

  const fetchRoomsTeachers = useCallback(async () => {
    try {
      const [roomRes, teacherRes] = await Promise.all([
        timetableApi.getRooms(),
        tenantApi.get('/school_setup/staff/all', { params: { staff_type: 'teaching', per_page: 50 } }),
      ]);
      setRooms(roomRes.data.data || []);
      setTeachers(teacherRes.data?.data || []);
    } catch {
      notify.error('Failed to load rooms/teachers');
    }
  }, [notify]);

  useEffect(() => {
    fetchStats();
    fetchAcademicInfo();
    fetchClasses();
    fetchRoomsTeachers();
  }, [fetchStats, fetchAcademicInfo, fetchClasses, fetchRoomsTeachers]);

  // ── Programme → Class cascade ───────────────────────────────────────
  const programmes = useMemo(() => {
    const map = new Map();
    divisionsData.forEach((division) =>
      (division.programmes || []).forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, { id: p.id, label: p.programme_name || p.programme_code });
      }),
    );
    return Array.from(map.values());
  }, [divisionsData]);

  const classesForProgramme = useMemo(() => {
    if (!programmeId) return [];
    const list = [];
    divisionsData.forEach((division) =>
      (division.programmes || []).forEach((p) => {
        if (p.id !== programmeId) return;
        (p.classes || []).forEach((cls) => {
          list.push({ id: cls.pivot?.id, label: cls.class_name || cls.class_code });
        });
      }),
    );
    return list;
  }, [divisionsData, programmeId]);

  useEffect(() => {
    if (!programmeId && programmes.length) setProgrammeId(programmes[0].id);
  }, [programmes, programmeId]);

  useEffect(() => {
    if (classesForProgramme.length) {
      setProgrammeClassId((prev) => (classesForProgramme.some((c) => c.id === prev) ? prev : classesForProgramme[0].id));
    } else {
      setProgrammeClassId('');
    }
  }, [classesForProgramme]);

  // Scoped to the selected programme — otherwise this list was every active
  // subject in the school (e.g. Senior Secondary subjects showing up while
  // building a Junior Secondary 1 timetable).
  useEffect(() => {
    if (!programmeId) {
      setSubjects([]);
      return;
    }
    timetableApi
      .getSubjects({ programme_id: programmeId })
      .then((res) => setSubjects(res.data.data || []))
      .catch(() => notify.error('Failed to load subjects'));
  }, [programmeId, notify]);

  // ── Class arms + grid ────────────────────────────────────────────────
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
  // Sequential teaching-period numbers (1, 2, 3...) skipping breaks entirely,
  // matching the mockup's Period column rather than the raw, break-inclusive
  // `order` field.
  const periodNumbers = useMemo(() => {
    const map = {};
    nonBreakPeriods.forEach((p, idx) => {
      map[p.id] = idx + 1;
    });
    return map;
  }, [nonBreakPeriods]);

  const armCompletion = (armId) => {
    const assigned = nonBreakPeriods.filter((p) => gridByArm[armId]?.[p.id]).length;
    return { assigned, total: nonBreakPeriods.length, percent: pct(assigned, nonBreakPeriods.length) };
  };

  const classAssignedTotal = useMemo(
    () => visibleArms.reduce((sum, arm) => sum + armCompletion(arm.id).assigned, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleArms, gridByArm, nonBreakPeriods],
  );
  const classTargetTotal = visibleArms.length * nonBreakPeriods.length;
  const classUnassignedTotal = Math.max(classTargetTotal - classAssignedTotal, 0);

  const usedSubjectIds = useMemo(() => {
    const ids = new Set();
    Object.values(gridByArm).forEach((periodMap) => Object.values(periodMap).forEach((slot) => slot && ids.add(slot.subject_id)));
    return ids;
  }, [gridByArm]);

  // ── Assign / clear a cell ───────────────────────────────────────────
  const openAssign = (e, armId, periodId) => {
    const slot = gridByArm[armId]?.[periodId];
    if (!slot && quickPickSubjectId) {
      quickAssign(armId, periodId, quickPickSubjectId);
      return;
    }
    setAssignTarget({ anchorEl: e.currentTarget, armId, periodId });
    setAssignSubjectId(slot?.subject_id || '');
    setAssignRoomId(slot?.room_id || '');
    setAssignError('');
  };

  const closeAssign = () => setAssignTarget(null);

  const quickAssign = async (armId, periodId, subjectId) => {
    try {
      await timetableApi.assignSlot({ class_arm_id: armId, period_id: periodId, subject_id: subjectId });
      notify.success('Period assigned successfully');
      refreshAll();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to assign period');
    }
  };

  const handleSaveAssign = async () => {
    if (!assignSubjectId || !assignTarget) return;
    setAssignSaving(true);
    setAssignError('');
    const slot = gridByArm[assignTarget.armId]?.[assignTarget.periodId];
    try {
      const payload = { class_arm_id: assignTarget.armId, period_id: assignTarget.periodId, subject_id: assignSubjectId, room_id: assignRoomId || null };
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
      const targetArmIds = clearArmTarget ? [clearArmTarget] : Array.from(visibleArmIds);
      await Promise.all(targetArmIds.map((armId) => timetableApi.clearClassArm(armId)));
      notify.success(clearArmTarget ? 'Class arm timetable cleared' : 'Class timetable cleared');
      setClearConfirmOpen(false);
      setClearArmTarget(null);
      refreshAll();
    } catch {
      notify.error('Failed to clear timetable');
    } finally {
      setClearing(false);
    }
  };

  const [savingSnapshot, setSavingSnapshot] = useState(false);

  const handleSaveTimetable = async () => {
    setSavingSnapshot(true);
    try {
      await timetableApi.saveSnapshot();
      notify.success('Timetable saved — every change here already saves as you make it; this just checkpoints completion % for the trend line.');
      fetchStats();
    } catch {
      notify.error('Failed to save timetable checkpoint');
    } finally {
      setSavingSnapshot(false);
    }
  };

  const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const filteredSubjects = subjects.filter((s) => (s.subject_name || '').toLowerCase().includes(subjectSearch.toLowerCase()));
  const visibleSubjectList = showAllSubjects ? filteredSubjects : filteredSubjects.slice(0, 8);
  const filteredTeachers = teachers.filter((t) => `${t.user?.fname || ''} ${t.user?.lname || ''}`.toLowerCase().includes(teacherSearch.toLowerCase()));

  const selectedClassLabel = classesForProgramme.find((c) => c.id === programmeClassId)?.label;

  return (
    <PageContainer title="Generate Timetable" description="Assign subjects to each period and class arm. The system validates and helps build a conflict-free timetable.">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarMonthIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Generate Timetable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assign subjects to each period and class arm. The system will validate and help you create a conflict-free timetable.
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Full-school auto-generation is coming soon — use Auto Fill This Class or assign periods manually below for now.">
          <span>
            <Button variant="contained" startIcon={<AutoFixHighIcon />} disabled sx={{ bgcolor: '#593196', '&:hover': { bgcolor: '#4a2880' } }}>
              Generate Timetable
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1.25, mb: 2 }}>
        <StatCardShell
          icon={CalendarMonthIcon}
          iconColor="#16A34A"
          title="Timetable Completion"
          tooltip="Periods assigned vs. total possible periods (non-break periods × active class arms) this term."
          loading={statsLoading}
          linkText="View unassigned periods"
          onLinkClick={scrollToGrid}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <CircularProgress variant="determinate" value={100} size={64} thickness={4} sx={{ color: 'grey.200', position: 'absolute' }} />
              <CircularProgress variant="determinate" value={pct(stats.periods_assigned, stats.periods_target)} size={64} thickness={4} sx={{ color: '#16A34A' }} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 14 }} fontWeight={800}>
                  {pct(stats.periods_assigned, stats.periods_target)}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2} noWrap>
                {stats.periods_assigned ?? 0} / {stats.periods_target ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                periods assigned
              </Typography>
              {stats.completion_trend !== null && stats.completion_trend !== undefined && (
                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ mt: 0.25 }}>
                  {stats.completion_trend === 0 ? (
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      No change from last save
                    </Typography>
                  ) : (
                    <>
                      {stats.completion_trend > 0 ? (
                        <ArrowUpwardIcon sx={{ fontSize: 12, color: 'success.main' }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 12, color: 'error.main' }} />
                      )}
                      <Typography variant="caption" fontWeight={700} sx={{ color: stats.completion_trend > 0 ? 'success.main' : 'error.main' }}>
                        {Math.abs(stats.completion_trend)}% from last save
                      </Typography>
                    </>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </StatCardShell>

        <StatCardShell icon={DomainIcon} iconColor="#2563EB" title="Classes & Arms" tooltip="Total active classes and class arms in the school." loading={statsLoading} linkText="View class overview" linkIcon={GroupsIcon} onLinkClick={scrollToGrid}>
          <DividedStat value1={stats.total_classes ?? 0} label1="Classes" value2={stats.total_class_arms ?? 0} label2="Class Arms" />
        </StatCardShell>

        <StatCardShell
          icon={MenuBookIcon}
          iconColor="#9333EA"
          title="Subject Allocation"
          tooltip="Subjects scheduled at least once vs. total active subjects."
          loading={statsLoading}
          linkText="View subject usage"
          onLinkClick={() => setRightTab(0)}
        >
          <BarWithPct
            value={pct(stats.subjects_used, stats.subjects_total)}
            mainLabel={`${stats.subjects_used ?? 0} of ${stats.subjects_total ?? 0}`}
            subLabel="Subjects used"
            barColor="#16A34A"
            legend={
              <>
                <LegendDot color="#16A34A" label={`Used ${stats.subjects_used ?? 0}`} />
                <LegendDot color="#D97706" label={`Unused ${Math.max((stats.subjects_total ?? 0) - (stats.subjects_used ?? 0), 0)}`} />
              </>
            }
          />
        </StatCardShell>

        <StatCardShell
          icon={GroupsIcon}
          iconColor="#16A34A"
          title="Teacher Utilisation"
          tooltip="Teachers with at least one class/subject allocation this term."
          loading={statsLoading}
          linkText="View teacher workload"
          linkIcon={GroupsIcon}
          onLinkClick={() => setRightTab(1)}
        >
          <BarWithPct
            value={pct(stats.teachers_assigned, stats.teachers_total)}
            mainLabel={stats.teachers_assigned ?? 0}
            subLabel="Active Teachers"
            barColor="#0891B2"
            legend={
              <>
                <LegendDot color="#2563EB" label={`Assigned ${stats.teachers_assigned ?? 0}`} />
                <LegendDot color="#CBD5E1" label={`Unassigned ${Math.max((stats.teachers_total ?? 0) - (stats.teachers_assigned ?? 0), 0)}`} />
              </>
            }
          />
        </StatCardShell>

        <StatCardShell
          icon={WarningAmberIcon}
          iconColor="#DC2626"
          title="Conflicts & Issues"
          tooltip="Assigning a period that would double-book a teacher or room is blocked before it happens, so this stays at 0 — unassigned periods are still listed here as something to resolve."
          loading={statsLoading}
          linkText="View and resolve issues"
          accent="#DC2626"
          onLinkClick={scrollToGrid}
        >
          <DividedStat value1={stats.conflicts ?? 0} label1="Conflicts" color1="error.main" value2={stats.unassigned_periods ?? 0} label2="Unassigned Periods" />
        </StatCardShell>

        <StatCardShell
          icon={MeetingRoomIcon}
          iconColor="#16A34A"
          title="Room/Facility Usage"
          tooltip="Rooms currently assigned to at least one period this term."
          loading={statsLoading}
          linkText="View room usage"
          onLinkClick={() => navigate('/timetable/period-settings')}
        >
          <BarWithPct
            value={pct(stats.rooms_in_use, stats.rooms_total)}
            mainLabel={stats.rooms_total ?? 0}
            subLabel="Rooms"
            barColor="#2563EB"
            legend={
              <>
                <LegendDot color="#16A34A" label={`In Use ${stats.rooms_in_use ?? 0}`} />
                <LegendDot color="#CBD5E1" label={`Available ${Math.max((stats.rooms_total ?? 0) - (stats.rooms_in_use ?? 0), 0)}`} />
              </>
            }
          />
        </StatCardShell>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems="flex-start">
        {/* Left column: filter bar + grid, flow back-to-back regardless of how tall the right column gets. */}
        <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="flex-end">
              <FormControl size="small" sx={{ minWidth: 130 }} disabled>
                <InputLabel>Session</InputLabel>
                <Select label="Session" value="current">
                  <MenuItem value="current">{academicInfo.academic_session || '—'}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }} disabled>
                <InputLabel>Term</InputLabel>
                <Select label="Term" value="current">
                  <MenuItem value="current">{academicInfo.academic_term || '—'}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Programme</InputLabel>
                <Select label="Programme" value={programmeId} onChange={(e) => setProgrammeId(e.target.value)}>
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 190 }} disabled={!classesForProgramme.length}>
                <InputLabel>Class</InputLabel>
                <Select label="Class" value={programmeClassId} onChange={(e) => setProgrammeClassId(e.target.value)}>
                  {classesForProgramme.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Button variant="outlined" size="small" startIcon={<SettingsIcon fontSize="small" />} onClick={() => navigate('/timetable/period-settings')}>
              View Settings
            </Button>
          </Stack>
        </Paper>

        <Paper
          ref={gridRef}
          elevation={0}
          sx={{ flex: 1, minWidth: 0, width: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider', borderLeft: '4px solid #2563EB', p: 1.5 }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={1} sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={800}>
                {selectedClassLabel ? `Timetable for ${selectedClassLabel}` : 'Timetable'}
              </Typography>
              <Chip size="small" label="Draft" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, height: 20 }} />
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <LegendDot color="#2563EB" label={`Assigned ${classAssignedTotal}`} />
              <LegendDot color="#9333EA" label={`Unassigned ${classUnassignedTotal}`} />
              <LegendDot color="#DC2626" label={`Conflicts ${stats.conflicts ?? 0}`} />
            </Stack>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 680 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 70 }}>Period</TableCell>
                  <TableCell sx={{ width: 100 }}>Time</TableCell>
                  {visibleArms.map((arm, idx) => {
                    const c = armCompletion(arm.id);
                    return (
                      <TableCell key={arm.id} align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ARM_DOT_COLORS[idx % ARM_DOT_COLORS.length] }} />
                          <Typography variant="subtitle2" fontWeight={700}>
                            {armLabel(arm)}
                          </Typography>
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setArmMenuAnchor({ el: e.currentTarget, armId: arm.id });
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <Box sx={{ position: 'relative', width: 20, height: 20 }}>
                            <CircularProgress variant="determinate" value={100} size={20} thickness={5} sx={{ color: 'grey.200', position: 'absolute' }} />
                            <CircularProgress variant="determinate" value={c.percent} size={20} thickness={5} sx={{ color: ARM_DOT_COLORS[idx % ARM_DOT_COLORS.length] }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {c.assigned}/{c.total}
                          </Typography>
                        </Stack>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {gridLoading || armsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={2}>
                        <Skeleton variant="text" width={60} />
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
                    <TableCell colSpan={visibleArms.length + 2} align="center">
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        No periods configured yet — set them up in School Day &amp; Period Settings first.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => {
                    if (period.is_break) {
                      const BreakIcon = getBreakIcon(period.label);
                      const startH = period.start_time?.slice(0, 5);
                      const endH = period.end_time?.slice(0, 5);
                      const minutes =
                        period.start_time && period.end_time
                          ? Math.round((new Date(`1970-01-01T${period.end_time}`) - new Date(`1970-01-01T${period.start_time}`)) / 60000)
                          : null;
                      const duration = minutes ? (minutes >= 60 ? `${Math.round(minutes / 60)} hour${minutes > 60 ? 's' : ''}` : `${minutes} minutes`) : '';
                      return (
                        <TableRow key={period.id}>
                          <TableCell sx={{ bgcolor: '#FEF3C7' }}>
                            <BreakIcon sx={{ fontSize: 18, color: '#B45309' }} />
                          </TableCell>
                          <TableCell colSpan={visibleArms.length + 1} sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                            {period.label} — {startH} - {endH} {duration && `(${duration})`}
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow key={period.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {periodNumbers[period.id]}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {period.start_time?.slice(0, 5)} - {period.end_time?.slice(0, 5)}
                          </Typography>
                        </TableCell>
                        {visibleArms.map((arm) => {
                          const slot = gridByArm[arm.id]?.[period.id];
                          const SubjectIcon = slot ? getSubjectIcon(slot.subject_name) : null;
                          const subjectColor = slot ? getSubjectColor({ id: slot.subject_id, color: slot.subject_color }) : null;
                          return (
                            <TableCell
                              key={arm.id}
                              sx={{ cursor: 'pointer', bgcolor: slot ? `${subjectColor}14` : 'transparent' }}
                              onClick={(e) => openAssign(e, arm.id, period.id)}
                            >
                              <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="space-between">
                                {slot ? (
                                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 1.25,
                                        bgcolor: subjectColor,
                                        color: '#fff',
                                        boxShadow: `0 2px 6px ${subjectColor}66`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <SubjectIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="caption" fontWeight={800} noWrap sx={{ display: 'block', color: subjectColor }}>
                                        {slot.subject_name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                        {slot.teacher_name || 'No teacher'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                ) : (
                                  <Typography variant="caption" color="text.disabled">
                                    Free period
                                  </Typography>
                                )}
                                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />} sx={{ fontSize: '0.65rem', p: 0, minWidth: 0, flexShrink: 0 }}>
                                  Add
                                </Button>
                              </Stack>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
        </Stack>

        {/* Right column: flows independently of the left column's height. */}
        <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          <Stack spacing={1.5}>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: 1.25,
                    bgcolor: '#2563EB',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 15 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap>
                    Class & Arms
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {selectedClassLabel || '—'}
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={0.5}>
                {arms.map((arm, idx) => {
                  const armColor = ARM_DOT_COLORS[idx % ARM_DOT_COLORS.length];
                  const checked = visibleArmIds.has(arm.id);
                  return (
                    <Stack
                      key={arm.id}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      onClick={() => toggleArmVisible(arm.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 1.25,
                        px: 0.75,
                        py: 0.25,
                        bgcolor: checked ? `${armColor}1F` : 'transparent',
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={checked}
                        onChange={() => toggleArmVisible(arm.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0.25, color: armColor, '&.Mui-checked': { color: armColor } }}
                      />
                      <Typography variant="body2" fontWeight={700} sx={{ color: checked ? armColor : 'text.primary' }}>
                        {armLabel(arm)}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
              <Tabs value={rightTab} onChange={(_, v) => setRightTab(v)} sx={{ minHeight: 32, mb: 1, '& .MuiTab-root': { minHeight: 32, py: 0, fontSize: '0.78rem' } }}>
                <Tab label="Subjects" />
                <Tab label="Teachers" />
              </Tabs>

              {rightTab === 0 ? (
                <>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Search subjects..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                    sx={{ mb: 1 }}
                  />
                  <Stack spacing={0.5}>
                    {visibleSubjectList.map((s) => {
                      const SubjectIcon = getSubjectIcon(s.subject_name);
                      const subjectColor = getSubjectColor(s);
                      const isQuickPick = quickPickSubjectId === s.id;
                      return (
                        <Stack
                          key={s.id}
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          onClick={() => setQuickPickSubjectId(isQuickPick ? '' : s.id)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 1.25,
                            px: 0.5,
                            py: 0.4,
                            bgcolor: isQuickPick ? `${subjectColor}1F` : 'transparent',
                            border: '1px solid',
                            borderColor: isQuickPick ? subjectColor : 'transparent',
                          }}
                        >
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: 1,
                              bgcolor: subjectColor,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <SubjectIcon sx={{ fontSize: 13 }} />
                          </Box>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                            {s.subject_name}
                          </Typography>
                          {s.subject_code && (
                            <Chip
                              size="small"
                              label={s.subject_code}
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: `${subjectColor}1F`, color: subjectColor }}
                            />
                          )}
                          <Checkbox size="small" checked={usedSubjectIds.has(s.id)} readOnly sx={{ p: 0.25, color: subjectColor, '&.Mui-checked': { color: subjectColor } }} />
                        </Stack>
                      );
                    })}
                    {filteredSubjects.length === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        No subjects match.
                      </Typography>
                    )}
                  </Stack>
                  {filteredSubjects.length > 8 && (
                    <Button size="small" onClick={() => setShowAllSubjects((v) => !v)} sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                      {showAllSubjects ? 'Show fewer subjects' : 'Show more subjects'}
                    </Button>
                  )}
                  {quickPickSubjectId && (
                    <Alert severity="info" sx={{ mt: 1, py: 0, fontSize: '0.7rem' }}>
                      Click an empty period to assign it instantly.
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Search teachers..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonSearchIcon fontSize="small" /></InputAdornment> } }}
                    sx={{ mb: 1 }}
                  />
                  <Stack spacing={0.5} sx={{ maxHeight: 260, overflowY: 'auto' }}>
                    {filteredTeachers.map((t) => (
                      <Stack key={t.user_id} direction="row" alignItems="center" spacing={1}>
                        <Avatar src={t.user?.avatar} sx={{ width: 22, height: 22, fontSize: 11 }}>
                          {t.user?.fname?.[0]}
                        </Avatar>
                        <Typography variant="body2" noWrap>
                          {t.user?.fname} {t.user?.lname}
                        </Typography>
                      </Stack>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        No teachers match.
                      </Typography>
                    )}
                  </Stack>
                </>
              )}
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
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
                  onClick={() => {
                    setClearArmTarget(null);
                    setClearConfirmOpen(true);
                  }}
                  disabled={visibleArmIds.size === 0}
                >
                  Clear This Class
                </Button>
              </Stack>
            </Paper>

            <Button fullWidth variant="contained" size="large" onClick={handleSaveTimetable} disabled={savingSnapshot} sx={{ bgcolor: '#593196', '&:hover': { bgcolor: '#4a2880' } }}>
              Save Timetable
            </Button>
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

      <Menu anchorEl={armMenuAnchor?.el} open={Boolean(armMenuAnchor)} onClose={() => setArmMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            setClearArmTarget(armMenuAnchor.armId);
            setClearConfirmOpen(true);
            setArmMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteSweepIcon fontSize="small" sx={{ mr: 1 }} />
          Clear this arm
        </MenuItem>
      </Menu>

      <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{clearArmTarget ? 'Clear This Arm' : 'Clear This Class'}</DialogTitle>
        <DialogContent>
          <Typography>
            {clearArmTarget
              ? 'This will remove every assigned period from this class arm for the current term. This cannot be undone.'
              : `This will remove every assigned period from ${visibleArmIds.size} visible class arm(s) of ${selectedClassLabel} for the current term. This cannot be undone.`}
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
