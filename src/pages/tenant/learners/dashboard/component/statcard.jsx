import React from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  IconButton,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  SchoolOutlined,
  CalendarTodayOutlined,
  AccountBalanceWalletOutlined,
  TrendingUp,
  TrendingDown,
  MoreVert,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';

const formatNaira = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const cardBase = {
  borderRadius: '8px',
  boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  p: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const StatCardSkeleton = () => (
  <Card
    elevation={0}
    sx={{ ...cardBase, bgcolor: '#fff', border: '1.5px solid #E5E7EB' }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Skeleton variant="text" width={90} height={14} />
      <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: '7px' }} />
    </Stack>
    <Box sx={{ mt: 1 }}>
      <Skeleton variant="text" width={70} height={22} />
      <Skeleton variant="text" width={110} height={12} sx={{ mt: 0.6 }} />
    </Box>
  </Card>
);

const TrendRow = ({ growth, label }) => {
  const up = Number(growth) >= 0;
  return (
    <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.4 }}>
      {up ? (
        <TrendingUp sx={{ fontSize: 13, color: '#16A34A' }} />
      ) : (
        <TrendingDown sx={{ fontSize: 13, color: '#DC2626' }} />
      )}
      <Typography fontWeight="700" sx={{ fontSize: '0.67rem', color: up ? '#16A34A' : '#DC2626' }}>
        {up ? '↑' : '↓'} {Math.abs(Number(growth || 0))}%
      </Typography>
      <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
        vs {label}
      </Typography>
    </Stack>
  );
};

const StatCards = ({ overview = {}, loading = false, onCardClick }) => {
  const wallet = overview.wallet || {};

  // Clickable stat cards open a breakdown modal; non-clickable ones (wallet)
  // keep the default cursor. The hover-lift styles apply only when a click
  // handler is wired.
  const cardProps = (type) => ({
    onClick: type ? () => onCardClick && onCardClick(type) : undefined,
    sx: type
      ? {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        }
      : {},
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: '1fr 1fr 1fr 1.35fr' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </Box>
    );
  }

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
      {/* Card 1: Average Score */}
      <Tooltip title="Click to view breakdown" placement="top" arrow>
        <Card
          elevation={0}
          {...cardProps('subjects')}
          sx={{
            ...cardBase,
            bgcolor: '#F0F4FF',
            border: '1.5px solid #2563EB',
            ...(cardProps('subjects').sx || {}),
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
              {Number(overview.average_score || 0)}%
            </Typography>
            <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF' }}>
              This Term
            </Typography>
          </Stack>

          <TrendRow growth={overview.average_score_growth} label="last term" />
        </Box>
        </Card>
      </Tooltip>

      {/* Card 2: Attendance */}
      <Tooltip title="Click to view breakdown" placement="top" arrow>
      <Card
        elevation={0}
        {...cardProps('attendance')}
        sx={{
          ...cardBase,
          bgcolor: '#F0FDF4',
          border: '1.5px solid #16A34A',
          ...(cardProps('attendance').sx || {}),
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
              {Number(overview.attendance_rate || 0)}%
            </Typography>
            <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF' }}>
              This Term
            </Typography>
          </Stack>

          <TrendRow growth={overview.attendance_growth} label="last term" />
        </Box>
      </Card>
      </Tooltip>

      {/* Card 3: Outstanding Fees */}
      <Tooltip title="Click to view breakdown" placement="top" arrow>
      <Card
        elevation={0}
        {...cardProps('fees')}
        sx={{
          ...cardBase,
          bgcolor: '#FFF5F5',
          border: '1.5px solid #DC2626',
          ...(cardProps('fees').sx || {}),
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
            {formatNaira(overview.outstanding_fees)}
          </Typography>
          <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF', mt: 0.4 }}>
            {Number(overview.invoice_count || 0)}{' '}
            {Number(overview.invoice_count || 0) === 1 ? 'invoice' : 'invoices'}
          </Typography>
        </Box>
      </Card>
      </Tooltip>

      {/* Card 4: My Wallet Account */}
      <Card
        elevation={0}
        sx={{
          ...cardBase,
          bgcolor: '#FFF',
          border: '1.5px solid #E5E7EB',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827' }}>
            My Wallet Account
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                bgcolor: wallet.verified ? '#DCFCE7' : '#F3F4F6',
                color: wallet.verified ? '#166534' : '#6B7280',
                border: wallet.verified ? '1px solid #86EFAC' : '1px solid #E5E7EB',
                borderRadius: '20px',
                px: 0.9,
                py: 0.15,
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
              }}
            >
              <CheckCircle sx={{ fontSize: 10 }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700 }}>
                {wallet.verified ? 'Verified' : 'Pending'}
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
              Wal
            </Box>

            <Box>
              <Typography fontWeight="700" sx={{ fontSize: '0.74rem', color: '#111827', lineHeight: 1.1 }}>
                Wallet Account
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', mt: 0.1 }}>
                {wallet.verified ? 'Account Number' : 'Not set up yet'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.3 }}>
            <Typography
              fontWeight="800"
              sx={{
                fontSize: '1.1rem',
                color: '#111827',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {wallet.account_no || '—'}
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
                flexShrink: 0,
                ml: 1,
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
