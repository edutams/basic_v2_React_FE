import React, { useState } from 'react';
import { Box, Card, Typography, Stack, LinearProgress, Avatar, Divider, Skeleton } from '@mui/material';
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
  OpenInNewOutlined,
} from '@mui/icons-material';
import InsightsDetailModal from './insights-detail-modal';

// Cards get a soft resting shadow that lifts with a deeper shadow + slight
// raise on hover, plus a border tint — subtle enough to keep the dashboard calm.
const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
  transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(37,99,235,0.12), 0 2px 6px rgba(0,0,0,0.06)',
    transform: 'translateY(-2px)',
    borderColor: '#DBEAFE',
  },
};

const num = (v) => Number(v || 0);
const naira = (v) => `₦${num(v).toLocaleString()}`;

// Finance cards are fed by the parent-dashboard endpoint's finance payload
// ({ paid, outstanding, pending_count, pending_amount }).
const buildFinanceCards = (finance) => [
  {
    title: 'Outstanding Fees',
    subtitle: 'Total Balance',
    amount: naira(finance.outstanding),
    amountColor: '#DC2626',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    borderColor: '#DC2626',
    icon: AccountBalanceWalletOutlined,
    type: 'outstanding',
  },
  {
    title: 'This Term Payments',
    subtitle: 'Total Paid',
    amount: naira(finance.paid),
    amountColor: '#16A34A',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    borderColor: '#16A34A',
    icon: CreditCardOutlined,
    type: 'payments',
  },
  {
    title: 'Pending Payments',
    subtitle: `${num(finance.pending_count)} Transaction${num(finance.pending_count) === 1 ? '' : 's'}`,
    amount: naira(finance.pending_amount),
    amountColor: '#D97706',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    borderColor: '#D97706',
    icon: AccessTimeOutlined,
    type: 'pending',
  },
  {
    title: 'Payment History',
    subtitle: 'View all transactions',
    amount: 'View History →',
    amountColor: '#2563EB',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    borderColor: '#2563EB',
    icon: ReceiptLongOutlined,
    type: 'history',
  },
];

const FINANCE_GAP = 10;

