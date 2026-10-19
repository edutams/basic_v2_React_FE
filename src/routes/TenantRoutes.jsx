import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '@/layouts/landlord/shared/loadable/Loadable';
import TenantProtectedRoute from '@/components/protectedroutes/TenantProtectedRoute';
import SetupRedirectHandler from '@/context/TenantContext/SetupRedirectHandler';
import PrintReceipt from '@/pages/tenant/finance/bursary/PrintReceipt';
import RouteErrorBoundary from '@/components/shared/RouteErrorBoundary';

const SchoolLayout = Loadable(lazy(() => import('@/layouts/tenant/SchoolLayout')));
const BlankLayout = Loadable(lazy(() => import('@/layouts/blank/BlankLayout')));

const SchoolDashboardMain = Loadable(
  lazy(() => import('@/pages/tenant/school-dashboard/SchoolDashboard')),
);
const AdmissionOfficerDashboard = Loadable(
  lazy(() => import('@/pages/tenant/admission/AdmissionOfficerDashboard')),
);
const BursaryOfficerDashboard = Loadable(
  lazy(() => import('@/pages/tenant/finance/BursaryOfficerDashboard')),
);
const TeacherDashboard = Loadable(
  lazy(() => import('@/pages/tenant/staff-manager/teacher-dashboard/TeacherDashboard')),
);
const SetupWelcome = Loadable(lazy(() => import('@/pages/tenant/school-setup/SetupWelcome')));
const InitialSetup = Loadable(lazy(() => import('@/pages/tenant/school-setup/InitialSetup')));
const CompleteSetup = Loadable(lazy(() => import('@/pages/tenant/school-setup/CompleteSetup')));
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
const VerifyResult = Loadable(lazy(() => import('@/pages/tenant/public/VerifyResult')));
const AlcManager = Loadable(lazy(() => import('@/pages/tenant/alc-manager/SchoolAlcManager')));
const ActivityLog = Loadable(lazy(() => import('@/pages/tenant/activity-log/ActivityLog')));

const EResourcesIndex = Loadable(lazy(() => import('@/pages/tenant/e-resources/Index')));
const EResourcesVideoTutorials = Loadable(lazy(() => import('@/pages/tenant/e-resources/VideoTutorials')));
const EResourcesStudentBrowse = Loadable(lazy(() => import('@/pages/tenant/e-resources/EResourceStudent')));
const EResourcesStudentHub = Loadable(lazy(() => import('@/pages/tenant/e-resources/student/StudentEResource')));
const EResourcesStudentLessonNote = Loadable(lazy(() => import('@/pages/tenant/e-resources/student/StudentLessonNoteView')));
const EResourcesStudentAssessment = Loadable(lazy(() => import('@/pages/tenant/e-resources/student/StudentAssessment')));
const EResourcesStudentProgress = Loadable(lazy(() => import('@/pages/tenant/e-resources/student/StudentProgress')));
const EResourcesStaffLessonNote = Loadable(lazy(() => import('@/pages/tenant/e-resources/teacher/StaffLessonNoteIndex')));
const EResourcesLessonNoteEditor = Loadable(lazy(() => import('@/pages/tenant/e-resources/teacher/LessonNoteEditor')));
const EResourcesLessonPlanEditor = Loadable(lazy(() => import('@/pages/tenant/e-resources/teacher/LessonPlanEditor')));
const EResourcesLessonVideoManager = Loadable(lazy(() => import('@/pages/tenant/e-resources/teacher/LessonVideoManager')));
const EResourcesLessonNoteProgress = Loadable(lazy(() => import('@/pages/tenant/e-resources/teacher/LessonNoteProgress')));
const EResourcesApproval = Loadable(lazy(() => import('@/pages/tenant/e-resources/approval/LessonNoteApproval')));

