import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, LinearProgress, Typography, useTheme } from '@mui/material';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import SectionPaper from '@/pages/tenant/data-migration/components/SectionPaper';
import { DATA_TYPE_BY_KEY, SETTLED_RUN_STATUSES } from '@/pages/tenant/data-migration/domainTypes';
import { fetchMigrationStatus, triggerMigration } from '@/api/landlord/dataMigration/dataMigrationApi';

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
  if (status === 'paused') {
    return (
      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Box sx={{ width: 2.5, height: 7, bgcolor: '#fff', mr: '2px' }} />
        <Box sx={{ width: 2.5, height: 7, bgcolor: '#fff' }} />
      </Box>
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
  const prefix = run.status === 'paused' ? 'Paused at ' : '';
  return `${prefix}${migrated.toLocaleString()} of ${eligible.toLocaleString()} migrated${suffix}`;
};

const MigrateTab = ({ tenantId, school, selectedDomains, conflictStrategy, onContinue, onBack }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [runsByDomain, setRunsByDomain] = useState({});
  const [autoPollStopped, setAutoPollStopped] = useState(false);
  const [autoContinueFailed, setAutoContinueFailed] = useState(false);
  const [continuing, setContinuing] = useState(false);
  // Null until the first status check actually resolves — distinguishes
  // "still finding out" from "checked, and nothing is there" below.
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const stoppedRef = useRef(false);

  const continueBatches = async (domains) => {
    await Promise.all(domains.map((domain) => triggerMigration(tenantId, { domain, dryRun: false, conflictStrategy })));
  };

  const startPolling = () => {
    stoppedRef.current = false;
    setAutoPollStopped(false);
    let attempts = 0;
    // Only continue a paused domain once per resume_cursor value, not on
    // every poll tick it's still seen paused — confirmed live,
    // 2026-11-13: the queue worker can take longer than one
    // POLL_INTERVAL_MS to actually pick up a dispatched job, and without
    // this a domain still reading "paused" on the next tick (because
    // nothing has processed yet) fires a second, redundant
    // MigrateTenantDataJob for the exact same run before the first one
    // even starts.
    const lastTriggeredCursor = {};

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
      setHasCheckedOnce(true);

      // Reachable directly now (every step is freely clickable — see
      // DataMigration.jsx), not only after actually clicking "Start
      // migration" in Review & configure — confirmed live, 2026-11-13:
      // landing here with nothing ever triggered meant every selected
      // domain's run was simply null (never existed, not merely
      // unsettled), which this screen had no way to tell apart from "in
      // progress" — it just kept polling and showing "Migrating…"
      // forever. No run existing at all for ANY selected domain means
      // there's genuinely nothing to wait for.
      if (selectedDomains.length === 0 || selectedDomains.every((domain) => !byDomain[domain])) {
        return;
      }

      const allSettled = selectedDomains.every((domain) => SETTLED_RUN_STATUSES.includes(byDomain[domain]?.status));
      attempts += 1;

      if (allSettled || stoppedRef.current) {
        return;
      }

      // A paused domain won't advance on its own — the backend is
      // waiting for the next batch to be triggered. Fire it
      // automatically so a domain with hundreds of thousands of rows
      // doesn't need hundreds of manual clicks to finish; "Continue
      // migrating" stays only as a manual recovery path for if this
      // automatic continue itself fails (e.g. a dropped connection).
      const pausedDomains = selectedDomains.filter((domain) => {
        const run = byDomain[domain];
        return run?.status === 'paused' && lastTriggeredCursor[domain] !== run.resume_cursor;
      });

      if (pausedDomains.length > 0) {
        pausedDomains.forEach((domain) => {
          lastTriggeredCursor[domain] = byDomain[domain].resume_cursor;
        });

        try {
          await continueBatches(pausedDomains);
        } catch (e) {
          setAutoContinueFailed(true);
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
        return;
      }

      // Falls through to here when a domain is still paused on the SAME
      // cursor already continued above (the dispatched job just hasn't
      // been picked up by the queue worker yet) — the attempts cap below
      // still applies, same as any other "nothing new to do yet" tick.

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

  const handleContinue = async () => {
    setContinuing(true);
    try {
      const pausedDomains = selectedDomains.filter((domain) => runsByDomain[domain]?.status === 'paused');
      await continueBatches(pausedDomains);
      setAutoContinueFailed(false);
      startPolling();
    } finally {
      setContinuing(false);
    }
  };

  const runs = selectedDomains.map((domain) => runsByDomain[domain]);
  const nothingMigrating = hasCheckedOnce && (selectedDomains.length === 0 || runs.every((run) => !run));
  const allSettled = runs.length > 0 && runs.every((run) => SETTLED_RUN_STATUSES.includes(run?.status));
  const anyPaused = runs.some((run) => run?.status === 'paused');
  const anyFailed = runs.some((run) => run?.status === 'failed');
  const totalMigrated = runs.reduce((sum, run) => sum + (run?.migrated_count || 0), 0);
  const totalEligible = runs.reduce((sum, run) => sum + (run?.eligible_count || 0), 0);
  // Clamped — confirmed live, 2026-11-12: every migrator in this engine
  // only finalizes its own eligible_count once, at the very end of its
  // run, while migrated_count climbs row-by-row throughout. Migrating
  // more than one domain at once means this can briefly sum one
  // already-finished domain (both counts final) with another still
  // mid-run (migrated_count already climbing, eligible_count still 0
  // until IT finishes too) — real numbers, just summed mid-flight,
  // never actually impossible once both runs settle. The display should
  // never show over 100% regardless.
  const percent = totalEligible > 0 ? Math.min(100, Math.round((totalMigrated / totalEligible) * 100)) : allSettled ? 100 : 0;
  const displayMigrated = Math.min(totalMigrated, totalEligible);

  if (nothingMigrating) {
    return (
      <SectionPaper>
        <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, borderRadius: '10px', border: '1.5px solid', borderColor: '#FDE68A', bgcolor: isDark ? 'rgba(217,119,6,0.12)' : '#FFFBEB' }}>
          <IconAlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#92400E', mb: 0.5 }}>
              Nothing is currently migrating
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#92400E', mb: 1.5 }}>
              {selectedDomains.length === 0
                ? 'No data types are selected, so there\'s nothing for this screen to show. Go to Review & configure to pick what to migrate.'
                : 'None of the selected data types have ever been started for this school. Go to Review & configure to start the migration — this screen will show real progress once it does.'}
            </Typography>
            <Button variant="contained" onClick={onBack} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' } }}>
              Go to Review & configure
            </Button>
          </Box>
        </Box>
      </SectionPaper>
    );
  }

  return (
    <Box>
      <SectionPaper sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: allSettled ? (anyFailed ? '#DC2626' : '#16A34A') : anyPaused ? '#D97706' : '#2563EB' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: allSettled ? (anyFailed ? '#DC2626' : '#16A34A') : anyPaused ? '#D97706' : '#2563EB', textTransform: 'uppercase' }}>
                {allSettled ? (anyFailed ? 'Finished with errors' : 'Complete') : anyPaused ? 'Paused' : 'Migrating'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
              {allSettled ? 'Copying finished' : 'Copying this school\'s data into V2'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            {displayMigrated.toLocaleString()} of {totalEligible.toLocaleString()} records
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
            {autoContinueFailed
              ? 'Couldn\'t start the next batch automatically — click "Continue migrating" below to retry.'
              : anyPaused && !allSettled
                ? 'Migrating in batches so this never looks stuck — the next batch starts automatically.'
                : 'You can leave this page — the migration keeps running in the background. Come back and check "Verify" once it\'s done.'}
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
          <Typography sx={{ fontSize: 12.5, color: autoContinueFailed || autoPollStopped ? '#D97706' : anyPaused ? '#D97706' : '#64748b' }}>
            {allSettled
              ? `Finished for ${school?.tenant_name || tenantId}.`
              : autoContinueFailed
                ? 'Couldn\'t start the next batch automatically — click "Continue migrating" to retry.'
                : anyPaused
                  ? 'Paused between batches — starting the next batch automatically…'
                  : autoPollStopped
                    ? 'Taking longer than expected — still running in the background. Check again when ready.'
                    : 'Checking every few seconds…'}
          </Typography>
          {autoPollStopped && !allSettled && !anyPaused && (
            <Button variant="outlined" onClick={startPolling} sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}>
              Check again
            </Button>
          )}
          {autoContinueFailed && !allSettled && (
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={continuing}
              sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
            >
              {continuing ? 'Continuing…' : 'Continue migrating'}
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
