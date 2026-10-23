import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ClassDossierView from './components/ClassDossierView';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Class Dossier' }];

const ClassDossierPage = () => (
  <PageContainer title="Class Dossier" description="View and print every student dossier for a class arm">
    <Breadcrumb title="Class Dossier" subtitle="View and print dossiers for the whole class" items={BCrumb} />
    <ClassDossierView />
  </PageContainer>
);

export default ClassDossierPage;
