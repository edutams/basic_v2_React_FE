import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
} from '@mui/material';
import dayjs from 'dayjs';
import { fetchPrintReceipt } from '@/api/tenant/bursary/transactionApi';
import { useSearchParams } from 'react-router-dom';

const PrintReceipt = () => {
  const [searchParams] = useSearchParams();
  const order_id = searchParams.get('order_id');
  const user_id = searchParams.get('user_id');
  const session_term_id = searchParams.get('session_term_id');

  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order_id || !user_id) {
      setError('Missing parameters');
      setLoading(false);
      return;
    }

    fetchPrintReceipt({ order_id, user_id, session_term_id })
      .then((res) => {
        if (res.status === true && res.data) {
          setReceiptData(res.data);
        } else {
          setError(res.message || 'Receipt not found.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load receipt.');
      })
      .finally(() => setLoading(false));
  }, [order_id, user_id, session_term_id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !receiptData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error || 'No data found.'}</Typography>
      </Box>
    );
  }

  const { tenant, transaction, user, sessionDetails, total } = receiptData;

  return (
    <>
      <Box className="no-print" sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <Button variant="contained" color="success" onClick={() => window.print()}>
          🖨️ Print Receipt
        </Button>
      </Box>

      <Box
        sx={{ padding: '40px 30px', maxWidth: 1000, margin: 'auto', background: '#fff' }}
        className="receipt"
      >
        {/* School Header */}
        <Box display="flex" alignItems="center" justifyContent="center" mb={4} gap={3}>
          {tenant?.school_logo && (
            <Box>
              <img
                src={tenant.school_logo}
                alt="School Logo"
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {tenant?.tenant_name}
            </Typography>

            <Typography variant="body1">{tenant?.address}</Typography>

            {tenant?.phone && <Typography variant="body2">Phone: {tenant.phone}</Typography>}
          </Box>
        </Box>

        <Typography variant="h5" textAlign="center" fontWeight={600} mb={2}>
          PAYMENT RECEIPT FOR {sessionDetails?.session?.session_name || ''}{' '}
          {sessionDetails?.term?.term_name || ''}
        </Typography>

        <Typography variant="h6" textAlign="center" fontSize={40} fontWeight={600} mb={4}>
          {user?.fname} {user?.mname} {user?.lname}
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography>
            <strong>Invoice No:</strong> {transaction?.[0]?.invoiceno}
          </Typography>
          <Typography>
            <strong>Date:</strong>{' '}
            {dayjs(transaction?.[0]?.trans_date).format('DD-MMM-YYYY, h:mm A')}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>S/N</strong>
                </TableCell>
                <TableCell width={20}>
                  <strong>Transaction Id</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Amount (₦)</strong>
                </TableCell>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transaction?.map((t, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{t.order_id}</TableCell>
                  <TableCell>{t.description || t.name}</TableCell>
                  <TableCell align="right">{Number(t.amount_paid).toLocaleString()}</TableCell>
                  <TableCell>{dayjs(t.trans_date).format('DD-MMM-YYYY, h:mm A')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box textAlign="right" mt={4}>
          <Typography variant="h5" fontWeight={700}>
            Total Paid: ₦{Number(total).toLocaleString()}
          </Typography>
        </Box>

        <Typography textAlign="center" mt={6} color="text.secondary">
          Thank you for your payment • This is a computer-generated receipt
        </Typography>
      </Box>
    </>
  );
};

export default PrintReceipt;
