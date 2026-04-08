import React, { lazy } from 'react';
import { Navigate } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PermissionGate from '../components/auth/PermissionGate';
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

const SubjectAndTopics = Loadable(lazy(() => import('../views/phet/subjectandtopics')));

const StimulationLinks = Loadable(lazy(() => import('../views/phet/stimulation-links')));

// Pages
const AccountSetting = Loadable(
  lazy(() => import('../views/pages/account-setting/AccountSetting')),
);
// authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth1/Login')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/auth1/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/auth1/ResetPassword')));
const VerifyOtp = Loadable(lazy(() => import('../views/authentication/auth1/VerifyOtp')));
const TwoSteps = Loadable(lazy(() => import('../views/authentication/auth1/TwoSteps')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Maintenance = Loadable(lazy(() => import('../views/authentication/Maintenance')));

// landingpage
const AgentRouteWrapper = () => {
  return <Agent />;
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
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardRouteWrapper /> },
      {
        path: '/dashboards/school',
        exact: true,
        element: <SchoolDashboard />,
      },
      {
        path: '/acl_manager',
        exact: true,
        element: <AlcManager />,
      },
      {
        path: '/organization',
        exact: true,
        element: <AgentRouteWrapper />,
      },
      {
        path: '/agent/view/:id',
        element: <ViewAgent />,
      },
      { path: '/gateway', exact: true, element: <Gateway /> },
      {
        path: '/calendar',
        exact: true,
        element: <CalendarManagement />,
      },
      {
        path: '/school',
        exact: true,
        element: <SchoolDashboard />,
      },
      {
        path: '/view-school/:id',
        exact: true,
        element: <ViewSchool />,
      },
      {
        path: '/organization/subscriptions',
        exact: true,
        element: <AgentSubscriptionManagement />,
      },
      {
        path: '/subscription',
        exact: true,
        element: <AgentSubscriptionManagement />,
      },
      {
        path: '/activity_log',
        exact: true,
        element: <ActivityLog />,
      },
      {
        path: '/organization/commissions',
        exact: true,
        element: <CommissionManagement />,
      },
      { path: '/school/sub-school/:id', exact: false, element: <ViewSchool /> },

      { path: '/ecommerce', exact: true, element: <ECommerceDashboard /> },
      { path: '/modern', exact: true, element: <ModernDashboard /> },
      {
        path: '/plan',
        exact: true,
        element: <PackageManager />,
      },
      { path: '/phet/subject_topics', element: <SubjectAndTopics /> },
      { path: '/phet/stimulation_links', element: <StimulationLinks /> },
      { path: '/', element: <Navigate to="/agent/login" /> },
      {
        path: '/pages/account-settings',
        element: (
          <ProtectedRoute>
            <AccountSetting />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
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
