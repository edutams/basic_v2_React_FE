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
  Chip,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import dayjs from 'dayjs';
import { fetchPrintReceipt } from '@/api/tenant/bursary/transactionApi';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';

const BRAND_COLOR = '#1e4db7';

const initialsFrom = (name) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'S';

const PrintReceipt = () => {
  const [searchParams] = useSearchParams();
  const order_id = searchParams.get('order_id');
  const bulk_order_id = searchParams.get('bulk_order_id');
  const user_id = searchParams.get('user_id');
  const session_term_id = searchParams.get('session_term_id');

  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!(order_id || bulk_order_id) || !user_id) {
      setError('Missing parameters');
      setLoading(false);
      return;
    }

    fetchPrintReceipt({ order_id, bulk_order_id, user_id, session_term_id })
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
  }, [order_id, bulk_order_id, user_id, session_term_id]);

  if (loading) {
    return (
      <PageContainer title="Payment Receipt">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !receiptData) {
    return (
      <PageContainer title="Payment Receipt">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography color="error">{error || 'No data found.'}</Typography>
        </Box>
      </PageContainer>
    );
  }

  const { tenant, transaction, user, sessionDetails, total } = receiptData;
  const studentName = [user?.fname, user?.mname, user?.lname].filter(Boolean).join(' ');
  const paymentMethods = [...new Set((transaction || []).map((t) => t.payment_type).filter(Boolean))].join(
    ', ',
  );

  return (
    <PageContainer title="Payment Receipt">
      {/* .no-print had no backing rule anywhere in the app — it silently
          did nothing, so the print buttons below used to show up in the
          actual printout. Every other printable page in the app defines
          its own inline @media print block for this exact reason. */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; }
            @page { size: A4; margin: 12mm; }
          }
        `}
      </style>

      <Box
        className="no-print"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Payment Receipt
        </Typography>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print Receipt
        </Button>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 1400,
          margin: 'auto',
          background: '#fff',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
        className="receipt"
      >
        {/* School header band — school-info flexes to fill the remaining
            width instead of hugging the logo, so a wide page doesn't leave
            a big dead strip of plain color to the right of the text. */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #05b2bd 100%)`,
            color: '#fff',
            px: 4,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <Avatar
            src={tenant?.school_logo || undefined}
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'rgba(255,255,255,0.15)',
              fontSize: 26,
              fontWeight: 700,
              border: '2px solid rgba(255,255,255,0.5)',
              flexShrink: 0,
            }}
          >
            {initialsFrom(tenant?.tenant_name)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
              {tenant?.tenant_name}
            </Typography>
            {tenant?.address && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {tenant.address}
              </Typography>
            )}
            {tenant?.phone && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tel: {tenant.phone}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ px: 4, py: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={3}>
            <Typography variant="h6" fontWeight={700} letterSpacing={1}>
              PAYMENT RECEIPT
            </Typography>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              label="PAID"
              size="small"
              color="success"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {/* Ward identity (left) + transaction details (right) — an
              actual two-column layout so a wide page is filled with real
              content instead of one narrow centered block surrounded by
              empty margins. Ward name is deliberately the most prominent
              text on the page. */}
          <Box display="flex" flexWrap="wrap" gap={4} mb={3}>
            <Box flex="1 1 300px" display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={user?.avatar || undefined}
                sx={{
                  width: 92,
                  height: 92,
                  fontSize: 32,
                  fontWeight: 700,
                  bgcolor: BRAND_COLOR,
                  mb: 1.5,
                }}
              >
                {initialsFrom(studentName)}
              </Avatar>

              <Typography variant="h3" fontWeight={800} textAlign="center" lineHeight={1.15}>
                {studentName}
              </Typography>

              <Box display="flex" gap={1} mt={1.5} flexWrap="wrap" justifyContent="center">
                {(user?.class_name || user?.class_arm) && (
                  <Chip
                    size="small"
                    label={[user?.class_name, user?.class_arm].filter(Boolean).join(' - ')}
                    sx={{ fontWeight: 600, bgcolor: '#EEF2FF', color: BRAND_COLOR }}
                  />
                )}
                {user?.sex && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={user.sex === 'male' ? 'Male' : 'Female'}
                  />
                )}
              </Box>

              {user?.outstanding_compulsory_balance !== null &&
                user?.outstanding_compulsory_balance !== undefined && (
                  <Chip
                    sx={{ mt: 1.5, fontWeight: 700 }}
                    color={user.outstanding_compulsory_balance > 0 ? 'warning' : 'success'}
                    icon={
                      user.outstanding_compulsory_balance > 0 ? (
                        <WarningAmberIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                      )
                    }
                    label={
                      user.outstanding_compulsory_balance > 0
                        ? `Still owes ₦${Number(user.outstanding_compulsory_balance).toLocaleString()} in compulsory fees`
                        : 'All compulsory fees cleared'
                    }
                  />
                )}
            </Box>

            <Box
              flex="1.3 1 340px"
              sx={{ borderLeft: { md: '1px solid #E5E7EB' }, pl: { md: 4 } }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                display="block"
                mb={1.5}
              >
                Transaction Details
              </Typography>
              <Stack spacing={1.2}>
                <Typography variant="body2">
                  <Box component="span" color="text.secondary">
                    Invoice No:
                  </Box>{' '}
                  <strong>{transaction?.[0]?.invoiceno}</strong>
                </Typography>
                <Typography variant="body2">
                  <Box component="span" color="text.secondary">
                    Date:
                  </Box>{' '}
                  <strong>{dayjs(transaction?.[0]?.trans_date).format('DD-MMM-YYYY, h:mm A')}</strong>
                </Typography>
                {paymentMethods && (
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">
                      Payment Method:
                    </Box>{' '}
                    <strong>{paymentMethods}</strong>
                  </Typography>
                )}
                {transaction?.[0]?.received_by && (
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">
                      Received By:
                    </Box>{' '}
                    <strong>{transaction[0].received_by}</strong>
                  </Typography>
                )}
                {tenant?.bursar_phone && (
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">
                      Bursar Phone:
                    </Box>{' '}
                    <strong>{tenant.bursar_phone}</strong>
                  </Typography>
                )}
                {(sessionDetails?.session?.session_name || sessionDetails?.term?.term_name) && (
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">
                      Session/Term:
                    </Box>{' '}
                    <strong>
                      {sessionDetails?.session?.session_name} {sessionDetails?.term?.term_name}
                    </strong>
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.75rem' } }}>
                  <TableCell>S/N</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="right">Amount (₦)</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaction?.map((t, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{t.description || t.name}</TableCell>
                    <TableCell>{t.payment_type || '—'}</TableCell>
                    <TableCell align="right">{Number(t.amount_paid).toLocaleString()}</TableCell>
                    <TableCell>{dayjs(t.trans_date).format('DD-MMM-YYYY, h:mm A')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'success.light',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Total Paid
            </Typography>
            <Typography variant="h5" fontWeight={700} color="success.dark">
              ₦{Number(total).toLocaleString()}
            </Typography>
          </Box>

          <Typography textAlign="center" mt={4} variant="caption" color="text.secondary" display="block">
            Thank you for your payment • This is a computer-generated receipt and requires no signature.
          </Typography>
        </Box>
      </Box>

      <Box
        className="no-print"
        sx={{ maxWidth: 1000, margin: 'auto', display: 'flex', justifyContent: 'flex-end', mt: 2 }}
      >
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print Receipt
        </Button>
      </Box>
    </PageContainer>
  );
};

export default PrintReceipt;
