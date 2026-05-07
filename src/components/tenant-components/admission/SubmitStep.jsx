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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

import { IconUserFilled } from '@tabler/icons-react';

// ── Quick Jump sidebar ────────────────────────────────────────────────────────
const SECTIONS = ['Ward Detail', 'Academic Info', 'Payment', 'Documents', 'Submit'];

const QuickJump = () => (
  <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, mb: 2 }}>
  <Box sx={{ position: 'sticky', top: 24 }}>
    <Typography variant="h5" fontWeight={700} color="text.secondary" display="block" mb={1}>
      Quick jump
    </Typography>
    <Stack spacing={0.5}>
      {SECTIONS.map((s) => (
        <Link
          key={s}
          href={`#section-${s.toLowerCase().replace(' ', '-')}`}
          underline="hover"
          variant="h6"
          color="primary.main"
          sx={{ fontWeight: 500 }}
        >
          · {s}
        </Link>
      ))}
    </Stack>
  </Box>
  </Paper>
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
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
    </Box>
    {children}
  </Paper>
);

// ── Field display ─────────────────────────────────────────────────────────────
const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
    <Typography variant="body2" fontWeight={500} mt={0.25}>{value || '—'}</Typography>
  </Box>
);

// ── Receipt row ───────────────────────────────────────────────────────────────
const ReceiptRow = ({ label, amount, bold }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Typography variant="body2" color={bold ? 'text.primary' : 'text.secondary'} fontWeight={bold ? 700 : 400}>
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
    sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Box>
      <Typography variant="body2" fontWeight={500}>
        {label}
        {required && <Typography component="span" color="error.main" ml={0.5}>*</Typography>}
      </Typography>
      {filename && (
        <Typography variant="caption" color="text.secondary">{filename}</Typography>
      )}
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        label="Uploaded"
        size="small"
        sx={{ bgcolor: '#E8F5E9', color: 'success.dark', fontWeight: 600, fontSize: 11 }}
      />
      <Link href="#" variant="caption" color="primary.main" underline="hover">
        View
      </Link>
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
  // Derive display values with safe fallbacks
  const applicantName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : 'Adeyemi Oluwadunke';

  const intendingClass = academicData?.class_id
    ? `JSS 1 — Diamond`
    : 'JSS 1 — Diamond';

  const admissionBatch = selectedBatch
    ? `${selectedBatch.session_term} Batch ${selectedBatch.batch_number ?? '2'}`
    : '2025/2026 Batch 2';

  const totalPaid = '₦25,500';

  return (
    <Grid container spacing={3} alignItems="flex-start">

      <Grid size={{ xs: 12, md: 9 }}>

        {/* 1 — Ward Detail */}
        <Section number={1} title="Tell us about your ward" subtitle="Basic information" id="section-ward-detail">
          <Box display="flex" flexDirection="column" alignItems="center" mb={2.5}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                mb: 1,
              }}
            >
              <Typography variant="h5">
                 <IconUserFilled size="50" />,
              </Typography>

            </Box>
            <Typography variant="body2" fontWeight={700}>{applicantName}</Typography>
            <Typography variant="caption" color="text.secondary">
              Intending Class : {intendingClass}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Surname"    value={wardData?.surname}     />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="First name" value={wardData?.first_name}  />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Other name" value={wardData?.other_name}  />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Date of Birth" value={wardData?.dob}      />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Select Gender"    value={wardData?.gender}          />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="State of Origin"  value={wardData?.state_of_origin} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="LGA of Origin"    value={wardData?.lga}             />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Home Address"     value={wardData?.home_address}    />
            </Grid>
          </Grid>
        </Section>

        {/* 2 — Academic Information */}
        <Section number={2} title="Academic Information" id="section-academic-info">
          {academicData?.has_previous_school && (
            <>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Previous school information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12 }}>
                  <Field label="Previous school name" value={academicData?.previous_school_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Field label="Last Class" value={academicData?.previous_class} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Field label="Position"  value="—" />
                </Grid>
              </Grid>
              <Divider sx={{ mb: 2 }} />
            </>
          )}

          {/* <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Intending Class
          </Typography> */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Intending Class"         value={intendingClass}                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Programme Class Choice"  value={academicData?.programme_id ? 'Junior Secondary — JSS 1 — Diamond Arm | Science-Inclined' : '—'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Field label="Boarding Status"         value={academicData?.boarding_status === 'day' ? 'Day Student - Resumes 7:30 AM, closes 3:45 PM (School b...' : academicData?.boarding_status ?? '—'} />
            </Grid>
          </Grid>
        </Section>

        {/* 3 — Payment Receipt */}
        <Section number={3} title="Payment Receipt" subtitle="Confirmation of admission application payment" id="section-payment">
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, p: 2, bgcolor: '#FAFAFA' }}
          >
            {/* Receipt header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700}>Payment Receipt</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Admission Application Payment Breakdown
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Button size="small" startIcon={<PrintIcon />} variant="outlined" sx={{ fontSize: 11 }}>
                  Print
                </Button>
                <Button size="small" startIcon={<DownloadIcon />} variant="outlined" sx={{ fontSize: 11 }}>
                  Download
                </Button>
              </Box>
            </Box>

            {/* Receipt meta */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Field label="RECEIPT NO"  value="SKRC-2025-0049" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Field label="DATE PAID"   value="04 May 2025, 11:24 AM" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Field label="REFERENCE"   value="TRX-29273645" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Field label="PAYER"       value="Mrs. Adetola Ademola" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Field label="METHOD"      value="Bank Transfer - Globus Bank" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Field
                  label="STATUS"
                  value={
                    <Chip label="Successful" size="small"
                      sx={{ bgcolor: '#E8F5E9', color: 'success.dark', fontWeight: 600, fontSize: 11 }} />
                  }
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 1.5 }} />

            {/* Fee rows */}
            {[
              { label: 'Application Form Fee',     amount: '₦15,000' },
              { label: 'Registration Fee',         amount: '₦500'    },
              { label: 'Processing Fee',           amount: '₦5,000'  },
              { label: 'Entrance Examination Fee', amount: '₦1,000'  },
              { label: 'Administrative Charges',   amount: '₦1,000'  },
              { label: 'ICT/Portal Access Fee',    amount: '₦2,000'  },
              { label: 'Bank Charge',              amount: '₦500'    },
            ].map((r) => <ReceiptRow key={r.label} {...r} />)}

            <Box display="flex" justifyContent="space-between" sx={{ pt: 1.5 }}>
              <Typography variant="body2" fontWeight={700}>Total Paid</Typography>
              <Typography variant="body2" fontWeight={700}>{totalPaid}</Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mt={1.5} textAlign="center">
              Powered by Skoolpay · This is a computer generated receipt
            </Typography>
          </Paper>
        </Section>

        {/* 4 — Documents */}
        <Section number={4} title="Upload required documents" subtitle="PDF, JPG or PNG. Max 5MB each." id="section-documents">
          <DocRow label="Birth certificate"      filename="queensley_2019_birth.pdf"  required />
          <DocRow label="Previous school report" filename="all_report_2025.pdf"        required />
          <DocRow label="Passport photo"         filename="passport.png"               required />
          <DocRow label="Medical record"         filename="medical_record.pdf"         />
        </Section>

        {/* 5 — Review and submit */}
        <Section number={5} title="Review and submit" id="section-submit">
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Applicant"       value={applicantName}  />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Intending Class" value={intendingClass} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Admission Batch" value={admissionBatch} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Total Paid"      value={totalPaid}      />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Documents"       value="4 of 4 uploaded" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field label="Application ID"  value="16,205-QA-65001" />
            </Grid>
          </Grid>

          {/* All sections complete indicator */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ py: 2 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
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
        <Box display="flex" justifyContent="flex-start" sx={{ mt: 1 }}>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
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
  wardData:      PropTypes.object,
  academicData:  PropTypes.object,
  documentsData: PropTypes.object,
  selectedBatch: PropTypes.object,
  onBack:        PropTypes.func.isRequired,
  onSubmit:      PropTypes.func.isRequired,
  isLoading:     PropTypes.bool,
};

export default SubmitStep;
