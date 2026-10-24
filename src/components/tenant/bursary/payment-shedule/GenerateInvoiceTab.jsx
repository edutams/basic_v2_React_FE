import { useState, useEffect, useMemo } from 'react';
import {
  fetchBursarySessionTerms,
  fetchGenerateInvoiceOverview,
} from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  IconButton,
  Menu,
  Tooltip,
  Divider,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  PeopleAltOutlined as StudentsIcon,
  MonetizationOnOutlined as MoneyIcon,
  ArticleOutlined as CoverageIcon,
  WarningAmberOutlined as ReviewIcon,
  FileDownloadOutlined as ExportIcon,
  MoreVert as MoreVertIcon,
  ChevronRight as ChevronRightIcon,
  InfoOutlined as InfoOutlinedIcon,
  DescriptionOutlined as DocIconGreen,
  PersonOutline as PersonIcon,
  BarChartOutlined as BarChartIcon,
  StarOutline as StarIcon,
  Functions as FunctionsIcon,
  DescriptionOutlined as GenerateIcon,
  HotelOutlined as HotelIcon,
  HomeOutlined as HomeIcon,
  GroupsOutlined as StaffIcon,
  SchoolOutlined as ScholarIcon,
  PersonAddAltOutlined as NewStudentIcon,
  ReplayOutlined as ReturningIcon,
  AccessTimeOutlined as LateIcon,
  VolunteerActivismOutlined as AssistanceIcon,
  PeopleOutline as SiblingIcon,
  CategoryOutlined as CategoryIcon,
} from '@mui/icons-material';

const CURRENCY = (value) => `₦${Number(value || 0).toLocaleString()}`;

// The visual "scheme" (icon tile colour + icon) cycled across the table's
// category columns and matched by keyword where the category name gives an
// obvious hint — purely cosmetic, never affects the underlying numbers.
const SCHEME_CYCLE = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FCE7F3', color: '#DB2777' },
  { bg: '#CCFBF1', color: '#0D9488' },
];

const CATEGORY_ICON_RULES = [
  { test: /board/i, icon: HotelIcon },
  { test: /day/i, icon: HomeIcon },
  { test: /staff/i, icon: StaffIcon },
  { test: /scholar/i, icon: ScholarIcon },
  { test: /sibling/i, icon: SiblingIcon },
  { test: /financ|bursary|assist/i, icon: AssistanceIcon },
  { test: /new/i, icon: NewStudentIcon },
  { test: /return/i, icon: ReturningIcon },
  { test: /late/i, icon: LateIcon },
];
const categoryIconFor = (name) =>
  CATEGORY_ICON_RULES.find((rule) => rule.test.test(name || ''))?.icon || CategoryIcon;

/** Icon tile + title + subtitle + chevron — the same header shape every
 * stat card on the Payment Schedule page uses (Set Schedule step included).
 * An optional `tooltip` explains what the figure means and how it's scoped. */
const StatCardHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle, tooltip }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
    <Stack direction="row" spacing={0.25} alignItems="center">
      {tooltip && (
        <Tooltip title={tooltip} arrow placement="top">
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled', cursor: 'help' }} />
        </Tooltip>
      )}
      <ChevronRightIcon sx={{ color: 'text.disabled' }} />
    </Stack>
  </Box>
);

/** A small icon badge used throughout the summary panel (Invoice Progress /
 * Insights) — a scaled-down version of the stat-card icon tile. */
