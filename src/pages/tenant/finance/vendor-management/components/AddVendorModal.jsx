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
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconX, IconCheck, IconUsers } from '@tabler/icons';
import { VENDOR_CATEGORIES } from '../constants';

const validationSchema = Yup.object({
  name: Yup.string().required('Vendor name is required'),
  category: Yup.string().required('Category is required'),
  contactPerson: Yup.string().required('Contact person is required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  tin: Yup.string(),
  address: Yup.string().required('Address is required'),
  status: Yup.string().required('Status is required'),
});

const initialValues = {
  name: '',
  category: '',
  contactPerson: '',
  phone: '',
  email: '',
  tin: '',
  address: '',
  status: 'Active',
};

const AddVendorModal = ({ open, onClose, onSubmit, mode = 'create', vendor = null }) => {
  const theme = useTheme();
  const isEdit = mode === 'edit' && vendor;

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: isEdit
          ? {
              name: vendor.name || '',
              category: vendor.category || '',
              contactPerson: vendor.contactPerson || '',
              phone: vendor.phone || '',
              email: vendor.email || '',
              tin: vendor.tin || '',
              address: vendor.address || '',
              status: vendor.status || 'Active',
            }
          : initialValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, vendor]);

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
              <IconUsers size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {isEdit ? 'Edit Vendor' : 'Add Vendor'}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
                {isEdit
                  ? 'Update this supplier or service provider record.'
                  : 'Add a new supplier or service provider record.'}
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
                Vendor Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., Alpha Books Ltd"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Category <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <FormControl
                fullWidth
                size="small"
                error={formik.touched.category && Boolean(formik.errors.category)}
              >
                <Select
                  displayEmpty
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="" disabled>
                    Select category
                  </MenuItem>
                  {VENDOR_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <FormHelperText>{formik.errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Contact Person <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., Mr. Segun Adebayo"
                name="contactPerson"
                value={formik.values.contactPerson}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                helperText={formik.touched.contactPerson && formik.errors.contactPerson}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Phone <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., 0803 123 4567"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Email <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., sales@alphabooks.com"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>TIN</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., 0123456789"
                name="tin"
                value={formik.values.tin}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Status <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={formik.values.status}
                onChange={(e, val) => val && formik.setFieldValue('status', val)}
                sx={{ gap: 1.5 }}
              >
                <ToggleButton
                  value="Active"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px !important',
                    border: `1px solid ${theme.palette.divider} !important`,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.success.light,
                      color: theme.palette.success.dark,
                      borderColor: `${theme.palette.success.main} !important`,
                      '&:hover': { bgcolor: theme.palette.success.light },
                    },
                  }}
                >
                  ● Active
                </ToggleButton>
                <ToggleButton
                  value="Inactive"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px !important',
                    border: `1px solid ${theme.palette.divider} !important`,
                    px: 2,
                  }}
                >
                  ○ Inactive
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid size={12}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Address <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="e.g., 12 Education Close, Ikeja, Lagos."
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
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
            {isEdit ? 'Save Changes' : 'Save Vendor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddVendorModal;
