// SettlementsModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';

const SettlementsModal = ({ open, onClose, rowData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!rowData) return;
    setLoading(true);
    try {
      console.log('Loading settlements for:', rowData.bank_name);
      // API call here
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
      title={`Settlements — ${rowData?.bank_name}`}
    >
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Session ID</TableCell>
              <TableCell>Amount (₦)</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.transaction_id}</TableCell>
                  <TableCell>{item.session_id}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell align="center">
                    <Button>Download</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StandardModal>
  );
};

export default SettlementsModal;