const MiniIconTile = ({ icon: Icon, bg, color, size = 28 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '8px',
      bgcolor: bg,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Icon sx={{ fontSize: size * 0.56 }} />
  </Box>
);

/** Status pill for one (payment item x category) cell — the icon/color is
 * entirely driven by the backend's `status`, never guessed on the frontend. */
const CellVisual = ({ cell }) => {
  if (!cell || cell.status === 'not_applicable') {
    return (
      <Tooltip title="No eligible students of this category exist in the current class scope — this item isn't applicable here.">
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="center"
          sx={{ cursor: 'help' }}
        >
          <RemoveCircleOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        </Stack>
      </Tooltip>
    );
  }

  const needsReview = cell.status === 'unpriced' || cell.status === 'partial';
  const tooltip = needsReview
    ? `Only ${cell.priced_students} of ${cell.total_students} eligible students are priced for this item — the rest are in a class with no price set. Fix it in Set Schedule.`
    : `Priced for all ${cell.total_students} eligible student${cell.total_students === 1 ? '' : 's'} in this category.`;

  return (
    <Tooltip title={tooltip}>
      <Box textAlign="center" sx={{ cursor: 'help' }}>
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
          {needsReview ? (
            <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
          ) : (
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
          )}
          <Typography
            variant="body2"
            fontWeight={700}
            color={needsReview ? 'error.main' : 'text.primary'}
          >
            {CURRENCY(cell.amount)}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {needsReview
            ? `${cell.priced_students}/${cell.total_students} priced`
            : `${cell.total_students} student${cell.total_students === 1 ? '' : 's'}`}
        </Typography>
      </Box>
    </Tooltip>
  );
};

const GenerateInvoiceTab = ({ showSnackbar, selectedClass, setSelectedClass, onReviewPricing }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  // Local to this step (not shared with Set Schedule's own category picker)
  // — Generate Invoice should default to showing every category, not
  // silently inherit whatever category Set Schedule last auto-selected.
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [errorOverview, setErrorOverview] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const distinctSessions = useMemo(() => {
    const bySessionId = new Map();
    sessions.forEach((item) => {
      if (!bySessionId.has(item.session_id)) {
        bySessionId.set(item.session_id, item);
      }
    });
    return Array.from(bySessionId.values());
  }, [sessions]);

  const termsForSelectedSession = useMemo(
    () => sessions.filter((item) => item.session_id === selectedSessionId),
    [sessions, selectedSessionId],
  );

  const selectedSessionTermId =
    sessions.find(
      (item) => item.session_id === selectedSessionId && item.term_id === selectedTermId,
    )?.id || '';

  // Fetch session terms on mount, defaulting to the school's active term.
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        const [res, activeRes] = await Promise.all([
          fetchBursarySessionTerms(),
          fetchActiveTenantSessionTerm(),
        ]);
        const list = Array.isArray(res?.data) ? res.data : [];
        setSessions(list);
        if (list.length > 0) {
          const activeSessionTerm = activeRes?.status ? activeRes.data : null;
          const defaultItem =
            (activeSessionTerm && list.find((item) => item.id === activeSessionTerm.id)) || list[0];
          setSelectedSessionId(defaultItem.session_id);
          setSelectedTermId(defaultItem.term_id);
        }
      } catch (err) {
        console.error('Failed to load session terms', err);
        if (typeof showSnackbar === 'function') {
          showSnackbar('Failed to load session terms', 'error');
        }
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSessionId || termsForSelectedSession.length === 0) return;
    const stillValid = termsForSelectedSession.some((item) => item.term_id === selectedTermId);
    if (!stillValid) {
      setSelectedTermId(termsForSelectedSession[0].term_id);
    }
  }, [selectedSessionId, termsForSelectedSession, selectedTermId]);

  // The single source of truth for this whole step — stat cards, class
  // chips, summary panel and table all come from this one response so they
  // can never disagree with one another.
  const loadOverview = async () => {
    if (!selectedSessionTermId) return;
    try {
      setLoadingOverview(true);
      setErrorOverview(null);
      const res = await fetchGenerateInvoiceOverview({
        sessionTermId: selectedSessionTermId,
        classId: selectedClass || undefined,
        categoryId: selectedCategory || undefined,
        search: appliedSearchQuery || undefined,
      });
      if (res?.success) {
        setOverview(res.data);
      } else {
        throw new Error(res?.message || 'Failed to load invoice overview');
      }
    } catch (err) {
      console.error('Failed to load generate invoice overview', err);
      setErrorOverview(
        err?.response?.data?.message || err.message || 'Failed to load invoice overview',
      );
      if (typeof showSnackbar === 'function') {
        showSnackbar('Failed to load invoice overview', 'error');
      }
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionTermId, selectedClass, selectedCategory, appliedSearchQuery]);

  const classes = overview?.classes || [];
  const categories = overview?.categories || [];
  const items = overview?.items || [];
  const footer = overview?.footer || { categories: {}, grand_total: 0 };
  // While loading, the table reuses the last real column/row count as its
  // skeleton shape so nothing jumps once fresh data lands; a true first
  // load (nothing fetched yet) falls back to a generic 3x5 placeholder.
  const tableCategories = categories.length > 0 ? categories : [{ id: 'sk-c1' }, { id: 'sk-c2' }, { id: 'sk-c3' }];
  const tableItems = items.length > 0 ? items : [{ id: 'sk-i1' }, { id: 'sk-i2' }, { id: 'sk-i3' }, { id: 'sk-i4' }, { id: 'sk-i5' }];
  const stats = overview?.stats || {
    students_in_scope: 0,
    classes_in_scope: 0,
    projected_value: 0,
    items_in_scope: 0,
    generated_students: 0,
    coverage_pct: 0,
    needs_review_count: 0,
  };
  const summary = overview?.summary || {
    eligible: 0,
    generated: 0,
    pending: 0,
    coverage_pct: 0,
    largest_category: null,
    highest_item: null,
    unpriced_count: 0,
  };

  const selectedClassName = classes.find((c) => String(c.id) === String(selectedClass))?.class_name;
  const hasData = !loadingOverview && !errorOverview && items.length > 0 && categories.length > 0;

  const handleRefresh = () => {
    setAppliedSearchQuery(searchQuery.trim());
    loadOverview();
  };

  const handleGenerateInvoices = () => {
    if (!selectedClass) return;
    const url = `/payment-schedule/invoice/${selectedSessionTermId}/${selectedClass}`;
    window.open(url, '_blank');
  };

  const handleExportCsv = () => {
    if (!items.length || !categories.length) return;
    const header = ['Payment Item', ...categories.map((c) => c.name), 'Total'];
    const lines = [header];
    items.forEach((row) => {
      lines.push([
        row.payment_name,
        ...categories.map((c) => row.cells[c.id]?.amount ?? 0),
        row.row_total,
      ]);
    });
    lines.push([
      'Total (Projected)',
      ...categories.map((c) => footer.categories?.[c.id] ?? 0),
      footer.grand_total,
    ]);
    const csv = lines.map((line) => line.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projected-invoices-${selectedSessionTermId || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMenuAnchor(null);
  };

  // A hair darker than the theme's own divider so the stat/summary cards
  // read as distinct surfaces rather than blending into the page background.
  const cardBorderColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';

  const reviewPillSx = {
    bgcolor: isDark ? 'rgba(220,38,38,0.15)' : '#FEF2F2',
    color: 'error.main',
    fontWeight: 700,
    borderRadius: '999px',
    px: 1.5,
    py: 0.25,
    minWidth: 0,
    textTransform: 'none',
    '&:hover': { bgcolor: isDark ? 'rgba(220,38,38,0.25)' : '#FEE2E2' },
  };

  return (
    <Stack spacing={2.5}>
      {/* 4 stat cards — standalone, matching the Set Schedule step's own
          stat-card row (not grouped with the filters below). */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: '14px', height: '100%', borderColor: cardBorderColor }}
          >
            <StatCardHeader
              icon={StudentsIcon}
              iconBg={isDark ? 'rgba(79,70,229,0.18)' : '#EEF2FF'}
              iconColor={isDark ? '#fff' : '#4F46E5'}
              title="Students in Scope"
              subtitle="Eligible for invoicing"
              tooltip="Real headcount of students across the selected class scope, based on each student's assigned payment category. Not affected by the Category or search filters below."
            />
            {loadingOverview ? (
              <Skeleton variant="text" width={70} height={44} sx={{ transform: 'none' }} />
            ) : (
              <Typography variant="h4" fontWeight={700} color="#4F46E5" sx={{ lineHeight: 1 }}>
                {stats.students_in_scope}
              </Typography>
            )}
            {loadingOverview ? (
              <Skeleton variant="rounded" width={72} height={22} sx={{ mt: 1, borderRadius: '999px' }} />
            ) : (
              <Chip
                size="small"
                label={`${stats.classes_in_scope} class${stats.classes_in_scope === 1 ? '' : 'es'}`}
                sx={{
                  mt: 1,
                  bgcolor: isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7',
                  color: '#16A34A',
                  fontWeight: 700,
                  height: 22,
                }}
              />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: '14px', height: '100%', borderColor: cardBorderColor }}
          >
            <StatCardHeader
              icon={MoneyIcon}
              iconBg={isDark ? 'rgba(22,163,74,0.18)' : '#ECFDF5'}
              iconColor="success.main"
              title="Projected Invoice Value"
              subtitle="Total amount to be invoiced"
              tooltip="Sum of every priced payment item × category combination in the current scope. A combination with no price set contributes nothing here — it shows up under Items Needing Review instead."
            />
            {loadingOverview ? (
              <Skeleton variant="text" width={150} height={44} sx={{ transform: 'none' }} />
            ) : (
              <Typography variant="h4" fontWeight={700} color="success.main" sx={{ lineHeight: 1 }}>
                {CURRENCY(stats.projected_value)}
              </Typography>
            )}
            {loadingOverview ? (
              <Skeleton variant="text" width={160} height={20} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Across {stats.items_in_scope} payment item{stats.items_in_scope === 1 ? '' : 's'}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: '14px', height: '100%', borderColor: cardBorderColor }}
          >
            <StatCardHeader
              icon={CoverageIcon}
              iconBg={isDark ? 'rgba(147,51,234,0.18)' : '#F3E8FF'}
              iconColor="#9333EA"
              title="Invoice Coverage"
              subtitle="Generated / Eligible students"
              tooltip="Share of eligible students in this class scope who already have at least one invoice generated this term. Deliberately not affected by the Category or search filters, so it stays a stable fact about the class."
            />
            <Box display="flex" alignItems="center" gap={1.5}>
              {loadingOverview ? (
                <Skeleton variant="text" width={90} height={36} sx={{ transform: 'none', flexShrink: 0 }} />
              ) : (
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#9333EA"
                  sx={{ lineHeight: 1, whiteSpace: 'nowrap' }}
                >
                  {`${stats.generated_students} / ${stats.students_in_scope}`}
                </Typography>
              )}
              <Box flex={1} minWidth={40}>
                {loadingOverview ? (
                  <Skeleton variant="rounded" height={7} sx={{ borderRadius: 4 }} />
                ) : (
                  <LinearProgress
                    variant="determinate"
                    value={stats.coverage_pct}
                    color="success"
                    sx={{ height: 7, borderRadius: 4 }}
                  />
                )}
              </Box>
              {loadingOverview ? (
                <Skeleton variant="text" width={32} height={20} sx={{ transform: 'none', flexShrink: 0 }} />
              ) : (
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  {stats.coverage_pct}%
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: '14px', height: '100%', borderColor: cardBorderColor }}
          >
            <StatCardHeader
              icon={ReviewIcon}
              iconBg={isDark ? 'rgba(217,119,6,0.18)' : '#FEF3C7'}
              iconColor="#D97706"
              title="Items Needing Review"
              subtitle="Unpriced combinations"
              tooltip="A payment item × category combination is flagged when at least one eligible student of that category is in a class with no price set for that item — within the current class/category filter."
            />
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {loadingOverview ? (
                <Skeleton variant="text" width={40} height={44} sx={{ transform: 'none' }} />
              ) : (
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color={stats.needs_review_count > 0 ? 'error.main' : 'success.main'}
                  sx={{ lineHeight: 1 }}
                >
                  {stats.needs_review_count}
                </Typography>
              )}
              {loadingOverview ? (
                <Skeleton variant="rounded" width={92} height={28} sx={{ borderRadius: '999px' }} />
              ) : (
                stats.needs_review_count > 0 &&
                typeof onReviewPricing === 'function' && (
                  <Button size="small" onClick={onReviewPricing} sx={reviewPillSx}>
                    Review now
                  </Button>
                )
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters + class chips — grouped in one shared card, same convention
          as the Set Schedule step's "Classes" card. */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', lg: 'center' },
            gap: 2,
            mb: 2,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
              <InputLabel>Academic Session</InputLabel>
              <Select
                value={selectedSessionId}
                label="Academic Session"
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={loadingSessions}
              >
                {distinctSessions.map((item) => (
                  <MenuItem key={item.session_id} value={item.session_id}>
                    {item.session?.session_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { sm: 140 } }}>
              <InputLabel>Term</InputLabel>
              <Select
                value={selectedTermId}
                label="Term"
                onChange={(e) => setSelectedTermId(e.target.value)}
                disabled={loadingSessions || termsForSelectedSession.length === 0}
              >
                {termsForSelectedSession.map((item) => (
                  <MenuItem key={item.term_id} value={item.term_id}>
                    {item.term?.term_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { sm: 190 } }}>
              <InputLabel shrink>Student Payment Category</InputLabel>
              <Select
                value={selectedCategory || ''}
                label="Student Payment Category"
                notched
                onChange={(e) => setSelectedCategory(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { sm: 170 } }}>
              <InputLabel shrink>Class</InputLabel>
              <Select
                value={selectedClass || ''}
                label="Class"
                notched
                onChange={(e) => setSelectedClass(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={String(cls.id)}>
                    {cls.class_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search payment item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRefresh();
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
            />

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={handleRefresh}
              sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Refresh
            </Button>

            <Tooltip title={!selectedClass ? 'Select a specific class to generate invoices' : ''}>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  disabled={!selectedClass}
                  startIcon={<GenerateIcon fontSize="small" />}
                  onClick={handleGenerateInvoices}
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Generate Invoices
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        <Box
          sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 3 },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
            <Chip
              label={`All Classes (${classes.length})`}
              onClick={() => setSelectedClass('')}
              sx={{
                bgcolor: !selectedClass ? 'primary.main' : isDark ? 'background.paper' : '#fff',
                color: !selectedClass ? '#fff' : 'text.primary',
                fontWeight: 700,
                border: '1px solid',
                borderColor: !selectedClass ? 'primary.main' : 'divider',
              }}
            />
            {classes.map((cls) => {
              const isSelected = String(selectedClass) === String(cls.id);
              return (
                <Chip
                  key={cls.id}
                  label={`${cls.class_name} (${cls.student_count})`}
                  onClick={() => setSelectedClass(String(cls.id))}
                  icon={
                    cls.has_invoice_generated ? (
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    ) : undefined
                  }
                  sx={{
                    bgcolor: isSelected ? 'primary.main' : isDark ? 'background.paper' : '#fff',
                    color: isSelected
                      ? '#fff'
                      : cls.has_invoice_generated
                        ? 'primary.main'
                        : 'text.primary',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: isSelected
                      ? 'primary.main'
                      : cls.has_invoice_generated
                        ? 'primary.main'
                        : 'divider',
                    '& .MuiChip-icon': { color: isSelected ? '#fff' : 'success.dark' },
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Paper>

      {/* Summary panel — two separate cards with space between them. */}
      {(hasData || loadingOverview) && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: '14px', height: '100%', borderColor: cardBorderColor }}
            >
              <Typography variant="body2" fontWeight={700} mb={1.5}>
                Invoice Progress
              </Typography>
              <Stack direction="row" spacing={3} mb={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MiniIconTile
                    icon={PersonIcon}
                    bg={isDark ? 'rgba(255,255,255,0.08)' : 'grey.100'}
                    color="text.secondary"
                  />
                  <Box>
                    {loadingOverview ? (
                      <Skeleton variant="text" width={40} height={32} sx={{ transform: 'none' }} />
                    ) : (
                      <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                        {summary.eligible}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Eligible students
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MiniIconTile
                    icon={DocIconGreen}
                    bg={isDark ? 'rgba(22,163,74,0.18)' : '#ECFDF5'}
                    color="success.main"
                  />
                  <Box>
                    {loadingOverview ? (
                      <Skeleton variant="text" width={40} height={32} sx={{ transform: 'none' }} />
                    ) : (
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="success.main"
                        sx={{ lineHeight: 1.1 }}
                      >
                        {summary.generated}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Invoices generated
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MiniIconTile
                    icon={DocIconGreen}
                    bg={
                      summary.pending > 0
                        ? isDark
                          ? 'rgba(217,119,6,0.18)'
                          : '#FEF3C7'
                        : isDark
                          ? 'rgba(22,163,74,0.18)'
                          : '#ECFDF5'
                    }
                    color={summary.pending > 0 ? '#D97706' : 'success.main'}
                  />
                  <Box>
                    {loadingOverview ? (
                      <Skeleton variant="text" width={40} height={32} sx={{ transform: 'none' }} />
                    ) : (
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                          lineHeight: 1.1,
                          color: summary.pending > 0 ? '#D97706' : theme.palette.success.main,
                        }}
                      >
                        {summary.pending}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box flex={1}>
                  {loadingOverview ? (
                    <Skeleton variant="rounded" height={8} sx={{ borderRadius: 4 }} />
                  ) : (
                    <LinearProgress
                      variant="determinate"
                      value={summary.coverage_pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: isDark ? 'rgba(217,119,6,0.15)' : '#FEF3C7',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: summary.pending === 0 ? 'success.main' : '#D97706',
                        },
                      }}
                    />
                  )}
                </Box>
                {!loadingOverview && (
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      color: summary.pending === 0 ? theme.palette.success.main : '#D97706',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {summary.coverage_pct}%
                  </Typography>
                )}
              </Stack>
              {loadingOverview ? (
                <Skeleton variant="text" width="80%" height={20} sx={{ mt: 0.75 }} />
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.75, display: 'block' }}
                >
                  {summary.pending === 0
                    ? `Invoices have been generated for all ${summary.eligible} eligible students across ${stats.classes_in_scope} class${stats.classes_in_scope === 1 ? '' : 'es'}.`
                    : `Invoices have been generated for ${summary.generated} of ${summary.eligible} eligible students across ${stats.classes_in_scope} class${stats.classes_in_scope === 1 ? '' : 'es'}.`}
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: '14px', height: '100%', borderColor: cardBorderColor }}
            >
              <Typography variant="body2" fontWeight={700} mb={1.5}>
                Insights
              </Typography>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ display: { xs: 'none', lg: 'block' } }}
                  />
                }
                sx={{ borderRadius: 2, overflow: 'hidden' }}
              >
                <Tooltip title="The student payment category with the highest total projected amount across all payment items in the current scope.">
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      bgcolor: isDark ? 'rgba(22,163,74,0.22)' : '#DCFCE7',
                      p: 1.5,
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: '#16A34A',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <BarChartIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Largest projected category
                      </Typography>
                      {loadingOverview ? (
                        <>
                          <Skeleton variant="text" width={110} height={22} />
                          <Skeleton variant="text" width={90} height={28} />
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.dark' }}>
                            {summary.largest_category ? summary.largest_category.name : 'N/A'}
                          </Typography>
                          {summary.largest_category && (
                            <Typography
                              variant="h5"
                              fontWeight={800}
                              color="success.main"
                              sx={{ lineHeight: 1.3 }}
                            >
                              {CURRENCY(summary.largest_category.amount)}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                </Tooltip>

                <Tooltip title="The payment item with the highest total projected amount across every category in the current scope.">
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      bgcolor: isDark ? 'rgba(147,51,234,0.22)' : '#F3E8FF',
                      p: 1.5,
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: '#9333EA',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <StarIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Highest-value payment item
                      </Typography>
                      {loadingOverview ? (
                        <>
                          <Skeleton variant="text" width={110} height={22} />
                          <Skeleton variant="text" width={90} height={28} />
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.dark' }}>
                            {summary.highest_item ? summary.highest_item.name : 'N/A'}
                          </Typography>
                          {summary.highest_item && (
                            <Typography
                              variant="h5"
                              fontWeight={800}
                              sx={{ color: '#9333EA', lineHeight: 1.3 }}
                            >
                              {CURRENCY(summary.highest_item.amount)}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                </Tooltip>

                <Tooltip title="A payment item × category combination is flagged here when at least one eligible student of that category is in a class with no price set for that item. Click View details to price it in Set Schedule.">
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      bgcolor: isDark ? 'rgba(217,119,6,0.25)' : '#FFEDD5',
                      p: 1.5,
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: '#F59E0B',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ReviewIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Unpriced combinations
                      </Typography>
                      {loadingOverview ? (
                        <Skeleton variant="text" width={40} height={28} />
                      ) : (
                        <>
                          <Typography
                            variant="h5"
                            fontWeight={800}
                            color={summary.unpriced_count > 0 ? 'error.main' : 'success.main'}
                            sx={{ lineHeight: 1.2 }}
                          >
                            {summary.unpriced_count}
                          </Typography>
                          {summary.unpriced_count > 0 && typeof onReviewPricing === 'function' && (
                            <Typography
                              component="button"
                              onClick={onReviewPricing}
                              variant="body2"
                              sx={{
                                display: 'block',
                                mt: 0.25,
                                border: 0,
                                background: 'none',
                                p: 0,
                                cursor: 'pointer',
                                fontWeight: 700,
                                color: 'primary.main',
                                textDecoration: 'underline',
                              }}
                            >
                              View details →
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                </Tooltip>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {errorOverview && <Alert severity="error">{errorOverview}</Alert>}

      {!loadingOverview && !errorOverview && overview && !hasData && (
        <Alert
          severity="info"
          sx={{ justifyContent: 'center', '& .MuiAlert-message': { width: '100%' } }}
        >
          <Typography variant="body2" fontWeight={600}>
            No payment schedules found for{' '}
            {selectedClass ? selectedClassName : 'the selected classes'} in this session term
            {appliedSearchQuery ? ` matching "${appliedSearchQuery}"` : ''}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Go to the Set Schedule step to price at least one payment item for this scope before
            generating invoices.
          </Typography>
        </Alert>
      )}

      {/* Projected invoice table — while loading, the same real column/row
          count from the last fetch is reused for the skeleton shape (or a
          generic 3x5 placeholder on a true first load), so the layout
          doesn't jump once real data arrives. */}
      {(hasData || loadingOverview) && (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? 'background.default' : 'grey.50' }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: 50,
                    position: 'sticky',
                    left: 0,
                    bgcolor: isDark ? 'background.default' : 'grey.50',
                    zIndex: 1,
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 170,
                    position: 'sticky',
                    left: 50,
                    bgcolor: isDark ? 'background.default' : 'grey.50',
                    zIndex: 1,
                  }}
                >
                  PAYMENT ITEM
                </TableCell>
                {tableCategories.map((cat, idx) => {
                  const scheme = SCHEME_CYCLE[idx % SCHEME_CYCLE.length];
                  const CatIcon = categoryIconFor(cat.name);
                  return (
                    <TableCell
                      key={cat.id}
                      align="center"
                      sx={{ minWidth: 160, bgcolor: isDark ? 'background.default' : 'grey.50' }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                      >
                        {loadingOverview ? (
                          <Skeleton variant="rounded" width={26} height={26} sx={{ borderRadius: '8px' }} />
                        ) : (
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: '8px',
                              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
                              color: scheme.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <CatIcon sx={{ fontSize: 15 }} />
                          </Box>
                        )}
                        <Box textAlign="left">
                          {loadingOverview ? (
                            <>
                              <Skeleton variant="text" width={95} height={16} />
                              <Skeleton variant="text" width={55} height={14} />
                            </>
                          ) : (
                            <>
                              <Typography variant="caption" fontWeight={700} display="block">
                                {cat.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {cat.student_count} student{cat.student_count === 1 ? '' : 's'}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                  );
                })}
                <TableCell
                  align="right"
                  sx={{ minWidth: 130, bgcolor: isDark ? 'background.default' : 'grey.50' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(37,99,235,0.18)' : '#DBEAFE',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FunctionsIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <Typography variant="caption" fontWeight={700}>
                      TOTAL
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableItems.map((row, idx) => (
                <TableRow key={row.id ?? idx} hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      bgcolor: isDark ? 'background.paper' : '#fff',
                      zIndex: 1,
                    }}
                  >
                    {loadingOverview ? <Skeleton variant="text" width={14} /> : idx + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 50,
                      bgcolor: isDark ? 'background.paper' : '#fff',
                      zIndex: 1,
                    }}
                  >
                    {loadingOverview ? (
                      <>
                        <Skeleton variant="text" width={130} height={20} />
                        <Skeleton variant="text" width={70} height={16} />
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" fontWeight={700}>
                          {row.payment_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {row.pay_option}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  {tableCategories.map((cat) => (
                    <TableCell key={cat.id} align="center">
                      {loadingOverview ? (
                        <Stack alignItems="center" spacing={0.5}>
                          <Skeleton variant="text" width={65} height={18} />
                          <Skeleton variant="text" width={50} height={14} />
                        </Stack>
                      ) : (
                        <CellVisual cell={row.cells[cat.id]} />
                      )}
                    </TableCell>
                  ))}
                  <TableCell
                    align="right"
                    sx={{ bgcolor: isDark ? 'rgba(37,99,235,0.08)' : '#EFF6FF' }}
                  >
                    {loadingOverview ? (
                      <Skeleton variant="text" width={70} height={24} sx={{ ml: 'auto' }} />
                    ) : (
                      <Typography variant="body1" fontWeight={800} sx={{ color: 'primary.dark' }}>
                        {CURRENCY(row.row_total)}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: isDark ? 'rgba(37,99,235,0.08)' : '#EFF6FF' }}>
                <TableCell
                  colSpan={2}
                  sx={{
                    position: 'sticky',
                    left: 0,
                    bgcolor: isDark ? 'rgba(37,99,235,0.08)' : '#EFF6FF',
                    zIndex: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={800} sx={{ color: 'primary.dark' }}>
                    Total (Projected)
                  </Typography>
                </TableCell>
                {tableCategories.map((cat) => (
                  <TableCell key={cat.id} align="center">
                    {loadingOverview ? (
                      <Stack alignItems="center" spacing={0.5}>
                        <Skeleton variant="text" width={65} height={22} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={50} height={14} sx={{ mx: 'auto' }} />
                      </Stack>
                    ) : (
                      <>
                        <Typography variant="body1" fontWeight={800} sx={{ color: 'primary.dark' }}>
                          {CURRENCY(footer.categories?.[cat.id] ?? 0)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.dark', opacity: 0.75 }}>
                          {cat.student_count} student{cat.student_count === 1 ? '' : 's'}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                ))}
                <TableCell
                  align="right"
                  sx={{ bgcolor: isDark ? 'rgba(37,99,235,0.14)' : '#DBEAFE' }}
                >
                  {loadingOverview ? (
                    <Skeleton variant="text" width={75} height={26} sx={{ ml: 'auto' }} />
                  ) : (
                    <>
                      <Typography variant="body1" fontWeight={800} sx={{ color: 'primary.dark' }}>
                        {CURRENCY(footer.grand_total)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.dark', opacity: 0.75 }}>
                        {/* Sum of the categories actually shown in this table —
                            not the page-level (category-filter-stable) stat
                            card figure — so the Total column always agrees
                            with the columns to its left. */}
                        {categories.reduce((sum, c) => sum + c.student_count, 0)} student
                        {categories.reduce((sum, c) => sum + c.student_count, 0) === 1 ? '' : 's'}
                      </Typography>
                    </>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Showing {items.length} of {items.length} payment item{items.length === 1 ? '' : 's'}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Button
                size="small"
                startIcon={<ExportIcon fontSize="small" />}
                onClick={handleExportCsv}
              >
                Export
              </Button>
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={handleExportCsv}>Download CSV</MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    window.print();
                  }}
                >
                  Print table
                </MenuItem>
              </Menu>
            </Stack>
          </Box>
        </TableContainer>
      )}
    </Stack>
  );
};

export default GenerateInvoiceTab;
