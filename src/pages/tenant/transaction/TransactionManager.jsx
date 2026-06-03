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
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import TransactionChart from '@/components/tenant/bursary/TransactionChart';
import TransactionSummaryCards from '@/components/tenant/bursary/TransactionSummaryCards';
import TransactionTable from '@/components/tenant/bursary/TransactionTable';
import TransactionFilters from '@/components/tenant/bursary/TransactionFilters';
import { useNotification } from 'src/hooks/useNotification';

// Mock data - Replace with actual API calls
const mockTransactionData = {
  summary: {
    totalExpected: 5234567.89,
    totalReceived: 4123456.78,
    totalBalance: 1111111.11,
    totalOverpaid: 123456.78,
  },
  chartData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    expected: [450000, 450000, 450000, 450000, 450000, 450000, 400000, 400000, 400000, 400000, 400000, 400000],
    received: [420000, 435000, 440000, 445000, 448000, 449000, 390000, 395000, 398000, 399000, 401000, 402000],
  },
  transactions: [
    {
      id: 'TXN001',
      studentName: 'Adebayo Johnson',
      class: 'JSS 1A',
      term: 'First Term',
      amountExpected: 125000,
      amountPaid: 125000,
      balance: 0,
      paymentDate: '2026-01-15',
      paymentMethod: 'Bank Transfer',
      status: 'completed',
      receiptNo: 'RCP001234',
    },
    {
      id: 'TXN002',
      studentName: 'Chioma Okafor',
      class: 'JSS 2B',
      term: 'First Term',
      amountExpected: 125000,
      amountPaid: 75000,
      balance: 50000,
      paymentDate: '2026-01-18',
      paymentMethod: 'Card Payment',
      status: 'partial',
      receiptNo: 'RCP001235',
    },
    {
      id: 'TXN003',
      studentName: 'Emmanuel Ogunlade',
      class: 'SS 1A',
      term: 'First Term',
      amountExpected: 150000,
      amountPaid: 150000,
      balance: 0,
      paymentDate: '2026-01-20',
      paymentMethod: 'Cash',
      status: 'completed',
      receiptNo: 'RCP001236',
    },
    {
      id: 'TXN004',
      studentName: 'Fatima Ibrahim',
      class: 'JSS 3A',
      term: 'First Term',
      amountExpected: 125000,
      amountPaid: 0,
      balance: 125000,
      paymentDate: null,
      paymentMethod: null,
      status: 'pending',
      receiptNo: null,
    },
    {
      id: 'TXN005',
      studentName: 'Grace Adekunle',
      class: 'SS 2B',
      term: 'First Term',
      amountExpected: 150000,
      amountPaid: 160000,
      balance: -10000,
      paymentDate: '2026-01-25',
      paymentMethod: 'Bank Transfer',
      status: 'overpaid',
      receiptNo: 'RCP001237',
    },
    {
      id: 'TXN006',
      studentName: 'Ibrahim Musa',
      class: 'JSS 1B',
      term: 'First Term',
      amountExpected: 125000,
      amountPaid: 100000,
      balance: 25000,
      paymentDate: '2026-01-28',
      paymentMethod: 'USSD',
      status: 'partial',
      receiptNo: 'RCP001238',
    },
    {
      id: 'TXN007',
      studentName: 'Joy Okoro',
      class: 'SS 3A',
      term: 'First Term',
      amountExpected: 150000,
      amountPaid: 150000,
      balance: 0,
      paymentDate: '2026-02-01',
      paymentMethod: 'Bank Transfer',
      status: 'completed',
      receiptNo: 'RCP001239',
    },
    {
      id: 'TXN008',
      studentName: 'Khalid Abubakar',
      class: 'JSS 2A',
      term: 'First Term',
      amountExpected: 125000,
      amountPaid: 0,
      balance: 125000,
      paymentDate: null,
      paymentMethod: null,
      status: 'pending',
      receiptNo: null,
    },
  ],
};

const Transactions = () => {
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactionData.transactions);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactionData.transactions);
  const [summary, setSummary] = useState(mockTransactionData.summary);
  const [chartData, setChartData] = useState(mockTransactionData.chartData);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSession, setSelectedSession] = useState('2025/2026');

  // Session data
  const sessions = ['2025/2026', '2024/2025', '2023/2024'];
  const classes = ['All Classes', 'JSS 1A', 'JSS 1B', 'JSS 2A', 'JSS 2B', 'JSS 3A', 'SS 1A', 'SS 2B', 'SS 3A'];
  const terms = ['All Terms', 'First Term', 'Second Term', 'Third Term'];
  const statuses = ['All Status', 'completed', 'partial', 'pending', 'overpaid'];

  // Load data on mount and filter changes
  useEffect(() => {
    loadTransactions();
  }, [selectedSession, selectedClass, selectedTerm, selectedStatus]);

  // Apply search filter
  useEffect(() => {
    applyFilters();
  }, [searchTerm, transactions]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetchTransactions({ session, class, term, status });
      // setTransactions(response.data);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTransactions(mockTransactionData.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      notify.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (txn) =>
          txn.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (selectedClass !== 'all' && selectedClass !== 'All Classes') {
      filtered = filtered.filter((txn) => txn.class === selectedClass);
    }

    // Term filter
    if (selectedTerm !== 'all' && selectedTerm !== 'All Terms') {
      filtered = filtered.filter((txn) => txn.term === selectedTerm);
    }

    // Status filter
    if (selectedStatus !== 'all' && selectedStatus !== 'All Status') {
      filtered = filtered.filter((txn) => txn.status === selectedStatus);
    }

    setFilteredTransactions(filtered);
  };

  const handleExport = () => {
    notify.info('Exporting transactions...');
    // TODO: Implement export functionality
  };

  const handleViewTransaction = (transaction) => {
    navigate(`/transaction-details/${transaction.id}`, { state: { transaction } });
  };

  const handlePrintReceipt = (transaction) => {
    notify.info(`Printing receipt for ${transaction.studentName}...`);
    // TODO: Implement print functionality
  };

  return (
    <PageContainer title="Transactions" description="View and manage all payment transactions">
      <Box mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Transactions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {loading
                ? 'Loading...'
                : `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''} found`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                {sessions.map((session) => (
                  <MenuItem key={session} value={session}>
                    {session}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <TransactionSummaryCards summary={summary} loading={loading} />

      {/* Chart Section */}
      <Box mb={3}>
        <TransactionChart data={chartData} loading={loading} />
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, receipt, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.25}>
            <FormControl fullWidth size="small">
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.25}>
            <FormControl fullWidth size="small">
              <Select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
                {terms.map((term) => (
                  <MenuItem key={term} value={term}>
                    {term}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.25}>
            <FormControl fullWidth size="small">
              <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.25}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('all');
                setSelectedTerm('all');
                setSelectedStatus('all');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Transaction Table */}
      <TransactionTable
        transactions={filteredTransactions}
        loading={loading}
        onViewTransaction={handleViewTransaction}
        onPrintReceipt={handlePrintReceipt}
      />
    </PageContainer>
  );
};

export default Transactions;
