import { useContext } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import PageUnderDevelopment from '@/components/shared/PageUnderDevelopment';
import ParentDashboard from '@/pages/tenant/admission/ParentDashboard';
import ParentDashboard2 from '@/pages/tenant/admission/parent-dashboard/ParentDashboard2';

export default function SchoolDashboard() {
  const { user } = useContext(TenantAuthContext);

  /**
   * User Types
   * 1 = Staff
   * 2 = Learner
   * 3 = Parent
   */
  const isStaff = user?.user_type_id === 1;
  const isLearner = user?.user_type_id === 2;
  const isParent = user?.user_type_id === 3;

  /**
   * Dashboard Title
   */
  const dashboardTitle = isParent
    ? 'Parent Dashboard'
    : isStaff
      ? 'Staff Dashboard'
      : isLearner
        ? 'Student Dashboard'
        : 'Dashboard';

  /**
   * Dashboard Description
   */
  const dashboardDescription = isParent
    ? 'Parent portal'
    : isStaff
      ? 'Staff portal'
      : isLearner
        ? 'Student portal'
        : 'Dashboard';

  return (
    <PageContainer title={dashboardTitle} description={dashboardDescription}>
      {isParent ? (
        <ParentDashboard2 />
        // <ParentDashboard />
      ) : isStaff ? (
        <PageUnderDevelopment
          title="Staff Dashboard Under Development"
          subtitle="We're building a comprehensive staff management portal. Check back soon!"
          showImage={false}
        />
      ) : isLearner ? (
        <PageUnderDevelopment
          title="Student Dashboard Under Development"
          subtitle="We're creating an interactive learning portal for students. Check back soon!"
          showImage={false}
        />
      ) : (
        <PageUnderDevelopment
          title="Dashboard Under Development"
          subtitle="We're working on creating the perfect dashboard experience. Check back soon!"
          showImage={false}
        />
      )}
    </PageContainer>
  );
}
