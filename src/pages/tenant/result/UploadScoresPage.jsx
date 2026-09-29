import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import UploadScoresTab from './components/UploadScoresTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Upload Scores' }];

const UploadScoresPage = () => (
  <PageContainer title="Upload Scores" description="Download templates and upload student scores">
    <Breadcrumb title="Upload Scores" subtitle="Upload and manage student score sheets" items={BCrumb} />
    <UploadScoresTab />
  </PageContainer>
);

export default UploadScoresPage;
