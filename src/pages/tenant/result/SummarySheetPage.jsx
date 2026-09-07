import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import SummarySheetTab from './components/SummarySheetTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Summary Sheet' }];

const SummarySheetPage = () => (
  <PageContainer title="Summary Sheet" description="View grade distribution summary across the class">
    <Breadcrumb title="Summary Sheet" subtitle="Grade distribution analytics" items={BCrumb} />
    <SummarySheetTab />
  </PageContainer>
);

export default SummarySheetPage;
