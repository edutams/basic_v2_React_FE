import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  MenuBook as SubjectIcon,
  CheckCircle as CompulsoryIcon,
  Stars as OptionalIcon,
  Build as TradeIcon,
} from '@mui/icons-material';
import subjectRegistrationApi from '@/api/tenant/subject-registration/subjectRegistrationApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
  fetchActiveSessionTerm,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

import GeneralSubjectsTab from './components/GeneralSubjectsTab';
import OptionalSubjectsTab from './components/OptionalSubjectsTab';
import TradeSubjectsTab from './components/TradeSubjectsTab';
import AnalyticsModal from '@/pages/tenant/attendance/components/AnalyticsModal';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Subject Registration' },
];

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const AnalyticsStatCard = ({
  icon: Icon,
  value,
  label,
  colorIndex = 0,
  loading = false,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
          color: isDark ? '#ffffff' : scheme.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon sx={{ fontSize: 26, color: 'inherit' }} />}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: isDark ? '#fff' : scheme.color }}
          >
            {value}
          </Typography>
        )}
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563',
            textTransform: 'uppercase',
            display: 'block',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const SubjectRegistration = () => {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);

  // ── Filter States ─────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [pSession, setPSession] = useState('');
  const [pTerm, setPTerm] = useState('');
  const [pTermId, setPTermId] = useState('');
  const [pProgramme, setPProgramme] = useState('');
  const [pClass, setPClass] = useState('');
  const [pArm, setPArm] = useState('');

  // ── Stats ──────────────────────────────────────────────────
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    all: { total_subjects: 0, registered_learners: 0 },
    compulsory: { total_subjects: 0, registered_learners: 0 },
    optional: { total_subjects: 0, registered_learners: 0 },
    trade: { total_subjects: 0, registered_learners: 0 },
  });

  // ── Analytics Modal ────────────────────────────────────────
  const [analyticsModal, setAnalyticsModal] = useState({
    open: false,
    title: '',
    content: null,
    loading: false,
  });

  const openCardModal = (title, content) => {
    setAnalyticsModal({ open: true, title, content });
  };

  const fetchAndShowSubjects = useCallback(
    async (type, title) => {
      if (!pClass) return;
      setAnalyticsModal({ open: true, title, content: null, loading: true });

      try {
        let subjects = [];
        if (type === 'all') {
          const [gen, opt, trade] = await Promise.all([
            subjectRegistrationApi.getGeneralSubjects(pClass, {
              programme_id: pProgramme || undefined,
              session_id: pSession || undefined,
              term_id: pTermId || undefined,
            }),
            subjectRegistrationApi.getOptionalSubjects(pClass, {
              programme_id: pProgramme || undefined,
              session_id: pSession || undefined,
              term_id: pTermId || undefined,
            }),
            subjectRegistrationApi.getTradeSubjects(pClass, {
              programme_id: pProgramme || undefined,
              session_id: pSession || undefined,
              term_id: pTermId || undefined,
            }),
          ]);
          const genData = gen.data?.data || gen.data || [];
          const optData = opt.data?.data || opt.data || [];
          const tradeData = trade.data?.data || trade.data || [];
          subjects = [
            ...(Array.isArray(genData) ? genData : []).map((s) => ({
              ...s,
              category: 'Compulsory',
            })),
            ...(Array.isArray(optData) ? optData : []).map((s) => ({ ...s, category: 'Optional' })),
            ...(Array.isArray(tradeData) ? tradeData : []).map((s) => ({
              ...s,
              category: 'Trade',
            })),
          ];
        } else {
          const apiFn =
            type === 'compulsory'
              ? subjectRegistrationApi.getGeneralSubjects
              : type === 'optional'
                ? subjectRegistrationApi.getOptionalSubjects
                : subjectRegistrationApi.getTradeSubjects;
          const res = await apiFn(pClass, {
            programme_id: pProgramme || undefined,
            session_id: pSession || undefined,
            term_id: pTermId || undefined,
          });
          const data = res.data?.data || res.data || [];
          subjects = Array.isArray(data) ? data.map((s) => ({ ...s, category: title })) : [];
        }

        if (subjects.length === 0) {
          openCardModal(
            title,
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                No subjects found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No {title.toLowerCase()} subjects have been configured for this class.
              </Typography>
            </Box>,
          );
          return;
        }

        const totalRegistrations = subjects.reduce((sum, s) => sum + (s.registered_count || 0), 0);

        openCardModal(
          title,
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subjects.length} subject(s) · {totalRegistrations} total student registrations
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      SUBJECT NAME
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                      SUBJECT CODE
                    </TableCell>
                    {type === 'all' && (
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                        CATEGORY
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                      REGISTERED COUNT
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.map((s, i) => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{i + 1}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {s.subject_name}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                        {s.subject_code || '—'}
                      </TableCell>
                      {type === 'all' && (
                        <TableCell align="center">
                          <Chip
                            label={s.category}
                            size="small"
                            color={
                              s.category === 'Compulsory'
                                ? 'info'
                                : s.category === 'Optional'
                                  ? 'warning'
                                  : 'error'
                            }
                            sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                          />
                        </TableCell>
                      )}
                      <TableCell align="center" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {s.registered_count || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>,
        );
      } catch (e) {
        console.error(`Failed to fetch subjects for ${type}:`, e);
        openCardModal(title, <Typography color="error">Failed to load subject data.</Typography>);
      }
    },
    [pClass, pProgramme, pSession, pTermId],
  );

  const subjectTypeByTab = ['compulsory', 'optional', 'trade'];

  const fetchStats = useCallback(async () => {
    if (!pClass) {
      setStatsLoading(false);
      setStats({
        all: { total_subjects: 0, registered_learners: 0 },
        compulsory: { total_subjects: 0, registered_learners: 0 },
        optional: { total_subjects: 0, registered_learners: 0 },
        trade: { total_subjects: 0, registered_learners: 0 },
      });
      return;
    }

    setStatsLoading(true);
    try {
      const res = await subjectRegistrationApi.getRegistrationStats({
        class_id: pClass,
        arm_id: pArm || undefined,
        programme_id: pProgramme || undefined,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });

      if (res.data?.status && res.data?.data) {
        setStats({
          all: res.data.data.all ?? { total_subjects: 0, registered_learners: 0 },
          compulsory: res.data.data.compulsory ?? { total_subjects: 0, registered_learners: 0 },
          optional: res.data.data.optional ?? { total_subjects: 0, registered_learners: 0 },
          trade: res.data.data.trade ?? { total_subjects: 0, registered_learners: 0 },
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        all: { total_subjects: 0, registered_learners: 0 },
        compulsory: { total_subjects: 0, registered_learners: 0 },
        optional: { total_subjects: 0, registered_learners: 0 },
        trade: { total_subjects: 0, registered_learners: 0 },
      });
    } finally {
      setStatsLoading(false);
    }
  }, [pClass, pArm, pProgramme, pSession, pTermId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Load session/programme filters & auto-preselect active session/term ──
  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes, activeStRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveSessionTerm(),
        ]);
        const sessionsData = sessRes.data?.data || sessRes.data || [];
        setSessions(sessionsData);
        setProgrammes(progRes.data?.data || progRes.data || []);

        const activeStData = activeStRes.data?.data || activeStRes.data;
        if (activeStData?.session_id) {
          setPSession(activeStData.session_id);
          if (activeStData.term_id) {
            setPTermId(activeStData.term_id);
          }
        } else if (sessionsData.length > 0) {
          setPSession(sessionsData[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pSession) return;
    fetchTerms(pSession)
      .then((r) => {
        const termsData = r.data?.data || r.data || [];
        setTerms(termsData);
        if (Array.isArray(termsData) && termsData.length > 0) {
          const match = termsData.find((t) => String(t.id) === String(pTermId));
          if (match) {
            setPTerm(match.id);
          } else {
            setPTerm(termsData[0].id);
          }
        }
      })
      .catch(console.error);
  }, [pSession]);

  useEffect(() => {
    if (!pProgramme) return;
    fetchClassesByProgramme(pProgramme)
      .then((r) => {
        const d = r.data?.data || r.data || [];
        setClasses(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [pProgramme]);

  useEffect(() => {
    if (!pClass) return;
    fetchClassArmsByClass(pClass, { programme_id: pProgramme || undefined })
      .then((r) => {
        const d = r.data?.data || r.data || [];
        setArms(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [pClass, pProgramme]);

  return (
    <PageContainer title="Subject Registration" description="Manage learner subject registration">
      <Breadcrumb title="Subject Registration" items={BCrumb} />

      {/* ── Analytics Header ──────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsStatCard
            icon={SubjectIcon}
            value={stats.all.total_subjects}
            label={`All Subjects · ${stats.all.registered_learners} registered learners`}
            colorIndex={1}
            loading={statsLoading}
            onClick={() => fetchAndShowSubjects('all', 'All Subjects')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsStatCard
            icon={CompulsoryIcon}
            value={stats.compulsory.total_subjects}
            label={`Compulsory Subjects · ${stats.compulsory.registered_learners} registered learners`}
            colorIndex={0}
            loading={statsLoading}
            onClick={() => fetchAndShowSubjects('compulsory', 'Compulsory Subjects')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsStatCard
            icon={OptionalIcon}
            value={stats.optional.total_subjects}
            label={`Optional Subjects · ${stats.optional.registered_learners} registered learners`}
            colorIndex={2}
            loading={statsLoading}
            onClick={() => fetchAndShowSubjects('optional', 'Optional Subjects')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsStatCard
            icon={TradeIcon}
            value={stats.trade.total_subjects}
            label={`Trade Subjects · ${stats.trade.registered_learners} registered learners`}
            colorIndex={3}
            loading={statsLoading}
            onClick={() => fetchAndShowSubjects('trade', 'Trade Subjects')}
          />
        </Grid>
      </Grid>

      {/* ── Filter Row ────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={pSession} label="Session" onChange={(e) => setPSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name || s.name || s.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select
              value={pTerm}
              label="Term"
              onChange={(e) => {
                const val = e.target.value;
                setPTerm(val);
                const term = terms.find((t) => t.id === val);
                if (term) setPTermId(term.id);
              }}
            >
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.term_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select
              value={pProgramme}
              label="Programme"
              onChange={(e) => setPProgramme(e.target.value)}
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.programme_name || p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={pClass} label="Class" onChange={(e) => setPClass(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.class_name || c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Arm</InputLabel>
            <Select value={pArm} label="Arm" onChange={(e) => setPArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.class_arm_names}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<FilterIcon />}
            onClick={fetchStats}
            sx={{ height: 40 }}
          >
            Filter
          </Button>
        </Grid>
      </Grid>

      {/* ── Main Section ───────────────────────────────────────── */}
      <ParentCard title="Learners Subject Registration">
        <Box sx={{ pt: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  py: 1.5,
                },
              }}
            >
              <Tab label="1. Compulsory Subjects" />
              <Tab label="2. Optional Subjects" />
              <Tab label="3. Trade Subjects" />
            </Tabs>
          </Box>
          {activeTab === 0 && (
            <GeneralSubjectsTab
              session={pSession}
              term={pTerm}
              termId={pTermId}
              programme={pProgramme}
              classLevel={pClass}
              classArm={pArm}
            />
          )}
          {activeTab === 1 && (
            <OptionalSubjectsTab
              session={pSession}
              term={pTerm}
              termId={pTermId}
              programme={pProgramme}
              classLevel={pClass}
              classArm={pArm}
            />
          )}
          {activeTab === 2 && (
            <TradeSubjectsTab
              session={pSession}
              term={pTerm}
              termId={pTermId}
              programme={pProgramme}
              classLevel={pClass}
              classArm={pArm}
            />
          )}
        </Box>
      </ParentCard>
      {/* ── Analytics Modal ─────────────────────────────────── */}
      <AnalyticsModal
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
        title={analyticsModal.title}
        content={analyticsModal.content}
        loading={analyticsModal.loading}
      />
    </PageContainer>
  );
};

export default SubjectRegistration;
