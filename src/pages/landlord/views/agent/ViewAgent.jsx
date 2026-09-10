import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
  Box,
  Tab,
  Grid,
  Stack,
  useTheme,
  Skeleton,
  Typography,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IconLayoutDashboard, IconUsers, IconSchool, IconBuildingBank } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';

import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';

import ProfileHeader from './components/ProfileHeader';
import StatCards from './components/StatCards';
import OverviewTab from './components/OverviewTab';
import TeamTab from './components/TeamTab';
import ManageTeamTab from './components/ManageTeamTab';
import BankAccountDetailsTab from './components/BankAccountDetailsTab';
import TotalSchoolModal from './components/TotalSchoolModal';
import TotalTransactionModal from './components/TotalTransactionModal';
import TotalSubAgentModal from './components/TotalSubAgentModal';

import { AuthContext } from '@/context/AgentContext/auth';
import { usePermissions } from '@/context/AgentContext/permissions';

import agentApi from '@/api/landlord/organizations/agent';
import SchoolsTab from './components/SchoolsTab/SchoolsTab';
import AgentModal from '@/components/landlord/add-agent/components/AgentModal';
import ReusableModal from '@/components/shared/ReusableModal';
import RegisterSchoolForm from '@/components/landlord/add-school/component/RegisterSchool';
import ParentCard from '@/components/shared/ParentCard';

// Mirrors the general shape of the tab strip + OverviewTab grid (chart /
// credit-facility+plan-distribution / recent-onboarding / two revenue
// tables) so the page isn't just blank while `agentData` is still loading.
const TabContentSkeleton = () => (
  <ParentCard
    sx={{
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1.5, display: 'flex', gap: 3 }}>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="text" width={90} height={28} />
      ))}
    </Box>
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Skeleton variant="rounded" height={380} sx={{ borderRadius: '14px' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: '14px' }} />
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: '14px' }} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Skeleton variant="rounded" height={380} sx={{ borderRadius: '14px' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: '14px' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: '14px' }} />
        </Grid>
      </Grid>
    </Box>
  </ParentCard>
);

