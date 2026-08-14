import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import AdmissionBanner from '@/components/tenant/admission/AdmissionBanner';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import {
  getParentDashboard,
  getParentFinance,
  getParentAttendance,
  getParentAcademics,
  getParentEvents,
  getParentContacts,
  getParentMessages,
  getParentNotifications,
} from '@/api/tenant/admission/admissionApi';

import MyWards from './component/my-wards';
import Analytics from './component/analytics';
import QuickActions from './component/quick-actions';
import Notifications from './component/notifications';
import CommunicationCenter from './component/communication-center';

/**
 * Per-card data hook. Every card calls its own endpoint (see the admissionApi
 * parent-* helpers) and loads independently, so one slow section never blocks
 * the rest of the page and each card renders its own skeleton while loading.
 */
const useSection = (fetcher, sessionTermId = '') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetcher(sessionTermId || null)
      .then((res) => {
        if (mounted) setData(res?.status ? res.data : null);
      })
      .catch(() => {
        if (mounted) setData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, sessionTermId]);

  return { data, loading };
};

/**
 * Parent Dashboard v2 — fully dynamic. Each card fetches its own endpoint:
 *   My Wards / banner        → /admission/parent-dashboard
 *   Finance stat cards       → /admission/parent/finance
 *   Attendance Overview      → /admission/parent/attendance
 *   Academic + Engagement    → /admission/parent/academics
 *   Communication Center     → /admission/parent/contacts
 *   Recent Messages          → /admission/parent/messages
 *   Notifications / Events   → /admission/parent/notifications + /events
 */
const ParentDashboard2 = () => {
  const navigate = useNavigate();
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);

  // One independent section per card.
  const dashboard = useSection(getParentDashboard);
  const finance = useSection(getParentFinance);
  const attendance = useSection(getParentAttendance);
  const academics = useSection(getParentAcademics);
  const events = useSection(getParentEvents);
  const contacts = useSection(getParentContacts);
  const messages = useSection(getParentMessages);
  const notifications = useSection(getParentNotifications);

  const handleApply = (batch) => {
    setAdmissionModalOpen(false);
    navigate('/admission/new-application', { state: { batch } });
  };

  return (
    <PageContainer title="Parent Dashboard" description="Parent portal">
      {/* ── Admission banner (open batches / welcome back) ── */}
      <AdmissionBanner
        session={dashboard.data?.session}
        hasOpenBatches={!!dashboard.data?.has_open_batches}
        onApply={() => setAdmissionModalOpen(true)}
      />

      {/* ── Two-column layout: stacks vertically on mobile, side-by-side on lg+ ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 2.5,
          alignItems: 'stretch',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* ─── MAIN CONTENT ─── */}
        <Box sx={{ flex: '1 1 0', minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
          <MyWards wards={dashboard.data?.wards || []} loading={dashboard.loading} />
          <Analytics
            finance={finance.data || {}}
            attendance={attendance.data}
            academics={academics.data}
            financeLoading={finance.loading}
            loading={attendance.loading || academics.loading}
          />
          <CommunicationCenter
            contacts={contacts.data || []}
            messages={messages.data || []}
            loading={contacts.loading || messages.loading}
          />
        </Box>

        {/* ─── RIGHT SIDEBAR ─── */}
        <Box sx={{ width: { xs: '100%', lg: 290 }, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <QuickActions onApplyAdmission={() => setAdmissionModalOpen(true)} />
          <Notifications
            notifications={notifications.data || []}
            events={events.data || []}
            loading={notifications.loading || events.loading}
          />
        </Box>
      </Box>

      <AdmissionBatchModal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onApply={handleApply}
      />
    </PageContainer>
  );
};

export default ParentDashboard2;
