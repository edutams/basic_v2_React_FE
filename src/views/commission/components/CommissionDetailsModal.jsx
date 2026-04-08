import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  TablePagination,
} from '@mui/material';
import { IconX, IconDownload } from '@tabler/icons-react';
import { mockCommissionData } from '../mockData';

const CommissionDetailsModal = ({ open, onClose, agent }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Get filtered data based on agent and filters
  const getFilteredData = () => {
    if (!agent) return [];

    let data = mockCommissionData.filter(
      (item) => item.agentName === agent.agentName || item.email === agent.email,
    );

    // Apply filters
    if (fromDate) {
      data = data.filter((item) => item.transactionDate >= fromDate);
    }
    if (toDate) {
      data = data.filter((item) => item.transactionDate <= toDate);
    }
    if (transactionId) {
      data = data.filter((item) =>
        item.transactionId.toLowerCase().includes(transactionId.toLowerCase()),
      );
    }

    return data;
  };

  const filteredData = getFilteredData();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilter = () => {
    // Trigger re-render with filtered data
    setPage(0);
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting data:', filteredData);
    alert('Export functionality would download the filtered data');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Subscription Commission Details
          </Typography>
          {agent && (
            <Typography variant="body2" color="text.secondary">
              Agent: {agent.agentName} ({agent.email})
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Filters Section */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                flex: 1,
              }}
            >
              <TextField
                type="date"
                label="From Date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="date"
                label="To Date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                size="small"
                placeholder="Enter transaction ID"
              />
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
            </Box>

            <Button
              variant="contained"
              startIcon={<IconDownload size={18} />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Table Section */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDarkMode ? theme.palette.action.hover : '#F3F4F6',
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Session ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Narration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Transaction Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.transactionId}</Typography>
                    </TableCell>
                    <TableCell>{row.sessionId}</TableCell>
                    <TableCell>{row.narration}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.amount}</Typography>
                    </TableCell>
                    <TableCell>{row.paymentType}</TableCell>
                    <TableCell>{row.transactionDate}</TableCell>
                  </TableRow>
                ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          component="Box"
          sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommissionDetailsModal;
