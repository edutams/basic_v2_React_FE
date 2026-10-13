import {
  Box,
  Typography,
  Stack,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  ContentCopy as AutoFillIcon,
  PlaylistAddCheck as ApplyScoreIcon,
  ClearAll as ClearIcon,
  FileDownload as DownloadIcon,
  History as HistoryIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CompletedGlyph,
  Close as PendingGlyph,
  AccessTime as InProgressGlyph,
  RadioButtonUnchecked as NotStartedGlyph,
} from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';

/** A mini stat card: colored icon circle + count/label/percentage — matches the design exactly, no ring chart. */
const MiniStatCard = ({ icon, color, count, label, pct }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      p: 0.75,
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'divider',
      minWidth: 0,
    }}
  >
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        bgcolor: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        '& svg': { fontSize: 15 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="body2" fontWeight={800} lineHeight={1.1}>
        {count}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', lineHeight: 1.15, fontSize: '0.6rem', whiteSpace: 'normal', wordBreak: 'break-word' }}
      >
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={700} sx={{ color, display: 'block', fontSize: '0.64rem' }}>
        {pct}%
      </Typography>
    </Box>
  </Box>
);

/** Horizontal pill-shaped stacked bar — segments proportional to each category's %. */
const SegmentedBar = ({ segments }) => (
  <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: '#E5E7EB' }}>
    {segments
      .filter((s) => s.pct > 0)
      .map((s, i) => (
        <Box key={i} sx={{ width: `${s.pct}%`, bgcolor: s.color }} />
      ))}
  </Box>
);

const QuickActionButton = ({ icon, label, onClick, disabled }) => (
  <Button
    variant="outlined"
    size="small"
    fullWidth
    startIcon={icon}
    onClick={onClick}
    disabled={disabled}
    sx={{ justifyContent: 'flex-start', fontSize: 12.5, py: 0.65, mb: 0.75 }}
  >
    {label}
  </Button>
);

/**
 * Right-hand sidebar for the Mark Psychomotor tab: Today's Summary ring
 * (Completed/Pending/In Progress/Not Started, derived from the draft grid —
 * see MarkPsychomotorTab's `progressStats` memo for the exact definitions),
 * rule-based AI Smart Insights (deterministic templates, no LLM call — same
 * convention as the Class Register/Mark Attendance insight cards), and
 * Quick Actions. The Submit Final Assessments button is preserved here since
 * it's how ratings actually get saved.
 */
const MarkPsychomotorSidebar = ({
  summary,
  insights = [],
  onViewAllInsights,
  onAutoFillFromPrevious,
  autoFillAvailable,
  onApplyScoreToSelected,
  onClearSelected,
  selectedCount,
  onExportClick,
  onViewHistory,
  submitting,
  canSubmit,
  onSubmit,
  learnersCount,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    completed = 0,
    completedPct = 0,
    pending = 0,
    pendingPct = 0,
    inProgress = 0,
    inProgressPct = 0,
    notStarted = 0,
    notStartedPct = 0,
    total = 0,
  } = summary || {};

  return (
    <Stack spacing={1.5}>
      {/* ── Today's Summary ── */}
      <ParentCard elevation={0}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
          Today's Summary
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1.5 }}>
          <MiniStatCard icon={<CompletedGlyph />} color="#16A34A" count={completed} label="Completed" pct={completedPct} />
          <MiniStatCard icon={<PendingGlyph />} color="#DC2626" count={pending} label="Pending" pct={pendingPct} />
          <MiniStatCard icon={<InProgressGlyph />} color="#F59E0B" count={inProgress} label="In Progress" pct={inProgressPct} />
          <MiniStatCard icon={<NotStartedGlyph />} color="#9CA3AF" count={notStarted} label="Not Started" pct={notStartedPct} />
        </Box>

        <SegmentedBar
          segments={[
            { pct: completedPct, color: '#16A34A' },
            { pct: pendingPct, color: '#DC2626' },
            { pct: inProgressPct, color: '#F59E0B' },
            { pct: notStartedPct, color: '#9CA3AF' },
          ]}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Assessed: <strong>{completed}</strong> of <strong>{total}</strong> learners
          </Typography>
          <Typography variant="body2" fontWeight={800}>
            {completedPct}%
          </Typography>
        </Stack>
      </ParentCard>

      {/* ── AI Smart Insights ── */}
      <ParentCard elevation={0}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
          <AiIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
            AI Smart Insights
          </Typography>
          <Box
            sx={{
              px: 0.6,
              py: 0.1,
              borderRadius: '4px',
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              color: 'secondary.main',
              fontSize: '9px',
              fontWeight: 700,
            }}
          >
            BETA
          </Box>
        </Stack>

        <Stack
          spacing={1}
          sx={{ maxHeight: 132, overflowY: 'auto', pr: 0.5 }}
        >
          {insights.map((insight, i) => (
            <Box
              key={i}
              sx={{
                p: 1,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: 12.5 }}>
                {insight.text}
              </Typography>
              {insight.detail && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {insight.detail}
                </Typography>
              )}
            </Box>
          ))}
          {insights.length === 0 && (
            <Typography variant="caption" color="text.disabled">
              No notable changes detected this week.
            </Typography>
          )}
        </Stack>

        <Button
          size="small"
          fullWidth
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          onClick={onViewAllInsights}
          sx={{ mt: 1, fontSize: 12 }}
        >
          View Full Insights
        </Button>
      </ParentCard>

      {/* ── Quick Actions ── */}
      <ParentCard elevation={0}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
          Quick Actions
        </Typography>
        <QuickActionButton
          icon={<AutoFillIcon fontSize="small" />}
          label="Auto-fill from Previous Term"
          onClick={onAutoFillFromPrevious}
          disabled={!autoFillAvailable}
        />
        <QuickActionButton
          icon={<ApplyScoreIcon fontSize="small" />}
          label={`Apply Score to Selected${selectedCount ? ` (${selectedCount})` : ''}`}
          onClick={onApplyScoreToSelected}
          disabled={!selectedCount}
        />
        <QuickActionButton
          icon={<ClearIcon fontSize="small" />}
          label={`Clear Selected${selectedCount ? ` (${selectedCount})` : ''}`}
          onClick={onClearSelected}
          disabled={!selectedCount}
        />
        <QuickActionButton
          icon={<DownloadIcon fontSize="small" />}
          label="Export to Excel/PDF"
          onClick={onExportClick}
        />
        <QuickActionButton
          icon={<HistoryIcon fontSize="small" />}
          label="View Assessment History"
          onClick={onViewHistory}
        />
      </ParentCard>

      <Button variant="contained" size="small" fullWidth onClick={onSubmit} disabled={submitting || !canSubmit || !learnersCount}>
        {submitting ? 'Submitting...' : 'Submit Final Assessments'}
      </Button>
    </Stack>
  );
};

export default MarkPsychomotorSidebar;
