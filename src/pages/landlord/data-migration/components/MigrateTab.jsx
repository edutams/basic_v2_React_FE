import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, LinearProgress, Typography, useTheme } from '@mui/material';
import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import SectionPaper from '@/pages/tenant/data-migration/components/SectionPaper';
import { DATA_TYPE_BY_KEY, SETTLED_RUN_STATUSES } from '@/pages/tenant/data-migration/domainTypes';
import { fetchMigrationStatus } from '@/api/landlord/dataMigration/dataMigrationApi';

const POLL_INTERVAL_MS = 3000;
// Soft cap, not a hard failure — a real migration can legitimately run long.
// After this many automatic checks, stop polling on its own and let the
// admin resume manually instead of silently hammering the server forever
// (confirmed live, 2026-11-10: an unbounded loop here is a real problem).
const MAX_AUTO_POLL_ATTEMPTS = 100; // ~5 minutes at POLL_INTERVAL_MS

const StatusIcon = ({ status }) => {
  if (status === 'completed') {
    return (
      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconCheck size={12} color="#fff" stroke={3} />
      </Box>
    );
  }
  if (status === 'failed') {
    return (
      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconX size={12} color="#fff" stroke={3} />
      </Box>
    );
  }
  if (status === 'running') {
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
  return <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px dashed #cbd5e1', flexShrink: 0 }} />;
};

const detailFor = (run) => {
  if (!run) {
    return 'Waiting…';
  }
  if (run.status === 'pending') {
    return 'Queued…';
  }
  if (run.status === 'failed') {
    return run.last_error || 'Failed';
  }
  const migrated = run.migrated_count || 0;
  const eligible = run.eligible_count || 0;
  const suffix = run.error_count ? ` · ${run.error_count} errors` : '';
  return `${migrated.toLocaleString()} of ${eligible.toLocaleString()} migrated${suffix}`;
};

const MigrateTab = ({ tenantId, school, selectedDomains, onContinue }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [runsByDomain, setRunsByDomain] = useState({});
  const [autoPollStopped, setAutoPollStopped] = useState(false);
  const stoppedRef = useRef(false);

  const startPolling = () => {
    stoppedRef.current = false;
    setAutoPollStopped(false);
    let attempts = 0;

    const poll = async () => {
      if (stoppedRef.current) {
        return;
      }

      const results = await Promise.all(selectedDomains.map((domain) => fetchMigrationStatus(tenantId, domain)));
      const byDomain = {};
      results.forEach((res, i) => {
        byDomain[selectedDomains[i]] = res?.data;
      });
      setRunsByDomain(byDomain);

      const allSettled = selectedDomains.every((domain) => SETTLED_RUN_STATUSES.includes(byDomain[domain]?.status));
      attempts += 1;

      if (allSettled || stoppedRef.current) {
        return;
      }

      if (attempts >= MAX_AUTO_POLL_ATTEMPTS) {
        setAutoPollStopped(true);
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
  };

  useEffect(() => {
    startPolling();

    return () => {
      stoppedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, selectedDomains]);

  const runs = selectedDomains.map((domain) => runsByDomain[domain]);
  const allSettled = runs.length > 0 && runs.every((run) => SETTLED_RUN_STATUSES.includes(run?.status));
  const anyFailed = runs.some((run) => run?.status === 'failed');
  const totalMigrated = runs.reduce((sum, run) => sum + (run?.migrated_count || 0), 0);
  const totalEligible = runs.reduce((sum, run) => sum + (run?.eligible_count || 0), 0);
  const percent = totalEligible > 0 ? Math.round((totalMigrated / totalEligible) * 100) : allSettled ? 100 : 0;

  return (
    <Box>
      <SectionPaper sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: allSettled ? (anyFailed ? '#DC2626' : '#16A34A') : '#2563EB' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: allSettled ? (anyFailed ? '#DC2626' : '#16A34A') : '#2563EB', textTransform: 'uppercase' }}>
                {allSettled ? (anyFailed ? 'Finished with errors' : 'Complete') : 'Migrating'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
              {allSettled ? 'Copying finished' : 'Copying this school\'s data into V2'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            {totalMigrated.toLocaleString()} of {totalEligible.toLocaleString()} records
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{percent}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percent}
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
            You can leave this page — the migration keeps running in the background. Come back and check "Verify"
            once it's done.
          </Typography>
        </Box>
      </SectionPaper>

      <SectionPaper title="Progress by data type">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {selectedDomains.map((domain) => {
            const run = runsByDomain[domain];
            const rowPercent = run?.eligible_count ? Math.round(((run.migrated_count || 0) / run.eligible_count) * 100) : 0;

            return (
              <Box key={domain}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StatusIcon status={run?.status} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{DATA_TYPE_BY_KEY[domain]?.name || domain}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: run?.status === 'failed' ? '#DC2626' : '#0f172a', fontWeight: 600 }}>
                    {detailFor(run)}
                  </Typography>
                </Box>
                {run?.status === 'running' && (
                  <LinearProgress
                    variant="determinate"
                    value={rowPercent}
                    sx={{ height: 5, borderRadius: 3, mt: 0.5, ml: 3.25, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 2 }}>
          <Typography sx={{ fontSize: 12.5, color: autoPollStopped ? '#D97706' : '#64748b' }}>
            {allSettled
              ? `Finished for ${school?.tenant_name || tenantId}.`
              : autoPollStopped
                ? 'Taking longer than expected — still running in the background. Check again when ready.'
                : 'Checking every few seconds…'}
          </Typography>
          {autoPollStopped && !allSettled && (
            <Button variant="outlined" onClick={startPolling} sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}>
              Check again
            </Button>
          )}
          <Button
            variant="contained"
            onClick={onContinue}
            disabled={!allSettled}
            sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
          >
            Continue to verify →
          </Button>
        </Box>
      </SectionPaper>
    </Box>
  );
};

export default MigrateTab;
