import { Box, Typography, Paper, Stack, Skeleton, LinearProgress, Tooltip } from '@mui/material';
import {
  Groups as GroupsIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  ReportProblem as AttentionIcon,
  ArrowUpward,
  ArrowDownward,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const Trend = ({ diff, suffix = '', label = 'vs last week' }) => {
  if (diff === null || diff === undefined) return null;
  if (diff === 0) {
    return (
      <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">
        No change {label}
      </Typography>
    );
  }
  const up = diff > 0;
  return (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      {up ? (
        <ArrowUpward sx={{ fontSize: 12, color: 'success.main' }} />
      ) : (
        <ArrowDownward sx={{ fontSize: 12, color: 'error.main' }} />
      )}
      <Typography variant="caption" fontWeight={700} color={up ? 'success.main' : 'error.main'}>
        {Math.abs(diff)}
        {suffix} {label}
      </Typography>
    </Stack>
  );
};

const StatCard = ({ icon, iconBg, iconColor, label, tooltip, children, onClick }) => (
  <Tooltip title={tooltip || ''} arrow placement="top">
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: '10px 12px',
        borderRadius: '10px',
        border: '1px solid #E5E7EB',
        bgcolor: '#fff',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease, border-color 150ms ease',
        '&:hover': onClick ? { borderColor: '#94a3b8', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' } : {},
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              bgcolor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              '& svg': { fontSize: 16 },
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.72rem">
            {label}
          </Typography>
        </Stack>
        {onClick && <ChevronRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
      </Stack>
      {children}
    </Paper>
  </Tooltip>
);

const CardSkeleton = () => (
  <Paper elevation={0} sx={{ p: '10px 12px', borderRadius: '10px', border: '1px solid #E5E7EB', height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
      <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: '8px' }} />
      <Skeleton variant="text" width="60%" height={14} />
    </Stack>
    <Skeleton variant="text" width="40%" height={32} />
  </Paper>
);

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
  gap: 1.25,
  mb: 2,
};

/**
 * The 4-card stats row at the top of the Mark Attendance tab. `markedToday`
 * and `totalLearners` are derived client-side from the already-loaded
 * roster/grid; `weekRate`/`weekRateChange`/`needsFollowUp` are passed through
 * from the shared `attendanceMetrics` the parent page already fetches for
 * the Attendance Analytics row, so no extra network round trip is needed.
 */
const MarkAttendanceStatCards = ({
  loading,
  totalLearners,
  markedToday,
  weekRate,
  weekRateChange,
  needsFollowUp,
  onNeedsFollowUpClick,
}) => {
  if (loading) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  const markedPct = markedToday?.total > 0 ? Math.round((markedToday.marked / markedToday.total) * 100) : 0;

  return (
    <Box sx={gridSx}>
      <StatCard
        icon={<GroupsIcon fontSize="small" />}
        iconBg="#DBEAFE"
        iconColor="#2563EB"
        label="Class Learners"
        tooltip="Total number of learners enrolled in this class arm."
      >
        <Typography variant="h4" fontWeight={800} lineHeight={1}>
          {totalLearners}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">
          enrolled in this arm
        </Typography>
      </StatCard>

      <StatCard
        icon={<CheckCircleIcon fontSize="small" />}
        iconBg="#DCFCE7"
        iconColor="#16A34A"
        label="Marked Today"
        tooltip="How many learners have been marked present/absent/late for today, out of the full roster."
      >
        <Typography variant="h4" fontWeight={800} lineHeight={1}>
          {markedToday?.marked ?? 0}/{markedToday?.total ?? 0}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={markedPct}
          sx={{ height: 6, borderRadius: 4, mt: 0.5, bgcolor: '#DCFCE7', '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' } }}
        />
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">
          {markedPct}% completed
        </Typography>
      </StatCard>

      <StatCard
        icon={<BarChartIcon fontSize="small" />}
        iconBg="#F3E8FF"
        iconColor="#9333EA"
        label="Attendance This Week"
        tooltip="Average attendance rate for the currently selected week, compared with the previous week."
      >
        <Typography variant="h4" fontWeight={800} lineHeight={1}>
          {weekRate ?? 0}%
        </Typography>
        <Trend diff={weekRateChange} suffix="%" />
      </StatCard>

      <StatCard
        icon={<AttentionIcon fontSize="small" />}
        iconBg="#FEE2E2"
        iconColor="#DC2626"
        label="Needs Follow-up"
        tooltip="Learners flagged for chronic absence this term. Click to see the list."
        onClick={onNeedsFollowUpClick}
      >
        <Typography variant="h4" fontWeight={800} lineHeight={1} color={needsFollowUp > 0 ? 'error.main' : 'text.primary'}>
          {needsFollowUp ?? 0}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">
          learner(s) require attention
        </Typography>
      </StatCard>
    </Box>
  );
};

export default MarkAttendanceStatCards;
