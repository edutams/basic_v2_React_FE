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
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    expected_amount: '29,561,650',
    settled_amount: '0',
    outstanding_amount: '329,561,65',
    outstanding_trns: '98636',
  },
  {
    id: 2,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    expected_amount: '29,561,650',
    settled_amount: '0',
    outstanding_amount: '329,561,65',
    outstanding_trns: '0',
  },
  {
    id: 3,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    expected_amount: '29,561,650',
    settled_amount: '0',
    outstanding_amount: '329,561,65',
    outstanding_trns: '0',
  },
  {
    id: 4,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    expected_amount: '29,561,650',
    settled_amount: '0',
    outstanding_amount: '329,561,65',
    outstanding_trns: '490000',
  },
  {
    id: 5,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    expected_amount: '29,561,650',
    settled_amount: '0',
    outstanding_amount: '329,561,65',
    outstanding_trns: '87553535',
  },
  {
    id: 6,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    expected_amount: '29,561,650',
    settled_amount: '0',
    outstanding_amount: '329,561,65',
    outstanding_trns: '0',
  },
];

export const transactionStatusData = {
  title: 'Total Transaction Value',
  items: [
    {
      label: 'Revenue',
      value: '₦7,000,234.00',
      color: '#4DA3F5',
      bgColor: '#EAF4FF',
      icon: 'revenue',
    },
    {
      label: 'Settlement',
      value: '₦7,000,234.00',
      color: '#E95A71',
      bgColor: '#FDF1F3',
      icon: 'settlement',
    },
    {
      label: 'Balance',
      value: '₦7,000,234.00',
      color: '#6BC68D',
      bgColor: '#EEF9F2',
      icon: 'balance',
    },
    {
      label: 'Wallet',
      value: '₦7,000,234.00',
      color: '#3247C6',
      bgColor: '#EEF0FF',
      icon: 'wallet',
    },
  ],
};

const SettlementReconcillation = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState('Settlement Recon.');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState({
    categories: [
      'School (Tuition) Fees',
      'School (Tuition) Fees',
      'School (Tuition) Fees',
      'School (Tuition) Fees',
      'School (Tuition) Fees',
      'School (Tuition) Fees',
    ],
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

  return (
    <PageContainer title="Settlement Reconciliation">
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
            <Typography variant="h5">Settlement Reconciliation</Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <Button variant="contained" size="small" startIcon={<DownloadIcon />}
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
            <Button variant="contained" size="small" fullWidth sx={{ height: '40px' }}>
              Fetch
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Revenue Code</TableCell>
                <TableCell>Revenue name</TableCell>
                <TableCell> No of Transaction</TableCell>
                <TableCell>Expected Amount(₦)</TableCell>
                <TableCell>Settled Amount(₦)</TableCell>
                <TableCell>Outstanding Balance(₦)</TableCell>
                <TableCell>Outstanding Transactions</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {dummyData.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>{row.rev_code}</TableCell>
                  <TableCell>{row.rev_name}</TableCell>
                  <TableCell>{row.no_of_trns}</TableCell>
                  <TableCell>{row.expected_amount}</TableCell>
                  <TableCell>{row.settled_amount}</TableCell>
                  <TableCell>{row.outstanding_amount}</TableCell>
                  <TableCell>{row.outstanding_trns}</TableCell>

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
            View Transactions
          </MenuItem>
        </Menu>
      </ParentCard>
    </PageContainer>
  );
};

export default SettlementReconcillation;
