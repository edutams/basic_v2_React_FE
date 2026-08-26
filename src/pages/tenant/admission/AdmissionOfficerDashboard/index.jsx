import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Skeleton, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { fetchSessionTerms, fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import { useNavigate } from 'react-router-dom';

import DashboardHeader from './components/DashboardHeader';
import MetricCards from './components/MetricCards';
import QuickActions from './components/QuickActions';
import ApplicationTrend from './components/ApplicationTrend';
import AdmissionFunnel from './components/AdmissionFunnel';
import ApplicationsByGrade from './components/ApplicationsByGrade';
import TopApplicationSources from './components/TopApplicationSources';
import AdmissionActivityLog from './components/AdmissionActivityLog';
import AdmissionBreakdownModal from './components/AdmissionBreakdownModal';

/**
 * ── Re-implemented Admission Officer Dashboard ───────────────────────────────
 */
const AdmissionOfficerDashboard = () => {
  const notify = useNotification();
  const navigate = useNavigate();

  const [breakdownType, setBreakdownType] = useState(null);
  const [createBatchModalOpen, setCreateBatchModalOpen] = useState(false);

  const [sessionTerm, setSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [sessionTermsLoaded, setSessionTermsLoaded] = useState(false);

  // Section loader helper
  const useSection = (path, extra = {}) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!sessionTermsLoaded) return;
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, {
          params: {
            ...(sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {}),
            ...extra,
          },
        })
        .then((res) => {
          if (mounted) setData(res.data?.status ? res.data.data : {});
        })
        .catch(() => {
          if (mounted) setData({});
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, sessionTerm, JSON.stringify(extra), sessionTermsLoaded]);

    return { data, loading };
  };

  const overview = useSection('/dashboard/admission/overview');

  useEffect(() => {
    const loadSessionTerms = async () => {
      try {
        const response = await fetchSessionTerms();
        if (response.status) {
          const sess_terms = [
            { id: 'all', label: 'All Sessions' },
            ...response.data.map((sterm) => ({
              id: sterm.id,
              label: `${sterm.session?.sesname || ''} ${sterm.display_term?.display_name || ''}`.trim(),
            })),
          ];
          setSessionTerms(sess_terms);

          try {
            const active = await fetchActiveSessionTerm();
            const activeId = active?.data?.session_term_id;
            if (active?.status && activeId != null) {
              const match = sess_terms.find((s) => String(s.id) === String(activeId));
              if (match) setSessionTerm(match.id);
            }
          } catch (err) {
            console.error('Failed to fetch active session term:', err);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      } finally {
        setSessionTermsLoaded(true);
      }
    };

    loadSessionTerms();
  }, []);

  const handleApplyBatch = (batch) => {
    setCreateBatchModalOpen(false);
    navigate('/admission/new-application', { state: { batch } });
  };

  return (
    <PageContainer title="Admission Dashboard" description="Overview of admissions performance and activities">
      {/* ── Top Bar: Session Term Selector & Profile above stat cards ─────── */}
      <DashboardHeader
        sessionTerm={sessionTerm}
        sessionTerms={sessionTerms}
        onSessionChange={setSessionTerm}
      />

      {/* ── Row 1: Top 4 KPI Stat Cards ───────────────────────────────────── */}
      <MetricCards
        total_applicants={overview.data.total_applicants || { count: 3842 }}
        pending_review={overview.data.pending_review || { count: 624, due_today: 86 }}
        total_admitted={overview.data.total_admitted || { count: 1256 }}
        total_accepted={overview.data.total_accepted || { count: 1045, rate: 83.2 }}
        onCardClick={setBreakdownType}
      />

      {/* ── Main Dashboard Layout: Left Column (Actions & Charts) | Right Column (Activity Log) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 2.5,
          alignItems: 'stretch',
        }}
      >
        {/* ── Left Column ─────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Quick Actions Bar */}
          <QuickActions
            onCreateBatch={() => setCreateBatchModalOpen(true)}
            onAdmissionReport={() => navigate('/admission/tracker')}
          />

          {/* Row 1 Charts: Application Trend & Admission Funnel */}
          <Grid container spacing={2.5} mb={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ApplicationTrend />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdmissionFunnel />
            </Grid>
          </Grid>

          {/* Row 2 Analytics: Grade Level Breakdown & Application Sources */}
          <Grid container spacing={2.5} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ApplicationsByGrade />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TopApplicationSources />
            </Grid>
          </Grid>
        </Box>

        {/* ── Right Column: Recent Activity Log Sidebar ───────────────── */}
        <Box sx={{ height: '100%' }}>
          <AdmissionActivityLog />
        </Box>
      </Box>

      {/* ── Stat Card Breakdown Modal ─────────────────────────────────── */}
      <AdmissionBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        sessionTerm={sessionTerm}
        onClose={() => setBreakdownType(null)}
      />

      {/* ── Admission Batch Creation Modal ─────────────────────────────── */}
      <AdmissionBatchModal
        open={createBatchModalOpen}
        onClose={() => setCreateBatchModalOpen(false)}
        onApply={handleApplyBatch}
      />
    </PageContainer>
  );
};

export default AdmissionOfficerDashboard;
