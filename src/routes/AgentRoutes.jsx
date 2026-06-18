import React, { lazy, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '@/layouts/landlord/shared/loadable/Loadable';
import LandlordProtectedRoute from '@/components/protectedroutes/LandlordProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('@/layouts/landlord/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('@/layouts/blank/BlankLayout')));

/* ****Pages***** */
const AnalyticalDashboard = Loadable(lazy(() => import('@/pages/landlord/dashboard/Analytical')));
const PackageManager = Loadable(lazy(() => import('@/pages/landlord/dashboard/PackageManager')));

const SchoolDashboard = Loadable(
  lazy(() => import('@/pages/landlord/views/agent/components/SchoolsTab/SchoolsTab')),
);

const AlcManager = Loadable(lazy(() => import('@/pages/landlord/views/alc-manager/AlcManager')));

const Agent = Loadable(lazy(() => import('@/pages/landlord/views/agent/Agent')));
const ViewAgent = Loadable(lazy(() => import('@/pages/landlord/views/agent/ViewAgent')));
const AgentDashboard = Loadable(lazy(() => import('@/pages/landlord/views/agent/AgentDashboard')));
const Gateway = Loadable(lazy(() => import('@/pages/landlord/views/gateway/Gateway')));
const CalendarManagement = Loadable(
  lazy(() => import('@/pages/landlord/views/calendar/CalendarManagement')),
);
const ViewSchool = Loadable(
  lazy(() => import('@/components/landlord/add-school/component/ViewSchool')),
);
const AgentSubscriptionManagement = Loadable(
  lazy(() => import('@/pages/landlord/views/agent/subscriptions/AgentSubscriptionIndex')),
);
const ActivityLog = Loadable(lazy(() => import('@/pages/landlord/views/activity-log/ActivityLog')));
const CommissionManagement = Loadable(
  lazy(() => import('@/pages/landlord/views/commission/CommissionManagement')),
);
const MyCommissionBySubscription = Loadable(
  lazy(() => import('@/pages/landlord/views/commission/MyCommissionBySubscription')),
);
const MyCommissionByTransaction = Loadable(
  lazy(() => import('@/pages/landlord/views/commission/MyCommissionByTransaction')),
);

const SubjectAndTopics = Loadable(
  lazy(() => import('@/pages/landlord/views/phet/subjectandtopics')),
);
const StimulationLinks = Loadable(
  lazy(() => import('@/pages/landlord/views/phet/stimulation-links')),
);
const AgentCurriculumManager = Loadable(
  lazy(() => import('@/pages/landlord/views/curriculum-manager/AgentCurriculumManager')),
);

// Pages
const AccountSetting = Loadable(
  lazy(() => import('@/pages/landlord/views/pages/account-setting/AccountSetting')),
);

// Authentication
const Login = Loadable(lazy(() => import('@/pages/landlord/auth/Login')));
const AuthForgotPassword = Loadable(
  lazy(() => import('@/components/landlord/auth/AuthForgotPassword')),
);
const ResetPassword = Loadable(lazy(() => import('@/components/landlord/auth/AuthResetPassword')));
const VerifyOtp = Loadable(lazy(() => import('@/components/landlord/auth/AuthVerifyOtp')));
const Error = Loadable(lazy(() => import('../utils/auth/Error')));

const Analytics_ = Loadable(lazy(() => import('@/pages/landlord/views/analytics_/index')));

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
      <LandlordProtectedRoute>
        <FullLayout />
      </LandlordProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardRouteWrapper /> },
      {
        path: 'dashboard',
        element: (
          <LandlordProtectedRoute permission="landlord.dashboard">
            <DashboardRouteWrapper />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'analytics_',
        element: (
          <LandlordProtectedRoute permission="landlord.tenant_analytics_for_landlord_level_one_only.index">
            <Analytics_ />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'acl_manager',
        element: (
          <LandlordProtectedRoute permission="landlord.acl.index">
            <AlcManager />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'organization',
        element: (
          <LandlordProtectedRoute permission="landlord.organization.index">
            <Agent />
          </LandlordProtectedRoute>
        ),
      },
      { path: 'view/:id', element: <ViewAgent /> },
      {
        path: 'gateway',
        element: (
          <LandlordProtectedRoute permission="landlord.gateway.index">
            <Gateway />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'calendar',
        element: (
          <LandlordProtectedRoute permission="landlord.calendar.index">
            <CalendarManagement />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'school',
        element: (
          <LandlordProtectedRoute permission="landlord.school.index">
            <SchoolDashboard />
          </LandlordProtectedRoute>
        ),
      },
      { path: 'view-school/:id', element: <ViewSchool /> },
      {
        path: 'organization/subscriptions',
        element: (
          <LandlordProtectedRoute permission="landlord.subscription.index">
            <AgentSubscriptionManagement />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'activity_log',
        element: (
          <LandlordProtectedRoute permission="landlord.activity_log.index">
            <ActivityLog />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'organization/commissions',
        element: (
          <LandlordProtectedRoute permission="landlord.commission.index">
            <CommissionManagement />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'commission/subscription',
        element: (
          <LandlordProtectedRoute permission="landlord.commission.index">
            <MyCommissionBySubscription />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'commission/transaction',
        element: (
          <LandlordProtectedRoute permission="landlord.commission.index">
            <MyCommissionByTransaction />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'plan',
        element: (
          <LandlordProtectedRoute permission="landlord.plan.index">
            <PackageManager />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'phet/subject_topics',
        element: (
          <LandlordProtectedRoute permission="landlord.phet_simulation.index">
            <SubjectAndTopics />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'phet/stimulation_links',
        element: (
          <LandlordProtectedRoute permission="landlord.phet_simulation.index">
            <StimulationLinks />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'curriculum-manager',
        element: (
          <LandlordProtectedRoute permission="landlord.curriculum.index">
            <AgentCurriculumManager />
          </LandlordProtectedRoute>
        ),
      },
      {
        path: 'pages/account-settings',
        element: (
          <LandlordProtectedRoute anyOf={['landlord.profile.view', 'landlord.profile.edit']}>
            <AccountSetting />
          </LandlordProtectedRoute>
        ),
      },
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
      { path: '/agent/forgot_password', element: <AuthForgotPassword /> },
      { path: '/agent/verify_otp', element: <VerifyOtp /> },
      { path: '/agent/reset_password', element: <ResetPassword /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default AgentRoutes;
