import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import TenantProtectedRoute from '../components/auth/TenantProtectedRoute';
import ParentProtectedRoute from '../components/auth/ParentProtectedRoute';
import PermissionGate from '../components/auth/PermissionGate';
import SetupRedirectHandler from '../context/TenantContext/SetupRedirectHandler';

const SchoolLayout = Loadable(lazy(() => import('../layouts/school/SchoolLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

const SchoolDashboardMain = Loadable(
  lazy(() => import('../views/school-dashboard/SchoolDashboard')),
);
const SetupWelcome = Loadable(lazy(() => import('../views/school-setup/SetupWelcome')));
const InitialSetup = Loadable(lazy(() => import('../views/school-setup/InitialSetup')));
const CompleteSetup = Loadable(lazy(() => import('../views/school-setup/CompleteSetup')));
const SessionWeekManager = Loadable(lazy(() => import('../views/school/SessionWeekManager')));
const SchemeOfWork = Loadable(lazy(() => import('../views/scheme-of-work/SchemeOfWork')));
const CurriculumManager = Loadable(
  lazy(() => import('../views/curriculum-manager/CurriculumManager')),
);
const ClassStructureManager = Loadable(
  lazy(() => import('../components/school/components/ClassStructureManager')),
);
const SubscriptionIndex = Loadable(lazy(() => import('../views/subcriptions/SubscriptionIndex')));
const TenantLogin = Loadable(lazy(() => import('../views/authentication/auth1/TenantLogin')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/auth1/ForgotPassword')));
const VerifyOtp = Loadable(lazy(() => import('../views/authentication/auth1/VerifyOtp')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/auth1/ResetPassword')));
const AdmissionApply = Loadable(lazy(() => import('../views/authentication/auth1/AdmissionApply')));
const ImpersonateLogin = Loadable(lazy(() => import('../views/authentication/ImpersonateLogin')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const SchoolNotFound = Loadable(lazy(() => import('../views/authentication/SchoolNotFound')));
const AlcManager = Loadable(
  lazy(() => import('../views/tenants-views/alc-manager/SchoolAlcManager')),
);
const ActivityLog = Loadable(lazy(() => import('../views/tenants-views/activity-log/ActivityLog')));

const CalendarPage = Loadable(lazy(() => import('../views/school-setup/CalendarPage')));
const AccountSetting = Loadable(lazy(() => import('../views/pages/tenant-pages/AccountSetting')));
const StaffManager = Loadable(lazy(() => import('../views/staff-manager/StaffManager')));
const ParentManagement = Loadable(
  lazy(() => import('../views/tenants-views/parents/ParentManagement')),
);
const LearnerManagement = Loadable(
  lazy(() => import('../views/tenants-views/learners/LearnerManagement')),
);
const NewApplication = Loadable(lazy(() => import('../views/parent-dashboard/NewApplication')));
const AdmissionStatus = Loadable(lazy(() => import('../views/parent-dashboard/AdmissionStatus')));
const AdmissionLetter = Loadable(lazy(() => import('../views/parent-dashboard/AdmissionLetter')));
const ApplicationTracker = Loadable(
  lazy(() => import('../views/parent-dashboard/ApplicationTracker')),
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

      // ── Dashboard route (handles both school and parent dashboards) ──
      { path: 'dashboard', element: <SchoolDashboardMain /> },
      
      // ── Parent-specific routes ──
      { path: 'admission/new-application', element: <NewApplication /> },
      { path: 'admission-status', element: <AdmissionStatus /> },
      { path: 'admission-status/:id', element: <AdmissionStatus /> },
      { path: 'admission-letter', element: <AdmissionLetter /> },
      { path: 'admission-letter/:id', element: <AdmissionLetter /> },
      { path: 'application-tracker', element: <ApplicationTracker /> },
      { path: 'application-tracker/:id', element: <ApplicationTracker /> },

      // Admission Application
      { path: 'application-setup', element: <NewApplication /> },
      // { path: 'admission-status',   element: <NewApplication /> },
      // { path: 'admission-letter',   element: <NewApplication /> },
    ],
  },
];

export default TenantRoutes;
