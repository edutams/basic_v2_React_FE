
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Select, MenuItem } from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import CommissionSummaryCards from './components/CommissionSummaryCards';
import CommissionTable from './components/CommissionTable';
import { SetCommissionModal, ChangeCommissionTypeModal } from './components/CommissionModals';
import { mockCommissionData } from './mockData';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/agent', title: 'Agent' },
    { title: 'Manage Commission' },
];

const CommissionManagement = () => {
    const [value, setValue] = useState('1'); // Current tab index
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [typeModalOpen, setTypeModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleEditCommission = (agent) => {
        setSelectedAgent(agent);
        setEditModalOpen(true);
    };

    const handleChangeType = (agent) => {
        setSelectedAgent(agent);
        setTypeModalOpen(true);
    };

    // Filter data based on tab
    const getFilteredData = () => {
        if (value === '3') return mockCommissionData.filter(a => a.commissionType === 'Subscription');
        if (value === '4') return mockCommissionData.filter(a => a.commissionType === 'Transaction');
        return mockCommissionData;
    };

    const getTitle = () => {
        switch (value) {
            case '1': return 'Agent Overview';
            case '2': return 'Manage Agent Commission';
            case '3': return 'Commission by Subscription';
            case '4': return 'Commission by Transaction';
            default: return 'Agent Overview';
        }
    };

    return (
        <PageContainer title="Manage Commission" description="Commission management dashboard">
            <Box sx={{ p: { xs: 1, md: 3 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                <Breadcrumb title="Manage Commission" items={BCrumb} />

                <Box mt={3}>
                    <CommissionSummaryCards />
                </Box>

                <Box mt={4} sx={{ bgcolor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, pb: 0 }}>
                        <Tabs value={value} onChange={handleTabChange} textColor="inherit" indicatorColor="primary">
                            <Tab label="Overview" value="1" sx={{ textTransform: 'none', fontWeight: 600 }} />
                            <Tab label="Manage" value="2" sx={{ textTransform: 'none', fontWeight: 600 }} />
                            <Tab label="Commission by Subscription" value="3" sx={{ textTransform: 'none', fontWeight: 600 }} />
                            <Tab label="Commission by Transaction" value="4" sx={{ textTransform: 'none', fontWeight: 600 }} />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" fontWeight={700}>{getTitle()}</Typography>
                            {value === '1' && (
                                <Select
                                    value="2026"
                                    size="small"
                                    sx={{ borderRadius: '8px', minWidth: 100 }}
                                >
                                    <MenuItem value="2026">2026</MenuItem>
                                    <MenuItem value="2025">2025</MenuItem>
                                </Select>
                            )}
                        </Box>

                        <CommissionTable 
                            data={getFilteredData()} 
                            activeTab={value}
                            onEditCommission={handleEditCommission}
                            onChangeType={handleChangeType}
                        />
                    </Box>
                </Box>
            </Box>

            <SetCommissionModal 
                open={editModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                agent={selectedAgent} 
            />
            <ChangeCommissionTypeModal 
                open={typeModalOpen} 
                onClose={() => setTypeModalOpen(false)} 
                agent={selectedAgent} 
            />
        </PageContainer>
    );
};

export default CommissionManagement;
