import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ResultSheetTab from './components/ResultSheetTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Result Sheet' }];

const ResultSheetPage = () => (
  <PageContainer title="Result Sheet" description="View broadsheet, summary sheet and comment bank">
    <Breadcrumb title="Result Sheet" subtitle="Broadsheet, Summary Sheet and Comment Bank" items={BCrumb} />
    <ResultSheetTab />
  </PageContainer>
);

export default ResultSheetPage;
