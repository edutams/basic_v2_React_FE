import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Link,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { IconArrowLeft, IconAlertTriangle } from '@tabler/icons-react';
import SectionPaper from '@/pages/tenant/data-migration/components/SectionPaper';
import { DATA_TYPES, DATA_TYPE_BY_KEY, SETTLED_RUN_STATUSES } from '@/pages/tenant/data-migration/domainTypes';
import { triggerMigration, fetchMigrationStatus, fetchMigrationSummary } from '@/api/landlord/dataMigration/dataMigrationApi';

const CONFLICT_OPTIONS = [
  { value: 'keep_v2', label: 'Keep V2, skip V1', detail: 'Safest. Edits made in V2 are never touched.' },
  { value: 'update_if_changed', label: 'Update if V1 changed since last run', detail: 'For schools still using V1 during the switch.' },
  { value: 'always_v1', label: 'Always use V1', detail: 'Overwrites changes made in V2.', danger: true },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Widened from 2s — confirmed live, 2026-11-11: a dry run across several
// domains routinely outlasted the old 2s/150-attempt window, and at 2s
// that meant 150+ requests just to find out it was still running. A
// slower interval over the same real-world wait cuts request volume
// without losing responsiveness (nobody's watching closely enough to
// notice the difference between a 2s and 4s refresh).
const POLL_INTERVAL_MS = 4000;

/** Rough, conservative estimate only — labeled "~" everywhere it's shown,
 * never claimed as exact. Based on how fast the domains built so far
 * actually ran against real V1 data (sessions/classes/subjects/staff:
 * low hundreds of records in a few seconds), not a real benchmark across
 * every domain yet. */
const RECORDS_PER_SECOND_ESTIMATE = 50;

const estimateDuration = (recordCount) => {
  if (!recordCount) {
    return null;
  }
  const seconds = Math.max(5, Math.ceil(recordCount / RECORDS_PER_SECOND_ESTIMATE));
  if (seconds < 60) {
    return `~${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} minute${minutes === 1 ? '' : 's'}`;
};
// Safety cap, not a tuning knob: if something never settles (a stalled
// queue worker, a genuinely huge domain), this stops hammering the server
// forever — confirmed live, 2026-11-10, that an unbounded loop here is a
// real problem, not a hypothetical one. Giving up here no longer shows an
// alarming "failed" message (see the catch block below) — Run History is
// reachable at any time now, so this is just "stop watching from this
// screen," not a dead end.
const MAX_POLL_ATTEMPTS = 90; // ~6 minutes at POLL_INTERVAL_MS

const ReviewConfigureTab = ({ tenantId, school, selectedDomains, setSelectedDomains, conflictStrategy, setConflictStrategy, onBack, onContinue, onViewRunHistory }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [summary, setSummary] = useState(null);
  const [dryRunResults, setDryRunResults] = useState({});
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunError, setDryRunError] = useState('');
  const [dryRunTimedOut, setDryRunTimedOut] = useState(false);
  const [hasRunDryRun, setHasRunDryRun] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  // Which action is pending confirmation — 'dry_run' | 'migrate' | null —
  // rather than two separate dialogs, since every action the admin clicks
  // here needs the same "confirm before it happens" treatment.
  const [confirmAction, setConfirmAction] = useState(null);

  const toggleDomain = (key) => {
    setSelectedDomains((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const availableDomainKeys = DATA_TYPES.filter((row) => row.available).map((row) => row.key);
  const allAvailableSelected = availableDomainKeys.length > 0 && availableDomainKeys.every((key) => selectedDomains.includes(key));
  const someAvailableSelected = availableDomainKeys.some((key) => selectedDomains.includes(key));

  const toggleAllDomains = () => {
    setSelectedDomains(allAvailableSelected ? [] : availableDomainKeys);
  };

  useEffect(() => {
    fetchMigrationSummary(tenantId)
      .then((res) => {
        if (res?.status) {
          setSummary(res.data);
        }
      })
      .catch(() => {
        // Non-fatal — the estimate just won't show if this fails; the
        // dry run itself doesn't depend on it.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const selectedRecordEstimate = selectedDomains.reduce((sum, domain) => sum + (summary?.[domain]?.in_v1 || 0), 0);
  const dryRunEstimate = estimateDuration(selectedRecordEstimate);

  // DATA_TYPES is already listed in dependency order (STAGE2_PLAN.md §12 —
  // e.g. Classes before Subjects, Subjects before Results). Selecting
  // several dependent domains together and firing them all at once (the
  // old Promise.all below) meant a later domain's job could start, and
  // even finish, before an earlier one it depends on had actually
  // committed anything — confirmed live, 2026-11-11: a dry run of
  // Classes+Subjects together left every Subjects row unable to find the
  // Programme Classes was supposed to have just created, since nothing
  // from one domain's job is guaranteed to exist yet when a sibling
  // domain's own separate job starts. Each domain here now runs to
  // completion (triggered, then polled until settled) before the next
  // one is even triggered.
  const orderByDependency = (domains) => {
    const order = DATA_TYPES.map((t) => t.key);
    return [...domains].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  };

  const pollUntilSettled = async (domains) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const results = await Promise.all(domains.map((domain) => fetchMigrationStatus(tenantId, domain)));
      const byDomain = {};
      results.forEach((res, i) => {
        byDomain[domains[i]] = res?.data;
      });
      setDryRunResults((prev) => ({ ...prev, ...byDomain }));

      const allSettled = domains.every((domain) => SETTLED_RUN_STATUSES.includes(byDomain[domain]?.status));
      if (allSettled) {
        return byDomain;
      }
      await sleep(POLL_INTERVAL_MS);
    }

    const timeoutError = new Error('This is taking longer than this screen watches for — it may well still be finishing in the background. Check Run History below rather than waiting here.');
    timeoutError.isTimeout = true;
    throw timeoutError;
  };

  const runDryRun = async () => {
    setConfirmAction(null);

    if (selectedDomains.length === 0) {
      return;
    }

    setDryRunLoading(true);
    setDryRunError('');
    setDryRunTimedOut(false);
    setHasRunDryRun(false);
    setStartError('');

    try {
      for (const domain of orderByDependency(selectedDomains)) {
        await triggerMigration(tenantId, { domain, dryRun: true, conflictStrategy });
        await pollUntilSettled([domain]);
      }
      setHasRunDryRun(true);
    } catch (err) {
      // pollUntilSettled() throws a plain Error (no `.response`) when
      // polling itself times out — that message ("still running, check
      // Run history") is the useful one; a real backend failure carries
      // `err.response.data.message` instead. Checking only the axios
      // shape meant a polling-timeout (confirmed live with the fuller
      // 17-domain dry run: easily longer than the ~2 minute poll window)
      // silently showed the generic "failed" message instead, making an
      // in-progress run look like an outright failure.
      setDryRunTimedOut(Boolean(err?.isTimeout));
      setDryRunError(err?.response?.data?.message || err?.message || 'Failed to run the dry run.');
    } finally {
      setDryRunLoading(false);
    }
  };

  const startMigration = async () => {
    setConfirmAction(null);
    setStarting(true);
    setStartError('');

    try {
      // Dispatched one at a time, in dependency order, but deliberately
      // NOT awaited to completion here — unlike runDryRun, the whole
      // point of this being a queued job is that the UI doesn't have to
      // sit and wait for it; the Migrate tab (onContinue) is where
      // progress is actually watched. Ordering is still preserved
      // because the queue has a single worker processing it FIFO, so
      // jobs dispatched in order are worked in that same order.
      for (const domain of orderByDependency(selectedDomains)) {
        await triggerMigration(tenantId, { domain, dryRun: false, conflictStrategy });
      }
      onContinue();
    } catch (err) {
      setStartError(err?.response?.data?.message || err?.message || 'Failed to start the migration.');
    } finally {
      setStarting(false);
    }
  };

  const totals = selectedDomains.reduce(
    (acc, domain) => {
      const run = dryRunResults[domain];
      if (!run) {
        return acc;
      }
      return {
        eligible: acc.eligible + (run.eligible_count || 0),
        errors: acc.errors + (run.error_count || 0),
      };
    },
    { eligible: 0, errors: 0 },
  );

  const allIssues = selectedDomains.flatMap((domain) => {
    const run = dryRunResults[domain];
    return (run?.issues || []).map((issue) => ({ ...issue, domain }));
  });

  const conflictLabel = CONFLICT_OPTIONS.find((o) => o.value === conflictStrategy)?.label;

  return (
    <Box>
      <Link
        component="button"
        onClick={onBack}
        underline="none"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 13, fontWeight: 600, mb: 1 }}
      >
        <IconArrowLeft size={15} /> Back to scan
      </Link>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionPaper
            title="Step 1 — Pick what to migrate, then run a dry run"
            subtitle="A dry run checks every record and tells you exactly what would happen — nothing is written to V2 yet. Always run this before the real migration."
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1,
                borderBottom: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              }}
            >
              <Checkbox
                size="small"
                checked={allAvailableSelected}
                indeterminate={!allAvailableSelected && someAvailableSelected}
                disabled={availableDomainKeys.length === 0}
                onChange={toggleAllDomains}
              />
              <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                {allAvailableSelected ? 'Deselect all' : 'Select all'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {DATA_TYPES.map((row, index) => (
                <Box
                  key={row.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                    opacity: row.available ? 1 : 0.5,
                    borderBottom: index === DATA_TYPES.length - 1 ? 'none' : '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={row.available && selectedDomains.includes(row.key)}
                    disabled={!row.available}
                    onChange={() => toggleDomain(row.key)}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{row.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                      {row.waitsFor.length ? `Waits for ${row.waitsFor.join(', ')}` : 'No dependencies'}
                    </Typography>
                  </Box>
                  {!row.available && <Chip size="small" label="Coming soon" sx={{ fontSize: 11, fontWeight: 700 }} />}
                  {row.available && dryRunResults[row.key] && (
                    <Typography sx={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {(dryRunResults[row.key].eligible_count || 0).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            {dryRunError && (
              <Alert
                severity={dryRunTimedOut ? 'warning' : 'error'}
                sx={{ mt: 1.5 }}
                action={
                  dryRunTimedOut && onViewRunHistory ? (
                    <Button color="inherit" size="small" onClick={onViewRunHistory}>
                      View Run History
                    </Button>
                  ) : undefined
                }
              >
                {dryRunError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
                  {dryRunLoading
                    ? 'Running dry run — checking what would happen, nothing is written yet…'
                    : `${selectedDomains.length} of ${DATA_TYPES.filter((r) => r.available).length} available data types selected`}
                </Typography>
                {!dryRunLoading && dryRunEstimate && (
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#2563EB', mt: 0.25 }}>
                    Estimated time: {dryRunEstimate} ({selectedRecordEstimate.toLocaleString()} records)
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={() => setConfirmAction('dry_run')}
                disabled={dryRunLoading || starting || selectedDomains.length === 0}
                sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
              >
                {dryRunLoading ? 'Checking…' : hasRunDryRun ? 'Run dry run again' : 'Run dry run'}
              </Button>
            </Box>
          </SectionPaper>

          {hasRunDryRun && (
            <SectionPaper
              title={`Needs attention (${allIssues.length})`}
              subtitle="Records that couldn't be resolved during the dry run — nothing has been written yet."
              sx={{ mt: 1.5 }}
            >
              {allIssues.length === 0 ? (
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>Nothing flagged — every eligible record resolved cleanly.</Typography>
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
                        <TableCell sx={{ fontSize: 13 }}>{issue.domain}</TableCell>
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
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SectionPaper title="If a record already exists in V2" subtitle="Applies to this run and every re-run.">
              <RadioGroup value={conflictStrategy} onChange={(e) => setConflictStrategy(e.target.value)}>
                {CONFLICT_OPTIONS.map((opt) => (
                  <Box
                    key={opt.value}
                    sx={{
                      border: '1.5px solid',
                      borderColor: conflictStrategy === opt.value ? theme.palette.primary.main : isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                      borderRadius: '10px',
                      px: 1,
                      mb: 1,
                    }}
                  >
                    <FormControlLabel
                      value={opt.value}
                      control={<Radio size="small" />}
                      sx={{ alignItems: 'flex-start', m: 0, py: 0.75 }}
                      label={
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</Typography>
                          <Typography sx={{ fontSize: 12, color: opt.danger ? '#DC2626' : '#64748b' }}>
                            {opt.detail}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </RadioGroup>
            </SectionPaper>

            <SectionPaper
              title="Step 2 — Start the real migration"
              subtitle={
                hasRunDryRun
                  ? 'Review the dry run above, then start the real migration when ready.'
                  : 'Run a dry run first (Step 1) — this unlocks once that finishes.'
              }
              sx={{
                bgcolor: hasRunDryRun ? (isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF') : undefined,
                borderColor: hasRunDryRun ? (isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE') : undefined,
              }}
            >
              {hasRunDryRun && (
                <Typography sx={{ fontSize: 12.5, mb: 1.5 }}>
                  Last dry run:{' '}
                  <Typography component="span" sx={{ fontWeight: 700 }}>
                    {totals.errors} errors
                  </Typography>
                  , {totals.eligible.toLocaleString()} records would be copied.
                </Typography>
              )}

              {startError && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  {startError}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={() => setConfirmAction('migrate')}
                disabled={!hasRunDryRun || dryRunLoading || starting}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {starting ? 'Starting…' : 'Start migration'}
              </Button>
            </SectionPaper>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={confirmAction === 'dry_run'} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconAlertTriangle size={20} color="#2563EB" />
          Confirm dry run
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, mb: 1.5 }}>
            This checks every record for <strong>{school?.tenant_name || tenantId}</strong> and reports what would
            happen. It does not write anything to V2 — completely safe to run as many times as you like.
          </Typography>
          <Typography sx={{ fontSize: 13, mb: 1 }}>
            <strong>Data types:</strong> {selectedDomains.map((d) => DATA_TYPE_BY_KEY[d]?.name || d).join(', ')}
          </Typography>
          {dryRunEstimate && (
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
              Estimated time: {dryRunEstimate} ({selectedRecordEstimate.toLocaleString()} records)
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmAction(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={runDryRun} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Yes, run dry run
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmAction === 'migrate'} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconAlertTriangle size={20} color="#D97706" />
          Confirm migration
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, mb: 1.5 }}>
            You're about to copy real data from V1 into V2 for <strong>{school?.tenant_name || tenantId}</strong>.
            This writes to the live database — it is not a preview.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
            <Typography sx={{ fontSize: 13 }}>
              <strong>Data types:</strong> {selectedDomains.map((d) => DATA_TYPE_BY_KEY[d]?.name || d).join(', ')}
            </Typography>
            <Typography sx={{ fontSize: 13 }}>
              <strong>If a record already exists:</strong> {conflictLabel}
            </Typography>
            <Typography sx={{ fontSize: 13 }}>
              <strong>Records to be copied:</strong> {totals.eligible.toLocaleString()}
            </Typography>
            {estimateDuration(totals.eligible) && (
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
                Estimated time: {estimateDuration(totals.eligible)}
              </Typography>
            )}
          </Box>
          {conflictStrategy === 'always_v1' && (
            <Alert severity="warning" sx={{ fontSize: 12.5 }}>
              "Always use V1" will overwrite any edits already made in V2 for these records.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmAction(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={startMigration} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Yes, start migration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewConfigureTab;