const CalendarPage = Loadable(lazy(() => import('@/pages/tenant/school-setup/CalendarPage')));
const AccountSetting = Loadable(lazy(() => import('@/pages/tenant/profile/AccountSetting')));
const StaffManager = Loadable(lazy(() => import('@/pages/tenant/staff-manager/StaffManager')));
const TeachingAllocations = Loadable(
  lazy(() => import('@/pages/tenant/teaching-allocations/TeachingAllocations')),
);
const GenerateTimetable = Loadable(lazy(() => import('@/pages/tenant/timetable/GenerateTimetable')));
const PeriodSettings = Loadable(lazy(() => import('@/pages/tenant/timetable/PeriodSettings')));
const TeacherTimetableView = Loadable(lazy(() => import('@/pages/tenant/timetable/TeacherTimetableView')));
const AttendanceComplianceReport = Loadable(lazy(() => import('@/pages/tenant/timetable/AttendanceComplianceReport')));
const MyTimetable = Loadable(lazy(() => import('@/pages/tenant/timetable/MyTimetable')));
const MyTimetableLearner = Loadable(lazy(() => import('@/pages/tenant/timetable/MyTimetableLearner')));
const PageUnderDevelopment = Loadable(
  lazy(() => import('@/components/shared/PageUnderDevelopment')),
);
const AdmissionProcessing = Loadable(
  lazy(() => import('@/pages/tenant/admission/AdmissionProcessing')),
);
const AdmissionDashboard = Loadable(
  lazy(() => import('@/pages/tenant/admission/AdmissionDashboard')),
);
const ParentManagement = Loadable(lazy(() => import('@/pages/tenant/parents/ParentManagement')));
const LearnerManagement = Loadable(lazy(() => import('@/pages/tenant/learners/LearnerManagement')));

const NewApplication = Loadable(lazy(() => import('@/pages/tenant/admission/NewApplication')));
const MyApplication = Loadable(lazy(() => import('@/pages/tenant/admission/MyApplication')));
const AdmissionLetter = Loadable(lazy(() => import('@/pages/tenant/admission/AdmissionLetter')));
const ProcessApplicationForm = Loadable(
  lazy(() => import('@/pages/tenant/admission/ProcessApplicationForm')),
);
const EditApplicationForm = Loadable(
  lazy(() => import('@/pages/tenant/admission/EditApplicationForm')),
);
const PrintApplicationForm = Loadable(
  lazy(() => import('@/pages/tenant/admission/PrintApplicationForm')),
);
const ApplicantPaymentHistory = Loadable(
  lazy(() => import('@/pages/tenant/admission/ApplicantPaymentHistory')),
);
const ApplicationTracker = Loadable(
  lazy(() => import('@/pages/tenant/admission/ApplicationTracker')),
);

const FormDetails = Loadable(lazy(() => import('@/pages/tenant/admission/FormDetails')));
const AdmissionSetup = Loadable(lazy(() => import('@/pages/tenant/admission/AdmissionSetup')));
const CreateAdmissionBatch = Loadable(
  lazy(() => import('@/pages/tenant/admission/CreateAdmissionBatch')),
);

const BursarySetup = Loadable(lazy(() => import('@/pages/tenant/finance/bursary/BursarySetup')));
const PaymentShedule = Loadable(
  lazy(() => import('@/pages/tenant/finance/bursary/PaymentShedule')),
);
const PrintInvoicePage = Loadable(
  lazy(() => import('@/components/tenant/bursary/payment-shedule/PrintInvoicePage')),
);
const InvoiceStudentsView = Loadable(
  lazy(() => import('@/components/tenant/bursary/payment-shedule/InvoiceStudentsView')),
);
const InvoiceView = Loadable(
  lazy(() => import('@/components/tenant/bursary/payment-shedule/InvoiceView')),
);

const WalletTransactions = Loadable(
  lazy(() => import('@/pages/tenant/transaction/wallet/WalletTransactions')),
);
const Transactions = Loadable(lazy(() => import('@/pages/tenant/transaction/TransactionManager')));
const PaymentHistory = Loadable(
  lazy(() => import('@/pages/tenant/finance/bursary/PaymentHistory')),
);
const ClassLedger = Loadable(lazy(() => import('@/pages/tenant/class-ledger/ClassLedger')));
const SubjectRegistration = Loadable(
  lazy(() => import('@/pages/tenant/subject-registration/SubjectRegistration')),
);
const ClassRegister = Loadable(lazy(() => import('@/pages/tenant/class-register/ClassRegister')));
const AttendancePsychomotor = Loadable(
  lazy(() => import('@/pages/tenant/attendance/AttendancePsychomotor')),
);
const CashPost = Loadable(lazy(() => import('@/pages/tenant/class-ledger/components/CashPost')));
const Invoice = Loadable(lazy(() => import('@/pages/tenant/class-ledger/components/Invoice')));
const PayInvoice = Loadable(
  lazy(() => import('@/pages/tenant/class-ledger/components/PayInvoice')),
);
const PaySchoolFees = Loadable(
  lazy(() => import('@/pages/tenant/admission/parent-dashboard/PaySchoolFees')),
);

