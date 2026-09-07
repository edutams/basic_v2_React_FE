import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ReportSheetTab from './components/ReportSheetTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Report Card' }];

const ReportCardPage = () => (
  <PageContainer title="Report Card" description="View your report card">
    <Breadcrumb title="Report Card" subtitle="View your academic report" items={BCrumb} />
    <ReportSheetTab />
  </PageContainer>
);

export default ReportCardPage;
