import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  code: Yup.string().required('Account Code is required'),
  name: Yup.string().required('Account Name is required'),
  category: Yup.string().required('Category is required'),
  linkedBank: Yup.string(),
});

const ChartOfAccountModal = ({ open, onClose, mode, selectedRow, onSubmit }) => {
  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      category: '',
      linkedBank: '',
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
          code: selectedRow.code || '',
          name: selectedRow.name || '',
          category: selectedRow.category || '',
          linkedBank: selectedRow.linkedBank !== '—' ? selectedRow.linkedBank : '',
        });
      } else {
        formik.resetForm();
      }
    }
  }, [open, mode, selectedRow]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create Chart of Account' : 'Edit Chart of Account'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Code"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl
                fullWidth
                error={formik.touched.category && Boolean(formik.errors.category)}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="Asset">Asset</MenuItem>
                  <MenuItem value="Liability">Liability</MenuItem>
                  <MenuItem value="Equity">Equity</MenuItem>
                  <MenuItem value="Revenue">Revenue</MenuItem>
                  <MenuItem value="Expense">Expense</MenuItem>
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <FormHelperText>{formik.errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Linked Bank</InputLabel>
                <Select
                  label="Linked Bank"
                  name="linkedBank"
                  value={formik.values.linkedBank}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Zenith Bank">Zenith Bank</MenuItem>
                  <MenuItem value="GTBank">GTBank</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button size="small" type="submit">{mode === 'create' ? 'Submit' : 'Save Changes'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChartOfAccountModal;
