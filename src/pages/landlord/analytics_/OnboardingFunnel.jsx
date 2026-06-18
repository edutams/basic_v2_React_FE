import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Stack,
  Divider,
} from '@mui/material';

const FunnelBar = ({ stage, count, percentage, color }) => (
  <Box mb={2.5}>
    <Box display="flex" justifyContent="space-between" mb={0.5}>
      <Typography variant="body2" fontWeight={600}>
        {stage}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {count?.toLocaleString()}
        </Typography>
        <Chip
          label={`${percentage}%`}
          size="small"
          sx={{ bgcolor: color, color: '#fff', fontWeight: 700, fontSize: 11, height: 20 }}
        />
      </Stack>
    </Box>
    <LinearProgress
      variant="determinate"
      value={Math.min(percentage, 100)}
      sx={{
        height: 10,
        borderRadius: 4,
        bgcolor: '#f0f0f0',
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
      }}
    />
  </Box>
);

const funnelColors = ['#4A3AFF', '#2CA87F', '#F4A92B', '#2e7d32'];

const OnboardingFunnel = ({ data, loading }) => {
  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  if (!data) return null;

  const funnel = data.funnel ?? [];
  const stageBreakdown = data.stage_breakdown ?? [];
  const apps = data.applications ?? {};
  const onboarding = data.onboarding ?? {};

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Onboarding Funnel
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 4,
        }}
      >
        {[
          {
            label: 'Avg. Approval Time',
            value: `${data.avg_approval_days} days`,
            color: 'text.primary',
          },
          {
            label: 'Avg. Onboarding Time',
            value: `${data.avg_onboarding_days} days`,
            color: 'text.primary',
          },
          { label: 'Approval Rate', value: `${data.approval_rate}%`, color: 'success.main' },
          { label: 'Onboarding Rate', value: `${data.onboarding_rate}%`, color: 'primary.main' },
        ].map((s, i, arr) => (
          <Box
            key={s.label}
            sx={{
              p: 2,
              borderRight: i < arr.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              {s.label}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={s.color}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* Funnel bars */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Conversion Funnel
          </Typography>
          {funnel.map((f, i) => (
            <FunnelBar
              key={f.stage}
              stage={f.stage}
              count={f.count}
              percentage={f.percentage}
              color={funnelColors[i] ?? '#9e9e9e'}
            />
          ))}
        </Box>

        {/* Stage breakdown */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Onboarding Stage Breakdown
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                    Stage
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                    Schools
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stageBreakdown.map((s) => (
                  <TableRow key={s.stage} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {s.label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {s.count}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          s.stage === 5 ? 'Done' : s.stage === 0 ? 'Not Started' : 'In Progress'
                        }
                        size="small"
                        sx={{
                          fontSize: 10,
                          height: 20,
                          fontWeight: 700,
                          bgcolor:
                            s.stage === 5 ? '#e8f5e9' : s.stage === 0 ? '#fafafa' : '#fff8e1',
                          color: s.stage === 5 ? '#2e7d32' : s.stage === 0 ? '#9e9e9e' : '#f57f17',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Application summary */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 1,
            }}
          >
            {[
              { label: 'Pending Apps', value: apps.pending, color: 'warning.main' },
              { label: 'Approved Apps', value: apps.approved, color: 'success.main' },
              { label: 'Rejected Apps', value: apps.rejected, color: 'error.main' },
            ].map((s) => (
              <Box key={s.label} textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block">
                  {s.label}
                </Typography>
                <Typography variant="h6" fontWeight={700} color={s.color}>
                  {s.value ?? 0}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingFunnel;
