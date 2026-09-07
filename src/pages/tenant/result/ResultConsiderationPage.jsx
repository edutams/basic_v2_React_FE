import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ResultConsiderationTab from './components/ResultConsiderationTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Result Consideration' }];

const ResultConsiderationPage = () => (
  <PageContainer title="Result Consideration" description="Approve or disapprove student results">
    <Breadcrumb title="Result Consideration" subtitle="Review and approve student results" items={BCrumb} />
    <ResultConsiderationTab />
  </PageContainer>
);

export default ResultConsiderationPage;
