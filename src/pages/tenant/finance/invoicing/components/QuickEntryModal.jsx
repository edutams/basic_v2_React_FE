import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconX, IconCheck } from '@tabler/icons';
import { INCOME_CATEGORIES } from '../constants';

const TITLES = {
  receipt: { title: 'Record Receipt', subtitle: 'Record a receipt for income already paid.' },
};

const validationSchema = Yup.object({
  description: Yup.string().required('Description is required'),
  payer: Yup.string().required('Payer / Source is required'),
  incomeAccount: Yup.string().required('Income account is required'),
  amount: Yup.number().typeError('Amount must be a number').positive().required('Amount is required'),
});

const QuickEntryModal = ({ open, onClose, mode = 'receipt', onSubmit }) => {
  const theme = useTheme();
  const copy = TITLES[mode] || TITLES.receipt;

  const formik = useFormik({
    initialValues: { description: '', payer: '', incomeAccount: '', amount: '' },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({ ...values, amount: Number(values.amount) });
      formik.resetForm();
      onClose();
    },
  });

  useEffect(() => {
    if (open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconCheck size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{copy.title}</Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
                {copy.subtitle}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Description <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., Hall Rental – Event Centre"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Payer / Source <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., ABC Events Ltd"
                name="payer"
                value={formik.values.payer}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.payer && Boolean(formik.errors.payer)}
                helperText={formik.touched.payer && formik.errors.payer}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Income Account <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
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
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="" disabled>
                    Select income account
                  </MenuItem>
                  {INCOME_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.incomeAccount && formik.errors.incomeAccount && (
                  <FormHelperText>{formik.errors.incomeAccount}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={12}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Amount (₦) <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="0.00"
                name="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            startIcon={<IconCheck size={18} />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default QuickEntryModal;