const ChartOfAccounts = Loadable(
  lazy(() => import('@/pages/tenant/finance/chart-of-accounts/ChartOfAccounts')),
);
const ResultModule = Loadable(lazy(() => import('@/pages/tenant/result/ResultModule')));
const ScoreManagerPage = Loadable(lazy(() => import('@/pages/tenant/result/ScoreManagerPage')));
const UploadScoresPage = Loadable(lazy(() => import('@/pages/tenant/result/UploadScoresPage')));
const ResultConsiderationPage = Loadable(
  lazy(() => import('@/pages/tenant/result/ResultConsiderationPage')),
);
const ResultEditPage = Loadable(lazy(() => import('@/pages/tenant/result/ResultEditPage')));
const ScoreSheetPage = Loadable(lazy(() => import('@/pages/tenant/result/ScoreSheetPage')));
const CaBreakdownPage = Loadable(lazy(() => import('@/pages/tenant/result/CaBreakdownPage')));
const PerformanceAnalyticsPage = Loadable(
  lazy(() => import('@/pages/tenant/result/PerformanceAnalyticsPage')),
);
const ResultOverviewPage = Loadable(lazy(() => import('@/pages/tenant/result/ResultOverviewPage')));
const ResultSheetPage = Loadable(lazy(() => import('@/pages/tenant/result/ResultSheetPage')));
const BroadsheetPage = Loadable(lazy(() => import('@/pages/tenant/result/BroadsheetPage')));
const SummarySheetPage = Loadable(lazy(() => import('@/pages/tenant/result/SummarySheetPage')));
const ReportSheetPage = Loadable(lazy(() => import('@/pages/tenant/result/ReportSheetPage')));
const ClassDossierPage = Loadable(lazy(() => import('@/pages/tenant/result/ClassDossierPage')));
const ReportCardPage = Loadable(lazy(() => import('@/pages/tenant/result/ReportCardPage')));
const WardReportCardPage = Loadable(lazy(() => import('@/pages/tenant/result/WardReportCardPage')));
const CommentBankPage = Loadable(lazy(() => import('@/pages/tenant/result/CommentBankPage')));
const MessagingPage = Loadable(lazy(() => import('@/pages/tenant/result/MessagingPage')));
const CommunicationsPage = Loadable(
  lazy(() => import('@/pages/tenant/communications/CommunicationsPage')),
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
  // Public "Download Result" link from Result → Messaging — no session or
  // permission guard; the backend route behind it re-applies the school's
  // publish / result-payment gates.
  {
    path: '/verifyresult/:tenantId/:regId',
    element: <BlankLayout />,
    children: [{ index: true, element: <VerifyResult /> }],
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
        {/* permission="bursary_manager.ledger.pay_invoice" */}
        <SchoolLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <PayInvoice /> }],
  },
  {
    // Parent/student invoice view — auth-only (the class-ledger invoice route
    // requires bursary_manager.ledger.index, which parents don't have).
    path: '/parent-invoice/:invoiceId/:user_id',
    element: (
      <TenantProtectedRoute>
        <SchoolLayout />
      </TenantProtectedRoute>
    ),
    children: [{ index: true, element: <Invoice /> }],
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
      // The bare root always bounces to /dashboard so the dashboard URL
      // keeps its /dashboard prefix everywhere (login, sidebar, refresh).
      { index: true, element: <Navigate to="/dashboard" replace /> },

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
        path: 'subscriptions',
        element: (
          <TenantProtectedRoute permission="subscriptions.index">
            <SubscriptionIndex />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'subscriptions-history',
        element: (
          <TenantProtectedRoute permission="subscriptions.transaction_history">
            <SubscriptionIndex />
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
        path: 'teaching-allocations',
        element: (
          <TenantProtectedRoute permission="setup.academics.class_teacher.manage">
            <TeachingAllocations />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'timetable/generate',
        element: (
          <TenantProtectedRoute permission="timetable.generate.manage">
            <GenerateTimetable />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'timetable/period-settings',
        element: (
          <TenantProtectedRoute permission="timetable.settings.manage">
            <PeriodSettings />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'timetable/teacher-view',
        element: (
          <TenantProtectedRoute permission="timetable.teacher_view.index">
            <TeacherTimetableView />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'timetable/attendance-compliance-report',
        element: (
          <TenantProtectedRoute permission="timetable.compliance_report.index">
            <AttendanceComplianceReport />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'timetable/my-timetable',
        element: (
          <TenantProtectedRoute permission="timetable.my_timetable.index">
            <MyTimetable />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'my-timetable',
        element: (
          <TenantProtectedRoute permission="timetable.my_timetable.index">
            <MyTimetable />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'timetable/my-timetable-learner',
        element: (
          <TenantProtectedRoute permission="timetable.my_timetable_learner.index">
            <MyTimetableLearner />
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
            <AdmissionProcessing />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission-dashboard',
        element: (
          <TenantProtectedRoute permission="admission_manager.dashboard.index">
            <AdmissionDashboard />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission/process-form/:form_number',
        element: (
          <TenantProtectedRoute permission="admission_manager.process.index">
            <ProcessApplicationForm />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission/edit-form/:form_number',
        element: (
          <TenantProtectedRoute permission="admission_manager.process.index">
            <EditApplicationForm />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission/print-application/:form_number',
        element: (
          <TenantProtectedRoute permission="admission_manager.process.index">
            <PrintApplicationForm />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'admission/payment-history/:form_number',
        element: (
          <TenantProtectedRoute permission="admission_manager.process.index">
            <ApplicantPaymentHistory />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'payment-schedule',
        element: (
          <TenantProtectedRoute permission="bursary_manager.payment_schedule.index">
            <PaymentShedule />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'payment-schedule/invoice/:session_term_id/:class_id',
        element: (
          <TenantProtectedRoute permission="bursary_manager.payment_schedule.index">
            <InvoiceStudentsView />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'payment-schedule/invoice/:session_term_id/:class_id/:category_id/view_class_invoice',
        element: (
          <TenantProtectedRoute permission="bursary_manager.payment_schedule.index">
            <InvoiceView />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'payment-schedule/invoice/print/:session_term_id/:class_id/:id',
        element: (
          <TenantProtectedRoute permission="bursary_manager.payment_schedule.index">
            <PrintInvoicePage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'transactions',
        element: (
          <TenantProtectedRoute permission="walet_manager.transactions.index">
            <Transactions />
          </TenantProtectedRoute>
        ),
      },
      {
        // bursary_manager.payment_history.index is shared across staff,
        // parent, and student roles (see FinanceModuleSeeder) — the actual
        // "who may view whom" scoping happens in PaymentHistoryController.
        path: 'bursary/payment-history',
        element: (
          <TenantProtectedRoute permission="bursary_manager.payment_history.index">
            <PaymentHistory />
          </TenantProtectedRoute>
        ),
      },
      {
        path: '/bursary/transactions/print_receipt',
        element: (
          <TenantProtectedRoute permission="walet_manager.transactions.index">
            <PrintReceipt />
          </TenantProtectedRoute>
        ),
      },
      {
        path: '/bursary/transactions/wallet_transactions',
        element: (
          <TenantProtectedRoute permission="walet_manager.transactions.index">
            <WalletTransactions />
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
      // ── Result Module routes (each maps to a sidebar link from the seeder) ──
      {
        path: 'result-setup',
        element: (
          <TenantProtectedRoute permission="result.admin.manage_result_setup">
            <ResultModule />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'score-manager',
        element: (
          <TenantProtectedRoute permission="result.admin.upload_score">
            <ScoreManagerPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-upload',
        element: (
          <TenantProtectedRoute permission="result.admin.upload_score">
            <UploadScoresPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-consideration',
        element: (
          <TenantProtectedRoute permission="result.admin.consideration.view">
            <ResultConsiderationPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-edit',
        element: (
          <TenantProtectedRoute permission="result.admin.edit">
            <ResultEditPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-scoresheet',
        element: (
          <TenantProtectedRoute permission="result.admin.view_score_sheet">
            <ScoreSheetPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-ca_breakdown',
        element: (
          <TenantProtectedRoute permission="result.client.ca_breakdown">
            <CaBreakdownPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-analytics',
        element: (
          <TenantProtectedRoute permission="result.admin.view_analytics">
            <PerformanceAnalyticsPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-overview',
        element: (
          <TenantProtectedRoute permission="result.admin.view_overview">
            <ResultOverviewPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-sheet',
        element: (
          <TenantProtectedRoute permission="result.admin.view_broadsheet">
            <ResultSheetPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-broadsheet',
        element: (
          <TenantProtectedRoute permission="result.admin.view_school_broadsheet">
            <BroadsheetPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-summary',
        element: (
          <TenantProtectedRoute permission="result.admin.view_summary_sheet">
            <SummarySheetPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-reportsheet',
        element: (
          <TenantProtectedRoute permission="result.view_dossier">
            <ReportSheetPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-class_dossier',
        element: (
          <TenantProtectedRoute permission="result.view_dossier">
            <ClassDossierPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-reportcard',
        element: (
          <TenantProtectedRoute permission="result.client.view_report_sheet">
            <ReportCardPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-wards-report',
        element: (
          <TenantProtectedRoute permission="result.client.view_wards_report">
            <WardReportCardPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-comment-bank',
        element: (
          <TenantProtectedRoute permission="result.admin.manage_comment_bank">
            <CommentBankPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'result-messaging',
        element: (
          <TenantProtectedRoute permission="result.admin.manage_result_messaging">
            <MessagingPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'communications',
        element: (
          <TenantProtectedRoute permission="communication.index">
            <CommunicationsPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'communications/broadcast-messaging',
        element: (
          <TenantProtectedRoute permission="communication.index">
            <CommunicationsPage />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'bursary-setup',
        element: (
          <TenantProtectedRoute permission="bursary_manager.setup.index">
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
      {
        path: 'dashboard',
        element: (
          <TenantProtectedRoute permission="dashboard.index">
            <SchoolDashboardMain />
          </TenantProtectedRoute>
        ),
      },
      // ── Role-specific dashboards (linked from the Admin Dashboard) ──
      {
        path: 'dashboard/admission',
        element: (
          <TenantProtectedRoute permission="admission_manager.dashboard.index">
            <AdmissionOfficerDashboard />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'dashboard/bursary',
        element: (
          <TenantProtectedRoute permission="bursary_manager.dashboard.index">
            <BursaryOfficerDashboard />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'staff-manager/teacher-dashboard',
        element: (
          <TenantProtectedRoute permission="teacher_dashboard.dashboard.index">
            <TeacherDashboard />
          </TenantProtectedRoute>
        ),
      },

      // ── Parent-specific routes ──
      { path: 'pay-school-fees', element: <PaySchoolFees /> },
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

      // ── Class Manager Routes ──
      {
        path: 'subject-registration',
        element: (
          <TenantProtectedRoute permission="manage.class_manager.subject_registrar.view">
            <SubjectRegistration />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'class-register',
        element: (
          <TenantProtectedRoute permission="manage.class_manager.class_register.view">
            <ClassRegister />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'attendance-psychomotor',
        element: (
          <TenantProtectedRoute permission="manage.class_manager.attendance_psychomotor.view">
            <AttendancePsychomotor />
          </TenantProtectedRoute>
        ),
      },

      {
        path: 'e-resources',
        element: (
          <TenantProtectedRoute permission="e_resources.view">
            <EResourcesIndex />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/video-tutorials',
        element: (
          <TenantProtectedRoute permission="e_resources.view">
            <EResourcesVideoTutorials />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/student',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.student.view">
            <EResourcesStudentHub />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/student/browse',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.student.view">
            <EResourcesStudentBrowse />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/student/lesson-note',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.student.view">
            <EResourcesStudentLessonNote />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/student/assessment',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.student.view">
            <EResourcesStudentAssessment />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/student/progress',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.student.view">
            <EResourcesStudentProgress />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/lesson-note',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.teacher.view">
            <EResourcesStaffLessonNote />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/lesson-note/note',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.teacher.view">
            <EResourcesLessonNoteEditor />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/lesson-note/plan',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.teacher.view">
            <EResourcesLessonPlanEditor />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/lesson-note/video',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.teacher.view">
            <EResourcesLessonVideoManager />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/lesson-note/progress',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.teacher.view">
            <EResourcesLessonNoteProgress />
          </TenantProtectedRoute>
        ),
      },
      {
        path: 'e-resources/approval',
        element: (
          <TenantProtectedRoute permission="e_resources.lesson_note.approval.view">
            <EResourcesApproval />
          </TenantProtectedRoute>
        ),
      },

      // ── Catch-all: route unmatched paths to Page Under Development ──
      {
        path: '*',
        element: <PageUnderDevelopment />,
      },
    ],
  },
].map((route) => ({ errorElement: <RouteErrorBoundary />, ...route }));

export default TenantRoutes;
