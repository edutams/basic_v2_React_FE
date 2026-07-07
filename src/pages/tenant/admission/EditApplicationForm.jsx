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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import { getApplicantByFormNumber, updateApplicantForm } from '@/api/tenant/admission/admissionProcessingApi';
import { getAllStates, getLgasByState } from '@/api/tenant/admission/admissionApi';

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
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  const [form, setForm] = useState({
    fname: '',
    lname: '',
    mname: '',
    sex: '',
    dob: '',
    religion: '',
    lga_id: '',
    state_of_origin: '',
    study_mode: '',
    prev_school_name: '',
    prev_school_address: '',
    intending_class_id: '',
    admission_batch_id: '',
  });

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

        setForm({
          fname: data.fname || '',
          lname: data.lname || '',
          mname: data.mname || '',
          sex: data.sex || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          religion: data.religion || '',
          lga_id: data.lga_id || '',
          state_of_origin: data.state_id || '',
          study_mode: data.study_mode || '',
          prev_school_name: data.prev_school_name || '',
          prev_school_address: data.prev_school_address || '',
          intending_class_id: data.intending_class_id || '',
          admission_batch_id: data.batch_id || '',
        });

        // Load states
        const statesRes = await getAllStates();
        setStates(Array.isArray(statesRes) ? statesRes : []);

        // Load LGAs if state is set
        if (data.state_id) {
          const lgasRes = await getLgasByState(data.state_id);
          setLgas(Array.isArray(lgasRes) ? lgasRes : []);
        }
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

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setForm((prev) => ({ ...prev, state_of_origin: stateId, lga_id: '' }));
    if (stateId) {
      try {
        const res = await getLgasByState(stateId);
        setLgas(Array.isArray(res) ? res : []);
      } catch {
        setLgas([]);
      }
    } else {
      setLgas([]);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateApplicantForm({
        form_number,
        ...form,
      });
      notify.success('Application form updated successfully');
      navigate('/process-applications');
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update application form');
    } finally {
      setSaving(false);
    }
  };

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
          Edit Application — {form.lname} {form.fname}
        </Typography>
        <Button variant="contained" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/process-applications')}>
          Back
        </Button>
      </Box>

      <ParentCard title="Applicant Details">
        <Stack spacing={3}>
          {/* Personal Information */}
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Surname" size="small" value={form.lname} onChange={handleChange('lname')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="First Name" size="small" value={form.fname} onChange={handleChange('fname')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Middle Name" size="small" value={form.mname} onChange={handleChange('mname')} />
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
              <TextField fullWidth label="Date of Birth" size="small" type="date" value={form.dob} onChange={handleChange('dob')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Religion" size="small" value={form.religion} onChange={handleChange('religion')} />
            </Grid>
          </Grid>

          <Divider />

          {/* Location */}
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            Location
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>State of Origin</InputLabel>
                <Select value={form.state_of_origin} label="State of Origin" onChange={handleStateChange}>
                  <MenuItem value="">-- Select State --</MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.state_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" disabled={!form.state_of_origin}>
                <InputLabel>LGA</InputLabel>
                <Select value={form.lga_id} label="LGA" onChange={handleChange('lga_id')}>
                  <MenuItem value="">-- Select LGA --</MenuItem>
                  {lgas.map((l) => (
                    <MenuItem key={l.id} value={l.id}>{l.lga_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider />

          {/* Academic Information */}
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            Academic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Study Mode</InputLabel>
                <Select value={form.study_mode} label="Study Mode" onChange={handleChange('study_mode')}>
                  <MenuItem value="day">Day Student</MenuItem>
                  <MenuItem value="boarding">Boarding Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Previous School Name" size="small" value={form.prev_school_name} onChange={handleChange('prev_school_name')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Previous School Address" size="small" multiline rows={2} value={form.prev_school_address} onChange={handleChange('prev_school_address')} />
            </Grid>
          </Grid>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" size="small" color="inherit" onClick={() => navigate('/process-applications')}>
              Cancel
            </Button>
            <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Stack>
      </ParentCard>
    </PageContainer>
  );
};

export default EditApplicationForm;
