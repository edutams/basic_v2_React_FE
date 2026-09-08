import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ReportSheetTab from './components/ReportSheetTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Student Dossier' }];

const ReportSheetPage = () => (
  <PageContainer title="Student Dossier" description="View class student list and their dossiers (report cards)">
    <Breadcrumb title="Student Dossier" subtitle="View class list and student dossiers" items={BCrumb} />
    <ReportSheetTab />
  </PageContainer>
);

export default ReportSheetPage;
