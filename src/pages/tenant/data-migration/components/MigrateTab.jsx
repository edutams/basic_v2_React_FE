import React from 'react';
import { Box, Button, Grid, LinearProgress, Typography, useTheme } from '@mui/material';
import { IconCheck, IconPlayerPause, IconInfoCircle } from '@tabler/icons-react';
import SectionPaper from './SectionPaper';
import { DUMMY_RUN_PROGRESS, DUMMY_PROGRESS_BY_TYPE, DUMMY_ACTIVITY_LOG } from '../dummyData';

const StatusIcon = ({ status }) => {
  if (status === 'done') {
    return (
      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconCheck size={12} color="#fff" stroke={3} />
      </Box>
    );
  }
  if (status === 'in_progress') {
    return (
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '2px solid #2563EB',
          borderTopColor: 'transparent',
          flexShrink: 0,
          animation: 'spin 0.8s linear infinite',
          '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
        }}
      />
    );
  }
  return (
    <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px dashed #cbd5e1', flexShrink: 0 }} />
  );
};

const MigrateTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const p = DUMMY_RUN_PROGRESS;

  return (
    <Box>
      <SectionPaper sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#2563EB' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                Migrating · Run #{p.runNumber}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>Copying your data into V2</Typography>
            <Typography sx={{ fontSize: 12.5, color: '#64748b', mt: 0.25 }}>
              Started {p.startedAt} by {p.startedBy} · about {p.etaMinutes} minutes left
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<IconPlayerPause size={16} />}
            sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
          >
            Pause after this batch
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            {p.copied.toLocaleString()} of {p.total.toLocaleString()} records
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{p.percent}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={p.percent}
          sx={{ height: 8, borderRadius: 4, mb: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.25,
            borderRadius: '8px',
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
          }}
        >
          <IconInfoCircle size={16} color="#64748b" style={{ flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, color: '#64748b' }}>
            You can close this page — the migration keeps running and we&apos;ll email you when it&apos;s done. Changes
            made in V1 after 10:21 will be picked up if you run it again.
          </Typography>
        </Box>
      </SectionPaper>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionPaper title="Progress by data type">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {DUMMY_PROGRESS_BY_TYPE.map((row) => (
                <Box key={row.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusIcon status={row.status} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{row.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: row.status === 'waiting' ? '#94a3b8' : '#0f172a', fontWeight: row.status === 'waiting' ? 500 : 600 }}>
                      {row.detail}
                    </Typography>
                  </Box>
                  {row.status === 'in_progress' && (
                    <LinearProgress
                      variant="determinate"
                      value={row.percent}
                      sx={{ height: 5, borderRadius: 3, mt: 0.5, ml: 3.25, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </SectionPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              borderRadius: '14px',
              bgcolor: '#0f172a',
              p: 2,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Activity</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E' }} />
                <Typography sx={{ fontSize: 11, color: '#22C55E', fontWeight: 700 }}>Live</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, fontFamily: 'monospace' }}>
              {DUMMY_ACTIVITY_LOG.map((row, idx) => (
                <Box key={`${row.time}-${idx}`}>
                  <Typography sx={{ fontSize: 11, color: '#64748b' }}>{row.time}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{row.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MigrateTab;
