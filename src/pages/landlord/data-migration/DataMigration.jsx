import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Typography, useTheme } from '@mui/material';
import { IconHistory, IconLoader2 } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import MigrationStepper from '@/pages/tenant/data-migration/components/MigrationStepper';
import { AVAILABLE_DOMAIN_KEYS, DATA_TYPE_BY_KEY, SETTLED_RUN_STATUSES } from '@/pages/tenant/data-migration/domainTypes';
import { fetchMigrationStatus, triggerMigration } from '@/api/landlord/dataMigration/dataMigrationApi';
import SchoolPickerTab from './components/SchoolPickerTab';
import ConnectScanTab from './components/ConnectScanTab';
import ReviewConfigureTab from './components/ReviewConfigureTab';
import MigrateTab from './components/MigrateTab';
import VerifyTab from './components/VerifyTab';

// Background-awareness poll — deliberately slower than the active-waiting
// loops inside ReviewConfigureTab/MigrateTab (4s/3s) since this just keeps
// a passive banner honest while the admin is looking at some OTHER tab,
// not racing to continue a paused batch itself.
const ACTIVE_RUN_POLL_MS = 8000;

const BCrumb = [
  { to: '/dashboard', title: 'Home' },
  { title: 'Data Migration' },
];

const STEPS = ['Choose school', 'Connect & scan', 'Review & configure', 'Migrate', 'Verify'];

/**
 * Agent-side (platform super-admin only) Stage 2 data migration — moved
 * here from the tenant side 2026-11-09 per direct CEO decision. An agent
 * picks a school first (step 0, which the tenant-side wizard never
 * needed), then runs the exact same real, backend-verified flow as before,
 * now scoped to that chosen school instead of an implicit tenant.
 */
