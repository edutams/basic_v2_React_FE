import { Fragment, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Portal,
  CircularProgress,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Skeleton,
  InputAdornment,
  TablePagination,
  Checkbox,
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  CalendarMonth as SessionStepIcon,
  Layers as BatchStepIcon,
  Assignment as ExamStepIcon,
  Payment as PaymentStepIcon,
  MailOutline as LetterStepIcon,
  CheckCircle as StepCompleteIcon,
  Schedule as StepInProgressIcon,
  ReportProblem as StepNotConfiguredIcon,
  ArrowForwardIos as StepArrowIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  IconEye,
  IconPencil,
  IconSchool,
  IconCalendar,
  IconHash,
  IconId,
  IconInfoCircle,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import AdmissionLetterEditor from '@/components/tenant/admission/setup/AdmissionLetterEditor';
import {
  fetchSessions,
  fetchSessionTermsBySession,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchAdmissionBatches,
  toggleAdmissionBatchStatus,
  updateAdmissionBatch,
  fetchAdmissionCodeFormat,
  updateAdmissionCodeFormat,
} from '@/api/tenant/admission/admissionApi';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Admission Setup' }];

// helper — safely extract array from various API response shapes
const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const StatusChip = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        bgcolor: isActive ? 'success.light' : 'error.light',
        color: isActive ? 'success.dark' : 'error.dark',
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
};
const BatchStatusChip = ({ status }) => {
  const isOpen = status === 'open';
  return (
    <Chip
      label={isOpen ? 'Open' : 'Close'}
      size="small"
      sx={{
        bgcolor: isOpen ? 'success.light' : 'error.light',
        color: isOpen ? 'success.dark' : 'error.dark',
        fontWeight: 700,
        fontSize: 11,
        minWidth: 52,
      }}
    />
  );
};

const YesNoPill = ({ value }) => (
  <Chip
    label={value ? 'Yes' : 'No'}
    size="small"
    sx={{
      bgcolor: value ? 'primary.light' : 'warning.light',
      color: value ? 'primary.main' : 'warning.main',
      fontWeight: 700,
      fontSize: 11,
      minWidth: 36,
    }}
  />
);

