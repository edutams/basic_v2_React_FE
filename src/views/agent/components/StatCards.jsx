import React from 'react';
import { Grid, Card, Box, Typography, Stack, Divider, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, valueColor, valueBg, subStats = [], onIconClick, onClick }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                borderRadius: '16px',
                boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.06)',
                border: `1px solid ${isDark ? theme.palette.divider : '#f0f0f0'}`,
                bgcolor: isDark ? theme.palette.background.paper : '#fff',
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? { boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: '0.2s' } : {},
            }}
        >
            <Box sx={{ p: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: isDark ? '#ccc' : '#444', fontSize: '13px' }}>
                        {title}
                    </Typography>
                    <Box
                        onClick={(e) => { e.stopPropagation(); onIconClick?.(); }}
                        sx={{
                            bgcolor: isDark ? '#333' : '#3d3d3d',
                            p: '5px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: onIconClick ? 'pointer' : 'default',
                            flexShrink: 0,
                            '&:hover': onIconClick ? { bgcolor: '#111' } : {},
                        }}
                    >
                        <IconChartBar size={15} color="white" />
                    </Box>
                </Box>

                {/* Value */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ bgcolor: valueBg || (isDark ? '#1e3a5f33' : '#EEF2FF'), borderRadius: '10px', px: 2.5, py: 1.2 }}>
                        <Typography fontWeight="800" sx={{ color: valueColor || '#4a3aff', fontSize: '28px', lineHeight: 1, whiteSpace: 'nowrap' }}>
                            {value}
                        </Typography>
                    </Box>
                </Box>

                {/* Sub stats */}
                {subStats.length > 0 && (
                    <>
                        {/* <Divider sx={{ my: 1.5, borderColor: isDark ? '#333' : '#f0f0f0' }} /> */}
                        <Stack direction="row" spacing={0}>
                            {subStats.map((stat, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: isDark ? '#333' : '#e8e8e8' }} />}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: isDark ? '#888' : '#999', fontWeight: 500, display: 'block', mb: 0.2, fontSize: '10px' }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight="700" sx={{ color: isDark ? '#fff' : '#1a1a1a', fontSize: '14px' }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                </React.Fragment>
                            ))}
                        </Stack>
                    </>
                )}
            </Box>
        </Card>
    );
};

const StatCards = ({ stats, onTransactionClick, onSubAgentClick, onSchoolClick }) => {
    return (
        <Grid container spacing={2} sx={{ height: '100%', alignItems: 'stretch' }}>
            {/* Total Transaction Value */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                <StatCard
                    title="Total Transaction Value"
                    value={`₦${stats.totalTransaction}`}
                    valueColor="#2ca87f"
                    valueBg="#d6f5eb"
                    subStats={[
                        { label: 'Commission', value: `₦${stats.commission}` },
                        { label: 'Volume', value: stats.volume },
                    ]}
                    onIconClick={onTransactionClick}
                    onClick={onTransactionClick}
                />
            </Grid>

            {/* Total Sub Agents */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                <StatCard
                    title="Total Sub Agents"
                    value={stats.totalSubAgents}
                    valueColor="#f59e0b"
                    valueBg="#fef3c7"
                    subStats={[
                        { label: 'Lv3', value: '32' },
                        { label: 'Lv4', value: '21' },
                        { label: 'Lv5', value: '43' },
                    ]}
                    onIconClick={onSubAgentClick}
                    onClick={onSubAgentClick}
                />
            </Grid>

            {/* Total School */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                <StatCard
                    title="Total School"
                    value={stats.totalSchool}
                    valueColor="#4a3aff"
                    valueBg="#e8e6ff"
                    subStats={[
                        { label: 'Primary School', value: '300' },
                        { label: 'Senior Secondary', value: '30' },
                    ]}
                    onIconClick={onSchoolClick}
                    onClick={onSchoolClick}
                />
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
    onSubAgentClick: PropTypes.func,
    onSchoolClick: PropTypes.func,
};

export default StatCards;
