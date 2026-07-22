import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  useTheme,
  TablePagination,
  Button,
  TextField,
  Grid,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { IconArrowLeft, IconDownload, IconDotsVertical } from '@tabler/icons-react';
import PageContainer from '../../../../components/container/PageContainer';
import Breadcrumb from '../../../../layouts/landlord/shared/breadcrumb/Breadcrumb';
import MyCommissionStatCards from './components/MyCommissionStatCards';
import { mockCommissionData } from './mockData';

const BCrumb = [
  // { to: '/', title: 'Home' },
  // { to: '/organization/commissions', title: 'Manage Commission' },
  // { title: 'My Commission by Transaction' },
];

const MyCommissionByTransaction = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilter = () => {
    // Filter logic would go here
  };

  // Filter data for transaction type
  const transactionData = mockCommissionData.filter((a) => a.commissionType === 'Transaction');

  return (
    <PageContainer
      title="My Commission by Transaction"
      description="View your transaction-based commissions"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Breadcrumb title="My Commission by Transaction" items={BCrumb} />
        <Button variant="contained" size="small" startIcon={<IconArrowLeft />}
          onClick={() => navigate('/organization/commissions')}
          sx={{
            textTransform: 'none',
          }}
        >
          Back to Commission Management
        </Button>
      </Box>

      <Box mt={3}>
        {/* Four Stat Cards */}
        <MyCommissionStatCards />

        {/* Table Section */}
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                Transaction Commission Details
              </Typography>
              <Button variant="contained" size="small" startIcon={<IconDownload />}
                sx={{
                  bgcolor: '#3949ab',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#303f9f' },
                }}
              >
                Export
              </Button>
            </Box>

            {/* Filter Section */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2}>
                  <TextField
                    type="date"
                    label="From"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    type="date"
                    label="To"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Enter transaction ID"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="contained" size="small" onClick={handleFilter} sx={{ bgcolor: '#3949ab', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#303f9f' }, }}>
                    Filter
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Paginated data */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Session ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Narration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Payment Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.transactionId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.sessionId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'normal', minWidth: 200 }}>
                          {row.narration}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.amount}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.paymentType}
                          size="small"
                          color="success"
                          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.transactionDate}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleClick(e, row)}>
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
              onClose={handleClose}
              PaperProps={{
                sx: {
                  width: 180,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.shadows[3],
                  borderRadius: '12px',
                },
              }}
            >
              <MenuItem onClick={handleClose}>
                View Details
              </MenuItem>
            </Menu>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              count={transactionData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              component="Box"
              sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default MyCommissionByTransaction;