const FeePills = ({ requirePayment, appFee, acceptanceFee, onViewPayments }) => {
  if (!requirePayment) return <YesNoPill value={false} />;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <YesNoPill value />

      <Tooltip title="View payment breakdown">
        <IconButton
          size="small"
          onClick={onViewPayments}
          sx={{
            bgcolor: 'info.light',
            color: 'info.main',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'info.main',
              color: 'white',
            },
          }}
        >
          <IconEye size={12} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const ViewEditPair = ({ onView, onEdit }) => (
  <Stack direction="row" spacing={0.5}>
    <Tooltip title="View">
      <IconButton
        size="small"
        onClick={onView}
        sx={{
          bgcolor: 'primary.light',
          color: 'primary.main',
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconEye size={14} sx={{ color: 'primary.main' }} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Edit">
      <IconButton
        size="small"
        onClick={onEdit}
        sx={{
          bgcolor: 'success.light',
          color: 'success.main',
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconPencil size={14} />
      </IconButton>
    </Tooltip>
  </Stack>
);

const STEP_STATUS_META = {
  completed: { color: '#16A34A', bg: '#DCFCE7', label: 'Completed' },
  in_progress: { color: '#D97706', bg: '#FEF3C7', label: 'In Progress' },
  not_configured: { color: '#DC2626', bg: '#FEE2E2', label: 'Not Configured' },
};

const StepCard = ({ step, index }) => {
  const meta = STEP_STATUS_META[step.status];
  const Icon = step.icon;
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 150,
        p: 1.25,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: meta.bg,
              color: meta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 19 }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            {index + 1}
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {step.label}
          </Typography>
          <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
            {step.count}
          </Typography>
        </Box>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
        {step.caption}
      </Typography>
      <Chip
        label={meta.label}
        size="small"
        sx={{
          bgcolor: meta.bg,
          color: meta.color,
          fontWeight: 700,
          fontSize: 10,
          height: 20,
          alignSelf: 'flex-start',
        }}
      />
    </Paper>
  );
};

const StepperSkeleton = () => (
  <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, overflowX: 'auto' }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Paper key={i} elevation={0} sx={{ flex: 1, minWidth: 150, p: 1.25, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Skeleton variant="circular" width={38} height={38} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="40%" height={28} />
          </Box>
        </Stack>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="rounded" width={70} height={20} sx={{ mt: 0.5 }} />
      </Paper>
    ))}
  </Stack>
);

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`admission-tabpanel-${index}`}
    aria-labelledby={`admission-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 1.5 }}>{children}</Box>}
  </div>
);

// ─── Student number length options ────────────────────────────────────────────
const STD_NUM_OPTIONS = [
  { key: '[:stdNum_2]', label: '2 digits', example: '01' },
  { key: '[:stdNum_3]', label: '3 digits', example: '001' },
  { key: '[:stdNum_4]', label: '4 digits', example: '0001' },
  { key: '[:stdNum_5]', label: '5 digits', example: '00001' },
];

// Drops any segment that isn't a real format token — a stray "on" (or
// anything else) can never survive into what's shown or saved, regardless
// of what put it there in the first place.
const sanitizeCodeFormat = (value) => {
  const validTokens = new Set(['[:shortname]', '[:year]', ...STD_NUM_OPTIONS.map((o) => o.key)]);

  return (value || '')
    .split('/')
    .filter((token) => validTokens.has(token))
    .join('/');
};

const CODE_FORMAT_STEPS = [
  { key: 'select', title: 'Select Components', subtitle: 'Choose what to include', color: '#9333EA' },
  { key: 'configure', title: 'Configure Settings', subtitle: 'Set format options', color: '#2563EB' },
  { key: 'preview', title: 'Preview & Save', subtitle: 'Confirm and save', color: '#16A34A' },
];

const CODE_FORMAT_COMPONENTS = [
  { key: 'shortname', label: 'School Short Name', example: 'e.g. IMC', icon: IconSchool, color: '#9333EA', real: true },
  { key: 'year', label: 'Admission Year', example: 'e.g. 2026', icon: IconCalendar, color: '#2563EB', real: true },
  { key: 'stdnum', label: 'Sequential Number', example: 'e.g. 01, 02, 03', icon: IconHash, color: '#16A34A', real: true },
  { key: 'programme', label: 'Programme Code', example: 'e.g. SCI, COM', icon: IconId, color: '#9CA3AF', real: false },
  { key: 'department', label: 'Department Code', example: 'e.g. BIO, MAT, ENG', icon: IconId, color: '#9CA3AF', real: false },
  { key: 'campus', label: 'Campus Code', example: 'e.g. MAIN, LAG', icon: IconId, color: '#9CA3AF', real: false },
  { key: 'customtext', label: 'Custom Text', example: 'e.g. ADM, STU', icon: IconId, color: '#9CA3AF', real: false },
];

const AdmissionSetup = () => {
  const navigate = useNavigate();

  // ── Tabs state ──────────────────────────────────────────────────────────────
  const [tabValue, setTabValue] = useState(0);

  // ── Existing state (Admission Setup tab) ────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSessionTermId, setSelectedSessionTermId] = useState(null);
  const [selectedSessionTermLabel, setSelectedSessionTermLabel] = useState('');

  const [batches, setBatches] = useState([]);

  // ── New-design state: search/filter, pagination, selected-batch panel ──
  const [batchSearch, setBatchSearch] = useState('');
  const [batchProgrammeFilter, setBatchProgrammeFilter] = useState('all');
  const [batchStatusFilter, setBatchStatusFilter] = useState('all');
  const [batchPage, setBatchPage] = useState(0);
  const BATCHES_PER_PAGE = 10;
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  // Real term date range (first week's start → last week's end), reused
  // from the same /attendance/weeks endpoint the Attendance pages use —
  // session_terms itself has no start_date/end_date columns.
  const [termDateRange, setTermDateRange] = useState({ start: null, end: null });

  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [batchMenuAnchor, setBatchMenuAnchor] = useState(null);
  const [menuBatch, setMenuBatch] = useState(null);

  const [confirmToggleBatch, setConfirmToggleBatch] = useState({ open: false, batch: null });

  const [letterEditorOpen, setLetterEditorOpen] = useState(false);
  const [letterEditorBatch, setLetterEditorBatch] = useState(null);
  const [letterEditorReadOnly, setLetterEditorReadOnly] = useState(false);
  const [letterEditorContent, setLetterEditorContent] = useState('');

  const [paymentViewOpen, setPaymentViewOpen] = useState(false);
  const [paymentViewBatch, setPaymentViewBatch] = useState(null);

  // ── Code Format state (school-level, not per-batch) ─────────────────────────
  const [codeFormatInput, setCodeFormatInput] = useState('');
  const [schoolShortName, setSchoolShortName] = useState('');
  const [selectedStdNum, setSelectedStdNum] = useState('');
  // hasShortNameInFormat removed — everything lives in codeFormatInput directly
  const [codeFormatSaving, setCodeFormatSaving] = useState(false);
  const [codeFormatLoading, setCodeFormatLoading] = useState(false);
  const [copiedPlaceholder, setCopiedPlaceholder] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionTermId) {
      loadBatches(selectedSessionTermId);
      loadTermDateRange();
    } else {
      setBatches([]);
      setTermDateRange({ start: null, end: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionTermId]);

  const loadTermDateRange = async () => {
    const termId = selectedSessionTermObj?.term_id ?? selectedSessionTermObj?.term?.id;
    if (!selectedSessionId || !termId) return;
    try {
      const res = await attendanceApi.getWeeksBySessionTerm({
        session_id: selectedSessionId,
        term_id: termId,
      });
      const weeks = res.data?.data || [];
      if (weeks.length === 0) {
        setTermDateRange({ start: null, end: null });
        return;
      }
      const sorted = [...weeks].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      const first = sorted[0].start_date;
      const lastStart = new Date(sorted[sorted.length - 1].start_date + 'T00:00:00');
      lastStart.setDate(lastStart.getDate() + 6);
      const last = lastStart.toISOString().slice(0, 10);
      setTermDateRange({ start: first, end: last });
    } catch (err) {
      console.error('Failed to load term date range', err);
      setTermDateRange({ start: null, end: null });
    }
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadSessions = async () => {
    setLoading(true);
    try {
      // getActiveSessionTerm() on the backend is the source of truth for
      // "what's actually running" — Session order/position tells you
      // nothing about that, so it must never drive this default.
      const [res, activeRes] = await Promise.all([fetchSessions(), fetchActiveTenantSessionTerm()]);
      const list = extractList(res);
      setSessions(list);
      if (list.length > 0) {
        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        const defaultSession =
          (activeSessionTerm && list.find((s) => s.id === activeSessionTerm.session_id)) ||
          list[0];
        setSelectedSessionId(defaultSession.id);
        await loadSessionTerms(defaultSession.id, activeSessionTerm);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
      showSnackbar('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTerms = async (sessionId, activeSessionTerm = null) => {
    try {
      const res = await fetchSessionTermsBySession(sessionId);
      const session_terms = extractList(res);
      setSessionTerms(session_terms);
      const selected =
        (activeSessionTerm &&
          activeSessionTerm.session_id === sessionId &&
          session_terms.find((st) => st.id === activeSessionTerm.id)) ||
        session_terms[0] ||
        null;
      if (selected) {
        setSelectedSessionTermId(selected.id);
        setSelectedSessionTermLabel(
          `${selected.session.session_name} - ${selected.term?.term_name}`,
        );
      } else {
        setSelectedSessionTermId(null);
        setSelectedSessionTermLabel('');
      }
    } catch (err) {
      console.error('Failed to load session terms', err);
      showSnackbar('Failed to load session terms', 'error');
    }
  };

  const loadBatches = async (termId) => {
    setBatchesLoading(true);
    try {
      const res = await fetchAdmissionBatches(termId);
      const list = extractList(res);
      setBatches(list);
      setSelectedBatchId(list.length > 0 ? list[0].id : null);
      setBatchPage(0);
      setBatchSearch('');
      setBatchProgrammeFilter('all');
      setBatchStatusFilter('all');
    } catch (err) {
      console.error('Failed to load batches', err);
      showSnackbar('Failed to load admission batches', 'error');
    } finally {
      setBatchesLoading(false);
    }
  };

  // ── Load admission code format (school-level, no batch needed) ────────────
  const loadAdmissionCodeFormat = async () => {
    setCodeFormatLoading(true);
    try {
      const res = await fetchAdmissionCodeFormat();
      const savedFormat = res?.data?.code_format ?? '';
      const savedShortName = res?.data?.school_short_name ?? '';

      // Put the full format directly into the input field
      setCodeFormatInput(sanitizeCodeFormat(savedFormat));
      setSchoolShortName(savedShortName || '');

      // Detect which student number is selected
      let foundStdNum = '';
      for (const opt of STD_NUM_OPTIONS) {
        if (savedFormat.includes(opt.key)) {
          foundStdNum = opt.key;
          break;
        }
      }
      setSelectedStdNum(foundStdNum);
    } catch (err) {
      console.error('Failed to load admission code format', err);
    } finally {
      setCodeFormatLoading(false);
    }
  };

  const handleSessionChange = (e) => {
    const id = Number(e.target.value);
    setSelectedSessionId(id);
    setSelectedSessionTermId(null);
    setSelectedSessionTermLabel('');
    setBatches([]);
    loadSessionTerms(id);
  };

  const handleTermSelect = (session_term) => {
    setSelectedSessionTermId(session_term.id);
    setSelectedSessionTermLabel(
      `${session_term.session.session_name} - ${session_term.term?.term_name}`,
    );
  };

  const handleToggleBatchStatus = async () => {
    const batch = confirmToggleBatch.batch;
    setConfirmToggleBatch({ open: false, batch: null });
    if (!batch) return;
    // Optimistic update
    const newStatus = batch.status === 'open' ? 'close' : 'open';
    setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, status: newStatus } : b)));
    try {
      await toggleAdmissionBatchStatus(batch.id);
      showSnackbar(`Batch ${newStatus === 'open' ? 'opened' : 'closed'} successfully`);
    } catch (err) {
      // Revert on failure
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: batch.status } : b)),
      );
      showSnackbar('Failed to update batch status', 'error');
    }
  };

  const handleSaveAdmissionLetter = async () => {
    if (!letterEditorBatch) return;
    try {
      const payload = {
        admission_letter_template: letterEditorContent,
      };

      await updateAdmissionBatch(letterEditorBatch.id, payload);

      // Update the batch in the local state
      setBatches((prev) =>
        prev.map((b) =>
          b.id === letterEditorBatch.id
            ? { ...b, admission_letter_template: letterEditorContent }
            : b,
        ),
      );

      showSnackbar('Admission letter saved successfully');
      setLetterEditorOpen(false);
    } catch (err) {
      console.error('Failed to save admission letter', err);
      showSnackbar('Failed to save admission letter', 'error');
    }
  };

  const handleCreateBatch = () => {
    navigate('/admission-setup/create-batch', {
      state: {
        sessionId: selectedSessionId,
        sessionTermId: selectedSessionTermId,
        sessionTermLabel: selectedSessionTermLabel,
      },
    });
  };

  const handleEditBatch = (batch) => {
    setBatchMenuAnchor(null);
    setMenuBatch(null);
    navigate(`/admission-setup/edit-batch/${batch.id}`, {
      state: {
        batch,
        sessionId: selectedSessionId,
        sessionTermId: selectedSessionTermId,
        sessionTermLabel: selectedSessionTermLabel,
      },
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Load code format data when switching to the Code Format tab
    if (newValue === 1) {
      loadAdmissionCodeFormat();
    }
  };

  // ── Code Format handlers (school-level, no batch) ──────────────────────────

  // Helper: append a placeholder to codeFormatInput with auto-slash
  const appendToFormat = (placeholder) => {
    setCodeFormatInput((prev) => {
      const trimmed = prev.trim();
      const prefix = trimmed.length > 0 ? '/' : '';
      return trimmed + prefix + placeholder;
    });
  };

  // Get the complete format string — everything is already in the input
  const getFullCodeFormat = () => sanitizeCodeFormat(codeFormatInput.trim());

  const handleShortNameChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSchoolShortName(value);

    if (value.trim()) {
      // Insert [:shortname] if not already present (functional updater avoids stale closure)
      setCodeFormatInput((prev) => {
        if (prev.includes('[:shortname]')) return prev;
        const trimmed = prev.trim();
        const prefix = trimmed.length > 0 ? '/' : '';
        return trimmed + prefix + '[:shortname]';
      });
    } else {
      // Remove [:shortname] when cleared (use split/join to avoid regex special chars)
      setCodeFormatInput((prev) =>
        prev
          .split('/[:shortname]')
          .join('')
          .split('[:shortname]/')
          .join('')
          .split('[:shortname]')
          .join('')
          .replace(/\/+$/, '')
          .replace(/^\/+/, '')
          .replace(/\/+/g, '/'),
      );
    }
  };

  const handleYearClick = () => {
    appendToFormat('[:year]');
    setCopiedPlaceholder('[:year]');
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  const handleStdNumChange = (event) => {
    const value = event.target.value;
    setSelectedStdNum(value);

    // Remove any existing stdNum placeholder first (use split/join to avoid regex issues)
    setCodeFormatInput((prev) => {
      let cleaned = prev;
      for (const opt of STD_NUM_OPTIONS) {
        cleaned = cleaned
          .split(`/${opt.key}`)
          .join('')
          .split(`${opt.key}/`)
          .join('')
          .split(opt.key)
          .join('');
      }
      cleaned = cleaned.replace(/\/+$/, '').replace(/^\/+/, '').replace(/\/+/g, '/').trim();
      const prefix = cleaned.length > 0 ? '/' : '';
      return cleaned + prefix + value;
    });

    setCopiedPlaceholder(value);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  const handleSaveCodeFormat = async () => {
    const fullFormat = getFullCodeFormat().trim();
    if (!fullFormat) {
      showSnackbar('Please build a code format first', 'warning');
      return;
    }
    setCodeFormatSaving(true);
    try {
      await updateAdmissionCodeFormat({
        code_format: fullFormat,
        school_short_name: schoolShortName.trim(),
      });
      showSnackbar('Admission code format updated successfully');
    } catch (err) {
      console.error('Failed to save code format', err);
      showSnackbar('Failed to update admission code format', 'error');
    } finally {
      setCodeFormatSaving(false);
    }
  };

  // Generate example output
  const getExampleOutput = () => {
    const shortNameValue = schoolShortName.trim() || 'STPAULS';
    return getFullCodeFormat()
      .replace(/\[:shortname\]/g, shortNameValue)
      .replace(/\[:year\]/g, '2026')
      .replace(/\[:stdNum_2\]/g, '01')
      .replace(/\[:stdNum_3\]/g, '001')
      .replace(/\[:stdNum_4\]/g, '0001')
      .replace(/\[:stdNum_5\]/g, '00001');
    // .replace(/\[:stdNum_6\]/g, '000001');
  };

  // ── Code Format wizard: which real components are currently included ──────
  const componentActive = {
    shortname: codeFormatInput.includes('[:shortname]'),
    year: codeFormatInput.includes('[:year]'),
    stdnum: Boolean(selectedStdNum) && codeFormatInput.includes(selectedStdNum),
  };

  const toggleComponent = (key) => {
    if (key === 'year') {
      if (componentActive.year) {
        setCodeFormatInput((prev) =>
          prev
            .split('/[:year]')
            .join('')
            .split('[:year]/')
            .join('')
            .split('[:year]')
            .join('')
            .replace(/\/+$/, '')
            .replace(/^\/+/, '')
            .replace(/\/+/g, '/'),
        );
      } else {
        appendToFormat('[:year]');
      }
      return;
    }

    if (key === 'stdnum') {
      if (componentActive.stdnum) {
        setCodeFormatInput((prev) => {
          let cleaned = prev;
          for (const opt of STD_NUM_OPTIONS) {
            cleaned = cleaned.split(`/${opt.key}`).join('').split(`${opt.key}/`).join('').split(opt.key).join('');
          }
          return cleaned.replace(/\/+$/, '').replace(/^\/+/, '').replace(/\/+/g, '/');
        });
        setSelectedStdNum('');
      } else {
        handleStdNumChange({ target: { value: selectedStdNum || STD_NUM_OPTIONS[0].key } });
      }
      return;
    }

    if (key === 'shortname' && componentActive.shortname) {
      handleShortNameChange({ target: { value: '' } });
    }
    // else (shortname, currently off): no-op — the name is typed in the
    // Configure Settings column, there's nothing to toggle on here
  };

  // ── Code Format wizard: colored breakdown of the active format string ─────
  const codeFormatBreakdown = useMemo(() => {
    const tokens = getFullCodeFormat().split('/').filter(Boolean);
    const shortNameValue = schoolShortName.trim() || 'STPAULS';

    return tokens.map((token) => {
      if (token === '[:shortname]') {
        return { label: 'School Short Name', value: shortNameValue, color: '#9333EA' };
      }
      if (token === '[:year]') {
        return { label: 'Admission Year', value: '2026', color: '#2563EB' };
      }
      const stdOpt = STD_NUM_OPTIONS.find((o) => o.key === token);
      if (stdOpt) {
        return { label: 'Sequential Number', value: stdOpt.example, color: '#16A34A' };
      }
      return { label: token, value: token, color: '#6B7280' };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFormatInput, schoolShortName]);

  // ── Code Format wizard: a few more incrementing sample numbers ─────────────
  const moreExamples = useMemo(() => {
    const stdOpt = STD_NUM_OPTIONS.find((o) => o.key === selectedStdNum);
    if (!stdOpt || !getFullCodeFormat()) return [];
    const digits = stdOpt.example.length;
    const shortNameValue = schoolShortName.trim() || 'STPAULS';

    return [1, 2, 3].map((n) =>
      getFullCodeFormat()
        .replace(/\[:shortname\]/g, shortNameValue)
        .replace(/\[:year\]/g, '2026')
        .split(stdOpt.key)
        .join(String(n).padStart(digits, '0')),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFormatInput, schoolShortName, selectedStdNum]);

  // Dynamic session name for header chip
  const currentSessionObj = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentSessionName = currentSessionObj?.session_name || currentSessionObj?.name || '';

  // The currently-selected session term record (for the "Active Session"
  // info card's start/end/application-period/status fields).
  const selectedSessionTermObj = sessionTerms.find((st) => st.id === selectedSessionTermId) || null;

  // ── 5-step completion overview — real counts/status derived from the
  // batches already loaded for this session term, not a static mockup. ──
  const stepData = useMemo(() => {
    const total = batches.length;
    const examBatches = batches.filter((b) => b.has_entrance_exam);
    const paymentBatches = batches.filter((b) => b.require_payment);
    const letterBatches = batches.filter((b) => b.enable_letter);
    const examConfigured = examBatches.filter((b) => b.exam_date && b.pass_mark).length;
    const paymentConfigured = paymentBatches.filter((b) => b.application_fee).length;
    const letterConfigured = letterBatches.filter((b) => b.admission_letter_template).length;

    const statusFor = (required, configured) => {
      if (required === 0) return 'not_configured';
      return configured === required ? 'completed' : 'in_progress';
    };

    return [
      {
        key: 'session',
        icon: SessionStepIcon,
        label: 'Session Setup',
        count: total,
        caption: 'Using this session & term',
        status: selectedSessionTermId ? 'completed' : 'not_configured',
      },
      {
        key: 'batch',
        icon: BatchStepIcon,
        label: 'Batch Configuration',
        count: total,
        caption: 'Created and active',
        status: total > 0 ? 'completed' : 'not_configured',
      },
      {
        key: 'exam',
        icon: ExamStepIcon,
        label: 'Entrance Exam',
        count: examBatches.length,
        caption: 'Require entrance exam',
        status: statusFor(examBatches.length, examConfigured),
      },
      {
        key: 'payment',
        icon: PaymentStepIcon,
        label: 'Payment Settings',
        count: paymentBatches.length,
        caption: 'Require application payment',
        status: statusFor(paymentBatches.length, paymentConfigured),
      },
      {
        key: 'letter',
        icon: LetterStepIcon,
        label: 'Admission Letter',
        count: letterBatches.length,
        caption: 'Require offer letter template',
        status: statusFor(letterBatches.length, letterConfigured),
      },
    ];
  }, [batches, selectedSessionTermId]);

  // ── Programme filter options + client-side search/filter over the
  // already-loaded batches (the list endpoint has no server-side
  // search/pagination today — see the "known limitation" note below). ──
  const programmeOptions = useMemo(() => {
    const seen = new Map();
    batches.forEach((b) => {
      const p = b.programme;
      if (p?.id && !seen.has(p.id)) seen.set(p.id, p.programme_name || p.name);
    });
    return [...seen.entries()];
  }, [batches]);

  const filteredBatches = useMemo(() => {
    const q = batchSearch.trim().toLowerCase();
    return batches.filter((b) => {
      if (q && !(b.batch_name || '').toLowerCase().includes(q)) return false;
      if (batchProgrammeFilter !== 'all' && b.programme?.id !== batchProgrammeFilter) return false;
      if (batchStatusFilter !== 'all' && b.status !== batchStatusFilter) return false;
      return true;
    });
  }, [batches, batchSearch, batchProgrammeFilter, batchStatusFilter]);

  const pagedBatches = filteredBatches.slice(
    batchPage * BATCHES_PER_PAGE,
    batchPage * BATCHES_PER_PAGE + BATCHES_PER_PAGE,
  );
  const batchPageCount = Math.max(1, Math.ceil(filteredBatches.length / BATCHES_PER_PAGE));

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || null;

  // ── Selected Batch Configuration checklist — real completion state per
  // category, not a static list. "Application Portal" has no backing field
  // yet (there's no such concept in the data model today), so it's shown as
  // a pending/informational step rather than faked as complete.
  const batchChecklist = selectedBatch
    ? [
        {
          key: 'details',
          label: 'Batch Details',
          caption: 'Programme, level, capacity and dates',
          done: true,
        },
        {
          key: 'exam',
          label: 'Entrance Exam',
          caption: 'Set subjects, date, rules and venues',
          done: !selectedBatch.has_entrance_exam || Boolean(selectedBatch.exam_date && selectedBatch.pass_mark),
        },
        {
          key: 'payment',
          label: 'Payment Settings',
          caption: 'Set application fee and payment methods',
          done: !selectedBatch.require_payment || Boolean(selectedBatch.application_fee),
        },
        {
          key: 'letter',
          label: 'Admission Letter',
          caption: 'Configure offer letter template',
          done: !selectedBatch.enable_letter || Boolean(selectedBatch.admission_letter_template),
        },
        {
          key: 'portal',
          label: 'Application Portal',
          caption: 'Review and activate for this batch',
          done: null,
          pending: true,
        },
      ]
    : [];

  return (
    <PageContainer title="Admission Setup" description="Manage admission batches">
      <Breadcrumb title="Admission Setup" items={BCrumb} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Admission setup tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 15,
              minWidth: 180,
            },
          }}
        >
          <Tab label="Admission Setup" id="admission-tab-0" aria-controls="admission-tabpanel-0" />
          <Tab
            label="Admission Code Format"
            id="admission-tab-1"
            aria-controls="admission-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1 — ADMISSION SETUP (existing content)
          ══════════════════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={0}>
        {/* ── 5-step completion overview, real counts from the loaded batches ── */}
        {loading ? (
          <StepperSkeleton />
        ) : (
          <Stack direction="row" spacing={2} sx={{ mb: 2, overflowX: 'auto' }}>
            {stepData.map((step, i) => (
              <StepCard key={step.key} step={step} index={i} />
            ))}
          </Stack>
        )}

        <Grid container spacing={2} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 3 }}>
            <ParentCard
              title="Admission Session"
              sx={{
                '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
                '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
              }}
            >
              {loading ? (
                <Box>
                  <Skeleton variant="rounded" height={40} sx={{ mb: 1.5 }} />
                  <Skeleton variant="rounded" height={40} sx={{ mb: 1.5 }} />
                  <Skeleton variant="rounded" height={100} />
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 1.5 }}>
                    <TextField
                      select
                      fullWidth
                      label="Academic Session"
                      value={selectedSessionId}
                      onChange={handleSessionChange}
                      size="small"
                    >
                      {sessions.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.session_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <TextField
                      select
                      fullWidth
                      label="Term"
                      value={selectedSessionTermId || ''}
                      onChange={(e) => {
                        const st = sessionTerms.find((t) => t.id === Number(e.target.value));
                        if (st) handleTermSelect(st);
                      }}
                      size="small"
                      disabled={sessionTerms.length === 0}
                    >
                      {sessionTerms.map((st) => (
                        <MenuItem key={st.id} value={st.id}>
                          {st.term?.term_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {!selectedSessionTermObj ? (
                    <Alert severity="info">No session terms found.</Alert>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.08)' : '#ECFDF5'),
                        border: '1px solid',
                        borderColor: 'success.light',
                      }}
                    >
                      <Chip label="Active Session" size="small" color="success" sx={{ fontWeight: 700, fontSize: 10, mb: 1 }} />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                        {selectedSessionTermObj.session?.session_name} – {selectedSessionTermObj.term?.term_name}
                      </Typography>
                      <Stack spacing={0.4}>
                        <Typography variant="caption" color="text.secondary">
                          Start Date: <strong>{termDateRange.start || '—'}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          End Date: <strong>{termDateRange.end || '—'}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Application Period:{' '}
                          <strong>
                            {termDateRange.start || '—'} - {selectedBatch?.closing_date || '—'}
                          </strong>
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Typography variant="caption" color="text.secondary">
                            Status:
                          </Typography>
                          <StatusChip status={selectedSessionTermObj.status} />
                        </Stack>
                      </Stack>
                    </Paper>
                  )}
                </>
              )}
            </ParentCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ParentCard
              title={
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={{ xs: 1.5, sm: 0 }}
                >
                  <Typography variant="h5">
                    Manage Admission Batches
                    {selectedSessionTermLabel && (
                      <>
                        {' '}
                        For{' '}
                        <Box
                          component="span"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                          }}
                        >
                          {selectedSessionTermLabel}
                        </Box>
                      </>
                    )}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!selectedSessionTermId}
                    onClick={handleCreateBatch}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', ml: { xs: 0, sm: 2 } }}
                  >
                    Create New Admission
                  </Button>
                </Box>
              }
              sx={{
                '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
                '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
              }}
            >
              {!selectedSessionTermId ? (
                <Alert severity="info">Select a session term on the left to manage batches.</Alert>
              ) : (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Search by batch name..."
                    value={batchSearch}
                    onChange={(e) => {
                      setBatchSearch(e.target.value);
                      setBatchPage(0);
                    }}
                    sx={{ flex: 1, minWidth: 160 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Programme"
                    value={batchProgrammeFilter}
                    onChange={(e) => {
                      setBatchProgrammeFilter(e.target.value);
                      setBatchPage(0);
                    }}
                    sx={{ minWidth: 130 }}
                  >
                    <MenuItem value="all">All Programmes</MenuItem>
                    {programmeOptions.map(([id, name]) => (
                      <MenuItem key={id} value={id}>
                        {name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={batchStatusFilter}
                    onChange={(e) => {
                      setBatchStatusFilter(e.target.value);
                      setBatchPage(0);
                    }}
                    sx={{ minWidth: 110 }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="close">Closed</MenuItem>
                  </TextField>
                  <Button
                    size="small"
                    onClick={() => {
                      setBatchSearch('');
                      setBatchProgrammeFilter('all');
                      setBatchStatusFilter('all');
                      setBatchPage(0);
                    }}
                    sx={{ flexShrink: 0 }}
                  >
                    Clear Filters
                  </Button>
                </Stack>
              )}

              {!selectedSessionTermId ? null : batchesLoading ? (
                <Stack spacing={1}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={44} />
                  ))}
                </Stack>
              ) : filteredBatches.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  {batches.length === 0
                    ? 'No admission batches yet for this term. Click "Create New Admission" to add one.'
                    : 'No batches match your search/filters.'}
                </Alert>
              ) : (
                <Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Batch Name</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Entrance Exam
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Require Payment
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Admission Letter
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Status
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedBatches.map((batch, i) => (
                          <TableRow
                            key={batch.id}
                            hover
                            selected={batch.id === selectedBatchId}
                            onClick={() => setSelectedBatchId(batch.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{batchPage * BATCHES_PER_PAGE + i + 1}</TableCell>

                            <TableCell sx={{ fontWeight: 600 }}>{batch.batch_name}</TableCell>

                            {/* Entrance Exam */}
                            <TableCell align="center">
                              {batch.has_entrance_exam ? (
                                <Chip
                                  label="Set E-Exam"
                                  size="small"
                                  sx={{
                                    bgcolor: 'success.light',
                                    color: 'success.dark',
                                    fontWeight: 700,
                                    fontSize: 10,
                                  }}
                                />
                              ) : (
                                <YesNoPill value={false} />
                              )}
                            </TableCell>

                            {/* Require Payment */}
                            <TableCell align="center">
                              <FeePills
                                requirePayment={batch.require_payment}
                                appFee={batch.application_fee}
                                acceptanceFee={batch.acceptance_fee}
                                onViewPayments={() => {
                                  setPaymentViewBatch(batch);
                                  setPaymentViewOpen(true);
                                }}
                              />
                            </TableCell>

                            {/* Admission Letter */}
                            <TableCell align="center">
                              <ViewEditPair
                                onView={() => {
                                  setLetterEditorBatch(batch);
                                  setLetterEditorReadOnly(true);
                                  setLetterEditorOpen(true);
                                }}
                                onEdit={() => {
                                  setLetterEditorBatch(batch);
                                  setLetterEditorReadOnly(false);
                                  setLetterEditorOpen(true);
                                }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <BatchStatusChip status={batch.status} />
                            </TableCell>

                            {/* Action */}
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBatchMenuAnchor(e.currentTarget);
                                  setMenuBatch(batch);
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredBatches.length}
                    page={batchPage}
                    onPageChange={(_, p) => setBatchPage(p)}
                    rowsPerPage={BATCHES_PER_PAGE}
                    rowsPerPageOptions={[BATCHES_PER_PAGE]}
                    labelDisplayedRows={({ from, to, count }) => `Showing ${from}-${to} of ${count} batches`}
                  />
                </Box>
              )}
            </ParentCard>
          </Grid>

          {/* ── Selected Batch Configuration ─────────────────────── */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ParentCard
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>
                    Selected Batch Configuration
                  </Typography>
                  {selectedBatch && (
                    <Button
                      size="small"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={() => handleEditBatch(selectedBatch)}
                    >
                      Edit Batch
                    </Button>
                  )}
                </Box>
              }
              sx={{
                '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.25 },
                '& .MuiCardContent-root': { p: 1.25, '&:last-child': { pb: 1.25 } },
              }}
            >
              {batchesLoading ? (
                <Stack spacing={1}>
                  <Skeleton variant="rounded" height={44} />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={38} />
                  ))}
                </Stack>
              ) : !selectedBatch ? (
                <Alert severity="info">Select a batch from the list to view its configuration.</Alert>
              ) : (
                <Stack spacing={1}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700}>
                        {selectedBatch.batch_name}
                      </Typography>
                      <BatchStatusChip status={selectedBatch.status} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                      {selectedBatch.programme?.programme_name || selectedBatch.programme?.name || '—'} |{' '}
                      {selectedSessionTermLabel}
                    </Typography>
                  </Paper>

                  <Stack divider={<Divider />}>
                    {batchChecklist.map((item) => (
                      <Stack
                        key={item.key}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ py: 0.6 }}
                      >
                        {item.pending ? (
                          <StepInProgressIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
                        ) : item.done ? (
                          <StepCompleteIcon sx={{ color: 'success.main', fontSize: 22 }} />
                        ) : (
                          <StepNotConfiguredIcon sx={{ color: 'error.main', fontSize: 22 }} />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.caption}
                          </Typography>
                        </Box>
                        <ChevronRightIcon sx={{ color: 'text.disabled' }} />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              )}
            </ParentCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2 — ADMISSION CODE FORMAT (school-level, no batch needed)
          ══════════════════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabValue} index={1}>
        {codeFormatLoading ? (
          <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={64} sx={{ flex: 1, borderRadius: 2 }} />
              ))}
            </Stack>
            <Grid container spacing={2}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                  <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <>
            {/* ── 3-step header (all 3 columns below are always visible —
                this row is a visual progress indicator, not a gate) ── */}
            <Stack direction="row" spacing={2} sx={{ mb: 2, overflowX: 'auto' }}>
              {CODE_FORMAT_STEPS.map((step, i) => (
                <Paper
                  key={step.key}
                  elevation={0}
                  sx={{
                    flex: 1,
                    minWidth: 220,
                    p: 1.5,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: i === 0 ? step.color : 'divider',
                    bgcolor: i === 0 ? alpha(step.color, 0.06) : 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: step.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {step.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                      {step.subtitle}
                    </Typography>
                  </Box>
                  {i < CODE_FORMAT_STEPS.length - 1 && (
                    <StepArrowIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  )}
                </Paper>
              ))}
            </Stack>

            <Grid container spacing={2} alignItems="stretch">
              {/* ── Column 1: Select Components ── */}
              <Grid size={{ xs: 12, md: 4 }}>
                <ParentCard
                  title="Select Components"
                  sx={{
                    '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.25 },
                    '& .MuiCardContent-root': { p: 1.25, '&:last-child': { pb: 1.25 } },
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Choose the information to include in the admission number.
                  </Typography>
                  <Stack spacing={1}>
                    {CODE_FORMAT_COMPONENTS.map((comp) => {
                      const Icon = comp.icon;
                      const active = comp.real && componentActive[comp.key];
                      return (
                        <Box
                          key={comp.key}
                          onClick={() => comp.real && toggleComponent(comp.key)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: active ? comp.color : 'divider',
                            bgcolor: active ? alpha(comp.color, 0.06) : 'transparent',
                            opacity: comp.real ? 1 : 0.55,
                            cursor: comp.real ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              bgcolor: alpha(comp.color, 0.12),
                              color: comp.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={16} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              {comp.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              {comp.example}
                            </Typography>
                          </Box>
                          {comp.real ? (
                            <Checkbox checked={active} size="small" sx={{ p: 0.5 }} />
                          ) : (
                            <Chip label="Coming soon" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700 }} />
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </ParentCard>
              </Grid>

              {/* ── Column 2: Configure Settings ── */}
              <Grid size={{ xs: 12, md: 4 }}>
                <ParentCard
                  title="Configure Settings"
                  sx={{
                    '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.25 },
                    '& .MuiCardContent-root': { p: 1.25, '&:last-child': { pb: 1.25 } },
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Set options for each selected component.
                  </Typography>
                  {!componentActive.shortname && !componentActive.year && !componentActive.stdnum ? (
                    <Alert severity="info">Select a component on the left to configure it.</Alert>
                  ) : (
                    <Stack spacing={2} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                      {componentActive.shortname && (
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                            <IconSchool size={16} color="var(--mui-palette-primary-main)" />
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              School Short Name
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Use your school&apos;s short name (2-10 characters).
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g. IMC"
                            value={schoolShortName}
                            onChange={handleShortNameChange}
                            sx={{
                              '& .MuiOutlinedInput-input': {
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                              },
                            }}
                          />
                        </Box>
                      )}

                      {componentActive.year && (
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                            <IconCalendar size={16} color="var(--mui-palette-primary-main)" />
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              Admission Year
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Full calendar year (e.g. 2026) — automatically inserted into the format.
                          </Typography>
                        </Box>
                      )}

                      {componentActive.stdnum && (
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                            <IconHash size={16} color="var(--mui-palette-primary-main)" />
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              Sequential Number
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Number of digits
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={selectedStdNum}
                            onChange={handleStdNumChange}
                          >
                            {STD_NUM_OPTIONS.map((opt) => (
                              <MenuItem key={opt.key} value={opt.key}>
                                {opt.label} (e.g. {opt.example})
                              </MenuItem>
                            ))}
                          </TextField>
                          <Alert severity="info" sx={{ mt: 1.5, fontSize: 11.5 }} icon={<IconInfoCircle size={16} />}>
                            The sequential number will automatically increase for each new admitted student in this session.
                          </Alert>
                        </Box>
                      )}
                    </Stack>
                  )}
                </ParentCard>
              </Grid>

              {/* ── Column 3: Preview & Save ── */}
              <Grid size={{ xs: 12, md: 4 }}>
                <ParentCard
                  title="Preview & Save"
                  sx={{
                    '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.25 },
                    '& .MuiCardContent-root': { p: 1.25, '&:last-child': { pb: 1.25 } },
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    See how the admission number will look.
                  </Typography>

                  {!getFullCodeFormat() ? (
                    <Alert severity="info">Select components on the left to preview your format.</Alert>
                  ) : (
                    <>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          mb: 1.5,
                          borderRadius: 2,
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(6,78,59,0.2)' : '#ECFDF5'),
                          border: '1px solid',
                          borderColor: 'success.light',
                        }}
                      >
                        <Chip label="Sample Admission Number" size="small" color="success" sx={{ fontWeight: 700, fontSize: 10, mb: 1 }} />
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{ fontFamily: 'monospace', letterSpacing: 1 }}
                        >
                          {codeFormatBreakdown.map((seg, i) => (
                            <Fragment key={i}>
                              {i > 0 && <Box component="span" sx={{ color: 'text.disabled', mx: 0.25 }}>/</Box>}
                              <Box component="span" sx={{ color: seg.color }}>
                                {seg.value}
                              </Box>
                            </Fragment>
                          ))}
                        </Typography>
                      </Paper>

                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                        Breakdown
                      </Typography>
                      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                        {codeFormatBreakdown.map((seg, i) => (
                          <Stack key={i} direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: seg.color }} />
                              <Typography variant="caption" color="text.secondary">
                                {seg.label}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                              {seg.value}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>

                      {moreExamples.length > 0 && (
                        <>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                            More Examples
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
                            {moreExamples.map((ex, i) => (
                              <Chip key={i} label={ex} size="small" sx={{ fontFamily: 'monospace', fontSize: 10.5, fontWeight: 700 }} />
                            ))}
                            <Chip label="..." size="small" sx={{ fontFamily: 'monospace', fontSize: 10.5 }} />
                          </Stack>
                        </>
                      )}
                    </>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={codeFormatSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveCodeFormat}
                    disabled={codeFormatSaving || !getFullCodeFormat().trim()}
                    sx={{ fontWeight: 700 }}
                  >
                    {codeFormatSaving ? 'Saving...' : 'Save Admission Code Format'}
                  </Button>
                </ParentCard>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      {/* ── Shared menus & dialogs ────────────────────────────────────────────── */}

      <Menu
        anchorEl={batchMenuAnchor}
        open={Boolean(batchMenuAnchor)}
        onClose={() => {
          setBatchMenuAnchor(null);
          setMenuBatch(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleEditBatch(menuBatch)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Batch
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmToggleBatch({ open: true, batch: menuBatch });
            setBatchMenuAnchor(null);
            setMenuBatch(null);
          }}
          sx={{ color: menuBatch?.status === 'open' ? 'error.main' : 'success.main' }}
        >
          {menuBatch?.status === 'open' ? 'Close Batch' : 'Open Batch'}
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmToggleBatch.open}
        onClose={() => setConfirmToggleBatch({ open: false, batch: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmToggleBatch.batch?.status === 'open' ? 'Close Batch' : 'Open Batch'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            <Box component="span">
              {confirmToggleBatch.batch?.status === 'open' ? 'close' : 'open'}
            </Box>{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {confirmToggleBatch.batch?.batch_name}
            </Box>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={() => setConfirmToggleBatch({ open: false, batch: null })}
          >
            Cancel
          </Button>
          <Button
            size="small"
            color={confirmToggleBatch.batch?.status === 'open' ? 'error' : 'success'}
            onClick={handleToggleBatchStatus}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={letterEditorOpen}
        onClose={() => setLetterEditorOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {letterEditorReadOnly ? 'View' : 'Edit'} Admission Letter —{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {letterEditorBatch?.batch_name ?? ''}
              </Box>
            </Typography>
            {selectedSessionTermLabel && (
              <Typography variant="caption" color="text.secondary">
                {selectedSessionTermLabel}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          <AdmissionLetterEditor
            key={`${letterEditorBatch?.id}-${letterEditorReadOnly}`}
            initialContent={letterEditorBatch?.admission_letter_template ?? ''}
            readOnly={letterEditorReadOnly}
            onChange={(html) => {
              setLetterEditorContent(html);
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setLetterEditorOpen(false)}
            color="inherit"
          >
            {letterEditorReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!letterEditorReadOnly && (
            <Button size="small" onClick={handleSaveAdmissionLetter} sx={{ fontWeight: 700 }}>
              Save Letter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment View Modal */}
      <Dialog
        open={paymentViewOpen}
        onClose={() => setPaymentViewOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Payment Breakdown —{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {paymentViewBatch?.batch_name ?? ''}
              </Box>
            </Typography>
            {selectedSessionTermLabel && (
              <Typography variant="caption" color="text.secondary">
                {selectedSessionTermLabel}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {!paymentViewBatch?.require_payment ? (
            <Alert severity="info">No payment required for this batch.</Alert>
          ) : (
            <Stack spacing={3}>
              {/* Pre-Application Payments */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary.main">
                  Pre-Application Payments
                </Typography>
                {!paymentViewBatch?.pre_application_payments ||
                  paymentViewBatch.pre_application_payments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No pre-application payments set
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {paymentViewBatch.pre_application_payments.map((payment) => (
                      <Box
                        key={payment.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {payment.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.bank_name} - {payment.account_number}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          ₦{payment.amount.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: 'primary.light',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Pre-Application Total:
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="primary.main">
                        ₦{paymentViewBatch.application_fee?.toLocaleString() ?? '0'}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Box>

              {/* Post-Application Payments */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom color="success.main">
                  Post-Application Payments
                </Typography>
                {!paymentViewBatch?.post_application_payments ||
                  paymentViewBatch.post_application_payments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No post-application payments set
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {paymentViewBatch.post_application_payments.map((payment) => (
                      <Box
                        key={payment.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {payment.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.bank_name} - {payment.account_number}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          ₦{payment.amount.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: 'success.light',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Post-Application Total:
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="success.main">
                        ₦{paymentViewBatch.acceptance_fee?.toLocaleString() ?? '0'}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Box>

              {/* Grand Total */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: 2,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Grand Total:
                </Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  ₦
                  {(
                    (paymentViewBatch?.pre_application_payments || []).reduce(
                      (sum, p) => sum + (p.amount || 0),
                      0,
                    ) +
                    (paymentViewBatch?.post_application_payments || []).reduce(
                      (sum, p) => sum + (p.amount || 0),
                      0,
                    )
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setPaymentViewOpen(false)}
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Portal — Snackbar doesn't portal itself (unlike Dialog), so it can
          get trapped under an open Dialog's stacking context regardless of
          z-index. Portal escapes it to document.body, same as Dialog. */}
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </PageContainer >
  );
};

export default AdmissionSetup;
