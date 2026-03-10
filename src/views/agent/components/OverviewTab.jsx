import React, { useState } from 'react';
import { 
    Grid, Card, Box, Typography, Stack, MenuItem, Select, FormControl, 
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Avatar, Chip, IconButton, Button,
    Menu, ListItemIcon, ListItemText, Divider, useTheme
} from '@mui/material';
import Chart from 'react-apexcharts';
import { IconFilter, IconChartBar, IconHelpCircle, IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';

const OverviewTab = ({ data }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
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
            labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px' } }
        },
        yaxis: { 
            labels: { 
                style: { colors: theme.palette.text.secondary, fontSize: '12px' },
                formatter: (val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}K`
            }
        },
        fill: { opacity: 1, colors: [theme.palette.primary.main] },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
        tooltip: { theme: isDarkMode ? 'dark' : 'light', y: { formatter: (val) => `# ${val.toLocaleString()}` } },
        grid: { borderColor: theme.palette.divider, strokeDashArray: 4 }
    };

    const revenueSeries = [{ name: 'Transaction', data: data.revenueData.map(d => d.revenue) }];

    const planOptions = {
        chart: { type: 'donut', fontFamily: "'DM Sans', sans-serif", background: 'transparent' },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
        labels: data.planDistribution.map(d => d.label),
        colors: ['#A855F7', '#EC4899', '#3B82F6'], 
        legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600, labels: { colors: theme.palette.text.secondary } },
        dataLabels: { 
            enabled: true,
            formatter: function (val) {
                return val.toFixed(0) + "%"
            },
            style: {
                fontSize: '12px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                colors: ['#fff']
            },
            dropShadow: { enabled: false }
        },
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
                            color: theme.palette.text.secondary,
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
        <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: isDarkMode ? 'transparent' : '#F8FAFC' }}>
            {/* Year Filter */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', maxWidth: { xs: '100%', sm: 200 }, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
                <Box sx={{ bgcolor: isDarkMode ? theme.palette.action.hover : '#EEF2FF', px: 2, py: 1, borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" fontWeight="800" color="primary" sx={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        Year
                    </Typography>
                </Box>
                <Select 
                    fullWidth
                    value="2026" 
                    size="small" 
                    sx={{ 
                        '& fieldset': { border: 'none' },
                        fontSize: '14px', 
                        fontWeight: 700,
                        '& .MuiSelect-select': { py: 0.5, pl: 1.5 }
                    }}
                >
                    <MenuItem value="2026">2026</MenuItem>
                </Select>
            </Box>

            <Grid container spacing={3}>
                {/* Column 1: Transaction Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 3, borderRadius: '12px', height: '100%', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, boxShadow: 'none' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.text.primary }}>Transaction</Typography>
                            <Button size="small" variant="outlined" startIcon={<IconFilter size={16} />} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: theme.palette.divider, color: theme.palette.text.secondary, fontWeight: 600 }}>
                                Filter by Date
                            </Button>
                        </Stack>
                        <Chart options={revenueOptions} series={revenueSeries} type="bar" height={320} width="100%" />
                    </Card>
                </Grid>

                {/* Column 2: Plan Distribution & Credit Facilities */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Stack spacing={3} sx={{ height: '100%' }}>
                        {/* Credit Facilities Card */}
                        <Card sx={{ borderRadius: '8px', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.paper }}>
                            {/* Header Section */}
                            <Box sx={{ px: 2, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '14px', letterSpacing: '0.2px' }}>Credit Facilities</Typography>
                                </Box>
                                <Box sx={{ p: 0.6, bgcolor: isDarkMode ? theme.palette.grey[800] : '#545454', borderRadius: '4px', display: 'flex', color: 'white' }}>
                                    <IconChartBar size={18} strokeWidth={2.5} />
                                </Box>
                            </Box>
                            <Divider sx={{ borderColor: theme.palette.divider, opacity: 0.6 }} />
                            
                            {/* Content Section */}
                            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5 }}>
                                <Box sx={{ 
                                    flex: 1.8, 
                                    bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#DEE5F6', 
                                    borderRadius: '4px', 
                                    p: 2, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center',
                                    height: '100px',
                                    minWidth: 0
                                }}>
                                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.text.primary, mb: 1, fontSize: '12px', letterSpacing: '0.1px' }}>Total Credit</Typography>
                                    <Typography fontWeight={800} sx={{ color: theme.palette.text.primary, fontSize: '18px', lineHeight: 1 }}># 100,000,000,000</Typography>
                                </Box>
                                <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography fontWeight={800} sx={{ color: theme.palette.text.primary, fontSize: '28px', lineHeight: 1 }}>1,000</Typography>
                                    <Typography sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '14px', mt: 0.5 }}>Schools</Typography>
                                </Box>
                            </Box>
                        </Card>
                        <Card sx={{ p: 3, borderRadius: '12px', flex: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, boxShadow: 'none' }}>
                            <Typography variant="subtitle2" fontWeight={800} color="textPrimary" mb={2}>Plan Distribution</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Chart options={planOptions} series={planSeries} type="donut" height={240} />
                            </Box>
                        </Card>
                    </Stack>
                </Grid>

                {/* Column 3: Recent Onboarding School */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ borderRadius: '12px', height: '100%', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: isDarkMode ? theme.palette.action.hover : '#EEF2FF', p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="subtitle2" fontWeight={800} color="textPrimary">Recent Onboarding School</Typography>
                        </Box>
                        <TableContainer sx={{ height: 'calc(100% - 60px)' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: theme.palette.text.secondary }}>School</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: theme.palette.text.secondary }}>Agent</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: theme.palette.text.secondary }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '11px', color: theme.palette.text.secondary }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.recentOnboarding.map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' }, '& td': { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="caption" fontWeight={800} sx={{ color: theme.palette.text.primary, fontSize: '11px' }}>{row.school}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={800} sx={{ color: theme.palette.text.primary, fontSize: '10px', display: 'block' }}>{row.agent}</Typography>
                                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '9px' }}>{row.handle}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip label={row.created_at} size="small" sx={{ height: 18, fontSize: '9px', fontWeight: 700, bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7', color: isDarkMode ? '#4ade80' : '#166534' }} />
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                                    <IconDotsVertical size={16} color={theme.palette.text.secondary} />
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
                    <Card sx={{ borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="subtitle1" fontWeight={800} color="textPrimary">TOP 10 AGENT</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#EAFDF6' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>S/N</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Location</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Level</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Transaction</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.topAgents.map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' } }}>
                                            <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{idx + 1}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32 }} />
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={800} sx={{ color: theme.palette.text.primary }}>{row.name}</Typography>
                                                        <Typography variant="caption" display="block" sx={{ color: theme.palette.text.secondary, fontSize: '10px' }}>{row.handle}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={700} color="textPrimary">{row.location}</Typography></TableCell>
                                            <TableCell>
                                                <Box sx={{ bgcolor: isDarkMode ? 'rgba(250, 204, 21, 0.2)' : '#FEF9C3', color: isDarkMode ? '#fde047' : '#854D0E', borderRadius: '4px', px: 1, py: 0.2, textAlign: 'center', width: 'fit-content', fontSize: '11px', fontWeight: 800 }}>
                                                    {row.level}
                                                </Box>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={800} color="textPrimary"># {row.transaction}</Typography></TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                                    <IconDotsVertical size={18} color={theme.palette.text.secondary} />
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
                    <Card sx={{ borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, boxShadow: 'none', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={800} color="textPrimary">TOP REVENUE BY SCHOOLS</Typography>
                            <IconChartBar size={20} color={theme.palette.text.secondary} />
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#EAFDF6' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>S/N</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>School Name</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Agent detail</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Transaction</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontSize: '12px', color: theme.palette.text.primary }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.topRevenueSchools.map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' } }}>
                                            <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{idx + 1}</TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={800} color="textPrimary">{row.school}</Typography></TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32 }} />
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={800} sx={{ color: theme.palette.text.primary }}>{row.agent}</Typography>
                                                        <Typography variant="caption" display="block" sx={{ color: theme.palette.text.secondary, fontSize: '10px' }}>{row.handle}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={800} color="textPrimary"># {row.transaction}</Typography></TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                                    <IconDotsVertical size={18} color={theme.palette.text.secondary} />
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
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.shadows[3],
                        minWidth: 150,
                        '& .MuiMenuItem-root': {
                            fontSize: '14px',
                            fontWeight: 600,
                            color: theme.palette.text.secondary,
                            py: 1,
                            px: 2,
                            '&:hover': { bgcolor: isDarkMode ? theme.palette.action.hover : '#F8FAFC', color: theme.palette.primary.main }
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
                <MenuItem onClick={handleMenuClose} sx={{ color: `${theme.palette.error.main} !important` }}>
                    <ListItemIcon sx={{ color: theme.palette.error.main }}><IconTrash size={18} /></ListItemIcon>
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
