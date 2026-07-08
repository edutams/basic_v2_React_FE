import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Divider,
  Switch,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import { getApplicantByFormNumber, updateApplicantForm } from '@/api/tenant/admission/admissionProcessingApi';
import { getAllStates, getLgasByState, getOpenBatches } from '@/api/tenant/admission/admissionApi';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/process-applications', title: 'Admission Processing' },
  { title: 'Edit Application Form' },
];

const EditApplicationForm = () => {
  const { form_number } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admission, setAdmission] = useState(null);

  // States & LGAs
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [prevSchoolLgas, setPrevSchoolLgas] = useState([]);
  const [batchClasses, setBatchClasses] = useState([]);
  const [batchProgramme, setBatchProgramme] = useState(null);

  const [form, setForm] = useState({
    // Personal
    lname: '',
    fname: '',
    mname: '',
    sex: '',
    dob: '',
    religion: '',
    home_address: '',

    // Location
    state_of_origin: '',
    lga_id: '',

    // Academic
    has_previous_school: false,
    prev_school_name: '',
    prev_school_state: '',
    prev_school_lga: '',
    prev_school_address: '',
    previous_class: '',
    intending_class_id: '',
    study_mode: '',

    // Parent / Guardian
    parent_lname: '',
    parent_fname: '',
    parent_mname: '',
    parent_phone: '',
    parent_email: '',
    parent_occupation: '',
    parent_address: '',
  });

  // ─── Load data on mount ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!form_number) {
        notify.error('No form number provided');
        navigate('/process-applications');
        return;
      }
      setLoading(true);
      try {
        // 1. Fetch applicant
        const res = await getApplicantByFormNumber(form_number);
        const data = res?.data ?? res;
        setAdmission(data);

        // 2. Fetch states
        const statesRes = await getAllStates();
        const statesData = Array.isArray(statesRes) ? statesRes : [];
        setStates(statesData);

        // 3. Determine state ID from admission data
        //    Priority: state_of_origin → lga?.state_id → state_id
        const stateId =
          data.state_of_origin ||
          data.lga?.state_id ||
          data.state_id ||
          '';

        // 4. Load LGAs for the student's state if present
        if (stateId) {
          try {
            const lgasRes = await getLgasByState(stateId);
            setLgas(Array.isArray(lgasRes) ? lgasRes : []);
          } catch {
            setLgas([]);
          }
        }

        // 5. Load LGAs for previous school state if present
        if (data.prev_school_state) {
          try {
            const prevLgasRes = await getLgasByState(data.prev_school_state);
            setPrevSchoolLgas(Array.isArray(prevLgasRes) ? prevLgasRes : []);
          } catch {
            setPrevSchoolLgas([]);
          }
        }

        // 6. Extract batch and class info
        const batch = data.admission_batch;
        if (batch?.classes && batch.classes.length > 0) {
          setBatchClasses(batch.classes);
          setBatchProgramme(batch.programme || null);
        } else if (batch) {
          // Batch exists but no classes — try fetching open batches to get full data
          try {
            const batchRes = await getOpenBatches();
            const allBatches = batchRes?.data?.data || batchRes?.data || [];
            const matched = allBatches.find(
              (b) => b.id === (data.admission_batch_id || data.batch_id || batch.id)
            );
            if (matched) {
              setBatchClasses(matched.classes || []);
              setBatchProgramme(matched.programme || null);
            }
          } catch {
            // Silently fail — batch classes just won't be editable
          }
        }

        // 7. Populate form
        setForm({
          lname: data.lname || data.surname || '',
          fname: data.fname || data.first_name || '',
          mname: data.mname || data.other_name || '',
          sex: data.sex || data.gender || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          religion: data.religion || '',
          home_address: data.home_address || '',

          state_of_origin: stateId,
          lga_id: data.lga_id || '',

          has_previous_school: data.has_previous_school === true || data.has_previous_school === 1 || data.has_previous_school === '1',
          prev_school_name: data.prev_school_name || '',
          prev_school_state: data.prev_school_state || '',
          prev_school_lga: data.prev_school_lga || '',
          prev_school_address: data.prev_school_address || '',
          previous_class: data.previous_class || '',
          intending_class_id: data.intending_class_id
            ? String(data.intending_class_id)
            : '',
          study_mode: data.study_mode || '',

          parent_lname: data.parent?.lname || '',
          parent_fname: data.parent?.fname || '',
          parent_mname: data.parent?.mname || '',
          parent_phone: data.parent?.phone || '',
          parent_email: data.parent?.email || '',
          parent_occupation: data.parent?.occupation || '',
          parent_address: data.parent?.address || '',
        });
      } catch (err) {
        console.error('Failed to load applicant:', err);
        notify.error('Failed to load applicant details');
        navigate('/process-applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form_number]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setForm((prev) => ({ ...prev, state_of_origin: stateId, lga_id: '' }));
    setLgas([]);
    if (stateId) {
      try {
        const res = await getLgasByState(stateId);
        setLgas(Array.isArray(res) ? res : []);
      } catch {
        setLgas([]);
      }
    }
  };

  const handlePrevSchoolStateChange = async (e) => {
    const stateId = e.target.value;
    setForm((prev) => ({ ...prev, prev_school_state: stateId, prev_school_lga: '' }));
    setPrevSchoolLgas([]);
    if (stateId) {
      try {
        const res = await getLgasByState(stateId);
        setPrevSchoolLgas(Array.isArray(res) ? res : []);
      } catch {
        setPrevSchoolLgas([]);
      }
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Build payload — flat fields for the backend
      const payload = {
        form_number,
        lname: form.lname,
        fname: form.fname,
        mname: form.mname,
        sex: form.sex,
        dob: form.dob,
        religion: form.religion,
        home_address: form.home_address,
        state_of_origin: form.state_of_origin,
        lga_id: form.lga_id,
        has_previous_school: form.has_previous_school ? 1 : 0,
        prev_school_name: form.prev_school_name,
        prev_school_state: form.prev_school_state,
        prev_school_lga: form.prev_school_lga,
        prev_school_address: form.prev_school_address,
        previous_class: form.previous_class,
        intending_class_id: form.intending_class_id,
        intending_programme_id: batchProgramme?.id || admission?.intending_programme_id || admission?.intending_programme?.id || '',
        study_mode: form.study_mode,
        parent_lname: form.parent_lname,
        parent_fname: form.parent_fname,
        parent_mname: form.parent_mname,
        parent_phone: form.parent_phone,
        parent_email: form.parent_email,
        parent_occupation: form.parent_occupation,
        parent_address: form.parent_address,
      };

      await updateApplicantForm(payload);
      notify.success('Application form updated successfully');
      navigate('/process-applications');
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update application form');
    } finally {
      setSaving(false);
    }
  };

  // ─── Computed values ─────────────────────────────────────────────────
  const fullName = [form.lname, form.fname, form.mname].filter(Boolean).join(' ').toUpperCase() || '—';

  // ─── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer title="Edit Application Form" description="Editing application">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={36} />
        </Box>
      </PageContainer>
    );
  }

  if (!admission) {
    return (
      <PageContainer title="Edit Application Form" description="Application not found">
        <Alert severity="error">Application not found.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Edit Application Form" description="Edit applicant's application details">
      <Breadcrumb title="Edit Application Form" items={BCrumb} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Edit Application — {fullName}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/process-applications')}
        >
          Back
        </Button>
      </Box>

      <ParentCard title="Applicant Details">
        <Stack spacing={3}>
          {/* ════════════════════════════════════════════════════════════════
              SECTION 1 — Personal Information
              ════════════════════════════════════════════════════════════════ */}
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Surname"
                size="small"
                value={form.lname}
                onChange={handleChange('lname')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="First Name"
                size="small"
                value={form.fname}
                onChange={handleChange('fname')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Middle Name"
                size="small"
                value={form.mname}
                onChange={handleChange('mname')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select value={form.sex} label="Gender" onChange={handleChange('sex')}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                size="small"
                type="date"
                value={form.dob}
                onChange={handleChange('dob')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Religion"
                size="small"
                value={form.religion}
                onChange={handleChange('religion')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Home Address"
                size="small"
                multiline
                rows={2}
                value={form.home_address}
                onChange={handleChange('home_address')}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* ════════════════════════════════════════════════════════════════
              SECTION 2 — Location
              ════════════════════════════════════════════════════════════════ */}
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            Location
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>State of Origin</InputLabel>
                <Select
                  value={form.state_of_origin}
                  label="State of Origin"
                  onChange={handleStateChange}
                >
                  <MenuItem value="">-- Select State --</MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.state_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" disabled={!form.state_of_origin}>
                <InputLabel>LGA</InputLabel>
                <Select
                  value={form.lga_id}
                  label="LGA"
                  onChange={handleChange('lga_id')}
                >
                  <MenuItem value="">-- Select LGA --</MenuItem>
                  {lgas.map((l) => (
                    <MenuItem key={l.id} value={l.id}>
                      {l.lga_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider />

          {/* ════════════════════════════════════════════════════════════════
              SECTION 3 — Academic Information
              ════════════════════════════════════════════════════════════════ */}
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            Academic Information
          </Typography>

          {/* Previous School Toggle */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: form.has_previous_school ? 'primary.50' : 'background.paper',
              transition: 'all .2s ease',
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography fontWeight={600}>Previous School Information</Typography>
                <Typography variant="body2" color="text.secondary">
                  Has this applicant attended another school before?
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  color={!form.has_previous_school ? 'text.primary' : 'text.secondary'}
                  fontWeight={!form.has_previous_school ? 600 : 400}
                >
                  No
                </Typography>
                <Switch
                  checked={form.has_previous_school}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, has_previous_school: e.target.checked }))
                  }
                />
                <Typography
                  variant="body2"
                  color={form.has_previous_school ? 'primary.main' : 'text.secondary'}
                  fontWeight={form.has_previous_school ? 600 : 400}
                >
                  Yes
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Previous School Fields (conditional) */}
          {form.has_previous_school && (
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Previous School Name"
                  size="small"
                  value={form.prev_school_name}
                  onChange={handleChange('prev_school_name')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Previous School State</InputLabel>
                  <Select
                    value={form.prev_school_state}
                    label="Previous School State"
                    onChange={handlePrevSchoolStateChange}
                  >
                    <MenuItem value="">-- Select State --</MenuItem>
                    {states.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.state_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" disabled={!form.prev_school_state}>
                  <InputLabel>Previous School LGA</InputLabel>
                  <Select
                    value={form.prev_school_lga}
                    label="Previous School LGA"
                    onChange={handleChange('prev_school_lga')}
                  >
                    <MenuItem value="">-- Select LGA --</MenuItem>
                    {prevSchoolLgas.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.lga_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Previous Class"
                  size="small"
                  value={form.previous_class}
                  onChange={handleChange('previous_class')}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Previous School Address"
                  size="small"
                  multiline
                  rows={2}
                  value={form.prev_school_address}
                  onChange={handleChange('prev_school_address')}
                />
              </Grid>
            </Grid>
          )}

          {!form.has_previous_school && <Divider />}

          {/* Intending Class & Study Mode */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Programme"
                size="small"
                value={
                  batchProgramme?.programme_name ||
                  batchProgramme?.programme_code ||
                  admission?.prog_name ||
                  admission?.intending_programme?.programme_name ||
                  admission?.intending_programme?.programme_code ||
                  '—'
                }
                slotProps={{ input: { readOnly: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Intending Class</InputLabel>
                <Select
                  value={form.intending_class_id}
                  label="Intending Class"
                  onChange={handleChange('intending_class_id')}
                >
                  <MenuItem value="">-- Select Class --</MenuItem>
                  {batchClasses.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.class_code || c.class_name}
                    </MenuItem>
                  ))}
                  {/* If no batch classes loaded, show current class as fallback */}
                  {batchClasses.length === 0 && admission?.intending_class && (
                    <MenuItem
                      value={String(admission.intending_class.id)}
                    >
                      {admission.intending_class.class_code || admission.intending_class.class_name}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Boarding Status</InputLabel>
                <Select
                  value={form.study_mode}
                  label="Boarding Status"
                  onChange={handleChange('study_mode')}
                >
                  <MenuItem value="day">Day Student</MenuItem>
                  <MenuItem value="boarding">Boarding Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {batchClasses.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Available Classes:
                  </Typography>
                  {batchClasses.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.class_code || c.class_name}
                      size="small"
                      variant={form.intending_class_id === String(c.id) ? 'filled' : 'outlined'}
                      color={form.intending_class_id === String(c.id) ? 'primary' : 'default'}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, intending_class_id: String(c.id) }))
                      }
                      sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 11 }}
                    />
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>

          <Divider />

          {/* ════════════════════════════════════════════════════════════════
              SECTION 4 — Parent / Guardian Information
              ════════════════════════════════════════════════════════════════ */}
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="primary.main"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <PersonIcon fontSize="small" />
            Parent / Guardian Information
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Parent Surname"
                size="small"
                value={form.parent_lname}
                onChange={handleChange('parent_lname')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Parent First Name"
                size="small"
                value={form.parent_fname}
                onChange={handleChange('parent_fname')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Parent Middle Name"
                size="small"
                value={form.parent_mname}
                onChange={handleChange('parent_mname')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent Phone"
                size="small"
                value={form.parent_phone}
                onChange={handleChange('parent_phone')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent Email"
                size="small"
                type="email"
                value={form.parent_email}
                onChange={handleChange('parent_email')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent Occupation"
                size="small"
                value={form.parent_occupation}
                onChange={handleChange('parent_occupation')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Parent Address"
                size="small"
                multiline
                rows={2}
                value={form.parent_address}
                onChange={handleChange('parent_address')}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* ════════════════════════════════════════════════════════════════
              Footer Actions
              ════════════════════════════════════════════════════════════════ */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              color="inherit"
              onClick={() => navigate('/process-applications')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Stack>
      </ParentCard>
    </PageContainer>
  );
};

export default EditApplicationForm;
