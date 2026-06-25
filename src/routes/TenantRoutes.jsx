import React, { lazy } from 'react';
import Loadable from '@/layouts/landlord/shared/loadable/Loadable';
import TenantProtectedRoute from '@/components/protectedroutes/TenantProtectedRoute';
import SetupRedirectHandler from '@/context/TenantContext/SetupRedirectHandler';

const SchoolLayout = Loadable(lazy(() => import('@/layouts/tenant/SchoolLayout')));
const BlankLayout = Loadable(lazy(() => import('@/layouts/blank/BlankLayout')));

const SchoolDashboardMain = Loadable(
  lazy(() => import('@/pages/tenant/school-dashboard/SchoolDashboard')),
);
const SetupWelcome = Loadable(lazy(() => import('@/pages/tenant/school-setup/SetupWelcome')));
const InitialSetup = Loadable(lazy(() => import('@/pages/tenant/school-setup/InitialSetup')));
const CompleteSetup = Loadable(lazy(() => import('@/pages/tenant/school-setup/CompleteSetup')));
const SessionWeekManager = Loadable(lazy(() => import('@/pages/tenant/school/SessionWeekManager')));
const SchemeOfWork = Loadable(lazy(() => import('@/pages/tenant/scheme-of-work/SchemeOfWork')));
const CurriculumManager = Loadable(
  lazy(() => import('@/pages/tenant/curriculum-manager/CurriculumManager')),
);
const ClassStructureManager = Loadable(
  lazy(() => import('@/components/tenant/class-structure/ClassStructureManager')),
);
const SubscriptionIndex = Loadable(
  lazy(() => import('@/pages/tenant/subcriptions/SubscriptionIndex')),
);
const TenantLogin = Loadable(lazy(() => import('@/pages/tenant/auth/TenantLogin')));
const ForgotPassword = Loadable(lazy(() => import('@/components/tenant/auth/ForgotPassword')));
const VerifyOtp = Loadable(lazy(() => import('@/components/tenant/auth/VerifyOtp')));
const ResetPassword = Loadable(lazy(() => import('@/components/tenant/auth/ResetPassword')));
const AdmissionApply = Loadable(lazy(() => import('@/pages/tenant/auth/admission/AdmissionApply')));
const ImpersonateLogin = Loadable(lazy(() => import('../utils/auth/ImpersonateLogin')));
const Error = Loadable(lazy(() => import('../utils/auth/Error')));
const SchoolNotFound = Loadable(lazy(() => import('../utils/auth/SchoolNotFound')));
const AlcManager = Loadable(lazy(() => import('@/pages/tenant/alc-manager/SchoolAlcManager')));
const ActivityLog = Loadable(lazy(() => import('@/pages/tenant/activity-log/ActivityLog')));

const CalendarPage = Loadable(lazy(() => import('@/pages/tenant/school-setup/CalendarPage')));
const AccountSetting = Loadable(lazy(() => import('@/pages/tenant/profile/AccountSetting')));
const StaffManager = Loadable(lazy(() => import('@/pages/tenant/staff-manager/StaffManager')));
const PageUnderDevelopment = Loadable(
  lazy(() => import('@/components/shared/PageUnderDevelopment')),
);
const ParentManagement = Loadable(lazy(() => import('@/pages/tenant/parents/ParentManagement')));
const LearnerManagement = Loadable(lazy(() => import('@/pages/tenant/learners/LearnerManagement')));

const NewApplication = Loadable(lazy(() => import('@/pages/tenant/admission/NewApplication')));
const MyApplication = Loadable(lazy(() => import('@/pages/tenant/admission/MyApplication')));
const AdmissionLetter = Loadable(lazy(() => import('@/pages/tenant/admission/AdmissionLetter')));
const ApplicationTracker = Loadable(
  lazy(() => import('@/pages/tenant/admission/ApplicationTracker')),
);

