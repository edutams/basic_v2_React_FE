import React, { useState, useEffect, useCallback } from 'react';
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
import { fetchAdmissionCodeFormat } from '@/api/tenant/admission/admissionApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import WardReview from '@/components/tenant/admission/review/WardReview';
import AcademicReview from '@/components/tenant/admission/review/AcademicReview';
import DocumentsReview from '@/components/tenant/admission/review/DocumentsReview';

const statusConfig = {
  admitted: { label: 'Admitted', color: 'success', icon: CheckCircleIcon },
  declined: { label: 'Declined', color: 'error', icon: CancelIcon },
  pending: { label: 'Pending', color: 'warning', icon: PendingIcon },
  revoked: { label: 'Revoked', color: 'error', icon: CancelIcon },
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

const readOnlyFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50',
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
};

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
  const [declineDialog, setDeclineDialog] = useState({ open: false, reason: '' });
  const [revokeDialog, setRevokeDialog] = useState({ open: false, reason: '' });
  // ── Admit form state (shown by default) ──
  const [admitForm, setAdmitForm] = useState({
    programmes: [],
    classes: [],
    classArms: [],
    selectedProgramme: '',
    selectedClass: '',
    selectedClassArm: '',
    admissionNumber: '',
    hasCodeFormat: false,
  });
  const [classTotalStudents, setClassTotalStudents] = useState(0);
  const [admitFormLoading, setAdmitFormLoading] = useState(false);

  // ── Admit confirmation dialog ──
  const [admitConfirmDialog, setAdmitConfirmDialog] = useState({ open: false });

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

  // ─── Load admit form data (programmes, code format) ────────────────
  const loadAdmitFormData = useCallback(async () => {
    setAdmitFormLoading(true);
    try {
      const [programmesRes, codeFormatRes] = await Promise.all([
        fetchProgrammes(),
        fetchAdmissionCodeFormat(),
      ]);
      const programmes = Array.isArray(programmesRes?.data) ? programmesRes.data : [];
      const hasCodeFormat = !!codeFormatRes?.data?.code_format;
      setAdmitForm((prev) => ({ ...prev, programmes, hasCodeFormat }));
    } catch (err) {
      console.error('Failed to load admit form data:', err);
    } finally {
      setAdmitFormLoading(false);
    }
  }, []);

  // ─── Load form data on mount ───────────────────────────────────────
  useEffect(() => {
    loadAdmitFormData();
  }, [loadAdmitFormData]);

  // ─── Refetch admission data from API ────────────────────────────────
  const refetchAdmission = useCallback(async () => {
    try {
      const response = await getApplicantByFormNumber(form_number);
      const data = response?.data ?? response;
      setAdmission(data);
      setNewStatus(data?.admission_status || 'pending');
      // Reload fresh form data after status change
      loadAdmitFormData();
    } catch (err) {
      console.error('Failed to refetch admission:', err);
    }
  }, [form_number, loadAdmitFormData]);

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
    ? [
        admission.surname || admission.lname,
        admission.first_name || admission.fname,
        admission.other_name || admission.mname,
      ]
        .filter(Boolean)
        .join(' ')
        .toUpperCase() || '—'
    : '';

  // ─── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer title="Process Application" description="Loading application details">
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
        >
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
  const parentFullName =
    [parentData.lname, parentData.fname, parentData.mname].filter(Boolean).join('  ') || '—';

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
      <Box
        sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.15) 100%)'
                : 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 100%)',
            borderRadius: '0 0 40px 40px',
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={1.5}
          mb={3}
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 2,
            pb: 0,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Process Application Form
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Review applicant details and manage admission status
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              borderColor: 'divider',
              '&:hover': { borderColor: 'primary.main', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)' },
            }}
          >
            Back to Processing
          </Button>
        </Box>

      {/* ── Applicant Summary Card ────────────────────────────────────── */}

      {/* ── Application Form Details ──────────────────────────────────── */}
      <ParentCard
        title="Application Form Details"
        sx={{
          position: 'relative',
          zIndex: 1,
          bgcolor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 2px 16px rgba(0,0,0,0.08)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
                : 'linear-gradient(90deg, #6366f1 0%, #7c3aed 100%)',
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Stack spacing={3}>
          <WardReview
            wardData={wardData}
            intendingClass={
              admission.intending_class?.class_code || admission.intending_class?.class_name
            }
            selectedBatch={selectedBatch}
            academicData={academicData}
          />

          <Divider />

          <AcademicReview
            academicData={academicData}
            intendingClass={
              admission.intending_class?.class_code || admission.intending_class?.class_name
            }
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
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          mt: 3,
          position: 'relative',
          zIndex: 1,
          bgcolor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 2px 16px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            bgcolor: 'primary.main',
            borderRadius: '3px 0 0 3px',
          },
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          display="flex"
          alignItems="center"
          gap={1}
          mb={2}
          sx={{ pl: 1 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon fontSize="small" sx={{ color: 'primary.dark' }} />
          </Box>
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
                sx={readOnlyFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Phone"
                value={parentData.phone || '—'}
                slotProps={{ input: { readOnly: true } }}
                size="small"
                sx={readOnlyFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Email"
                value={parentData.email || '—'}
                slotProps={{ input: { readOnly: true } }}
                size="small"
                sx={readOnlyFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent / Guardian Occupation"
                value={parentData.occupation || '—'}
                slotProps={{ input: { readOnly: true } }}
                size="small"
                sx={readOnlyFieldSx}
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
                sx={readOnlyFieldSx}
              />
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.100',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Parent / guardian information is not available for this applicant.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ── Treat Admission (Admission Officer) ────────────────────────── */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          mt: 3,
          position: 'relative',
          zIndex: 1,
          bgcolor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 2px 16px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            bgcolor: (theme) =>
              admission?.admission_status === 'admitted' ? 'success.main' : 'primary.main',
            borderRadius: '3px 0 0 3px',
          },
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          display="flex"
          alignItems="center"
          gap={1}
          mb={2}
          sx={{ pl: 1 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: (theme) =>
                admission?.admission_status === 'admitted'
                  ? 'success.light'
                  : 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={16} />
          </Box>
          Treat Admission (Admission Officer)
        </Typography>

        <Box
          sx={{
            px: 1,
            pt: 1,
            pb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
            Applicant Summary
          </Typography>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
          {admission.admission_status && (
            <Chip
              icon={React.createElement(statusConfig[admission.admission_status]?.icon || PendingIcon, { fontSize: 'small' })}
              label={statusConfig[admission.admission_status]?.label || admission.admission_status}
              size="small"
              color={statusConfig[admission.admission_status]?.color || 'default'}
              variant="filled"
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Grid container spacing={2} sx={{ mt: 0.5, mb: 0.5 }}>
          {admission.use_assessment === 'yes' && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Entrance Exam Score"
                  value={admission.entrance_exam_score ?? '—'}
                  slotProps={{
                    input: { readOnly: true },
                    inputLabel: { shrink: true },
                  }}
                  size="small"
                  sx={readOnlyFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Required Passmark"
                  value={admission.assessment_passmark ?? '—'}
                  slotProps={{
                    input: { readOnly: true },
                    inputLabel: { shrink: true },
                  }}
                  size="small"
                  sx={readOnlyFieldSx}
                />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Intended Class"
              value={admission?.class_code || '—'}
              slotProps={{
                input: { readOnly: true },
                inputLabel: { shrink: true },
              }}
              size="small"
              sx={readOnlyFieldSx}
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
              slotProps={{
                input: { readOnly: true },
                inputLabel: { shrink: true },
              }}
              size="small"
              sx={readOnlyFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Admission Batch"
              value={selectedBatch?.batch_name || admission.batchname || '—'}
              slotProps={{
                input: { readOnly: true },
                inputLabel: { shrink: true },
              }}
              size="small"
              sx={readOnlyFieldSx}
            />
          </Grid>
        </Grid>

        {/* ── Admit Section (always visible) ────────────────────────── */}
        <Box
          sx={{
            p: 3,
            mt: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(99,102,241,0.1)'
                : 'rgba(99,102,241,0.06)',
            borderRadius: 3,
            border: '2px solid',
            borderColor: (theme) =>
              admission.admission_status === 'admitted'
                ? theme.palette.mode === 'dark'
                  ? 'rgba(76,175,80,0.5)'
                  : 'rgba(76,175,80,0.5)'
                : theme.palette.mode === 'dark'
                  ? 'rgba(99,102,241,0.5)'
                  : 'rgba(99,102,241,0.35)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 2px 16px rgba(0,0,0,0.3)'
                : '0 2px 16px rgba(99,102,241,0.12)',
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color={admission.admission_status === 'admitted' ? 'success.main' : 'primary.main'}
            display="flex"
            alignItems="center"
            gap={1}
            mb={2}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: admission.admission_status === 'admitted' ? 'success.light' : 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCheck size={14} />
            </Box>
            {admission.admission_status === 'admitted'
              ? `${fullName} — Assigned Class Details`
              : `Admit ${fullName} — Select Class Assignment`}
          </Typography>

          <Stack spacing={2.5}>
            {/* ── Applicant Summary ── */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                bgcolor: 'background.paper',
                borderRadius: 2,
              }}
            >
              <Avatar
                src={admission.passport_photo || admission.image}
                sx={{ width: 40, height: 40 }}
              >
                {(admission.first_name || admission.fname)?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Form: {admission.form_number} | {admission?.class_code || '—'}
                </Typography>
              </Box>
            </Box>

            {/* ── Programme / Intended Class / Class Arm selectors ── */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                {admission.admission_status === 'admitted' ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="Assigned Programme"
                    value={
                      admission.student_info?.programme_name ||
                      admission.prog_name ||
                      '—'
                    }
                    slotProps={{ input: { readOnly: true } }}
                  />
                ) : (                    <FormControl fullWidth size="small">
                    <InputLabel>Programme *</InputLabel>
                    <Select
                      value={admitForm.selectedProgramme}
                      label="Programme *"
                      onChange={async (e) => {
                        const progId = e.target.value;
                        setAdmitForm((prev) => ({
                          ...prev,
                          selectedProgramme: progId,
                          selectedClass: '',
                          selectedClassArm: '',
                          classes: [],
                          classArms: [],
                        }));
                        setClassTotalStudents(0);
                        if (progId) {
                          try {
                            const classesRes = await fetchClassesByProgramme(progId);
                            const classes = Array.isArray(classesRes?.data) ? classesRes.data : [];
                            setAdmitForm((prev) => ({ ...prev, classes }));
                          } catch (err) {
                            notify.error('Failed to load classes');
                          }
                        }
                      }}
                    >
                      <MenuItem value="">-- Select Programme --</MenuItem>
                      {admitForm.programmes.map((prog) => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.programme_code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {admission.admission_status === 'admitted' ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="Assigned Class"
                    value={
                      admission.student_info?.class_name || admission.class_code || '—'
                    }
                    slotProps={{ input: { readOnly: true } }}
                  />
                ) : (
                  <FormControl fullWidth size="small">
                    <InputLabel>Class *</InputLabel>
                    <Select
                      value={admitForm.selectedClass}
                      label="Class *"
                      disabled={!admitForm.selectedProgramme}
                      onChange={async (e) => {
                        const classId = e.target.value;
                        setAdmitForm((prev) => ({
                          ...prev,
                          selectedClass: classId,
                          selectedClassArm: '',
                          classArms: [],
                        }));
                        setClassTotalStudents(0);
                        if (classId) {
                          try {
                            const armsRes = await fetchClassArmsByClass(classId);
                            const arms = Array.isArray(armsRes?.data) ? armsRes.data : [];
                            setAdmitForm((prev) => ({ ...prev, classArms: arms }));
                            setClassTotalStudents(armsRes?.class_total_students || 0);
                          } catch (err) {
                            notify.error('Failed to load class arms');
                          }
                        }
                      }}
                    >
                      <MenuItem value="">-- Select Class --</MenuItem>
                      {admitForm.classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.class_name || cls.class_code}
                          {cls.student_count !== undefined && ` (${cls.student_count})`}
                        </MenuItem>
                      ))}
                    </Select>
                    {classTotalStudents > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        Total registered: {classTotalStudents} student
                        {classTotalStudents !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </FormControl>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {admission.admission_status === 'admitted' ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="Assigned Class Arm"
                    value={admission.student_info?.class_arm || '—'}
                    slotProps={{ input: { readOnly: true } }}
                  />
                ) : (
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ mb: 1, display: 'block' }}
                    >
                      Select Class Arm *
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {admitFormLoading ? (
                        <CircularProgress size={20} sx={{ ml: 1 }} />
                      ) : admitForm.classArms.length > 0 ? (
                        admitForm.classArms.map((arm) => {
                          const isSelected = admitForm.selectedClassArm === arm.id;
                          return (
                            <Chip
                              key={arm.id}
                              label={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={isSelected ? 700 : 500}
                                  >
                                    {arm.arm_names}
                                  </Typography>
                                  {arm.student_count !== undefined && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: isSelected
                                          ? 'common.white'
                                          : 'text.secondary',
                                        opacity: 0.8,
                                      }}
                                    >
                                      ({arm.student_count})
                                    </Typography>
                                  )}
                                </Box>
                              }
                              variant={isSelected ? 'filled' : 'outlined'}
                              color={isSelected ? 'primary' : 'default'}
                              onClick={() =>
                                setAdmitForm((prev) => ({
                                  ...prev,
                                  selectedClassArm: arm.id,
                                }))
                              }
                              sx={{
                                cursor: 'pointer',
                                fontWeight: isSelected ? 700 : 500,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: isSelected ? 2 : 1,
                                },
                              }}
                            />
                          );
                        })
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ py: 1 }}
                        >
                          {admitForm.selectedProgramme
                            ? 'No class arms available'
                            : 'Select a programme first'}
                        </Typography>
                      )}
                    </Stack>
                  </>
                )}
              </Grid>
            </Grid>

            {/* ── Admission Number Field (only when NOT admitted and code format not set) ── */}
            {admission.admission_status !== 'admitted' && !admitForm.hasCodeFormat && (
              <TextField
                fullWidth
                size="small"
                label="Admission Number *"
                placeholder="Enter admission number for this student"
                value={admitForm.admissionNumber}
                onChange={(e) =>
                  setAdmitForm((prev) => ({ ...prev, admissionNumber: e.target.value }))
                }
                required
                helperText="No admission code format configured — enter manually"
              />
            )}

            {/* ── Action Buttons Row: Confirm Admission → Decline → Revoke ── */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Confirm Admission — only when NOT admitted */}
              {admission.admission_status !== 'admitted' && (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={18} />}
                  onClick={() => {
                    const {
                      selectedProgramme,
                      selectedClass,
                      selectedClassArm,
                      admissionNumber,
                      hasCodeFormat,
                    } = admitForm;

                    if (!selectedProgramme || !selectedClass || !selectedClassArm) {
                      notify.warning(
                        'Please select programme, class, and class arm',
                      );
                      return;
                    }

                    if (!hasCodeFormat && !admissionNumber.trim()) {
                      notify.warning('Please enter an admission number');
                      return;
                    }

                    setAdmitConfirmDialog({ open: true });
                  }}
                  disabled={submitting}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 2px 8px rgba(99,102,241,0.3)' },
                  }}
                >
                  {submitting ? 'Processing...' : 'Confirm Admission'}
                </Button>
              )}

              {/* Admitted chip — only when admitted */}
              {admission.admission_status === 'admitted' && (
                <Chip
                  icon={<CheckCircleIcon fontSize="small" />}
                  label="Admitted"
                  color="success"
                  variant="filled"
                  size="medium"
                  sx={{ fontWeight: 700, fontSize: '0.85rem', px: 1 }}
                />
              )}

              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<IconX size={18} />}
                onClick={() => setDeclineDialog({ open: true, reason: '' })}
                disabled={
                  (admission.admission_status !== 'pending' &&
                    admission.admission_status !== 'admitted') ||
                  submitting
                }
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 2px 8px rgba(211,47,47,0.3)' },
                }}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<IconX size={18} />}
                onClick={() => setRevokeDialog({ open: true, reason: '' })}
                disabled={
                  (admission.admission_status !== 'admitted' &&
                    admission.admission_status !== 'declined') ||
                  submitting
                }
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 2px 8px rgba(237,108,2,0.3)' },
                }}
              >
                Revoke
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* ── Status Action Details ──────────────────────────────────── */}
        {(admission.treated_by || admission.rejected_by || admission.revoked_by) && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 1.5,
                display: 'block',
              }}
            >
              Status Action History
            </Typography>

            {admission.treated_by && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1,
                  p: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                  borderRadius: 2,
                }}
              >
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
                  <PersonIcon fontSize="small" sx={{ color: 'primary.dark' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Treated by:</strong>{' '}
                    {admission.treated_by_name || admission.treated_by}
                  </Typography>
                  {admission.date_treated && (
                    <Typography variant="caption" color="text.disabled">
                      {new Date(admission.date_treated).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {admission.rejected_by && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  mb: 1,
                  p: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(211,47,47,0.12)' : 'rgba(211,47,47,0.08)',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: 'error.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CancelIcon fontSize="small" sx={{ color: 'error.dark' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Rejected by:</strong>{' '}
                    {admission.rejected_by_name || admission.rejected_by}
                  </Typography>
                  {admission.rejection_reason && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      <em>Reason: {admission.rejection_reason}</em>
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {admission.revoked_by && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  mb: 1,
                  p: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(237,108,2,0.12)' : 'rgba(237,108,2,0.08)',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CancelIcon fontSize="small" sx={{ color: 'warning.dark' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Revoked by:</strong>{' '}
                    {admission.revoked_by_name || admission.revoked_by}
                  </Typography>
                  {admission.revoked_reason && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      <em>Reason: {admission.revoked_reason}</em>
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* ── Admit Confirmation Dialog ──────────────────────────────────── */}
      <Dialog
        open={admitConfirmDialog.open}
        onClose={() => setAdmitConfirmDialog({ open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Admission</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to admit <strong>{fullName}</strong>?
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
                borderRadius: 2,
              }}
            >
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Programme:{' '}
                  <strong>
                    {admitForm.programmes.find((p) => p.id === admitForm.selectedProgramme)
                      ?.programme_code || '—'}
                  </strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Intended Class: <strong>{admission?.class_code || '—'}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Class Arm:{' '}
                  <strong>
                    {admitForm.classArms.find((a) => a.id === admitForm.selectedClassArm)
                      ?.arm_names || '—'}
                  </strong>
                </Typography>
                {!admitForm.hasCodeFormat && admitForm.admissionNumber && (
                  <Typography variant="caption" color="text.secondary">
                    Admission Number: <strong>{admitForm.admissionNumber}</strong>
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setAdmitConfirmDialog({ open: false })}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={async () => {
              setAdmitConfirmDialog({ open: false });
              setSubmitting(true);
              try {
                await updateAdmissionStatus(form_number, 'admitted', {
                  programme_id: admitForm.selectedProgramme,
                  class_id: admitForm.selectedClass,
                  class_arm_id: admitForm.selectedClassArm,
                  admission_number: admitForm.hasCodeFormat
                    ? null
                    : admitForm.admissionNumber.trim(),
                });
                notify.success('Application status updated to "Admitted"');
                await refetchAdmission();
              } catch (err) {
                notify.error(
                  err?.response?.data?.message || 'Failed to admit applicant',
                );
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            sx={{ fontWeight: 600 }}
          >
            {submitting ? 'Processing...' : 'Yes, Confirm Admission'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Decline Confirmation Dialog ────────────────────────────────── */}
      <Dialog
        open={declineDialog.open}
        onClose={() => setDeclineDialog({ open: false, reason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Decline Application</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to decline the application for <strong>{fullName}</strong>? This
              action will mark the application as declined.
            </Typography>
            <TextField
              fullWidth
              label="Rejection Reason"
              placeholder="Enter the reason for declining this application..."
              value={declineDialog.reason}
              onChange={(e) => setDeclineDialog((prev) => ({ ...prev, reason: e.target.value }))}
              multiline
              rows={3}
              size="small"
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setDeclineDialog({ open: false, reason: '' })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={async () => {
              const reason = declineDialog.reason.trim();
              if (!reason) {
                notify.error('Please enter a rejection reason');
                return;
              }
              setDeclineDialog({ open: false, reason: '' });
              setSubmitting(true);
              try {
                await updateAdmissionStatus(form_number, 'declined', { rejection_reason: reason });
                notify.success(`Application status updated to "Declined"`);
                await refetchAdmission();
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

      {/* ── Revoke Confirmation Dialog ──────────────────────────────────── */}
      <Dialog
        open={revokeDialog.open}
        onClose={() => setRevokeDialog({ open: false, reason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Revoke Admission</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to revoke the admission for <strong>{fullName}</strong>? This
              will undo the admission and clear the assigned class and programme.
            </Typography>
            <TextField
              fullWidth
              label="Revoke Reason"
              placeholder="Enter the reason for revoking this admission..."
              value={revokeDialog.reason}
              onChange={(e) => setRevokeDialog((prev) => ({ ...prev, reason: e.target.value }))}
              multiline
              rows={3}
              size="small"
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setRevokeDialog({ open: false, reason: '' })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={async () => {
              const reason = revokeDialog.reason.trim();
              if (!reason) {
                notify.error('Please enter a revocation reason');
                return;
              }
              setRevokeDialog({ open: false, reason: '' });
              setSubmitting(true);
              try {
                await updateAdmissionStatus(form_number, 'revoked', { revoked_reason: reason });
                notify.success(`Application status updated to "Revoked"`);
                await refetchAdmission();
              } catch (err) {
                notify.error(err?.response?.data?.message || 'Failed to revoke admission');
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            sx={{ fontWeight: 600 }}
          >
            {submitting ? 'Processing...' : 'Yes, Revoke'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Status Update Confirmation ────────────────────────────────── */}
      <Dialog open={confirmDialog.open} onClose={handleCancelConfirm} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Update Admission Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to change the admission status for <strong>{fullName}</strong> to{' '}
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
      </Box>
    </PageContainer>
  );
};

export default ProcessApplicationForm;
