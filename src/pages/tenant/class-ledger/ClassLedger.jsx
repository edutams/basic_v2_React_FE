import React, { useState, useMemo, useEffect } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';

import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Avatar,
  Stack,
  Chip,
  Grid,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import StatCard from './components/StatCard';
import FeeChart from './components/FeeChart';
import { IconDotsVertical, IconEye, IconEdit } from '@tabler/icons-react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import {
  fetchClassesByProgramme,
  fetchProgrammes,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchPaymentNameOptions } from '@/api/tenant/bursary/classLedger';

const dummyData = [
  {
    id: 1,
    studentName: 'John Doe',
    avatar:
      'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
    compulsoryBill: '₦80,000',
    optionalBill: '₦10,000',
    totalPayable: '₦90,000',
    totalPaid: '₦50,000',
    penalty: '₦2,000',
    discount: '₦5,000',
    balance: '₦37,000',
  },
  {
    id: 2,
    studentName: 'Mary Johnson',
    avatar:
      'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
    compulsoryBill: '₦75,000',
    optionalBill: '₦5,000',
    totalPayable: '₦80,000',
    totalPaid: '₦80,000',
    penalty: '₦0',
    discount: '₦0',
    balance: '₦0',
  },
  {
    id: 3,
    studentName: 'David Williams',
    avatar:
      'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
    compulsoryBill: '₦90,000',
    optionalBill: '₦15,000',
    totalPayable: '₦105,000',
    totalPaid: '₦60,000',
    penalty: '₦3,000',
    discount: '₦10,000',
    balance: '₦38,000',
  },
  {
    id: 4,
    studentName: 'Sarah Brown',
    avatar:
      'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
    compulsoryBill: '₦85,000',
    optionalBill: '₦8,000',
    totalPayable: '₦93,000',
    totalPaid: '₦93,000',
    penalty: '₦0',
    discount: '₦0',
    balance: '₦0',
  },
  {
    id: 5,
    avatar:
      'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
    studentName: 'Michael Adams',
    compulsoryBill: '₦70,000',
    optionalBill: '₦12,000',
    totalPayable: '₦82,000',
    totalPaid: '₦40,000',
    penalty: '₦1,500',
    discount: '₦2,500',
    balance: '₦41,000',
  },
];

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Bursary' }, { title: 'class ledger' }];
const compulsoryChartData = {
  type: 'bar',
  title: 'Compulsory Fees',
  categories: ['JSS1 A', 'JSS2 A', 'JSS3 A'],
  series: [
    {
      name: 'Total Expected',
      data: [10200000, 1400000, 400000],
    },
    {
      name: 'Total Paid',
      data: [7200000, 0, 0],
    },
    {
      name: 'Balance',
      data: [3000000, 1400000, 400000],
    },
  ],
};

const optionalChartData = {
  type: 'bar',
  title: 'Optional Fees',
  categories: ['JSS1 A', 'JSS2 A', 'JSS3 A'],
  series: [
    {
      name: 'Total Expected',
      data: [5000000, 2500000, 1200000],
    },
    {
      name: 'Total Paid',
      data: [3200000, 1500000, 800000],
    },
    {
      name: 'Balance',
      data: [1800000, 1000000, 400000],
    },
  ],
};

