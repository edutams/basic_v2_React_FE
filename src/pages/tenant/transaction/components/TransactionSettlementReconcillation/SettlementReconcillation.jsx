import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';

import { IconDotsVertical } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import FeeChart from './FeeChart';
import SettlementModal from './SettlementModal';

// Define transactionStatusData here
export const transactionStatusData = {
  title: 'Total Transaction Value',
  items: [
    {
      label: 'Total Revenue',
      value: '₦127,450,890',
      color: '#4DA3F5',
      icon: 'revenue',
    },
    {
      label: 'Total Settlement',
      value: '₦98,765,430',
      color: '#10B981',
      icon: 'settlement',
    },
    {
      label: 'Outstanding Balance',
      value: '₦28,685,460',
      color: '#EF4444',
      icon: 'balance',
    },
    {
      label: 'Wallet Balance',
      value: '₦45,230,000',
      color: '#3247C6',
      icon: 'wallet',
    },
  ],
};

const dummyData = [
  {
    id: 1,
    bank_name: 'Guaranty Trust Bank',
    account_number: '0145678901',
    no_of_transactions: 145,
    no_of_revenue: 12,
    no_of_settlements: 128,
    expected_amount: '87,450,000',
    reconciled_amount: '72,340,000',
    balance: '15,110,000',
    outstanding_trns: 17,
  },
  {
    id: 2,
    bank_name: 'Zenith Bank Plc',
    account_number: '0987654321',
    no_of_transactions: 98,
    no_of_revenue: 9,
    no_of_settlements: 85,
    expected_amount: '64,230,000',
    reconciled_amount: '58,900,000',
    balance: '5,330,000',
    outstanding_trns: 13,
  },
  {
    id: 3,
    bank_name: 'Access Bank',
    account_number: '5678901234',
    no_of_transactions: 76,
    no_of_revenue: 8,
    no_of_settlements: 70,
    expected_amount: '45,890,000',
    reconciled_amount: '42,100,000',
    balance: '3,790,000',
    outstanding_trns: 6,
  },
  {
    id: 4,
    bank_name: 'First Bank of Nigeria',
    account_number: '1122334455',
    no_of_transactions: 112,
    no_of_revenue: 15,
    no_of_settlements: 95,
    expected_amount: '98,760,000',
    reconciled_amount: '81,450,000',
    balance: '17,310,000',
    outstanding_trns: 17,
  },
];

const SettlementReconcillation = () => {
  const [activeRow, setActiveRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleViewSettlements = (row) => {
    setActiveRow(row);
    setModalOpen(true);
    handleMenuClose();
  };

  const [chartTitle, setChartTitle] = useState('Settlement Recon.');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState({
    categories: [
      'Zenith Bank Plc',
      'Guaranty Trust Bank',
      'Access Bank',
      'First Bank of Nigeria',
      'Guaranty Trust Bank',
      'Zenith Bank Plc',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Settlement Reconciliation</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                size="small"
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Bank Statement
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
                Download Unreconciled
              </Button>
            </Box>
          </Box>
        }
      >
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3, mt: 2 }}>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="From"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="To"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by bank or account"
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
            <Button variant="contained" fullWidth>
              Fetch
            </Button>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>No. of Transactions</TableCell>
                <TableCell>No. of Revenue</TableCell>
                <TableCell>No. of Settlements</TableCell>
                <TableCell>Expected Amount (₦)</TableCell>
                <TableCell>Reconciled Amount (₦)</TableCell>
                <TableCell>Balance (₦)</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummyData.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.bank_name}</TableCell>
                  <TableCell>{row.account_number}</TableCell>
                  <TableCell>{row.no_of_transactions}</TableCell>
                  <TableCell>{row.no_of_revenue}</TableCell>
                  <TableCell>{row.no_of_settlements}</TableCell>
                  <TableCell>₦{row.expected_amount}</TableCell>
                  <TableCell>₦{row.reconciled_amount}</TableCell>
                  <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>₦{row.balance}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                      <IconDotsVertical size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ParentCard>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleViewSettlements(menuRow)}>View Settlements</MenuItem>
      </Menu>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Bank Statement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Upload the school's statement of account so we can match it against recorded settlements
            and flag anything missing.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ py: 2, borderStyle: 'dashed' }}
          >
            {selectedFile ? selectedFile.name : 'Choose file (PDF, CSV, XLSX)'}
            <input
              type="file"
              hidden
              accept=".pdf,.csv,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedFile}
            onClick={() => setUploadDialogOpen(false)}
          >
            Upload & Reconcile
          </Button>
        </DialogActions>
      </Dialog>

      <SettlementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        settlementData={activeRow}
      />
    </PageContainer>
  );
};

export default SettlementReconcillation;
