import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  Tabs,
  Tab,
  alpha,
  Menu,
  MenuItem,
  Paper,
  TablePagination,
  TableFooter,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import {
  IconSearch,
  IconPlus,
  IconBuildingBank,
  IconReceipt2,
  IconWallet,
  IconCoin,
  IconChartPie,
  IconEdit,
  IconTrash,
} from '@tabler/icons';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Chart of Accounts',
  },
];

const mockBanks = [
  {
    id: 'b1',
    bank: 'Zenith Bank',
    accountName: 'School Fees Account',
    accountNo: '1012345678',
    status: 'Active',
  },
  {
    id: 'b2',
    bank: 'GTBank',
    accountName: 'Salary Account',
    accountNo: '0011223344',
    status: 'Active',
  },
];

const mockAccounts = [
  {
    id: '1001',
    code: '1001',
    name: 'Cash in Bank',
    category: 'Asset',
    linkedBank: 'Zenith Bank',
    status: 'Active',
  },
  {
    id: '1002',
    code: '1002',
    name: 'Accounts Receivable',
    category: 'Asset',
    linkedBank: '—',
    status: 'Active',
  },
  {
    id: '2001',
    code: '2001',
    name: 'Accounts Payable',
    category: 'Liability',
    linkedBank: '—',
    status: 'Active',
  },
  {
    id: '2002',
    code: '2002',
    name: 'Accrued Expenses',
    category: 'Liability',
    linkedBank: '—',
    status: 'Active',
  },
  {
    id: '3001',
    code: '3001',
    name: 'Owner Equity',
    category: 'Equity',
    linkedBank: '—',
    status: 'Active',
  },
];

const accountTypes = ['Register Bank', 'Create Chart of Account'];

const ChartOfAccounts = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setPage(0); // Reset page when tab changes
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Filter Data
  const currentData = tabIndex === 0 ? mockBanks : mockAccounts;

  const filteredData = currentData.filter((item) => {
    if (tabIndex === 0) {
      return (
        item.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.accountNo.includes(searchQuery)
      );
    } else {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.includes(searchQuery)
      );
    }
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <PageContainer title="Chart of Accounts" description="Manage Chart of Accounts">
      <Box sx={{ mt: 1 }}>
        <Breadcrumb title="Chart of Accounts" items={BCrumb} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Registered Banks"
              count="3"
              icon={IconBuildingBank}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Chart of Accounts"
              count="5"
              icon={IconReceipt2}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Income Lines"
              count="2"
              icon={IconChartPie}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Expenditure Line"
              count="3"
              icon={IconWallet}
              color={theme.palette.primary.main}
            />
          </Grid>
        </Grid>

        <Box mb={2}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minWidth: 'auto',
                px: 3,
              },
            }}
          >
            {accountTypes.map((type, index) => (
              <Tab key={index} label={type} />
            ))}
          </Tabs>
        </Box>

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
              <Box>
                <Typography variant="h5">
                  Bank Account
                </Typography>

                <Typography variant="body2">
                  Bank Account Available for Posting
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder={tabIndex === 0 ? 'Search banks...' : 'Search accounts...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={18} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '8px',
                      minWidth: '250px',
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconPlus size={18} />}
                  sx={{
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {tabIndex === 0 ? 'Add Bank' : 'Add Account'}
                </Button>
              </Box>
            </Box>
          }
        >
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead
                  sx={{
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>S/N</TableCell>
                    {tabIndex === 0 ? (
                      <>
                        <TableCell sx={{ fontWeight: 600 }}>Bank</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Account Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Account No</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Account Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Linked Bank</TableCell>
                      </>
                    )}
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Action Menu
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        hover
                      >
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        {tabIndex === 0 ? (
                          <>
                            <TableCell sx={{ fontWeight: 600 }}>{row.bank}</TableCell>
                            <TableCell>{row.accountName}</TableCell>
                            <TableCell sx={{ color: theme.palette.text.secondary }}>
                              {row.accountNo}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell
                              sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
                            >
                              {row.code}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600, borderRadius: '6px' }}
                              />
                            </TableCell>
                            <TableCell>{row.linkedBank}</TableCell>
                          </>
                        )}

                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon />
                          </IconButton>

                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === row.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={handleMenuClose}>
                              <IconEdit size={18} style={{ marginRight: 8 }} />
                              Edit
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                              <IconTrash size={18} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={tabIndex === 0 ? 5 : 6} align="center" sx={{ py: 5 }}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconCoin
                            size={48}
                            color={theme.palette.text.disabled}
                            style={{ marginBottom: 16 }}
                          />
                          <Typography variant="h6" color="textSecondary">
                            No Records Found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Try adjusting your search query.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={filteredData.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </ParentCard>
      </Box>
    </PageContainer>
  );
};

export default ChartOfAccounts;