const FinanceCard = ({ title, subtitle, amount, amountColor, iconBg, iconColor, borderColor, icon: Icon, isLink, onClick }) => (
  <Card elevation={0} onClick={onClick} sx={{ flex: { xs: '1 1 140px', sm: '1 1 0' }, minWidth: 0, p: '12px', cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: 0.4, bgcolor: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', transition: 'box-shadow 0.25s ease, transform 0.25s ease', '&:hover': { boxShadow: `0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.05)`, transform: 'translateY(-2px)' } }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Typography fontWeight="600" sx={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.25, maxWidth: '65%' }}>{title}</Typography>
      <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ fontSize: 15 }} />
      </Box>
    </Stack>
    <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF' }}>{subtitle}</Typography>
    <Typography fontWeight="700" sx={{ fontSize: isLink ? '0.77rem' : '1.05rem', color: amountColor, cursor: onClick ? 'pointer' : 'default', mt: 0.2, lineHeight: 1.2 }}>
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
const Analytics = ({
  finance = {},
  attendance,
  academics,
  financeLoading = false,
  loading = false,
}) => {
  const financeCards = buildFinanceCards(finance);
  const [detailType, setDetailType] = useState(null); // 'academic' | 'attendance' | 'performance' | 'engagement'

  // ── Attendance (from /admission/parent-insights) — Present vs Absent only ──
  const overall = attendance?.overall || {};
  const presentCount = Number(overall.present || 0);
  const absentCount = Number(overall.absent || 0);
  const marked = presentCount + absentCount || 1;
  const presentPct = Math.round((presentCount / marked) * 100);
  const absentPct = Math.max(0, 100 - presentPct);
  const pieData = { series: [presentPct, absentPct], labels: ['Present', 'Absent'] };

  const atRiskWards = (attendance?.wards || []).filter((w) => {
    const m = Number(w.present || 0) + Number(w.absent || 0);
    return m > 0 && (Number(w.absent || 0) / m) >= 0.2;
  });
  const mostAtRisk = atRiskWards[0];

  // ── Academics (aggregate across wards) ──
  const wardAcademics = academics?.wards || [];
  const avgAssignPct = wardAcademics.length
    ? Math.round(wardAcademics.reduce((s, w) => s + (w.assignments?.pct || 0), 0) / wardAcademics.length)
    : 0;
  const avgQuiz = wardAcademics.length
    ? Math.round(wardAcademics.reduce((s, w) => s + (w.quizzes?.avg || 0), 0) / wardAcademics.length)
    : 0;
  const avgExam = wardAcademics.length
    ? Math.round(wardAcademics.reduce((s, w) => s + (w.exams?.avg || 0), 0) / wardAcademics.length)
    : 0;
  const totalAssignments = wardAcademics.reduce((s, w) => s + (w.assignments?.total || 0), 0);
  const totalSubmitted = wardAcademics.reduce((s, w) => s + (w.assignments?.submitted || 0), 0);
  const totalResources = wardAcademics.reduce((s, w) => s + (w.resources?.total || 0), 0);
  const engagement = [
    { label: 'Assignments', color: '#16A34A', value: avgAssignPct },
    { label: 'Quizzes', color: '#2563EB', value: avgQuiz },
    { label: 'Resources', color: '#D97706', value: totalResources ? Math.min(100, totalResources * 20) : 0 },
    { label: 'Participation', color: '#7C3AED', value: presentPct },
  ];

  return (
    <Box mb={2}>
      {/* ─── Finance Row (responsive flex-wrap) ─── */}
      {financeLoading ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${FINANCE_GAP}px`, mb: 1.75 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={96} sx={{ flex: '1 1 140px', minWidth: 0, borderRadius: '8px' }} />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${FINANCE_GAP}px`, mb: 1.75 }}>
          {financeCards.map((fc) => <FinanceCard key={fc.title} {...fc} onClick={() => setDetailType(fc.type)} />)}
        </Box>
      )}

      {/* ─── Analytics 3-column Row (responsive stack on mobile) ─── */}
      {loading ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="stretch">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={330} sx={{ flex: '1 1 0', borderRadius: '8px' }} />
          ))}
        </Stack>
      ) : (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="stretch">

        {/* ── Academic Overview ── */}
        <Card
          elevation={0}
          onClick={() => setDetailType('academic')}
          sx={{ ...cardSx, flex: { xs: '1 1 100%', md: '1 1 0' }, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <Box>
            <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 0.5 }}>
              Academic Overview{' '}
              <Typography component="span" sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 400 }}>(This Term)</Typography>
            </Typography>
            <ProgressRow icon={<EditOutlined sx={{ fontSize: 13 }} />}       label="Assignments"        sublabel={`${avgAssignPct}% Submitted`} color="#2563EB" value={avgAssignPct} rightLabel={`${totalSubmitted} / ${totalAssignments}`} showDivider />
            <ProgressRow icon={<QuizOutlined sx={{ fontSize: 13 }} />}       label="Quizzes"            sublabel="Average Score"     color="#3B82F6" value={avgQuiz} rightLabel={`${avgQuiz}%`} showDivider />
            <ProgressRow icon={<AssignmentOutlined sx={{ fontSize: 13 }} />} label="Exams"              sublabel="Average Score"     color="#7C3AED" value={avgExam} rightLabel={`${avgExam}%`} showDivider />
            <ProgressRow icon={<MenuBookOutlined sx={{ fontSize: 13 }} />}   label="Resources Accessed" sublabel="Videos & Materials" color="#F59E0B" value={totalResources ? Math.min(100, totalResources * 20) : 0} rightLabel={`${totalResources} total`} showDivider={false} />
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
              View Full Academic Report
            </Typography>
            <OpenInNewOutlined sx={{ fontSize: 12, color: '#2563EB' }} />
          </Stack>
        </Card>

        {/* ── Attendance Overview ── */}
        <Card
          elevation={0}
          onClick={() => setDetailType('attendance')}
          sx={{ ...cardSx, flex: { xs: '1 1 100%', md: '1 1 0' }, p: '12px 14px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        >
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
                  colors: ['#3B82F6', '#EF4444'],
                  plotOptions: { pie: { donut: { size: '70%' } } },
                  dataLabels: { enabled: false },
                  legend: { show: false },
                  stroke: { show: false },
                  tooltip: { enabled: true, fillSeriesColor: false },
                }}
              />
              <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography fontWeight="800" sx={{ fontSize: '1rem', color: '#111827', lineHeight: 1 }}>{presentPct}%</Typography>
                <Typography sx={{ fontSize: '0.5rem', color: '#6B7280', lineHeight: 1.2, mt: 0.15 }}>Overall<br />Attendance</Typography>
              </Box>
            </Box>

            {/* Custom legend */}
            <Box sx={{ flex: 1, pl: 1.5 }}>
              <LegendItem color="#3B82F6" label="Present" pct={presentPct} days={presentCount} />
              <LegendItem color="#EF4444" label="Absent"  pct={absentPct}  days={absentCount} />
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
                <Typography sx={{ fontSize: '0.58rem', color: '#78350F', fontWeight: 700 }}>
                  {mostAtRisk ? 'Moderate' : 'Low'}
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontSize: '0.67rem', color: '#6B7280', mb: 0.35 }}>
              {mostAtRisk
                ? `${mostAtRisk.name} has missed ${mostAtRisk.absent || 0} day(s).`
                : 'No ward is at risk right now.'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography sx={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>View Details</Typography>
              <OpenInNewOutlined sx={{ fontSize: 12, color: '#2563EB' }} />
            </Stack>
          </Box>
        </Card>

        {/* ── Performance Snapshot + Engagement Analytics stacked ── */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 0' }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          {/* Performance Snapshot */}
          <Card elevation={0} onClick={() => setDetailType('performance')} sx={{ ...cardSx, p: '12px 14px', cursor: 'pointer' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827' }}>
                Performance Snapshot
              </Typography>
              <OpenInNewOutlined sx={{ fontSize: 13, color: '#9CA3AF' }} />
            </Stack>
            {atRiskWards.length > 0 ? (
              <Box sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '7px', p: '8px 10px' }}>
                <Typography fontWeight="700" sx={{ fontSize: '0.69rem', color: '#B91C1C', mb: 0.2 }}>
                  Underperforming Learners
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: '#EF4444', mb: 0.65 }}>
                  {atRiskWards.length} ward{atRiskWards.length > 1 ? 's' : ''} need attention
                </Typography>
                {atRiskWards.slice(0, 2).map((w) => (
                  <Stack key={w.id} direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Avatar sx={{ width: 26, height: 26, fontSize: '0.7rem', bgcolor: '#FECACA', color: '#7F1D1D', fontWeight: 700 }}>
                        {w.name?.[0] || 'W'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="700" sx={{ fontSize: '0.74rem', color: '#111827', lineHeight: 1.2 }}>{w.name}</Typography>
                        <Typography sx={{ fontSize: '0.63rem', color: '#6B7280' }}>{w.absent || 0} absent day(s)</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ bgcolor: '#FEE2E2', border: '1px solid #FECACA', px: 0.75, py: 0.2, borderRadius: '4px' }}>
                      <Typography fontWeight="700" sx={{ fontSize: '0.6rem', color: '#991B1B' }}>At Risk</Typography>
                    </Box>
                  </Stack>
                ))}
              </Box>
            ) : (
              <Box sx={{ bgcolor: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '7px', p: '8px 10px' }}>
                <Typography fontWeight="700" sx={{ fontSize: '0.69rem', color: '#166534', mb: 0.2 }}>
                  All Clear
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: '#16A34A' }}>
                  No ward is currently underperforming.
                </Typography>
              </Box>
            )}
          </Card>

          {/* Engagement Analytics */}
          <Card
            elevation={0}
            onClick={() => setDetailType('engagement')}
            sx={{ ...cardSx, flex: 1, p: '12px 14px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          >
            <Typography fontWeight="700" sx={{ fontSize: '0.82rem', color: '#111827', mb: 0.9 }}>
              Engagement Analytics
            </Typography>
            <Box sx={{ flex: 1 }}>
              {engagement.map((e) => (
                <SimpleProgressRow key={e.label} label={e.label} color={e.color} value={e.value} />
              ))}
            </Box>
            <Divider sx={{ my: 0.75, borderColor: '#F3F4F6' }} />
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
                View Engagement Details
              </Typography>
              <OpenInNewOutlined sx={{ fontSize: 12, color: '#2563EB' }} />
            </Stack>
          </Card>

        </Box>
      </Stack>
      )}

      {/* Detail modal — fetches from /admission/parent-insights/detail on open */}
      <InsightsDetailModal
        open={!!detailType}
        type={detailType || 'academic'}
        onClose={() => setDetailType(null)}
      />
    </Box>
  );
};

export default Analytics;
