import React from 'react';
import { Box, Card, Typography, Stack, LinearProgress, Avatar, Divider } from '@mui/material';
import Chart from 'react-apexcharts';
import {
  AccountBalanceWalletOutlined,
  CreditCardOutlined,
  AccessTimeOutlined,
  ReceiptLongOutlined,
  EditOutlined,
  QuizOutlined,
  AssignmentOutlined,
  MenuBookOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};


const financeCards = [
  { title: 'Outstanding Fees',   subtitle: 'Total Balance',        amount: '₦50,000',      amountColor: '#DC2626', iconBg: '#FEE2E2', iconColor: '#DC2626', borderColor: '#DC2626', icon: AccountBalanceWalletOutlined },
  { title: 'This Term Payments', subtitle: 'Total Paid',           amount: '₦250,000',     amountColor: '#16A34A', iconBg: '#DCFCE7', iconColor: '#16A34A', borderColor: '#16A34A', icon: CreditCardOutlined },
  { title: 'Pending Payments',   subtitle: '1 Transaction',        amount: '₦15,000',      amountColor: '#D97706', iconBg: '#FEF3C7', iconColor: '#D97706', borderColor: '#D97706', icon: AccessTimeOutlined },
  { title: 'Payment History',    subtitle: 'View all transactions', amount: 'View History →', amountColor: '#2563EB', iconBg: '#DBEAFE', iconColor: '#2563EB', borderColor: '#2563EB', icon: ReceiptLongOutlined, isLink: true },
];

const FINANCE_GAP = 10;

const FinanceCard = ({ title, subtitle, amount, amountColor, iconBg, iconColor, borderColor, icon: Icon, isLink }) => (
  <Card elevation={0} sx={{ flex: { xs: '1 1 140px', sm: '1 1 0' }, minWidth: 0, p: '12px', display: 'flex', flexDirection: 'column', gap: 0.4, bgcolor: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Typography fontWeight="600" sx={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.25, maxWidth: '65%' }}>{title}</Typography>
      <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ fontSize: 15 }} />
      </Box>
    </Stack>
    <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF' }}>{subtitle}</Typography>
    <Typography fontWeight="700" sx={{ fontSize: isLink ? '0.77rem' : '1.05rem', color: amountColor, cursor: isLink ? 'pointer' : 'default', mt: 0.2, lineHeight: 1.2 }}>
      {amount}
    </Typography>
  </Card>
);

