import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import PerformanceAnalyticsTab from './components/PerformanceAnalyticsTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Performance Analytics' }];

const PerformanceAnalyticsPage = () => (
  <PageContainer title="Performance Analytics" description="View subject performance analytics with bar chart and analysis">
    <Breadcrumb title="Performance Analytics" subtitle="Score distribution and participant analysis" items={BCrumb} />
    <PerformanceAnalyticsTab />
  </PageContainer>
);

export default PerformanceAnalyticsPage;
