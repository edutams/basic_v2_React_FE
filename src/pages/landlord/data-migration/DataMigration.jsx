import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Typography, useTheme } from '@mui/material';
import { IconHistory, IconLoader2 } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import MigrationStepper from '@/pages/tenant/data-migration/components/MigrationStepper';
import { AVAILABLE_DOMAIN_KEYS, DATA_TYPE_BY_KEY } from '@/pages/tenant/data-migration/domainTypes';
import { fetchDependencyGraph, fetchPlanStatus } from '@/api/landlord/dataMigration/dataMigrationApi';
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
  // migration-hardening Step 4 item 7 — fetched once, not tenant-scoped
  // (the same graph applies to every school); {} until it loads, which
  // every consumer treats as "no known dependencies yet" rather than
  // crashing on an undefined lookup.
  const [dependencyGraph, setDependencyGraph] = useState({});

  useEffect(() => {
    fetchDependencyGraph()
      .then((res) => {
        if (res?.status) {
          setDependencyGraph(res.data);
        }
      })
      .catch(() => {
        // Non-fatal — every consumer already falls back to [] per domain,
        // same posture as fetchCompletedDomains()'s own failure handling.
      });
  }, []);
  // Lives here, not inside any one tab — confirmed live, 2026-11-13: a
  // migration keeps running on the backend regardless of which tab is
  // open, but progress was only ever VISIBLE while sitting on the one
  // tab that happened to poll for it (Migrate). Polling at this parent
  // level means every tab (Connect & scan, Review & configure, Verify)
  // can show "X is migrating right now" without each one duplicating its
  // own poll loop, and without losing track of it just because the admin
  // wandered off to look at something else.
  //
  // migration-hardening Step 4 item 6 — purely read-only now. The plan
  // (and every domain's batch-to-batch progress within it) is entirely
  // server-driven; this poll only ever asks what the current plan looks
  // like, never triggers or continues anything. Two independent loops
  // each deciding to "continue" the same domain was the real, confirmed
  // source of "another migration run already in progress" collisions —
  // removing every trigger call from the frontend removes that class of
  // bug outright, not just here.
  const [planRuns, setPlanRuns] = useState({});
  const [planStatusValue, setPlanStatusValue] = useState(null);
  useEffect(() => {
    // Paused entirely while the Migrate step (3) is actually showing —
    // MigrateTab already polls this exact same endpoint every 3s; running
    // both at once would just double the request volume for no benefit.
    if (!school || activeStep === 3) {
      return undefined;
    }

    let cancelled = false;

    const poll = async () => {
      const res = await fetchPlanStatus(school.id).catch(() => null);

      if (cancelled || !res?.status) {
        return;
      }

      setPlanStatusValue(res.data?.plan?.status || null);
      setPlanRuns(res.data?.runs || {});
    };

    poll();
    const interval = setInterval(poll, ACTIVE_RUN_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [school, activeStep]);

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

  // Driven by the PLAN's own domain list, not the local selectedDomains
  // state above — that state is for the NEXT run being configured on
  // Review & configure, which can differ from whatever plan is actually
  // in flight right now. Anything not yet settled (pending/running/
  // paused) counts as "actively migrating" for the cross-tab banner
  // below; a paused PLAN still shows its domains here too, since the
  // work genuinely isn't done, just not currently advancing.
  const runningEntries = Object.entries(planRuns).filter(
    ([, run]) => run && !['completed', 'failed'].includes(run.status),
  );

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
        return <ConnectScanTab tenantId={school.id} school={school} dependencyGraph={dependencyGraph} onContinue={() => advanceTo(2)} />;
      case 2:
        return (
          <ReviewConfigureTab
            tenantId={school.id}
            school={school}
            selectedDomains={selectedDomains}
            setSelectedDomains={setSelectedDomains}
            dependencyGraph={dependencyGraph}
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
              animation: planStatusValue === 'paused' ? 'none' : 'spin 1.2s linear infinite',
              '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
            }}
          >
            <IconLoader2 size={18} color="#2563EB" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>
              {planStatusValue === 'paused' ? 'Migration paused' : 'Still migrating in the background'}
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
