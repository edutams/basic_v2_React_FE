
import React, { useState } from 'react';
import { Box, Tab, Stack, Grid } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IconLayoutDashboard, IconUsers, IconSchool } from '@tabler/icons-react';
import { useParams } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';

// New Components
import ProfileHeader from './components/ProfileHeader';
import StatCards from './components/StatCards';
import OverviewTab from './components/OverviewTab';
import TeamTab from './components/TeamTab';
import SchoolsTab from './components/SchoolsTab';

// Mock Data
import { mockAgentData } from './mockData';
const ViewAgent = () => {
    const { user: currentUser } = useAuth();
    const { id } = useParams();
    const [value, setValue] = React.useState('1');
    const isOwnProfile = currentUser && currentUser.id == id;

    const BCrumb = [
        { to: '/', title: 'Home' },
        ...(isOwnProfile && currentUser.access_level > 1 ? [] : [{ to: '/agent', title: 'Agent' }]),
        { title: isOwnProfile && currentUser.access_level > 1 ? 'Dashboard' : 'View Profile' },
    ];

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <PageContainer 
            title={isOwnProfile && currentUser.access_level > 1 ? "Agent Dashboard" : "View Agent Profile"} 
            description="Detailed agent profile view"
        >
            <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh', p: { xs: 1, md: 2 } }}>
                <Breadcrumb title={isOwnProfile && currentUser.access_level > 1 ? "Dashboard" : "View Profile"} items={BCrumb} />
                
                <Box mt={3}>
                    <Grid container spacing={3} alignItems="stretch">
                        <Grid size={{xs: 12, md: 5, lg: 5}}>
                            <ProfileHeader profile={mockAgentData.profile} />
                        </Grid>
                        <Grid size={{xs: 12, md: 7, lg: 7}}>
                            <StatCards stats={mockAgentData.stats} />
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
                                    <OverviewTab data={mockAgentData} />
                                </TabPanel>
                                <TabPanel value="2" sx={{ p: 3 }}>
                                    <TeamTab team={mockAgentData.team} />
                                </TabPanel>
                                <TabPanel value="3" sx={{ p: 3 }}>
                                    <SchoolsTab schools={mockAgentData.schools} />
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
