import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Stack,
  Avatar,
  Checkbox,
  Button,
  Paper,
  Skeleton,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ReceiptLongOutlined,
  AccountBalanceWalletOutlined,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import { fetchParentPayments } from '@/api/tenant/bursary/classLedger';
import { createPendingPayment } from '@/api/tenant/bursary/bursaryPayment';
import { makePayment } from '@/utils/paymentGateway';
import { useNotification } from '@/hooks/useNotification';

const naira = (n) => `₦${(Number(n) || 0).toLocaleString()}`;

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'W';

/**
 * Pay School Fees — lists every payment attached to the parent's wards
 * (from /bursary/payment_schedule/parent-payments), lets the parent select
 * which to pay, then runs the same gateway flow as the invoice page.
 */
const PaySchoolFees = () => {
  const navigate = useNavigate();
  const notify = useNotification();

  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState({}); // invoice_id -> true

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchParentPayments();
      if (res?.status) setWards(res.data || []);
      else setError(res?.message || 'Failed to load payments');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const allPayments = wards.flatMap((w) => w.payments || []);
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const totalPayable = allPayments
    .filter((p) => selected[p.invoice_id])
    .reduce((sum, p) => sum + (Number(p.payable) || 0), 0);

  const toggle = (invoiceId) => {
    setSelected((prev) => ({ ...prev, [invoiceId]: !prev[invoiceId] }));
  };

  const toggleWard = (wardId, checked) => {
    const ward = wards.find((w) => w.id === wardId);
    const next = { ...selected };
    (ward?.payments || []).forEach((p) => {
      next[p.invoice_id] = checked;
    });
    setSelected(next);
  };

  const handlePay = async () => {
    if (totalPayable <= 0) {
      notify.error('Please select at least one payment');
      return;
    }

    setPaying(true);
    setError('');
    try {
      // Build the same schedule payload the invoice page uses.
      const payload = [];
      wards.forEach((ward) => {
        const fname = ward.name?.split(' ')[0] || '';
        const lname = ward.name?.split(' ').slice(1).join(' ') || '';
        (ward.payments || []).forEach((p) => {
          if (!selected[p.invoice_id]) return;
          payload.push({
            bursary_schedule_id: p.bursary_schedule_id,
            user_id: ward.id,
            session_term_id: p.session_term_id,
            amount: p.schedule_amount || p.payable,
            instValue: p.payable,
            paymentname: { name: p.payment_name, rev_code: p.rev_code },
            fee_bearer: p.fee_bearer || 'client',
            checked: true,
            fname,
            lname,
            payment_type: 'ONLINE',
          });
        });
      });

      const res = await createPendingPayment({ schedules: payload });
      if (res?.success) {
        const paymentData = res.data || [];
        if (paymentData.length === 0) {
          setError('Payment initiated but no gateway data returned. Please try again.');
          notify.error('Payment initiation failed');
          return;
        }
        const hash = res.xpress;
        const gatewayCode = res.gateway_code;
        const pubKey = res.pub_key;

        const data = paymentData.map((item) => ({
          ...item,
          gateway_code: gatewayCode,
          pub_key: pubKey,
          hash,
        }));

        makePayment(data, hash);
      } else {
        setError(res?.message || 'Payment initiation failed');
        notify.error(res?.message || 'Payment initiation failed');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Payment initiation failed');
      notify.error(err?.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  // Refresh after a successful gateway callback.
  useEffect(() => {
    const handler = () => {
      notify.success('Payment successful and confirmed!');
      loadPayments();
      setSelected({});
    };
    window.addEventListener('paymentCompleted', handler);
    return () => window.removeEventListener('paymentCompleted', handler);
  }, [loadPayments, notify]);

  return (
    <PageContainer title="Pay School Fees" description="Pay for one or more wards">
      <Button
        variant="text"
        color="primary"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Dashboard
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={160} />
          <Skeleton variant="rounded" height={160} />
        </Stack>
      ) : wards.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px dashed #D1D5DB' }}
        >
          <ReceiptLongOutlined sx={{ fontSize: 42, color: '#9CA3AF', mb: 1 }} />
          <Typography fontWeight={700} sx={{ color: '#374151' }}>
            No outstanding payments
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
            All fees for your wards are settled.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* ── Ward payment cards ── */}
          <Stack spacing={2}>
            {wards.map((ward) => {
              const wardSelected = (ward.payments || []).every((p) => selected[p.invoice_id]);
              const wardSome = (ward.payments || []).some((p) => selected[p.invoice_id]);
              const wardTotal = (ward.payments || []).reduce(
                (s, p) => s + (selected[p.invoice_id] ? Number(p.payable) || 0 : 0),
                0,
              );

              return (
                <Card
                  key={ward.id}
                  elevation={0}
                  sx={{
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
                  }}
                >
                  {/* Ward header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      p: '14px 16px',
                      bgcolor: '#F8FAFC',
                      borderBottom: '1px solid #F1F5F9',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 700 }}>
                        {initialsOf(ward.name)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700} sx={{ fontSize: '0.95rem', color: '#111827' }}>
                          {ward.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          {ward.payments?.length || 0} payment{(ward.payments?.length || 0) === 1 ? '' : 's'} ·{' '}
                          {naira(wardTotal)} selected
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Select All</Typography>
                      <Checkbox
                        size="small"
                        checked={wardSelected}
                        indeterminate={wardSome && !wardSelected}
                        onChange={(e) => toggleWard(ward.id, e.target.checked)}
                      />
                    </Stack>
                  </Box>

                  {/* Payment rows */}
                  <Box sx={{ p: '6px 16px' }}>
                    {(ward.payments || []).map((p) => (
                      <Box
                        key={p.invoice_id}
                        onClick={() => toggle(p.invoice_id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F3F4F6',
                          '&:last-child': { borderBottom: 0 },
                          borderRadius: '6px',
                          '&:hover': { bgcolor: '#F9FAFB' },
                          transition: 'background 0.15s',
                        }}
                      >
                        <Checkbox size="small" checked={!!selected[p.invoice_id]} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={600} sx={{ fontSize: '0.82rem', color: '#111827' }}>
                            {p.payment_name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                            {p.session_label}
                            {p.class_name ? ` · ${p.class_name}` : ''}
                          </Typography>
                        </Box>
                        <Stack alignItems="flex-end" spacing={0.25}>
                          <Typography fontWeight={700} sx={{ fontSize: '0.85rem', color: '#374151' }}>
                            {naira(p.payable)}
                          </Typography>
                          {p.status === 'complete' ? (
                            <Chip label="Paid" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: '#DCFCE7', color: '#166534' }} />
                          ) : (
                            <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF' }}>
                              Balance {naira(p.balance)}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </Card>
              );
            })}
          </Stack>

          {/* ── Sticky summary bar ── */}
          <Paper
            elevation={3}
            sx={{
              position: 'sticky',
              bottom: 16,
              zIndex: 10,
              mt: 3,
              p: 2,
              borderRadius: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {selectedCount} payment{selectedCount === 1 ? '' : 's'} selected
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={0.25}>
                <AccountBalanceWalletOutlined color="primary" fontSize="small" />
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {naira(totalPayable)}
                </Typography>
              </Stack>
            </Box>
            <Button
              variant="contained"
              size="large"
              disabled={totalPayable <= 0 || paying}
              startIcon={paying ? <CircularProgress size={18} color="inherit" /> : null}
              onClick={handlePay}
              sx={{ px: 4, py: 1.1, fontWeight: 700, textTransform: 'none' }}
            >
              {paying ? 'Initiating…' : 'Pay Now'}
            </Button>
          </Paper>
        </>
      )}
    </PageContainer>
  );
};

export default PaySchoolFees;