const DataMigration = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeStep, setActiveStep] = useState(0);
  const [school, setSchool] = useState(null);
  const [selectedDomains, setSelectedDomains] = useState(AVAILABLE_DOMAIN_KEYS);
  // Lives here, not inside any one tab — confirmed live, 2026-11-13: a
  // migration keeps running on the backend regardless of which tab is
  // open, but progress was only ever VISIBLE while sitting on the one
  // tab that happened to poll for it (Migrate). Polling at this parent
  // level means every tab (Connect & scan, Review & configure, Verify)
  // can show "X is migrating right now" without each one duplicating its
  // own poll loop, and without losing track of it just because the admin
  // wandered off to look at something else.
  const [activeRuns, setActiveRuns] = useState({});
  // Defaults to always_v1, not keep_v2 — the whole point of a first-time
  // migration is a faithful, complete copy of V1's real data, including
  // records that happen to name-match something V2 already seeded by
  // default (e.g. a default class/division at tenant onboarding). keep_v2
  // matters more for a later, incremental re-run once a school has
  // actually started editing things in V2 themselves.
  const [conflictStrategy, setConflictStrategy] = useState('always_v1');

  // Runs unconditionally (not gated behind the access-level check below —
  // hooks can't be called after an early return) whenever a school and
  // at least one selected domain exist, regardless of which tab/step is
  // currently showing.
  useEffect(() => {
    if (!school || selectedDomains.length === 0) {
      return undefined;
    }

    let cancelled = false;
    // Only continue a paused domain once per resume_cursor value — same
    // debounce MigrateTab.jsx/ReviewConfigureTab.jsx already use, so a
    // slow queue pickup doesn't fire a second, redundant continuation
    // before the first one's even started.
    const lastTriggeredCursor = {};

    const poll = async () => {
      const results = await Promise.all(
        selectedDomains.map((domain) =>
          fetchMigrationStatus(school.id, domain)
            .then((res) => [domain, res?.data])
            .catch(() => [domain, null]),
        ),
      );

      if (cancelled) {
        return;
      }

      setActiveRuns((prev) => {
        const next = { ...prev };
        results.forEach(([domain, run]) => {
          if (run) {
            next[domain] = run;
          }
        });
        return next;
      });

      // Actually drives a paused domain forward from here too, not just
      // displays it — confirmed live, 2026-11-13: the background banner
      // used to only show status, so a migration silently stopped
      // making progress the moment nobody had the Migrate tab itself
      // open (the only place that used to auto-continue), even though
      // the backend was otherwise completely fine and just waiting to
      // be asked for the next batch.
      const toContinue = results.filter(([domain, run]) => {
        return run?.status === 'paused' && lastTriggeredCursor[domain] !== run.resume_cursor;
      });

      if (toContinue.length > 0) {
        toContinue.forEach(([domain, run]) => {
          lastTriggeredCursor[domain] = run.resume_cursor;
        });

        await Promise.all(
          toContinue.map(([domain, run]) =>
            triggerMigration(school.id, { domain, dryRun: Boolean(run.dry_run), conflictStrategy }).catch(() => null),
          ),
        );
      }
    };

    poll();
    const interval = setInterval(poll, ACTIVE_RUN_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school, selectedDomains, conflictStrategy]);

  // Mirrors the backend's own denyIfNotL1() gate — this is a UX
  // convenience (hide controls the user couldn't use anyway), not the
  // real enforcement; every request still gets independently rejected
  // server-side regardless of what this check does.
  if (user?.organization?.access_level !== 1) {
    return (
      <PageContainer title="Migrate from V1" description="Bring a school's records from V1 into V2">
        <Alert severity="warning">
          Data Migration is restricted to platform super-admins.
        </Alert>
      </PageContainer>
    );
  }

  // Every step is reachable directly now, not just ones already
  // "completed" — confirmed live, 2026-11-13: each tab fetches its own
  // data independently by tenantId, so jumping straight to e.g. Verify
  // or Migrate is always safe once a school is picked. Step 0 is the one
  // real prerequisite (there's no tenantId to fetch anything with before
  // that), enforced here and mirrored by MigrationStepper's own
  // isStepDisabled prop below (so a locked step shows as dimmed with a
  // tooltip, instead of silently doing nothing on click).
  const goToStep = (index) => {
    if (index === 0 || school) {
      setActiveStep(index);
    }
  };

  const advanceTo = (index) => setActiveStep(index);

  // Anything not yet settled (pending/running/paused) counts as "actively
  // migrating right now" for the cross-tab banner below.
  const runningEntries = selectedDomains
    .map((domain) => [domain, activeRuns[domain]])
    .filter(([, run]) => run && !SETTLED_RUN_STATUSES.includes(run.status));

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <SchoolPickerTab
            onSelect={(selected) => {
              setSchool(selected);
              advanceTo(1);
            }}
          />
        );
      case 1:
        return <ConnectScanTab tenantId={school.id} school={school} onContinue={() => advanceTo(2)} />;
      case 2:
        return (
          <ReviewConfigureTab
            tenantId={school.id}
            school={school}
            selectedDomains={selectedDomains}
            setSelectedDomains={setSelectedDomains}
            conflictStrategy={conflictStrategy}
            setConflictStrategy={setConflictStrategy}
            onBack={() => goToStep(1)}
            onContinue={() => advanceTo(3)}
            onViewRunHistory={() => setActiveStep(4)}
          />
        );
      case 3:
        return (
          <MigrateTab
            tenantId={school.id}
            school={school}
            selectedDomains={selectedDomains}
            conflictStrategy={conflictStrategy}
            onContinue={() => advanceTo(4)}
            onBack={() => goToStep(2)}
          />
        );
      case 4:
      default:
        return <VerifyTab tenantId={school.id} selectedDomains={selectedDomains} onStartNewRun={() => goToStep(2)} />;
    }
  };

  return (
    <PageContainer title="Migrate from V1" description="Bring a school's records from V1 into V2">
      <Breadcrumb
        title="Migrate from V1"
        subtitle="Bring a school's records from the previous platform into V2. V1 data is only read — nothing there is changed or deleted, and this can be run again safely at any time."
        items={BCrumb}
      >
        <Button
          variant="outlined"
          startIcon={<IconHistory size={16} />}
          disabled={!school}
          // Run history is a read-only view — only needs tenantId, so
          // it's always reachable once a school is picked, same as
          // every other step now.
          onClick={() => setActiveStep(4)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Run history
        </Button>
      </Breadcrumb>

      {school && (
        <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1 }}>
          School: <strong>{school.tenant_name}</strong>
          {activeStep > 0 && (
            <Button
              size="small"
              onClick={() => {
                setSchool(null);
                setActiveStep(0);
              }}
              sx={{ ml: 1, textTransform: 'none', fontSize: 12 }}
            >
              Change school
            </Button>
          )}
        </Typography>
      )}

      {runningEntries.length > 0 && activeStep !== 3 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            mb: 2,
            borderRadius: '10px',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(37,99,235,0.35)' : '#BFDBFE',
            bgcolor: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexShrink: 0,
              animation: 'spin 1.2s linear infinite',
              '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
            }}
          >
            <IconLoader2 size={18} color="#2563EB" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>
              Still migrating in the background
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: isDark ? 'rgba(255,255,255,0.75)' : '#334155' }}>
              {runningEntries
                .map(([domain, run]) => {
                  const name = DATA_TYPE_BY_KEY[domain]?.name || domain;
                  const migrated = (run.migrated_count || 0).toLocaleString();
                  const eligible = run.eligible_count || 0;

                  return eligible > 0 ? `${name} (${migrated} of ${eligible.toLocaleString()})` : `${name} (queued…)`;
                })
                .join(' · ')}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            onClick={() => setActiveStep(3)}
            sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
          >
            View progress
          </Button>
        </Box>
      )}

      <MigrationStepper steps={STEPS} activeStep={activeStep} onStepClick={goToStep} isStepDisabled={(index) => index > 0 && !school} />

      {renderStep()}
    </PageContainer>
  );
};

export default DataMigration;
