import { Typography } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import SetUpClassesTab from '@/pages/tenant/school-setup/components/SetUpClassesTab';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/dashboard', title: 'Dashboard' },
  { title: 'Class Structure' },
];

const ClassStructureManager = () => {
  return (
    <PageContainer title="Class Structure" description="Manage class arms">
      <Breadcrumb title="Class Structure" items={BCrumb} />

      {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 640 }}>
        Set the number of arms for each class, then rename any arm inline. Changes are held until
        you save.
      </Typography> */}

      {/* SetUpClassesTab owns its own stat panel, grouped class list, and
          floating save bar — see the same component reused by the
          onboarding wizard's Stage 3. */}
      <SetUpClassesTab />
    </PageContainer>
  );
};

export default ClassStructureManager;
