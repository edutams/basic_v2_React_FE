import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Stage1SchoolProfile  from './stages/Stage1SchoolProfile';
import Stage2ManageSessions from './stages/Stage2ManageSessions';
import Stage3ClassArms      from './stages/Stage3ClassArms';
import Stage4AddLearners    from './stages/Stage4AddLearners';
import Stage5AddTeachers    from './stages/Stage5AddTeachers';

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
  const goSkip   = () => navigate('/complete-setup');
  const goFinish = () => navigate('/complete-setup');

  // Stage 3 (Admin Detail) has been merged into Stage 1 (School Profile).
  // Remaining stages shift down: old 4→3, old 5→4, old 6→5.
  if (stage === 1) return <Stage1SchoolProfile  onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 2) return <Stage2ManageSessions onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 3) return <Stage3ClassArms      onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 4) return <Stage4AddLearners    onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 5) return <Stage5AddTeachers    onNext={goFinish} onBack={goBack} onSkip={goSkip} />;

  goFinish();
  return null;
};

export default InitialSetup;
