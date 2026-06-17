import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Switch,
  Chip,
  Stack,
  Paper,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import AdmissionLetterEditor from '@/components/tenant/admission/setup/AdmissionLetterEditor';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import {
  createAdmissionBatch,
  updateAdmissionBatch,
  fetchAdmissionEntrySessionTerm,
} from '@/api/tenant/admission/admissionApi';

const CREATE_BCRUMB = [
  { to: '/', title: 'Home' },
  { to: '/admission-setup', title: 'Admission Setup' },
  { title: 'Create New Admission Batch' },
];

const EDIT_BCRUMB = [
  { to: '/', title: 'Home' },
  { to: '/admission-setup', title: 'Admission Setup' },
  { title: 'Edit Admission Batch' },
];

// Safely extract array from various API response shapes
const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

// ── Reusable styled Yes/No toggle (matches AcademicInfoForm style) ──
const YesNoToggle = ({ label, description, checked, onChange }) => (
  <Box
    sx={{
      p: 2,
      border: '1px solid',
      borderColor: checked ? 'primary.main' : 'divider',
      borderRadius: 2,
      bgcolor: checked ? 'primary.50' : 'background.paper',
      transition: 'all .2s ease',
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
      <Box>
        <Typography fontWeight={600} variant="subtitle2">
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          color={!checked ? 'text.primary' : 'text.secondary'}
          fontWeight={!checked ? 600 : 400}
        >
          No
        </Typography>

        <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} color="primary" />

        <Typography
          variant="body2"
          color={checked ? 'primary.main' : 'text.secondary'}
          fontWeight={checked ? 600 : 400}
        >
          Yes
        </Typography>
      </Box>
    </Box>
  </Box>
);

const CreateAdmissionBatch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const existingBatch = location.state?.batch ?? null;
  const sessionId =
    location.state?.sessionId ?? new URLSearchParams(location.search).get('sessionId');
  const sessionTermId =
    location.state?.sessionTermId ?? new URLSearchParams(location.search).get('sessionTermId');
  const sessionTermLabel = location.state?.sessionTermLabel ?? '';
  const isEdit = Boolean(existingBatch);

  // ─── Form state ────────────────────────────────────────────────────────────
  const [batchName, setBatchName] = useState(existingBatch?.batch_name ?? '');
  const [programmeId, setProgrammeId] = useState(existingBatch?.programme_id ?? '');
  const [selectedClassIds, setSelectedClassIds] = useState(existingBatch?.class_ids ?? []);

  const [entrySessionTermId, setEntrySessionTermId] = useState(
    existingBatch?.entry_session_term_id ?? sessionTermId ?? '',
  );

  const [closingDate, setClosingDate] = useState(
    existingBatch?.closing_date
      ? new Date(existingBatch.closing_date).toISOString().split('T')[0]
      : '',
  );
  const [entranceExam, setEntranceExam] = useState(existingBatch?.has_entrance_exam ?? false);
  const [examType, setExamType] = useState(existingBatch?.exam_type ?? 'CBT');
  const [examDate, setExamDate] = useState(
    existingBatch?.exam_date ? new Date(existingBatch.exam_date).toISOString().split('T')[0] : '',
  );
  const [passMark, setPassMark] = useState(existingBatch?.pass_mark ?? 1);

  const [enablePayment, setEnablePayment] = useState(existingBatch?.require_payment ?? false);
  const [preAppFee, setPreAppFee] = useState(existingBatch?.application_fee ?? '');
  const [postAppFee, setPostAppFee] = useState(existingBatch?.acceptance_fee ?? '');

  const [enableLetter, setEnableLetter] = useState(existingBatch?.enable_letter ?? false);
  const [letterContent, setLetterContent] = useState(
    existingBatch?.admission_letter_template ?? '',
  );

  const [isOpen, setIsOpen] = useState(existingBatch?.status !== 'close');

  // ─── API data state ─────────────────────────────────────────────────────────
  const [programmes, setProgrammes] = useState([]);
  const [programmesLoading, setProgrammesLoading] = useState(false);

  const [availableClasses, setAvailableClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const [entrySessionTermOptions, setEntrySessionTermOptions] = useState([]);
  const [currentSessionTermLabel, setCurrentSessionTermLabel] = useState(sessionTermLabel);

  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!batchName.trim()) newErrors.batchName = 'Batch name is required';
    if (!entrySessionTermId) newErrors.entrySessionTermId = 'Entry session term is required';

    if (entranceExam) {
      if (!examDate) newErrors.examDate = 'Exam date is required';
      if (!closingDate) newErrors.closingDate = 'Closing date is required';
      if (examType === 'CBT' && (!passMark || passMark < 0 || passMark > 100))
        newErrors.passMark = 'Pass mark must be between 0 and 100';
    }

    if (enablePayment) {
      if (!preAppFee || Number(preAppFee) < 0)
        newErrors.preAppFee = 'Pre-application fee must be 0 or greater';
      if (!postAppFee || Number(postAppFee) < 0)
        newErrors.postAppFee = 'Post-application fee must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Load programmes on mount ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setProgrammesLoading(true);
      try {
        const res = await fetchProgrammes();
        setProgrammes(extractList(res));
      } catch (err) {
        console.error('Failed to load programmes', err);
        showSnackbar('Failed to load programmes', 'error');
      } finally {
        setProgrammesLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!sessionTermId) return;
    const load = async () => {
      try {
        const res = await fetchAdmissionEntrySessionTerm(sessionTermId);
        const session_terms = extractList(res);
        setEntrySessionTermOptions(session_terms);

        if (session_terms.length > 0 && !currentSessionTermLabel) {
          setCurrentSessionTermLabel(session_terms[0].display_name);
        }

        if (!existingBatch && session_terms.length > 0) {
          setEntrySessionTermId(session_terms[0].session_term_id);
        }
      } catch (err) {
        console.error('Failed to load entry terms', err);
      }
    };
    load();
  }, [sessionTermId]);

  // ─── Load classes when programme changes ────────────────────────────────────
  useEffect(() => {
    if (!programmeId) {
      setAvailableClasses([]);
      if (!isEdit) setSelectedClassIds([]);
      return;
    }
    const load = async () => {
      setClassesLoading(true);
      try {
        const res = await fetchClassesByProgramme(programmeId);
        setAvailableClasses(extractList(res));
      } catch (err) {
        console.error('Failed to load classes', err);
        showSnackbar('Failed to load classes', 'error');
      } finally {
        setClassesLoading(false);
      }
    };
    load();
  }, [programmeId, isEdit]);

  // Derive selected class objects from IDs (for Autocomplete value)
  const selectedClassObjects = availableClasses.filter((c) => selectedClassIds.includes(c.id));

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form', 'error');
      return;
    }

    const payload = {
      session_term_id: sessionTermId,
      entry_session_term_id: entrySessionTermId || sessionTermId,
      batch_name: batchName.trim(),
      programme_id: programmeId || null,
      class_ids: selectedClassIds,
      has_entrance_exam: entranceExam,
      exam_type: entranceExam ? examType : null,
      exam_date: entranceExam ? examDate : null,
      closing_date: closingDate,
      pass_mark: entranceExam ? Number(passMark) : null,
      require_payment: enablePayment,
      application_fee: enablePayment ? Number(preAppFee) : 0,
      acceptance_fee: enablePayment ? Number(postAppFee) : 0,
      admission_letter_template: letterContent ?? null,
      status: isOpen ? 'open' : 'close',
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateAdmissionBatch(existingBatch.id, payload);
        showSnackbar('Admission batch updated successfully');
      } else {
        await createAdmissionBatch(payload);
        showSnackbar('Admission batch created successfully');
      }
      setTimeout(() => navigate('/admission-setup'), 1000);
    } catch (err) {
      console.error('Failed to save batch', err);

      if (err?.response?.data?.errors) {
        const backendErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          backendErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(backendErrors);
      }

      const msg = err?.response?.data?.message ?? `Failed to ${isEdit ? 'update' : 'create'} batch`;
      showSnackbar(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title={isEdit ? 'Edit Admission Batch' : 'Create New Admission Batch'}
      description="Set up a new admission batch"
    >
      <Breadcrumb
        title={isEdit ? 'Edit Admission Batch' : 'Create New Admission Batch'}
        subtitle={sessionTermLabel}
        items={isEdit ? EDIT_BCRUMB : CREATE_BCRUMB}
      />

      <Grid container spacing={3} alignItems="flex-start">
        {/* ── Left sidebar: settings ── */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ borderRadius: 2, p: 3 }}>
            <Stack spacing={3}>
              {/* Batch Name */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Batch Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Eg Batch3"
                  value={batchName}
                  onChange={(e) => {
                    setBatchName(e.target.value);
                    if (errors.batchName) setErrors((prev) => ({ ...prev, batchName: '' }));
                  }}
                  error={Boolean(errors.batchName)}
                  helperText={errors.batchName}
                />
              </Box>

              {/* Closing Date */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Closing Date
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={closingDate}
                  onChange={(e) => {
                    setClosingDate(e.target.value);
                    if (errors.closingDate) setErrors((prev) => ({ ...prev, closingDate: '' }));
                  }}
                  error={Boolean(errors.closingDate)}
                  helperText={errors.closingDate}
                />
              </Box>

              {/* Entry Term */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Entry Session Term
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={entrySessionTermId}
                  disabled={entrySessionTermOptions.length === 0}
                  onChange={(e) => setEntrySessionTermId(e.target.value)}
                  error={Boolean(errors.entrySessionTermId)}
                  helperText={errors.entrySessionTermId}
                >
                  {entrySessionTermOptions.length === 0 ? (
                    <MenuItem value="" disabled>
                      Loading...
                    </MenuItem>
                  ) : (
                    entrySessionTermOptions.map((st) => (
                      <MenuItem key={st.id} value={st.id}>
                        {st?.session?.sesname} {st?.display_term?.display_name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Programme
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={programmeId}
                    disabled={programmesLoading}
                    onChange={(e) => {
                      const newProgrammeId = e.target.value;
                      setProgrammeId(newProgrammeId);
                      if (!isEdit || (isEdit && newProgrammeId !== existingBatch?.programme_id)) {
                        setSelectedClassIds([]);
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      {programmesLoading ? 'Loading…' : 'Select programme'}
                    </MenuItem>
                    {programmes.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.programme_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Classes
                  </Typography>
                  <Autocomplete
                    multiple
                    id="class-multiselect"
                    options={availableClasses}
                    value={selectedClassObjects}
                    loading={classesLoading}
                    disabled={!programmeId || classesLoading}
                    getOptionLabel={(option) => {
                      const classCode = option.class_code || option.class_name || '';
                      const arms = option.arm_names || option.arms || '';
                      return arms ? `${classCode} (${arms})` : classCode;
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, newValue) => {
                      setSelectedClassIds(newValue.map((c) => c.id));
                    }}
                    filterSelectedOptions
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          key={option.id}
                          label={
                            option.arm_names
                              ? `${option.class_code} (${option.arm_names})`
                              : option.class_code || option.class_name
                          }
                          size="small"
                          {...getTagProps({ index })}
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder={
                          classesLoading
                            ? 'Loading classes…'
                            : !programmeId
                              ? 'Select a programme first'
                              : 'Select classes'
                        }
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider />

              {/* Entrance Exam — Yes/No toggle */}
              <YesNoToggle
                label="Entrance Exam"
                description="Require an entrance exam for this batch"
                checked={entranceExam}
                onChange={setEntranceExam}
              />

              {entranceExam && (
                <Box mt={-1}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Select CBT or Physical
                  </Typography>
                  <ToggleButtonGroup
                    value={examType}
                    exclusive
                    size="small"
                    sx={{ mb: 2, width: '100%' }}
                    onChange={(_, val) => val && setExamType(val)}
                  >
                    <ToggleButton value="CBT" sx={{ fontWeight: 700, flex: 1 }}>
                      CBT
                    </ToggleButton>
                    <ToggleButton value="Physical" sx={{ fontWeight: 700, flex: 1 }}>
                      Physical
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Set Date
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    {examType === 'CBT' && (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={0.5}
                        >
                          Pass Mark
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={passMark}
                          onChange={(e) => setPassMark(e.target.value)}
                          inputProps={{ min: 0, max: 100 }}
                          error={Boolean(errors.passMark)}
                          helperText={errors.passMark}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              <Divider />

              {/* Enable Payment — Yes/No toggle */}
              <YesNoToggle
                label="Enable Payment"
                description="Require applicants to pay fees"
                checked={enablePayment}
                onChange={setEnablePayment}
              />

              {enablePayment && (
                <Stack spacing={2} mt={-1}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block" mb={0.75}>
                      Pre-Application
                    </Typography>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip
                        label="Application Form"
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                      <Chip
                        label="Registration Fee"
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      placeholder="0"
                      value={preAppFee}
                      onChange={(e) => setPreAppFee(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                        },
                      }}
                      inputProps={{ min: 0 }}
                      error={Boolean(errors.preAppFee)}
                      helperText={errors.preAppFee}
                    />
                    {preAppFee > 0 && (
                      <Typography
                        variant="caption"
                        color="error.main"
                        fontWeight={600}
                        mt={0.5}
                        display="block"
                      >
                        Pre-Application : ₦{Number(preAppFee).toLocaleString()}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={700} display="block" mb={0.75}>
                      Post-Application
                    </Typography>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip
                        label="Application Form"
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                      <Chip
                        label="Registration Fee"
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      placeholder="0"
                      value={postAppFee}
                      onChange={(e) => setPostAppFee(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                        },
                      }}
                      inputProps={{ min: 0 }}
                      error={Boolean(errors.postAppFee)}
                      helperText={errors.postAppFee}
                    />
                    {postAppFee > 0 && (
                      <Typography
                        variant="caption"
                        color="error.main"
                        fontWeight={600}
                        mt={0.5}
                        display="block"
                      >
                        Post-Application : ₦{Number(postAppFee).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              )}

              <Divider />

              {/* Status — Yes/No toggle */}
              <YesNoToggle
                label="Status"
                description="Open the batch for applications"
                checked={isOpen}
                onChange={setIsOpen}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* ── Right: Letter Editor ── */}
        <Grid size={{ xs: 12, md: 9 }}>
          <AdmissionLetterEditor
            key={existingBatch?.id ?? 'new'}
            onChange={setLetterContent}
            initialContent={existingBatch?.admission_letter_template ?? ''}
          />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              size="large"
              onClick={() => navigate('/admission-setup')}
              sx={{ fontWeight: 700, px: 3, mr: 2 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ fontWeight: 700, px: 4 }}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {submitting
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                  ? 'Save Changes'
                  : 'Create New Admission'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default CreateAdmissionBatch;
