import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Checkbox,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  AutoAwesome as AiIcon,
  CheckCircle as MarkAllIcon,
  Check as PresentGlyph,
  Close as AbsentGlyph,
  AccessTime as LateGlyph,
  FileDownload as DownloadIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';

/** A mini stat card: colored icon circle + count/label/percentage — matches the design exactly, no ring chart. */
const MiniStatCard = ({ icon, color, count, label, pct }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 0.5,
      p: 0.75,
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'divider',
      minWidth: 0,
    }}
  >
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        bgcolor: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        '& svg': { fontSize: 14 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, width: '100%' }}>
      <Typography variant="body2" fontWeight={800} lineHeight={1.1}>
        {count}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', lineHeight: 1.15, fontSize: '0.6rem', whiteSpace: 'normal', wordBreak: 'normal', overflowWrap: 'break-word' }}
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

const QuickActionButton = ({ icon, label, onClick, disabled, color = 'inherit' }) => (
  <Button
    variant="outlined"
    size="small"
    fullWidth
    startIcon={icon}
    onClick={onClick}
    disabled={disabled}
    color={color}
    sx={{ justifyContent: 'flex-start', fontSize: 12.5, py: 0.65, mb: 0.75 }}
  >
    {label}
  </Button>
);

/**
 * Right-hand sidebar for the Mark Attendance tab: Today's Summary ring,
 * rule-based AI Smart Insights (deterministic templates over real counts —
 * no LLM call, same convention as the Class Register AI Insights card and
 * CommentBankService's "AI Comment Assistant"), and Quick Actions. The
 * Weekly Report toggle and Submit Attendance button are preserved here
 * since they're how marks actually get saved — not shown in the design
 * mockup, but still load-bearing functionality.
 */
const MarkAttendanceSidebar = ({
  todaySummary,
  focusDateLabel,
  insights = [],
  onViewInsight,
  onViewAllInsights,
  onMarkAllPresent,
  onSendAbsenceNotifications,
  onExportClick,
  onViewTodayDetails,
  onViewHistory,
  onPrint,
  autoSendReport,
  togglingReport,
  onToggleReport,
  canToggleReport,
  submitting,
  canSubmit,
  onSubmit,
  learnersCount,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { present = 0, presentPct = 0, absent = 0, absentPct = 0, late = 0, latePct = 0, marked = 0, total = 0, markedPct = 0 } =
    todaySummary || {};

  return (
    <Stack spacing={1.5}>
      {/* ── Today's Summary ── */}
      <ParentCard elevation={0}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
            Today's Summary
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            onClick={onViewTodayDetails}
            sx={{ fontSize: 11, minWidth: 0, p: 0 }}
          >
            View Details
          </Button>
        </Stack>

        {focusDateLabel && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
            {focusDateLabel}
          </Typography>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
          <MiniStatCard icon={<PresentGlyph />} color="#16A34A" count={present} label="Present" pct={presentPct} />
          <MiniStatCard icon={<AbsentGlyph />} color="#DC2626" count={absent} label="Absent" pct={absentPct} />
          <MiniStatCard icon={<LateGlyph />} color="#F59E0B" count={late} label="Late" pct={latePct} />
        </Box>

        <SegmentedBar
          segments={[
            { pct: presentPct, color: '#16A34A' },
            { pct: absentPct, color: '#DC2626' },
            { pct: latePct, color: '#F59E0B' },
          ]}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Marked: <strong>{marked}</strong> of <strong>{total}</strong> learners
          </Typography>
          <Typography variant="body2" fontWeight={800}>
            {markedPct}%
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
          sx={{
            // Capped so one insight shows in full and the next one peeks in
            // at the bottom — a visual cue that there's more to scroll to,
            // instead of letting this card grow unbounded.
            maxHeight: 132,
            overflowY: 'auto',
            pr: 0.5,
          }}
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
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {insight.detail}
                </Typography>
              )}
              <Button
                size="small"
                onClick={() => onViewInsight?.(insight)}
                sx={{ fontSize: 11, minWidth: 0, p: 0, mt: 0.25 }}
              >
                View
              </Button>
            </Box>
          ))}
          {insights.length === 0 && (
            <Typography variant="caption" color="text.disabled">
              No notable changes detected today.
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
          View Detailed Insights
        </Button>
      </ParentCard>

      {/* ── Quick Actions ── */}
      <ParentCard elevation={0}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
          Quick Actions
        </Typography>
        <QuickActionButton
          icon={<MarkAllIcon fontSize="small" color="success" />}
          label="Mark all present (today)"
          onClick={onMarkAllPresent}
          disabled={!learnersCount}
        />
        <QuickActionButton
          icon={<EmailIcon fontSize="small" />}
          label="Send absence notifications"
          onClick={onSendAbsenceNotifications}
          disabled={!learnersCount}
        />
        <QuickActionButton
          icon={<DownloadIcon fontSize="small" />}
          label="Export attendance (Excel/PDF)"
          onClick={onExportClick}
        />
        <QuickActionButton
          icon={<HistoryIcon fontSize="small" />}
          label="View attendance history"
          onClick={onViewHistory}
        />
        <QuickActionButton
          icon={<PrintIcon fontSize="small" />}
          label="Print attendance sheet"
          onClick={onPrint}
        />
      </ParentCard>

      {/* ── Weekly Report toggle (existing functionality, preserved) ── */}
      <ParentCard elevation={0}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Checkbox
            checked={autoSendReport}
            disabled={togglingReport || !canToggleReport}
            onChange={onToggleReport}
            size="small"
            sx={{ p: 0.25, mt: -0.25 }}
          />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
              Weekly Report to Guardians
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {autoSendReport
                ? 'A weekly attendance summary with PDF and Excel report will be automatically emailed to parents/guardians every week via the scheduler.'
                : 'Auto-send weekly attendance reports to guardians.'}
            </Typography>
          </Box>
        </Stack>
      </ParentCard>

      <Button variant="contained" size="small" fullWidth onClick={onSubmit} disabled={submitting || !canSubmit}>
        {submitting ? 'Submitting...' : 'Submit Attendance'}
      </Button>
    </Stack>
  );
};

export default MarkAttendanceSidebar;
