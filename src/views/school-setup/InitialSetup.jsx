import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Stage1SchoolProfile  from './stages/Stage1SchoolProfile';
import Stage2ManageSessions from './stages/Stage2ManageSessions';
import Stage3AdminDetail    from './stages/Stage3AdminDetail';
import Stage4ClassArms      from './stages/Stage4ClassArms';
import Stage5AddLearners    from './stages/Stage5AddLearners';

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
  if (stage === 3) return <Stage3AdminDetail    onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 4) return <Stage4ClassArms      onNext={goNext}   onBack={goBack} onSkip={goSkip} />;
  if (stage === 5) return <Stage5AddLearners    onNext={goFinish} onBack={goBack} onSkip={goSkip} />;

  goFinish();
  return null;
};

export default InitialSetup;