const FormDetails = Loadable(lazy(() => import('@/pages/tenant/admission/FormDetails')));
const AdmissionSetup = Loadable(lazy(() => import('@/pages/tenant/admission/AdmissionSetup')));
const CreateAdmissionBatch = Loadable(
  lazy(() => import('@/pages/tenant/admission/CreateAdmissionBatch')),
);

const BursarySetup = Loadable(lazy(() => import('@/pages/tenant/finance/bursary/BursarySetup')));
const PaymentShedule = Loadable(lazy(() => import('@/pages/tenant/finance/bursary/PaymentShedule')));
const PrintInvoicePage = Loadable(
  lazy(() => import('@/components/tenant/bursary/payment-shedule/PrintInvoicePage')),
);
const InvoiceStudentsView = Loadable(
  lazy(() => import('@/components/tenant/bursary/payment-shedule/InvoiceStudentsView')),
);
const InvoiceView = Loadable(
  lazy(() => import('@/components/tenant/bursary/payment-shedule/InvoiceView')),
);

const Transactions = Loadable(lazy(() => import('@/pages/tenant/transaction/TransactionManager')));
const ClassLedger = Loadable(lazy(() => import('@/pages/tenant/class-ledger/ClassLedger')));
const CashPost = Loadable(lazy(() => import('@/pages/tenant/class-ledger/components/CashPost')));
const Invoice = Loadable(lazy(() => import('@/pages/tenant/class-ledger/components/Invoice')));
const PayInvoice = Loadable(lazy(() => import('@/pages/tenant/class-ledger/components/PayInvoice')));

const ChartOfAccounts = Loadable(lazy(() => import('@/pages/tenant/finance/chart-of-accounts/ChartOfAccounts')));

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
    path: '/class-ledger/:invoiceId/:user_id/pay-invoice',
    element: (
      <TenantProtectedRoute>
        <SchoolLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <PayInvoice /> }],
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
      {
        path: 'payment-schedule',
        element: (
          <TenantProtectedRoute permission="dashboard.index">
            <PaymentShedule />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'payment-schedule/invoice/:session_term_id/:class_id',
        element: (
          <TenantProtectedRoute permission="dashboard.index">
            <InvoiceStudentsView />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'payment-schedule/invoice/:session_term_id/:class_id/:category_id/view_class_invoice',
        element: (
          <TenantProtectedRoute permission="dashboard.index">
            <InvoiceView />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'payment-schedule/invoice/print/:session_term_id/:class_id/:id',
        element: (
          <TenantProtectedRoute permission="dashboard.index">
            <PrintInvoicePage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'transactions',
        element: (
          <TenantProtectedRoute permission="bursary_manager.transactions.index">
            <Transactions />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'chart-of-accounts',
        element: (
          <TenantProtectedRoute permission="chart_of_accounts.index">
            <ChartOfAccounts />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'bursary-setup',
        element: (
          <TenantProtectedRoute permission="dashboard.index">
            <BursarySetup />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'class-ledger',
        element: (
          <TenantProtectedRoute permission="bursary_manager.ledger.index">
            <ClassLedger />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'class-ledger/:invoiceId/:user_id/cash-post',
        element: (
          <TenantProtectedRoute permission="bursary_manager.ledger.index">
            <CashPost />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'class-ledger/:invoiceId/:user_id/invoice',
        element: (
          <TenantProtectedRoute permission="bursary_manager.ledger.index">
            <Invoice />
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
        path: 'admission_manager/my_applications',
        element: (
          <TenantProtectedRoute permission="admission_manager.my_applications.index">
            <MyApplication />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission_manager/my_applications/:id',
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
      {
        path: 'admission/form-details',
        element: (
          <TenantProtectedRoute permission="admission_manager.tracker.index">
            <FormDetails />
          </TenantProtectedRoute>
        ),
      },
    ],
  },
];

export default TenantRoutes;
