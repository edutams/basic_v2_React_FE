import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import {
  getParentWards,
  getParentBatches,
  getParentFinance,
  getParentAttendance,
  getParentAcademics,
  getParentNotifications,
  getSessionTermWeeks,
} from '@/api/tenant/admission/admissionApi';
import { fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchParentPayments } from '@/api/tenant/bursary/classLedger';

import MyWards from './component/my-wards';
import QuickActions from './component/quick-actions';
import AcademicOverview from './component/academic-overview';
import ParentWalletAccount from './component/parent-wallet-account';
import TermCalendar from './component/term-calendar';
import ActivityLogs from './component/activity-logs';

// Activity-log icon mapping — mirrors the notifications payload types so the
// Activity Logs card shows real data (fee reminders, payments, events, messages).
import {
  WarningAmberOutlined,
  CheckCircleOutlineOutlined,
  EventAvailableOutlined,
  AssignmentOutlined,
} from '@mui/icons-material';

const LOG_META = {
  fee:     { icon: WarningAmberOutlined,       iconBg: '#fee2e2', iconColor: '#dc2626' },
  payment: { icon: CheckCircleOutlineOutlined, iconBg: '#dcfce7', iconColor: '#16a34a' },
  event:   { icon: EventAvailableOutlined,     iconBg: '#dbeafe', iconColor: '#2563eb' },
  message: { icon: AssignmentOutlined,         iconBg: '#ffedd5', iconColor: '#ea580c' },
};

// Status chip colors for real backend ward statuses.
const STATUS_STYLES = {
  Enrolled:           { color: '#16a34a', bg: '#dcfce7' },
  Admitted:           { color: '#059669', bg: '#d1fae5' },
  'Under Review':     { color: '#d97706', bg: '#fef3c7' },
  Pending:            { color: '#d97706', bg: '#fef3c7' },
  'Pending Submission': { color: '#d97706', bg: '#fef3c7' },
  'In Progress':      { color: '#2563eb', bg: '#dbeafe' },
  Draft:              { color: '#64748b', bg: '#f1f5f9' },
  Rejected:           { color: '#dc2626', bg: '#fee2e2' },
};

const keyOf = (name) => String(name || '').trim().toLowerCase();

const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Parent Dashboard — Modern high-fidelity layout matching design mockup:
 * Left side (~70%): My Wards (3 cards max with prev/next navigation), Quick Actions, Academic Overview.
 * Right side (~30%): Parent Wallet Account, Term Calendar, Activity Logs.
 *
 * Data wiring (real endpoints):
 *  - My Wards          ← /admission/parent/wards (enrolled + prospective), enriched with
 *                        attendance % (parent/attendance) and average score
 *                        (parent/academics) per ward.
 *  - Batches           ← /admission/parent/batches (open admission batches).
 *  - Parent Wallet     ← /admission/parent/finance (outstanding balance).
 *  - Term Calendar     ← active session term + its weeks (real start/end dates).
 *  - Activity Logs     ← /admission/parent/notifications (real derived items).
 */
