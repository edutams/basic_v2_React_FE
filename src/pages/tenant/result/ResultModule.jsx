import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ResultSetupTab from './components/ResultSetupTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Setup' }];

const ResultModule = () => {
  return (
    <PageContainer title="Result Setup" description="Configure result grades, marks, templates and settings">
      <Breadcrumb title="Result Setup" subtitle="Manage all result configuration" items={BCrumb} />
      <ResultSetupTab />
    </PageContainer>
  );
};

export default ResultModule;
