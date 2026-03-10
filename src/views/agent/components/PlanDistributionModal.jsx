import React from 'react';
import {
    Grid,
    Box,
    Typography,
    Stack,
    Card,
    useTheme
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const PlanDistributionModal = ({ open, onClose }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const chartOptions = {
        chart: {
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent'
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light'
        },
        labels: ['Basic Plan', 'Standard Plan', 'Premium Plan'],
        colors: ['#00ACFF', '#22C55E', '#FACC15'],
        legend: {
            position: 'bottom',
            fontFamily: 'inherit',
            labels: { colors: theme.palette.text.secondary },
            markers: { radius: 12 }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(1)}%`,
            style: {
                fontSize: '14px',
                fontWeight: '700',
                colors: ['#fff']
            },
            dropShadow: { enabled: false }
        },
        stroke: { show: false },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '14px', fontWeight: 600, color: theme.palette.text.secondary },
                        value: { show: true, fontSize: '20px', fontWeight: 700, color: theme.palette.text.primary },
                        total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 600, color: theme.palette.text.secondary }
                    }
                }
            }
        }
    };

    const chartSeries = [120, 310, 270]; // Example counts for percentages

    const PlanCard = ({ title, count, color, percentage }) => (
        <Card sx={{ 
            p: 2.5, 
            bgcolor: theme.palette.background.paper, 
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            borderRadius: '12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>
            <Typography variant="body2" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase' }}>{title}</Typography>
            <Typography variant="h4" fontWeight="800" sx={{ color: color }}>{count}</Typography>
            <Box sx={{ 
                px: 1.5, 
                py: 0.5, 
                bgcolor: `${color}15`, 
                color: color, 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 700, 
                width: 'fit-content', 
                mx: 'auto' 
            }}>
                {percentage}% of Users
            </Box>
        </Card>
    );

    return (
        <StandardModal
            open={open}
            onClose={onClose}
            title="Plan Distribution"
            maxWidth="md"
            padding={3}
            dividers={false}
            headerBg={isDarkMode ? theme.palette.background.paper : '#F8FAFC'}
            sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' }}
            actions={
                <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                    <PrimaryButton variant="secondary" onClick={onClose}>Close</PrimaryButton>
                    <PrimaryButton variant="primary" onClick={onClose}>Download Report</PrimaryButton>
                </Stack>
            }
        >
            <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ 
                        p: 2, 
                        border: `1px solid ${theme.palette.divider}`, 
                        borderRadius: '16px', 
                        bgcolor: theme.palette.background.paper,
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Chart options={chartOptions} series={chartSeries} type="donut" height={350} width="100%" />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                        <PlanCard title="Basic Plan" count="120" color="#00ACFF" percentage="17.1" />
                        <PlanCard title="Standard Plan" count="310" color="#22C55E" percentage="44.3" />
                        <PlanCard title="Premium Plan" count="270" color="#FACC15" percentage="38.6" />
                    </Stack>
                </Grid>
            </Grid>

            {/* Summary Box */}
            <Box sx={{ 
                mt: 4, 
                p: 3, 
                bgcolor: isDarkMode ? 'rgba(0, 172, 255, 0.05)' : '#E0F2FE', 
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? 'rgba(0, 172, 255, 0.2)' : '#BAE6FD'}`
            }}>
                <Typography variant="subtitle1" fontWeight="800" color={isDarkMode ? theme.palette.info.light : '#0369A1'} mb={1} sx={{ textTransform: 'uppercase' }}>
                    Distribution Insights
                </Typography>
                <Typography variant="body2" color="textSecondary" lineHeight={1.6}>
                    The **Standard Plan** is currently the most popular among your schools, accounting for over 44% of total subscriptions. 
                    Consider offering incentives for users to upgrade to the **Premium Plan** to increase your commission earnings.
                </Typography>
            </Box>
        </StandardModal>
    );
};

export default PlanDistributionModal;
