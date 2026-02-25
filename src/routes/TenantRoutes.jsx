import React, { lazy } from 'react';
import { Navigate } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import TenantProtectedRoute from '../components/auth/TenantProtectedRoute';

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

const TenantRoutes = [
  {
    path: '/',
    element: (
      <TenantProtectedRoute>
        <SchoolLayout />
      </TenantProtectedRoute>
    ),
    children: [
      { path: '/', element: <SchoolDashboardMain /> },
      { path: '/session-week-manager', element: <SessionWeekManager /> },
      { path: '/scheme-of-work', element: <SchemeOfWork /> },
      { path: '/manage-subscription', element: <SubscriptionIndex /> },
      { path: '/subscription-history', element: <SubscriptionIndex /> },
      { path: '/alc-manager', exact: true, element: <AlcManager /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/login', element: <TenantLogin /> },
      { path: '/impersonate-login/:token', element: <ImpersonateLogin /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/login" /> },
    ],

  },
];

export default TenantRoutes;
