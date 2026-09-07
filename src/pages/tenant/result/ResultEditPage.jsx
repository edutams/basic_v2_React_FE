import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ResultEditTab from './components/ResultEditTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Result Edit' }];

const ResultEditPage = () => (
  <PageContainer title="Result Edit" description="Edit and vet student result scores">
    <Breadcrumb title="Result Edit" subtitle="Edit and vet student scores" items={BCrumb} />
    <ResultEditTab />
  </PageContainer>
);

export default ResultEditPage;
