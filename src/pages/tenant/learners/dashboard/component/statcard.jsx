import React from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import {
  SchoolOutlined,
  CalendarTodayOutlined,
  AccountBalanceWalletOutlined,
  TrendingUp,
  MoreVert,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';

const StatCards = () => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: '1fr 1fr 1fr 1.35fr',
        },
        gap: 2,
        mb: 2.5,
      }}
    >
      {/* Card 1: Average Score (ParentDashboard2 style: light background + colored border + colored icon box) */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '8px',
          bgcolor: '#F0F4FF',
          border: '1.5px solid #2563EB',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          p: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography fontWeight="600" sx={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.25 }}>
            Average Score
          </Typography>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '7px',
              bgcolor: '#DBEAFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SchoolOutlined sx={{ fontSize: 15 }} />
          </Box>
        </Stack>

        <Box sx={{ mt: 0.5 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography fontWeight="800" sx={{ fontSize: '1.35rem', color: '#111827', lineHeight: 1 }}>
              78%
            </Typography>
            <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF' }}>
              This Term
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.4 }}>
            <TrendingUp sx={{ fontSize: 13, color: '#16A34A' }} />
            <Typography fontWeight="700" sx={{ fontSize: '0.67rem', color: '#16A34A' }}>
              ↑ 8.5%
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
              vs last term
            </Typography>
          </Stack>
        </Box>
      </Card>

      {/* Card 2: Attendance */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '8px',
          bgcolor: '#F0FDF4',
          border: '1.5px solid #16A34A',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          p: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography fontWeight="600" sx={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.25 }}>
            Attendance
          </Typography>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '7px',
              bgcolor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarTodayOutlined sx={{ fontSize: 15 }} />
          </Box>
        </Stack>

        <Box sx={{ mt: 0.5 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography fontWeight="800" sx={{ fontSize: '1.35rem', color: '#111827', lineHeight: 1 }}>
              92%
            </Typography>
            <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF' }}>
              This Term
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.4 }}>
            <TrendingUp sx={{ fontSize: 13, color: '#16A34A' }} />
            <Typography fontWeight="700" sx={{ fontSize: '0.67rem', color: '#16A34A' }}>
              ↑ 5.2%
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
              vs last term
            </Typography>
          </Stack>
        </Box>
      </Card>

      {/* Card 3: Outstanding Fees */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '8px',
          bgcolor: '#FFF5F5',
          border: '1.5px solid #DC2626',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          p: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography fontWeight="600" sx={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.25 }}>
            Outstanding Fees
          </Typography>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '7px',
              bgcolor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AccountBalanceWalletOutlined sx={{ fontSize: 15 }} />
          </Box>
        </Stack>

        <Box sx={{ mt: 0.5 }}>
          <Typography fontWeight="800" sx={{ fontSize: '1.35rem', color: '#DC2626', lineHeight: 1 }}>
            ₦15,000
          </Typography>
          <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF', mt: 0.4 }}>
            2 invoices
          </Typography>
        </Box>
      </Card>

      {/* Card 4: My Wallet Account */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '8px',
          bgcolor: '#FFF',
          border: '1.5px solid #E5E7EB',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          p: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827' }}>
            My Wallet Account
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                bgcolor: '#DCFCE7',
                color: '#166534',
                border: '1px solid #86EFAC',
                borderRadius: '20px',
                px: 0.9,
                py: 0.15,
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
              }}
            >
              <CheckCircle sx={{ fontSize: 10, color: '#166534' }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700 }}>
                Verified
              </Typography>
            </Box>
            <IconButton size="small" sx={{ p: 0, color: '#9CA3AF' }}>
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ mt: 0.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.4}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '5px',
                bgcolor: '#EA580C',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.5rem',
                letterSpacing: '-0.3px',
                flexShrink: 0,
              }}
            >
              GTBank
            </Box>

            <Box>
              <Typography fontWeight="700" sx={{ fontSize: '0.74rem', color: '#111827', lineHeight: 1.1 }}>
                Guaranty Trust Bank (GTBank)
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', mt: 0.1 }}>
                Account Number
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.3 }}>
            <Typography fontWeight="800" sx={{ fontSize: '1.1rem', color: '#111827', letterSpacing: '0.5px' }}>
              0123456789
            </Typography>

            <Button
              variant="contained"
              disableElevation
              size="small"
              endIcon={<ArrowForward sx={{ fontSize: '13px !important' }} />}
              sx={{
                py: 0.4,
                px: 1.2,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '6px',
                bgcolor: '#0D9488',
                '&:hover': { bgcolor: '#0F766E' },
              }}
            >
              Make Payment
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default StatCards;
