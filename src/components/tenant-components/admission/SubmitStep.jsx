import {
  Box,
  Button,
  Typography,
  Divider,
  Paper,
  Grid,
  Chip,
  Stack,
  Link,
  Avatar,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

// ── Quick Jump sidebar ────────────────────────────────────────────────────────
const JUMP_LINKS = ['Ward Detail', 'Academic Info', 'Payment', 'Documents', 'Submit'];

const QuickJump = () => (
  <Box sx={{ position: 'sticky', top: 24 }}>
    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
      Quick jump
    </Typography>
    <Stack spacing={0.5}>
      {JUMP_LINKS.map((s) => (
        <Link
          key={s}
          href={`#section-${s.toLowerCase().replace(' ', '-')}`}
          underline="hover"
          variant="caption"
          color="primary.main"
          sx={{ fontWeight: 500 }}
        >
          · {s}
        </Link>
      ))}
    </Stack>
  </Box>
);

// ── Read-only field — same MUI TextField as WardDetailForm, just not editable ─
const ReadField = ({ label, value }) => (
  <TextField
    label={label}
    value={value ?? ''}
    fullWidth
    slotProps={{ input: { readOnly: true } }}
    sx={{ '& .MuiInputBase-input': { cursor: 'default' } }}
  />
);

// ── Read-only multiline textarea ──────────────────────────────────────────────
const ReadTextarea = ({ label, value }) => (
  <TextField
    label={label}
    value={value ?? ''}
    fullWidth
    multiline
    rows={3}
    slotProps={{ input: { readOnly: true } }}
    sx={{ '& .MuiInputBase-input': { cursor: 'default' } }}
  />
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ number, title, subtitle, id, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, mb: 2 }} id={id}>
    <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {number}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {children}
  </Paper>
);

// ── Receipt row ───────────────────────────────────────────────────────────────
const ReceiptRow = ({ label, amount, bold }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Typography
      variant="body2"
      color={bold ? 'text.primary' : 'text.secondary'}
      fontWeight={bold ? 700 : 400}
    >
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={bold ? 700 : 500}>
      {amount}
    </Typography>
  </Box>
);

// ── Document row ──────────────────────────────────────────────────────────────
const DocRow = ({ label, filename, required }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FileIcon sx={{ color: 'primary.main', fontSize: 18 }} />
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {label}
          {required && (
            <Typography component="span" color="error.main" ml={0.5}>
              *
            </Typography>
          )}
        </Typography>
        {filename && (
          <Typography variant="caption" color="text.secondary">
            {filename}
          </Typography>
        )}
      </Box>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        label="Uploaded"
        size="small"
        sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 11 }}
      />

      <Button
        size="small"
        startIcon={<VisibilityIcon />}
        variant="outlined"
        sx={{
          fontSize: 11,
        }}
      >
        View
      </Button>
    </Box>
  </Box>
);

