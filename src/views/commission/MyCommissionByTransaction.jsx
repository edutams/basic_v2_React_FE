import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Typography, useTheme, TablePagination, Button, TextField, Grid } from '@mui/material';
import { IconArrowLeft, IconDownload } from '@tabler/icons-react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import MyCommissionStatCards from './components/MyCommissionStatCards';
import MyCommissionTable from './components/MyCommissionTable';
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
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => navigate('/organization/commissions')}
          sx={{
            textTransform: 'none',
            // color: theme.palette.text.secondary,
            // '&:hover': {
            //   bgcolor: theme.palette.action.hover,
            // },
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
              <Button
                variant="contained"
                startIcon={<IconDownload size={18} />}
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
                  <Button
                    variant="contained"
                    onClick={handleFilter}
                    sx={{
                      bgcolor: '#3949ab',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: '#303f9f' },
                    }}
                  >
                    Filter
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Paginated data */}
            <MyCommissionTable
              data={transactionData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
              rowsPerPage={rowsPerPage}
            />

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
