import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Typography,
  IconButton,
  RadioGroup,
  Radio,
  FormControlLabel,
  LinearProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconLayersIntersect, IconX, IconFileText, IconPlus, IconCreditCard, IconHistory, IconSend } from '@tabler/icons';
import tenantApi from '@/api/tenant/tenant_api';
import AddVendorModal from '../../vendor-management/components/AddVendorModal';
import { formatDateDisplay, formatNaira, todayISO } from '../constants';

const createValidationSchema = Yup.object({
  description: Yup.string().required('Description / Purpose is required'),
  chartOfAccountId: Yup.string().required('Expenditure account is required'),
  vendorId: Yup.string(),
  actualAmount: Yup.number().typeError('Amount must be a number').positive().required('Actual amount is required'),
  expenditureDate: Yup.string().required('Expenditure date is required'),
  paymentType: Yup.string().required(),
  amountToPay: Yup.number().typeError('Amount must be a number').positive().required('Amount to pay is required'),
});

const installmentValidationSchema = Yup.object({
  amount: Yup.number().typeError('Amount must be a number').positive().required('Amount to pay is required'),
  paymentDate: Yup.string().required('Payment date is required'),
});

const SectionHeader = ({ icon: Icon, title, note, theme }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      bgcolor: '#DBEAFE',
      px: 2,
      py: 1.1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon size={16} color={theme.palette.primary.main} />
      <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
        {title} {note && <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>{note}</Box>}
      </Typography>
    </Box>
  </Box>
);

