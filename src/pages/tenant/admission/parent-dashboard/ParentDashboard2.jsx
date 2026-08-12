import React, { useEffect, useState } from 'react';
import { Box, Skeleton, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import AdmissionBanner from '@/components/tenant/admission/AdmissionBanner';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import { getParentDashboard, getParentInsights } from '@/api/tenant/admission/admissionApi';
import { useNotification } from 'src/hooks/useNotification';

import MyWards from './component/my-wards';
import Analytics from './component/analytics';
import QuickActions from './component/quick-actions';
import Notifications from './component/notifications';
import CommunicationCenter from './component/communication-center';

/**
 * Parent Dashboard v2 — fully dynamic: wards (prospective + enrolled), the
 * admission banner and the finance summary all come from the consolidated
 * /admission/parent-dashboard endpoint.
 */
const ParentDashboard2 = () => {
  const navigate = useNavigate();
  const notify = useNotification();

  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([getParentDashboard(), getParentInsights()])
      .then(([dash, ins]) => {
        if (mounted && dash.status === 'fulfilled' && dash.value?.status) setData(dash.value.data || null);
        if (mounted && ins.status === 'fulfilled' && ins.value?.status) setInsights(ins.value.data || null);
        if (mounted && dash.status === 'rejected') notify.error('Failed to load parent dashboard');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = (batch) => {
    setAdmissionModalOpen(false);
    navigate('/admission/new-application', { state: { batch } });
  };

  return (
    <PageContainer title="Parent Dashboard" description="Parent portal">
      {/* ── Admission banner (open batches / welcome back) ── */}
      <AdmissionBanner
        session={data?.session}
        hasOpenBatches={!!data?.has_open_batches}
        onApply={() => setAdmissionModalOpen(true)}
      />

      {loading ? (
        /* ── Loading skeletons ── */
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
          <Box sx={{ flex: '1 1 0', minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'grey.100', mb: 2 }}>
              <Skeleton variant="text" width={140} height={20} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {[0, 1].map((i) => (
                  <Skeleton key={i} variant="rounded" width={260} height={190} />
                ))}
              </Box>
            </Paper>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          </Box>
          <Box sx={{ width: { xs: '100%', lg: 290 }, flexShrink: 0 }}>
            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3, mb: 2 }} />
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
      ) : (
        /* ── Two-column layout: stacks vertically on mobile, side-by-side on lg+ ── */
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
            <MyWards wards={data?.wards || []} />
            <Analytics finance={data?.finance || {}} attendance={insights?.attendance} academics={insights?.academics} />
            <CommunicationCenter contacts={insights?.contacts} messages={insights?.messages} />
          </Box>

          {/* ─── RIGHT SIDEBAR ─── */}
          <Box sx={{ width: { xs: '100%', lg: 290 }, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <QuickActions onApplyAdmission={() => setAdmissionModalOpen(true)} />
            <Notifications notifications={insights?.notifications} events={insights?.events} />
          </Box>
        </Box>
      )}

      <AdmissionBatchModal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onApply={handleApply}
      />
    </PageContainer>
  );
};

export default ParentDashboard2;
