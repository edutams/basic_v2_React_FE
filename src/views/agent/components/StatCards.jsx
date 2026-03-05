
import React from 'react';
import { Grid, Card, Box, Typography, Stack, IconButton } from '@mui/material';
import { IconCash, IconSchool, IconUsers, IconChartBar } from '@tabler/icons-react';

const StatCards = ({ stats }) => {
    return (
        <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Total Transaction */}
            <Grid  size={{xs: 12, md: 4, lg: 4}}>
                <Card sx={{ 
                    p: 2.5, 
                    height: '100%', 
                    borderRadius: '12px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    position: 'relative',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                   
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ bgcolor: 'white', p: 1, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <IconCash size={28} color="#00ACFF" />
                        </Box>
                        <Stack direction="column" spacing={0.5} alignItems="flex-end">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ bgcolor: '#475569', color: 'white', px: 1, py: 0.2, borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                    {stats.transactionCount}
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '11px' }}>Vol.</Typography>
                            </Stack>
                            <Box sx={{ bgcolor: '#94A3B8', color: 'white', px: 1, py: 0.2, borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                                MegaCity
                            </Box>
                        </Stack>
                    </Box>
                    <Box mt={2}>
                        <Typography variant="h3" fontWeight={800} sx={{ color: '#1E293B', fontSize: '24px', letterSpacing: '-0.5px' }}>
                            # {stats.totalTransaction}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>
                            Total Transaction Value
                        </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: 'white', p: 0.5, borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                        <IconChartBar size={18} color="#475569" />
                    </Box>
                </Card>
            </Grid>

            {/* Total School */}
            <Grid   size={{xs: 12, md: 4, lg: 4}}>
                <Card sx={{ 
                    p: 2.5, 
                    height: '100%', 
                    borderRadius: '12px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    position: 'relative',
                    bgcolor: 'white',
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none'
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ bgcolor: '#F1F5F9', p: 1, borderRadius: '8px' }}>
                            <IconSchool size={28} color="#00ACFF" />
                        </Box>
                    </Box>
                    <Box mt={2} textAlign="center">
                        <Typography variant="h3" fontWeight={800} sx={{ color: '#1E293B', fontSize: '42px' }}>
                            {stats.totalSchool}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '14px' }}>
                            Total School
                        </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: '#F1F5F9', p: 0.5, borderRadius: '4px' }}>
                        <IconChartBar size={18} color="#475569" />
                    </Box>
                </Card>
            </Grid>

            {/* Total Sub Agents */}
            <Grid   size={{xs: 12, md: 4, lg: 4}}>
                <Card sx={{ 
                    p: 2.5, 
                    height: '100%', 
                    borderRadius: '12px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    position: 'relative',
                    bgcolor: 'white',
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none'
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ bgcolor: '#F1F5F9', p: 1, borderRadius: '8px' }}>
                            <IconUsers size={28} color="#00ACFF" />
                        </Box>
                    </Box>
                    <Box mt={2} textAlign="center">
                        <Typography variant="h3" fontWeight={800} sx={{ color: '#1E293B', fontSize: '42px' }}>
                            {stats.totalSubAgents}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '14px' }}>
                            Total Sub Agents
                        </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: '#F1F5F9', p: 0.5, borderRadius: '4px' }}>
                        <IconChartBar size={18} color="#475569" />
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
};

export default StatCards;
