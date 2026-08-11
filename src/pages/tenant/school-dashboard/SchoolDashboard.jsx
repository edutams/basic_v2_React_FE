import { useContext } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import PageUnderDevelopment from '@/components/shared/PageUnderDevelopment';
import ParentDashboard from '@/pages/tenant/admission/ParentDashboard';
import AdmissionOfficerDashboard from '@/pages/tenant/admission/AdmissionOfficerDashboard';
import BursaryOfficerDashboard from '@/pages/tenant/finance/BursaryOfficerDashboard';

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

  // Check user roles
  const roles = user?.roles || [];

  const isAdmissionOfficer = roles.some(
    role => role.name === 'admission_officer'
  );

  const isBursaryOfficer = roles.some(
    role => role.name === 'bursar'
  );

  console.log({ isAdmissionOfficer, isBursaryOfficer });


  /**
   * Dashboard Title
   */
  const dashboardTitle = isParent
    ? 'Parent Dashboard'
    : isAdmissionOfficer
      ? 'Admission Officer Dashboard'
      : isBursaryOfficer
        ? 'Bursary Officer Dashboard'
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
    : isAdmissionOfficer
      ? 'Admission management portal'
      : isBursaryOfficer
        ? 'Revenue and collections portal'
        : isStaff
          ? 'Staff portal'
          : isLearner
            ? 'Student portal'
            : 'Dashboard';

  return (
    <PageContainer title={dashboardTitle} description={dashboardDescription}>
      {isParent ? (
        <ParentDashboard />
      ) : isAdmissionOfficer ? (
        <AdmissionOfficerDashboard />
      ) : isBursaryOfficer ? (
        <BursaryOfficerDashboard />
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