const ParentDashboard2 = () => {
  const navigate = useNavigate();
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardStats, setWardStats] = useState({}); // name -> { attendance, averageScore }
  const [invoiceById, setInvoiceById] = useState({}); // ward id -> invoice number
  const [logs, setLogs] = useState([]); // activity-log items from notifications
  const [termInfo, setTermInfo] = useState(null); // { termName, daysCount, startDate, endDate }

  useEffect(() => {
    let mounted = true;

    // allSettled: one failing card endpoint must never block the rest of the
    // dashboard (e.g. attendance/academics 500s when there are no registrations).
    Promise.allSettled([
      getParentWards(),
      getParentBatches(),
      getParentFinance(),
      getParentAttendance(),
      getParentAcademics(),
      getParentNotifications(),
      fetchParentPayments(),
    ]).then((results) => {
        if (!mounted) return;

        const wardsRes  = results[0]?.status === 'fulfilled' ? results[0].value : null;
        const batchesRes = results[1]?.status === 'fulfilled' ? results[1].value : null;
        const finance   = results[2]?.status === 'fulfilled' ? results[2].value : null;
        const attendance = results[3]?.status === 'fulfilled' ? results[3].value : null;
        const academics = results[4]?.status === 'fulfilled' ? results[4].value : null;
        const notifications = results[5]?.status === 'fulfilled' ? results[5].value : null;
        const payments = results[6]?.status === 'fulfilled' ? results[6].value : null;

        if (wardsRes?.status) {
          setDashboardData((prev) => ({
            ...prev,
            wards: wardsRes.data || [],
          }));
          if (wardsRes.data?.length > 0) {
            setSelectedWard(wardsRes.data[0]);
          }
        }

        if (batchesRes?.status) {
          setDashboardData((prev) => ({
            ...prev,
            has_open_batches: batchesRes.data?.has_open_batches ?? false,
            open_batches: batchesRes.data?.open_batches || [],
          }));
        }

        if (finance?.status) {
          setDashboardData((prev) => ({
            ...prev,
            finance: finance.data,
          }));
        }

        // Per-ward attendance % (attendance endpoint) keyed by ward name.
        const attByName = {};
        (attendance?.data?.wards || []).forEach((w) => {
          const p = Number(w.present || 0);
          const a = Number(w.absent || 0);
          attByName[keyOf(w.name)] = p + a > 0 ? Math.round((p / (p + a)) * 100) : null;
        });

        // Per-ward average score (academics endpoint) keyed by user id + name.
        const acadById = {};
        const acadByName = {};
        (academics?.data?.wards || []).forEach((w) => {
          const quiz = Number(w.quizzes?.avg || 0);
          const exam = Number(w.exams?.avg || 0);
          const avg = quiz || exam ? Math.round((quiz + exam) / 2) : (w.assignments?.pct ?? null);
          acadById[String(w.id)] = avg;
          acadByName[keyOf(w.name)] = avg;
        });

        setWardStats({ attByName, acadById, acadByName });

        // Per-ward invoice number (for the "View Invoice" ledger link),
        // from the parent-payments payload: first invoice id per ward.
        const invoiceById = {};
        (payments?.data || []).forEach((w) => {
          const first = (w.payments || []).find((p) => p.invoice_id);
          if (first) invoiceById[String(w.id)] = first.invoice_id;
        });
        setInvoiceById(invoiceById);

        // Activity logs — real notifications (fee / payment / event / message).
        if (notifications?.status) setLogs(notifications.data || []);
      })
      .catch((err) => console.error('Failed to load parent dashboard:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Term calendar — active session term + its weeks for real dates.
    const loadTerm = async () => {
      try {
        const active = await fetchActiveSessionTerm();
        if (!mounted || !active?.status || !active?.data?.session_term_id) return;
        const { session_name, term_name, session_term_id } = active.data;

        const weeksRes = await getSessionTermWeeks(session_term_id);
        const weeks = (weeksRes?.data || []).filter((w) => w.start_date && w.end_date);
        if (!mounted) return;

        let daysCount = 0;
        if (weeks.length > 0) {
          const starts = weeks.map((w) => new Date(w.start_date).getTime());
          const ends = weeks.map((w) => new Date(w.end_date).getTime());
          const first = Math.min(...starts);
          const last = Math.max(...ends);
          daysCount = Math.round((last - first) / 86400000) + 1;
          setTermInfo({
            termName: `${session_name || ''} ${term_name || ''} Term`.trim(),
            daysCount: `${daysCount} Days`,
            startDate: fmtDate(weeks.find((w) => new Date(w.start_date).getTime() === first)?.start_date),
            endDate: fmtDate(weeks.find((w) => new Date(w.end_date).getTime() === last)?.end_date),
          });
        }
      } catch (err) {
        console.error('Failed to load term calendar:', err);
      }
    };
    loadTerm();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApply = (batch) => {
    setAdmissionModalOpen(false);
    navigate('/admission/new-application', { state: { batch } });
  };

  // Compute age in years from a YYYY-MM-DD date string.
  const ageFromDob = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  // Enrich backend ward cards with display fields + per-ward stats.
  const wards = (dashboardData?.wards || []).map((w) => {
    const stat = {
      attendance: wardStats.attByName?.[keyOf(w.name)] ?? null,
      averageScore: wardStats.acadById?.[String(w.id)] ?? wardStats.acadByName?.[keyOf(w.name)] ?? null,
    };
    const statusStyle = STATUS_STYLES[w.status] || {};
    return {
      ...w,
      class: w.className || w.class,
      age: w.age ?? ageFromDob(w.dob),
      totalPayable: w.balance ?? w.totalPayable,
      invoice_number: w.invoice_number || w.invoiceNumber || invoiceById[String(w.id)] || '',
      statusColor: statusStyle.color || '#64748b',
      statusBg: statusStyle.bg || '#f1f5f9',
      attendanceColor: '#16a34a',
      scoreColor: '#2563eb',
      buttonColor: '#2563eb',
      ...stat,
    };
  });

  const activityLogs = logs.length > 0
    ? logs.map((n, i) => {
        const meta = LOG_META[n.type] || LOG_META.message;
        return {
          id: i + 1,
          icon: meta.icon,
          iconBg: meta.iconBg,
          iconColor: meta.iconColor,
          title: n.text,
          subtitle: '',
          time: n.time || '',
        };
      })
    : [];

  return (
    <PageContainer title="Parent Dashboard" description="Parent Portal Overview">
      {/* ── Row-aligned two-column grid ──
           Row 1: My Wards | Wallet Account
           Row 2: Quick Actions | Term Calendar
           Row 3: Academic Overview | Activity Logs
       */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 2.5,
          alignItems: 'stretch',
          pt: 1,
        }}
      >
        {/* ─── Row 1 ─── */}
        {/* 1. My Wards Section */}
        <MyWards
          wards={wards}
          loading={loading}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
        />

        {/* 1. Parent Wallet Account Card — same row as My Wards */}
        <ParentWalletAccount
          totalPayable={dashboardData?.finance?.outstanding ?? 0}
        />

        {/* ─── Row 2 ─── */}
        {/* 2. Quick Actions Section */}
        <QuickActions onApplyAdmission={() => setAdmissionModalOpen(true)} />

        {/* 2. Term Calendar Card — same row as Quick Actions */}
        <TermCalendar {...termInfo} />

        {/* ─── Row 3 ─── */}
        {/* 3. Academic Overview Section */}
        <AcademicOverview
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
        />

        {/* 3. Activity Logs Card — same row as Academic Overview */}
        <ActivityLogs logs={activityLogs} />
      </Box>

      {/* Admission Application Modal */}
      <AdmissionBatchModal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onApply={handleApply}
      />
    </PageContainer>
  );
};

export default ParentDashboard2;
