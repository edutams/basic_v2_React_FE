import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  IconFileInvoice,
  IconX,
  IconRefresh,
  IconHash,
  IconMail,
  IconSend,
  IconMailForward,
  IconCircleCheck,
  IconEye,
  IconListDetails,
  IconInfoCircle,
  IconDeviceFloppy,
  IconRotateClockwise,
} from '@tabler/icons';
import { useTenantBranding } from '@/hooks/useTenantBranding';
import EduTAMSLogo from '@/assets/images/logos/EduTAMS.jpeg';
import {
  INCOME_CATEGORIES,
  PAYERS,
  PAYMENT_TERMS,
  PAYMENT_METHODS,
  BANK_ACCOUNTS,
  TAX_OPTIONS,
  generateInvoiceNo,
  generateReceiptNo,
  todayISO,
  formatDateDisplay,
  formatNaira,
} from '../constants';

const validationSchema = Yup.object({
  invoiceDate: Yup.string().required('Invoice date is required'),
  dueDate: Yup.string().required('Due date is required'),
  invoiceCategory: Yup.string().required('Invoice category is required'),
  payer: Yup.string().required('Payer / Customer is required'),
  paymentTerms: Yup.string().required('Payment terms is required'),
  description: Yup.string().required('Description is required'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive()
    .required('Amount is required'),
});

const SectionHeader = ({ number, title, tone, note, theme }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 1,
      bgcolor: tone === 'green' ? '#DCFCE7' : '#DBEAFE',
      px: 2,
      py: 1.1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: tone === 'green' ? '#16A34A' : theme.palette.primary.main,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11.5,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {number}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{title}</Typography>
    </Box>
    {note && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconInfoCircle size={13} color="text.secondary" />
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>
          {note}
        </Typography>
      </Box>
    )}
  </Box>
);

const FieldLabel = ({ children, required }) => (
  <Typography sx={{ fontWeight: 600, fontSize: 12.5, mb: 0.5 }}>
    {children}{' '}
    {required && (
      <Box component="span" sx={{ color: 'error.main' }}>
        *
      </Box>
    )}
  </Typography>
);

const initialValues = {
  invoiceDate: todayISO(),
  dueDate: '',
  invoiceNo: '',
  invoiceCategory: 'School Fees',
  payer: '',
  paymentTerms: '30 Days',
  description: '',
  amount: '',
  discountValue: '',
  discountUnit: 'Amount (₦)',
  taxLabel: 'None',
  amountPaid: '',
  paymentMethod: 'Bank Transfer',
  bankAccount: BANK_ACCOUNTS[0],
  paymentReference: '',
  receiptDate: todayISO(),
  payerEmail: '',
};