// ── Main step ─────────────────────────────────────────────────────────────────
const SubmitStep = ({
  wardData,
  academicData,
  documentsData,
  selectedBatch,
  onBack,
  onSubmit,
  isLoading = false,
}) => {
  const applicantName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : 'Queensley Skoolpay Ademola';

  const intendingClass = 'JSS 1 — Diamond';
  const admissionBatch = selectedBatch
    ? `${selectedBatch.session_term} Batch ${selectedBatch.batch_number ?? '2'}`
    : '2025/2026 Batch 2';
  const totalPaid = '₦25,500';

  return (
    <Grid container spacing={3} alignItems="flex-start">
      {/* ── Main content ── */}
      <Grid size={{ xs: 12, md: 9 }}>
        {/* 1 — Ward Detail */}
        <Section
          number={1}
          title="Tell us about your ward"
          subtitle="Basic information"
          id="section-ward-detail"
        >
          {/* Avatar */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box sx={{ position: 'relative', mb: 1 }}>
              {/* <Avatar sx={{ width: 72, height: 72, bgcolor: 'grey.300', fontSize: 28 }}>
                {wardData?.surname?.[0] ?? 'Q'}
              </Avatar> */}
              <Avatar
                src={wardData?.imageUrl} 
                sx={{ width: 72, height: 72, bgcolor: 'grey.300' }}
              >
                {!wardData?.imageUrl && <PersonIcon sx={{ color: '#000', fontSize: 40 }} />}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 12, color: '#fff' }} />
              </Box>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {applicantName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Intending Class : {intendingClass}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="Surname" value={wardData?.surname} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="First Name" value={wardData?.first_name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="Other Name" value={wardData?.other_name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="Date of Birth" value={wardData?.dob} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="Select Gender" value={wardData?.gender} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="State of Origin" value={wardData?.state_of_origin} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="LGA of Origin" value={wardData?.lga} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReadField label="Home Address" value={wardData?.home_address} />
            </Grid>
          </Grid>
        </Section>

        {/* 2 — Academic Information */}
        <Section number={2} title="Academic Information" id="section-academic-info">
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Previous school information
          </Typography>

          {/* Previous school textarea */}
          <Box sx={{ mb: 2 }}>
            <ReadTextarea
              label=""
              value={
                academicData?.has_previous_school && academicData?.previous_school_name
                  ? `${academicData.previous_school_name}, ${academicData.previous_school_state} — attended. Graduated with overall position 3rd out of 48 pupils.`
                  : ''
              }
            />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="Previous school name" value={academicData?.previous_school_name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="Last Class" value={academicData?.previous_class} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="Position" value="3rd" />
            </Grid>
          </Grid>

          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Intending Class
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="Intending Class" value={intendingClass} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField
                label="Programme Class Choice"
                value="Junior Secondary — JSS 1 — Diamond Arm | Science-Inclined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField
                label="Boarding Status"
                value={
                  academicData?.boarding_status === 'day'
                    ? 'Day Student - Resumes 7:30 AM, closes 3:45 PM (School b...'
                    : (academicData?.boarding_status ?? 'Day Student')
                }
              />
            </Grid>
          </Grid>
        </Section>

        {/* 3 — Payment Receipt */}
        <Section
          number={3}
          title="Payment Receipt"
          subtitle="Confirmation of admission application payment"
          id="section-payment"
        >
          <Box>
            {/* Receipt header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              p={2}
              sx={{ bgcolor: 'success.light' }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    Payment Receipt
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Admission Application Payment Breakdown
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  startIcon={<PrintIcon />}
                  variant="outlined"
                  sx={{
                    fontSize: 11,
                    color: 'success.dark',
                    border: '1px solid',
                    borderColor: 'success.main',

                    ':hover': {
                      bgcolor: 'success.main',
                      color: '#fff',
                    },
                  }}
                >
                  Print
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  sx={{
                    fontSize: 11,
                    color: 'success.dark',
                    border: '1px solid',
                    borderColor: 'success.main',

                    ':hover': {
                      bgcolor: 'success.main',
                      color: '#fff',
                    },
                  }}
                >
                  Download
                </Button>
              </Box>
            </Box>

            <Box variant="outlined" sx={{ p: 2, bgcolor: '#f2fcf7ff' }}>
              {/* Receipt meta */}
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { label: 'RECEIPT NO', value: 'SKRC-2025-00491' },
                  { label: 'DATE PAID', value: '04 May 2025, 11:24 AM' },
                  { label: 'REFERENCE', value: 'TRX-29273645' },
                  { label: 'PAYER', value: 'Mrs. Adetola Ademola' },
                  { label: 'METHOD', value: 'Bank Transfer - Globus Bank' },
                ].map(({ label, value }) => (
                  <Grid key={label} size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {value}
                    </Typography>
                  </Grid>
                ))}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    STATUS
                  </Typography>
                  <Chip
                    label="Successful"
                    size="small"
                    sx={{
                      bgcolor: '#E8F5E9',
                      color: 'success.dark',
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 1 }} />

              {/* Fee rows */}
              <Box sx={{ mb: 0.5 }}>
                <Box display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    DESCRIPTION
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    AMOUNT
                  </Typography>
                </Box>
                {[
                  { label: 'Application Form Fee', amount: '₦15,000' },
                  { label: 'Registration Fee', amount: '₦500' },
                  { label: 'Processing Fee', amount: '₦5,000' },
                  { label: 'Entrance Examination Fee', amount: '₦1,000' },
                  { label: 'Administrative Charges', amount: '₦1,000' },
                  { label: 'ICT/Portal Access Fee', amount: '₦2,000' },
                  { label: 'Bank Charge', amount: '₦500' },
                ].map((r) => (
                  <ReceiptRow key={r.label} {...r} />
                ))}
              </Box>

              <Box display="flex" justifyContent="space-between" sx={{ pt: 1.5 }}>
                <Typography variant="body2" fontWeight={700}>
                  Total Paid
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {totalPaid}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={1.5}
                textAlign="center"
              >
                Powered by Skoolpay · This is a computer generated receipt
              </Typography>
            </Box>
          </Box>
        </Section>

        {/* 4 — Documents */}
        <Section
          number={4}
          title="Upload required documents"
          subtitle="PDF, JPG or PNG. Max 5MB each."
          id="section-documents"
        >
          <DocRow label="Birth certificate" filename="queensley_2019_birth.pdf" required />
          <DocRow label="Previous school report" filename="all_report_2025.pdf" required />
          <DocRow label="Passport photo" filename="passport.png" required />
          <DocRow label="Medical record" filename="medical_record.pdf" />
        </Section>

        {/* 5 — Review and submit */}
        <Section number={5} title="Review and submit" id="section-submit">
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Applicant
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {applicantName}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Intending Class
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {intendingClass}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Admission Batch
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {admissionBatch}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Paid
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {totalPaid}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Documents
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  4 of 4 uploaded
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Application ID
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  16,205-QA-65001
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ py: 2 }}>
            <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 32 }} />
            <Typography variant="body2" color="text.secondary">
              All sections completed. This is a preview only.
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={onSubmit}
            disabled={isLoading}
            sx={{ fontWeight: 700, py: 1.25, borderRadius: 2, fontSize: '0.95rem' }}
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </Section>

        {/* Footer nav */}
        <Box display="flex" sx={{ mt: 1, mb: 2 }}>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
        </Box>
      </Grid>

      {/* ── Quick jump sidebar ── */}
      <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
        <QuickJump />
      </Grid>
    </Grid>
  );
};

SubmitStep.propTypes = {
  wardData: PropTypes.object,
  academicData: PropTypes.object,
  documentsData: PropTypes.object,
  selectedBatch: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default SubmitStep;
