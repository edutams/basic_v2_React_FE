
import React from 'react';
import { Grid, Card, Box, Typography, Stack, IconButton,Divider } from '@mui/material';
import { IconWallet, IconSchool, IconUsers, IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const StatCards = ({ stats }) => {
    return (
        <Grid container spacing={2} sx={{ height: '100%', alignItems: 'stretch' }}>
            {/* Total Transaction */}
            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Card sx={{ 
                    p: 2.5, 
                    height: '100%', 
                    borderRadius: '12px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    position: 'relative',
                    bgcolor: '#f5fdf9', // Very light green
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: 'none',
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ color: '#00ACFF' }}>
                            <IconWallet size={32} color="#00ACFF" />
                        </Box>
                        <Box sx={{ bgcolor: '#454545', p: 0.5, borderRadius: '4px', display: 'flex' }}>
                            <IconChartBar size={20} color="white" />
                        </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" fontWeight="700" sx={{ color: '#1a3353', fontSize: '28px', mb: 0.5 }}>
                            # {stats.totalTransaction}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                            Total Transaction Value
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#1a3353', fontWeight: 700, display: 'block', mb: 0.5, fontSize: '10px' }}>
                                 Commission
                            </Typography>
                            <Box sx={{ bgcolor: '#9c27b0', color: 'white', px: 1, py: 0.5, borderRadius: '50px', textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '10px' }}>
                                    #{stats.commission}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ height: '30px', alignSelf: 'center', bgcolor: '#ddd', mx: 0.5 }} />

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.5, fontSize: '10px' }}>
                                 Volume
                            </Typography>
                            <Box sx={{ bgcolor: '#4a6750', color: 'white', px: 1, py: 0.5, borderRadius: '50px', textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '10px' }}>
                                    {stats.volume}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Card>
            </Grid>

            {/* Total Sub Agents */}
            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Card sx={{ 
                    p: 2.5, 
                    height: '100%', 
                    borderRadius: '12px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    bgcolor: 'white',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: 'none'
                }}>
                    <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                        <IconUsers size={48} color="#00ACFF" />
                        <Box>
                            <Typography variant="h1" fontWeight="700" sx={{ color: '#1a3353', fontSize: '42px', lineHeight: 1 }}>
                                {stats.totalSubAgents}
                            </Typography>
                            <Typography variant="h6" fontWeight="700" sx={{ color: '#1a3353', mt: 0.5 }}>
                                Total Sub Agents
                            </Typography>
                        </Box>
                    </Stack>
                </Card>
            </Grid>

            {/* Total School */}
            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Card sx={{ 
                    p: 2.5, 
                    height: '100%', 
                    borderRadius: '12px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    position: 'relative',
                    bgcolor: 'white',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: 'none'
                }}>
                    <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                        <IconSchool size={48} color="#00ACFF" />
                        <Box>
                            <Typography variant="h1" fontWeight="700" sx={{ color: '#1a3353', fontSize: '42px', lineHeight: 1 }}>
                                {stats.totalSchool}
                            </Typography>
                            <Typography variant="h6" fontWeight="700" sx={{ color: '#1a3353', mt: 0.5 }}>
                                Total School
                            </Typography>
                        </Box>
                    </Stack>
                    <Box sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: '#454545', p: 0.5, borderRadius: '4px', display: 'flex' }}>
                        <IconChartBar size={18} color="white" />
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
};

StatCards.propTypes = {
    stats: PropTypes.shape({
        totalTransaction: PropTypes.string,
        totalSchool: PropTypes.number,
        totalSubAgents: PropTypes.number,
        commission: PropTypes.string,
        volume: PropTypes.string,
    }).isRequired,
};

export default StatCards;
