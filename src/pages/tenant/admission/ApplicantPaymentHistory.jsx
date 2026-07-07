import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import {
  IconHistory,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import { getApplicantByFormNumber, fetchApplicantPaymentHistory } from '@/api/tenant/admission/admissionProcessingApi';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/process-applications', title: 'Admission Processing' },
  { title: 'Payment History' },
];

const statusColors = {
  APPROVED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  DECLINED: 'error',
};

const ApplicantPaymentHistory = () => {
  const { form_number } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [applicant, setApplicant] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!form_number) {
        notify.error('No form number provided');
        navigate('/process-applications');
        return;
      }
      setLoading(true);
      try {
        const [appRes, transRes] = await Promise.all([
          getApplicantByFormNumber(form_number),
          fetchApplicantPaymentHistory(form_number),
        ]);
        const appData = appRes?.data ?? appRes;
        setApplicant(appData);

        const transData = transRes?.data ?? transRes ?? [];
        setTransactions(Array.isArray(transData) ? transData : []);
      } catch (err) {
        console.error('Failed to load payment history:', err);
        notify.error('Failed to load payment history');
        navigate('/process-applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form_number]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <PageContainer title="Payment History" description="Loading payment history">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={36} />
        </Box>
      </PageContainer>
    );
  }

  if (!applicant) {
    return (
      <PageContainer title="Payment History" description="Not found">
        <Alert severity="error">Applicant not found.</Alert>
      </PageContainer>
    );
  }

  const fullName = [applicant.lname, applicant.fname, applicant.mname].filter(Boolean).join(' ').toUpperCase() || '—';

  return (
    <PageContainer title="Payment History" description="View applicant payment history">
      <Breadcrumb title="Payment History" items={BCrumb} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Payment History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fullName} — {applicant.form_number || '—'}
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/process-applications')}>
          Back
        </Button>
      </Box>

      <ParentCard title="Transactions">
        {transactions.length === 0 ? (
          <Alert severity="info" sx={{ justifyContent: 'center' }}>
            No payment transactions found for this applicant.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((txn, index) => (
                  <TableRow key={txn.id || index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {txn.transaction_reference || txn.bulk_order_id || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {txn.description || txn.payment_name || 'Admission Payment'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        ₦{Number(txn.amount || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={txn.status || 'PENDING'}
                        size="small"
                        color={statusColors[txn.status] || 'default'}
                        sx={{ fontWeight: 600, fontSize: 11, minWidth: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {txn.trans_date || txn.created_at
                          ? new Date(txn.trans_date || txn.created_at).toLocaleDateString()
                          : '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default ApplicantPaymentHistory;
