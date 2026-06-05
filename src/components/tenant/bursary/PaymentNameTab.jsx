import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  TextField,
  Stack,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

import { IconPlus, IconDotsVertical, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import PaymentNameModal from '@/components/tenant/bursary/PaymentNameModal';

const PaymentNameTab = ({ showSnackbar }) => {
  const [paymentNames, setPaymentNames] = useState([
    {
      id: 1,
      name: 'Acceptance Fee',
      payOption: 'compulsory',
      settlementBank: 'gtb',
      accountNumber: '0693040604',
      accountName: 'Ikeyi$30ceTrube$75',
      feeBearer: 'client',
      modules: 'none',
      status: 'active',
    },
    {
      id: 2,
      name: 'Tuition Fee',
      payOption: 'compulsory',
      settlementBank: 'gtb',
      accountNumber: '0693040604',
      accountName: 'Ikeyi$30ceTrube$75',
      feeBearer: 'client',
      modules: 'none',
      status: 'active',
    },
    {
      id: 3,
      name: 'Development Levy',
      payOption: 'optional',
      settlementBank: 'fcmb',
      accountNumber: '0693040604',
      accountName: 'Ikeyi$30ceTrube$75',
      feeBearer: 'client',
      modules: 'none',
      status: 'active',
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAddPayment = () => {
    setEditingPayment(null);
    setModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setModalOpen(true);
    setMenuAnchor(null);
  };

  const handleToggleStatus = (payment) => {
    const newStatus = payment.status === 'active' ? 'inactive' : 'active';
    setPaymentNames((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, status: newStatus } : p)),
    );
    showSnackbar?.(
      `Payment name ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
    );
    setMenuAnchor(null);
  };

  const handleSavePayment = (paymentData) => {
    if (editingPayment) {
      setPaymentNames((prev) =>
        prev.map((p) => (p.id === editingPayment.id ? { ...p, ...paymentData } : p)),
      );
      showSnackbar?.('Payment name updated successfully');
    } else {
      setPaymentNames((prev) => [...prev, { id: Date.now(), ...paymentData }]);
      showSnackbar?.('Payment name added successfully');
    }
    setModalOpen(false);
  };

  const filteredPayments = paymentNames.filter((payment) =>
    payment.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(0);
  };

  const hasFilters = searchQuery !== '';

  return (
    <>
      <Stack spacing={3}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  Payment Name
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Every fee items a parent can pay for
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<IconPlus size={18} />}
                onClick={handleAddPayment}
                sx={{ fontWeight: 600 }}
              >
                Add New Payment Name
              </Button>
            </Box>
          }
        >
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              placeholder="Search Payment Items"
              size="small"
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                if (value === '') {
                  setSearchQuery('');
                  setPage(0);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              onClick={handleSearch}
              sx={{ minWidth: 100, width: { xs: '100%', sm: 'auto' } }}
            >
              Search
            </Button>
            {hasFilters && (
              <Button
                size="small"
                onClick={resetFilters}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pay Option</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Settlement Account</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fee Bearer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Modules</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Alert
                        severity="info"
                        sx={{
                          mb: 3,
                          justifyContent: 'center',
                          textAlign: 'center',
                          '& .MuiAlert-icon': { mr: 1.5 },
                        }}
                      >
                        {hasFilters
                          ? 'No payment names found matching your search'
                          : 'No payment names added yet'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayments.map((payment, index) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{payment.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.payOption.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor:
                              payment.payOption === 'optional' ? 'warning.light' : 'primary.light',
                            color:
                              payment.payOption === 'optional' ? 'warning.dark' : 'primary.dark',
                            fontWeight: 600,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {payment.settlementBank.toUpperCase()}
                          </Typography>
                          <Chip
                            label={payment.accountNumber}
                            size="small"
                            sx={{
                              bgcolor: 'error.light',
                              fontSize: 10,
                            }}
                          />
                          <Typography variant="caption" display="block" color="textSecondary">
                            {payment.accountName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.feeBearer.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            fontWeight: 600,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.modules.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: 'secondary.light',
                            color: 'secondary.dark',
                            fontWeight: 600,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={payment.status === 'active' ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: payment.status === 'active' ? 'success.light' : 'error.light',
                            color: payment.status === 'active' ? 'success.dark' : 'error.dark',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setMenuAnchor(e.currentTarget);
                            setSelectedPayment(payment);
                          }}
                        >
                          <IconDotsVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15, 20, 25]}
                    count={filteredPayments.length}
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
        </ParentCard>
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedPayment(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => selectedPayment && handleToggleStatus(selectedPayment)}
          sx={{
            color: selectedPayment?.status === 'active' ? 'error.main' : 'success.main',
          }}
        >
          <ListItemIcon>
            {selectedPayment?.status === 'active' ? (
              <IconX size={18} color="currentColor" />
            ) : (
              <IconCheck size={18} color="currentColor" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedPayment?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedPayment && handleEditPayment(selectedPayment)}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Payment</ListItemText>
        </MenuItem>
      </Menu>

      <PaymentNameModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePayment}
        paymentName={editingPayment}
      />
    </>
  );
};

export default PaymentNameTab;
