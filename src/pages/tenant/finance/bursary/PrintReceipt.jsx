import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import dayjs from 'dayjs';
import { fetchPrintReceipt } from '@/api/tenant/bursary/transactionApi';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import { decodeLinkParams } from '@/utils/scoreLinks';

const BRAND_COLOR = '#1e4db7';
const ACCENT_COLOR = '#05b2bd';
const GREEN = '#16A34A';

const initialsFrom = (name) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'S';

const DetailRow = ({ icon, label, value, big, sub, isLast }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: big ? 'flex-start' : 'center',
      gap: 1.5,
      py: 1.5,
      borderBottom: isLast ? 'none' : '1px solid #EEF2F6',
    }}
  >
    <Box sx={{ color: '#94a3b8', display: 'flex', mt: big ? 0.5 : 0 }}>{icon}</Box>
    <Box sx={{ minWidth: 130 }}>
      <Typography variant="body2" fontWeight={700} color="text.secondary">
        {label}
      </Typography>
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant={big ? 'h5' : 'body1'} fontWeight={700} sx={{ wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" display="block">
          {sub}
        </Typography>
      )}
    </Box>
  </Box>
);

const PrintReceipt = () => {
  const [searchParams] = useSearchParams();
  const linkParams = decodeLinkParams(searchParams.get('t'));
  const { order_id, bulk_order_id, user_id, session_term_id } = linkParams;

  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Neither order_id nor bulk_order_id is required on its own — a
    // session_term_id alone is enough to ask the backend for every
    // approved payment in that term as one consolidated receipt.
    if (!user_id || !(order_id || bulk_order_id || session_term_id)) {
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
  const hasPayments = Array.isArray(transaction) && transaction.length > 0;
  const paymentMethods = [
    ...new Set((transaction || []).map((t) => t.payment_type).filter(Boolean)),
  ].join(', ');
  const paymentFor = [...new Set((transaction || []).map((t) => t.name).filter(Boolean))].join(
    ', ',
  );
  const paymentCode = transaction?.[0]?.invoiceno;
  const paymentDate = transaction?.[0]?.trans_date;
  const generatedAt = dayjs().format('DD MMM YYYY, hh:mm A');
  const sessionLabel = [sessionDetails?.session?.session_name, sessionDetails?.term?.term_name]
    .filter(Boolean)
    .join(' — ');

  // The receipt's own authenticated URL — scanning it opens the exact same
  // receipt (on any device already signed in), since there's no public,
  // unauthenticated verification endpoint for this data.
  const qrValue = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <PageContainer title="Payment Receipt">
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
          maxWidth: 1000,
          margin: 'auto',
          background: '#fff',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB',
        }}
        className="receipt"
      >
        {/* Letterhead */}
        <Box sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            src={tenant?.school_logo || undefined}
            variant="rounded"
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#EEF2FF',
              color: BRAND_COLOR,
              fontSize: 22,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initialsFrom(tenant?.tenant_name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
              {tenant?.tenant_name}
            </Typography>
            {tenant?.address && (
              <Typography variant="body2" color="text.secondary">
                {tenant.address}
              </Typography>
            )}
            {tenant?.phone && (
              <Typography variant="body2" color="text.secondary">
                Tel: {tenant.phone}
              </Typography>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${BRAND_COLOR} 0%, ${ACCENT_COLOR} 100%)`,
          }}
        />

        {/* Status banner */}
        <Box
          sx={{
            mx: 4,
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: hasPayments ? '#F0FDF4' : '#FFF7ED',
            border: hasPayments ? '1px solid #BBF7D0' : '1px solid #FED7AA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: hasPayments ? GREEN : '#EA580C',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {hasPayments ? <ReceiptLongOutlinedIcon /> : <WarningAmberOutlinedIcon />}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                {hasPayments ? 'Payment Receipt' : 'No Payment Found'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasPayments
                  ? 'This payment has been successfully processed and confirmed.'
                  : `There is no recorded payment for ${studentName || 'this student'} in ${sessionLabel || 'this session/term'}.`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: hasPayments ? GREEN : '#EA580C',
                color: '#fff',
                borderRadius: '999px',
                px: 1.5,
                py: 0.5,
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {hasPayments ? (
                <CheckCircleIcon sx={{ fontSize: 16 }} />
              ) : (
                <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} />
              )}
              {hasPayments ? 'APPROVED' : 'NO PAYMENT'}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              {hasPayments
                ? 'Payment successfully received'
                : 'No payment on record for this period'}
            </Typography>
          </Box>
        </Box>

        {/* Details + QR */}
        <Box sx={{ px: 4, py: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 420px' }}>
            <DetailRow
              icon={<PersonOutlineIcon />}
              label="Payee Name"
              value={studentName}
              sub={[user?.class_name, user?.class_arm].filter(Boolean).join(' - ') || undefined}
            />
            {/* <DetailRow
              icon={<SchoolOutlinedIcon />}
              label="School Name"
              value={tenant?.tenant_name}
              sub={tenant?.tenant_short_name}
            /> */}
            <DetailRow
              icon={<EventNoteOutlinedIcon />}
              label="Session / Term"
              value={sessionLabel}
              big
              isLast={!hasPayments}
            />
            {hasPayments ? (
              <>
                <DetailRow
                  icon={<DescriptionOutlinedIcon />}
                  label="Payment Code"
                  value={paymentCode}
                />
                <DetailRow icon={<PaymentsOutlinedIcon />} label="Payment For" value={paymentFor} />
                <DetailRow
                  icon={<CreditCardOutlinedIcon />}
                  label="Payment Method"
                  value={paymentMethods}
                />
                <DetailRow
                  icon={<PaidOutlinedIcon />}
                  label="Amount Paid"
                  value={`₦${Number(total).toLocaleString()}`}
                  big
                  isLast
                />
              </>
            ) : (
              <Box
                sx={{
                  mt: 1.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#FFF7ED',
                  border: '1px solid #FED7AA',
                }}
              >
                <Typography variant="body2" fontWeight={700} color="#9A3412">
                  No payment has been made by {studentName || 'this student'} for{' '}
                  {sessionLabel || 'the selected session and term'}.
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flex: '0 1 220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              borderLeft: { md: '1px solid #EEF2F6' },
              pl: { md: 3 },
            }}
          >
            {qrValue && (
              <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <QRCodeSVG value={qrValue} size={120} level="H" />
              </Box>
            )}
            <Typography variant="subtitle2" fontWeight={700} mt={1.5}>
              View This Receipt
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Scan the code to open this exact receipt on another device.
            </Typography>
          </Box>
        </Box>

        {transaction?.length > 1 && (
          <Box sx={{ px: 4, pb: 3 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              display="block"
              mb={1}
            >
              Items Paid In This Receipt
            </Typography>
            <TableContainer sx={{ border: '1px solid #EEF2F6', borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.75rem' } }}
                  >
                    <TableCell>Payment Item</TableCell>
                    <TableCell align="right">Amount (₦)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transaction.map((t, index) => (
                    <TableRow key={index}>
                      <TableCell>{t.name || t.description}</TableCell>
                      <TableCell align="right">{Number(t.amount_paid).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {hasPayments && (
          <>
            <Divider />

            {/* Payment date / channel / status strip */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                bgcolor: '#F8FAFC',
              }}
            >
              <Box
                sx={{ flex: '1 1 220px', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <CalendarMonthOutlinedIcon sx={{ color: '#94a3b8' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payment Date
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {paymentDate ? dayjs(paymentDate).format('DD MMM YYYY, hh:mm A') : '—'}
                  </Typography>
                </Box>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: 'none', md: 'block' } }}
              />
              <Box
                sx={{ flex: '1 1 220px', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <CreditCardOutlinedIcon sx={{ color: '#94a3b8' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payment Channel
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {paymentMethods || '—'}
                  </Typography>
                </Box>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: 'none', md: 'block' } }}
              />
              <Box
                sx={{ flex: '1 1 220px', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <CheckCircleIcon sx={{ color: GREEN }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Transaction Status
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color={GREEN}>
                    Approved
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}

        <Divider />

        {/* Footer info */}
        <Box
          sx={{
            px: 4,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ flex: '1 1 320px' }}>
            <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLOR}>
              Payment Processing Information
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {hasPayments ? (
                <>
                  This payment was processed through {tenant?.tenant_name}'s bursary management
                  system{sessionLabel && <> for {sessionLabel}</>}. The transaction has been
                  confirmed and recorded against the student's account.
                </>
              ) : (
                <>
                  This receipt was generated by {tenant?.tenant_name}'s bursary management system.
                  No approved payment is on record for {studentName || 'this student'}
                  {sessionLabel && <> in {sessionLabel}</>}.
                </>
              )}
            </Typography>
          </Box>
          <Avatar
            src={tenant?.school_logo || undefined}
            variant="rounded"
            sx={{ width: 48, height: 48, bgcolor: '#EEF2FF', color: BRAND_COLOR, fontWeight: 700 }}
          >
            {initialsFrom(tenant?.tenant_name)}
          </Avatar>
        </Box>

        <Box
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {hasPayments ? (
              <>
                Payment Code: <strong>{paymentCode}</strong>
              </>
            ) : (
              <strong>No payment reference — no payment on record</strong>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Generated on: {generatedAt}
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
