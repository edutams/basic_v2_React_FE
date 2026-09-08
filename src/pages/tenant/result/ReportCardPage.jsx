import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ReportCardTab from './components/ReportCardTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Report Card' }];

const ReportCardPage = () => (
  <PageContainer title="Report Card" description="View class students and their report cards">
    <Breadcrumb title="Report Card" subtitle="View Class Students and their Results" items={BCrumb} />
    <ReportCardTab />
  </PageContainer>
);

export default ReportCardPage;
