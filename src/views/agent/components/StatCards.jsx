import React from 'react';
import { Grid, Card, Box, Typography, Stack, IconButton, Divider, useTheme } from '@mui/material';
import { IconWallet, IconSchool, IconUsers, IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const StatCards = ({ stats, onTransactionClick, onSchoolClick }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
        <Grid container spacing={2} sx={{ height: '100%', alignItems: 'stretch' }}>
            {/* Total Transaction */}
            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Card 
                    onClick={onTransactionClick}
                    sx={{ 
                        p: 2.5, 
                        height: '100%', 
                        borderRadius: '12px',
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        position: 'relative',
                        bgcolor: isDarkMode ? 'rgba(0, 172, 255, 0.05)' : '#f5fdf9', 
                        border: `1px solid ${isDarkMode ? theme.palette.divider : 'rgba(0,0,0,0.05)'}`,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: isDarkMode ? 'rgba(0, 172, 255, 0.1)' : '#f0fdf4' }
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ color: '#00ACFF' }}>
                            <IconWallet size={32} color="#00ACFF" />
                        </Box>
                        <Box sx={{ bgcolor: isDarkMode ? theme.palette.grey[800] : '#454545', p: 0.5, borderRadius: '4px', display: 'flex' }}>
                            <IconChartBar size={20} color="white" />
                        </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" fontWeight="700" sx={{ color: theme.palette.text.primary, fontSize: '28px', mb: 0.5 }}>
                            # {stats.totalTransaction}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Total Transaction Value
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 700, display: 'block', mb: 0.5, fontSize: '10px' }}>
                                 Commission
                            </Typography>
                            <Box sx={{ bgcolor: '#9c27b0', color: 'white', px: 1, py: 0.5, borderRadius: '50px', textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '10px' }}>
                                    #{stats.commission}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ height: '30px', alignSelf: 'center', bgcolor: theme.palette.divider, mx: 0.5 }} />

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5, fontSize: '10px' }}>
                                 Volume
                            </Typography>
                            <Box sx={{ bgcolor: isDarkMode ? theme.palette.success.dark : '#4a6750', color: 'white', px: 1, py: 0.5, borderRadius: '50px', textAlign: 'center' }}>
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
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${isDarkMode ? theme.palette.divider : 'rgba(0,0,0,0.05)'}`,
                    boxShadow: 'none'
                }}>
                    <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                        <IconUsers size={48} color="#00ACFF" />
                        <Box>
                            <Typography variant="h1" fontWeight="700" sx={{ color: theme.palette.text.primary, fontSize: '42px', lineHeight: 1 }}>
                                {stats.totalSubAgents}
                            </Typography>
                            <Typography variant="h6" fontWeight="700" sx={{ color: theme.palette.text.primary, mt: 0.5 }}>
                                Total Sub Agents
                            </Typography>
                        </Box>
                    </Stack>
                </Card>
            </Grid>

            {/* Total School */}
            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <Card 
                    onClick={onSchoolClick}
                    sx={{ 
                        p: 2.5, 
                        height: '100%', 
                        borderRadius: '12px',
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        position: 'relative',
                        bgcolor: theme.palette.background.paper,
                        border: `1px solid ${isDarkMode ? theme.palette.divider : 'rgba(0,0,0,0.05)'}`,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc' }
                    }}
                >
                    <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                        <IconSchool size={48} color="#00ACFF" />
                        <Box>
                            <Typography variant="h1" fontWeight="700" sx={{ color: theme.palette.text.primary, fontSize: '42px', lineHeight: 1 }}>
                                {stats.totalSchool}
                            </Typography>
                            <Typography variant="h6" fontWeight="700" sx={{ color: theme.palette.text.primary, mt: 0.5 }}>
                                Total School
                            </Typography>
                        </Box>
                    </Stack>
                    <Box sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: isDarkMode ? theme.palette.grey[800] : '#454545', p: 0.5, borderRadius: '4px', display: 'flex' }}>
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
    onTransactionClick: PropTypes.func,
    onSchoolClick: PropTypes.func,
};

export default StatCards;
