import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import ward from '@/assets/images/backgrounds/ward.png';
import { getAdmissionApplication } from '@/api/tenant/admission/admissionApi';
import { useNotification } from 'src/hooks/useNotification';

import TrackerHeader from '@/components/tenant/admission/tracker/TrackerHeader';
import TrackerMain from '@/components/tenant/admission/tracker/TrackerMain';
import TrackerSidebar from '@/components/tenant/admission/tracker/TrackerSidebar';

const ApplicationTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const notify = useNotification();

  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load admission data
  useEffect(() => {
    const loadAdmission = async () => {
      // Try to get from location state first
      const stateAdmission = location.state?.admission;
      
      if (stateAdmission) {
        setAdmission(stateAdmission);
        setLoading(false);
      } else if (id) {
        // Fetch from API if not in state
        setLoading(true);
        try {
          const response = await getAdmissionApplication(id);
          setAdmission(response?.data);
        } catch (error) {
          console.error('Failed to load admission:', error);
          notify.error('Failed to load admission details');
          navigate('/my-applications');
        } finally {
          setLoading(false);
        }
      } else {
        notify.error('No admission ID provided');
        navigate('/my-applications');
      }
    };

    loadAdmission();
  }, [id, location.state]);

  const handleViewDetails = () => {
    if (!admission) return;
    
    const formData = {
      wardData: {
        surname: admission.surname,
        first_name: admission.first_name,
        other_name: admission.other_name,
        dob: admission.dob,
        gender: admission.gender,
        home_address: admission.home_address,
        lga: admission.lga,
      },
      academicData: {
        has_previous_school: admission.has_previous_school,
        prev_school_name: admission.prev_school_name,
        prev_school_state: admission.prev_school_state,
        prev_school_lga: admission.prev_school_lga,
        previous_class: admission.previous_class,
        intending_programme: admission.intending_programme,
        intending_class: admission.intending_class,
        study_mode: admission.study_mode,
      },
      selectedBatch: admission.admission_batch,
      viewMode: true,
    };
    sessionStorage.setItem('formDetailsData', JSON.stringify(formData));
    
    window.open('/admission/form-details', '_blank');
  };

  if (loading) {
    return (
      <PageContainer title="Application Tracker" description="Track your admission application">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!admission) {
    return (
      <PageContainer title="Application Tracker" description="Track your admission application">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Admission not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/my-applications')}
            sx={{ mt: 2 }}
          >
            Back to Applications
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  const applicantName = `${admission.surname || ''} ${admission.first_name || ''} ${admission.other_name || ''}`.trim();
  const intendingClass = admission.intending_class?.class_code || admission.intending_class?.class_name || 'N/A';
  const gender = admission.gender ? admission.gender.toUpperCase() : 'N/A';
  const address = admission.home_address || 'No address provided';
  const photo = admission.passport_photo || ward;
  const currentStage = admission.admission_stage || 0;
  const submittedDate = admission.form_submit_completion 
    ? new Date(admission.form_submit_completion).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Not submitted';

  return (
    <PageContainer title="Application Tracker" description="Track your admission application">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        mb={3}
      >
        <Typography variant="h5" fontWeight={800}>
          Application Tracker
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admission_manager/my_applications')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to applications
        </Button>
      </Box>

      <TrackerHeader
        name={applicantName}
        intendingClass={intendingClass}
        gender={gender}
        address={address}
        photo={photo}
        admission={admission}
      />

      <Paper sx={{ p: 3, bgcolor: '#e5e8f86a' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {admission?.admission_batch?.has_entrance_exam ? (
              <TrackerMain
                submittedDate={submittedDate}
                onViewDetails={handleViewDetails}
                admission={admission}
                stageTitle="Entrance Exam"
                stageDescription="Your child is required to take the online aptitude test as part of the admission process."
                requirementStatus="Ready to Begin"
                timeLimit="45 Minutes"
                onStart={() => {}}
                onPractice={() => {}}
                nextTitle="Admission Decision"
                nextDescription="Requires completion of Entrance Exam."
                nextActionLabel="Pay Acceptance Fee"
                nextActionDisabled
                onNextAction={() => {}}
              />
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, textAlign: 'center', bgcolor: 'primary.lighter' }}>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  Admission Doesnt has Entrance exam you can proceed with the next requiremets.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please monitor your application status.
                </Typography>
              </Paper>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TrackerSidebar admission={admission} />
          </Grid>
        </Grid>
      </Paper>
    </PageContainer>
  );
};

export default ApplicationTracker;
