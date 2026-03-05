
import React, { useState } from 'react';
import { 
    Grid, Card, Box, Typography, Stack, MenuItem, Select, FormControl, 
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Avatar, Chip, IconButton, Button,
    Menu, ListItemIcon, ListItemText
} from '@mui/material';
import Chart from 'react-apexcharts';
import { IconFilter, IconChartBar, IconHelpCircle, IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';

const OverviewTab = ({ data }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const revenueOptions = {
        chart: { type: 'bar', toolbar: { show: false }, stacked: false, fontFamily: "'DM Sans', sans-serif" },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: { 
            categories: data.revenueData.map(d => d.month),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#64748B', fontSize: '12px' } }
        },
        yaxis: { 
            labels: { 
                style: { colors: '#64748B', fontSize: '12px' },
                formatter: (val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}K`
            }
        },
        fill: { opacity: 1, colors: ['#00B4FF'] },
        tooltip: { y: { formatter: (val) => `# ${val.toLocaleString()}` } },
        grid: { borderColor: '#F1F5F9', strokeDashArray: 4 }
    };

    const revenueSeries = [{ name: 'Transaction', data: data.revenueData.map(d => d.revenue) }];

    const planOptions = {
        chart: { type: 'donut', fontFamily: "'DM Sans', sans-serif" },
        labels: data.planDistribution.map(d => d.label),
        colors: ['#A855F7', '#EC4899', '#3B82F6'], // Matching mockup colors
        legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600, labels: { colors: '#64748B' } },
        dataLabels: { enabled: false },
        plotOptions: { 
            pie: { 
                donut: { 
                    size: '75%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            fontWeight: 700,
                            color: '#64748B',
                            formatter: () => '100%'
                        }
                    }
                } 
            } 
        },
        stroke: { show: false }
    };
    const planSeries = data.planDistribution.map(d => d.value);

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: '#F8FAFC' }}>
            {/* Year Filter */}
            <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: '8px', border: '1px solid #E2E8F0', mb: 3, display: 'inline-block' }}>
                <Stack direction="row" spacing={0} alignItems="center">
                    <Box sx={{ bgcolor: '#F1F5F9', px: 2, py: 0.8, borderRadius: '4px 0 0 4px', borderRight: '1px solid #E2E8F0' }}>
                        <Typography variant="caption" fontWeight={700} color="#64748B">year</Typography>
                    </Box>
                    <Select 
                        value="2026" 
                        size="small" 
                        variant="standard"
                        disableUnderline
                        sx={{ px: 2, py: 0.8, bgcolor: 'white', borderRadius: '0 4px 4px 0', minWidth: 100, fontSize: '14px', fontWeight: 700 }}
                    >
                        <MenuItem value="2026">2026</MenuItem>
                    </Select>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Column 1: Transaction Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 3, borderRadius: '12px', height: '100%', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h6" fontWeight={800} color="#1E293B">Transaction</Typography>
                            <Button size="small" variant="outlined" startIcon={<IconFilter size={16} />} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#E2E8F0', color: '#64748B', fontWeight: 600 }}>
                                Filter by Date
                            </Button>
                        </Stack>
                        <Chart options={revenueOptions} series={revenueSeries} type="bar" height={320} />
                    </Card>
                </Grid>

                {/* Column 2: Login Activities & Plan Distribution */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Stack spacing={3} sx={{ height: '100%' }}>
                        <Card sx={{ p: 3, borderRadius: '12px', flex: 1, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="subtitle2" fontWeight={800} color="#1E293B">Login Activities</Typography>
                                <IconChartBar size={18} color="#64748B" />
                            </Stack>
                            <Stack spacing={1.5}>
                                {Object.entries(data.loginActivities).map(([key, val]) => (
                                    <Box key={key} display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" sx={{ textTransform: 'capitalize', color: '#475569', fontWeight: 700, fontSize: '13px' }}>{key}:</Typography>
                                        <Typography variant="body2" fontWeight={800} color="#EF4444">{val}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Card>
                        <Card sx={{ p: 3, borderRadius: '12px', flex: 1.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                            <Typography variant="subtitle2" fontWeight={800} color="#1E293B" mb={2}>Plan Distribution</Typography>
                            <Chart options={planOptions} series={planSeries} type="donut" height={240} />
                        </Card>
                    </Stack>
                </Grid>

                {/* Column 3: Recent Onboarding School */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ borderRadius: '12px', height: '100%', border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: '#EEF2FF', p: 2, borderBottom: '1px solid #E2E8F0' }}>
                            <Typography variant="subtitle2" fontWeight={800} color="#1E293B">Recent Onboarding School</Typography>
                        </Box>
                        <TableContainer sx={{ height: 'calc(100% - 60px)' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: '#64748B' }}>School</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: '#64748B' }}>Agent</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: '#64748B' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: '#64748B' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.recentOnboarding.map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' }, '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="caption" fontWeight={800} sx={{ color: '#1E293B', fontSize: '11px' }}>{row.school}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={800} sx={{ color: '#1E293B', fontSize: '10px', display: 'block' }}>{row.agent}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '9px' }}>{row.handle}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip label={row.created_at} size="small" sx={{ height: 18, fontSize: '9px', fontWeight: 700, bgcolor: '#DCFCE7', color: '#166534' }} />
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                                    <IconDotsVertical size={16} color="#64748B" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>

                {/* Bottom Row: Summaries */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0' }}>
                            <Typography variant="subtitle1" fontWeight={800} color="#1E293B">TOP 10 AGENT</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#EAFDF6' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>S/N</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Location</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Level</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Transaction</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.topAgents.map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' } }}>
                                            <TableCell sx={{ fontWeight: 700 }}>{idx + 1}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32 }} />
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={800} sx={{ color: '#1E293B' }}>{row.name}</Typography>
                                                        <Typography variant="caption" display="block" sx={{ color: '#64748B', fontSize: '10px' }}>{row.handle}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={700} color="#1E293B">{row.location}</Typography></TableCell>
                                            <TableCell>
                                                <Box sx={{ bgcolor: '#FEF9C3', color: '#854D0E', borderRadius: '4px', px: 1, py: 0.2, textAlign: 'center', width: 'fit-content', fontSize: '11px', fontWeight: 800 }}>
                                                    {row.level}
                                                </Box>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={800} color="#1E293B"># {row.transaction}</Typography></TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                                    <IconDotsVertical size={18} color="#64748B" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={800} color="#1E293B">TOP REVENUE BY SCHOOLS</Typography>
                            <IconChartBar size={20} color="#475569" />
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#EAFDF6' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>S/N</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>School Name</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Agent detail</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Transaction</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.topRevenueSchools.map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' } }}>
                                            <TableCell sx={{ fontWeight: 700 }}>{idx + 1}</TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={800} color="#1E293B">{row.school}</Typography></TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32 }} />
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={800} sx={{ color: '#1E293B' }}>{row.agent}</Typography>
                                                        <Typography variant="caption" display="block" sx={{ color: '#64748B', fontSize: '10px' }}>{row.handle}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={800} color="#1E293B"># {row.transaction}</Typography></TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                                    <IconDotsVertical size={18} color="#64748B" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>
            </Grid>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        minWidth: 150,
                        '& .MuiMenuItem-root': {
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#475569',
                            py: 1,
                            px: 2,
                            '&:hover': { bgcolor: '#F8FAFC', color: '#00B4FF' }
                        }
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon><IconEye size={18} /></ListItemIcon>
                    <ListItemText primary="View Detail" />
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon><IconEdit size={18} /></ListItemIcon>
                    <ListItemText primary="Edit Record" />
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: '#EF4444 !important' }}>
                    <ListItemIcon sx={{ color: '#EF4444' }}><IconTrash size={18} /></ListItemIcon>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>

            {/* Help FAB */}
            <IconButton 
                sx={{ 
                    position: 'fixed', 
                    bottom: 24, 
                    right: 24, 
                    bgcolor: '#22C55E', 
                    color: 'white',
                    width: 56,
                    height: 56,
                    boxShadow: '0 8px 16px rgba(34, 197, 94, 0.4)',
                    '&:hover': { bgcolor: '#16A34A', boxShadow: '0 12px 20px rgba(34, 197, 94, 0.5)' }
                }}
            >
                <IconHelpCircle size={32} />
            </IconButton>
        </Box>
    );
};

export default OverviewTab;
