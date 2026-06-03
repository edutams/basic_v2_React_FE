import { Box, Grid, Typography, Paper, Button, Divider, Avatar, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const FEE_ITEMS = [
  { label: 'Application Form Fee', amount: 15000 },
  { label: 'Registration Fee', amount: 500 },
  { label: 'Processing Fee', amount: 5000 },
  { label: 'Entrance Examination Fee', amount: 1000 },
  { label: 'Administrative Charges', amount: 1000 },
  { label: 'ICT/Portal Access Fee', amount: 2000 },
];

const BANK_CHARGE = 500;

const PaymentStep = ({ onNext, onBack, isLoading = false }) => {
  const payableFees = FEE_ITEMS.reduce((sum, f) => sum + f.amount, 0);
  const totalPayable = payableFees + BANK_CHARGE;

  const handleCopy = () => {
    navigator.clipboard.writeText('987123793');
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Admission Application Payment Breakdown
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
            {FEE_ITEMS.map((fee, i) => (
              <Box
                key={fee.label}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.5,
                  borderBottom: i < FEE_ITEMS.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {fee.label}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₦{fee.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Paper>

          {/* Totals summary */}
          <Paper sx={{ borderRadius: 2, px: 2.5, py: 2, bgcolor: '#FAFAFA' }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Payable Fees
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ₦ {payableFees.toLocaleString()}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1.5}>
              <Typography variant="body2" color="text.secondary">
                Bank Charge
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ₦ {BANK_CHARGE.toLocaleString()}
              </Typography>
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" fontWeight={700} color="error.main">
                Total Payable
              </Typography>
              <Typography variant="h6" fontWeight={800} color="error.main">
                ₦ {totalPayable.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* wallet card ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              borderRadius: 3,
              p: 2.5,
              bgcolor: '#FDF8F0',
              border: '1px solid',
              borderColor: '#F0E0C0',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              {/* LEFT */}
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: '#EE1E32',
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                SB
              </Avatar>

              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary" display="block">
                  Wallet Account
                </Typography>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  gap={0.5}
                  sx={{ lineHeight: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1, m: 0 }}>
                    987123793
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{
                      p: 0,
                      ml: 0.25,
                      lineHeight: 1,
                    }}
                  >
                    <CopyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </IconButton>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Globus Bank
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" fontWeight={600} mb={1.5}>
              Skoolpay/Oluwadunke Adeyemi
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Wallet Balance
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                ₦ 0.0
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="error.main" mb={1.5}>
          Have you made the Bank Transfer
        </Typography>

        <Button
          fullWidth
          onClick={onNext}
          disabled={isLoading}
          sx={{
            bgcolor: '#8B0000',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            py: 1.5,
            maxWidth: 480,
            '&:hover': { bgcolor: '#6B0000' },
          }}
        >
          Confirm Bank Transfer
        </Button>

        <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
          Have issues with payment?{' '}
          <Typography
            component="a"
            href="mailto:Complaint@Skoolpay.ng"
            variant="caption"
            color="error.main"
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            Complaint@Skoolpay.ng
          </Typography>
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
          Back
        </Button>
      </Box>
    </Box>
  );
};

PaymentStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default PaymentStep;
