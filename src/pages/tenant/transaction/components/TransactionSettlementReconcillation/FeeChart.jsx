import React, { useState } from 'react';
import { Grid, Box, Typography, Button, useTheme, TableContainer, TableRow, TableHead, Table, TableCell, TableBody, FormControl, Select, MenuItem, TextField } from '@mui/material';
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
    onSessionChange,
    onTermChange,
    onFromDateChange,
    onToDateChange,
    statusData
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [selectedDuration, setSelectedDuration] = useState('monthly');
    const [selectedSession, setSelectedSession] = useState('2025/2026');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleDurationChange = (event) => {
        const newDuration = event.target.value;
        setSelectedDuration(newDuration);
        if (onDurationChange) {
            onDurationChange(newDuration);
        }
    };

    const handleSessionChange = (event) => {
        const newSession = event.target.value;
        setSelectedSession(newSession);
        if (onSessionChange) {
            onSessionChange(newSession);
        }
    };

    const handleTermChange = (event) => {
        const newTerm = event.target.value;
        setSelectedTerm(newTerm);
        if (onTermChange) {
            onTermChange(newTerm);
        }
    };

    const handleFromDateChange = (event) => {
        const newDate = event.target.value;
        setFromDate(newDate);
        if (onFromDateChange) {
            onFromDateChange(newDate);
        }
    };

    const handleToDateChange = (event) => {
        const newDate = event.target.value;
        setToDate(newDate);
        if (onToDateChange) {
            onToDateChange(newDate);
        }
    };


    return (
        <Grid container spacing={2} mt={3} mb={3}>
            {/* Chart */}
            <Grid size={{ xs: 12, md: 9 }}>
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
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>
                            {title || 'Transaction Chart'}
                        </Typography>

                        {/* Filters Row */}
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            {/* From Date Filter */}
                            <TextField
                                size="small"
                                type="date"
                                label="From"
                                value={fromDate}
                                onChange={handleFromDateChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    minWidth: 150,
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        '& fieldset': {
                                            borderColor: isDark ? '#444' : '#e0e0e0',
                                        },
                                    },
                                }}
                            />

                            {/* To Date Filter */}
                            <TextField
                                size="small"
                                type="date"
                                label="To"
                                value={toDate}
                                onChange={handleToDateChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    minWidth: 150,
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        '& fieldset': {
                                            borderColor: isDark ? '#444' : '#e0e0e0',
                                        },
                                    },
                                }}
                            />

                            {/* Duration Filter */}
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

                            {/* Session Filter */}
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <Select
                                    value={selectedSession}
                                    onChange={handleSessionChange}
                                    sx={{
                                        bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isDark ? '#444' : '#e0e0e0',
                                        },
                                    }}
                                >
                                    <MenuItem value="2025/2026">2025/2026</MenuItem>
                                    <MenuItem value="2024/2025">2024/2025</MenuItem>
                                    <MenuItem value="2023/2024">2023/2024</MenuItem>
                                    <MenuItem value="2022/2023">2022/2023</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Term Filter */}
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={selectedTerm}
                                    onChange={handleTermChange}
                                    sx={{
                                        bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isDark ? '#444' : '#e0e0e0',
                                        },
                                    }}
                                >
                                    <MenuItem value="First Term">First Term</MenuItem>
                                    <MenuItem value="Second Term">Second Term</MenuItem>
                                    <MenuItem value="Third Term">Third Term</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
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
            <Grid size={{ xs: 12, md: 3 }}>
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