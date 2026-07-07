import { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import {
  IconId,
  IconCalendar,
  IconMapPin,
  IconSchool,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import { getApplicantByFormNumber, updateAdmissionStatus } from '@/api/tenant/admission/admissionProcessingApi';
import WardReview from '@/components/tenant/admission/review/WardReview';
import AcademicReview from '@/components/tenant/admission/review/AcademicReview';
import DocumentsReview from '@/components/tenant/admission/review/DocumentsReview';

const statusConfig = {
  admitted: { label: 'Admitted', color: 'success', icon: CheckCircleIcon },
  declined: { label: 'Declined', color: 'error', icon: CancelIcon },
  pending: { label: 'Pending', color: 'warning', icon: PendingIcon },
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1,
        bgcolor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={16} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap>
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

const ProcessApplicationForm = () => {
  const { form_number } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  // ─── State ────────────────────────────────────────────────────────────
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, status: '' });

  // ─── Load admission data ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!form_number) {
        notify.error('No form number provided');
        navigate('/process-applications');
        return;
      }
      setLoading(true);
      try {
        const response = await getApplicantByFormNumber(form_number);
        const data = response?.data ?? response;
        setAdmission(data);
        setNewStatus(data?.admission_status || 'pending');
      } catch (err) {
        console.error('Failed to load admission:', err);
        notify.error('Failed to load application details');
        navigate('/process-applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form_number]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleStatusChange = (e) => {
    const status = e.target.value;
    if (status === admission.admission_status) return;
    setConfirmDialog({ open: true, status });
  };

  const handleConfirmStatus = async () => {
    const status = confirmDialog.status;
    setConfirmDialog({ open: false, status: '' });
    setSubmitting(true);
    try {
      await updateAdmissionStatus(form_number, status);
      notify.success(`Application status updated to "${statusConfig[status]?.label || status}"`);
      setAdmission((prev) => ({ ...prev, admission_status: status }));
      setNewStatus(status);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update admission status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ open: false, status: '' });
    setNewStatus(admission?.admission_status || 'pending');
  };

  const handleBack = () => {
    navigate('/process-applications');
  };

  // ─── Computed values ──────────────────────────────────────────────────
  const StatusIcon = statusConfig[admission?.admission_status]?.icon || PendingIcon;
  const currentStatusColor = statusConfig[admission?.admission_status]?.color || 'warning';
  const fullName = admission
    ? [admission.surname, admission.first_name, admission.other_name]
        .filter(Boolean)
        .join(' ')
        .toUpperCase() || '—'
    : '';

  // ─── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer title="Process Application" description="Loading application details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={36} />
        </Box>
      </PageContainer>
    );
  }

  if (!admission) {
    return (
      <PageContainer title="Process Application" description="Application not found">
        <Alert severity="error">Application not found.</Alert>
      </PageContainer>
    );
  }

  // ─── Build form data for review components ───────────────────────────
  const wardData = {
    surname: admission.surname,
    first_name: admission.first_name,
    other_name: admission.other_name,
    dob: admission.dob,
    gender: admission.gender,
    home_address: admission.home_address,
    state_of_origin: admission.state_of_origin,
    lga_id: admission.lga_id,
    lga: admission.lga,
    passport_photo: admission.passport_photo,
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
    passport_photo: admission.passport_photo,
    medical_record: admission.medical_record,
  };

  const selectedBatch = admission.admission_batch;

  return (
    <PageContainer
      title="Process Application Form"
      description="Review and process admission application"
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        mb={3}
      >
        <Typography variant="h5" fontWeight={800}>
          Process Application Form
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Processing
        </Button>
      </Box>

      {/* ── Applicant Summary Card ────────────────────────────────────── */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          {/* Avatar + Name */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={admission.passport_photo}
                sx={{ width: 64, height: 64, bgcolor: 'primary.light' }}
              >
                {admission.first_name?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Form: {admission.form_number || '—'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Details */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Stack spacing={1}>
              <DetailRow
                icon={IconId}
                label="Form Number"
                value={admission.form_number}
              />
              <DetailRow
                icon={IconSchool}
                label="Intending Class"
                value={admission.intending_class?.class_code || admission.intending_class?.class_name || '—'}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Stack spacing={1}>
              <DetailRow
                icon={IconCalendar}
                label="Submission Date"
                value={
                  admission.form_submit_completion
                    ? new Date(admission.form_submit_completion).toLocaleDateString()
                    : 'Not submitted'
                }
              />
              <DetailRow
                icon={IconMapPin}
                label="Study Mode"
                value={
                  admission.study_mode === 'day'
                    ? 'Day Student'
                    : admission.study_mode === 'boarding'
                      ? 'Boarding Student'
                      : '—'
                }
              />
            </Stack>
          </Grid>

          {/* Status Update */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight={600}>
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <StatusIcon
                  size={20}
                  color={currentStatusColor === 'success' ? 'green' : currentStatusColor === 'error' ? 'red' : 'orange'}
                />
                <Chip
                  label={statusConfig[admission.admission_status]?.label || 'Pending'}
                  size="small"
                  color={currentStatusColor}
                  sx={{ fontWeight: 700, minWidth: 70 }}
                />
              </Box>
              <FormControl fullWidth size="small">
                <InputLabel>Update Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Update Status"
                  onChange={handleStatusChange}
                  disabled={submitting}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="admitted">Admitted</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Application Form Details ──────────────────────────────────── */}
      <ParentCard title="Application Form Details">
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
      </ParentCard>

      {/* ── Status Update Confirmation ────────────────────────────────── */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Update Admission Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to change the admission status for{' '}
            <strong>{fullName}</strong> to{' '}
            <Chip
              label={statusConfig[confirmDialog.status]?.label || confirmDialog.status}
              size="small"
              color={statusConfig[confirmDialog.status]?.color || 'default'}
              sx={{ fontWeight: 600 }}
            />
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={handleCancelConfirm}>
            Cancel
          </Button>
          <Button
            size="small"
            color={confirmDialog.status === 'declined' ? 'error' : 'primary'}
            onClick={handleConfirmStatus}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ProcessApplicationForm;
