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

const BCrumb = [
  { to: '/school-dashboard', title: 'Home' },
  { title: 'Data Migration' },
];

const STEPS = ['Connect & scan', 'Review & configure', 'Migrate', 'Verify'];

/**
 * UI-only preview of the self-service V1 → V2 migration flow, built for
 * stakeholder sign-off before the real scan/migrate/verify logic exists.
 * Every number on screen comes from ../dummyData, not an API. Steps are
 * freely clickable for now; real sequential gating (a stage only unlocks
 * once the one before it is actually complete) lands with the real backend.
 */
const DataMigration = () => {
  const [activeStep, setActiveStep] = useState(0);

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <ConnectScanTab onContinue={() => setActiveStep(1)} />;
      case 1:
        return <ReviewConfigureTab onBack={() => setActiveStep(0)} onContinue={() => setActiveStep(2)} />;
      case 2:
        return <MigrateTab onContinue={() => setActiveStep(3)} />;
      case 3:
      default:
        return <VerifyTab />;
    }
  };

  return (
    <PageContainer title="Migrate from V1" description="Bring your school's records from V1 into V2">
      <Breadcrumb
        title="Migrate from V1"
        subtitle="Bring your school's records from the previous platform into V2. Your V1 data is only read — nothing there is changed or deleted, and you can run this again safely at any time."
        items={BCrumb}
      >
        <Button variant="outlined" startIcon={<IconHistory size={16} />} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Run history
        </Button>
      </Breadcrumb>

      <MigrationStepper steps={STEPS} activeStep={activeStep} onStepClick={setActiveStep} />

      {renderStep()}
    </PageContainer>
  );
};

export default DataMigration;
