import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import ApplicationCard from '@/components/tenant/admission/status/ApplicationCard';
import { getAllMyAdmissionApplication } from '@/api/tenant/admission/admissionApi';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { useNotification } from 'src/hooks/useNotification';

const MyApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();

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
            label: `${sterm.session?.sesname || ''} ${sterm.display_term?.display_name || ''}`.trim(),
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
          session: app.admission_batch?.session_term?.session?.sesname || '—',
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

  const handleSessionTermChange = (event) => {
    setSelectedSessionTerm(event.target.value);
  };

  return (
    <PageContainer title="My Applications" description="View all admission applications">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            My Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading...' : `${applications.length} application${applications.length !== 1 ? 's' : ''} found`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedSessionTerm}
              onChange={(e) => setSelectedSessionTerm(e.target.value)}
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
            onClick={() => setBatchModalOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            New Application
          </Button>
        </Box>
      </Box>

      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{
            color: '#262292',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          Back to dashboard
        </Button>
      </Box>

      {/* Application cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
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
              You haven't submitted any admission applications for this session. Start a new application to get your
              ward enrolled.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setBatchModalOpen(true)}>
            New Application
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} alignItems="flex-start">
          {applications.map((app) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={app.id}>
              <ApplicationCard app={app} />
            </Grid>
          ))}
        </Grid>
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
