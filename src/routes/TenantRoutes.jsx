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
const SessionWeekManager = Loadable(lazy(() => import('../views/school/SessionWeekManager')));
const SchemeOfWork = Loadable(lazy(() => import('../views/scheme-of-work/SchemeOfWork')));
const SubscriptionIndex = Loadable(lazy(() => import('../views/subcriptions/SubscriptionIndex')));
const TenantLogin = Loadable(lazy(() => import('../views/authentication/auth1/TenantLogin')));
const ImpersonateLogin = Loadable(lazy(() => import('../views/authentication/ImpersonateLogin')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const AlcManager = Loadable(
  lazy(() => import('../views/tenants-views/alc-manager/SchoolAlcManager')),
);
const ActivityLog = Loadable(lazy(() => import('../views/tenants-views/activity-log/ActivityLog')));
const AccountSetting = Loadable(
  lazy(() => import('../views/pages/account-setting/AccountSetting')),
);

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
      {
        index: true,
        element: (
          <PermissionGate permissions={['dashboard.view']}>
            <SchoolDashboardMain />
          </PermissionGate>
        ),
      },
      {
        path: 'session-week-manager',
        element: (
          <PermissionGate permissions={['setup.academics.school']}>
            <SessionWeekManager />
          </PermissionGate>
        ),
      },
      { path: 'scheme-of-work', element: <SchemeOfWork /> },
      {
        path: 'manage-subscription',
        element: (
          <PermissionGate permissions={['manage.subscription']}>
            <SubscriptionIndex />
          </PermissionGate>
        ),
      },
      { path: 'subscription-history', element: <SubscriptionIndex /> },
      {
        path: 'alc-manager',
        element: (
          <PermissionGate permissions={['api.v1.censis.acl.index']}>
            <AlcManager />
          </PermissionGate>
        ),
      },
      { path: 'activity-logs', element: <ActivityLog /> },
      { path: 'pages/account-settings', element: <AccountSetting /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> }, // ← Catch-all at top level
];

export default TenantRoutes;
