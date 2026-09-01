import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Paper,
  Divider,
  TextField,
  Chip,
  Stack,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { getApplicantByFormNumber } from '@/api/tenant/admission/admissionProcessingApi';
import WardReview from '@/components/tenant/admission/review/WardReview';
import AcademicReview from '@/components/tenant/admission/review/AcademicReview';
import DocumentsReview from '@/components/tenant/admission/review/DocumentsReview';

const statusConfig = {
  admitted: { label: 'Admitted', color: 'success', icon: CheckCircleIcon },
  declined: { label: 'Declined', color: 'error', icon: CancelIcon },
  pending: { label: 'Pending', color: 'warning', icon: PendingIcon },
  revoked: { label: 'Revoked', color: 'error', icon: CancelIcon },
};

const ViewAdmissionModal = ({ open, onClose, formNumber }) => {
  const notify = useNotification();
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAdmission = async () => {
      if (!open || !formNumber) return;

      setLoading(true);
      try {
        const response = await getApplicantByFormNumber(formNumber);
        const data = response?.data ?? response;
        setAdmission(data);
      } catch (err) {
        console.error('Failed to load admission:', err);
        notify.error('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    loadAdmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formNumber]);

  const handleClose = () => {
    setAdmission(null);
    onClose();
  };

  if (!open) return null;

  const fullName = admission
    ? [
        admission.surname || admission.lname,
        admission.first_name || admission.fname,
        admission.other_name || admission.mname,
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase() || '—'
    : '';

  const StatusIcon = statusConfig[admission?.admission_status]?.icon || PendingIcon;

  // Build data for review components
  const wardData = admission
    ? {
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
      }
    : null;

  const academicData = admission
    ? {
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
      }
    : null;

  const documentsData = admission
    ? {
        birth_cert: admission.birth_cert,
        prev_school_report: admission.prev_school_report,
        passport_photo: admission.passport_photo,
        medical_record: admission.medical_record,
      }
    : null;

  const parentData = admission
    ? {
        lname: admission.parent?.lname || '',
        fname: admission.parent?.fname || '',
        mname: admission.parent?.mname || '',
        phone: admission.parent?.phone || '',
        email: admission.parent?.email || '',
        occupation: admission.parent?.occupation || '',
        address: admission.parent?.address || '',
      }
    : null;

  const parentFullName = parentData
    ? [parentData.lname, parentData.fname, parentData.mname].filter(Boolean).join(' ') || '—'
    : '—';

  const selectedBatch = admission?.admission_batch;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Admission Details
          </Typography>
          {admission && (
            <Chip
              label={statusConfig[admission.admission_status]?.label || admission.admission_status}
              size="small"
              color={statusConfig[admission.admission_status]?.color || 'default'}
              icon={<StatusIcon fontSize="small" />}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}
          >
            <CircularProgress size={36} />
          </Box>
        ) : !admission ? (
          <Typography variant="body2" color="text.secondary">
            No admission data available.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {/* ── Applicant Summary ──────────────────────────────────── */}
            {/* <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={admission.passport_photo || admission.image}
                  sx={{ width: 64, height: 64, border: '3px solid', borderColor: 'primary.main' }}
                >
                  {(admission.first_name || admission.fname)?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {fullName}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip label={`Form: ${admission.form_number}`} size="small" variant="outlined" />
                    <Chip label={admission?.class_code || admission.intending_class?.class_code || '—'} size="small" variant="outlined" />
                  </Stack>
                </Box>
              </Box>
            </Paper> */}

            {/* ── Application Form Details ──────────────────────────── */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Application Form Details
              </Typography>

              <Stack spacing={2}>
                {wardData && (
                  <WardReview
                    wardData={wardData}
                    intendingClass={
                      admission.intending_class?.class_code || admission.intending_class?.class_name
                    }
                    selectedBatch={selectedBatch}
                    academicData={academicData}
                  />
                )}

                <Divider />

                {academicData && (
                  <AcademicReview
                    academicData={academicData}
                    intendingClass={
                      admission.intending_class?.class_code || admission.intending_class?.class_name
                    }
                    selectedBatch={selectedBatch}
                  />
                )}

                <Divider />

                {documentsData && (
                  <DocumentsReview
                    documentsData={documentsData}
                    hasPreviousSchool={Boolean(admission.has_previous_school)}
                  />
                )}
              </Stack>
            </Box>

            {/* ── Parent/Guardian Information ────────────────────────── */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ mb: 2 }}
              >
                <PersonIcon fontSize="small" />
                Parent / Guardian Information
              </Typography>

              {parentData && (parentData.lname || parentData.fname || parentData.email) ? (
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
            </Box>

            {/* ── Admission Details ───────────────────────────────────── */}
            {admission.admission_status !== 'pending' && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Admission Details
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
                      value={
                        admission.prog_name ||
                        admission.intending_programme?.programme_name ||
                        admission.intending_programme?.programme_code ||
                        '—'
                      }
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

                {/* ── Admission Actions Info ────────────────────────── */}
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  {admission.treated_by && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircleIcon fontSize="small" color="success" />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Admitted by:</strong>{' '}
                        {admission.treated_by_name || admission.treated_by}
                        {admission.date_treated && (
                          <>
                            {' '}
                            on{' '}
                            {new Date(admission.date_treated).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </>
                        )}
                      </Typography>
                    </Box>
                  )}

                  {admission.rejected_by && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CancelIcon fontSize="small" color="error" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Declined by:</strong>{' '}
                          {admission.rejected_by_name || admission.rejected_by}
                        </Typography>
                        {admission.rejection_reason && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, fontStyle: 'italic' }}
                          >
                            <strong>Reason:</strong> {admission.rejection_reason}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {admission.revoked_by && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CancelIcon fontSize="small" color="warning" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Revoked by:</strong>{' '}
                          {admission.revoked_by_name || admission.revoked_by}
                        </Typography>
                        {admission.revoked_reason && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, fontStyle: 'italic' }}
                          >
                            <strong>Reason:</strong> {admission.revoked_reason}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* ── Admitted Student Details ──────────────────────── */}
                  {admission.admission_status === 'admitted' && admission.student_info && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'success.lighter',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'success.light',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color="success.dark"
                        sx={{ mb: 1.5 }}
                      >
                        Admitted Student Information
                      </Typography>
                      <Grid container spacing={2}>
                        {/* <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Student ID"
                            value={admission.student_info.student_registration_id || '—'}
                            slotProps={{ input: { readOnly: true } }}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Student Email"
                            value={admission.student_info.email || '—'}
                            slotProps={{ input: { readOnly: true } }}
                            size="small"
                          />
                        </Grid> */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            label="Admitted Class"
                            value={admission.student_info.class_name || '—'}
                            slotProps={{ input: { readOnly: true } }}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            label="Class Arm"
                            value={admission.student_info.class_arm || '—'}
                            slotProps={{ input: { readOnly: true } }}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            label="Admitted Programme"
                            value={admission.student_info.programme_name || '—'}
                            slotProps={{ input: { readOnly: true } }}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" size="small" onClick={handleClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAdmissionModal;
