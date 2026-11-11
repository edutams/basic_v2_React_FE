import React, { useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { IconHistory } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import MigrationStepper from '@/pages/tenant/data-migration/components/MigrationStepper';
import { AVAILABLE_DOMAIN_KEYS } from '@/pages/tenant/data-migration/domainTypes';
import SchoolPickerTab from './components/SchoolPickerTab';
import ConnectScanTab from './components/ConnectScanTab';
import ReviewConfigureTab from './components/ReviewConfigureTab';
import MigrateTab from './components/MigrateTab';
import VerifyTab from './components/VerifyTab';

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
  const [activeStep, setActiveStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [school, setSchool] = useState(null);
  const [selectedDomains, setSelectedDomains] = useState(AVAILABLE_DOMAIN_KEYS);
  // Defaults to always_v1, not keep_v2 — the whole point of a first-time
  // migration is a faithful, complete copy of V1's real data, including
  // records that happen to name-match something V2 already seeded by
  // default (e.g. a default class/division at tenant onboarding). keep_v2
  // matters more for a later, incremental re-run once a school has
  // actually started editing things in V2 themselves.
  const [conflictStrategy, setConflictStrategy] = useState('always_v1');

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

  const goToStep = (index) => {
    if (index <= maxStepReached) {
      setActiveStep(index);
    }
  };

  const advanceTo = (index) => {
    setMaxStepReached((prev) => Math.max(prev, index));
    setActiveStep(index);
  };

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
            onViewRunHistory={() => {
              setMaxStepReached((prev) => Math.max(prev, 4));
              setActiveStep(4);
            }}
          />
        );
      case 3:
        return <MigrateTab tenantId={school.id} school={school} selectedDomains={selectedDomains} onContinue={() => advanceTo(4)} />;
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
          // Run history is a read-only view (it only needs tenantId, not
          // anything set by steps 2/3) — gating it behind maxStepReached
          // meant the one moment you'd actually want to check it (a dry
          // run or migration that looks stuck) was exactly when you
          // couldn't reach it yet, since you hadn't completed those
          // steps. Bypasses goToStep()'s "no skipping ahead" restriction
          // on purpose, rather than reusing it.
          onClick={() => {
            setMaxStepReached((prev) => Math.max(prev, 4));
            setActiveStep(4);
          }}
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
                setMaxStepReached(0);
              }}
              sx={{ ml: 1, textTransform: 'none', fontSize: 12 }}
            >
              Change school
            </Button>
          )}
        </Typography>
      )}

      <MigrationStepper steps={STEPS} activeStep={activeStep} onStepClick={goToStep} />

      {renderStep()}
    </PageContainer>
  );
};

export default DataMigration;
