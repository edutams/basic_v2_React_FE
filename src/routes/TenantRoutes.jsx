import React, { lazy } from 'react';
import Loadable from '@/layouts/full/shared/loadable/Loadable';
import TenantProtectedRoute from '@/components/auth/TenantProtectedRoute';
import SetupRedirectHandler from '@/context/TenantContext/SetupRedirectHandler';

const SchoolLayout = Loadable(lazy(() => import('@/layouts/school/SchoolLayout')));
const BlankLayout = Loadable(lazy(() => import('@/layouts/blank/BlankLayout')));

const SchoolDashboardMain = Loadable(
  lazy(() => import('@/tenant/pages/school-dashboard/SchoolDashboard')),
);
const SetupWelcome = Loadable(lazy(() => import('@/tenant/pages/school-setup/SetupWelcome')));
const InitialSetup = Loadable(lazy(() => import('@/tenant/pages/school-setup/InitialSetup')));
const CompleteSetup = Loadable(lazy(() => import('@/tenant/pages/school-setup/CompleteSetup')));
const SessionWeekManager = Loadable(lazy(() => import('@/tenant/pages/school/SessionWeekManager')));
const SchemeOfWork = Loadable(lazy(() => import('@/tenant/pages/scheme-of-work/SchemeOfWork')));
const CurriculumManager = Loadable(
  lazy(() => import('@/tenant/pages/curriculum-manager/CurriculumManager')),
);
const ClassStructureManager = Loadable(
  lazy(() => import('@/tenant/components/ClassStructureManager')),
);
const SubscriptionIndex = Loadable(
  lazy(() => import('@/tenant/pages/subcriptions/SubscriptionIndex')),
);
const TenantLogin = Loadable(lazy(() => import('@/authentication/auth1/TenantLogin')));
const ForgotPassword = Loadable(lazy(() => import('@/authentication/auth1/ForgotPassword')));
const VerifyOtp = Loadable(lazy(() => import('@/authentication/auth1/VerifyOtp')));
const ResetPassword = Loadable(lazy(() => import('@/authentication/auth1/ResetPassword')));
const AdmissionApply = Loadable(lazy(() => import('@/authentication/auth1/AdmissionApply')));
const ImpersonateLogin = Loadable(lazy(() => import('@/authentication/ImpersonateLogin')));
const Error = Loadable(lazy(() => import('@/authentication/Error')));
const SchoolNotFound = Loadable(lazy(() => import('@/authentication/SchoolNotFound')));
const AlcManager = Loadable(lazy(() => import('@/tenant/pages/alc-manager/SchoolAlcManager')));
const ActivityLog = Loadable(lazy(() => import('@/tenant/pages/activity-log/ActivityLog')));

const CalendarPage = Loadable(lazy(() => import('@/tenant/pages/school-setup/CalendarPage')));
const AccountSetting = Loadable(lazy(() => import('@/tenant/pages/profile/AccountSetting')));
const StaffManager = Loadable(lazy(() => import('@/tenant/pages/staff-manager/StaffManager')));
const PageUnderDevelopment = Loadable(
  lazy(() => import('@/components/shared/PageUnderDevelopment')),
);
const ParentManagement = Loadable(lazy(() => import('@/tenant/pages/parents/ParentManagement')));
const LearnerManagement = Loadable(lazy(() => import('@/tenant/pages/learners/LearnerManagement')));

const NewApplication = Loadable(lazy(() => import('@/tenant/pages/admission/NewApplication')));
const MyApplication = Loadable(lazy(() => import('@/tenant/pages/admission/MyApplication')));
const AdmissionLetter = Loadable(lazy(() => import('@/tenant/pages/admission/AdmissionLetter')));
const ApplicationTracker = Loadable(
  lazy(() => import('@/tenant/pages/admission/ApplicationTracker')),
);
const AdmissionSetup = Loadable(lazy(() => import('@/tenant/pages/admission/AdmissionSetup')));
const CreateAdmissionBatch = Loadable(
  lazy(() => import('@/tenant/pages/admission/CreateAdmissionBatch')),
);

