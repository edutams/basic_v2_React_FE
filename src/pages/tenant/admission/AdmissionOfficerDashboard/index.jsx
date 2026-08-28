import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { fetchSessionTerms, fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
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

  const [sessionTerm, setSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [sessionTermsLoaded, setSessionTermsLoaded] = useState(false);
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);

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
    }, [path, sessionTerm, sessionTermsLoaded, JSON.stringify(extra)]);

    return { data, loading };
  };

  // ── Session terms ───────────────────────────────────────────────────
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
              setActiveSessionTermId(activeId);
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

  // ── Main dashboard data (uses global sessionTerm from header) ────────
  const overview = useSection('/dashboard/admission/overview');

  // ── Application Trend: independent session term ─────────────────────
  const [trendSessionTerm, setTrendSessionTerm] = useState('all');
  const [trendData, setTrendData] = useState({});
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    if (sessionTermsLoaded && trendSessionTerm === 'all') {
      const match = activeSessionTermId != null
        ? sessionTerms.find((s) => String(s.id) === String(activeSessionTermId))
        : sessionTerms.find((s) => s.id !== 'all');
      if (match) setTrendSessionTerm(match.id);
    }
  }, [sessionTermsLoaded, sessionTerms, activeSessionTermId]);

  const fetchTrend = useCallback(async () => {
    if (!sessionTermsLoaded) return;
    setTrendLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admission/application-trend', {
        params: {
          ...(trendSessionTerm !== 'all' ? { session_term_id: trendSessionTerm } : {}),
        },
      });
      setTrendData(res.data?.status ? res.data.data : {});
    } catch {
      setTrendData({});
    } finally {
      setTrendLoading(false);
    }
  }, [trendSessionTerm, sessionTermsLoaded]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  // ── Applications by Grade: independent session term ──────────────────
  const [gradeSessionTerm, setGradeSessionTerm] = useState('all');
  const [gradeData, setGradeData] = useState({});
  const [gradeLoading, setGradeLoading] = useState(true);

  useEffect(() => {
    if (sessionTermsLoaded && gradeSessionTerm === 'all') {
      const match = activeSessionTermId != null
        ? sessionTerms.find((s) => String(s.id) === String(activeSessionTermId))
        : sessionTerms.find((s) => s.id !== 'all');
      if (match) setGradeSessionTerm(match.id);
    }
  }, [sessionTermsLoaded, sessionTerms, activeSessionTermId]);

  const fetchGrade = useCallback(async () => {
    if (!sessionTermsLoaded) return;
    setGradeLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admission/applications-by-grade', {
        params: {
          ...(gradeSessionTerm !== 'all' ? { session_term_id: gradeSessionTerm } : {}),
        },
      });
      setGradeData(res.data?.status ? res.data.data : {});
    } catch {
      setGradeData({});
    } finally {
      setGradeLoading(false);
    }
  }, [gradeSessionTerm, sessionTermsLoaded]);

  useEffect(() => {
    fetchGrade();
  }, [fetchGrade]);

  // ── Conversion Funnel: uses global sessionTerm ──────────────────────
  const conversionFunnel = useSection('/dashboard/admission/conversion-funnel');

  return (
    <PageContainer title="Admission Dashboard" description="Overview of admissions performance and activities">
      {/* ── Top Bar: Title + Session Term Selector ONLY ─────────────────────── */}
      <DashboardHeader
        sessionTerm={sessionTerm}
        sessionTerms={sessionTerms}
        onSessionChange={setSessionTerm}
      />

      {/* ── Row 1: Top 4 KPI Stat Cards ───────────────────────────────────── */}
      <MetricCards
        total_applicants={overview.data?.total_applicants || {}}
        pending_review={overview.data?.pending_review || {}}
        total_admitted={overview.data?.total_admitted || {}}
        total_accepted={overview.data?.total_accepted || {}}
        onCardClick={setBreakdownType}
        loading={overview.loading}
      />

      {/* ── Main Dashboard Layout: Left Column (Actions, Search & Charts) | Right Column (Activity Log) ── */}
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
          <QuickActions loading={overview.loading} />

          {/* Row 1 Charts: Application Trend & Admission Funnel */}
          <Grid container spacing={2.5} mb={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ApplicationTrend
                trendData={trendData.trend_data}
                metrics={trendData.metrics}
                sessionTerms={sessionTerms}
                sessionTerm={trendSessionTerm}
                onSessionChange={setTrendSessionTerm}
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

          {/* Row 2 Analytics: Grade Level Breakdown & Application Sources */}
          <Grid container spacing={2.5} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ApplicationsByGrade
                gradeData={gradeData.grade_data}
                sessionTerms={sessionTerms}
                sessionTerm={gradeSessionTerm}
                onSessionChange={setGradeSessionTerm}
                loading={gradeLoading}
              />
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
    </PageContainer>
  );
};

export default AdmissionOfficerDashboard;
