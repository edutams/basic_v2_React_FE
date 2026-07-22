import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import WardReview from '@/components/tenant/admission/review/WardReview';
import AcademicReview from '@/components/tenant/admission/review/AcademicReview';
import DocumentsReview from '@/components/tenant/admission/review/DocumentsReview';
import { useNotification } from '@/hooks/useNotification';
import { getApplicantByFormNumber } from '@/api/tenant/admission/admissionProcessingApi';
import { useReactToPrint } from 'react-to-print';

const statusConfig = {
  admitted: { label: 'Admitted', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
  pending: { label: 'Pending', color: 'warning' },
};

const PrintApplicationForm = () => {
  const { form_number } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();
  const contentRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [admission, setAdmission] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!form_number) {
        notify.error('No form number provided');
        navigate('/process-applications');
        return;
      }
      setLoading(true);
      try {
        const res = await getApplicantByFormNumber(form_number);
        const data = res?.data ?? res;
        setAdmission(data);
      } catch (err) {
        console.error('Failed to load applicant:', err);
        notify.error('Failed to load application details');
        navigate('/process-applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form_number]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Application_Form_${admission?.lname || ''}_${admission?.fname || ''}`,
  });

  if (loading) {
    return (
      <PageContainer title="Application Form" description="Loading application">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={36} />
        </Box>
      </PageContainer>
    );
  }

  if (!admission) {
    return (
      <PageContainer title="Application Form" description="Not found">
        <Alert severity="error">Application not found.</Alert>
      </PageContainer>
    );
  }

  const fullName = [admission.lname, admission.fname, admission.mname].filter(Boolean).join(' ').toUpperCase() || '—';
  const statusInfo = statusConfig[admission.admission_status] || statusConfig.pending;

  const wardData = {
    surname: admission.lname,
    first_name: admission.fname,
    other_name: admission.mname,
    dob: admission.dob,
    gender: admission.sex || admission.gender,
    home_address: admission.home_address,
    state_of_origin: admission.state_id,
    lga_id: admission.lga_id,
    lga: admission.lga,
    passport_photo: admission.image || admission.passport_photo,
  };

  const academicData = {
    has_previous_school: admission.has_previous_school,
    prev_school_name: admission.prev_school_name,
    prev_school_state: admission.prev_school_state,
    prev_school_lga: admission.prev_school_lga,
    previous_class: admission.previous_class,
    intending_programme: admission.intending_programme,
    intending_class: admission.intending_class,
    intending_class_id: admission.intending_class_id,
    intending_programme_id: admission.intending_programme_id,
    study_mode: admission.study_mode,
  };

  const documentsData = {
    birth_cert: admission.birth_cert,
    prev_school_report: admission.prev_school_report,
    passport_photo: admission.image || admission.passport_photo,
    medical_record: admission.medical_record,
  };

  const selectedBatch = admission.admission_batch;

  return (
    <PageContainer title="Application Form" description="View submitted application form">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Application Form — {fullName}
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 600 }}>
            Print
          </Button>
          <Button variant="contained" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/process-applications')}>
            Back
          </Button>
        </Box>
      </Box>

      {/* Status Banner */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: `${statusInfo.color}.light`, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1" fontWeight={600}>
          Admission Status:
        </Typography>
        <Chip label={statusInfo.label} size="small" color={statusInfo.color} sx={{ fontWeight: 700 }} />
        <Typography variant="body2" color="text.secondary">
          Form: {admission.form_number} | Batch: {admission.batchname || '—'}
        </Typography>
      </Paper>

      {/* Print Content */}
      <Paper sx={{ p: 3, borderRadius: 2 }} ref={contentRef}>
        <Stack spacing={3}>
          <WardReview
            wardData={wardData}
            intendingClass={admission.intending_class?.class_code || admission.intending_class?.class_name}
            selectedBatch={selectedBatch}
            academicData={academicData}
          />
          <Divider />
          <AcademicReview
            academicData={academicData}
            intendingClass={admission.intending_class?.class_code || admission.intending_class?.class_name}
            selectedBatch={selectedBatch}
          />
          <Divider />
          <DocumentsReview
            documentsData={documentsData}
            hasPreviousSchool={Boolean(admission.has_previous_school)}
          />
        </Stack>
      </Paper>
    </PageContainer>
  );
};

export default PrintApplicationForm;
