import React, { lazy, useEffect } from 'react';
import { Navigate } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
const AnalyticalDashboard = Loadable(lazy(() => import('../views/dashboard/Analytical')));
const SchoolDashboard = Loadable(lazy(() => import('../views/dashboard/School')));
const ECommerceDashboard = Loadable(lazy(() => import('../views/dashboard/Ecommerce')));
const ModernDashboard = Loadable(lazy(() => import('../views/dashboard/Modern')));
const PackageManager = Loadable(lazy(() => import('../views/dashboard/PackageManager')));
const AlcManager = Loadable(lazy(() => import('../views/alc-manager/AlcManager')));

const Agent = Loadable(lazy(() => import('../views/agent/Agent')));
const ViewAgent = Loadable(lazy(() => import('../views/agent/ViewAgent')));
const Gateway = Loadable(lazy(() => import('../views/gateway/Gateway')));
const CalendarManagement = Loadable(lazy(() => import('../views/calendar/CalendarManagement')));
const ViewSchool = Loadable(lazy(() => import('../components/add-school/component/ViewSchool')));
const AgentSubscriptionManagement = Loadable(
  lazy(() => import('../views/agent/subscriptions/AgentSubscriptionIndex')),
);
const ActivityLog = Loadable(lazy(() => import('../views/activity-log/ActivityLog')));
const CommissionManagement = Loadable(
  lazy(() => import('../views/commission/CommissionManagement')),
);
const MyCommissionBySubscription = Loadable(
  lazy(() => import('../views/commission/MyCommissionBySubscription')),
);
const MyCommissionByTransaction = Loadable(
  lazy(() => import('../views/commission/MyCommissionByTransaction')),
);

const SubjectAndTopics = Loadable(lazy(() => import('../views/phet/subjectandtopics')));
const StimulationLinks = Loadable(lazy(() => import('../views/phet/stimulation-links')));

const FrontendPages = Loadable(lazy(() => import('../views/FrontendPages')));

// Pages
const AccountSetting = Loadable(
  lazy(() => import('../views/pages/account-setting/AccountSetting')),
);

// Authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth1/Login')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/auth1/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/auth1/ResetPassword')));
const VerifyOtp = Loadable(lazy(() => import('../views/authentication/auth1/VerifyOtp')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const appMode = import.meta.env.MODE;
const CENTRAL_DOMAIN =
  appMode === 'production'
    ? import.meta.env.VITE_CENTRAL_DOMAIN_PROD
    : import.meta.env.VITE_CENTRAL_DOMAIN_LOCAL;

const WebsiteRedirect = () => {
  useEffect(() => {
    const currentHost = window.location.hostname;
    const targetHost = new URL(CENTRAL_DOMAIN).hostname;

    if (currentHost !== targetHost) {
      window.location.replace(CENTRAL_DOMAIN);
    }
  }, []);

  const currentHost = window.location.hostname;
  const targetHost = new URL(CENTRAL_DOMAIN).hostname;

  if (currentHost !== targetHost) return null;

  return <FrontendPages />;
};

const DashboardRouteWrapper = () => {
  const { user } = useAuth();
  if (user && user.organization.access_level > 1 && user.organization.access_level <= 5) {
    return <ViewAgent />;
  }
  if (user && user.organization.access_level === 1) {
    return <AnalyticalDashboard />;
  }
  return <Error message="You are not authorized to be in this app" />;
};

const AgentRoutes = [
  // Root — renders FrontendPages on same host, or redirects externally
  {
    path: '/',
    element: <WebsiteRedirect />,
  },

  // Protected agent app routes — all under /agent/*
  {
    path: '/agent',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardRouteWrapper /> },
      { path: 'dashboard', element: <DashboardRouteWrapper /> },
      { path: 'dashboard/school', element: <SchoolDashboard /> },
      { path: 'acl_manager', element: <AlcManager /> },
      { path: 'organization', element: <Agent /> },
      { path: 'view/:id', element: <ViewAgent /> },
      { path: 'gateway', element: <Gateway /> },
      { path: 'calendar', element: <CalendarManagement /> },
      { path: 'school', element: <SchoolDashboard /> },
      { path: 'view-school/:id', element: <ViewSchool /> },
      { path: 'school/sub-school/:id', element: <ViewSchool /> },
      { path: 'organization/subscriptions', element: <AgentSubscriptionManagement /> },
      { path: 'subscription', element: <AgentSubscriptionManagement /> },
      { path: 'activity_log', element: <ActivityLog /> },
      { path: 'organization/commissions', element: <CommissionManagement /> },
      { path: 'commission/subscription', element: <MyCommissionBySubscription /> },
      { path: 'commission/transaction', element: <MyCommissionByTransaction /> },
      { path: 'ecommerce', element: <ECommerceDashboard /> },
      { path: 'modern', element: <ModernDashboard /> },
      { path: 'plan', element: <PackageManager /> },
      { path: 'phet/subject_topics', element: <SubjectAndTopics /> },
      { path: 'phet/stimulation_links', element: <StimulationLinks /> },
      { path: 'pages/account-settings', element: <AccountSetting /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },

  // Auth routes — blank layout, no FrontendPages wrapper
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/404', element: <Error /> },
      { path: '/agent/login', element: <Login /> },
      { path: '/agent/forgot_password', element: <ForgotPassword /> },
      { path: '/agent/verify_otp', element: <VerifyOtp /> },
      { path: '/agent/reset_password', element: <ResetPassword /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default AgentRoutes;
