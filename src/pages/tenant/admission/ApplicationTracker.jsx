import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import ward from '@/assets/images/backgrounds/ward.png';
import {
  getAdmissionApplication,
  updateAdmissionApplication,
} from '@/api/tenant/admission/admissionApi';
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
  const [editLoading, setEditLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      documentsData: {
        birth_cert: admission.birth_cert,
        prev_school_report: admission.prev_school_report,
        passport_photo: admission.passport_photo,
        medical_record: admission.medical_record,
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

  const hasEntranceExam = admission?.admission_batch?.has_entrance_exam;
  const isBatchOpen = admission?.admission_batch?.status === 'open';

  const handleEditForm = () => {
    if (!admission?.id) return;
    setConfirmOpen(true);
  };

  const confirmEditForm = async () => {
    if (!admission?.id) return;

    setConfirmOpen(false);
    setEditLoading(true);

    try {
      const payload = {
        form_submit_status: 'no',
        admission_batch_id: admission.admission_batch_id || admission.admission_batch?.id,
        admission_stage:  0,
        surname: admission.surname,
        first_name: admission.first_name,
        other_name: admission.other_name,
        dob: admission.dob,
        gender: admission.gender,
        home_address: admission.home_address,
        lga_id: admission.lga_id || admission.lga?.id || admission.lga,
        has_previous_school: admission.has_previous_school,
        prev_school_name: admission.prev_school_name,
        prev_school_state: admission.prev_school_state,
        prev_school_lga: admission.prev_school_lga,
        previous_class: admission.previous_class,
        intending_programme_id:
          admission.intending_programme_id || admission.intending_programme?.id || null,
        intending_class_id:
          admission.intending_class_id || admission.intending_class?.id || null,
        study_mode: admission.study_mode,
      };

      const updated = await updateAdmissionApplication(admission.id, payload);

      const updatedAdmission = updated?.data ?? updated;
      setAdmission(updatedAdmission);

      navigate('/admission/new-application', {
        state: {
          ward: updatedAdmission || admission,
          resumeApplication: true,
          startFromFirstStep: true,
          batch: admission.admission_batch,
          selectedBatch: admission.admission_batch,
        },
      });
    } catch (error) {
      console.error('Failed to revert application to draft:', error);
      notify.error('Unable to edit application right now');
    } finally {
      setEditLoading(false);
    }
  };

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

  const applicantName = `${admission.surname.toUpperCase() || ''} ${admission.first_name.toUpperCase() || ''} ${admission.other_name.toUpperCase() || ''}`.trim();
  const intendingClass = admission.intending_class?.class_code || admission.intending_class?.class_name || 'N/A';
  const gender = admission.gender ? admission.gender.toUpperCase() : 'N/A';
  const address = admission.home_address || 'No address provided';
  const photo = admission.passport_photo || ward;
  const dob = admission.dob ? new Date(admission.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'  ;
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
        dob={dob}
        form_number={admission.form_number}
        admission={admission}
      />

      <Paper sx={{ p: 3, bgcolor: '#e5e8f86a' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TrackerMain
              submittedDate={submittedDate}
              onViewDetails={handleViewDetails}
              onEditForm={isBatchOpen ? handleEditForm : undefined}
              stageTitle={hasEntranceExam ? 'Entrance Exam' : 'Application Overview'}
              stageDescription={
                hasEntranceExam
                  ? 'Your child is required to take the online aptitude test as part of the admission process.'
                  : 'No entrance exam is required for this application. You can view details or edit the form if the batch is still open.'
              }
              requirementStatus={hasEntranceExam ? 'Ready to Begin' : ''}
              timeLimit={hasEntranceExam ? '45 Minutes' : ''}
              onStart={() => {}}
              onPractice={() => {}}
              showCurrentStageActions={hasEntranceExam}
              showRequirementStatus={hasEntranceExam}
              showNextStepCard={hasEntranceExam}
              nextTitle="Admission Decision"
              nextDescription="Requires completion of Entrance Exam."
              nextActionLabel="Pay Acceptance Fee"
              nextActionDisabled={hasEntranceExam || editLoading}
              onNextAction={() => {}}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TrackerSidebar admission={admission} />
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-edit-form-dialog"
      >
        <DialogTitle id="confirm-edit-form-dialog">Confirm Edit</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to edit the form? This will reopen the application for editing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={editLoading}>
            No
          </Button>
          <Button onClick={confirmEditForm} variant="contained" disabled={editLoading}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ApplicationTracker;
