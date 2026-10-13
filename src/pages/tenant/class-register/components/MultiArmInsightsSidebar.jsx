import { Box, Typography, Paper, Stack, Chip, Button, Skeleton, Divider } from '@mui/material';
import {
  AutoAwesome as AiIcon,
  ReportProblem as AttentionIcon,
  Bolt as QuickActionsIcon,
  Shuffle as AutoAssignIcon,
  DriveFileMove as MoveIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Badge as BadgeIcon,
  EventAvailable as MarkAttendanceIcon,
  FileDownload as ExportIcon,
  SelfImprovement as PsychomotorIcon,
  ChevronRight,
} from '@mui/icons-material';

const ListSkeleton = ({ rows = 3 }) => (
  <Stack spacing={0.75}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant="text" width={`${70 + ((i * 11) % 25)}%`} height={14} />
    ))}
  </Stack>
);

const SidebarCard = ({ icon, iconColor, title, badge, children }) => (
  <Paper elevation={0} sx={{ p: 1.25, borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#fff' }}>
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
      <Box sx={{ color: iconColor, display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={700} fontSize="0.85rem" sx={{ flex: 1 }}>
        {title}
      </Typography>
      {badge}
    </Stack>
    {children}
  </Paper>
);

const ActionButton = ({ icon, label, onClick }) => (
  <Stack
    alignItems="center"
    spacing={0.4}
    onClick={onClick}
    sx={{ flex: 1, py: 0.75, borderRadius: 1.5, border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' } }}
  >
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
    <Typography variant="caption" fontWeight={600} fontSize="0.63rem" textAlign="center" lineHeight={1.1}>
      {label}
    </Typography>
  </Stack>
);

const QuickActionItem = ({ icon, label, sub, onClick }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1}
    onClick={onClick}
    sx={{ py: 0.6, px: 0.5, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}
  >
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontSize="0.8rem">
        {label}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
          {sub}
        </Typography>
      )}
    </Box>
    <ChevronRight sx={{ fontSize: 16, color: 'text.disabled' }} />
  </Stack>
);

/**
 * Right-hand sidebar for the Multiple Arm View — AI Insights (rule-based,
 * see classMultiArmOverview's ai_insights — not a real LLM call), Needs
 * Attention (unassigned students), and Quick Actions for arm assignment.
 */
const MultiArmInsightsSidebar = ({
  overview,
  loading,
  onViewAffectedStudents,
  onAutoAssign,
  onMoveSelected,
  onExportPdf,
  onExportExcel,
  onPrintNameTags,
  onMarkAttendance,
  onMarkPsychomotor,
}) => {
  const needs = overview?.needs_attention;
  const insights = overview?.ai_insights || [];

  return (
    <Stack spacing={1.25}>
      <SidebarCard
        icon={<AiIcon fontSize="small" />}
        iconColor="#9333EA"
        title="AI Insights"
        badge={<Chip label="Beta" size="small" sx={{ bgcolor: '#F3E8FF', color: '#9333EA', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />}
      >
        <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
          <ActionButton icon={<MarkAttendanceIcon sx={{ fontSize: 18 }} />} label="Mark Attendance" onClick={onMarkAttendance} />
          <ActionButton icon={<ExportIcon sx={{ fontSize: 18 }} />} label="Export List" onClick={onExportPdf} />
          <ActionButton icon={<PsychomotorIcon sx={{ fontSize: 18 }} />} label="Mark Psychomotor" onClick={onMarkPsychomotor} />
        </Stack>
        <Divider sx={{ mb: 1 }} />
        {loading ? (
          <ListSkeleton rows={4} />
        ) : (
          <Stack spacing={0.6} sx={{ mb: 1 }}>
            {insights.map((line, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#9333EA', mt: 0.8, flexShrink: 0 }} />
                <Typography variant="body2" fontSize="0.8rem" color="text.secondary">
                  {line}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
        <Button fullWidth size="small" endIcon={<ChevronRight />} onClick={onViewAffectedStudents} sx={{ justifyContent: 'space-between', fontSize: '0.78rem' }}>
          View Detailed Insights
        </Button>
      </SidebarCard>

      <SidebarCard
        icon={<AttentionIcon fontSize="small" />}
        iconColor="#DC2626"
        title="Needs Attention"
        badge={
          !loading && (
            <Chip label={needs?.unassigned_count ?? 0} size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700, height: 18, minWidth: 22, fontSize: '0.65rem' }} />
          )
        }
      >
        {loading ? (
          <ListSkeleton rows={1} />
        ) : (
          <Typography variant="body2" fontSize="0.8rem" color="text.secondary" sx={{ mb: 1 }}>
            {needs?.unassigned_count || 0} student{needs?.unassigned_count === 1 ? ' is' : 's are'} not assigned to any arm.
          </Typography>
        )}
        <Button fullWidth size="small" color="error" endIcon={<ChevronRight />} onClick={onViewAffectedStudents} sx={{ justifyContent: 'space-between', fontSize: '0.78rem' }}>
          View Student{needs?.unassigned_count === 1 ? '' : 's'}
        </Button>
      </SidebarCard>

      <SidebarCard icon={<QuickActionsIcon fontSize="small" />} iconColor="#2563EB" title="Quick Actions">
        <QuickActionItem icon={<AutoAssignIcon sx={{ fontSize: 18 }} />} label="Auto-assign Students" sub="Balance students across arms" onClick={onAutoAssign} />
        <QuickActionItem icon={<MoveIcon sx={{ fontSize: 18 }} />} label="Move Selected Students" sub="Change arm for selected students" onClick={onMoveSelected} />
        <QuickActionItem icon={<PdfIcon sx={{ fontSize: 18 }} />} label="Generate Class List (PDF)" sub="With arm assignment" onClick={onExportPdf} />
        <QuickActionItem icon={<ExcelIcon sx={{ fontSize: 18 }} />} label="Export to Excel" sub="Download with arm details" onClick={onExportExcel} />
        <QuickActionItem icon={<BadgeIcon sx={{ fontSize: 18 }} />} label="Print Name Tags" sub="For selected or all students" onClick={onPrintNameTags} />
      </SidebarCard>
    </Stack>
  );
};

export default MultiArmInsightsSidebar;
