import { useState, useEffect, useCallback } from 'react';
import { Box, Stack } from '@mui/material';
import {
  People as PeopleIcon,
  HowToReg as HowToRegIcon,
  PersonOff as PersonOffIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import ProcessApplicationsTable from './components/ProcessApplicationsTable';
import {
  fetchAllAdmissionBatches,
  fetchApplicationStats,
} from '@/api/tenant/admission/admissionProcessingApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Admission Processing' }];

const AdmissionProcessing = () => {
  // ─── Data state ────────────────────────────────────────────────────────
  const [allBatches, setAllBatches] = useState([]);
  const [stats, setStats] = useState({
    applications: 0,
    applications_change_pct: null,
    admitted: 0,
    declined: 0,
    pending: 0,
    revoked: 0,
    accepted_offers: 0,
  });

  // ─── Loading state ─────────────────────────────────────────────────────
  const [statsLoading, setStatsLoading] = useState(false);

  // ─── API calls ─────────────────────────────────────────────────────────
  const loadBatches = useCallback(async () => {
    try {
      const res = await fetchAllAdmissionBatches();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setAllBatches(list);
    } catch (err) {
      console.error('Failed to load admission batches:', err);
    }
  }, []);

  const loadStats = useCallback(async (filters = null) => {
    setStatsLoading(true);
    try {
      const res = await fetchApplicationStats(filters);
      const data = res?.data ?? res ?? {};
      setStats({
        applications: data.applications ?? 0,
        applications_change_pct: data.applications_change_pct ?? null,
        admitted: data.admitted ?? 0,
        declined: data.declined ?? 0,
        pending: data.pending ?? 0,
        revoked: data.revoked ?? 0,
        accepted_offers: data.accepted_offers ?? 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ─── Effects ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadBatches();
    loadStats();
  }, [loadBatches, loadStats]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleDataChange = () => {
    loadStats();
  };

  // Each card's share of total applications, for the progress bar + %
  // subtitle — matches the design, computed from stats already fetched in
  // one query (no extra round trip).
  const pctOf = (count) =>
    stats.applications > 0 ? Math.round((count / stats.applications) * 100) : 0;

  return (
    <PageContainer
      title="Admission Processing"
      description="Process and manage admission applications"
    >
      <Breadcrumb title="Admission Processing" items={BCrumb} />

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}


      <Box sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard
            count={stats.applications}
            label="Total Applications"
            icon={PeopleIcon}
            colorIndex={2}
            loading={statsLoading}
            subtitle={
              stats.applications_change_pct === null
                ? undefined
                : `${stats.applications_change_pct >= 0 ? '▲' : '▼'} ${Math.abs(stats.applications_change_pct)}% vs last session`
            }
          />
          <StatCard
            count={stats.admitted}
            label="Total Admitted"
            icon={HowToRegIcon}
            colorIndex={1}
            loading={statsLoading}
            progress={pctOf(stats.admitted)}
          />
          <StatCard
            count={stats.declined}
            label="Total Declined"
            icon={PersonOffIcon}
            colorIndex={4}
            loading={statsLoading}
            progress={pctOf(stats.declined)}
          />
          <StatCard
            count={stats.pending}
            label="Total Pending"
            icon={HourglassEmptyIcon}
            colorIndex={3}
            loading={statsLoading}
            progress={pctOf(stats.pending)}
          />
          <StatCard
            count={stats.accepted_offers}
            label="Accepted Offers"
            icon={CheckCircleIcon}
            colorIndex={0}
            loading={statsLoading}
            progress={pctOf(stats.accepted_offers)}
          />
        </Stack>
      </Box>

      {/* ── Main Card ──────────────────────────────────────────────────── */}
      <ParentCard
        title="Process Applications"
        sx={{
          '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
          '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
        }}
      >
        <ProcessApplicationsTable allBatches={allBatches} onDataChange={handleDataChange} />
      </ParentCard>
    </PageContainer>
  );
};

export default AdmissionProcessing;
