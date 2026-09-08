import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import CaBreakdownTab from './components/CaBreakdownTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'CA Breakdown' }];

const CaBreakdownPage = () => (
  <PageContainer title="CA Breakdown" description="View student CA score breakdown by subject">
    <Breadcrumb title="CA Breakdown" subtitle="View CA scores across all subjects" items={BCrumb} />
    <CaBreakdownTab />
  </PageContainer>
);

export default CaBreakdownPage;
