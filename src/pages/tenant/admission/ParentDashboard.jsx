import { useTheme } from '@mui/material/styles';
import { useContext, useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Button, Stack, FormControl, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import {
  Groups as GroupsIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

import StatCard from '@/components/shared/StatCard';
import WalletCard from '@/components/shared/WalletCard';
import AdmissionBanner from '@/components/tenant/admission/AdmissionBanner';
import EnrolledWardCard from '@/components/tenant/admission/EnrolledWardCard';
import ProspectiveWardCard from '@/components/tenant/admission/ProspectiveWardCard';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import { getUserProspectiveAdmissions } from '@/api/tenant/admission/admissionApi';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from 'src/hooks/useNotification';
import ward from '@/assets/images/backgrounds/ward.png';

// ── Dashboard
const ParentDashboard = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { tenantInfo } = useContext(TenantAuthContext);

  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [prospectiveWards, setProspectiveWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);

  const session = tenantInfo?.academic_session || '2025/2026';
  const term = tenantInfo?.academic_term || '';

  // Fetch session terms on mount
  useEffect(() => {
    const loadSessionTerms = async () => {
      try {
        const response = await fetchSessionTerms();
        if (response.status) {
          const sess_terms = [
            { id: 'all', label: 'All Sessions' },
            ...response.data.map((sterm) => ({
              id: sterm.id,
              label: `${sterm.session?.sesname || ''} ${sterm.display_term?.display_name || ''}`.trim(),
            })),
          ];
          setSessionTerms(sess_terms);
        }
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      }
    };

    loadSessionTerms();
  }, []); // Only run once on mount

  // Fetch prospective wards (user's admissions)
  useEffect(() => {
    const fetchProspectiveWards = async () => {
      setLoading(true);
      try {
        const sessionTermId = selectedSessionTerm === 'all' ? null : selectedSessionTerm;
        const response = await getUserProspectiveAdmissions(sessionTermId);

        if (response.status) {
          // Transform backend data to match component expectations
          const transformed = response.data.map((admission) => ({
            id: admission.id,
            name: `${admission.surname} ${admission.first_name} ${admission.other_name || ''}`.trim(),
            initials: `${admission.surname?.[0] || ''}${admission.first_name?.[0] || ''}`,
            class: admission.intending_class?.class_code || admission.intending_class?.class_name || 'N/A',
            applicationNo: admission.form_number,
            status: getAdmissionStatus(admission),
            step: admission.admission_stage || 0,
            expanded: false,
            admissionData: admission, // Store full admission data for navigation
          }));

          setProspectiveWards(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch prospective wards:', error);
        notify.error('Failed to load prospective wards');
      } finally {
        setLoading(false);
      }
    };

    fetchProspectiveWards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionTerm]); // Only depend on selectedSessionTerm

  // Helper function to determine admission status
  const getAdmissionStatus = (admission) => {
    if (admission.form_submit_status === 'yes') {
      if (admission.admission_status === 'admitted') {
        return 'Admitted';
      } else if (admission.admission_status === 'rejected') {
        return 'Rejected';
      } else {
        return 'Under Review';
      }
    } else if (admission.admission_stage >= 4) {
      return 'Pending Submission';
    } else if (admission.admission_stage >= 2) {
      return 'In Progress';
    } else {
      return 'Draft';
    }
  };

  const handleApplyAdmission = (batch) => {
    navigate('/admission/new-application', { state: { batch } });
  };

  const handleViewEnrolledWard = (ward) => {
    // Normalize enrolled ward shape to match what AdmissionStatus expects
    const normalized = {
      ...ward,
      applicationNo: ward.regNo,
      class: ward.tags?.[0] ?? '—',
      session: session,
      term: term,
    };
    // navigate(`/admission-status/${ward.id}`, { state: { ward: normalized } });
  };

  const handleViewProspectiveWard = (ward) => {
    const admission = ward.admissionData;
    
    // If form is submitted, go to application tracker
    if (admission?.form_submit_status === 'yes') {
      navigate(`/application-tracker/${admission.id}`, {
        state: { admission }
      });
    } else {
      // If draft, go to application form to continue
      navigate('/admission/new-application', { 
        state: { 
          ward: admission,
          resumeApplication: true 
        } 
      });
    }
  };

  const theme = useTheme();
  const bg = `linear-gradient(90deg, #121212e3 0%, ${theme.palette.primary.main} 100%)`;

  // Hardcoded enrolled wards for now (you can create a separate API for this)
  const ENROLLED_WARDS = [];

  return (
    <PageContainer title="Parent Dashboard" description="Parent portal">
      <AdmissionBanner session={session} onApply={() => setAdmissionModalOpen(true)} />

      {/* ── Stat Cards ── */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={GroupsIcon} count={ENROLLED_WARDS.length} label="Enrolled Ward" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={GroupsIcon} count={prospectiveWards.length} label="Prospective Ward" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={WalletIcon} count="₦0" label="Outstanding Fees" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {/* <WalletCard balance="₦40,000.00" accountNumber="987123793" bankName="Globus Bank" /> */}
            <WalletCard
              balance="₦50,000"
              accountNumber="1234567890"
              bankName="GTBank"
              icon={WalletIcon}
            />
          </Grid>

        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          {/* Enrolled wards */}
          <Paper
            sx={{ borderRadius: 3, p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexShrink={0}
            >
              <Typography variant="h6" fontWeight={700}>
                Enrolled Ward
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={selectedSessionTerm}
                  onChange={(e) => setSelectedSessionTerm(e.target.value)}
                  displayEmpty
                  sx={{
                    bgcolor: '#F1F4F1',
                    fontWeight: 500,
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                  }}
                >
                  {sessionTerms.map((st) => (
                    <MenuItem key={st.id} value={st.id}>
                      {st.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ overflowY: 'auto', flex: 1, pr: 0.5 }}>
              {ENROLLED_WARDS.length > 0 ? (
                <Stack spacing={1.5}>
                  {ENROLLED_WARDS.map((ward) => (
                    <EnrolledWardCard
                      key={ward.id}
                      ward={ward}
                      onViewDetails={handleViewEnrolledWard}
                    />
                  ))}
                </Stack>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No enrolled wards yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 2,
              background: bg,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <img src={ward} alt="ward" style={{ width: 70, height: 70, objectFit: 'contain' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Check Your Ward Result
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  View Academic Performance For All Wards
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#DFFF7D',
                color: '#1a1a1a',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#cdf84e' },
                whiteSpace: 'nowrap',
              }}
            >
              Access
            </Button>
          </Paper>
        </Grid>

        {/* Prospective wards */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            sx={{ borderRadius: 3, p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexShrink={0}
            >
              <Typography variant="h6" fontWeight={700}>
                Prospective
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={selectedSessionTerm}
                  onChange={(e) => setSelectedSessionTerm(e.target.value)}
                  displayEmpty
                  sx={{
                    bgcolor: '#F1F4F1',
                    fontWeight: 500,
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                  }}
                >
                  {sessionTerms.map((term) => (
                    <MenuItem key={term.id} value={term.id}>
                      {term.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ overflowY: 'auto', flex: 1, pr: 0.5 }}>
              {loading ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </Box>
              ) : prospectiveWards.length > 0 ? (
                <Stack spacing={1.5}>
                  {prospectiveWards.map((ward) => (
                    <ProspectiveWardCard
                      key={ward.id}
                      ward={ward}
                      onViewDetails={handleViewProspectiveWard}
                    />
                  ))}
                </Stack>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No prospective wards yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <AdmissionBatchModal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onApply={handleApplyAdmission}
      />
    </PageContainer>
  );
};

export default ParentDashboard;
