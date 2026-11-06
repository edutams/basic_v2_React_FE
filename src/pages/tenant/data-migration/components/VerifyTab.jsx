import React from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconDownload,
  IconLayoutDashboard,
  IconFileCheck,
  IconUserCheck,
  IconAlertCircle,
  IconListDetails,
} from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import SectionPaper from './SectionPaper';
import {
  DUMMY_RUN_PROGRESS,
  DUMMY_VERIFICATION_CHECKS,
  DUMMY_FOLLOW_UPS,
  DUMMY_RUN_HISTORY,
} from '../dummyData';

const followUpChip = (status) => {
  if (status === 'Not copied') {
    return <Chip size="small" label={status} sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 11, height: 22 }} />;
  }
  return <Chip size="small" label={status} sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: 11, height: 22 }} />;
};

const VerifyTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <SectionPaper sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconCircleCheck size={22} color="#16A34A" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800 }}>Migration complete</Typography>
              <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
                Run #{DUMMY_RUN_PROGRESS.runNumber} · finished today at 10:48 · took 27 minutes. 12 records
                couldn&apos;t be copied and 203 were copied with flags.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="outlined" startIcon={<IconDownload size={16} />} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Full report (CSV)
            </Button>
            <Button
              variant="contained"
              startIcon={<IconLayoutDashboard size={16} />}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Go to dashboard
            </Button>
          </Box>
        </Box>
      </SectionPaper>

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard align="left" icon={IconFileCheck} colorIndex={1} count="81,020" label="Copied" subtitle="203 with flags" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard align="left" icon={IconUserCheck} colorIndex={1} count={38} label="Already in V2" subtitle="Left unchanged" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard align="left" icon={IconAlertCircle} colorIndex={4} accent count={12} label="Not copied" subtitle="Need a fix in V1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard align="left" icon={IconListDetails} colorIndex={2} count="184,220" label="Not selected" subtitle="Attendance" />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionPaper title="Verification" subtitle="We compared V2 against V1 after copying.">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {DUMMY_VERIFICATION_CHECKS.map((check) => (
                <Box key={check.label} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {check.status === 'pass' ? (
                      <IconCircleCheck size={16} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <IconAlertTriangle size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{check.label}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#64748b' }}>{check.detail}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{check.ratio}</Typography>
                </Box>
              ))}
            </Box>
          </SectionPaper>

          <SectionPaper title="Items to follow up" sx={{ mt: 1.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>ISSUE</TableCell>
                  <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>RECORDS</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>STATUS</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>NEXT STEP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_FOLLOW_UPS.map((row) => (
                  <TableRow key={row.issue}>
                    <TableCell sx={{ fontSize: 13 }}>{row.issue}</TableCell>
                    <TableCell align="right" sx={{ fontSize: 13 }}>{row.records}</TableCell>
                    <TableCell>{followUpChip(row.status)}</TableCell>
                    <TableCell>
                      <Typography component="a" href="#" sx={{ fontSize: 12.5, fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'underline' }}>
                        {row.nextStep}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SectionPaper
              title="Run it again"
              subtitle="Fixed something in V1, or still using V1 during the switch? A new run copies only new and changed records. Nothing is duplicated."
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Start a new run
                </Button>
                <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Retry the 12 not copied
                </Button>
                <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Add attendance (184,220)
                </Button>
              </Box>
            </SectionPaper>

            <SectionPaper title="Run history">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {DUMMY_RUN_HISTORY.map((run) => (
                  <Box key={run.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{run.label}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                        {run.when} · {run.by}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 12.5, color: run.status === 'Complete' ? '#16A34A' : '#64748b', fontWeight: 600 }}>
                      {run.status}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </SectionPaper>

            <SectionPaper
              title="Finished with V1?"
              sx={{
                border: '1.5px dashed',
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
              }}
            >
              <Typography sx={{ fontSize: 12.5, color: '#64748b', mb: 1 }}>
                Mark the migration as final to stop syncing reminders. You can still re-run later if needed.
              </Typography>
              <Button fullWidth variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Mark as final
              </Button>
            </SectionPaper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VerifyTab;
