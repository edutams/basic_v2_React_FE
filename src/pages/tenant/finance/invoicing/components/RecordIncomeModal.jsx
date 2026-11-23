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
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  IconDatabase,
  IconX,
  IconRefresh,
  IconHash,
  IconFileText,
  IconLayersIntersect,
  IconBook2,
  IconUser,
  IconCreditCard,
  IconBuildingBank,
  IconPaperclip,
  IconCloudUpload,
  IconRotateClockwise,
  IconDeviceFloppy,
  IconChartBar,
} from '@tabler/icons';
import {
  INCOME_CATEGORIES,
  INCOME_ACCOUNTS_BY_CATEGORY,
  PAYERS,
  PAYMENT_METHODS,
  BANK_ACCOUNTS,
  generateReceiptNo,
  todayISO,
  formatNaira,
} from '../constants';

const validationSchema = Yup.object({
  incomeDate: Yup.string().required('Income date is required'),
  incomeCategory: Yup.string().required('Income category is required'),
  incomeAccount: Yup.string().required('Income account is required'),
  payer: Yup.string().required('Payer / Source is required'),
  description: Yup.string().required('Description is required'),
  amount: Yup.number().typeError('Amount must be a number').positive().required('Amount is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
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

const SummaryRow = ({ icon: Icon, label, value, highlight, theme }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1,
      px: 1.25,
      py: 1,
      borderRadius: '8px',
      bgcolor: highlight ? '#DCFCE7' : 'transparent',
    }}
  >
    <Icon size={15} color={highlight ? '#16A34A' : theme.palette.text.secondary} style={{ marginTop: 2, flexShrink: 0 }} />
    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: highlight ? '#15803D' : 'text.primary' }}>
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

const initialValues = {
  incomeDate: todayISO(),
  incomeCategory: '',
  incomeAccount: '',
  payer: '',
  description: '',
  amount: '',
  paymentMethod: 'Bank Transfer',
  bankAccount: BANK_ACCOUNTS[0],
  paymentReference: '',
};

const RecordIncomeModal = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const [receiptNo, setReceiptNo] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        amount: Number(values.amount) || 0,
        receiptNo,
        attachmentName: attachedFile?.name || null,
      });
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: initialValues });
      setReceiptNo(generateReceiptNo());
      setAttachedFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const accountOptions = INCOME_ACCOUNTS_BY_CATEGORY[formik.values.incomeCategory] || [];

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    formik.setFieldValue('incomeCategory', category);
    formik.setFieldValue('incomeAccount', (INCOME_ACCOUNTS_BY_CATEGORY[category] || [])[0] || '');
  };

  const handleRegenerateReceiptNo = () => setReceiptNo(generateReceiptNo());

  const handleReset = () => {
    formik.resetForm({ values: initialValues });
    setReceiptNo(generateReceiptNo());
    setAttachedFile(null);
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
            <IconDatabase size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 19, fontWeight: 700 }}>Record Income</Typography>
            <Typography sx={{ fontSize: 12.5, opacity: 0.85, mt: 0.25 }}>
              Capture a new income receipt and update the school financial records.
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
        <DialogContent sx={{ bgcolor: '#F8FAFC', p: { xs: 2, md: 2.5 }, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <Grid container spacing={2.5}>
            {/* ===================== Left: form ===================== */}
            <Grid size={{ xs: 12, md: 7.5 }}>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', mb: 2, overflow: 'hidden' }}>
                <SectionHeader icon={IconFileText} title="Income Details" theme={theme} />
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Income Date</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        name="incomeDate"
                        value={formik.values.incomeDate}
                        onChange={formik.handleChange}
                        error={formik.touched.incomeDate && Boolean(formik.errors.incomeDate)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Receipt No.</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        value={receiptNo}
                        InputProps={{
                          readOnly: true,
                          sx: { bgcolor: theme.palette.action.hover },
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton type="button" size="small" onClick={handleRegenerateReceiptNo}>
                                <IconRefresh size={16} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Income Category</FieldLabel>
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik.touched.incomeCategory && Boolean(formik.errors.incomeCategory)}
                      >
                        <Select displayEmpty value={formik.values.incomeCategory} onChange={handleCategoryChange}>
                          <MenuItem value="" disabled>
                            Select category
                          </MenuItem>
                          {INCOME_CATEGORIES.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Income Account</FieldLabel>
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik.touched.incomeAccount && Boolean(formik.errors.incomeAccount)}
                      >
                        <Select
                          displayEmpty
                          name="incomeAccount"
                          value={formik.values.incomeAccount}
                          onChange={formik.handleChange}
                          disabled={!formik.values.incomeCategory}
                        >
                          <MenuItem value="" disabled>
                            Select account
                          </MenuItem>
                          {accountOptions.map((acc) => (
                            <MenuItem key={acc} value={acc}>
                              {acc}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>Payer / Source</FieldLabel>
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik.touched.payer && Boolean(formik.errors.payer)}
                      >
                        <Select
                          displayEmpty
                          name="payer"
                          value={formik.values.payer}
                          onChange={formik.handleChange}
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
                      <FieldLabel required>Description / Purpose</FieldLabel>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g., Hall Rental – Event Centre (3 Days)"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', mb: 2, overflow: 'hidden' }}>
                <SectionHeader icon={IconCreditCard} title="Amount & Payment" theme={theme} />
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
                      <FieldLabel required>Payment Method</FieldLabel>
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
                  </Grid>
                </Box>
              </Box>

              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', overflow: 'hidden' }}>
                <SectionHeader icon={IconPaperclip} title="Attachments" note="(Optional)" theme={theme} />
                <Box sx={{ p: 2, bgcolor: '#fff', display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box
                    onClick={handlePickFile}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    sx={{
                      flex: 1,
                      minWidth: 220,
                      border: `1.5px dashed ${theme.palette.divider}`,
                      borderRadius: '10px',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { borderColor: theme.palette.primary.main },
                    }}
                  >
                    <IconCloudUpload size={22} color={theme.palette.text.disabled} />
                    <Typography sx={{ fontSize: 12.5, mt: 0.5 }}>
                      Drag and drop file here, or{' '}
                      <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                        click to browse
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                      Supported: PDF, JPG, PNG (Max: 5MB)
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </Box>

                  {attachedFile && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '10px',
                        p: 1.25,
                        minWidth: 200,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: '#FEE2E2',
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconFileText size={16} />
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {attachedFile.name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                          {formatFileSize(attachedFile.size)}
                        </Typography>
                      </Box>
                      <IconButton type="button" size="small" onClick={() => setAttachedFile(null)}>
                        <IconX size={15} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* ===================== Right: summary ===================== */}
            <Grid size={{ xs: 12, md: 4.5 }}>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '10px', overflow: 'hidden', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <IconChartBar size={16} color={theme.palette.primary.main} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Income Summary</Typography>
                </Box>
                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <SummaryRow icon={IconLayersIntersect} label="Income Category" value={formik.values.incomeCategory} theme={theme} />
                  <SummaryRow icon={IconBook2} label="Income Account" value={formik.values.incomeAccount} theme={theme} />
                  <SummaryRow icon={IconUser} label="Payer / Source" value={formik.values.payer} theme={theme} />
                  <SummaryRow icon={IconFileText} label="Description" value={formik.values.description} theme={theme} />
                  <SummaryRow
                    icon={IconLayersIntersect}
                    label="Amount"
                    value={formik.values.amount ? formatNaira(Number(formik.values.amount)) : ''}
                    highlight
                    theme={theme}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
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
              Save Income
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecordIncomeModal;
