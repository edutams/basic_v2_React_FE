import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import StandardModal from '@/components/shared/StandardModal';
// import your API function

const TransactionsModal = ({ open, onClose, rowData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Add pagination, date filters, etc. similar to RevenueTransactionsModal

  const loadData = useCallback(async () => {
    if (!rowData) return;
    setLoading(true);
    try {
      // const res = await fetchAllTransactions({ bank_id: rowData.id, ...filters });
      // setData(res.data);
      console.log('Loading all transactions for:', rowData.bank_name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [rowData]);

  useEffect(() => {
    if (open && rowData) loadData();
  }, [open, rowData, loadData]);

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={`All Transactions — ${rowData?.bank_name}`}
    >
      <Box sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{/* Map your data here */}</TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </StandardModal>
  );
};

export default TransactionsModal;
