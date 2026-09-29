import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import BroadsheetTab from './components/BroadsheetTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Broadsheet' }];

const BroadsheetPage = () => (
  <PageContainer title="Broadsheet" description="View class-wide grade distribution and rankings">
    <Breadcrumb title="Broadsheet" subtitle="View student rankings across all subjects" items={BCrumb} />
    <BroadsheetTab />
  </PageContainer>
);

export default BroadsheetPage;
