import React from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { IconRefresh, IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import {
  IconDatabase,
  IconCategory,
  IconCircleCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import SectionPaper from './SectionPaper';
import ActionBar from './ActionBar';
import { DUMMY_SCHOOL, DUMMY_DATA_TYPES, DUMMY_READINESS_CHECKS } from '../dummyData';

const ConnectScanTab = ({ onContinue }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalInV1 = DUMMY_DATA_TYPES.reduce((sum, row) => sum + row.inV1, 0);
  const alreadyInV2 = DUMMY_DATA_TYPES.reduce((sum, row) => sum + row.inV2, 0);
  const needsAttention = DUMMY_READINESS_CHECKS.find((c) => c.status === 'warning');
  const needsAttentionCount = needsAttention ? parseInt(needsAttention.label, 10) : 0;

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            align="left"
            icon={IconDatabase}
            colorIndex={0}
            count={totalInV1.toLocaleString()}
            label="Records found in V1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            align="left"
            icon={IconCategory}
            colorIndex={1}
            count={DUMMY_DATA_TYPES.length}
            label="Data types"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            align="left"
            icon={IconCircleCheck}
            colorIndex={1}
            count={alreadyInV2}
            label="Already in V2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            align="left"
            icon={IconAlertCircle}
            colorIndex={3}
            accent
            count={needsAttentionCount}
            label="Need your attention"
          />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionPaper
            title="What we found in V1"
            subtitle="Listed in the order they'll be migrated — each type waits for the ones it depends on."
            action={
              <Typography sx={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
                {DUMMY_SCHOOL.scannedAt}
              </Typography>
            }
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>DATA TYPE</TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>IN V1</TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>ALREADY IN V2</TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>TO COPY</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>WAITS FOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DUMMY_DATA_TYPES.map((row, index) => (
                    <TableRow key={row.key}>
                      <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                        <Typography component="span" sx={{ fontSize: 11, color: '#94a3b8', mr: 1 }}>
                          {String(index + 1).padStart(2, '0')}
                        </Typography>
                        {row.name}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>{row.inV1.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>{row.inV2.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700 }}>{row.toCopy.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: 12.5, color: '#64748b' }}>
                        {row.waitsFor.length ? row.waitsFor.join(', ') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SectionPaper
              title="V1 source"
              action={
                <Chip
                  size="small"
                  label="Connected · read-only"
                  sx={{ bgcolor: '#E6F4EA', color: '#15803D', fontSize: 11, fontWeight: 700, height: 22 }}
                />
              }
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  ['School', DUMMY_SCHOOL.name],
                  ['V1 school ID', DUMMY_SCHOOL.v1SchoolId],
                  ['Last V1 activity', DUMMY_SCHOOL.lastV1Activity],
                  ['Linked by', DUMMY_SCHOOL.linkedBy],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>{label}</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<IconRefresh size={16} />}
                  sx={{ mt: 1, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                >
                  Scan again
                </Button>
              </Box>
            </SectionPaper>

            <SectionPaper title="Readiness checks">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {DUMMY_READINESS_CHECKS.map((check) => (
                  <Box key={check.label} sx={{ display: 'flex', gap: 1 }}>
                    {check.status === 'pass' ? (
                      <IconCheck size={16} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <IconAlertTriangle size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <Box>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{check.label}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#64748b' }}>{check.detail}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </SectionPaper>
          </Box>
        </Grid>
      </Grid>

      <ActionBar status="Estimated time: 25–40 minutes. You can close this page while it runs.">
        <Button
          variant="contained"
          onClick={onContinue}
          sx={{ bgcolor: '#fff', color: '#0f172a', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }}
        >
          Continue to review →
        </Button>
      </ActionBar>
    </Box>
  );
};

export default ConnectScanTab;
