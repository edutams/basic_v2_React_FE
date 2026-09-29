import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { useNavigate } from 'react-router-dom';

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
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);
  const [ready, setReady] = useState(false);

  // Fetch the active session term once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const active = await fetchActiveSessionTerm();
        const activeId = active?.data?.session_term_id;
        if (active?.status && activeId != null) {
          setActiveSessionTermId(activeId);
        }
      } catch (err) {
        console.error('Failed to fetch active session term:', err);
      } finally {
        setReady(true);
      }
    };
    load();
  }, []);

  // Section loader helper — uses the active session term automatically
  const useSection = (path, extra = {}) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!ready || !activeSessionTermId) return;
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, {
          params: {
            session_term_id: activeSessionTermId,
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
    }, [path, ready, activeSessionTermId, JSON.stringify(extra)]);

    return { data, loading };
  };

  // ── Main dashboard data ────────────────────────────────────────────────
  const overview = useSection('/dashboard/admission/overview');

  // ── Application Trend ──────────────────────────────────────────────────
  const [trendData, setTrendData] = useState({});
  const [trendLoading, setTrendLoading] = useState(true);

  const fetchTrend = useCallback(async () => {
    if (!ready || !activeSessionTermId) return;
    setTrendLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admission/application-trend', {
        params: { session_term_id: activeSessionTermId },
      });
      setTrendData(res.data?.status ? res.data.data : {});
    } catch {
      setTrendData({});
    } finally {
      setTrendLoading(false);
    }
  }, [ready, activeSessionTermId]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  // ── Applications by Grade ──────────────────────────────────────────────
  const [gradeData, setGradeData] = useState({});
  const [gradeLoading, setGradeLoading] = useState(true);

  const fetchGrade = useCallback(async () => {
    if (!ready || !activeSessionTermId) return;
    setGradeLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admission/applications-by-grade', {
        params: { session_term_id: activeSessionTermId },
      });
      setGradeData(res.data?.status ? res.data.data : {});
    } catch {
      setGradeData({});
    } finally {
      setGradeLoading(false);
    }
  }, [ready, activeSessionTermId]);

  useEffect(() => {
    fetchGrade();
  }, [fetchGrade]);

  // ── Conversion Funnel ──────────────────────────────────────────────────
  const conversionFunnel = useSection('/dashboard/admission/conversion-funnel');

  return (
    <PageContainer title="Admission Dashboard" description="Overview of admissions performance and activities">
      {/* ── Row 1: Top 4 KPI Stat Cards ───────────────────────────────────── */}
      <MetricCards
        total_applicants={overview.data?.total_applicants || {}}
        pending_review={overview.data?.pending_review || {}}
        total_admitted={overview.data?.total_admitted || {}}
        total_accepted={overview.data?.total_accepted || {}}
        onCardClick={setBreakdownType}
        loading={overview.loading}
      />

      {/* ── Main Dashboard Layout ──────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 1.3,
          alignItems: 'start',
        }}
      >
        {/* ── Left Column ─────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3, minWidth: 0 }}>
          {/* Quick Actions Bar */}
          <QuickActions loading={overview.loading} />

          {/* Row 1 Charts: Application Trend & Admission Funnel */}
          <Grid container spacing={1.3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ApplicationTrend
                trendData={trendData.trend_data}
                metrics={trendData.metrics}
                loading={trendLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdmissionFunnel
                funnel={conversionFunnel.data?.funnel_stages}
                loading={conversionFunnel.loading}
              />
            </Grid>
          </Grid>

          {/* Full Width Grade Level Breakdown */}
          <ApplicationsByGrade
            gradeData={gradeData.grade_data}
            loading={gradeLoading}
          />
        </Box>

        {/* ── Right Column Sidebar: Recent Activity + Top Application Sources ─ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3, minWidth: 0 }}>
          <AdmissionActivityLog />
          <TopApplicationSources />
        </Box>
      </Box>

      {/* ── Stat Card Breakdown Modal ─────────────────────────────────── */}
      <AdmissionBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        sessionTerm={activeSessionTermId}
        onClose={() => setBreakdownType(null)}
      />
    </PageContainer>
  );
};

export default AdmissionOfficerDashboard;
