import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  IconCalendarWeek,
  IconExternalLink,
  IconFileText,
  IconInfoCircle,
  IconNotes,
  IconPlayerPlay,
  IconSearch,
  IconSparkles,
  IconVideoOff,
} from '@tabler/icons-react';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import { tenantBrowseApi } from '@/api/tenant/e-resources/browseApi';
import { tenantSchemeApi } from '@/api/tenant/scheme-of-work/schemeOfWorkApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchSubjectsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources', title: 'E-Resources' },
  { title: 'Video Tutorials' },
];

const hasValue = (value) => Boolean(value && String(value).trim());

const toHref = (value) => {
  if (!hasValue(value)) return null;
  const raw = String(value).trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!/\s/.test(raw) && /^[^\s/]+(\.[^\s/]+)+/.test(raw)) return `https://${raw}`;
  return null;
};

const toEmbedSrc = (href) => {
  if (!href) return null;
  const match = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
  return href;
};

// A real thumbnail reads far better than a flat colour block — YouTube
// serves one at a predictable URL, so the card banner shows the actual
// video instead of a generic gradient whenever the link is a YouTube one.
const getYoutubeThumb = (href) => {
  if (!href) return null;
  const match = href.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const shorten = (value, limit = 42) => {
  const text = String(value).trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

const toRows = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const MaterialCard = ({ item, weekName }) => {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  const videoHref = toHref(item.resource_links);
  const materialHref = toHref(item.learning_material);
  const hasVideo = hasValue(item.resource_links);
  const hasMaterial = hasValue(item.learning_material);
  const youtubeThumb = !thumbFailed ? getYoutubeThumb(videoHref) : null;

  const topic = item.topic || 'Lesson material';

  const videoPoster = (
    <Box
      onClick={() => videoHref && !playing && setPlaying(true)}
      sx={{
        position: 'relative',
        width: '100%',
        pt: '56.25%',
        overflow: 'hidden',
        cursor: videoHref ? 'pointer' : 'default',
        bgcolor: '#0f172a',
        backgroundImage: youtubeThumb
          ? 'none'
          : (theme) =>
              `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.92)} 0%, ${alpha(
                theme.palette.primary.dark,
                0.98,
              )} 100%)`,
      }}
    >
      {playing && videoHref ? (
        <iframe
          src={toEmbedSrc(videoHref)}
          title={`Video for ${topic}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <>
          {youtubeThumb && (
            <Box
              component="img"
              src={youtubeThumb}
              alt=""
              onError={() => setThumbFailed(true)}
              className="vt-thumb"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 400ms ease',
              }}
            />
          )}
          {/* Legibility gradient over the real thumbnail (no-op on the
              flat-colour fallback, which already reads fine on its own) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: youtubeThumb
                ? 'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.65) 100%)'
                : 'none',
            }}
          />
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.25}
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: 'common.white' }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'common.white',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                transform: 'scale(1)',
                transition: 'transform 0.2s ease',
                ...(videoHref
                  ? { '&:hover': { transform: 'scale(1.08)' } }
                  : { opacity: 0.85 }),
              }}
            >
              <IconPlayerPlay size={26} style={{ marginLeft: 4 }} />
            </Box>
            <Typography
              variant="caption"
              fontWeight={700}
              letterSpacing={0.4}
              sx={{ color: 'common.white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              {videoHref ? 'Play video lesson' : 'Video on file'}
            </Typography>
          </Stack>
        </>
      )}
      <Chip
        size="small"
        label="Video"
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          bgcolor: 'common.white',
          color: 'primary.main',
          fontWeight: 700,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );

  const materialPoster = (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        pt: '56.25%',
        overflow: 'hidden',
        bgcolor: 'grey.100',
        backgroundImage: (theme) =>
          `linear-gradient(140deg, ${alpha(theme.palette.success.main, 0.9)} 0%, ${alpha(
            theme.palette.success.dark,
            0.98,
          )} 100%)`,
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1.25}
        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: 'common.white' }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'common.white',
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 4,
          }}
        >
          <IconFileText size={26} />
        </Box>
        <Typography variant="caption" fontWeight={700} letterSpacing={0.4} sx={{ color: 'common.white' }}>
          Lesson material
        </Typography>
      </Stack>
      <Chip
        size="small"
        label="Note"
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          bgcolor: 'common.white',
          color: 'success.main',
          fontWeight: 700,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );

  const unavailablePoster = (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        pt: '56.25%',
        overflow: 'hidden',
        bgcolor: 'grey.100',
        backgroundImage: (theme) =>
          `linear-gradient(140deg, ${alpha(theme.palette.grey[500], 0.35)} 0%, ${alpha(
            theme.palette.grey[700],
            0.45,
          )} 100%)`,
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1.25}
        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: 'common.white' }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.9)',
            color: 'grey.700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 4,
          }}
        >
          <IconVideoOff size={26} />
        </Box>
        <Typography variant="caption" fontWeight={700} letterSpacing={0.4} sx={{ color: 'common.white' }}>
          Link unavailable
        </Typography>
      </Stack>
    </Box>
  );

  const poster = hasVideo ? (videoHref ? videoPoster : unavailablePoster) : materialPoster;

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'),
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff'),
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          transform: 'translateY(-3px)',
          borderColor: 'primary.main',
        },
        '&:hover .vt-thumb': { transform: 'scale(1.06)' },
      }}
    >
      {poster}
      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: '#0f172a',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {topic}
        </Typography>
        {item.topic_description ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap title={item.topic_description}>
            {item.topic_description}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{weekName}</Typography>
        )}

        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 'auto', pt: 1.25 }}>
          {videoHref && (
            <Button
              size="small"
              variant="outlined"
              endIcon={<IconExternalLink size={13} />}
              href={videoHref}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ borderRadius: '8px', fontWeight: 600, fontSize: 11.5, textTransform: 'none' }}
            >
              Open video
            </Button>
          )}
          {materialHref ? (
            <Button
              size="small"
              variant={videoHref ? 'outlined' : 'contained'}
              color="success"
              endIcon={<IconExternalLink size={13} />}
              href={materialHref}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ borderRadius: '8px', fontWeight: 600, fontSize: 11.5, textTransform: 'none' }}
            >
              Lesson material
            </Button>
          ) : (
            hasMaterial && (
              <Chip
                size="small"
                variant="outlined"
                color="success"
                label={shorten(item.learning_material)}
                title={String(item.learning_material)}
                sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px' }}
              />
            )
          )}
          {!videoHref && hasVideo && (
            <Chip
              size="small"
              variant="outlined"
              label={shorten(item.resource_links)}
              title={String(item.resource_links)}
              sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px' }}
            />
          )}
        </Stack>
      </CardContent>
    </Paper>
  );
};

const EmptyState = ({ icon, title, description }) => (
  <Card variant="outlined" sx={{ borderRadius: 2, borderStyle: 'dashed' }}>
    <CardContent sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'grey.100',
          color: 'grey.500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" textAlign="center" maxWidth={420}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const VideoTutorials = () => {
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [termId, setTermId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [weekSearch, setWeekSearch] = useState('');

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [optionsError, setOptionsError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [termsRes, programmesRes] = await Promise.all([
          tenantSchemeApi.getTerms(),
          fetchProgrammes(),
        ]);
        const termRows = Array.isArray(termsRes) ? termsRes : [];
        setTerms(termRows);
        if (termRows.length > 0) setTermId(termRows[0].id);
        const programmeRows = toRows(programmesRes);
        setProgrammes(programmeRows);
        if (programmeRows.length > 0) setProgrammeId(programmeRows[0].id);
      } catch {
        setOptionsError('Failed to load filter options. Please refresh the page.');
      }
    };
    init();
  }, []);

  useEffect(() => {
    setClasses([]);
    setSubjects([]);
    setClassId('');
    setSubjectId('');
    if (!programmeId) return undefined;
    let active = true;
    const loadClasses = async () => {
      try {
        const res = await fetchClassesByProgramme(programmeId);
        if (!active) return;
        const rows = toRows(res);
        setClasses(rows);
        if (rows.length > 0) setClassId(rows[0].id);
      } catch {
        if (active) setClasses([]);
      }
    };
    loadClasses();
    return () => {
      active = false;
    };
  }, [programmeId]);

  useEffect(() => {
    setSubjects([]);
    setSubjectId('');
    if (!classId) return undefined;
    let active = true;
    const loadSubjects = async () => {
      try {
        const res = await fetchSubjectsByClass(classId, programmeId || null);
        if (!active) return;
        const rows = toRows(res);
        setSubjects(rows);
        if (rows.length > 0) setSubjectId(rows[0].id);
      } catch {
        if (active) setSubjects([]);
      }
    };
    loadSubjects();
    return () => {
      active = false;
    };
  }, [classId, programmeId]);

  const filtersReady = Boolean(termId && classId && subjectId);

  const fetchResources = useCallback(async () => {
    if (!filtersReady) return;
    setLoading(true);
    setError('');
    try {
      const data = await tenantBrowseApi.getBrowse({
        class_id: classId,
        term_id: termId,
        subject_id: subjectId,
      });
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 503) {
        setError('E-Resources materials are temporarily unavailable. Please try again shortly.');
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load e-resources. Please try again.',
        );
      }
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [filtersReady, termId, classId, subjectId]);

  // Auto-fetch once when initial defaults first become ready
  const autoFetchedRef = useRef(false);
  useEffect(() => {
    if (!autoFetchedRef.current && filtersReady) {
      autoFetchedRef.current = true;
      fetchResources();
    }
  }, [filtersReady, fetchResources]);

  const totals = useMemo(() => {
    const weekKeys = new Set();
    let videos = 0;
    let materials = 0;
    resources.forEach((row) => {
      weekKeys.add(row.wk_id ?? row.week_id ?? row.id);
      if (hasValue(row.resource_links)) videos += 1;
      if (hasValue(row.learning_material)) materials += 1;
    });
    return { weeks: weekKeys.size, videos, materials };
  }, [resources]);

  const weeks = useMemo(() => {
    const grouped = [];
    const indexByWeek = {};
    resources.forEach((row) => {
      const key = row.wk_id ?? row.week_id ?? row.id;
      if (!(key in indexByWeek)) {
        indexByWeek[key] = grouped.length;
        grouped.push({ wkId: key, weekName: row.week_name || 'Unknown week', items: [] });
      }
      grouped[indexByWeek[key]].items.push(row);
    });

    const withContent = grouped.map((week) => ({
      ...week,
      published: week.items.filter((item) => hasValue(item.resource_links) || hasValue(item.learning_material)),
    }));

    const needle = weekSearch.trim().toLowerCase();
    if (!needle) return withContent;

    return withContent
      .map((week) => ({
        ...week,
        published: week.published.filter((item) =>
          [item.topic, item.topic_description].some((value) =>
            value ? String(value).toLowerCase().includes(needle) : false,
          ),
        ),
      }))
      .filter((week) => week.weekName.toLowerCase().includes(needle) || week.published.length > 0);
  }, [resources, weekSearch]);

  const selectField = (id, label, value, onChange, options, disabled, getLabel) => (
    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select labelId={`${id}-label`} label={label} value={value} onChange={onChange}>
          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {getLabel(option)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );

  return (
    <PageContainer title="Video Tutorials" description="Browse week-wise e-resource materials">
      <Breadcrumb title="Video Tutorials" items={BCrumb} />

      {/* ── How content gets here — adding content happens on the Scheme of
          Work, this page only streams what's been added there ──────────── */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          p: 2,
          mb: 2.5,
          borderRadius: '14px',
          bgcolor: '#EFF6FF',
          border: '1px solid #BFDBFE',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            bgcolor: '#2563EB',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconInfoCircle size={22} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#1e3a8a' }}>
            Want to add a video or learning material to a week?
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#3b4b6b', mt: 0.25, lineHeight: 1.5 }}>
            Video links and learning content are added per topic on the <strong>Scheme of Work</strong>, not
            here — open the relevant week there, paste a video link or document link into its topic, and it
            streams automatically on this page for every class, programme and subject it's assigned to.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/scheme-of-work"
          variant="contained"
          size="small"
          startIcon={<IconSparkles size={15} />}
          sx={{ flexShrink: 0, fontWeight: 700, whiteSpace: 'nowrap', borderRadius: '8px' }}
        >
          Open Scheme of Work
        </Button>
      </Paper>

      {/* ── Stat Cards Intelligence ────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={totals.weeks}
            label="Total Weeks"
            subtitle="Syllabus coverage"
            icon={IconCalendarWeek}
            colorIndex={0}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={totals.videos}
            label="Video Lessons"
            subtitle="Streamable tutorials"
            icon={IconPlayerPlay}
            colorIndex={1}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={totals.materials}
            label="Learning Notes"
            subtitle="Reading materials"
            icon={IconFileText}
            colorIndex={2}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={resources.length}
            label="Total Topics"
            subtitle="Curriculum topics logged"
            icon={IconNotes}
            colorIndex={3}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ── Filters + Content Card ───────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB'),
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {optionsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {optionsError}
            </Alert>
          )}

          <Grid container spacing={1.5} alignItems="center">
          {selectField('term', 'Term', termId, (e) => setTermId(e.target.value), terms, false, (term) => term.term_name)}
          {selectField(
            'programme',
            'Programme',
            programmeId,
            (e) => setProgrammeId(e.target.value),
            programmes,
            false,
            (programme) => programme.prog_name || programme.programme_name,
          )}
          {selectField(
            'class',
            'Class',
            classId,
            (e) => setClassId(e.target.value),
            classes,
            !programmeId,
            (cl) => cl.class_name,
          )}
          {selectField(
            'subject',
            'Subject',
            subjectId,
            (e) => setSubjectId(e.target.value),
            subjects,
            !classId,
            (subject) => subject.subject_name,
          )}
          <Grid size={{ xs: 12, sm: 6, md: 2.8 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search within weeks or topic title / description..."
              value={weekSearch}
              onChange={(e) => setWeekSearch(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={16} style={{ marginRight: 8, color: '#94a3b8' }} />,
              }}
              sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1.2 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={fetchResources}
              disabled={loading || !filtersReady}
              sx={{ fontWeight: 600, height: '40px', px: 1, minWidth: 70 }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {loading && (
        <Stack spacing={2.5}>
          <LinearProgress />
          {[0, 1].map((block) => (
            <Box key={block}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Skeleton variant="rounded" width={34} height={34} />
                <Skeleton variant="text" width={160} height={32} />
                <Skeleton variant="rounded" width={90} height={24} />
              </Stack>
              <Grid container spacing={2}>
                {[0, 1, 2].map((card) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card}>
                    <Skeleton variant="rounded" height={280} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>
      )}

      {!loading && error && (
        <Alert severity={error.includes('temporarily unavailable') ? 'warning' : 'error'} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && !filtersReady && (
        <EmptyState
          icon={<IconSearch size={26} />}
          title="Select your filters"
          description="Choose a term, programme, class and subject to browse e-resource materials."
        />
      )}

      {!loading && !error && filtersReady && (
        <>
          {weeks.length === 0 ? (
            <EmptyState
              icon={<IconVideoOff size={26} />}
              title={resources.length === 0 ? 'No materials found' : 'Nothing matches your search'}
              description={
                resources.length === 0
                  ? 'No e-resource materials have been published for the selected term, class and subject yet.'
                  : 'No weeks or topics match what you typed. Try a different search.'
              }
            />
          ) : (
            <Stack spacing={4}>
              {weeks.map((week, weekIndex) => (
                <Box key={week.wkId}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.75 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#EEF2FF',
                        color: '#2563EB',
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>{weekIndex + 1}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a' }}>
                      {week.weekName}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${week.published.length} ${
                        week.published.length === 1 ? 'lesson' : 'lessons'
                      }`}
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        bgcolor: week.published.length ? '#DCFCE7' : '#f1f5f9',
                        color: week.published.length ? '#166534' : '#94a3b8',
                      }}
                    />
                    <Box sx={{ flexGrow: 1, height: 1, bgcolor: '#f1f5f9' }} />
                  </Stack>

                  {week.published.length === 0 ? (
                    <Box
                      sx={{
                        border: '1px dashed #e2e8f0',
                        borderRadius: '14px',
                        bgcolor: '#FAFBFC',
                        px: 3,
                        py: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      <IconVideoOff size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#64748b', flex: 1 }}>
                        No video or lesson material has been published for <strong>{week.weekName}</strong>{' '}
                        yet. Add one from the Scheme of Work.
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/scheme-of-work"
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '8px', fontWeight: 600, flexShrink: 0 }}
                      >
                        Add content
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {week.published.map((item, itemIndex) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id ?? `${week.wkId}-${itemIndex}`}>
                          <MaterialCard item={item} weekName={week.weekName} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </>
      )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default VideoTutorials;
