import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ScoreSheetTab from './components/ScoreSheetTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Score Sheet' }];

const ScoreSheetPage = () => (
  <PageContainer title="Score Sheet" description="View student score sheets">
    <Breadcrumb title="Score Sheet" subtitle="View individual student scores for assigned classes" items={BCrumb} />
    <ScoreSheetTab />
  </PageContainer>
);

export default ScoreSheetPage;
