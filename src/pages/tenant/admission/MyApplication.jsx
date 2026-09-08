import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
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
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
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

const MyApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);

  const [loading, setLoading] = useState(true);
  const [sessionTermsLoading, setSessionTermsLoading] = useState(true);

  // Load session terms for filter
  useEffect(() => {
    const loadSessionTerms = async () => {
      setSessionTermsLoading(true);
      try {
        const response = await fetchSessionTerms();
        const sess_terms = [
          { id: 'all', label: 'All Sessions' },
          ...response.data.map((sterm) => ({
            id: sterm.id,
            label:
              `${sterm.session?.session_name || ''} ${sterm.term?.term_name || ''}`.trim(),
          })),
        ];
        setSessionTerms(sess_terms);
      } catch (error) {
        console.error('Failed to load session terms:', error);
        notify.error('Failed to load session terms');
      } finally {
        setSessionTermsLoading(false);
      }
    };

    loadSessionTerms();
  }, []);

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      if (!selectedSessionTerm) return;

      setLoading(true);
      try {
        const sessionTermId = selectedSessionTerm === 'all' ? null : selectedSessionTerm;
        const response = await getAllMyAdmissionApplication(sessionTermId);
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
          // Keep original data for navigation
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
  }, [selectedSessionTerm]);

  const handleApplyAdmission = (batch) => {
    navigate('/admission/new-application', { state: { batch } });
  };

  const summary = useMemo(() => {
    const submitted = applications.filter((a) => a.form_submit_status === 'yes').length;
    const admitted = applications.filter((a) => (a.admission_status || '').toLowerCase() === 'admitted').length;
    const pending = applications.filter((a) => {
      const status = (a.admission_status || 'pending').toLowerCase();
      return status !== 'admitted' && status !== 'declined';
    }).length;

    return { total: applications.length, submitted, admitted, pending };
  }, [applications]);

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
              : `${applications.length} application${applications.length !== 1 ? 's' : ''} found`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedSessionTerm}
              onChange={(e) => setSelectedSessionTerm(e.target.value)}
              sx={{ borderRadius: '10px' }}
            >
              {sessionTerms.map((st) => (
                <MenuItem key={st.id} value={st.id}>
                  {st.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
      {!loading && applications.length > 0 && (
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
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}
        >
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
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
          {applications.map((app) => (
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
