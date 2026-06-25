import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  bank: Yup.string().required('Bank Name is required'),
  accountName: Yup.string().required('Account Name is required'),
  accountNo: Yup.string()
    .matches(/^[0-9]+$/, 'Account Number must contain only digits')
    .min(10, 'Account Number must be at least 10 digits')
    .required('Account Number is required'),
});

const BankAccountModal = ({ open, onClose, mode, selectedRow, onSubmit }) => {
  const formik = useFormik({
    initialValues: {
      bank: '',
      accountName: '',
      accountNo: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && selectedRow) {
        formik.setValues({
          bank: selectedRow.bank || '',
          accountName: selectedRow.accountName || '',
          accountNo: selectedRow.accountNo || '',
        });
      } else {
        formik.resetForm();
      }
    }
  }, [open, mode, selectedRow]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{mode === 'create' ? 'Register Bank' : 'Edit Bank'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bank"
                value={formik.values.bank}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bank && Boolean(formik.errors.bank)}
                helperText={formik.touched.bank && formik.errors.bank}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Name"
                name="accountName"
                value={formik.values.accountName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.accountName && Boolean(formik.errors.accountName)}
                helperText={formik.touched.accountName && formik.errors.accountName}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Number"
                name="accountNo"
                value={formik.values.accountNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.accountNo && Boolean(formik.errors.accountNo)}
                helperText={formik.touched.accountNo && formik.errors.accountNo}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {mode === 'create' ? 'Submit' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BankAccountModal;
