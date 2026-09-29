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
  MoreVert,
  CheckCircle,
  ArrowForward,
  InfoOutlined,
} from '@mui/icons-material';

const formatNaira = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

// ── Lean card: white bg, subtle shadow, no coloured fill ──────────────────────
const leanCardBase = {
  borderRadius: '14px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  border: '1px solid #E8ECF0',
  p: '10px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  bgcolor: '#ffffff',
};

const leanCardHover = {
  cursor: 'pointer',
  transition: 'box-shadow 150ms ease, transform 150ms ease',
  '&:hover': {
    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
};

// Rounded-square icon container
const squareIcon = (bg, color) => ({
  width: 54,
  height: 54,
  borderRadius: '12px',
  bgcolor: bg,
  color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

// Wallet card keeps the old taller style
const walletCardBase = {
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  p: '12px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '160px',
};

const StatCardSkeleton = ({ lean = false }) =>
  lean ? (
    <Card elevation={0} sx={{ ...leanCardBase }}>
      <Skeleton variant="rectangular" width={54} height={54} sx={{ borderRadius: '12px', flexShrink: 0 }} />
      <Box sx={{ flex: 1, ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="text" width={80} height={36} sx={{ mt: 0.25 }} />
        <Skeleton variant="text" width={70} height={14} sx={{ mt: 0.25 }} />
        <Skeleton variant="text" width={110} height={14} sx={{ mt: 0.5 }} />
      </Box>
    </Card>
  ) : (
    <Card elevation={0} sx={{ ...walletCardBase, bgcolor: '#fff' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: '12px' }} />
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="text" width={120} height={32} sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width={90} height={14} sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width={110} height={14} sx={{ mt: 0.5 }} />
      </Box>
    </Card>
  );

const TrendRow = ({ growth, label }) => {
  const up = Number(growth) >= 0;
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} sx={{ mt: 0.75 }}>
      <Typography
        fontWeight="600"
        sx={{ fontSize: '0.8rem', color: up ? '#16A34A' : '#DC2626' }}
      >
        {up ? '↑' : '↓'} {Math.abs(Number(growth || 0))}%
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 400 }}>
        vs {label}
      </Typography>
    </Stack>
  );
};

const StatCards = ({ overview = {}, loading = false, onCardClick }) => {
  const wallet = overview.wallet || {};

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
        <StatCardSkeleton lean />
        <StatCardSkeleton lean />
        <StatCardSkeleton lean />
        <StatCardSkeleton lean={false} />
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
        mb: 2,
      }}
    >
      {/* ── Card 1: Average Score ─────────────────────────────────── */}
      <Tooltip title="Click to view breakdown" placement="top" arrow>
        <Card
          elevation={0}
          onClick={() => onCardClick && onCardClick('subjects')}
          sx={{ ...leanCardBase, ...leanCardHover }}
        >
          <Box sx={squareIcon('#EBF1FF', '#2563EB')}>
            <SchoolOutlined sx={{ fontSize: 30 }} />
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            <Typography fontWeight="600" sx={{ fontSize: '0.82rem', color: '#1E293B' }}>
              Average Score
            </Typography>
            <Typography fontWeight="700" sx={{ fontSize: '1.9rem', color: '#0F172A', lineHeight: 1.2 }}>
              {Number(overview.average_score || 0)}%
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              This Term
            </Typography>
            <TrendRow growth={overview.average_score_growth} label="last term" />
          </Box>
        </Card>
      </Tooltip>

      {/* ── Card 2: Attendance ────────────────────────────────────── */}
      <Tooltip title="Click to view breakdown" placement="top" arrow>
        <Card
          elevation={0}
          onClick={() => onCardClick && onCardClick('attendance')}
          sx={{ ...leanCardBase, ...leanCardHover }}
        >
          <Box sx={squareIcon('#E8F8EF', '#16A34A')}>
            <CalendarTodayOutlined sx={{ fontSize: 30 }} />
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            <Typography fontWeight="600" sx={{ fontSize: '0.82rem', color: '#1E293B' }}>
              Attendance
            </Typography>
            <Typography fontWeight="700" sx={{ fontSize: '1.9rem', color: '#0F172A', lineHeight: 1.2 }}>
              {Number(overview.attendance_rate || 0)}%
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              This Term
            </Typography>
            <TrendRow growth={overview.attendance_growth} label="last term" />
          </Box>
        </Card>
      </Tooltip>

      {/* ── Card 3: Pending Payment ───────────────────────────────── */}
      <Tooltip title="Click to view breakdown" placement="top" arrow>
        <Card
          elevation={0}
          onClick={() => onCardClick && onCardClick('fees')}
          sx={{ ...leanCardBase, ...leanCardHover }}
        >
          <Box sx={squareIcon('#FFF0E5', '#F97316')}>
            <AccountBalanceWalletOutlined sx={{ fontSize: 30 }} />
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            <Typography fontWeight="600" sx={{ fontSize: '0.82rem', color: '#1E293B' }}>
              Pending Payment
            </Typography>
            <Typography fontWeight="700" sx={{ fontSize: '1.9rem', color: '#0F172A', lineHeight: 1.2 }}>
              {formatNaira(overview.outstanding_fees)}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              {Number(overview.invoice_count || 0)}{' '}
              {Number(overview.invoice_count || 0) === 1 ? 'invoice' : 'invoices'}
            </Typography>
          </Box>
        </Card>
      </Tooltip>

      {/* ── Card 4: My Wallet Account ─────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          ...walletCardBase,
          bgcolor: '#ffffff',
          border: '1px solid #cbd5e1',
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
                display: 'flex',
                alignItems: 'center',
                gap: 0.1,
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
          {wallet.account_no ? (
            <>
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
                    Account Number
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.3 }}>
                <Box>
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
                    {wallet.account_no}
                  </Typography>
                  {wallet.account_name && (
                    <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', mt: 0.1 }}>
                      {wallet.account_name}
                    </Typography>
                  )}
                </Box>

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
            </>
          ) : (
            /* ── No wallet info fallback ──────────────────────────── */
            <Box
              sx={{
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '9px',
                px: 1.25,
                py: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.75,
              }}
            >
              <InfoOutlined sx={{ fontSize: 16, color: '#2563EB', mt: 0.1, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 600, lineHeight: 1.4 }}>
                A wallet account has not been set up yet. Make a payment to generate your wallet account.
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default StatCards;