const FieldLabel = ({ children, required }) => (
  <Typography sx={{ fontWeight: 600, fontSize: 12.5, mb: 0.5 }}>
    {children} {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
  </Typography>
);

const PaymentChip = ({ label, value, color, bg }) => (
  <Box sx={{ borderRadius: '10px', bgcolor: bg, p: 1.25, flex: 1, minWidth: 0 }}>
    <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
    <Typography sx={{ fontSize: 15, fontWeight: 800, color, mt: 0.25 }}>{value}</Typography>
  </Box>
);

const INSTALLMENT_STATUS_META = {
  approved: { label: 'Approved', bg: '#DCFCE7', color: '#15803D' },
  pending_approval: { label: 'Pending Approval', bg: '#DBEAFE', color: '#1D4ED8' },
  rejected: { label: 'Rejected', bg: '#FEE2E2', color: '#DC2626' },
};

/**
 * `entry` null => creating a brand-new expenditure (left panel editable,
 * this submission is both the entry and its first installment/full payment
 * together). `entry` set => raising the next installment on an existing
 * entry (left panel read-only, right panel shows real installment history
 * and validates against the real remaining budget).
 */
const PostExpenditureModal = ({ open, onClose, entry, onSaved }) => {
  const theme = useTheme();
  const isAddInstallment = Boolean(entry);

  const [chartAccounts, setChartAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const createFormik = useFormik({
    initialValues: {
      description: '',
      chartOfAccountId: '',
      vendorId: '',
      actualAmount: '',
      expenditureDate: todayISO(),
      remarks: '',
      paymentType: 'full',
      amountToPay: '',
      paymentDate: todayISO(),
      paymentRemarks: '',
    },
    validationSchema: createValidationSchema,
    onSubmit: (values) => {
      setServerError('');
      setSubmitting(true);
      tenantApi
        .post('/expenditure/create_entry', {
          description: values.description,
          chart_of_account_id: values.chartOfAccountId,
          vendor_id: values.vendorId || null,
          actual_amount: values.actualAmount,
          entry_date: values.expenditureDate,
          payment_type: values.paymentType,
          amount_to_pay: values.paymentType === 'full' ? values.actualAmount : values.amountToPay,
          payment_date: values.paymentDate,
          remarks: values.paymentRemarks,
        })
        .then(() => {
          onSaved?.();
          onClose();
        })
        .catch((err) => setServerError(err.response?.data?.message || 'Something went wrong. Please try again.'))
        .finally(() => setSubmitting(false));
    },
  });

  const installmentFormik = useFormik({
    initialValues: { amount: '', paymentDate: todayISO(), description: '' },
    validationSchema: installmentValidationSchema,
    onSubmit: (values) => {
      setServerError('');
      setSubmitting(true);
      tenantApi
        .post(`/expenditure/${entry.id}/submit_installment`, {
          amount: values.amount,
          payment_date: values.paymentDate,
          description: values.description,
        })
        .then(() => {
          onSaved?.();
          onClose();
        })
        .catch((err) => setServerError(err.response?.data?.message || 'Something went wrong. Please try again.'))
        .finally(() => setSubmitting(false));
    },
  });

  const fetchVendors = () => {
    tenantApi
      .get('/vendor_manager/fetch_vendors', { params: { status: 'active' } })
      .then((res) => setVendors(res.data?.data || []))
      .catch(() => setVendors([]));
  };

  useEffect(() => {
    if (open) {
      setServerError('');
      createFormik.resetForm();
      installmentFormik.resetForm();
      tenantApi
        .get('/chart_of_accounts/fetch_detail_options', { params: { category: 'expenditure' } })
        .then((res) => setChartAccounts(res.data?.data || []))
        .catch(() => setChartAccounts([]));
      fetchVendors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleVendorCreated = (payload) => {
    tenantApi
      .post('/vendor_manager/create_vendor', payload)
      .then((res) => {
        setAddVendorOpen(false);
        fetchVendors();
        const newVendor = res.data?.data;
        if (newVendor) createFormik.setFieldValue('vendorId', String(newVendor.id));
      })
      .catch(() => {});
  };

  // ===================== Add-installment mode numbers (real) =====================
  const installments = entry?.installments || [];
  const approvedOrPending = installments.filter((i) => i.status !== 'rejected');
  const reserved = approvedOrPending.reduce((sum, i) => sum + Number(i.amount), 0);
  const actualAmount = Number(entry?.actual_amount || 0);
  const totalPaid = Number(entry?.paid_amount || 0);
  const maxPostable = Math.max(0, actualAmount - reserved);
  const progressPct = actualAmount > 0 ? Math.min(100, (totalPaid / actualAmount) * 100) : 0;
  const exceedsMax = Number(installmentFormik.values.amount || 0) > maxPostable;
  const outstandingAfterPayment = Math.max(0, Number(entry?.balance_amount || 0) - Number(installmentFormik.values.amount || 0));
  const hasPendingInstallment = installments.some((i) => i.status === 'pending_approval');
  const canRaisePayment = isAddInstallment && entry.status === 'active' && Number(entry.balance_amount) > 0 && !hasPendingInstallment;

  // ===================== Create mode numbers =====================
  const createActualAmount = Number(createFormik.values.actualAmount) || 0;
  const createAmountToPay = createFormik.values.paymentType === 'full' ? createActualAmount : Number(createFormik.values.amountToPay) || 0;
  const createExceedsMax = createAmountToPay > createActualAmount;
  const createOutstandingAfter = Math.max(0, createActualAmount - createAmountToPay);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: { borderRadius: '16px', overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* ===================== Header ===================== */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#fff',
          px: 3,
          py: 2.25,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
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
            <IconLayersIntersect size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 19, fontWeight: 700 }}>
              {isAddInstallment ? `Raise Payment — ${entry.ref_no}` : 'Post Expenditure'}
            </Typography>
            <Typography sx={{ fontSize: 12.5, opacity: 0.85, mt: 0.25 }}>
              {isAddInstallment
                ? 'Raise the next instalment payment request for this expenditure.'
                : 'Record a new expenditure and, where applicable, request payment (full or first instalment).'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form
        onSubmit={isAddInstallment ? installmentFormik.handleSubmit : createFormik.handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <DialogContent sx={{ bgcolor: '#F8FAFC', p: { xs: 2, md: 2.5 }, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Grid container spacing={2.5}>
            {/* ===================== Left: Expenditure Details ===================== */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', overflow: 'hidden', bgcolor: '#fff' }}>
                <SectionHeader icon={IconFileText} title="Expenditure Details" theme={theme} />
                <Box sx={{ p: 2 }}>
                  {isAddInstallment ? (
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <FieldLabel>Description / Purpose</FieldLabel>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{entry.description}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>Expenditure Account</FieldLabel>
                        <Typography sx={{ fontSize: 13.5 }}>{entry.chart_of_account?.name || '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>Vendor / Supplier</FieldLabel>
                        <Typography sx={{ fontSize: 13.5 }}>{entry.vendor?.name || '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>Reference No.</FieldLabel>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{entry.ref_no}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel>Actual (Commitment) Amount (₦)</FieldLabel>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{formatNaira(actualAmount)}</Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <FieldLabel required>Description / Purpose</FieldLabel>
                        <TextField
                          fullWidth
                          size="small"
                          name="description"
                          value={createFormik.values.description}
                          onChange={createFormik.handleChange}
                          error={createFormik.touched.description && Boolean(createFormik.errors.description)}
                        />
                      </Grid>

                      <Grid size={12}>
                        <FieldLabel required>Expenditure Account</FieldLabel>
                        <FormControl
                          fullWidth
                          size="small"
                          error={createFormik.touched.chartOfAccountId && Boolean(createFormik.errors.chartOfAccountId)}
                        >
                          <Select
                            displayEmpty
                            name="chartOfAccountId"
                            value={createFormik.values.chartOfAccountId}
                            onChange={createFormik.handleChange}
                          >
                            <MenuItem value="" disabled>
                              Select account
                            </MenuItem>
                            {chartAccounts.map((acc) => (
                              <MenuItem key={acc.id} value={String(acc.id)}>
                                {acc.code} — {acc.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <FieldLabel>Vendor / Supplier</FieldLabel>
                          <Button
                            type="button"
                            size="small"
                            onClick={() => setAddVendorOpen(true)}
                            startIcon={<IconPlus size={14} />}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, py: 0 }}
                          >
                            New Vendor
                          </Button>
                        </Box>
                        <FormControl fullWidth size="small">
                          <Select
                            displayEmpty
                            name="vendorId"
                            value={createFormik.values.vendorId}
                            onChange={createFormik.handleChange}
                          >
                            <MenuItem value="">No vendor</MenuItem>
                            {vendors.map((v) => (
                              <MenuItem key={v.id} value={String(v.id)}>
                                {v.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel required>Actual (Commitment) Amount (₦)</FieldLabel>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="actualAmount"
                          value={createFormik.values.actualAmount}
                          onChange={createFormik.handleChange}
                          error={createFormik.touched.actualAmount && Boolean(createFormik.errors.actualAmount)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FieldLabel required>Expenditure Date</FieldLabel>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          name="expenditureDate"
                          value={createFormik.values.expenditureDate}
                          onChange={createFormik.handleChange}
                          error={createFormik.touched.expenditureDate && Boolean(createFormik.errors.expenditureDate)}
                        />
                      </Grid>

                      <Grid size={12}>
                        <FieldLabel>Remarks (Optional)</FieldLabel>
                        <TextField
                          fullWidth
                          size="small"
                          name="remarks"
                          value={createFormik.values.remarks}
                          onChange={createFormik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* ===================== Right: Payment / Instalment Management ===================== */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', overflow: 'hidden', bgcolor: '#fff' }}>
                <SectionHeader icon={IconCreditCard} title="Payment / Instalment Management" theme={theme} />
                <Box sx={{ p: 2 }}>
                  {isAddInstallment && (
                    <>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <PaymentChip label="Actual Amount (Commitment)" value={formatNaira(actualAmount)} color={theme.palette.text.primary} bg="#F1F5F9" />
                        <PaymentChip label="Total Paid" value={formatNaira(totalPaid)} color="#15803D" bg="#DCFCE7" />
                        <PaymentChip label="Outstanding Balance" value={formatNaira(entry.balance_amount)} color="#B45309" bg="#FEF3C7" />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: 'text.secondary' }}>
                            Payment Progress
                          </Typography>
                          <Typography sx={{ fontSize: 11.5, fontWeight: 700 }}>{Math.round(progressPct)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progressPct}
                          sx={{ height: 8, borderRadius: 4, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                        <IconHistory size={14} color={theme.palette.text.secondary} />
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Previous Instalment Payments</Typography>
                      </Box>
                      <Table size="small" sx={{ mb: 2 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }}>#</TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }}>Payment Date</TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }} align="right">Amount (₦)</TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {installments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} sx={{ px: 0.75, py: 1, fontSize: 12, color: 'text.secondary' }}>
                                No instalments yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            installments.map((p) => {
                              const meta = INSTALLMENT_STATUS_META[p.status];
                              return (
                                <TableRow key={p.id}>
                                  <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }}>{p.sequence_no}</TableCell>
                                  <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }}>{formatDateDisplay(p.payment_date)}</TableCell>
                                  <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }} align="right">{Number(p.amount).toLocaleString('en-NG')}</TableCell>
                                  <TableCell sx={{ px: 0.75, py: 0.5 }}>
                                    <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 11, height: 20 }} />
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>

                      {canRaisePayment ? (
                        <>
                          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>Raise Payment (New Instalment)</Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FieldLabel required>Amount to Pay (₦)</FieldLabel>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                name="amount"
                                value={installmentFormik.values.amount}
                                onChange={installmentFormik.handleChange}
                                error={(installmentFormik.touched.amount && Boolean(installmentFormik.errors.amount)) || exceedsMax}
                                helperText={exceedsMax ? `Maximum you can post is ${formatNaira(maxPostable)}.` : ' '}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FieldLabel required>Payment Date</FieldLabel>
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                name="paymentDate"
                                value={installmentFormik.values.paymentDate}
                                onChange={installmentFormik.handleChange}
                                error={installmentFormik.touched.paymentDate && Boolean(installmentFormik.errors.paymentDate)}
                              />
                            </Grid>
                            <Grid size={12}>
                              <FieldLabel>Payment Remarks (Optional)</FieldLabel>
                              <TextField
                                fullWidth
                                size="small"
                                name="description"
                                value={installmentFormik.values.description}
                                onChange={installmentFormik.handleChange}
                              />
                            </Grid>
                          </Grid>

                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              bgcolor: '#DCFCE7',
                              borderRadius: '8px',
                              px: 1.5,
                              py: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#15803D' }}>
                              Outstanding Balance After This Payment:
                            </Typography>
                            <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#15803D' }}>
                              {formatNaira(outstandingAfterPayment)}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Alert severity={entry.status === 'rejected' ? 'error' : hasPendingInstallment ? 'info' : 'success'}>
                          {entry.status === 'rejected'
                            ? 'This entry was rejected. Raise a new expenditure instead.'
                            : hasPendingInstallment
                              ? 'A payment request is already pending approval for this entry.'
                              : 'This expenditure has been paid in full.'}
                        </Alert>
                      )}
                    </>
                  )}

                  {!isAddInstallment && (
                    <>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>Payment</Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 7 }}>
                          <FieldLabel required>Payment Type</FieldLabel>
                          <RadioGroup
                            row
                            name="paymentType"
                            value={createFormik.values.paymentType}
                            onChange={createFormik.handleChange}
                          >
                            <FormControlLabel value="full" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 12.5 }}>Full Payment</Typography>} />
                            <FormControlLabel value="installment" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 12.5 }}>Instalment Payment</Typography>} />
                          </RadioGroup>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <FieldLabel required>Amount to Pay (₦)</FieldLabel>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            name="amountToPay"
                            value={createFormik.values.paymentType === 'full' ? createActualAmount || '' : createFormik.values.amountToPay}
                            onChange={createFormik.handleChange}
                            disabled={createFormik.values.paymentType === 'full'}
                            error={(createFormik.touched.amountToPay && Boolean(createFormik.errors.amountToPay)) || createExceedsMax}
                            helperText={createExceedsMax ? 'Cannot exceed the actual amount.' : ' '}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FieldLabel required>Proposed Payment Date</FieldLabel>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            name="paymentDate"
                            value={createFormik.values.paymentDate}
                            onChange={createFormik.handleChange}
                          />
                        </Grid>

                        <Grid size={12}>
                          <FieldLabel>Payment Remarks (Optional)</FieldLabel>
                          <TextField
                            fullWidth
                            size="small"
                            name="paymentRemarks"
                            value={createFormik.values.paymentRemarks}
                            onChange={createFormik.handleChange}
                          />
                        </Grid>
                      </Grid>

                      <Box
                        sx={{
                          mt: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: '#DCFCE7',
                          borderRadius: '8px',
                          px: 1.5,
                          py: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#15803D' }}>
                          Outstanding Balance After This Payment:
                        </Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#15803D' }}>
                          {formatNaira(createOutstandingAfter)}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
          <Button type="button" variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
            {isAddInstallment && !canRaisePayment ? 'Close' : 'Cancel'}
          </Button>
          {(!isAddInstallment || canRaisePayment) && (
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || (isAddInstallment ? exceedsMax : createExceedsMax)}
              startIcon={<IconSend size={16} />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
            >
              Submit for Approval
            </Button>
          )}
        </DialogActions>
      </form>

      <AddVendorModal open={addVendorOpen} onClose={() => setAddVendorOpen(false)} onSubmit={handleVendorCreated} />
    </Dialog>
  );
};

export default PostExpenditureModal;
