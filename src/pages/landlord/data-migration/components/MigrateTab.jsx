import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, LinearProgress, Typography, useTheme } from '@mui/material';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconPlayerPause, IconPlayerPlay, IconX } from '@tabler/icons-react';
import SectionPaper from '@/pages/tenant/data-migration/components/SectionPaper';
import { DATA_TYPE_BY_KEY, dependencyNames } from '@/pages/tenant/data-migration/domainTypes';
import { fetchPlanStatus, pausePlan, resumePlan, cancelPlan, retryDomain } from '@/api/landlord/dataMigration/dataMigrationApi';

const POLL_INTERVAL_MS = 3000;

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

const detailFor = (run, waitingOnDeps) => {
  if (!run) {
    // Confirmed live, 2026-11-18: this domain's run doesn't exist yet
    // because it's genuinely blocked on one of ITS OWN dependencies, not
    // because a worker just hasn't picked it up — naming it here instead
    // of a bare "Queued…" is the whole point of waiting_on.
    if (waitingOnDeps?.length) {
      return `Waiting on ${dependencyNames(waitingOnDeps)}`;
    }

    return 'Queued…';
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

/**
 * migration-hardening Step 4 item 6 — purely read-only now. The server
 * drives every batch and every domain in a plan entirely on its own (see
 * MigrateTenantDataJob's self-chaining and DataMigrationService::advancePlan())
 * — this screen only ever asks "what's the current state" and displays it.
 * The only writes it can ever cause are the three explicit, admin-initiated
 * actions below (pause/resume/cancel), never anything that "continues"
 * progress itself.
 */
const MigrateTab = ({ tenantId, school, onContinue, onBack }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [plan, setPlan] = useState(null);
  const [runsByDomain, setRunsByDomain] = useState({});
  const [waitingOn, setWaitingOn] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const stoppedRef = useRef(false);

  const poll = async () => {
    try {
      const res = await fetchPlanStatus(tenantId);
      if (stoppedRef.current) {
        return;
      }
      if (res?.status) {
        setPlan(res.data?.plan || null);
        setRunsByDomain(res.data?.runs || {});
        setWaitingOn(res.data?.waiting_on || {});
      }
    } catch (e) {
      // Swallowed — a transient failed poll just tries again next tick;
      // nothing here ever needs to trigger a retry action.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    stoppedRef.current = false;
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      stoppedRef.current = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const runAction = async (action) => {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await action();
      if (res?.status) {
        setPlan(res.data);
      }
      await poll();
    } catch (e) {
      setActionError(e?.response?.data?.message || e?.message || 'That action failed — please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Manual circuit-breaker for one domain — unlike pause/resume/cancel
  // above (which act on the whole plan and return it), this returns the
  // retried MigrationRun itself, so it refreshes via poll() rather than
  // overwriting `plan` with the wrong shape.
  const handleRetry = async (domain) => {
    setActionLoading(true);
    setActionError('');
    try {
      await retryDomain(tenantId, domain);
      await poll();
    } catch (e) {
      setActionError(e?.response?.data?.message || e?.message || 'Could not retry this domain — please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SectionPaper>
        <Typography sx={{ fontSize: 13, color: '#64748b' }}>Checking current migration status…</Typography>
      </SectionPaper>
    );
  }

  if (!plan) {
    return (
      <SectionPaper>
        <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, borderRadius: '10px', border: '1.5px solid', borderColor: '#FDE68A', bgcolor: isDark ? 'rgba(217,119,6,0.12)' : '#FFFBEB' }}>
          <IconAlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#92400E', mb: 0.5 }}>
              Nothing is currently migrating
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#92400E', mb: 1.5 }}>
              No migration has ever been started for this school. Go to Review &amp; configure to start one — this
              screen shows real progress once it does.
            </Typography>
            <Button variant="contained" onClick={onBack} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' } }}>
              Go to Review &amp; configure
            </Button>
          </Box>
        </Box>
      </SectionPaper>
    );
  }

  const selectedDomains = plan.selected_domains || [];
  const runs = selectedDomains.map((domain) => runsByDomain[domain]);
  const allSettled = plan.status === 'completed' || plan.status === 'cancelled' || plan.status === 'failed';
  const anyFailed = runs.some((run) => run?.status === 'failed');
  const isPaused = plan.status === 'paused';
  const totalMigrated = runs.reduce((sum, run) => sum + (run?.migrated_count || 0), 0);
  const totalEligible = runs.reduce((sum, run) => sum + (run?.eligible_count || 0), 0);
  // Clamped — the same two independently-finalized counters summed
  // mid-flight across several domains can briefly overshoot 100%; see
  // this exact reasoning preserved from the pre-Step-4 version of this
  // screen.
  const percent = totalEligible > 0 ? Math.min(100, Math.round((totalMigrated / totalEligible) * 100)) : allSettled ? 100 : 0;
  const displayMigrated = Math.min(totalMigrated, totalEligible);

  const statusLabel = allSettled ? (anyFailed ? 'Finished with errors' : 'Complete') : isPaused ? 'Paused' : 'Migrating';
  const statusColor = allSettled ? (anyFailed ? '#DC2626' : '#16A34A') : isPaused ? '#D97706' : '#2563EB';

  return (
    <Box>
      <SectionPaper sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: statusColor }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: statusColor, textTransform: 'uppercase' }}>
                {statusLabel}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
              {allSettled ? 'Copying finished' : 'Copying this school\'s data into V2'}
            </Typography>
          </Box>

          {!allSettled && (
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              {plan.status === 'active' && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconPlayerPause size={14} />}
                  disabled={actionLoading}
                  onClick={() => runAction(() => pausePlan(tenantId))}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Pause
                </Button>
              )}
              {plan.status === 'paused' && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<IconPlayerPlay size={14} />}
                  disabled={actionLoading}
                  onClick={() => runAction(() => resumePlan(tenantId))}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Resume
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={actionLoading}
                onClick={() => runAction(() => cancelPlan(tenantId))}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        {actionError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {actionError}
          </Alert>
        )}

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
            {plan.status === 'cancelled'
              ? 'This migration was cancelled. Start a new one from Review & configure for anything still outstanding.'
              : isPaused
                ? 'Paused — nothing will continue until you resume. Any batch already in flight finished safely; nothing was interrupted mid-write.'
                : 'Entirely server-driven — you can leave this page and it keeps going. Come back and check "Verify" once it\'s done.'}
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
                    {detailFor(run, waitingOn[domain])}
                  </Typography>
                  {run?.status === 'failed' && (
                    <Button
                      size="small"
                      variant="text"
                      disabled={actionLoading}
                      onClick={() => handleRetry(domain)}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, flexShrink: 0, minWidth: 0, px: 1 }}
                    >
                      Retry
                    </Button>
                  )}
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
          <Typography sx={{ fontSize: 12.5, color: isPaused ? '#D97706' : '#64748b' }}>
            {allSettled ? `Finished for ${school?.tenant_name || tenantId}.` : isPaused ? 'Paused.' : 'Updating every few seconds…'}
          </Typography>
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
