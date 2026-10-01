import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ScoreManagerTab from './components/ScoreManagerTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Score Manager' }];

const ScoreManagerPage = () => (
  <PageContainer title="Score Manager" description="Upload and manage student scores">
    <Breadcrumb title="Score Manager" subtitle="Download templates and upload student scores" items={BCrumb} />
    <ScoreManagerTab />
  </PageContainer>
);

export default ScoreManagerPage;
