import React from 'react';
import {
    Grid,
    Box,
    Typography,
    Stack,
    Select,
    MenuItem,
    Card,
    useTheme
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const TotalTransactionModal = ({ open, onClose }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const [year, setYear] = React.useState('2026');
    const [option, setOption] = React.useState('All');

    const chartOptions = {
        chart: {
            toolbar: { show: true },
            fontFamily: 'inherit',
            foreColor: theme.palette.text.secondary,
            background: 'transparent'
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light'
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '45%',
            }
        },
        dataLabels: { enabled: false },
        colors: ['#00ACFF'],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisBorder: { color: theme.palette.divider },
            axisTicks: { color: theme.palette.divider }
        },
        yaxis: {
            labels: {
                style: { colors: theme.palette.text.secondary },
                formatter: (val) => {
                    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
                    return val;
                }
            }
        },
        grid: {
            borderColor: theme.palette.divider,
        },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' }
    };

    const chartSeries = [{
        name: 'Transactions',
        data: [3500000, 4200000, 4200000, 4200000, 4200000, 4200000, 4200000, 4200000, 3500000, 2300000, 0, 0]
    }];

    const SideStat = ({ label, value }) => (
        <Card sx={{ 
            p: 2, 
            mb: 2, 
            border: `1px solid ${isDarkMode ? theme.palette.divider : '#E2E8F0'}`, 
            boxShadow: theme.shadows[1],
            textAlign: 'center',
            bgcolor: theme.palette.background.paper
        }}>
            <Typography variant="caption" color="textSecondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
            <Typography variant="h6" fontWeight="800" color="primary" sx={{ mt: 0.5 }}># {value}</Typography>
        </Card>
    );

    return (
        <StandardModal
            open={open}
            onClose={onClose}
            maxWidth="lg"
            padding={3}
            dividers={false}
            headerBg={isDarkMode ? theme.palette.background.paper : '#f4f6f8'}
            sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#f4f6f8' }}
            actions={
                <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                    <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
                    <PrimaryButton variant="primary" onClick={onClose}>Save</PrimaryButton>
                </Stack>
            }
        >
            {/* Top Cards Section */}
            <Grid container spacing={2} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ 
                      p: 2.5, 
                      border: `1px solid ${isDarkMode ? theme.palette.divider : '#E2E8F0'}`, 
                      boxShadow: theme.shadows[1], 
                      textAlign: 'center',
                      bgcolor: theme.palette.background.paper
                    }}>
                        <Typography variant="h5" fontWeight="800" color="textPrimary"># 7,000,234.00</Typography>
                        <Typography variant="caption" color="textSecondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>Total Transaction Value</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ 
                      p: 2.5, 
                      border: `1px solid ${isDarkMode ? theme.palette.divider : '#E2E8F0'}`, 
                      boxShadow: theme.shadows[1], 
                      textAlign: 'center',
                      bgcolor: theme.palette.background.paper
                    }}>
                        <Typography variant="h5" fontWeight="800" color="textPrimary"># 7,000,234.00</Typography>
                        <Typography variant="caption" color="textSecondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>Total Transaction Vol.</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ 
                      p: 2.5, 
                      border: `1px solid ${isDarkMode ? theme.palette.divider : '#E2E8F0'}`, 
                      boxShadow: theme.shadows[1], 
                      textAlign: 'center',
                      bgcolor: theme.palette.background.paper
                    }}>
                        <Typography variant="h5" fontWeight="800" color="#FACC15"># 7,000,234.00</Typography>
                        <Typography variant="caption" color="textSecondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>Total Commission</Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                gap: 2, 
                mb: 3, 
                p: 2, 
                bgcolor: isDarkMode ? 'rgba(0, 188, 212, 0.05)' : '#F0FDFA', 
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                alignItems: { xs: 'stretch', sm: 'center' }
            }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: '6px', 
                  bgcolor: theme.palette.background.paper, 
                  overflow: 'hidden', 
                  flex: { xs: '1 1 auto', sm: '0 0 auto' } 
                }}>
                    <Box sx={{ px: 2, py: 1, bgcolor: isDarkMode ? 'rgba(0, 188, 212, 0.1)' : '#E0F2FE', borderRight: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" fontWeight="700" color="textPrimary">Year</Typography>
                    </Box>
                    <Select 
                        size="small" 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        sx={{ '& fieldset': { border: 'none' }, minWidth: { xs: '100%', sm: 100 }, flexGrow: 1, fontWeight: 700 }}
                    >
                        <MenuItem value="2026">2026</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: '6px', 
                  bgcolor: theme.palette.background.paper, 
                  overflow: 'hidden', 
                  flex: { xs: '1 1 auto', sm: '0 0 auto' } 
                }}>
                    <Box sx={{ px: 2, py: 1, bgcolor: isDarkMode ? 'rgba(0, 188, 212, 0.1)' : '#E0F2FE', borderRight: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" fontWeight="700" color="textPrimary">Select</Typography>
                    </Box>
                    <Select 
                        size="small" 
                        value={option} 
                        onChange={(e) => setOption(e.target.value)}
                        sx={{ '& fieldset': { border: 'none' }, minWidth: { xs: '100%', sm: 180 }, flexGrow: 1, fontWeight: 700 }}
                        displayEmpty
                    >
                        <MenuItem value="All">Transaction option</MenuItem>
                    </Select>
                </Box>
                <PrimaryButton sx={{ height: 'fit-content', minHeight: '40px' }}>Filter</PrimaryButton>

                <Box sx={{ ml: { sm: 'auto' }, display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                    <Typography variant="subtitle1" fontWeight="700" color="textSecondary">Total Transaction Value</Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 9}}>
                    <Box sx={{ 
                      p: 2, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: '12px', 
                      bgcolor: theme.palette.background.paper 
                    }}>
                        <Chart options={chartOptions} series={chartSeries} type="bar" height={400} />
                    </Box>
                </Grid>
                <Grid size={{xs: 12, md: 3}}>
                    <SideStat label="Today" value="7,000,234.00" />
                    <SideStat label="This Week" value="7,000,234.00" />
                    <SideStat label="This Month" value="7,000,234.00" />
                    <SideStat label="This Year" value="7,000,234.00" />
                </Grid>
            </Grid>
        </StandardModal>
    );
};

export default TotalTransactionModal;
