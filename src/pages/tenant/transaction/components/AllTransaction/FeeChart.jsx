import React, { useState } from 'react';
import { Grid, Box, Typography, Button, useTheme, TableContainer, TableRow, TableHead, Table, TableCell, TableBody, FormControl, Select, MenuItem } from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import { IconDownload } from '@tabler/icons';
import StatusBreakdownCard from './StatusBreakdownCard';

const FeeChart = ({
    open,
    onClose,
    title = 'Chart',
    chartOptions,
    chartSeries,
    buttonLabel = 'Download CSV',
    chartType = 'bar',
    onDurationChange,
    statusData
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [selectedDuration, setSelectedDuration] = useState('monthly');

    const handleDurationChange = (event) => {
        const newDuration = event.target.value;
        setSelectedDuration(newDuration);
        if (onDurationChange) {
            onDurationChange(newDuration);
        }
    };


    return (
        <Grid container spacing={2} mt={3} mb={3}>
            {/* Chart */}
            <Grid size={{ xs: 12, md: 7 }}>
                <Box
                    sx={{
                        border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
                        borderRadius: '10px',
                        bgcolor: isDark ? '#1e1e1e' : 'white',
                        p: 2,
                    }}
                >
                    {/* Duration Dropdown Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>
                            {title || 'Transaction Chart'}
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={selectedDuration}
                                onChange={handleDurationChange}
                                sx={{
                                    bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isDark ? '#444' : '#e0e0e0',
                                    },
                                }}
                            >
                                <MenuItem value="daily">Daily</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="quarterly">Quarterly</MenuItem>
                                <MenuItem value="yearly">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type={chartType}
                        height={320}
                    />
                </Box>
            </Grid>

            {/* Side Panel */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Box
                    sx={{
                        border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
                        borderRadius: '10px',
                        bgcolor: isDark ? theme.palette.background.paper : '#fff',
                        p: 2,
                        height: '100%',
                    }}
                >
                    {/* Header row */}
                  <StatusBreakdownCard
                            title={statusData?.title}
                            items={statusData?.items}
                            metrics={statusData?.metrics}
                        />


                </Box>
            </Grid>
        </Grid>
    );
};

export default FeeChart;