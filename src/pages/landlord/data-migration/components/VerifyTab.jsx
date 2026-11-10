import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { IconCircleCheck, IconAlertTriangle, IconFileCheck, IconAlertCircle, IconListDetails } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import SectionPaper from '@/pages/tenant/data-migration/components/SectionPaper';
import { DATA_TYPE_BY_KEY } from '@/pages/tenant/data-migration/domainTypes';
import { fetchMigrationStatus, fetchMigrationHistory } from '@/api/landlord/dataMigration/dataMigrationApi';

const statusChip = (status) => {
  const map = {
    completed: { bg: '#DCFCE7', color: '#15803D' },
    failed: { bg: '#FEF2F2', color: '#DC2626' },
    running: { bg: '#DBEAFE', color: '#1D4ED8' },
    pending: { bg: '#F1F5F9', color: '#64748b' },
  };
  const style = map[status] || map.pending;

  return <Chip size="small" label={status || 'unknown'} sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: 11, height: 22, textTransform: 'capitalize' }} />;
};

const VerifyTab = ({ tenantId, selectedDomains, onStartNewRun }) => {
  const [runsByDomain, setRunsByDomain] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmNewRun, setConfirmNewRun] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      Promise.all(selectedDomains.map((domain) => fetchMigrationStatus(tenantId, domain))),
      fetchMigrationHistory(tenantId),
    ])
      .then(([statusResults, historyRes]) => {
        const byDomain = {};
        statusResults.forEach((res, i) => {
          byDomain[selectedDomains[i]] = res?.data;
        });
        setRunsByDomain(byDomain);
        setHistory(historyRes?.data?.data || []);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, selectedDomains]);

  const runs = selectedDomains.map((domain) => runsByDomain[domain]).filter(Boolean);
  const totalMigrated = runs.reduce((sum, run) => sum + (run.migrated_count || 0), 0);
  const totalSkipped = runs.reduce((sum, run) => sum + (run.skipped_count || 0), 0);
  const totalErrors = runs.reduce((sum, run) => sum + (run.error_count || 0), 0);
  const anyFailed = runs.some((run) => run.status === 'failed');

  const allIssues = selectedDomains.flatMap((domain) => {
    const run = runsByDomain[domain];
    return (run?.issues || []).map((issue) => ({ ...issue, domain }));
  });

  return (
    <Box>
      <SectionPaper sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: anyFailed ? '#FEF2F2' : '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {anyFailed ? <IconAlertTriangle size={22} color="#DC2626" /> : <IconCircleCheck size={22} color="#16A34A" />}
          </Box>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
              {anyFailed ? 'Migration finished with errors' : 'Migration complete'}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
              {totalErrors > 0
                ? `${totalErrors} record${totalErrors === 1 ? '' : 's'} couldn't be copied — see "Items to follow up" below.`
                : 'Every eligible record copied cleanly.'}
            </Typography>
          </Box>
        </Box>
      </SectionPaper>

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard align="left" icon={IconFileCheck} colorIndex={1} loading={loading} count={totalMigrated.toLocaleString()} label="Copied" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard align="left" icon={IconListDetails} colorIndex={2} loading={loading} count={totalSkipped.toLocaleString()} label="Skipped" subtitle="Already in V2 or unresolved" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard align="left" icon={IconAlertCircle} colorIndex={4} accent loading={loading} count={totalErrors.toLocaleString()} label="Not copied" subtitle="Need a fix in V1" />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionPaper title="Results by data type">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>DATA TYPE</TableCell>
                  <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>COPIED</TableCell>
                  <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>ELIGIBLE</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDomains.map((domain) => {
                  const run = runsByDomain[domain];
                  return (
                    <TableRow key={domain}>
                      <TableCell sx={{ fontSize: 13 }}>{DATA_TYPE_BY_KEY[domain]?.name || domain}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>{(run?.migrated_count || 0).toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>{(run?.eligible_count || 0).toLocaleString()}</TableCell>
                      <TableCell>{statusChip(run?.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionPaper>

          <SectionPaper title={`Items to follow up (${allIssues.length})`} sx={{ mt: 1.5 }}>
            {allIssues.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: '#64748b' }}>Nothing to follow up on.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>DATA TYPE</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>ISSUE</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>SEVERITY</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allIssues.map((issue, idx) => (
                    <TableRow key={`${issue.domain}-${issue.source_table}-${issue.source_id}-${idx}`}>
                      <TableCell sx={{ fontSize: 13 }}>{DATA_TYPE_BY_KEY[issue.domain]?.name || issue.domain}</TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{issue.message}</TableCell>
                      <TableCell sx={{ fontSize: 12.5, textTransform: 'capitalize', color: issue.issue_type === 'error' ? '#DC2626' : '#D97706' }}>
                        {issue.issue_type}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SectionPaper
              title="Run it again"
              subtitle="Fixed something in V1, or still using V1 during the switch? A new run copies only new and changed records — nothing is duplicated."
            >
              <Button variant="contained" onClick={() => setConfirmNewRun(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Start a new run
              </Button>
            </SectionPaper>

            <SectionPaper title="Run history">
              {history.length === 0 ? (
                <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>No runs yet.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {history.slice(0, 8).map((run) => (
                    <Box key={run.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          {DATA_TYPE_BY_KEY[run.domain]?.name || run.domain}
                          {run.dry_run ? ' (dry run)' : ''}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                          {run.started_at ? new Date(run.started_at).toLocaleString() : '—'}
                        </Typography>
                      </Box>
                      {statusChip(run.status)}
                    </Box>
                  ))}
                </Box>
              )}
            </SectionPaper>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={confirmNewRun} onClose={() => setConfirmNewRun(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconAlertTriangle size={20} color="#2563EB" />
          Start a new run?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5 }}>
            This takes you back to Review & configure for another pass. It copies only new and changed records —
            nothing already migrated is duplicated.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmNewRun(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmNewRun(false);
              onStartNewRun();
            }}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Yes, start a new run
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifyTab;
