import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  LinearProgress,
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
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  GridView as GridViewIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
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

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Subject Registration' },
];

// ── Theme-aware stat card component ─────────────────────────────
const AnalyticsStatCard = ({ icon: Icon, value, label, colorName, colorIndex = 0, loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, colorIndex, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: colors.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isDark
            ? '0 6px 16px rgba(0,0,0,.3)'
            : `0 8px 22px -2px ${colors.iconGlow}`,
        }}
      >
        {Icon && <Icon sx={{ fontSize: 26, color: colors.iconColor }} />}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: isDark ? '#fff' : colors.accentColor }}
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

// ── Learner Progress Card (uses getStatCardColor) ──────────────
const LearnerProgressCard = ({ progress = 0, details = '', loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor('info', 2, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563',
            textTransform: 'uppercase',
          }}
        >
          LEARNERS REGISTRATION
        </Typography>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            background: colors.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GridViewIcon sx={{ fontSize: 14, color: colors.iconColor }} />
        </Box>
      </Stack>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: isDark ? '#fff' : colors.accentColor }}
          >
            {progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              my: 1,
              height: 7,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.15)' : '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: colors.accentColor,
                borderRadius: 3,
              },
            }}
          />
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>
            {details}
          </Typography>
        </>
      )}
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
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);

  const subjectTypeByTab = ['compulsory', 'optional'];

  const fetchStats = useCallback(async () => {
    if (!pClass) {
      setStatsLoading(false);
      setTotalSubjects(0);
      setTotalLearners(0);
      setCompletionPercent(0);
      setRegisteredCount(0);
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
        type: subjectTypeByTab[activeTab],
      });

      if (res.data?.status && res.data?.data) {
        const d = res.data.data;
        setTotalSubjects(d.total_subjects ?? 0);
        setTotalLearners(d.total_learners ?? 0);
        setCompletionPercent(d.completion_percent ?? 0);
        setRegisteredCount(d.registered_count ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setTotalSubjects(0);
      setTotalLearners(0);
      setCompletionPercent(0);
      setRegisteredCount(0);
    } finally {
      setStatsLoading(false);
    }
  }, [pClass, pArm, pProgramme, pSession, pTermId, activeTab]);

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
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!pSession) return;
    fetchTerms(pSession).then((r) => {
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
    }).catch(console.error);
  }, [pSession]);

  useEffect(() => {
    if (!pProgramme) return;
    fetchClassesByProgramme(pProgramme).then((r) => {
      const d = r.data?.data || r.data || [];
      setClasses(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [pProgramme]);

  useEffect(() => {
    if (!pClass) return;
    fetchClassArmsByClass(pClass, { programme_id: pProgramme || undefined }).then((r) => {
      const d = r.data?.data || r.data || [];
      setArms(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [pClass, pProgramme]);

  return (
    <PageContainer title="Subject Registration" description="Manage learner subject registration">
      <Breadcrumb title="Subject Registration" items={BCrumb} />

      {/* ── Analytics Header ──────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <AnalyticsStatCard
            icon={BarChartIcon}
            value={totalSubjects}
            label="Total Subjects"
            colorName="success"
            colorIndex={1}
            loading={statsLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <LearnerProgressCard
            progress={completionPercent}
            details={registeredCount > 0 ? `${registeredCount} registrations out of ${totalLearners} learners` : (!pClass ? 'Select class to view progress' : `${totalLearners} learners`)}
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* ── No Subjects Warning ───────────────────────────────── */}
      {pClass && totalSubjects === 0 && !statsLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No subjects found for the selected class. Please go to the Curriculum step to assign subjects before registering learners.
        </Alert>
      )}

      {/* ── Filter Row ────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={pSession} label="Session" onChange={(e) => setPSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.sesname || s.name || s.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={pTerm} label="Term" onChange={(e) => {
              const val = e.target.value;
              setPTerm(val);
              const term = terms.find((t) => t.id === val);
              if (term) setPTermId(term.id);
            }}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={pProgramme} label="Programme" onChange={(e) => setPProgramme(e.target.value)}>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.programme_name || p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={pClass} label="Class" onChange={(e) => setPClass(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.class_name || c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Arm</InputLabel>
            <Select value={pArm} label="Arm" onChange={(e) => setPArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.arm_names}</MenuItem>
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
              <Tab label="1. General Subjects" />
              <Tab label="2. Optional Subjects" />
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
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default SubjectRegistration;
