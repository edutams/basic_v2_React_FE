import { Box, Typography, Stack, Button, alpha, useTheme } from '@mui/material';
import {
  ReportProblem as InsightIcon,
  AutoAwesome as AiIcon,
  PlaylistAddCheck as ApplyAllIcon,
  ContentCopy as CopyChoicesIcon,
  SwapHoriz as MigrateIcon,
} from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';

// Tight padding on every sidebar card — the default ParentCard/CardContent
// padding left a lot of dead space in a column this narrow.
const cardSx = {
  '& .MuiCardContent-root': { p: 1.25, '&:last-child': { pb: 1.25 } },
};

const InsightRow = ({ text, detail, onReview }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.75 }}>
    <InsightIcon sx={{ fontSize: 18, color: 'warning.main', mt: 0.25, flexShrink: 0 }} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
        {text}
      </Typography>
      {detail && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {detail}
        </Typography>
      )}
    </Box>
    {onReview && (
      <Button size="small" variant="outlined" onClick={onReview} sx={{ flexShrink: 0, fontSize: 11, py: 0.25 }}>
        Review
      </Button>
    )}
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
 * Right-hand sidebar for the redesigned Subject Registration page:
 * Registration Insights (rule-based, real counts — incomplete/unsaved — no
 * LLM call), AI Suggestions (same rule-based convention, scoped to optional-
 * subject patterns), and Quick Actions.
 */
const SubjectRegistrationSidebar = ({
  incompleteCount,
  pendingChangesCount,
  aiSuggestions = [],
  onReviewIncomplete,
  onApplyCompulsoryToAll,
  onCopyChoices,
  onMigrate,
  canManage,
  canBulkRegister,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const insights = [];
  if (incompleteCount > 0) {
    insights.push({
      text: `${incompleteCount} learner${incompleteCount > 1 ? 's' : ''} have incomplete registrations`,
      detail: 'These do not have all required core subjects.',
      onReview: onReviewIncomplete,
    });
  }
  if (pendingChangesCount > 0) {
    insights.push({
      text: `${pendingChangesCount} change${pendingChangesCount > 1 ? 's' : ''} not yet saved`,
      detail: 'You have unpublished changes on this page.',
    });
  }

  return (
    <Stack spacing={1.25}>
      <ParentCard elevation={0} sx={cardSx}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
          Registration Insights
        </Typography>
        {insights.length === 0 ? (
          <Typography variant="caption" color="text.disabled">
            No notable issues detected.
          </Typography>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
            {insights.map((insight, i) => (
              <InsightRow key={i} {...insight} />
            ))}
          </Stack>
        )}
      </ParentCard>

      <ParentCard elevation={0} sx={cardSx}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
          <AiIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
            AI Suggestions
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
        {aiSuggestions.length === 0 ? (
          <Typography variant="caption" color="text.disabled">
            No notable patterns detected.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ maxHeight: 132, overflowY: 'auto', pr: 0.5 }}>
            {aiSuggestions.map((s, i) => (
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
                  {s.text}
                </Typography>
                {s.detail && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {s.detail}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </ParentCard>

      <ParentCard elevation={0} sx={cardSx}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
          Quick Actions
        </Typography>
        <QuickActionButton
          icon={<ApplyAllIcon fontSize="small" />}
          label="Apply core subjects to all"
          onClick={onApplyCompulsoryToAll}
          disabled={!canManage}
        />
        <QuickActionButton
          icon={<CopyChoicesIcon fontSize="small" />}
          label="Copy choices from a learner"
          onClick={onCopyChoices}
          disabled={!canManage}
        />
        {canBulkRegister && (
          <QuickActionButton
            icon={<MigrateIcon fontSize="small" />}
            label="Migrate from previous term"
            onClick={onMigrate}
          />
        )}
      </ParentCard>
    </Stack>
  );
};

export default SubjectRegistrationSidebar;
