import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    Card,
    CardContent,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    InputAdornment,
    TextField,
    InputLabel,
    Avatar,
    Menu,
    useTheme,
    Tabs,
    Tab,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    FilterList as FilterListIcon,
    Search as SearchIcon,
    Download as DownloadIcon,
    Visibility as VisibilityIcon,
    Print as PrintIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import { IconDotsVertical, IconEye, IconEdit } from '@tabler/icons-react';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import FeeChart from './FeeChart';
const dummyData = [
    {
        id: 1,
        transactionId: 'TRX-20260604-001',
        paidBy: 'John Doe',
        avatar: 'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
        description: 'School Fees Payment',
        amount: '₦50,000',
        date: '04 Jun 2026',
        status: 'Successful',
        class: 'JSS1',

    },
    {
        id: 2,
        transactionId: 'TRX-20260604-002',
        paidBy: 'Mary Johnson',
        avatar: 'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
        description: 'Hostel Accommodation Fee',
        amount: '₦80,000',
        date: '03 Jun 2026',
        status: 'Successful',
        class: 'JSS1',

    },
    {
        id: 3,
        transactionId: 'TRX-20260604-003',
        paidBy: 'David Williams',
        avatar: 'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
        description: 'Examination Fee',
        amount: '₦15,000',
        date: '02 Jun 2026',
        status: 'Pending',
        class: 'JSS1',

    },
    {
        id: 4,
        transactionId: 'TRX-20260604-004',
        paidBy: 'Sarah Brown',
        avatar: 'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
        description: 'PTA Levy Payment',
        amount: '₦10,000',
        date: '01 Jun 2026',
        status: 'Successful',
        class: 'JSS1',

    },
    {
        id: 5,
        transactionId: 'TRX-20260604-005',
        paidBy: 'Michael Adams',
        avatar: 'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
        description: 'Library Fee',
        amount: '₦5,000',
        date: '31 May 2026',
        status: 'Failed',
        class: 'JSS1',
    },
    {
        id: 6,
        transactionId: 'TRX-20260604-006',
        paidBy: 'Grace Wilson',
        avatar: 'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
        description: 'Transport Fee',
        amount: '₦25,000',
        date: '30 May 2026',
        status: 'Refunded',
        class: 'JSS1',

    },
];

export const transactionStatusData = {
    title: 'Distribution',
    items: [
        {
            label: 'Successful',
            value: 68,
            color: '#16A34A',
        },
        {
            label: 'Pending',
            value: 24,
            color: '#D97706',
        },
        {
            label: 'Declined',
            value: 8,
            color: '#DC2626',
        },
    ],
    metrics: [
        {
            label: 'AVG TICKET',
            value: '₦8,420',
            color: '#111827',
        },
        {
            label: 'SUCCESS RATE',
            value: '94.2%',
            color: '#16A34A',
        },
    ],
};



