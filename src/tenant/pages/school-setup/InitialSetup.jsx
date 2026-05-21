import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import tenantApi from '@/api/tenant_api';

import Stage1SchoolProfile from './stages/Stage1SchoolProfile';
import Stage2ManageSessions from './stages/Stage2ManageSessions';
import Stage3ClassArms from './stages/Stage3ClassArms';
import Stage4AddLearners from './stages/Stage4AddLearners';
import Stage5AddTeachers from './stages/Stage5AddTeachers';
import useTenantAuth from '@/hooks/useTenantAuth';

const InitialSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshTenantInfo } = useTenantAuth();

  const stage = parseInt(searchParams.get('stage') || '1', 10);
  const isEditMode = searchParams.get('edit') === 'true';

  const currentStage = isEditMode ? Math.min(stage, 5) : stage;

  const goToStage = (n) => {
    const params = new URLSearchParams();
    params.set('stage', n.toString());
    if (isEditMode) params.set('edit', 'true');
    navigate(`/school-profile?${params.toString()}`);
  };

  const goBack = () => {
    if (currentStage <= 1) {
      navigate('/setup-welcome');
    } else {
      goToStage(currentStage - 1);
    }
  };

  const updateStageOnBackend = async (stageNum) => {
    try {
      await tenantApi.post(`/school_setup/onboarding/stage/${stageNum}`);
    } catch (err) {
      console.error('Failed to update stage', err);
    }
  };

  const goFinish = async () => {
    // If in edit mode, just go back to complete-setup without re-calling the API
    if (isEditMode) {
      navigate('/complete-setup', { replace: true });
      return;
    }

    try {
      await tenantApi.post('/school_setup/onboarding/complete');
      await refreshTenantInfo();
      navigate('/complete-setup', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding', err);
      navigate('/complete-setup', { replace: true });
    }
  };

  const handleSaveAndContinue = async (nextStage) => {
    await updateStageOnBackend(currentStage);

    if (nextStage) {
      goToStage(nextStage);
    } else {
      goFinish();
    }
  };

  // ==================== STAGE RENDERING ====================
  if (currentStage === 1)
    return (
      <Stage1SchoolProfile
        onNext={() => handleSaveAndContinue(2)}
        onBack={goBack}
        onSkip={goFinish}
      />
    );

  if (currentStage === 2)
    return (
      <Stage2ManageSessions
        onNext={() => handleSaveAndContinue(3)}
        onBack={goBack}
        onSkip={goFinish}
      />
    );

  if (currentStage === 3)
    return (
      <Stage3ClassArms onNext={() => handleSaveAndContinue(4)} onBack={goBack} onSkip={goFinish} />
    );

  if (currentStage === 4)
    return (
      <Stage4AddLearners
        onNext={() => handleSaveAndContinue(5)}
        onBack={goBack}
        onSkip={goFinish}
      />
    );

  if (currentStage === 5)
    return <Stage5AddTeachers onNext={goFinish} onBack={goBack} onSkip={goFinish} />;

  goFinish();
  return null;
};

export default InitialSetup;
