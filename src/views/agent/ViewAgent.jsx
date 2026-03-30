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

    useEffect(() => {
        const fetchAgentDetails = async () => {
            setIsLoading(true);
            try {
                const response = await agentApi.getDetails(id);
                if (response.success && response.data) {
                    const data = response.data;

                    const mappedData = {
                        profile: {
                            id: data.id,
                            name: data.org_name || data.name,
                            handle: data.email,
                            level: `Level ${data.access_level} Agent`,
                            status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Inactive',
                            image: data.image || mockAgentData.profile.image,
                            primaryColor: data.primary_color || null,
                        },
                        stats: {
                            totalTransaction: mockAgentData.stats.totalTransaction,
                            transactionCount: mockAgentData.stats.transactionCount,
                            totalSchool: data.tenants_count || 0,
                            totalSubAgents: data.children ? data.children.length : (data.children_count || 0),
                            commission: mockAgentData.stats.commission,
                            volume: mockAgentData.stats.volume
                        },
                        team: (data.children || []).map(child => ({
                            name: child.org_name || child.name,
                            handle: child.email,
                            phone: child.phone,
                            transaction: '0',
                            performance: '0',
                            level: child.access_level,
                            descendent: child.children_count || 0,
                            status: child.status ? child.status.charAt(0).toUpperCase() + child.status.slice(1) : 'Inactive',
                        })),
                        schools: (data.tenants || []).map(tenant => ({
                            school: tenant.school_name || tenant.name || 'Unknown School',
                            contact: tenant.phone || 'N/A',
                            email: tenant.email || 'N/A',
                            agent: data.org_name || data.name,
                            agentContact: data.phone,
                            agentEmail: data.email,
                            plan: tenant.plan?.name || 'Basic',
                            population: tenant.population || 0,
                            status: tenant.status ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1) : 'Active'
                        })),
                        revenueData: mockAgentData.revenueData,
                        loginActivities: mockAgentData.loginActivities,
                        planDistribution: mockAgentData.planDistribution,
                        recentOnboarding: mockAgentData.recentOnboarding,
                        topAgents: mockAgentData.topAgents,
                        topRevenueSchools: mockAgentData.topRevenueSchools,
                    };
                    setAgentData(mappedData);
                }
            } catch (error) {
                console.error("Failed to fetch agent details", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAgentDetails();
        } else {
            setIsLoading(false);
        }
    }, [id]);

    const BCrumb = [
        { to: '/', title: 'Home' },
        ...(isDashboard || (isOwnProfile && currentUser.access_level > 1) ? [] : [{ to: '/agent', title: 'Agent' }]),
        { title: isDashboard || (isOwnProfile && currentUser.access_level > 1) ? 'Dashboard' : 'View Profile' },
    ];

    const isDark = theme.palette.mode === 'dark';

    return (
        <PageContainer
            title={isOwnProfile && currentUser.access_level > 1 ? "Agent Dashboard" : "View Agent Profile"}
            description="Detailed agent profile view"
        >
            <Box sx={{ minHeight: '100vh', p: { xs: 1, md: 2 } }}>
                <Breadcrumb title={isOwnProfile && currentUser.access_level > 1 ? "Dashboard" : "View Profile"} items={BCrumb} />

                <Box mt={3}>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress />
                        </Box>
                    ) : agentData ? (
                        <Grid container spacing={3} alignItems="stretch">
                            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                                <ProfileHeader
                                    profile={agentData.profile}
                                    onManageSchools={() => setValue('3')}
                                    onManageAgent={() => setValue('2')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 8, lg: 8 }}>
                                <StatCards
                                    stats={agentData.stats}
                                    onTransactionClick={() => setIsTransactionModalOpen(true)}
                                    onSchoolClick={() => setIsSchoolModalOpen(true)}
                                    onSubAgentClick={() => setIsSubAgentModalOpen(true)}
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <Box p={3}>Failed to load agent data.</Box>
                    )}
                </Box>

                {/* Modals */}
                <TotalSchoolModal open={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} />
                <TotalTransactionModal open={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} />
                <TotalSubAgentModal open={isSubAgentModalOpen} onClose={() => setIsSubAgentModalOpen(false)} totalSubAgents={agentData?.stats?.totalSubAgents} />
                <AgentModal open={isAddAgentModalOpen} onClose={() => setIsAddAgentModalOpen(false)} handleRefresh={() => {}} />
                <ReusableModal open={isAddSchoolModalOpen} onClose={() => setIsAddSchoolModalOpen(false)} title="Register School" size="large">
                    <RegisterSchoolForm
                        actionType="create"
                        onSubmit={() => setIsAddSchoolModalOpen(false)}
                        onCancel={() => setIsAddSchoolModalOpen(false)}
                    />
                </ReusableModal>

                <Box mt={4}>
                    <Box sx={{
                        bgcolor: isDark ? '#1e1e1e' : '#FFFFFF',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: isDark ? '1px solid #333' : '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                    }}>
                        <TabContext value={value}>
                            <Box sx={{
                                borderBottom: 1,
                                borderColor: isDark ? '#333' : '#E2E8F0',
                                bgcolor: isDark ? '#1e1e1e' : '#FFFFFF',
                                px: 2
                            }}>
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
                                            bgcolor: '#1E40AF'
                                        },
                                        '& .MuiTab-root': {
                                            minHeight: 56,
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: isDark ? '#aaa' : '#64748B',
                                            textTransform: 'none',
                                            
                                        }
                                    }}
                                >
                                    <Tab icon={<IconLayoutDashboard size={18} />} iconPosition="start" label="Overview" value="1" />
                                    <Tab icon={<IconUsers size={18} />} iconPosition="start" label="Agents" value="2" />
                                    <Tab icon={<IconSchool size={18} />} iconPosition="start" label="Schools" value="3" />
                                </TabList>
                            </Box>

                            {!isLoading && (
                                <Box>
                                    <TabPanel value="1" sx={{ p: 0 }}>
                                        <OverviewTab data={agentData || mockAgentData} />
                                    </TabPanel>
                                    <TabPanel value="2" sx={{ p: 3 }}>
                                        <TeamTab
                                            team={agentData?.team || []}
                                            onAddAgent={() => setIsAddAgentModalOpen(true)}
                                        />
                                    </TabPanel>
                                    <TabPanel value="3" sx={{ p: 3 }}>
                                        <SchoolsTab
                                            schools={agentData?.schools || []}
                                            onAddSchool={() => setIsAddSchoolModalOpen(true)}
                                        />
                                    </TabPanel>
                                </Box>
                            )}
                        </TabContext>
                    </Box>
                </Box>
            </Box>
        </PageContainer>
    );
};

export default ViewAgent;
