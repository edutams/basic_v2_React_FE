import React, { useState, useEffect } from 'react';
import { Box, Tab, Stack, Grid, CircularProgress } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IconLayoutDashboard, IconUsers, IconSchool } from '@tabler/icons-react';
import { useParams, Navigate } from 'react-router';

import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';

// New Components
import ProfileHeader from './components/ProfileHeader';
import StatCards from './components/StatCards';
import OverviewTab from './components/OverviewTab';
import TeamTab from './components/TeamTab';
import SchoolsTab from './components/SchoolsTab';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/auth';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/agent', title: 'Agent' },
  { title: 'View Profile' },
];

const ViewAgent = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [value, setValue] = useState('1');
    const [agentData, setAgentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAgentData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/agent/get_agent_details/${id}`);
                setAgentData(response.data.data);
            } catch (error) {
                console.error('Error fetching agent details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAgentData();
        }
    }, [id]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user?.is_super_admin && user?.access_level > 1 && user?.id !== id) {
        return <Navigate to={`/agent/view/${user.id}`} replace />;
    }

    if (!agentData) {
        return <Navigate to="/auth/404" replace />;
    }

    // Map backend data to component expected format
    const profile = {
        name: agentData.name,
        handle: `@${agentData.email.split('@')[0]}`,
        image: agentData.image,
        level: `Level ${agentData.access_level}`,
    };

    const stats = {
        totalRevenue: agentData.total_revenue || 0,
        assignedSchools: agentData.tenants_count || 0,
        activeAgents: agentData.children_count || 0,
    };

    return (
        <PageContainer title="View Agent Profile" description="Detailed agent profile view">
            <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh', p: { xs: 1, md: 2 } }}>
                <Breadcrumb title="View Profile" items={BCrumb} />
                
                <Box mt={3}>
                    <Grid container spacing={3} alignItems="stretch">
                        <Grid size={{xs: 12, md: 5, lg: 5}}>
                            <ProfileHeader profile={profile} />
                        </Grid>
                        <Grid size={{xs: 12, md: 7, lg: 7}}>
                            <StatCards stats={stats} />
                        </Grid>
                    </Grid>
                </Box>
                    
                <Box mt={4}>
                    <Box sx={{ bgcolor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', bgcolor: '#F8FAFC', px: 2 }}>
                                <TabList 
                                    onChange={handleChange} 
                                    aria-label="agent tabs"
                                    sx={{
                                        '& .MuiTabs-indicator': {
                                            height: 4,
                                            borderRadius: '4px 4px 0 0',
                                            bgcolor: '#1E293B'
                                        },
                                        '& .MuiTab-root': {
                                            minHeight: 64,
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: '#64748B',
                                            '&.Mui-selected': {
                                                color: '#1E293B'
                                            }
                                        }
                                    }}
                                >
                                    <Tab 
                                        icon={<IconLayoutDashboard size={20} />} 
                                        iconPosition="start" 
                                        label="Overview" 
                                        value="1" 
                                        sx={{ textTransform: 'none' }} 
                                    />
                                    <Tab 
                                        icon={<IconUsers size={20} />} 
                                        iconPosition="start" 
                                        label="Team (Descendent)" 
                                        value="2" 
                                        sx={{ textTransform: 'none' }} 
                                    />
                                    <Tab 
                                        icon={<IconSchool size={20} />} 
                                        iconPosition="start" 
                                        label="Schools" 
                                        value="3" 
                                        sx={{ textTransform: 'none' }} 
                                    />
                                </TabList>
                            </Box>
                            <Box sx={{ p: 0 }}>
                                <TabPanel value="1" sx={{ p: 0 }}>
                                    <OverviewTab data={{
                                        revenueData: agentData.revenue_history || [],
                                        planDistribution: agentData.plan_distribution || [],
                                        loginActivities: {
                                            successful: agentData.successful_logins || 0,
                                            unsuccessful: agentData.unsuccessful_logins || 0,
                                        },
                                        recentOnboarding: (agentData.tenants || []).slice(0, 5).map(t => ({
                                            school: t.org_name || t.name,
                                            agent: agentData.name,
                                            handle: `@${agentData.email.split('@')[0]}`,
                                            created_at: new Date(t.created_at).toLocaleDateString(),
                                        })),
                                        topAgents: (agentData.children || []).slice(0, 10).map(c => ({
                                            name: c.name,
                                            handle: `@${c.email.split('@')[0]}`,
                                            location: c.address,
                                            level: `Level ${c.access_level}`,
                                            transaction: c.total_revenue || 0,
                                        })),
                                        topRevenueSchools: (agentData.tenants || []).slice(0, 10).map(t => ({
                                            school: t.org_name || t.name,
                                            agent: agentData.name,
                                            handle: `@${agentData.email.split('@')[0]}`,
                                            transaction: t.revenue || 0,
                                        }))
                                    }} />
                                </TabPanel>
                                <TabPanel value="2" sx={{ p: 3 }}>
                                    <TeamTab team={(agentData.children || []).map(c => ({
                                        name: c.name,
                                        handle: `@${c.email.split('@')[0]}`,
                                        location: c.address,
                                        level: `Level ${c.access_level}`,
                                        revenue: c.total_revenue || 0,
                                        totalSubAgents: c.children_count || 0,
                                    }))} />
                                </TabPanel>
                                <TabPanel value="3" sx={{ p: 3 }}>
                                    <SchoolsTab schools={(agentData.tenants || []).map(t => ({
                                        school: t.org_name || t.name,
                                        revenue: t.revenue || 0,
                                        status: t.status || 'Active',
                                        dateAdded: new Date(t.created_at).toLocaleDateString(),
                                    }))} />
                                </TabPanel>
                            </Box>
                        </TabContext>
                    </Box>
                </Box>
            </Box>
        </PageContainer>
    );
};

export default ViewAgent;
