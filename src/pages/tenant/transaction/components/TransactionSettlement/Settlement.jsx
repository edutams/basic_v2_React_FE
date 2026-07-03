import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  TextField,
  InputLabel,
  Menu,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import { IconDotsVertical } from '@tabler/icons-react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import FeeChart from '../TransactionSettlementReconcillation/FeeChart';



const dummyData = [
  {
    id: 1,
    bank: 'GUARANTY TRUST BANK',
    account_number: '0130179103',
    no_of_revenue: 40,
    no_of_transaction: 29,
    amount: '29,561,650',
    date_paid: '2025-01-22 09:35:55',
  },
  {
    id: 2,
    bank: 'GUARANTY TRUST BANK',
    account_number: '0130179103',
    no_of_revenue: 40,
    no_of_transaction: 29,
    amount: '29,561,650',
    date_paid: '2025-01-22 09:35:55',
  },
];

export const settlementStatusData = {
  title: 'Total Transaction Value',
  items: [
    {
      label: 'Settlement Today',
      value: '₦7,000,234.00',
      color: '#4DA3F5',
      bgColor: '#EAF4FF',
      icon: 'revenue',
    },
    {
      label: 'Settlement This Month',
      value: '₦7,000,234.00',
      color: '#E95A71',
      bgColor: '#FDF1F3',
      icon: 'settlement',
    },
    {
      label: 'Settlement This Week',
      value: '₦7,000,234.00',
      color: '#6BC68D',
      bgColor: '#EEF9F2',
      icon: 'balance',
    },
    {
      label: 'Settlement This Year',
      value: '₦7,000,234.00',
      color: '#3247C6',
      bgColor: '#EEF0FF',
      icon: 'wallet',
    },
  ],
};

const Settlement = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [chartTitle] = useState('Settlement');
  const [chartType] = useState('bar');
  const [chartData] = useState({
    categories: [
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
      'Guaranty Trust Bank',
    ],
    series: [
      {
        name: 'Settlements Amount',
        data: [3300000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 3300000, 2200000],
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
    colors: [theme.palette.primary.main],
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
          fontSize: '9px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'settlements Amount',
        style: {
          fontWeight: 600,
        },
      },
      labels: {
        formatter: (val) => {
          if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
          }
          if (val >= 1000) {
            return `${(val / 1000).toFixed(0)}K`;
          }
          return `${val}`;
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
    <PageContainer title="Settlement">
      <FeeChart
        title=""
        chartType={chartType}
        chartOptions={buildChartOptions(chartData?.categories || [])}
        chartSeries={chartData?.series || []}
        statusData={settlementStatusData}
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
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                width: { xs: '100%', md: 'auto' },
                flexGrow: 1,
              }}
            >
              <Grid container spacing={2} alignItems="center" width="100%">
                <Grid item xs={12} md={2} display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>From</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                  />
                </Grid>
                <Grid item xs={12} md={2} display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>To</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl size="small" fullWidth>
                    <Select defaultValue="" displayEmpty>
                      <MenuItem value="" disabled>Session</MenuItem>
                      <MenuItem value="2025/2026">2025/2026</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl size="small" fullWidth>
                    <Select defaultValue="" displayEmpty>
                      <MenuItem value="" disabled>Term</MenuItem>
                      <MenuItem value="First Term">First Term</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    placeholder="Search Name or ID"
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={1}>
                  <Button variant="contained" size="small">
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }
      >
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bank</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Account Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>No. of Revenue</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>No. of Transaction</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date Paid</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {dummyData.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.bank}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.account_number}</TableCell>
                  <TableCell>{row.no_of_revenue}</TableCell>
                  <TableCell>{row.no_of_transaction}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.date_paid}</TableCell>
                  <TableCell align="center">
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
            View Details
          </MenuItem>
        </Menu>
      </ParentCard>
    </PageContainer>
  );
};

export default Settlement;
