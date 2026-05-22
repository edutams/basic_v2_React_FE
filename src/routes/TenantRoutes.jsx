import React, { lazy } from 'react';
import Loadable from '@/layouts/full/shared/loadable/Loadable';
import TenantProtectedRoute from '@/components/protectedroutes/TenantProtectedRoute';
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
      <TenantProtectedRoute permission="setup.school.welcome">
        <SetupRedirectHandler />
        <BlankLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <SetupWelcome /> }],
  },
  {
    path: '/school-profile',
    element: (
      <TenantProtectedRoute permission="setup.school.profile">
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
      <TenantProtectedRoute permission="setup.school.complete">
        <SetupRedirectHandler />
        <BlankLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <CompleteSetup /> }],
  },
  {
    path: '/',
    element: (
      <TenantProtectedRoute permission="dashboard.index">
        <SetupRedirectHandler />
        <SchoolLayout />
      </TenantProtectedRoute>
    ),
    children: [
      { index: true, element: <SchoolDashboardMain /> },

      {
        path: 'acl-manager',
        element: (
          <TenantProtectedRoute permission="acl.index">
            <AlcManager />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'curriculum-setup',
        element: (
          <TenantProtectedRoute permission="curriculum.setup.index">
            <CurriculumManager />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'scheme-of-work',
        element: (
          <TenantProtectedRoute permission="scheme.of.work.index">
            <SchemeOfWork />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'class-structure-manager',
        element: (
          <TenantProtectedRoute permission="class.structure.index">
            <ClassStructureManager />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'manage-subscription',
        element: (
          <TenantProtectedRoute permission="manage.subscription.index">
            <SubscriptionIndex />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'subscription-history',
        element: (
          <TenantProtectedRoute permission="manage.subscription.index">
            <SubscriptionIndex />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'session-week-manager',
        element: (
          <TenantProtectedRoute permission="calendar.index">
            <SessionWeekManager />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'school-calendar',
        element: (
          <TenantProtectedRoute permission="calendar.index">
            <CalendarPage />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'activity-logs',
        element: (
          <TenantProtectedRoute permission="activity_log.index">
            <ActivityLog />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'parent-management',
        element: (
          <TenantProtectedRoute permission="parent.setup.index">
            <ParentManagement />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'learner-management',
        element: (
          <TenantProtectedRoute permission="learner.setup.index">
            <LearnerManagement />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'calendar',
        element: (
          <TenantProtectedRoute permission="calendar.index">
            <CalendarPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'pages/account-settings',
        element: (
          <TenantProtectedRoute anyOf={['dashboard.profile.view', 'dashboard.profile.edit']}>
            <AccountSetting />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'staff-setup',
        element: (
          <TenantProtectedRoute permission="staff.setup.index">
            <StaffManager />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'admission-setup',
        element: (
          <TenantProtectedRoute permission="admission_manager.setup.index">
            <AdmissionSetup />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission-setup/create-batch',
        element: (
          <TenantProtectedRoute permission="admission_manager.setup.create">
            <CreateAdmissionBatch />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission-setup/edit-batch/:id',
        element: (
          <TenantProtectedRoute permission="admission_manager.setup.edit">
            <CreateAdmissionBatch />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'process-applications',
        element: (
          <TenantProtectedRoute permission="admission_manager.process.index">
            <PageUnderDevelopment
              title="Process Admission Under Development"
              subtitle="The Process Admission module is currently under development. Check back soon!"
            />
          </TenantProtectedRoute>
        ),
      },

      // ── Dashboard route (handles both school and parent dashboards) ──
      { path: 'dashboard', element: <SchoolDashboardMain /> },

      // ── Parent-specific routes ──
      {
        path: 'admission/new-application',
        element: (
          <TenantProtectedRoute permission="admission_manager.my_applications.index">
            <NewApplication />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission/my_applications',
        element: (
          <TenantProtectedRoute permission="admission_manager.my_applications.index">
            <MyApplication />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission/my_applications/:id',
        element: (
          <TenantProtectedRoute permission="admission_manager.my_applications.index">
            <MyApplication />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission-letter',
        element: (
          <TenantProtectedRoute permission="admission_manager.letter.index">
            <AdmissionLetter />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission-letter/:id',
        element: (
          <TenantProtectedRoute permission="admission_manager.letter.index">
            <AdmissionLetter />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'application-tracker',
        element: (
          <TenantProtectedRoute permission="admission_manager.tracker.index">
            <ApplicationTracker />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'application-tracker/:id',
        element: (
          <TenantProtectedRoute permission="admission_manager.tracker.index">
            <ApplicationTracker />
          </TenantProtectedRoute>
        ),
      },
    ],
  },
];

export default TenantRoutes;
