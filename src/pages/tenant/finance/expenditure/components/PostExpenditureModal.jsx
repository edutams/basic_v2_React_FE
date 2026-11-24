import React, { useEffect, useRef, useState } from 'react';
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
  Chip,
  Typography,
  IconButton,
  RadioGroup,
  Radio,
  FormControlLabel,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  IconLayersIntersect,
  IconX,
  IconFileText,
  IconPlus,
  IconPaperclip,
  IconCloudUpload,
  IconTrash,
  IconCreditCard,
  IconHistory,
  IconDeviceFloppy,
  IconSend,
} from '@tabler/icons';
import {
  EXPENSE_CATEGORIES,
  EXPENDITURE_ACCOUNTS_BY_CATEGORY,
  VENDORS,
  generateRefNo,
  todayISO,
  formatDateDisplay,
  formatNaira,
} from '../constants';

const validationSchema = Yup.object({
  description: Yup.string().required('Description / Purpose is required'),
  category: Yup.string().required('Category is required'),
  account: Yup.string().required('Expenditure account is required'),
  vendor: Yup.string().required('Vendor / Supplier is required'),
  actualAmount: Yup.number().typeError('Amount must be a number').positive().required('Actual amount is required'),
  expenditureDate: Yup.string().required('Expenditure date is required'),
  amountToPay: Yup.number().typeError('Amount must be a number').positive().required('Amount to pay is required'),
  proposedPaymentDate: Yup.string().required('Proposed payment date is required'),
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

// Pre-filled with the CEO's example scenario (an in-progress expenditure
// receiving its 2nd installment) so the modal matches the shared design
// exactly. A real build would load this from the row the modal was opened
// from, and start empty for a brand-new "+ Post Expenditure" entry.
const initialValues = {
  description: 'Purchase of laboratory equipment',
  category: 'Teaching Materials',
  account: 'Laboratory & Science Equipment',
  vendor: 'TechNova Solutions',
  actualAmount: 250000,
  expenditureDate: '2025-11-14',
  remarks: 'Supply and installation of laboratory equipment for the science lab.',
  paymentType: 'installment',
  amountToPay: 75000,
  proposedPaymentDate: '2025-12-20',
  installmentNo: '2nd Instalment',
  paymentRemarks: 'Second instalment for the laboratory equipment.',
};

const previousPayments = [
  { no: 1, date: '2025-11-14', type: '1st Instalment (40%)', amount: 100000, balanceAfter: 150000, status: 'Paid' },
];

const PostExpenditureModal = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const [refNo, setRefNo] = useState('');
  const [attachedFile, setAttachedFile] = useState({ name: 'Vendor_Quotation.pdf', size: 1258291 });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit?.({ ...values, refNo, attachmentName: attachedFile?.name || null });
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      setRefNo(generateRefNo());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const accountOptions = EXPENDITURE_ACCOUNTS_BY_CATEGORY[formik.values.category] || [];

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    formik.setFieldValue('category', category);
    formik.setFieldValue('account', (EXPENDITURE_ACCOUNTS_BY_CATEGORY[category] || [])[0] || '');
  };

  const handlePickFile = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setAttachedFile(file);
  };
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  const actualAmount = Number(formik.values.actualAmount) || 0;
  const totalPaid = previousPayments.reduce((sum, p) => sum + p.amount, 0);
  const outstandingBalance = Math.max(0, actualAmount - totalPaid);
  const progressPct = actualAmount > 0 ? Math.min(100, (totalPaid / actualAmount) * 100) : 0;

  const amountToPay = Number(formik.values.amountToPay) || 0;
  const isFullPayment = formik.values.paymentType === 'full';
  const outstandingAfterPayment = isFullPayment
    ? 0
    : Math.max(0, outstandingBalance - amountToPay);

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
            <Typography sx={{ fontSize: 19, fontWeight: 700 }}>Post Expenditure</Typography>
            <Typography sx={{ fontSize: 12.5, opacity: 0.85, mt: 0.25 }}>
              Record a new expenditure and, where applicable, request payment (full or first instalment).
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <DialogContent sx={{ bgcolor: '#F8FAFC', p: { xs: 2, md: 2.5 }, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <Grid container spacing={2.5}>
            {/* ===================== Left: Expenditure Details ===================== */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', overflow: 'hidden', bgcolor: '#fff' }}>
                <SectionHeader icon={IconFileText} title="Expenditure Details" theme={theme} />
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <FieldLabel required>Description / Purpose</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Category</FieldLabel>
                      <FormControl fullWidth size="small" error={formik.touched.category && Boolean(formik.errors.category)}>
                        <Select value={formik.values.category} onChange={handleCategoryChange}>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Expenditure Account</FieldLabel>
                      <FormControl fullWidth size="small" error={formik.touched.account && Boolean(formik.errors.account)}>
                        <Select name="account" value={formik.values.account} onChange={formik.handleChange}>
                          {accountOptions.map((acc) => (
                            <MenuItem key={acc} value={acc}>
                              {acc}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <FieldLabel required>Vendor / Supplier</FieldLabel>
                        <Button
                          type="button"
                          size="small"
                          startIcon={<IconPlus size={14} />}
                          sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, py: 0 }}
                        >
                          New Vendor
                        </Button>
                      </Box>
                      <FormControl fullWidth size="small" error={formik.touched.vendor && Boolean(formik.errors.vendor)}>
                        <Select name="vendor" value={formik.values.vendor} onChange={formik.handleChange}>
                          {VENDORS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
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
                        value={formik.values.actualAmount}
                        onChange={formik.handleChange}
                        error={formik.touched.actualAmount && Boolean(formik.errors.actualAmount)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Reference No.</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        value={refNo}
                        InputProps={{ readOnly: true, sx: { bgcolor: theme.palette.action.hover } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Expenditure Date</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        name="expenditureDate"
                        value={formik.values.expenditureDate}
                        onChange={formik.handleChange}
                        error={formik.touched.expenditureDate && Boolean(formik.errors.expenditureDate)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Remarks (Optional)</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        name="remarks"
                        value={formik.values.remarks}
                        onChange={formik.handleChange}
                      />
                    </Grid>

                    <Grid size={12}>
                      <FieldLabel>Supporting Document</FieldLabel>
                      {attachedFile ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '8px',
                            p: 1,
                          }}
                        >
                          <IconPaperclip size={16} color={theme.palette.text.secondary} />
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {attachedFile.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                              {formatFileSize(attachedFile.size)}
                            </Typography>
                          </Box>
                          <IconButton type="button" size="small" onClick={() => setAttachedFile(null)}>
                            <IconTrash size={15} color={theme.palette.error.main} />
                          </IconButton>
                        </Box>
                      ) : null}
                      <Box
                        onClick={handlePickFile}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        sx={{
                          mt: attachedFile ? 1 : 0,
                          border: `1.5px dashed ${theme.palette.divider}`,
                          borderRadius: '8px',
                          p: 1.25,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.75,
                          cursor: 'pointer',
                          '&:hover': { borderColor: theme.palette.primary.main },
                        }}
                      >
                        <IconCloudUpload size={16} color={theme.palette.text.disabled} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: theme.palette.primary.main }}>
                          Add Document
                        </Typography>
                        <input ref={fileInputRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                      </Box>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                        (PDF, JPG, PNG • Max 10MB)
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* ===================== Right: Payment / Instalment Management ===================== */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', overflow: 'hidden', bgcolor: '#fff' }}>
                <SectionHeader icon={IconCreditCard} title="Payment / Instalment Management" theme={theme} />
                <Box sx={{ p: 2 }}>
                  {/* Stat chips */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <PaymentChip label="Actual Amount (Commitment)" value={formatNaira(actualAmount)} color={theme.palette.text.primary} bg="#F1F5F9" />
                    <PaymentChip label="Total Paid" value={formatNaira(totalPaid)} color="#15803D" bg="#DCFCE7" />
                    <PaymentChip label="Outstanding Balance" value={formatNaira(outstandingBalance)} color="#B45309" bg="#FEF3C7" />
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

                  {/* Previous payments */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <IconHistory size={14} color={theme.palette.text.secondary} />
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Previous Instalment Payments</Typography>
                  </Box>
                  <Table size="small" sx={{ mb: 2 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }}>#</TableCell>
                        <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }}>Payment Date</TableCell>
                        <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }}>Payment Type</TableCell>
                        <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }} align="right">Amount (₦)</TableCell>
                        <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }} align="right">Balance After (₦)</TableCell>
                        <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 11 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previousPayments.map((p) => (
                        <TableRow key={p.no}>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }}>{p.no}</TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }}>{formatDateDisplay(p.date)}</TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }}>{p.type}</TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }} align="right">{p.amount.toLocaleString('en-NG')}</TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12 }} align="right">{p.balanceAfter.toLocaleString('en-NG')}</TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5 }}>
                            <Chip label={p.status} size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 11, height: 20 }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Raise payment */}
                  <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>Raise Payment (New Instalment)</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <FieldLabel required>Payment Type</FieldLabel>
                      <RadioGroup
                        row
                        name="paymentType"
                        value={formik.values.paymentType}
                        onChange={formik.handleChange}
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
                        value={formik.values.amountToPay}
                        onChange={formik.handleChange}
                        disabled={isFullPayment}
                        error={formik.touched.amountToPay && Boolean(formik.errors.amountToPay)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Proposed Payment Date</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        name="proposedPaymentDate"
                        value={formik.values.proposedPaymentDate}
                        onChange={formik.handleChange}
                        error={formik.touched.proposedPaymentDate && Boolean(formik.errors.proposedPaymentDate)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Instalment No.</FieldLabel>
                      <FormControl fullWidth size="small" disabled={isFullPayment}>
                        <Select name="installmentNo" value={formik.values.installmentNo} onChange={formik.handleChange}>
                          {['2nd Instalment', '3rd Instalment', '4th Instalment'].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={12}>
                      <FieldLabel>Payment Remarks (Optional)</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        name="paymentRemarks"
                        value={formik.values.paymentRemarks}
                        onChange={formik.handleChange}
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
                      {formatNaira(outstandingAfterPayment.toFixed(2))}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
          <Button type="button" variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            startIcon={<IconDeviceFloppy size={16} />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<IconSend size={16} />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
          >
            Submit for Approval
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PostExpenditureModal;
