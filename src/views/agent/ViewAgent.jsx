import React, { useState, useEffect } from 'react';
import { Box, Tab, Grid, useTheme, CircularProgress } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IconLayoutDashboard, IconUsers, IconSchool } from '@tabler/icons-react';
import { useParams } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';

import ProfileHeader from './components/ProfileHeader';
import StatCards from './components/StatCards';
import OverviewTab from './components/OverviewTab';
import TeamTab from './components/TeamTab';
import SchoolsTab from './components/SchoolsTab';
import ManageTeamTab from './components/ManageTeamTab';
import TotalSchoolModal from './components/TotalSchoolModal';
import TotalTransactionModal from './components/TotalTransactionModal';
import TotalSubAgentModal from './components/TotalSubAgentModal';
import AgentModal from '../../components/add-agent/components/AgentModal';
import ReusableModal from '../../components/shared/ReusableModal';
import RegisterSchoolForm from '../../components/add-school/component/RegisterSchool';

import agentApi from '../../api/agent';
import { mockAgentData } from './mockData';

const ViewAgent = () => {
  const { user: currentUser } = useAuth();
  const { id: paramId } = useParams();
  const id = paramId || currentUser?.id;
  const [value, setValue] = useState('1');
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSubAgentModalOpen, setIsSubAgentModalOpen] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const theme = useTheme();

  const isOwnProfile = currentUser && currentUser.id == id;
  const isDashboard = !paramId;

  const [agentData, setAgentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      setIsLoading(true);
      try {
        const detailsResponse = await agentApi.getDetails(id);

        if (detailsResponse.status === true && detailsResponse.data) {
          const data = detailsResponse.data;

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
              totalSchool: data.tenants_count || 0,
              totalSubAgents: data.sub_organizations_count || 0,
              commission: data.total_commission || 0,
              volume: data.transaction_volume || 0,
              subAgentBreakdown: {
                lv3: (data.sub_organizations || []).filter((c) => c.access_level === 3).length,
                lv4: (data.sub_organizations || []).filter((c) => c.access_level === 4).length,
                lv5: (data.sub_organizations || []).filter((c) => c.access_level === 5).length,
              },
              schoolBreakdown: { primary: 0, secondary: 0 },
            },
            team: (data.sub_organizations || []).map((child) => ({
              name: child.organization_name,
              handle: child.organization_email,
              phone: child.organization_phone,
              id: child.id,
              transaction: '0',
              performance: '0',
              level: child.access_level,
              descendent: child.sub_organizations_count || 0,
              status: child.status
                ? child.status.charAt(0).toUpperCase() + child.status.slice(1)
                : 'Inactive',
            })),
            schools: (data.tenants || []).map((tenant) => ({
              school: tenant.organization_name || 'Unknown School',
              contact: tenant.organization_phone || 'N/A',
              email: tenant.organization_email || 'N/A',
              agent: data.organization_name,
              agentContact: data.organization_phone,
              agentEmail: data.organization_email,
              plan: tenant.plan?.name || 'Basic',
              population: tenant.population || 0,
              status: tenant.status
                ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)
                : 'Active',
            })),
            revenueData: [],
            loginActivities: [],
            planDistribution: [],
            recentOnboarding: [],
            topAgents: [],
            topRevenueSchools: [],
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

  const BCrumb = [
    { to: '/', title: 'Home' },
    ...(isDashboard || (isOwnProfile && currentUser.access_level > 1)
      ? []
      : [{ to: '/agent', title: 'Agent' }]),
    {
      title:
        isDashboard || (isOwnProfile && currentUser.access_level > 1)
          ? 'Dashboard'
          : 'View Profile',
    },
  ];

  const isDark = theme.palette.mode === 'dark';

  return (
    <PageContainer
      title={
        isOwnProfile && currentUser?.access_level > 1 ? 'Organization Dashboard' : 'View Organization Profile'
      }
      description="Detailed organization profile view"
    >
      <Box sx={{ minHeight: '100vh', p: { xs: 1, md: 2 } }}>
        <Breadcrumb
          title={isOwnProfile && currentUser?.access_level > 1 ? 'Dashboard' : 'View Profile'}
          items={BCrumb}
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : agentData ? (
          <>
            <Grid container spacing={3} alignItems="stretch" sx={{ mt: 1 }}>
              <Grid item size={{ xs: 12, md: 4, lg: 4 }}>
                <ProfileHeader
                  profile={agentData.profile}
                  onManageSchools={() => setValue('3')}
                  onManageAgent={() => setValue('2')}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 8, lg: 8 }}>
                <StatCards
                  stats={agentData.stats}
                  onTransactionClick={() => setIsTransactionModalOpen(true)}
                  onSchoolClick={() => setIsSchoolModalOpen(true)}
                  onSubAgentClick={() => setIsSubAgentModalOpen(true)}
                />
              </Grid>
            </Grid>

            <Box mt={4}>
              <Box
                sx={{
                  bgcolor: isDark ? '#1e1e1e' : '#FFFFFF',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: isDark ? '1px solid #333' : '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
              >
                <TabContext value={value}>
                  <Box
                    sx={{
                      borderBottom: 1,
                      borderColor: isDark ? '#333' : '#E2E8F0',
                      bgcolor: isDark ? '#1e1e1e' : '#FFFFFF',
                      px: 2,
                    }}
                  >
                    <TabList
                      onChange={(_, newValue) => setValue(newValue)}
                      aria-label="agent tabs"
                      variant="scrollable"
                      scrollButtons="auto"
                      allowScrollButtonsMobile
                      sx={{
                        '& .MuiTabs-indicator': {
                          height: 3,
                          borderRadius: '4px 4px 0 0',
                          bgcolor: '#1E40AF',
                        },
                        '& .MuiTab-root': {
                          minHeight: 56,
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isDark ? '#aaa' : '#64748B',
                          textTransform: 'none',
                        },
                      }}
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
                    </TabList>
                  </Box>

                  <Box>
                    <TabPanel value="1" sx={{ p: 0 }}>
                      <OverviewTab data={agentData} />
                    </TabPanel>
                    <TabPanel value="2" sx={{ p: 3 }}>
                      <TeamTab
                        team={agentData.team || []}
                        onAddAgent={() => setIsAddAgentModalOpen(true)}
                      />
                    </TabPanel>
                    <TabPanel value="3" sx={{ p: 3 }}>
                      <SchoolsTab
                        schools={agentData.schools || []}
                        onAddSchool={() => setIsAddSchoolModalOpen(true)}
                      />
                    </TabPanel>
                    <TabPanel value="4" sx={{ p: 3 }}>
                      <ManageTeamTab />
                    </TabPanel>
                  </Box>
                </TabContext>
              </Box>
            </Box>
          </>
        ) : (
          <Box p={3} textAlign="center">
            <Typography variant="h6">Failed to load organization data.</Typography>
          </Box>
        )}

        {/* Modals */}
        <TotalSchoolModal open={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} />
        <TotalTransactionModal
          open={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
        />
        <TotalSubAgentModal
          open={isSubAgentModalOpen}
          onClose={() => setIsSubAgentModalOpen(false)}
          totalSubAgents={agentData?.stats?.totalSubAgents}
        />
        <AgentModal
          open={isAddAgentModalOpen}
          onClose={() => setIsAddAgentModalOpen(false)}
          handleRefresh={() => setRefreshKey?.(prev => prev + 1)}
        />
        <ReusableModal
          open={isAddSchoolModalOpen}
          onClose={() => setIsAddSchoolModalOpen(false)}
          title="Register School"
          size="large"
        >
          <RegisterSchoolForm
            actionType="create"
            onSubmit={() => setIsAddSchoolModalOpen(false)}
            onCancel={() => setIsAddSchoolModalOpen(false)}
          />
        </ReusableModal>
      </Box>
    </PageContainer>
  );
};

export default ViewAgent;
