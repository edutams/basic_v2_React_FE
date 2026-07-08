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
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  IconId,
  IconCalendar,
  IconMapPin,
  IconSchool,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import {
  getApplicantByFormNumber,
  updateAdmissionStatus,
} from '@/api/tenant/admission/admissionProcessingApi';
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
  const [declineDialog, setDeclineDialog] = useState({ open: false });
  const [admitDialog, setAdmitDialog] = useState({ open: false });

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
    ? [admission.surname || admission.lname, admission.first_name || admission.fname, admission.other_name || admission.mname]
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
    surname: admission.surname || admission.lname,
    first_name: admission.first_name || admission.fname,
    other_name: admission.other_name || admission.mname,
    dob: admission.dob,
    gender: admission.gender || admission.sex,
    religion: admission.religion,
    home_address: admission.home_address,
    state_of_origin: admission.state_of_origin || admission.state_id,
    lga_id: admission.lga_id,
    lga: admission.lga,
    passport_photo: admission.passport_photo || admission.image,
  };

  const academicData = {
    has_previous_school: admission.has_previous_school,
    prev_school_name: admission.prev_school_name,
    prev_school_address: admission.prev_school_address,
    prev_school_state: admission.prev_school_state,
    prev_school_lga: admission.prev_school_lga,
    previous_class: admission.previous_class,
    intending_programme: admission.intending_programme,
    intending_class: admission.intending_class,
    intending_class_id: admission.intending_class_id,
    intending_programme_id: admission.intending_programme_id,
    study_mode: admission.study_mode,
  };

  // ─── Parent/guardian data ───────────────────────────────────────────
  const parentData = {
    lname: admission.parent?.lname || '',
    fname: admission.parent?.fname || '',
    mname: admission.parent?.mname || '',
    phone: admission.parent?.phone || '',
    email: admission.parent?.email || '',
    occupation: admission.parent?.occupation || '',
    address: admission.parent?.address || '',
  };
  const parentFullName = [parentData.lname, parentData.fname, parentData.mname].filter(Boolean).join('  ') || '—';

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

      {/* ── Parent/Guardian Information ───────────────────────────────── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2,mt:3 }}>
        <Typography variant="subtitle1" fontWeight={700} display="flex" alignItems="center" gap={1} mb={2}>
          <PersonIcon fontSize="small" />
          Parent / Guardian Information
        </Typography>

        {parentData.lname || parentData.fname || parentData.email ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Name"
                value={parentFullName}
                slotProps={{ input: { readOnly: true } }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Phone"
                value={parentData.phone || '—'}
                slotProps={{ input: { readOnly: true } }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Email"
                value={parentData.email || '—'}
                slotProps={{ input: { readOnly: true } }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Occupation"
                value={parentData.occupation || '—'}
                slotProps={{ input: { readOnly: true } }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Address"
                value={parentData.address || '—'}
                slotProps={{ input: { readOnly: true } }}
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Parent / guardian information is not available for this applicant.
          </Typography>
        )}
      </Paper>

      {/* ── Treat Admission (Admission Officer) ────────────────────────── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} display="flex" alignItems="center" gap={1} mb={2}>
          <IconCheck size={20} />
          Treat Admission (Admission Officer)
        </Typography>

        <Grid container spacing={2}>
          {admission.use_assessment === 'yes' && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Entrance Exam Score"
                  value={admission.entrance_exam_score ?? '—'}
                  slotProps={{ input: { readOnly: true } }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Required Passmark"
                  value={admission.assessment_passmark ?? '—'}
                  slotProps={{ input: { readOnly: true } }}
                  size="small"
                />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Intended Class"
              value={admission?.class_code || '—'}
              slotProps={{ input: { readOnly: true } }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Programme"
              value={admission.prog_name || admission.intending_programme?.programme_name || admission.intending_programme?.programme_code || '—'}
              slotProps={{ input: { readOnly: true } }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Admission Batch"
              value={selectedBatch?.batch_name || admission.batchname || '—'}
              slotProps={{ input: { readOnly: true } }}
              size="small"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<IconCheck size={20} />}
            onClick={() => setAdmitDialog({ open: true })}
            disabled={admission.admission_status === 'admitted' || submitting}
            sx={{ fontWeight: 700, px: 5 }}
          >
            Admit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<IconX size={20} />}
            onClick={() => setDeclineDialog({ open: true })}
            disabled={admission.admission_status === 'declined' || submitting}
            sx={{ fontWeight: 700, px: 5 }}
          >
            Decline
          </Button>
        </Box>
      </Paper>

      {/* ── Admit to Class Modal ───────────────────────────────────────── */}
      <Dialog
        open={admitDialog.open}
        onClose={() => setAdmitDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Admit {fullName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You are about to admit the following applicant. Please review the details before confirming.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Avatar src={admission.passport_photo || admission.image} sx={{ width: 48, height: 48 }}>
                {(admission.first_name || admission.fname)?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>{fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Form: {admission.form_number} | {admission?.class_code || '—'}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Programme"
                  value={admission.prog_name  || '—'}
                  slotProps={{ input: { readOnly: true } }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Intended Class"
                  value={admission?.class_code  || '—'}
                  slotProps={{ input: { readOnly: true } }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Admission Batch"
                  value={selectedBatch?.batch_name || admission.batchname || '—'}
                  slotProps={{ input: { readOnly: true } }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => setAdmitDialog({ open: false })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={async () => {
              setAdmitDialog({ open: false });
              setSubmitting(true);
              try {
                await updateAdmissionStatus(form_number, 'admitted');
                notify.success(`Application status updated to "Admitted"`);
                setAdmission((prev) => ({ ...prev, admission_status: 'admitted' }));
                setNewStatus('admitted');
              } catch (err) {
                notify.error(err?.response?.data?.message || 'Failed to admit applicant');
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            sx={{ fontWeight: 600 }}
          >
            {submitting ? 'Processing...' : 'Confirm Admission'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Decline Confirmation Dialog ────────────────────────────────── */}
      <Dialog
        open={declineDialog.open}
        onClose={() => setDeclineDialog({ open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Decline Application</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to decline the application for <strong>{fullName}</strong>?
            This action will mark the application as declined.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => setDeclineDialog({ open: false })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={async () => {
              setDeclineDialog({ open: false });
              setSubmitting(true);
              try {
                await updateAdmissionStatus(form_number, 'declined');
                notify.success(`Application status updated to "Declined"`);
                setAdmission((prev) => ({ ...prev, admission_status: 'declined' }));
                setNewStatus('declined');
              } catch (err) {
                notify.error(err?.response?.data?.message || 'Failed to decline applicant');
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            sx={{ fontWeight: 600 }}
          >
            {submitting ? 'Processing...' : 'Yes, Decline'}
          </Button>
        </DialogActions>
      </Dialog>

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
