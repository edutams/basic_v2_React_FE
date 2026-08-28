import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Skeleton, useTheme } from '@mui/material';
import ReusableFunnelChart from '@/components/shared/charts/ReusableFunnelChart';

const AdmissionFunnel = ({ funnel = [], onViewFullReport, loading = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: '14px',
          height: '100%',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Skeleton variant="text" width="50%" height={14} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="rounded" width={`${80 - i * 12}%`} height={32} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={40} height={14} />
            </Box>
          ))}
        </Box>
        <Skeleton variant="text" width="40%" height={12} sx={{ mt: 2, mx: 'auto' }} />
      </Paper>
    );
  }

  return (
    <ReusableFunnelChart
      data={funnel}
      title="ADMISSION FUNNEL"
      layout="apex"
      footerLabel="View Full Funnel Report"
      onFooterClick={() => (onViewFullReport ? onViewFullReport() : navigate('/admission/tracker'))}
    />
  );
};

export default AdmissionFunnel;
