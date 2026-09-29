import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Skeleton,
  Alert,
  Stack,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import { IconRefresh } from '@tabler/icons-react';
import OverviewCards from '../../analytics_/OverviewCards';
import SchoolGrowthChart from '../../analytics_/SchoolGrowthChart';
import EnrollmentChart from '../../analytics_/EnrollmentChart';
import OnboardingFunnel from '../../analytics_/OnboardingFunnel';
import GeographicBreakdown from '../../analytics_/GeographicBreakdown';
import PerSchoolTable from '../../analytics_/PerSchoolTable';
import {
  fetchOverview,
  fetchSchoolGrowth,
  fetchEnrollments,
  fetchGeographic,
  fetchOnboardingFunnel,
} from '@/api/landlord/analytics/analyticsApi';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [enrollments, setEnrollments] = useState(null);
  const [geographic, setGeographic] = useState(null);
  const [funnel, setFunnel] = useState(null);

  const [growthParams, setGrowthParams] = useState({
    period: 'monthly',
    year: new Date().getFullYear(),
  });
  const [enrollmentParams, setEnrollmentParams] = useState({
    period: 'monthly',
    year: new Date().getFullYear(),
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, gr, en, geo, fn] = await Promise.all([
        fetchOverview(),
        fetchSchoolGrowth(growthParams),
        fetchEnrollments(enrollmentParams),
        fetchGeographic(),
        fetchOnboardingFunnel(),
      ]);
      setOverview(ov.data);
      setGrowth(gr.data);
      setEnrollments(en.data);
      setGeographic(geo.data);
      setFunnel(fn.data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [growthParams, enrollmentParams]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleGrowthParamChange = (params) => {
    setGrowthParams((prev) => ({ ...prev, ...params }));
  };

  const handleEnrollmentParamChange = (params) => {
    setEnrollmentParams((prev) => ({ ...prev, ...params }));
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Analytics Dashboard
          </Typography>
          {lastRefreshed && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadAll} disabled={loading}>
            <IconRefresh size={20} />
          </IconButton>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !overview ? (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <>
          {/* Overview Cards — always visible */}
          <OverviewCards data={overview} loading={loading} />

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4, mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
            >
              <Tab label="School Growth" />
              <Tab label="Enrollments" />
              <Tab label="Onboarding Funnel" />
              <Tab label="Geographic" />
              <Tab label="Per School" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <SchoolGrowthChart
              data={growth}
              loading={loading}
              params={growthParams}
              onParamChange={handleGrowthParamChange}
            />
          )}
          {activeTab === 1 && (
            <EnrollmentChart
              data={enrollments}
              loading={loading}
              params={enrollmentParams}
              onParamChange={handleEnrollmentParamChange}
            />
          )}
          {activeTab === 2 && <OnboardingFunnel data={funnel} loading={loading} />}
          {activeTab === 3 && <GeographicBreakdown data={geographic} loading={loading} />}
          {activeTab === 4 && <PerSchoolTable />}
        </>
      )}
    </Box>
  );
};

export default Analytics;
