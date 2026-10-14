import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import WardReportCardTab from './components/WardReportCardTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: "Wards' Result" }];

const WardReportCardPage = () => (
  <PageContainer title="Wards' Result" description="View your wards' report cards for each session-term">
    <Breadcrumb title="Wards' Result" subtitle="Your wards' report cards for each session-term" items={BCrumb} />
    <WardReportCardTab />
  </PageContainer>
);

export default WardReportCardPage;
