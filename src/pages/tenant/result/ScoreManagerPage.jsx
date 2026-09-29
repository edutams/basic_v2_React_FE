import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ScoreManagerTab from './components/ScoreManagerTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Score Manager' }];

const ScoreManagerPage = () => (
  <PageContainer title="Score Manager" description="Upload scores and view score sheets">
    <Breadcrumb title="Score Manager" subtitle="Manage score uploads and score sheets" items={BCrumb} />
    <ScoreManagerTab />
  </PageContainer>
);

export default ScoreManagerPage;
