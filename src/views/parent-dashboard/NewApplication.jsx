import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Groups as GroupsIcon,
  Visibility as VisibilityIcon,
  MoreHoriz as MoreHorizIcon,
  ChangeCircleOutlined as ChangeIcon,
} from '@mui/icons-material';
import { IconSchool, IconCreditCard, IconFileText, IconSend } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Ward Detail', icon: GroupsIcon, isTabler: false },
  { label: 'Academic info', icon: IconSchool, isTabler: true },
  { label: 'Payment', icon: IconCreditCard, isTabler: true },
  { label: 'Documents', icon: IconFileText, isTabler: true },
  { label: 'Submit', icon: IconSend, isTabler: true },
];

const StepperBar = ({ activeStep }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      mb: 4,
      overflowX: 'auto',
      pb: 1,
    }}
  >
    {STEPS.map((step, i) => {
      const done = i < activeStep;
      const active = i === activeStep;
      const Icon = step.icon;

      return (
        <React.Fragment key={step.label}>
          {/* Step node */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.75,
              minWidth: 90,
              flexShrink: 0,
            }}
          >
            {/* Circle */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: active ? 'primary.main' : done ? 'primary.main' : 'grey.300',
                bgcolor: active ? 'primary.main' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {step.isTabler ? (
                <Icon size={20} color={active ? '#fff' : done ? '#1976d2' : '#9e9e9e'} />
              ) : (
                <Icon
                  sx={{
                    fontSize: 20,
                    color: active ? '#fff' : done ? 'primary.main' : 'grey.400',
                  }}
                />
              )}
            </Box>

            {/* Label */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>
                STEP {i + 1}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={active || done ? 700 : 400}
                color={active || done ? 'text.primary' : 'text.secondary'}
                display="block"
                lineHeight={1.3}
                mt={0.3}
              >
                {step.label}
              </Typography>
            </Box>
          </Box>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <Box
              sx={{
                flex: 1,
                height: 2,
                bgcolor: done ? 'primary.main' : 'grey.200',
                mb: 3.5,
                minWidth: 20,
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);

// ── Batch Summary Card ────────────────────────────────────────────────────────
const BatchSummaryCard = ({ batch, onChangeBatch }) => (
  <Paper
    sx={{
      borderRadius: 3,
      p: 3,
      position: 'sticky',
      top: 24,
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
      Selected Admission Batch Detail
    </Typography>

    <Typography variant="h6" fontWeight={800} mb={2}>
      {batch?.session_term ?? '2025/2026'} Admission Batch {batch?.batch_number ?? '2'}
    </Typography>

    {/* Classes */}
    <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2.5}>
      {(batch?.classes ?? ['JSS1', 'JSS2', 'JSS3']).map((cls) => (
        <Chip
          key={cls}
          label={cls}
          size="small"
          sx={{
            bgcolor: '#EEF2FF',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: 11,
          }}
        />
      ))}
    </Stack>

    <Divider sx={{ mb: 2 }} />

    {/* Fees */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#FFF5F5',
        borderRadius: 2,
        px: 2,
        py: 1.25,
        mb: 1.5,
      }}
    >
      <Typography variant="body2" color="error.main" fontWeight={500}>
        Pre-Application Payment
      </Typography>
      <Typography variant="body2" color="error.main" fontWeight={700}>
        ₦{(batch?.pre_application_fee ?? 5000).toLocaleString()}
      </Typography>
    </Box>

    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#FFF5F5',
        borderRadius: 2,
        px: 2,
        py: 1.25,
        mb: 2.5,
      }}
    >
      <Typography variant="body2" color="error.main" fontWeight={500}>
        Post-Admission Payment
      </Typography>
      <Typography variant="body2" color="error.main" fontWeight={700}>
        ₦{(batch?.post_admission_fee ?? 15000).toLocaleString()}
      </Typography>
    </Box>

    <Divider sx={{ mb: 2 }} />

    {/* Change batch button */}
    <Button
      fullWidth
      variant="outlined"
      startIcon={<VisibilityIcon />}
      onClick={onChangeBatch}
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        textTransform: 'none',
        borderColor: 'grey.300',
        color: 'text.primary',
        '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
      }}
    >
      Change your Admission Batch
    </Button>
  </Paper>
);

// ── Step 1: Ward Detail Form ──────────────────────────────────────────────────
const WardDetailStep = ({ onNext, onBack }) => {
  const [form, setForm] = useState({
    surname: '',
    first_name: '',
    other_name: '',
    dob: '',
    gender: '',
    state_of_origin: '',
    lga: '',
    home_address: '',
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Tell us about your ward
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" fontWeight={700} mb={2.5}>
        Basic information
      </Typography>

      <Grid container spacing={2.5}>
        {/* Surname */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Surname
          </Typography>
          <TextField
            name="surname"
            value={form.surname}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder=""
          />
        </Grid>

        {/* First name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            First name
          </Typography>
          <TextField
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Other name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Other name
          </Typography>
          <TextField
            name="other_name"
            value={form.other_name}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Date of Birth */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Date of Birth
          </Typography>
          <TextField
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        {/* Gender */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Select Gender
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              displayEmpty
              renderValue={(v) => v || 'Select Gender'}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* State of Origin */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            State of Origin
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              name="state_of_origin"
              value={form.state_of_origin}
              onChange={handleChange}
              displayEmpty
              renderValue={(v) => v || ''}
            >
              {[
                'Abia',
                'Adamawa',
                'Akwa Ibom',
                'Anambra',
                'Bauchi',
                'Bayelsa',
                'Benue',
                'Borno',
                'Cross River',
                'Delta',
                'Ebonyi',
                'Edo',
                'Ekiti',
                'Enugu',
                'FCT',
                'Gombe',
                'Imo',
                'Jigawa',
                'Kaduna',
                'Kano',
                'Katsina',
                'Kebbi',
                'Kogi',
                'Kwara',
                'Lagos',
                'Nasarawa',
                'Niger',
                'Ogun',
                'Ondo',
                'Osun',
                'Oyo',
                'Plateau',
                'Rivers',
                'Sokoto',
                'Taraba',
                'Yobe',
                'Zamfara',
              ].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* LGA */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            LGA of Origin
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              name="lga"
              value={form.lga}
              onChange={handleChange}
              displayEmpty
              renderValue={(v) => v || ''}
            >
              <MenuItem value="">— Select LGA —</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Home Address */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Home Address
          </Typography>
          <TextField
            name="home_address"
            value={form.home_address}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>

      {/* Footer actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            Back
          </Button>
        </Box>

        <Button
          variant="contained"
          onClick={onNext}
          sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}
        >
          Save and Continue
        </Button>
      </Box>
    </Box>
  );
};

// ── Placeholder steps ─────────────────────────────────────────────────────────
const PlaceholderStep = ({ label, onNext, onBack }) => (
  <Box>
    <Typography variant="h6" fontWeight={700} mb={0.5}>
      {label}
    </Typography>
    <Divider sx={{ mb: 3 }} />
    <Typography color="text.secondary">This step is coming soon.</Typography>

    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 4,
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        // sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        Back
      </Button>
      <Button
        variant="contained"
        onClick={onNext}
        // sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}
      >
        Save and Continue
      </Button>
    </Box>
  </Box>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const NewApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Batch passed from the dashboard modal via router state
  const batch = location.state?.batch ?? null;

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/dashboard');
    } else {
      setActiveStep((s) => s - 1);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <WardDetailStep onNext={handleNext} onBack={handleBack} />;
      case 1:
        return <PlaceholderStep label="Academic info" onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <PlaceholderStep label="Payment" onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <PlaceholderStep label="Documents" onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <PlaceholderStep label="Submit" onNext={handleNext} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <PageContainer title="New Application" description="Apply for admission">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GroupsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              New Application
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Session: {batch?.session_term ?? '2025/28'} &nbsp;·&nbsp; ₦
              {(batch?.pre_application_fee ?? 5000).toLocaleString()} Application Fee
            </Typography>
          </Box>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to dashboard
        </Button>
      </Box>

      {/* ── Stepper ── */}
      <StepperBar activeStep={activeStep} />

      {/* ── Content + Sidebar ── */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* Main form card */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3.5 } }}>{renderStep()}</Paper>
        </Grid>

        {/* Batch summary sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <BatchSummaryCard batch={batch} onChangeBatch={() => navigate('/dashboard')} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default NewApplication;
