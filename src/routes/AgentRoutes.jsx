import React, { lazy, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '@/layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '@/components/auth/LandlordProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('@/layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('@/layouts/blank/BlankLayout')));

/* ****Pages***** */
const AnalyticalDashboard = Loadable(lazy(() => import('@/landlord/dashboard/Analytical')));
const PackageManager = Loadable(lazy(() => import('@/landlord/dashboard/PackageManager')));

const SchoolDashboard = Loadable(
  lazy(() => import('@/landlord/views/agent/components/SchoolsTab/SchoolsTab')),
);

const AlcManager = Loadable(lazy(() => import('@/landlord/views/alc-manager/AlcManager')));

const Agent = Loadable(lazy(() => import('@/landlord/views/agent/Agent')));
const ViewAgent = Loadable(lazy(() => import('@/landlord/views/agent/ViewAgent')));
const AgentDashboard = Loadable(lazy(() => import('@/landlord/views/agent/AgentDashboard')));
const Gateway = Loadable(lazy(() => import('@/landlord/views/gateway/Gateway')));
const CalendarManagement = Loadable(
  lazy(() => import('@/landlord/views/calendar/CalendarManagement')),
);
const ViewSchool = Loadable(lazy(() => import('@/landlord/add-school/component/ViewSchool')));
const AgentSubscriptionManagement = Loadable(
  lazy(() => import('@/landlord/views/agent/subscriptions/AgentSubscriptionIndex')),
);
const ActivityLog = Loadable(lazy(() => import('@/landlord/views/activity-log/ActivityLog')));
const CommissionManagement = Loadable(
  lazy(() => import('@/landlord/views/commission/CommissionManagement')),
);
const MyCommissionBySubscription = Loadable(
  lazy(() => import('@/landlord/views/commission/MyCommissionBySubscription')),
);
const MyCommissionByTransaction = Loadable(
  lazy(() => import('@/landlord/views/commission/MyCommissionByTransaction')),
);

const SubjectAndTopics = Loadable(lazy(() => import('@/landlord/views/phet/subjectandtopics')));
const StimulationLinks = Loadable(lazy(() => import('@/landlord/views/phet/stimulation-links')));
const AgentCurriculumManager = Loadable(
  lazy(() => import('@/landlord/views/curriculum-manager/AgentCurriculumManager')),
);

const FrontendPages = Loadable(lazy(() => import('@/landlord/views/FrontendPages')));

// Pages
const AccountSetting = Loadable(
  lazy(() => import('@/landlord/views/pages/account-setting/AccountSetting')),
);

// Authentication
const Login = Loadable(lazy(() => import('@/authentication/auth1/Login')));
const ForgotPassword = Loadable(lazy(() => import('@/authentication/auth1/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('@/authentication/auth1/ResetPassword')));
const VerifyOtp = Loadable(lazy(() => import('@/authentication/auth1/VerifyOtp')));
const Error = Loadable(lazy(() => import('@/authentication/Error')));

const Analytics_ = Loadable(lazy(() => import('@/landlord/views/analytics_/index')));

const appMode = import.meta.env.MODE;
const CENTRAL_DOMAIN =
  appMode === 'production'
    ? import.meta.env.VITE_CENTRAL_DOMAIN_PROD
    : import.meta.env.VITE_CENTRAL_DOMAIN_LOCAL;

// const WebsiteRedirect = () => {
//   useEffect(() => {
//     const currentHost = window.location.hostname;
//     const targetHost = new URL(CENTRAL_DOMAIN).hostname;

//     if (currentHost !== targetHost) {
//       window.location.replace(CENTRAL_DOMAIN);
//     }
//   }, []);

//   const currentHost = window.location.hostname;
//   const targetHost = new URL(CENTRAL_DOMAIN).hostname;

//   if (currentHost !== targetHost) return null;

//   return <FrontendPages />;
// };

const DashboardRouteWrapper = () => {
  const { user } = useAuth();
  if (user && user.organization.access_level > 1 && user.organization.access_level <= 5) {
    return <AgentDashboard />;
  }
  if (user && user.organization.access_level === 1) {
    return <AnalyticalDashboard />;
  }
  return <Error message="You are not authorized to be in this app" />;
};

const AgentRoutes = [
  // Root — redirect to login
  {
    path: '/',
    element: <Navigate to="/agent/login" replace />,
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
      {
        path: 'analytics_',
        element: (
          <ProtectedRoute permission="landlord.tenant_analytics_for_landlord_level_one_only.index">
            <Analytics_ />
          </ProtectedRoute>
        ),
      },
      {
        path: 'acl_manager',
        element: (
          <ProtectedRoute permission="landlord.acl.index">
            <AlcManager />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organization',
        element: (
          <ProtectedRoute permission="landlord.organization.index">
            <Agent />
          </ProtectedRoute>
        ),
      },
      { path: 'view/:id', element: <ViewAgent /> },
      {
        path: 'gateway',
        element: (
          <ProtectedRoute permission="landlord.gateway.index">
            <Gateway />
          </ProtectedRoute>
        ),
      },
      {
        path: 'calendar',
        element: (
          <ProtectedRoute permission="landlord.calendar.index">
            <CalendarManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'school',
        element: (
          <ProtectedRoute permission="landlord.school.index">
            <SchoolDashboard />
          </ProtectedRoute>
        ),
      },
      { path: 'view-school/:id', element: <ViewSchool /> },
      {
        path: 'organization/subscription',
        element: (
          <ProtectedRoute permission="landlord.subscription.index">
            <AgentSubscriptionManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'activity_log',
        element: (
          <ProtectedRoute permission="landlord.activity_log.index">
            <ActivityLog />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organization/commissions',
        element: (
          <ProtectedRoute permission="landlord.commission.index">
            <CommissionManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'commission/subscription',
        element: (
          <ProtectedRoute permission="landlord.commission.index">
            <MyCommissionBySubscription />
          </ProtectedRoute>
        ),
      },
      {
        path: 'commission/transaction',
        element: (
          <ProtectedRoute permission="landlord.commission.index">
            <MyCommissionByTransaction />
          </ProtectedRoute>
        ),
      },
      {
        path: 'plan',
        element: (
          <ProtectedRoute permission="landlord.plan.index">
            <PackageManager />
          </ProtectedRoute>
        ),
      },
      {
        path: 'phet/subject_topics',
        element: (
          <ProtectedRoute permission="landlord.phet_simulation.index">
            <SubjectAndTopics />
          </ProtectedRoute>
        ),
      },
      {
        path: 'phet/stimulation_links',
        element: (
          <ProtectedRoute permission="landlord.phet_simulation.index">
            <StimulationLinks />
          </ProtectedRoute>
        ),
      },
      {
        path: 'curriculum-manager',
        element: (
          <ProtectedRoute permission="landlord.curriculum.index">
            <AgentCurriculumManager />
          </ProtectedRoute>
        ),
      },
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
      { path: '/frontend-pages/homepage', element: <FrontendPages /> },
      { path: '/frontend-pages/about', element: <FrontendPages /> },
      { path: '/frontend-pages/contact', element: <FrontendPages /> },
      { path: '/frontend-pages/pricing', element: <FrontendPages /> },
      { path: '/frontend-pages/portfolio', element: <FrontendPages /> },
      { path: '/frontend-pages/blog', element: <FrontendPages /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default AgentRoutes;
