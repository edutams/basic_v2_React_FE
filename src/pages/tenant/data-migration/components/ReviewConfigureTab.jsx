import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
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
import { IconArrowLeft } from '@tabler/icons-react';
import SectionPaper from './SectionPaper';
import ActionBar from './ActionBar';
import { DATA_TYPES, SETTLED_RUN_STATUSES } from '../domainTypes';
import { triggerMigration, fetchMigrationStatus } from '@/api/tenant/dataMigration/dataMigrationApi';

const CONFLICT_OPTIONS = [
  { value: 'keep_v2', label: 'Keep V2, skip V1', detail: 'Safest. Edits made in V2 are never touched.' },
  { value: 'update_if_changed', label: 'Update if V1 changed since last run', detail: 'For schools still using V1 during the switch. Not implemented yet — behaves like "Keep V2" for now.' },
  { value: 'always_v1', label: 'Always use V1', detail: 'Overwrites changes made in V2. Not implemented yet — behaves like "Keep V2" for now.', danger: true },
];

const POLL_INTERVAL_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ReviewConfigureTab = ({ selectedDomains, setSelectedDomains, conflictStrategy, setConflictStrategy, onBack, onContinue }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [dryRunResults, setDryRunResults] = useState({});
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunError, setDryRunError] = useState('');
  const [hasRunDryRun, setHasRunDryRun] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const toggleDomain = (key) => {
    setSelectedDomains((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const pollUntilSettled = async (domains) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const results = await Promise.all(domains.map((domain) => fetchMigrationStatus(domain)));
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
  };

  const runDryRun = async () => {
    if (selectedDomains.length === 0) {
      return;
    }

    setDryRunLoading(true);
    setDryRunError('');
    setHasRunDryRun(false);
    setStartError('');

    try {
      await Promise.all(
        selectedDomains.map((domain) => triggerMigration({ domain, dryRun: true, conflictStrategy })),
      );
      await pollUntilSettled(selectedDomains);
      setHasRunDryRun(true);
    } catch (err) {
      setDryRunError(err?.response?.data?.message || 'Failed to run the dry run.');
    } finally {
      setDryRunLoading(false);
    }
  };

  const startMigration = async () => {
    setStarting(true);
    setStartError('');

    try {
      await Promise.all(
        selectedDomains.map((domain) => triggerMigration({ domain, dryRun: false, conflictStrategy })),
      );
      onContinue();
    } catch (err) {
      setStartError(err?.response?.data?.message || 'Failed to start the migration.');
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
            title="What to migrate"
            subtitle="Only data types with a migration built are selectable today — the rest are coming in a later update."
          >
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
          </SectionPaper>

          {dryRunError && (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {dryRunError}
            </Alert>
          )}

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

            {hasRunDryRun && (
              <SectionPaper
                sx={{
                  bgcolor: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE',
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Last dry run</Typography>
                <Typography sx={{ fontSize: 12.5 }}>
                  <Typography component="span" sx={{ fontWeight: 700 }}>
                    {totals.errors} errors
                  </Typography>
                  , {totals.eligible.toLocaleString()} records would be copied. Nothing was saved.
                </Typography>
              </SectionPaper>
            )}
          </Box>
        </Grid>
      </Grid>

      {startError && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {startError}
        </Alert>
      )}

      <ActionBar
        status={
          dryRunLoading
            ? 'Running dry run — checking what would happen, nothing is written yet…'
            : `${selectedDomains.length} of ${DATA_TYPES.filter((r) => r.available).length} available data types selected`
        }
      >
        <Button
          variant="outlined"
          onClick={runDryRun}
          disabled={dryRunLoading || starting || selectedDomains.length === 0}
          sx={{ textTransform: 'none', fontWeight: 600, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
        >
          {hasRunDryRun ? 'Run dry run again' : 'Run dry run'}
        </Button>
        <Button
          variant="contained"
          onClick={startMigration}
          disabled={!hasRunDryRun || dryRunLoading || starting}
          sx={{ bgcolor: '#fff', color: '#0f172a', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }}
        >
          {starting ? 'Starting…' : 'Start migration'}
        </Button>
      </ActionBar>
    </Box>
  );
};

export default ReviewConfigureTab;
