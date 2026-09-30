import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  Stack,
  useTheme,
} from '@mui/material';
import {
  ArrowBackIosNew as ArrowBackIosNewIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  TaskAlt as TaskAltIcon,
  HowToReg as HowToRegIcon,
  HourglassTop as HourglassTopIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import ApplicationCard from '@/components/tenant/admission/status/ApplicationCard';
import { getAllMyAdmissionApplication } from '@/api/tenant/admission/admissionApi';
import {
  fetchSessionTerms,
  fetchTenantSessions,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';
import { useNotification } from 'src/hooks/useNotification';

/**
 * Small summary pill used in the stats strip — mirrors the icon-chip
 * language used across the admin dashboard cards for visual consistency.
 * Colors are solid hex tokens rather than theme.palette names: the theme's
 * "warning" is a pale gold (#fdc90f) that reads as washed-out for text/icons.
 */
const SummaryPill = ({ icon: Icon, label, value, color, bg }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.75,
        py: 1.25,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        flex: 1,
        minWidth: 150,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 19 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.25 }}>{value}</Typography>
      </Box>
    </Paper>
  );
};

/**
 * Placeholder matching ApplicationCard's general shape (avatar, name,
 * info-row grid, progress rail, action button) so the loading state doesn't
 * jump/reflow once real cards render in.
 */
const ApplicationCardSkeleton = () => (
  <Paper sx={{ borderRadius: 3, p: 3 }}>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={18} />
      </Box>
      <Skeleton variant="rounded" width={72} height={24} />
    </Stack>
    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1.5}>
        <Skeleton variant="rounded" width={32} height={32} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={14} />
          <Skeleton variant="text" width="70%" height={18} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1.5}>
        <Skeleton variant="rounded" width={32} height={32} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={14} />
          <Skeleton variant="text" width="70%" height={18} />
        </Box>
      </Stack>
    </Stack>
    <Skeleton variant="rounded" width="100%" height={6} sx={{ mb: 2.5 }} />
    <Skeleton variant="rounded" width="100%" height={36} />
  </Paper>
);

const MyApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);

  const [sessions, setSessions] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [terms, setTerms] = useState([{ id: 'all', label: 'All Terms' }]);
  const [selectedSessionId, setSelectedSessionId] = useState('all');
  const [selectedTermId, setSelectedTermId] = useState('all');

  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(false);

  // Load every session the tenant has, plus the currently active
  // session+term (to preselect both filters on first load) in parallel.
  useEffect(() => {
    const loadSessionsAndActive = async () => {
      try {
        const [sessionsRes, activeRes] = await Promise.all([
          fetchTenantSessions({ pagination: false }),
          fetchActiveTenantSessionTerm().catch(() => null),
        ]);

        setSessions([
          { id: 'all', label: 'All Sessions' },
          ...(sessionsRes?.data || []).map((s) => ({ id: s.id, label: s.session_name })),
        ]);

        const active = activeRes?.data;
        if (active?.session_id) {
          setSelectedSessionId(active.session_id);
          setSelectedTermId(active.term_id ?? 'all');
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        notify.error('Failed to load sessions');
      }
    };

    loadSessionsAndActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the terms that belong to the selected session (a term's name repeats
  // across every session, so the Term filter only makes sense scoped to one).
  useEffect(() => {
    if (selectedSessionId === 'all') {
      setTerms([{ id: 'all', label: 'All Terms' }]);
      setSelectedTermId('all');
      return;
    }

    const loadTerms = async () => {
      setTermsLoading(true);
      try {
        const response = await fetchSessionTerms(selectedSessionId);
        setTerms([
          { id: 'all', label: 'All Terms' },
          ...response.data.map((st) => ({ id: st.term_id, label: st.term?.term_name || '—' })),
        ]);
      } catch (error) {
        console.error('Failed to load terms:', error);
        notify.error('Failed to load terms');
      } finally {
        setTermsLoading(false);
      }
    };

    loadTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  // Load every application once — filtering by session/term happens
  // client-side below, so switching filters never needs another round trip.
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const response = await getAllMyAdmissionApplication();
        const apps = response?.data || [];

        // Transform backend data to match ApplicationCard expectations
        const transformedApps = apps.map((app) => ({
          id: app.id,
          surname: app.surname,
          first_name: app.first_name,
          other_name: app.other_name,
          status: app.admission_status,
          applicationNo: app.form_number || '—',
          class: app.intending_class?.class_code || app.intending_class?.class_name || '—',
          session: app.admission_batch?.session_term?.session?.session_name || '—',
          batch: app.admission_batch?.batch_name || '—',
          currentStep: app.admission_stage || 0,
          acceptanceFee: app.admission_batch?.acceptance_fee || null,
          feeDue: null,
          timeline: [],
          draftStep: app.admission_stage || 0,
          gender: app.gender,
          dob: app.dob,
          form_submit_status: app.form_submit_status,
          admission_status: app.admission_status,
          image: app.passport_photo || null,
          // Keep original data for navigation and session/term filtering
          _original: app,
        }));

        setApplications(transformedApps);
      } catch (error) {
        console.error('Failed to load applications:', error);
        notify.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredApplications = useMemo(() => {
    if (selectedSessionId === 'all' && selectedTermId === 'all') {
      return applications;
    }

    return applications.filter((app) => {
      const sessionTerm = app._original?.admission_batch?.session_term;
      if (!sessionTerm) return false;

      const sessionMatch = selectedSessionId === 'all' || sessionTerm.session_id === selectedSessionId;
      const termMatch = selectedTermId === 'all' || sessionTerm.term_id === selectedTermId;

      return sessionMatch && termMatch;
    });
  }, [applications, selectedSessionId, selectedTermId]);

  const handleApplyAdmission = (batch, draft) => {
    navigate('/admission/new-application', {
      state: { batch, ward: draft, resumeApplication: true },
    });
  };

  const summary = useMemo(() => {
    const submitted = filteredApplications.filter((a) => a.form_submit_status === 'yes').length;
    const admitted = filteredApplications.filter((a) => (a.admission_status || '').toLowerCase() === 'admitted').length;
    const pending = filteredApplications.filter((a) => {
      const status = (a.admission_status || 'pending').toLowerCase();
      return status !== 'admitted' && status !== 'declined';
    }).length;

    return { total: filteredApplications.length, submitted, admitted, pending };
  }, [filteredApplications]);

  return (
    <PageContainer title="My Applications" description="View all admission applications">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        mb={2.5}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            My Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Loading...'
              : `${filteredApplications.length} application${filteredApplications.length !== 1 ? 's' : ''} found`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              p: 0.75,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#eef2f9',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                sx={{ borderRadius: '8px', bgcolor: 'background.paper' }}
              >
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }} disabled={selectedSessionId === 'all' || termsLoading}>
              <Select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                sx={{ borderRadius: '8px', bgcolor: 'background.paper' }}
              >
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setBatchModalOpen(true)}
            sx={{ whiteSpace: 'nowrap', borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            New Application
          </Button>

          {/* Set apart from the primary actions with a divider, but still
              anchored at the extreme right edge of the same row. */}
          <Box sx={{ width: '1px', height: 22, bgcolor: 'divider', display: { xs: 'none', sm: 'block' } }} />

          <Button
            size="small"
            onClick={() => navigate('/dashboard')}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: '12px !important' }} />}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
            }}
          >
            Back to dashboard
          </Button>
        </Box>
      </Box>

      {/* Summary strip */}
      {!loading && filteredApplications.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
          <SummaryPill icon={AssignmentIcon} label="Total" value={summary.total} color="#2563eb" bg="#dbeafe" />
          <SummaryPill icon={TaskAltIcon} label="Submitted" value={summary.submitted} color="#0284c7" bg="#e0f2fe" />
          <SummaryPill icon={HowToRegIcon} label="Admitted" value={summary.admitted} color="#16a34a" bg="#dcfce7" />
          <SummaryPill icon={HourglassTopIcon} label="Pending" value={summary.pending} color="#d97706" bg="#fef3c7" />
        </Box>
      )}

      {/* Application cards */}
      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 420px))',
            gap: 3,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </Box>
      ) : filteredApplications.length === 0 ? (
        <Paper
          sx={{
            borderRadius: 3,
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            maxWidth: 480,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DescriptionIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No applications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              You haven't submitted any admission applications for this session. Start a new
              application to get your ward enrolled.
            </Typography>
          </Box>
          <Button variant="contained" size="small" onClick={() => setBatchModalOpen(true)}>
            New Application
          </Button>
        </Paper>
      ) : (
        // Cards size themselves (auto-fit + minmax) instead of splitting the
        // page into fixed percentage columns — a single application renders
        // as one generously-sized card instead of a sliver lost in a huge row.
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 420px))',
            gap: 3,
          }}
        >
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </Box>
      )}

      <AdmissionBatchModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onApply={handleApplyAdmission}
      />
    </PageContainer>
  );
};

export default MyApplication;