const ViewAgent = () => {
  const { id } = useParams();
  const { can } = usePermissions();

  const [value, setValue] = useState('1');
  const manageTeamRef = useRef(null);

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSubAgentModalOpen, setIsSubAgentModalOpen] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [agentData, setAgentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [accessLevel, setAccessLevel] = useState(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { user } = useContext(AuthContext);
  // Analytics state for TotalSchoolModal
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const isDashboard = false;

  useEffect(() => {
    const fetchAgentDetails = async () => {
      setIsLoading(true);

      try {
        const detailsResponse = await agentApi.getDetails(id);

        if (detailsResponse.status === true && detailsResponse.data) {
          const data = detailsResponse.data;

          // SET ACCESS LEVEL
          setAccessLevel(data.access_level);

          const mappedData = {
            profile: {
              id: data.id,
              name: data.organization_name,
              handle: data.organization_email,
              level: `Level ${data.access_level} Organization`,
              status: data.status
                ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
                : 'Inactive',
              image: data.image || '/assets/images/profile/user-1.jpg',
              primaryColor: data.primary_color || null,
            },

            stats: {
              totalTransaction: data.total_transaction_value || 0,
              transactionCount: data.transaction_count || 0,
              commission: data.commission || data.stats?.commission || analytics?.commission || 0,
              volume: data.volume || data.stats?.volume || analytics?.volume || 0,
              totalSchools: data.stats?.totalSchools || 0,
              activeSchools: data.stats?.activeSchools || 0,
              pendingSchools: data.stats?.pendingSchools || 0,
              rejectedSchools: data.stats?.rejectedSchools || 0,
              totalAgents: data.stats?.totalSubAgents || 0,
              totalSubAgents: data.stats?.totalSubAgents || 0,
              subAgentLevels: data.stats?.subAgentLevels || 0,
            },

            schools: (data.tenants || []).map((tenant) => ({
              school: tenant.tenant_name || 'Unknown School',

              contact:
                tenant.administrator_info?.school_spa?.admin_phone || tenant.admin_phone || 'N/A',

              email:
                tenant.administrator_info?.school_spa?.admin_email || tenant.tenant_email || 'N/A',

              agent: data.organization_name,
              agentContact: data.organization_phone,
              agentEmail: data.organization_email,

              plan: tenant.plan?.name || 'Basic',

              population: tenant.population || 0,

              status: tenant.status
                ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)
                : 'Active',
            })),

            team: data.users || [],

            revenueData: [
              { month: 'Jan', revenue: 120000 },
              { month: 'Feb', revenue: 85000 },
              { month: 'Mar', revenue: 200000 },
              { month: 'Apr', revenue: 150000 },
              { month: 'May', revenue: 310000 },
              { month: 'Jun', revenue: 270000 },
              { month: 'Jul', revenue: 190000 },
              { month: 'Aug', revenue: 230000 },
              { month: 'Sep', revenue: 175000 },
              { month: 'Oct', revenue: 290000 },
              { month: 'Nov', revenue: 340000 },
              { month: 'Dec', revenue: 410000 },
            ],

            loginActivities: [],

            planDistribution: analytics?.planDistribution ?? [],

            recentOnboarding: (data.tenants || [])
              .slice()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5)
              .map((tenant) => ({
                school: tenant.tenant_name || 'Unknown School',

                agent: data.organization_name || '—',

                handle: data.organization_email || '—',

                created_at: tenant.created_at
                  ? new Date(tenant.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—',
              })),

            topAgents: [],

            topRevenueSchools: [],

            raw: data,

            leadUser: (data.users || []).find((u) => u.is_lead === 'yes') || null,
          };

          setAgentData(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch organization details', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAgentDetails();
    } else {
      setIsLoading(false);
    }
  }, [id, refreshKey]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await agentApi.getAnalyticsByOrgId(id);
        if (res.status) setAnalytics(res.data);
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [refreshKey]);

  const mergedStats = useMemo(
    () => ({
      ...(agentData?.stats || {}),
      totalSchools: analytics?.totalSchools || 0,
      activeSchools: analytics?.activeSchools || 0,
      pendingSchools: analytics?.pendingSchools || 0,
      rejectedSchools: analytics?.rejectedSchools || 0,
      totalAgents: analytics?.totalAgents || 0,
      totalSubAgents: analytics?.totalSubAgents || 0,
      subAgentLevels: analytics?.subAgentLevels || 0,
    }),
    [agentData?.stats, analytics],
  );
  const BCrumb = [
    { to: '/dashboard', title: 'Home' },
    { to: '/organization', title: 'Organization' },
    { title: 'View Profile' },
  ];

  return (
    <PageContainer
      title="View Organization Profile"
      description="Detailed organization profile view"
    >
      <Breadcrumb title="View Profile" items={BCrumb} />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 4, lg: 4 }}>
          {isLoading ? (
            <Skeleton variant="rounded" width={300} height={200} sx={{ borderRadius: 2 }} />
          ) : agentData ? (
            <ProfileHeader
              profile={agentData.profile}
              onManageSchools={() => setValue('3')}
              onManageAgent={() => setValue('2')}
            />
          ) : (
            <Skeleton variant="rounded" width={300} height={200} sx={{ borderRadius: 2 }} />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 8 }}>
          <StatCards
            stats={mergedStats}
            onTransactionClick={() => setIsTransactionModalOpen(true)}
            onSchoolClick={() => setIsSchoolModalOpen(true)}
            onSubAgentClick={() => setIsSubAgentModalOpen(true)}
            accessLevel={accessLevel}
            loadingTransaction={isLoading}
            loadingSubAgents={analyticsLoading}
            loadingSchools={analyticsLoading}
          />
        </Grid>
      </Grid>

      {isLoading && !agentData ? (
        <Box mt={3}>
          <TabContentSkeleton />
        </Box>
      ) : agentData ? (
        <Box mt={3}>
          <ParentCard
            sx={{
              bgcolor: isDark ? '#1e1e1e' : '#FFFFFF',
              borderRadius: '12px',
              overflow: 'hidden',
              border: isDark ? '1px solid #333' : '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
              '& .MuiCardContent-root': { p: 0, pt: 0 },
            }}
          >
            <TabContext value={value}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  pr: { xs: 1.5, sm: 2 },
                }}
              >
                <TabList
                  onChange={(_, newValue) => setValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{ borderBottom: 0 }}
                >
                  <Tab
                    icon={<IconLayoutDashboard size={18} />}
                    iconPosition="start"
                    label="Overview"
                    value="1"
                  />

                  <Tab
                    icon={<IconUsers size={18} />}
                    iconPosition="start"
                    label="Sub Organizations"
                    value="2"
                  />

                  <Tab
                    icon={<IconSchool size={18} />}
                    iconPosition="start"
                    label="Schools"
                    value="3"
                  />

                  <Tab
                    icon={<IconUsers size={18} />}
                    iconPosition="start"
                    label="Manage Team"
                    value="4"
                  />

                  {can('landlord.bank_account.manage') && (
                    <Tab
                      icon={<IconBuildingBank size={18} />}
                      iconPosition="start"
                      label="Bank Account Details"
                      value="5"
                    />
                  )}
                </TabList>

                {/* Tab-specific actions — shown only while their own tab is
                      active, instead of living inside each tab's own content. */}
                {value === '1' && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
                        borderRadius: '6px',
                        bgcolor: isDark ? '#2d2d2d' : 'white',
                        overflow: 'hidden',
                      }}
                    >
                      <Select
                        size="small"
                        value="2026"
                        renderValue={(v) => `Year ${v}`}
                        sx={{
                          '& fieldset': { border: 'none' },
                          minWidth: 120,
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isDark ? '#fff' : '#333',
                        }}
                      >
                        <MenuItem value="2026">2026</MenuItem>
                        <MenuItem value="2025">2025</MenuItem>
                      </Select>
                    </Box>
                    <Button variant="contained" size="small">
                      Filter
                    </Button>
                  </Stack>
                )}

                {value === '4' && accessLevel !== 1 && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => manageTeamRef.current?.openAddModal()}
                    sx={{ textTransform: 'none', borderRadius: '8px' }}
                  >
                    Add Team Member
                  </Button>
                )}
              </Box>

              <Box>
                <TabPanel value="1" sx={{ p: 0 }}>
                  <OverviewTab data={agentData} />
                </TabPanel>

                <TabPanel value="2" sx={{ p: 1.5 }}>
                  <TeamTab
                    team={agentData.team || []}
                    onAddAgent={() => setIsAddAgentModalOpen(true)}
                    isDashboard={isDashboard}
                    accessLevel={accessLevel}
                    isViewingProfile
                    organizationId={id}
                  />
                </TabPanel>

                <TabPanel value="3" sx={{ p: 1.5 }}>
                  <SchoolsTab
                    schools={agentData.schools || []}
                    onAddSchool={() => setIsAddSchoolModalOpen(true)}
                    organizationId={id}
                    handleRefresh={() => setRefreshKey((prev) => prev + 1)}
                    refreshKey={refreshKey}
                    isViewingProfile={true}
                  />
                </TabPanel>

                <TabPanel value="4" sx={{ p: 1.5 }}>
                  <ManageTeamTab
                    ref={manageTeamRef}
                    organizationId={id}
                    accessLevel={accessLevel}
                    isViewingProfile
                    hideCard
                    hideAddButton
                  />
                </TabPanel>

                {can('landlord.bank_account.manage') && (
                  <TabPanel value="5" sx={{ p: 1.5 }}>
                    <BankAccountDetailsTab
                      organizationId={id}
                      organization={agentData.raw}
                      onSaved={() => setRefreshKey((prev) => prev + 1)}
                    />
                  </TabPanel>
                )}
              </Box>
            </TabContext>
          </ParentCard>
        </Box>
      ) : !isLoading ? (
        <Box p={3} textAlign="center">
          <Typography variant="h6">Failed to load organization data.</Typography>
        </Box>
      ) : null}

      <TotalSchoolModal
        open={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        stats={mergedStats}
        organizationId={id}
      />

      <TotalTransactionModal
        open={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />

      <TotalSubAgentModal
        open={isSubAgentModalOpen}
        onClose={() => setIsSubAgentModalOpen(false)}
        totalSubAgents={agentData?.stats?.totalSubAgents}
        handleRefresh={() => setRefreshKey((prev) => prev + 1)}
        orgId={id}
        accessLevel={accessLevel}
      />

      <AgentModal
        open={isAddAgentModalOpen}
        onClose={() => setIsAddAgentModalOpen(false)}
        handleRefresh={() => setRefreshKey((prev) => prev + 1)}
        parentId={id}
      />

      <AgentModal
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        handleRefresh={() => setRefreshKey((prev) => prev + 1)}
        actionType="update"
        selectedAgent={
          agentData
            ? {
                ...agentData.raw,
                ...agentData.leadUser,
                id: id,
                organization_logo: agentData.raw?.organization_logo,
                avatar: agentData.leadUser?.avatar,
              }
            : null
        }
      />

      <ReusableModal
        open={isAddSchoolModalOpen}
        onClose={() => setIsAddSchoolModalOpen(false)}
        title="Register School"
        size="large"
      >
        <RegisterSchoolForm
          actionType="create"
          onSubmit={() => {
            setIsAddSchoolModalOpen(false);
            setRefreshKey((prev) => prev + 1);
          }}
          onCancel={() => setIsAddSchoolModalOpen(false)}
          organizationId={id}
        />
      </ReusableModal>
    </PageContainer>
  );
};

export default ViewAgent;