const payableChartData = {
  type: 'bar',
  title: 'Payable Fees',
  categories: ['JSS1 A', 'JSS2 A', 'JSS3 A'],
  series: [
    {
      name: 'Total Expected',
      data: [12000000, 5000000, 2000000],
    },
    {
      name: 'Total Paid',
      data: [8000000, 3000000, 1000000],
    },
    {
      name: 'Balance',
      data: [4000000, 2000000, 1000000],
    },
  ],
};
const ClassLedger = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);

  const [isCompulsory, setIsCompulsory] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [isPayable, setIsPayable] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);

  const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');

  const [paymentOptions, setPaymentOptions] = useState([]);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('');

  const handleFilterChange = React.useCallback(async (key, val) => {
    if (key === 'programme') {
      try {
        const classesRes = await fetchClassesByProgramme(val);
        setClasses(
          classesRes.data.map((c) => ({
            value: c.id,
            label: c.class_name,
          })),
        );
        setClassLevel(''); // reset class when programme changes
      } catch (error) {
        console.error('Failed to fetch classes', error);
      }
    }
  }, []);

  const loadProgrammes = async () => {
    try {
      const res = await fetchProgrammes();
      setProgrammes(
        res.data.map((p) => ({
          value: p.id,
          label: p.programme_name,
        })),
      );
    } catch (error) {
      console.error('Failed to load programmes');
    }
  };

  const loadPaymentOptions = async () => {
    try {
      const res = await fetchPaymentNameOptions();
      setPaymentOptions(res.data || []);
    } catch (error) {
      console.error('Failed to load payment options', error);
    }
  };

  useEffect(() => {
    loadProgrammes();
    loadPaymentOptions();
  }, []);

  const buildChartOptions = (categories) => ({
    chart: {
      type: chartType,
      stacked: false,
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

    legend: {
      position: 'top', // 👈 key change
      horizontalAlign: 'center',
      fontSize: '13px',
      labels: {
        colors: isDark ? '#aaa' : '#64748B',
      },
    },

    plotOptions: {
      bar: { borderRadius: 3, columnWidth: '55%' },
    },

    dataLabels: { enabled: false },

    colors: ['#6366F1', '#22C55E', '#EF4444'],

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
        formatter: (val) =>
          val >= 1000000
            ? (val / 1000000).toFixed(1) + 'M'
            : val >= 1000
              ? (val / 1000).toFixed(0) + 'K'
              : val,
      },
    },

    grid: {
      borderColor: isDark ? '#333' : '#f1f1f1',
      strokeDashArray: 4,
    },

    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val) => `₦${val.toLocaleString()}`,
      },
    },
  });

  return (
    <PageContainer title="Class Ledger">
      <Breadcrumb title="Class Ledger" items={BCrumb} />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Total Invoice(Compulsory Bill)"
            // value={analyticsLoading ? '...' : String(analytics?.totalSchools ?? 0)}
            value="₦7,000,234.00"
            valueColor="#5CB979"
            valueBg={isDark ? '#1e2a4a' : '#EEFAF3'}
            subStats={[
              {
                label: 'Total Paid',
                value: '304,043,000',
                // value: analyticsLoading ? '...' : String(analytics?.activeSchools ?? 0),
              },
              {
                label: 'Balance',
                value: '304,043,000',
                // value: analyticsLoading ? '...' : String(analytics?.pendingSchools ?? 0),
              },
            ]}
            onIconClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle(compulsoryChartData.title);
              setChartType(compulsoryChartData.type);
              setChartData(compulsoryChartData);
            }}
            onClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle(compulsoryChartData.title);
              setChartType(compulsoryChartData.type);
              setChartData(compulsoryChartData);
              setIsCompulsory(true);
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Total Invoice (Optional Bill)"
            value="₦7,000,234.00"
            valueColor="#1F35B6"
            valueBg={isDark ? '#0d2e1e' : '#ECEFFF'}
            subStats={[
              { label: 'Total Paid', value: '₦100,000,000' },
              { label: 'Balance', value: '304,043,000' },
            ]}
            onIconClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle(optionalChartData.title);
              setChartType(optionalChartData.type);
              setChartData(optionalChartData);
            }}
            onClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle(optionalChartData.title);
              setChartType(optionalChartData.type);
              setChartData(optionalChartData);
              setIsOptional(true);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Total Payable"
            value="₦7,000,234.00"
            valueColor="#895CB9"
            valueBg={isDark ? '#0d2e1e' : '#F3EEFA'}
            subStats={[
              { label: 'Total Paid', value: '₦100,000,000' },
              { label: 'Balance', value: '304,043,000' },
            ]}
            onIconClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle(payableChartData.title);
              setChartType(payableChartData.type);
              setChartData(payableChartData);
            }}
            onClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle(payableChartData.title);
              setChartType(payableChartData.type);
              setChartData(payableChartData);
              setIsPayable(true);
            }}
          />
        </Grid>
      </Grid>
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
            <Typography variant="h5"></Typography>

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
                onClick={() => {
                  setDownloadClassId('');
                  setDownloadDialogOpen(true);
                }}
              >
                View In CSV Format
              </Button>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                size="small"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                onClick={() => setUploadLearnerOpen(true)}
              >
                Print Payment List
              </Button>
            </Box>
          </Box>
        }
      >
        <Grid container spacing={3} sx={{ mb: 3, mt: 3 }} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Programme"
              size="small"
              value={programme}
              onChange={(e) => {
                const val = e.target.value;
                setProgramme(val);
                handleFilterChange('programme', val);
              }}
            >
              {programmes.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Class"
              size="small"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
            >
              {classes.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Payment Options"
              size="small"
              value={selectedPaymentOption}
              onChange={(e) => setSelectedPaymentOption(e.target.value)}
            >
              <MenuItem value="">All Payment Options</MenuItem>
              {paymentOptions.map((option, _i) => (
                <MenuItem key={_i} value={option.pay_option}>
                  {option.pay_option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
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
            <Button variant="contained" fullWidth sx={{ height: '40px' }}>
              Fetch
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell> Compulsory Bill</TableCell>
                <TableCell>Optional Bill</TableCell>
                <TableCell>Total Payable</TableCell>
                <TableCell>Total Paid</TableCell>
                <TableCell>Penalty</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {dummyData.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={row.avatar ? row.avatar : <PersonOutlineIcon sx={{ color: '#000' }} />}
                        alt={row.studentName}
                        sx={{ width: 36, height: 36 }}
                      >
                        {row.studentName?.toUpperCase() ?? '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {row.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {'JNK/009' || '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>{row.compulsoryBill}</TableCell>
                  <TableCell>{row.optionalBill}</TableCell>
                  <TableCell>{row.totalPayable}</TableCell>
                  <TableCell>{row.totalPaid}</TableCell>
                  <TableCell>{row.penalty}</TableCell>
                  <TableCell>{row.discount}</TableCell>
                  <TableCell>{row.balance}</TableCell>
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

          <MenuItem>
            <PaymentsOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Pay for Student
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              if (activeRow) {
                window.open(`/class-ledger/${activeRow.id}/invoice`, '_blank');
              }
            }}
          >
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
        <FeeChart
          open={isFeeModalOpen}
          onClose={() => setIsFeeModalOpen(false)}
          title={chartTitle}
          chartType={chartType}
          chartOptions={buildChartOptions(chartData?.categories || [])}
          chartSeries={chartData?.series || []}
          isPayable={isPayable}
          isOptional={isOptional}
          isCompulsory={isCompulsory}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default ClassLedger;
