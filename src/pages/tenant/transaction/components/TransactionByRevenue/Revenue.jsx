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
    amount: '29,561,650',
    category: 'optional',
  },
  {
    id: 2,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    category: 'compulsory',
  },
  {
    id: 3,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    category: 'compulsory',
  },
  {
    id: 4,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    category: 'optional',
  },
  {
    id: 5,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    category: 'compulsory',
  },
  {
    id: 6,
    rev_code: 'ReV6630c17e5acf5',
    rev_name: 'School (Tuition) Fees',
    no_of_trns: 40,
    amount: '29,561,650',
    category: 'optional',
  },
];

export const transactionStatusData = {
  title: 'Distribution',
  items: [
    {
      label: 'Compulsory',
      value: 68,
      color: '#16A34A',
    },
    {
      label: 'Optional',
      value: 24,
      color: '#D97706',
    },
  ],
  metrics: [
    {
      label: 'Compulsory Payment',
      value: '₦8,420',
      color: '#111827',
    },
    {
      label: 'Optional Payment',
      value: '₦ 7,000,234',
      color: '#16A34A',
    },
  ],
};

const Revenue = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState('Revenue Amount');
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
    <PageContainer title="Revenue Amount">
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
            <Typography variant="h5">Revenue Amount</Typography>

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
            <Button fullWidth sx={{ height: '40px' }}>
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
                <TableCell>Amount (₦)</TableCell>
                <TableCell>Category</TableCell>
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
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.category}
                      size="small"
                      color={
                        row.category === 'compulsory'
                          ? 'success'
                          : row.category === 'optional'
                            ? 'warning'
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
            Student Ledger
          </MenuItem>

          <MenuItem onClick={() => setAnchorEl(null)}>
            <PaymentsOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Pay for Student
          </MenuItem>

          <MenuItem onClick={() => setAnchorEl(null)}>
            <EditNoteOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Update Invoice
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              if (activeRow) {
                window.open(`/class-ledger/${activeRow.id}/cash-post`, '_blank');
              }
            }}
          >
            <CurrencyExchangeOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Cash Posting
          </MenuItem>

          <MenuItem onClick={() => setAnchorEl(null)}>
            <AccountBalanceWalletOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Wallet Transaction
          </MenuItem>
        </Menu>
      </ParentCard>
    </PageContainer>
  );
};

export default Revenue;