/* ────────────────────────────────────────
   ACADEMIC PROGRESS ROW  (with divider below)
──────────────────────────────────────── */
const ProgressRow = ({ icon, label, sublabel, color, value, rightLabel, showDivider }) => (
  <>
    <Box py={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.4}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {icon && <Box sx={{ color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</Box>}
          <Box>
            <Typography fontWeight="600" sx={{ fontSize: '0.76rem', color: '#111827', lineHeight: 1.1 }}>{label}</Typography>
            {sublabel && <Typography sx={{ fontSize: '0.66rem', color: '#6B7280', lineHeight: 1 }}>{sublabel}</Typography>}
          </Box>
        </Stack>
        <Typography fontWeight="700" sx={{ fontSize: '0.72rem', color: '#374151', flexShrink: 0 }}>{rightLabel}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={value} sx={{ height: 5, borderRadius: 4, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
    </Box>
    {showDivider && <Divider sx={{ borderColor: '#F3F4F6' }} />}
  </>
);

/* ────────────────────────────────────────
   ENGAGEMENT PROGRESS ROW
──────────────────────────────────────── */
const SimpleProgressRow = ({ label, color, value }) => (
  <Box mb={1}>
    <Stack direction="row" justifyContent="space-between" mb={0.3}>
      <Typography sx={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>{label}</Typography>
      <Typography fontWeight="700" sx={{ fontSize: '0.7rem', color: '#374151' }}>{value}%</Typography>
    </Stack>
    <LinearProgress variant="determinate" value={value} sx={{ height: 5, borderRadius: 4, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
  </Box>
);

/* ────────────────────────────────────────
   ATTENDANCE LEGEND ITEM  (with % and days)
──────────────────────────────────────── */
const LegendItem = ({ color, label, pct, days }) => (
  <Stack direction="row" alignItems="flex-start" spacing={0.6} mb={0.6}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, mt: '3px', flexShrink: 0 }} />
    <Box>
      <Typography sx={{ fontSize: '0.7rem', color: '#374151', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.65rem', color: '#374151', fontWeight: 700, lineHeight: 1 }}>{pct}%</Typography>
      <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', lineHeight: 1 }}>({days} days)</Typography>
    </Box>
  </Stack>
);

/* ────────────────────────────────────────
   MAIN ANALYTICS COMPONENT
──────────────────────────────────────── */
const Analytics = () => {
  const pieData = { series: [87, 8, 5], labels: ['Present', 'Absent', 'Late'] };

  return (
    <Box mb={2}>
      {/* ─── Finance Row (responsive flex-wrap) ─── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${FINANCE_GAP}px`, mb: 1.75 }}>
        {financeCards.map((fc) => <FinanceCard key={fc.title} {...fc} />)}
      </Box>

      {/* ─── Analytics 3-column Row (responsive stack on mobile) ─── */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="stretch">

        {/* ── Academic Overview ── */}
        <Card elevation={0} sx={{ ...cardSx, flex: { xs: '1 1 100%', md: '1 1 0' }, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 0.5 }}>
              Academic Overview{' '}
              <Typography component="span" sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 400 }}>(This Term)</Typography>
            </Typography>
            <ProgressRow icon={<EditOutlined sx={{ fontSize: 13 }} />}       label="Assignments"        sublabel="75% Submitted"     color="#2563EB" value={75} rightLabel="18 / 24" showDivider />
            <ProgressRow icon={<QuizOutlined sx={{ fontSize: 13 }} />}       label="Quizzes"            sublabel="Average Score"     color="#3B82F6" value={72} rightLabel="72%"     showDivider />
            <ProgressRow icon={<AssignmentOutlined sx={{ fontSize: 13 }} />} label="Exams"              sublabel="Average Score"     color="#7C3AED" value={68} rightLabel="68%"     showDivider />
            <ProgressRow icon={<MenuBookOutlined sx={{ fontSize: 13 }} />}   label="Resources Accessed" sublabel="Videos & Materials" color="#F59E0B" value={60} rightLabel="24 / 40" showDivider={false} />
          </Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer', mt: 1 }}>
            View Full Academic Report →
          </Typography>
        </Card>

        {/* ── Attendance Overview ── */}
        <Card elevation={0} sx={{ ...cardSx, flex: { xs: '1 1 100%', md: '1 1 0' }, p: '12px 14px', display: 'flex', flexDirection: 'column' }}>
          <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 0.5 }}>
            Attendance Overview
          </Typography>

          {/* Donut + custom legend side by side */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Donut chart */}
            <Box sx={{ position: 'relative', flexShrink: 0, width: 140, height: 140 }}>
              <Chart
                type="donut"
                series={pieData.series}
                width={140}
                height={140}
                options={{
                  chart: { type: 'donut', sparkline: { enabled: true } },
                  labels: pieData.labels,
                  colors: ['#3B82F6', '#EF4444', '#F59E0B'],
                  plotOptions: { pie: { donut: { size: '70%' } } },
                  dataLabels: { enabled: false },
                  legend: { show: false },
                  stroke: { show: false },
                  tooltip: { enabled: true, fillSeriesColor: false },
                }}
              />
              <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography fontWeight="800" sx={{ fontSize: '1rem', color: '#111827', lineHeight: 1 }}>87%</Typography>
                <Typography sx={{ fontSize: '0.5rem', color: '#6B7280', lineHeight: 1.2, mt: 0.15 }}>Overall<br />Attendance</Typography>
              </Box>
            </Box>

            {/* Custom legend */}
            <Box sx={{ flex: 1, pl: 1.5 }}>
              <LegendItem color="#3B82F6" label="Present" pct={87} days={13} />
              <LegendItem color="#EF4444" label="Absent"  pct={8}  days={12} />
              <LegendItem color="#F59E0B" label="Late"    pct={5}  days={8}  />
            </Box>
          </Box>

          {/* Drop-out Risk — pinned to bottom */}
          <Box sx={{ bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', p: '8px 10px', mt: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.35}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <WarningAmberOutlined sx={{ fontSize: 12, color: '#D97706' }} />
                <Typography fontWeight="700" sx={{ fontSize: '0.68rem', color: '#92400E' }}>Drop-out Risk</Typography>
              </Stack>
              <Box sx={{ bgcolor: '#FDE68A', px: 0.65, py: 0.1, borderRadius: '4px' }}>
                <Typography sx={{ fontSize: '0.58rem', color: '#78350F', fontWeight: 700 }}>Low to Moderate</Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontSize: '0.67rem', color: '#6B7280', mb: 0.35 }}>
              Kelechi has missed 5 days in the last 4 weeks.
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>View Details →</Typography>
          </Box>
        </Card>

        {/* ── Performance Snapshot + Engagement Analytics stacked ── */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 0' }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          {/* Performance Snapshot */}
          <Card elevation={0} sx={{ ...cardSx, p: '12px 14px' }}>
            <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 0.75 }}>
              Performance Snapshot
            </Typography>
            {/* Alert box */}
            <Box sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '7px', p: '8px 10px' }}>
              <Typography fontWeight="700" sx={{ fontSize: '0.69rem', color: '#B91C1C', mb: 0.2 }}>
                Underperforming Learners
              </Typography>
              <Typography sx={{ fontSize: '0.64rem', color: '#EF4444', mb: 0.65 }}>1 ward needs attention</Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Avatar sx={{ width: 26, height: 26, fontSize: '0.7rem', bgcolor: '#FECACA', color: '#7F1D1D', fontWeight: 700 }}>A</Avatar>
                  <Box>
                    <Typography fontWeight="700" sx={{ fontSize: '0.74rem', color: '#111827', lineHeight: 1.2 }}>Amaka Adenubi</Typography>
                    <Typography sx={{ fontSize: '0.63rem', color: '#6B7280' }}>Primary 4B</Typography>
                  </Box>
                </Stack>
                <Box sx={{ bgcolor: '#FEE2E2', border: '1px solid #FECACA', px: 0.75, py: 0.2, borderRadius: '4px' }}>
                  <Typography fontWeight="700" sx={{ fontSize: '0.6rem', color: '#991B1B' }}>At Risk</Typography>
                </Box>
              </Stack>
            </Box>
          </Card>

          {/* Engagement Analytics */}
          <Card elevation={0} sx={{ ...cardSx, flex: 1, p: '12px 14px', display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 0.9 }}>
              Engagement Analytics
            </Typography>
            <Box sx={{ flex: 1 }}>
              <SimpleProgressRow label="Assignments"  color="#16A34A" value={75} />
              <SimpleProgressRow label="Quizzes"      color="#2563EB" value={65} />
              <SimpleProgressRow label="Resources"    color="#D97706" value={60} />
              <SimpleProgressRow label="Participation" color="#7C3AED" value={70} />
            </Box>
            <Divider sx={{ my: 0.75, borderColor: '#F3F4F6' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
              View Engagement Details →
            </Typography>
          </Card>

        </Box>
      </Stack>
    </Box>
  );
};

export default Analytics;
