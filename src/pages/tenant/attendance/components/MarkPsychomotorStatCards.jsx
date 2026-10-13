import { Box, Typography, Paper, Stack, Skeleton, Tooltip } from '@mui/material';
import {
  Groups as GroupsIcon,
  DonutLarge as CompletionIcon,
  BarChart as BarChartIcon,
  ReportProblem as AttentionIcon,
  EmojiEvents as TopDomainIcon,
  TrendingDown as LowestDomainIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

const Trend = ({ diff, suffix = '', label = 'vs last term' }) => {
  if (diff === null || diff === undefined || diff === 0) return null;
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

const StatCard = ({ icon, iconBg, iconColor, label, tooltip, children }) => (
  <Tooltip title={tooltip || ''} arrow placement="top">
    <Paper
      elevation={0}
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
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '8px',
            bgcolor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 15 },
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.68rem" noWrap>
          {label}
        </Typography>
      </Stack>
      {children}
    </Paper>
  </Tooltip>
);

const CardSkeleton = () => (
  <Paper elevation={0} sx={{ p: '10px 12px', borderRadius: '10px', border: '1px solid #E5E7EB', height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
      <Skeleton variant="rounded" width={26} height={26} sx={{ borderRadius: '8px' }} />
      <Skeleton variant="text" width="60%" height={14} />
    </Stack>
    <Skeleton variant="text" width="40%" height={28} />
  </Paper>
);

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
  gap: 1.25,
  mb: 2,
};

/**
 * 6-card stats row for the redesigned Mark Psychomotor tab. All values are
 * derived client-side from the already-loaded roster/draft grid plus the
 * trait-breakdown fetch and the shared `metrics` (avgAffective/avgPsychomotor
 * etc., already fetched by the parent page) — no extra round trips beyond
 * the one `getTraitBreakdown` call for Top/Lowest Domain.
 */
const MarkPsychomotorStatCards = ({
  loading,
  totalLearners,
  contextLabel,
  completion,
  classAverage,
  classAverageChange,
  needsAttention,
  topDomain,
  lowestDomain,
}) => {
  if (loading) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  const completionPct = completion?.total > 0 ? Math.round((completion.completed / completion.total) * 100) : 0;

  return (
    <Box sx={gridSx}>
      <StatCard
        icon={<GroupsIcon fontSize="small" />}
        iconBg="#DBEAFE"
        iconColor="#2563EB"
        label="Class Learners"
        tooltip="Total number of learners enrolled in this class arm."
      >
        <Typography variant="h5" fontWeight={800} lineHeight={1}>
          {totalLearners}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.62rem" noWrap>
          {contextLabel || 'enrolled in this arm'}
        </Typography>
      </StatCard>

      <StatCard
        icon={<CompletionIcon fontSize="small" />}
        iconBg="#DCFCE7"
        iconColor="#16A34A"
        label="Completion"
        tooltip="How many learners are fully rated across every affective and psychomotor trait."
      >
        <Typography variant="h5" fontWeight={800} lineHeight={1}>
          {completion?.completed ?? 0}/{completion?.total ?? 0}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.62rem">
          {completionPct}% completed
        </Typography>
      </StatCard>

      <StatCard
        icon={<BarChartIcon fontSize="small" />}
        iconBg="#F3E8FF"
        iconColor="#9333EA"
        label="Class Average"
        tooltip="Average rating (1-5) across every rated trait for this class, this week — compared with last term."
      >
        <Typography variant="h5" fontWeight={800} lineHeight={1}>
          {classAverage ?? 0}/5
        </Typography>
        <Trend diff={classAverageChange} />
      </StatCard>

      <StatCard
        icon={<AttentionIcon fontSize="small" />}
        iconBg="#FEE2E2"
        iconColor="#DC2626"
        label="Needs Attention"
        tooltip="Learners whose average rating so far is below 3.0."
      >
        <Typography variant="h5" fontWeight={800} lineHeight={1} color={needsAttention > 0 ? 'error.main' : 'text.primary'}>
          {needsAttention ?? 0}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.62rem">
          learners below 3.0
        </Typography>
      </StatCard>

      <StatCard
        icon={<TopDomainIcon fontSize="small" />}
        iconBg="#F3E8FF"
        iconColor="#9333EA"
        label="Top Domain"
        tooltip="The trait with the highest average rating this week, across every learner."
      >
        <Typography variant="body1" fontWeight={800} lineHeight={1.2} noWrap>
          {topDomain?.name || '—'}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.62rem">
          {topDomain?.avg != null ? `Avg. ${topDomain.avg}` : 'No data yet'}
        </Typography>
      </StatCard>

      <StatCard
        icon={<LowestDomainIcon fontSize="small" />}
        iconBg="#FEE2E2"
        iconColor="#DC2626"
        label="Lowest Domain"
        tooltip="The trait with the lowest average rating this week, across every learner."
      >
        <Typography variant="body1" fontWeight={800} lineHeight={1.2} noWrap>
          {lowestDomain?.name || '—'}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.62rem">
          {lowestDomain?.avg != null ? `Avg. ${lowestDomain.avg}` : 'No data yet'}
        </Typography>
      </StatCard>
    </Box>
  );
};

export default MarkPsychomotorStatCards;
