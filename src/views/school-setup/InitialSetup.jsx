import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Stage1SchoolProfile  from './stages/Stage1SchoolProfile';
import Stage2ManageSessions from './stages/Stage2ManageSessions';
import Stage3AdminDetail    from './stages/Stage3AdminDetail';

/**
 * InitialSetup — stage controller for /school-profile
 *
 * URL param:  ?stage=1 | 2 | 3
 *
 * Stage 1 → School Profile  (logo upload + read-only school fields)
 * Stage 2 → Manage Sessions (SetCalendarTab)
 * Stage 3 → Admin Detail    (School Owner / Head / Portal Admin cards)
 *
 * To add a new stage:
 *  1. Create stages/Stage4YourName.jsx
 *  2. Import it here
 *  3. Add `if (stage === 4) return <Stage4YourName ... />;`
 *  4. Update totalStages prop in SetupShell (via the stage component)
 */
const InitialSetup = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stage = parseInt(searchParams.get('stage') || '1', 10);

  const goToStage = (n) => setSearchParams({ stage: n });
  const goNext    = () => goToStage(stage + 1);
  const goBack    = () => {
    if (stage <= 1) navigate('/setup-welcome');
    else goToStage(stage - 1);
  };
  const goSkip    = () => navigate('/complete-setup');
  const goFinish  = () => navigate('/complete-setup');

  if (stage === 1) return <Stage1SchoolProfile  onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 2) return <Stage2ManageSessions onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 3) return <Stage3AdminDetail    onNext={goFinish} onBack={goBack} onSkip={goSkip} />;

  // Any unknown stage → complete setup
  goFinish();
  return null;
};

export default InitialSetup;