const TenantRoutes = [
  {
    path: '/setup-welcome',
    element: (
      <TenantProtectedRoute>
        <SetupRedirectHandler />
        <BlankLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <SetupWelcome /> }],
  },
  {
    path: '/school-profile',
    element: (
      <TenantProtectedRoute>
        <SetupRedirectHandler />
        <BlankLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <InitialSetup /> }],
  },
  {
    path: '/login',
    element: <BlankLayout />,
    children: [{ index: true, element: <TenantLogin /> }],
  },
  {
    path: '/forgot_password',
    element: <BlankLayout />,
    children: [{ index: true, element: <ForgotPassword /> }],
  },
  {
    path: '/verify_otp',
    element: <BlankLayout />,
    children: [{ index: true, element: <VerifyOtp /> }],
  },
  {
    path: '/reset_password',
    element: <BlankLayout />,
    children: [{ index: true, element: <ResetPassword /> }],
  },
  {
    path: '/admission/apply',
    element: <BlankLayout />,
    children: [{ index: true, element: <AdmissionApply /> }],
  },
  {
    path: '/impersonate-login/:token',
    element: <ImpersonateLogin />,
  },
  {
    path: '/school-not-found',
    element: <BlankLayout />,
    children: [{ index: true, element: <SchoolNotFound /> }],
  },
  {
    path: '/auth/404',
    element: <BlankLayout />,
    children: [{ index: true, element: <Error /> }],
  },
  {
    path: '/complete-setup',
    element: (
      <TenantProtectedRoute>
        <SetupRedirectHandler />
        <BlankLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <CompleteSetup /> }],
  },
  {
    path: '/',
    element: (
      <TenantProtectedRoute>
        <SetupRedirectHandler />
        <SchoolLayout />
      </TenantProtectedRoute>
    ),
    children: [
      { index: true, element: <SchoolDashboardMain /> },

      { path: 'acl-manager', element: <AlcManager /> },

      { path: 'curriculum-setup', element: <CurriculumManager /> },

      { path: 'scheme-of-work', element: <SchemeOfWork /> },

      { path: 'class-structure-manager', element: <ClassStructureManager /> },

      { path: 'manage-subscription', element: <SubscriptionIndex /> },
      { path: 'subscription-history', element: <SubscriptionIndex /> },

      { path: 'session-week-manager', element: <SessionWeekManager /> },

      { path: 'school-calendar', element: <CalendarPage /> },

      { path: 'activity-logs', element: <ActivityLog /> },
      { path: 'parent-management', element: <ParentManagement /> },
      { path: 'learner-management', element: <LearnerManagement /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'pages/account-settings', element: <AccountSetting /> },
      { path: 'staff-setup', element: <StaffManager /> },

      {
        path: 'admission-setup',
        element: <AdmissionSetup />,
      },
      {
        path: 'admission-setup/create-batch',
        element: <CreateAdmissionBatch />,
      },
      {
        path: 'admission-setup/edit-batch/:id',
        element: <CreateAdmissionBatch />,
      },
      {
        path: 'process-applications',
        element: (
          <PageUnderDevelopment
            title="Process Admission Under Development"
            subtitle="The Process Admission module is currently under development. Check back soon!"
          />
        ),
      },

      // ── Dashboard route (handles both school and parent dashboards) ──
      { path: 'dashboard', element: <SchoolDashboardMain /> },

      // ── Parent-specific routes ──
      { path: 'admission/new-application', element: <NewApplication /> },
      { path: 'admission/my_applications', element: <MyApplication /> },
      { path: 'admission/my_applications/:id', element: <MyApplication /> },
      { path: 'admission-letter', element: <AdmissionLetter /> },
      { path: 'admission-letter/:id', element: <AdmissionLetter /> },
      { path: 'application-tracker', element: <ApplicationTracker /> },
      { path: 'application-tracker/:id', element: <ApplicationTracker /> },

      // Admission Application
      // { path: 'application-setup', element: <NewApplication /> },
    ],
  },
];

export default TenantRoutes;
