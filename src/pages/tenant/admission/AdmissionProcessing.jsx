import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
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
import IndividualProcessingTab from './components/IndividualProcessingTab';
import BatchProcessingTab from './components/BatchProcessingTab';
import {
  fetchAllAdmissionBatches,
  fetchApplicationStats,
} from '@/api/tenant/admission/admissionProcessingApi';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Admission Processing' },
];

const AdmissionProcessing = () => {
  // ─── Data state ────────────────────────────────────────────────────────
  const [allBatches, setAllBatches] = useState([]);
  const [stats, setStats] = useState({
    applications: 0,
    admitted: 0,
    declined: 0,
    pending: 0,
    revoked: 0,
    accepted_offers: 0,
  });

  // ─── Loading state ─────────────────────────────────────────────────────
  const [statsLoading, setStatsLoading] = useState(false);

  // ─── Tab state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);

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
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleDataChange = () => {
    loadStats();
  };

  return (
    <PageContainer title="Admission Processing" description="Process and manage admission applications">
      <Breadcrumb title="Admission Processing" items={BCrumb} />

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            count={stats.applications}
            label="Applications"
            icon={PeopleIcon}
            color="primary"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            count={stats.admitted}
            label="Total Admitted"
            icon={HowToRegIcon}
            color="success"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            count={stats.declined}
            label="Total Declined"
            icon={PersonOffIcon}
            color="error"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            count={stats.pending}
            label="Total Pending"
            icon={HourglassEmptyIcon}
            color="warning"
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            count={stats.accepted_offers}
            label="Accepted Offers"
            icon={CheckCircleIcon}
            color="info"
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* ── Main Card with Tabs ──────────────────────────────────────────────────── */}
      <ParentCard
        title={
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="admission processing tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minHeight: 48,
                },
              }}
            >
              <Tab label="Individual Processing" />
              <Tab label="Batch Processing" />
            </Tabs>
          </Box>
        }
      >
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <IndividualProcessingTab
              allBatches={allBatches}
              onDataChange={handleDataChange}
            />
          )}
          {activeTab === 1 && (
            <BatchProcessingTab
              allBatches={allBatches}
              onDataChange={handleDataChange}
            />
          )}
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default AdmissionProcessing;
