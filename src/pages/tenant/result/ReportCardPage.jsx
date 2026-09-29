import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ReportCardTab from './components/ReportCardTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Report Card' }];

const ReportCardPage = () => (
  <PageContainer title="Report Card" description="View your report card for each session-term">
    <Breadcrumb title="Report Card" subtitle="Your report card for each session-term" items={BCrumb} />
    <ReportCardTab />
  </PageContainer>
);

export default ReportCardPage;
