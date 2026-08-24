import { useContext } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import PageUnderDevelopment from '@/components/shared/PageUnderDevelopment';
import ParentDashboard from '@/pages/tenant/admission/ParentDashboard';
import AdmissionOfficerDashboard from '@/pages/tenant/admission/AdmissionOfficerDashboard';
import BursaryOfficerDashboard from '@/pages/tenant/finance/BursaryOfficerDashboard';
import AdminDashboard from '@/pages/tenant/school-dashboard/AdminDashboard';
import ParentDashboard2 from '../admission/parent-dashboard/ParentDashboard2';
import LearnerDashboard from '@/pages/tenant/learners/dashboard/LearnerDashboard';
import TeacherDashboard from '../staff-manager/teacher-dashboard/TeacherDashboard';
import NonTeacherDashboard from '../staff-manager/non-teaching-dashboard/NonTeachDashboard';

export default function SchoolDashboard() {
  const { user } = useContext(TenantAuthContext);

  /**
   * User Types
   * 1 = Staff
   * 2 = Learner
   * 3 = Parent
   */
  const isLearner = user?.user_type_id === 2;
  const isParent = user?.user_type_id === 3;

  // Check user roles
  const roles = user?.roles || [];

  const isTeachingStaff = user?.staff?.staff_type === 'teaching';

  const isNonTeachingStaff = user?.staff?.staff_type === 'non-teaching';

  const isAdmissionOfficer =
    isNonTeachingStaff && roles.some((role) => role.name === 'admission_officer');

  const isBursaryOfficer = isNonTeachingStaff && roles.some((role) => role.name === 'bursar');

  const isAdmin =
    isStaff &&
    roles.some((role) =>
      ['super_admin', 'school_admin', 'school_owner', 'school_head'].includes(role.name),
    );

  /**
   * Dashboard Title
   */
  const dashboardTitle = isParent
    ? 'Parent Dashboard'
    : isAdmin
      ? 'Admin Dashboard'
      : isAdmissionOfficer
        ? 'Admission Officer Dashboard'
        : isBursaryOfficer
          ? 'Bursary Officer Dashboard'
          : isTeachingStaff
            ? 'Teacher Dashboard'
            : isNonTeachingStaff
              ? 'Non-Teacher Dashboard'
              : isLearner
                ? 'Student Dashboard'
                : 'Dashboard';

  /**
   * Dashboard Description
   */
  const dashboardDescription = isParent
    ? 'Parent portal'
    : isAdmin
      ? 'School-wide overview portal'
      : isAdmissionOfficer
        ? 'Admission management portal'
        : isBursaryOfficer
          ? 'Revenue and collections portal'
          : isTeachingStaff
            ? 'Teaching Staff Portal'
            : isNonTeachingStaff
              ? 'Non-teaching Staff Portal'
              : isLearner
                ? 'Student portal'
                : 'Dashboard';

  return (
    <PageContainer title={dashboardTitle} description={dashboardDescription}>
      {isParent ? (
        <ParentDashboard2 />
      ) : isAdmin ? (
        <AdminDashboard />
      ) : isAdmissionOfficer ? (
        <AdmissionOfficerDashboard />
      ) : isBursaryOfficer ? (
        <BursaryOfficerDashboard />
      ) : isTeachingStaff ? (
        <TeacherDashboard />
      ) : isNonTeachingStaff ? (
        <NonTeacherDashboard />
      ) : isLearner ? (
        <LearnerDashboard />
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
