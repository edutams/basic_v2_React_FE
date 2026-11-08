import React, { useState } from 'react';
import { Button } from '@mui/material';
import { IconHistory } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import MigrationStepper from './components/MigrationStepper';
import ConnectScanTab from './components/ConnectScanTab';
import ReviewConfigureTab from './components/ReviewConfigureTab';
import MigrateTab from './components/MigrateTab';
import VerifyTab from './components/VerifyTab';
import { AVAILABLE_DOMAIN_KEYS } from './domainTypes';

const BCrumb = [
  { to: '/school-dashboard', title: 'Home' },
  { title: 'Data Migration' },
];

const STEPS = ['Connect & scan', 'Review & configure', 'Migrate', 'Verify'];

/**
 * Real self-service V1 → V2 migration flow for the three domains that have
 * a backend migrator today (sessions_terms, classes, subjects — see
 * docs/migration/STAGE2_PLAN.md build order, row 1). selectedDomains and
 * conflictStrategy are lifted here because both "Review & configure" (which
 * sets them) and "Migrate" (which needs them to trigger the real run) rely
 * on the same values.
 */
const DataMigration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [selectedDomains, setSelectedDomains] = useState(AVAILABLE_DOMAIN_KEYS);
  const [conflictStrategy, setConflictStrategy] = useState('keep_v2');

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
        return <ConnectScanTab onContinue={() => advanceTo(1)} />;
      case 1:
        return (
          <ReviewConfigureTab
            selectedDomains={selectedDomains}
            setSelectedDomains={setSelectedDomains}
            conflictStrategy={conflictStrategy}
            setConflictStrategy={setConflictStrategy}
            onBack={() => goToStep(0)}
            onContinue={() => advanceTo(2)}
          />
        );
      case 2:
        return <MigrateTab selectedDomains={selectedDomains} onContinue={() => advanceTo(3)} />;
      case 3:
      default:
        return <VerifyTab selectedDomains={selectedDomains} onStartNewRun={() => goToStep(1)} />;
    }
  };

  return (
    <PageContainer title="Migrate from V1" description="Bring your school's records from V1 into V2">
      <Breadcrumb
        title="Migrate from V1"
        subtitle="Bring your school's records from the previous platform into V2. Your V1 data is only read — nothing there is changed or deleted, and you can run this again safely at any time."
        items={BCrumb}
      >
        <Button
          variant="outlined"
          startIcon={<IconHistory size={16} />}
          disabled={maxStepReached < 3}
          onClick={() => goToStep(3)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Run history
        </Button>
      </Breadcrumb>

      <MigrationStepper steps={STEPS} activeStep={activeStep} onStepClick={goToStep} />

      {renderStep()}
    </PageContainer>
  );
};

export default DataMigration;