const CreateInvoiceModal = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const branding = useTenantBranding();

  const [rightTab, setRightTab] = useState('preview');
  const [receiptNo, setReceiptNo] = useState('');
  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ lastSent: null, status: 'Not Sent' });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        amount: Number(values.amount) || 0,
        discountAmount,
        taxAmount,
        totalAmount,
        amountPaid: Number(values.amountPaid) || 0,
        outstanding,
        receiptNo: Number(values.amountPaid) > 0 ? receiptNo : '',
        status: outstanding <= 0 && Number(values.amountPaid) > 0 ? 'Paid' : 'Unpaid',
      });
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: { ...initialValues, invoiceNo: generateInvoiceNo() },
      });
      setReceiptNo(generateReceiptNo());
      setPaymentRecorded(false);
      setEmailStatus({ lastSent: null, status: 'Not Sent' });
      setRightTab('preview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { amount, discountValue, discountUnit, taxLabel, amountPaid, payer } = formik.values;

  const discountAmount = useMemo(() => {
    const amt = Number(amount) || 0;
    const disc = Number(discountValue) || 0;
    return discountUnit === 'Percentage (%)' ? (amt * disc) / 100 : disc;
  }, [amount, discountValue, discountUnit]);

  const taxRate = TAX_OPTIONS.find((t) => t.label === taxLabel)?.rate || 0;
  const taxableBase = Math.max((Number(amount) || 0) - discountAmount, 0);
  const taxAmount = taxableBase * taxRate;
  const totalAmount = taxableBase + taxAmount;
  const outstanding = Math.max(totalAmount - (Number(amountPaid) || 0), 0);

  const selectedPayer = PAYERS.find((p) => p.name === payer);

  const handleRegenerateInvoiceNo = () => formik.setFieldValue('invoiceNo', generateInvoiceNo());

  const handlePayerChange = (e) => {
    const name = e.target.value;
    formik.setFieldValue('payer', name);
    const found = PAYERS.find((p) => p.name === name);
    formik.setFieldValue('payerEmail', found?.email || '');
  };

  const handleRecordPayment = () => setPaymentRecorded(true);

  const handleSendEmail = () => setEmailStatus({ lastSent: new Date(), status: 'Sent' });
  const handleCheckMail = () => setEmailStatus((prev) => ({ ...prev, status: 'Delivered' }));

  const handleReset = () => {
    formik.resetForm({ values: { ...initialValues, invoiceNo: generateInvoiceNo() } });
    setReceiptNo(generateReceiptNo());
    setPaymentRecorded(false);
    setEmailStatus({ lastSent: null, status: 'Not Sent' });
  };

  const fieldInputSx = { '& .MuiOutlinedInput-root': { bgcolor: '#fff' } };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* ===================== Header ===================== */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#fff',
          px: 3,
          py: 2.25,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconFileInvoice size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 19, fontWeight: 700 }}>Create Invoice</Typography>
            <Typography sx={{ fontSize: 12.5, opacity: 0.85, mt: 0.25 }}>
              Generate a new invoice, send to payer and record payment when received.
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form
        onSubmit={formik.handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <DialogContent
          sx={{
            bgcolor: '#F8FAFC',
            p: { xs: 2, md: 2.5 },
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Grid container spacing={2.5}>
            {/* ===================== Left: form sections ===================== */}
            <Grid size={{ xs: 12, md: 7 }}>
              {/* ---- Section 1: Invoice Details ---- */}
              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '10px',
                  mb: 2,
                  overflow: 'hidden',
                }}
              >
                <SectionHeader number={1} title="Invoice Details" theme={theme} />
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Invoice Date</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        name="invoiceDate"
                        value={formik.values.invoiceDate}
                        onChange={formik.handleChange}
                        error={formik.touched.invoiceDate && Boolean(formik.errors.invoiceDate)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Due Date</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        name="dueDate"
                        value={formik.values.dueDate}
                        onChange={formik.handleChange}
                        error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Invoice No.</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        value={formik.values.invoiceNo}
                        InputProps={{
                          readOnly: true,
                          sx: { bgcolor: theme.palette.action.hover },
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="button"
                                size="small"
                                onClick={handleRegenerateInvoiceNo}
                              >
                                <IconRefresh size={16} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Invoice Category</FieldLabel>
                      <FormControl fullWidth size="small">
                        <Select
                          name="invoiceCategory"
                          value={formik.values.invoiceCategory}
                          onChange={formik.handleChange}
                        >
                          {INCOME_CATEGORIES.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Payer / Customer</FieldLabel>
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik.touched.payer && Boolean(formik.errors.payer)}
                      >
                        <Select
                          displayEmpty
                          name="payer"
                          value={formik.values.payer}
                          onChange={handlePayerChange}
                        >
                          <MenuItem value="" disabled>
                            Select payer
                          </MenuItem>
                          {PAYERS.map((p) => (
                            <MenuItem key={p.name} value={p.name}>
                              {p.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Payment Terms</FieldLabel>
                      <FormControl fullWidth size="small">
                        <Select
                          name="paymentTerms"
                          value={formik.values.paymentTerms}
                          onChange={formik.handleChange}
                        >
                          {PAYMENT_TERMS.map((term) => (
                            <MenuItem key={term} value={term}>
                              {term}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={12}>
                      <FieldLabel required>Description / Purpose</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g., Payment for School Fees – Second Term 2024/2025"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* ---- Section 2: Invoice Amount ---- */}
              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '10px',
                  mb: 2,
                  overflow: 'hidden',
                }}
              >
                <SectionHeader number={2} title="Invoice Amount" theme={theme} />
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Amount (₦)</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        name="amount"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        error={formik.touched.amount && Boolean(formik.errors.amount)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Discount (₦/%)</FieldLabel>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Enter amount or %"
                          name="discountValue"
                          value={formik.values.discountValue}
                          onChange={formik.handleChange}
                          sx={{ flexGrow: 1 }}
                        />
                        <FormControl size="small" sx={{ width: 140, flexShrink: 0 }}>
                          <Select
                            name="discountUnit"
                            value={formik.values.discountUnit}
                            onChange={formik.handleChange}
                          >
                            <MenuItem value="Amount (₦)">Amount (₦)</MenuItem>
                            <MenuItem value="Percentage (%)">Percentage (%)</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Tax (₦/%)</FieldLabel>
                      <FormControl fullWidth size="small">
                        <Select
                          name="taxLabel"
                          value={formik.values.taxLabel}
                          onChange={formik.handleChange}
                        >
                          {TAX_OPTIONS.map((t) => (
                            <MenuItem key={t.label} value={t.label}>
                              {t.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Total Amount (₦)</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        value={totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        InputProps={{
                          readOnly: true,
                          sx: { bgcolor: '#DBEAFE', fontWeight: 700 },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* ---- Section 3: Record Payment ---- */}
              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <SectionHeader
                  number={3}
                  title="Record Payment Against This Invoice"
                  tone="green"
                  note="Optional (Record when payment is received)"
                  theme={theme}
                />
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Amount Paid (₦)</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        name="amountPaid"
                        value={formik.values.amountPaid}
                        onChange={(e) => {
                          formik.handleChange(e);
                          setPaymentRecorded(false);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Payment Method</FieldLabel>
                      <FormControl fullWidth size="small">
                        <Select
                          name="paymentMethod"
                          value={formik.values.paymentMethod}
                          onChange={formik.handleChange}
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <MenuItem key={m} value={m}>
                              {m}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Bank Account</FieldLabel>
                      <FormControl fullWidth size="small">
                        <Select
                          name="bankAccount"
                          value={formik.values.bankAccount}
                          onChange={formik.handleChange}
                        >
                          {BANK_ACCOUNTS.map((b) => (
                            <MenuItem key={b} value={b}>
                              {b}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Payment Reference</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g., TRF-884533221"
                        name="paymentReference"
                        value={formik.values.paymentReference}
                        onChange={formik.handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconHash size={14} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel>Receipt Date</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        name="receiptDate"
                        value={formik.values.receiptDate}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel>Receipt No. (Auto)</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        value={receiptNo}
                        InputProps={{ readOnly: true, sx: { bgcolor: theme.palette.action.hover } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={handleRecordPayment}
                        disabled={!Number(formik.values.amountPaid)}
                        startIcon={<IconDeviceFloppy size={16} />}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                      >
                        {paymentRecorded ? 'Recorded' : 'Record Payment'}
                      </Button>
                    </Grid>

                    <Grid size={12}>
                      <Box
                        sx={{
                          bgcolor: '#FEF2F2',
                          borderRadius: '8px',
                          px: 1.5,
                          py: 1,
                          fontSize: 12.5,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                        }}
                      >
                        <Typography component="span" sx={{ fontSize: 12.5, fontWeight: 600 }}>
                          Payment Summary: Paid:{' '}
                          {formatNaira(Number(formik.values.amountPaid) || 0)}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: 12.5, color: 'text.disabled' }}
                        >
                          |
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: 12.5, fontWeight: 700, color: '#DC2626' }}
                        >
                          Outstanding: {formatNaira(outstanding)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* ===================== Right: preview + email ===================== */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  display: 'flex',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 2,
                }}
              >
                <Button
                  type="button"
                  onClick={() => setRightTab('preview')}
                  startIcon={<IconEye size={16} />}
                  sx={{
                    flex: 1,
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 1,
                    bgcolor: rightTab === 'preview' ? theme.palette.primary.main : '#fff',
                    color: rightTab === 'preview' ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor:
                        rightTab === 'preview'
                          ? theme.palette.primary.dark
                          : theme.palette.action.hover,
                    },
                  }}
                >
                  Invoice Preview
                </Button>
                <Button
                  type="button"
                  onClick={() => setRightTab('summary')}
                  startIcon={<IconListDetails size={16} />}
                  sx={{
                    flex: 1,
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 1,
                    bgcolor: rightTab === 'summary' ? theme.palette.primary.main : '#fff',
                    color: rightTab === 'summary' ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor:
                        rightTab === 'summary'
                          ? theme.palette.primary.dark
                          : theme.palette.action.hover,
                    },
                  }}
                >
                  Invoice Summary
                </Button>
              </Box>

              {rightTab === 'preview' ? (
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '10px',
                    p: 2,
                    mb: 2,
                    bgcolor: '#fff',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1.5,
                    }}
                  >
                    <Box
                      component="img"
                      src={EduTAMSLogo}
                      alt="EduTAMS"
                      sx={{ height: 30, objectFit: 'contain' }}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>
                        {branding.schoolName || 'Your School'}
                      </Typography>
                      {branding.address && (
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          {branding.address}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: '#EFF6FF',
                      borderRadius: '6px',
                      textAlign: 'center',
                      py: 0.75,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: theme.palette.primary.main,
                        letterSpacing: 1,
                      }}
                    >
                      INVOICE
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: 11.5 }}>
                    Invoice No.: <b>{formik.values.invoiceNo}</b>
                  </Typography>
                  <Typography sx={{ fontSize: 11.5 }}>
                    Invoice Date: {formatDateDisplay(formik.values.invoiceDate)}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, mb: 1.5 }}>
                    Due Date: {formatDateDisplay(formik.values.dueDate)}
                  </Typography>

                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: 'text.secondary' }}>
                    Bill To:
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                    {formik.values.payer || '—'}
                  </Typography>
                  {selectedPayer?.address && (
                    <Typography sx={{ fontSize: 10.5, color: 'text.secondary', mb: 1.5 }}>
                      {selectedPayer.address}
                    </Typography>
                  )}

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, px: 0.5 }}>
                          Description
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, px: 0.5 }} align="center">
                          Qty
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, px: 0.5 }} align="right">
                          Unit Price (₦)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, px: 0.5 }} align="right">
                          Amount (₦)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontSize: 11, px: 0.5 }}>
                          {formik.values.description || '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, px: 0.5 }} align="center">
                          1
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, px: 0.5 }} align="right">
                          {(Number(formik.values.amount) || 0).toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, px: 0.5 }} align="right">
                          {(Number(formik.values.amount) || 0).toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      bgcolor: '#DBEAFE',
                      px: 1.5,
                      py: 1,
                      mt: 1,
                      borderRadius: '6px',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 12 }}>Total Amount (₦)</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 12 }}>
                      {totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '10px',
                    p: 2,
                    mb: 2,
                    bgcolor: '#fff',
                  }}
                >
                  {[
                    ['Invoice No.', formik.values.invoiceNo],
                    ['Category', formik.values.invoiceCategory],
                    ['Payer', formik.values.payer || '—'],
                    ['Payment Terms', formik.values.paymentTerms],
                    ['Amount', formatNaira(Number(formik.values.amount) || 0)],
                    ['Discount', formatNaira(discountAmount)],
                    ['Tax', formatNaira(taxAmount)],
                    ['Total Amount', formatNaira(totalAmount)],
                    ['Amount Paid', formatNaira(Number(formik.values.amountPaid) || 0)],
                    ['Outstanding', formatNaira(outstanding)],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.75,
                        borderBottom: `1px dashed ${theme.palette.divider}`,
                        '&:last-of-type': { borderBottom: 'none' },
                      }}
                    >
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ bgcolor: '#EFF6FF', borderRadius: '10px', p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: theme.palette.primary.main,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconMail size={16} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Email Notification to Payer
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      Send this invoice to the payer via email and track the delivery status.
                    </Typography>
                  </Box>
                </Box>

                <FieldLabel required>Payer Email</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  name="payerEmail"
                  value={formik.values.payerEmail}
                  onChange={formik.handleChange}
                  sx={{ mb: 1.5, ...fieldInputSx }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconMail size={14} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleSendEmail}
                    startIcon={<IconSend size={15} />}
                    sx={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                  >
                    Send Invoice by Email
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCheckMail}
                    disabled={emailStatus.status === 'Not Sent'}
                    startIcon={<IconMailForward size={15} />}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '8px',
                      bgcolor: '#fff',
                    }}
                  >
                    Check Mail Notification
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: '#fff',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.9,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconCircleCheck size={14} color={theme.palette.success.main} />
                    <Typography sx={{ fontSize: 11.5 }}>
                      Last Sent:{' '}
                      {emailStatus.lastSent
                        ? emailStatus.lastSent.toLocaleTimeString('en-NG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '–'}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 11.5 }}>
                    Status: <b>{emailStatus.status}</b>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={handleReset}
            startIcon={<IconRotateClockwise size={16} />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Reset
          </Button>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<IconDeviceFloppy size={16} />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
            >
              Save Invoice
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateInvoiceModal;
