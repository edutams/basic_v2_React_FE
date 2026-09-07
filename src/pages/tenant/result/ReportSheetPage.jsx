import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ReportSheetTab from './components/ReportSheetTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Report Sheet' }];

const ReportSheetPage = () => (
  <PageContainer title="Report Sheet" description="View individual student report cards">
    <Breadcrumb title="Report Sheet" subtitle="View class list and student results" items={BCrumb} />
    <ReportSheetTab />
  </PageContainer>
);

export default ReportSheetPage;