const Overview = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [chartTitle, setChartTitle] = useState('Transaction Overview');
    const [chartType, setChartType] = useState('bar');
    const [activeTab, setActiveTab] = useState(0);
    const [chartData, setChartData] = useState({
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
            {
                name: 'Transactions',
                data: [500000, 1000000, 1500000, 2000000, 2500000, 3000000],
            },
        ],
    });
    const buildChartOptions = (categories) => ({
        chart: {
            type: chartType,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
            },
            fontFamily: 'inherit',
            foreColor: isDark ? '#aaa' : '#64748B',
        },

        title: {
            text: chartTitle,
            align: 'left',
            style: {
                fontSize: '16px',
                fontWeight: 600,
            },
        },

        legend: {
            position: 'top',
            horizontalAlign: 'right',
        },

        colors: ['#3949AB'],

        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '45%',
                distributed: false,
            },
        },

        dataLabels: {
            enabled: false,
        },

        stroke: {
            width: 0,
        },

        xaxis: {
            categories,
            labels: {
                style: {
                    colors: isDark ? '#aaa' : '#64748B',
                    fontSize: '12px',
                },
            },
        },

        yaxis: {
            labels: {
                formatter: (val) => {
                    if (val >= 1000000) {
                        return `₦${(val / 1000000).toFixed(1)}M`;
                    }

                    if (val >= 1000) {
                        return `₦${(val / 1000).toFixed(0)}K`;
                    }

                    return `₦${val}`;
                },
            },
        },

        grid: {
            borderColor: isDark ? '#333' : '#F1F5F9',
            strokeDashArray: 5,
        },

        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: (val) => `₦${val.toLocaleString()}`,
            },
        },
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeRow, setActiveRow] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Filter data based on active tab
    const getFilteredData = () => {
        if (activeTab === 0) return dummyData; // All
        if (activeTab === 1) return dummyData.filter(item => item.status === 'Successful');
        if (activeTab === 2) return dummyData.filter(item => item.status === 'Pending');
        if (activeTab === 3) return dummyData.filter(item => item.status === 'Failed' || item.status === 'Refunded');
        return dummyData;
    };

    const filteredData = getFilteredData();


    return (
        <PageContainer title="Online Transaction">
            <FeeChart
                title={chartTitle}
                chartType={chartType}
                chartOptions={buildChartOptions(chartData?.categories || [])}
                chartSeries={chartData?.series || []}
                statusData={transactionStatusData}
            />
            <ParentCard
                title={
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: { xs: 'flex-start', md: 'center' },
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            gap: 2,
                        }}
                    >
                        <Typography variant="h5">Transaction Overview</Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                flexWrap: 'wrap',
                                width: { xs: '100%', md: 'auto' },
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                size="small"
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                Download CSV Format
                            </Button>
                        </Box>
                    </Box>
                }
            >
                <Grid container spacing={3} sx={{ mb: 3, mt: 3 }} alignItems="center">

                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="From"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="To"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Session</InputLabel>
                            <Select label="Session">
                                <MenuItem value="">-- All session --</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel>Term</InputLabel>
                            <Select label="Session">
                                <MenuItem value="">-- All Term --</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>



                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            placeholder="Search by name"
                            size="small"
                            fullWidth
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 1 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ height: '40px' }}
                        >
                            Fetch
                        </Button>
                    </Grid>

                </Grid>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="transaction status tabs"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '14px',
                            },
                        }}
                    >
                        <Tab label={`All (${dummyData.length})`} />
                        <Tab label={`Successful (${dummyData.filter(d => d.status === 'Successful').length})`} />
                        <Tab label={`Pending (${dummyData.filter(d => d.status === 'Pending').length})`} />
                        <Tab label={`Declined (${dummyData.filter(d => d.status === 'Failed' || d.status === 'Refunded').length})`} />
                    </Tabs>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    <Table>
                        <TableHead sx={{ bgcolor: '#fafafa' }}>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>TransactionId</TableCell>
                                <TableCell>Paid By</TableCell>
                                <TableCell> Description</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredData.map((row, index) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{index + 1}</TableCell>

                                    <TableCell>{row.transactionId}</TableCell>

                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar
                                                src={row.avatar}
                                                alt={row.paidBy}
                                                sx={{ width: 36, height: 36 }}
                                            />

                                            <Box>

                                                <Typography variant="body2" fontWeight={600}>
                                                    {row.paidBy}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary">
                                                    {row.class}
                                                </Typography>
                                            </Box>

                                        </Box>
                                    </TableCell>

                                    <TableCell>{row.description}</TableCell>
                                    <TableCell>{row.amount}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>


                                        <Chip
                                            label={row.status}
                                            size="small"
                                            color={
                                                row.status === 'Successful'
                                                    ? 'success'
                                                    : row.status === 'Pending'
                                                        ? 'warning'
                                                        : row.status === 'Failed'
                                                            ? 'error'
                                                            : 'info'
                                            }
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setAnchorEl(e.currentTarget);
                                                setActiveRow(row);
                                            }}
                                        >
                                            <IconDotsVertical size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { borderRadius: 2, minWidth: 190 } }}
                >
                    <MenuItem
                        onClick={() => {
                            setAnchorEl(null);
                        }}
                    >
                        <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                       Check Status
                    </MenuItem>
                </Menu>



            </ParentCard>
        </PageContainer >
    );
};

export default Overview;
