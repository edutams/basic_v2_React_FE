import React, { lazy } from 'react';
import { Navigate } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import TenantProtectedRoute from '../components/auth/TenantProtectedRoute';
import PermissionGate from '../components/auth/PermissionGate';

const SchoolLayout = Loadable(lazy(() => import('../layouts/school/SchoolLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

const SchoolDashboardMain = Loadable(
  lazy(() => import('../views/school-dashboard/SchoolDashboard')),
);
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
const ImpersonateLogin = Loadable(lazy(() => import('../views/authentication/ImpersonateLogin')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const SchoolNotFound = Loadable(lazy(() => import('../views/authentication/SchoolNotFound')));
const AlcManager = Loadable(
  lazy(() => import('../views/tenants-views/alc-manager/SchoolAlcManager')),
);
const ActivityLog = Loadable(lazy(() => import('../views/tenants-views/activity-log/ActivityLog')));
const CalendarPage = Loadable(lazy(() => import('../views/school-setup/CalendarPage')));
const AccountSetting = Loadable(
  lazy(() => import('../views/pages/account-setting/AccountSetting')),
);
const StaffManager = Loadable(lazy(() => import('../views/staff-manager/StaffManager')));

const TenantRoutes = [
  {
    path: '/login',
    element: <BlankLayout />,
    children: [{ index: true, element: <TenantLogin /> }],
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
    path: '/',
    element: (
      <TenantProtectedRoute>
        <SchoolLayout />
      </TenantProtectedRoute>
    ),
    children: [
      { index: true, element: <SchoolDashboardMain /> },

      { path: 'initial-setup', element: <InitialSetup /> },
      { path: 'complete-setup', element: <CompleteSetup /> },

      { path: 'acl-manager', element: <AlcManager /> },

      { path: 'curriculum-setup', element: <CurriculumManager /> },

      { path: 'scheme-of-work', element: <SchemeOfWork /> },

      { path: 'class-structure-manager', element: <ClassStructureManager /> },

      { path: 'manage-subscription', element: <SubscriptionIndex /> },
      { path: 'subscription-history', element: <SubscriptionIndex /> },

      { path: 'session-week-manager', element: <SessionWeekManager /> },

      { path: 'school-calendar', element: <CalendarPage /> },

      { path: 'activity-logs', element: <ActivityLog /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'profile', element: <AccountSetting /> },
      { path: 'staff-manager', element: <StaffManager /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
];

export default TenantRoutes;
