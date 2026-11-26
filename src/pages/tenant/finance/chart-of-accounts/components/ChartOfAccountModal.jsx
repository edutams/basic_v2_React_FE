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
  Chip,
  IconButton,
  Switch,
  RadioGroup,
  Radio,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  IconLayersIntersect,
  IconX,
  IconBolt,
  IconInfoCircle,
  IconRobot,
  IconBulb,
  IconBook2,
  IconCircleCheck,
  IconCheck,
} from '@tabler/icons';
import { CATEGORIES, CATEGORY_META, CATEGORY_API_VALUE, CLASSIFICATIONS_BY_CATEGORY } from '../constants';

const MAX_DESCRIPTION_LENGTH = 250;

const validationSchema = Yup.object({
  name: Yup.string().required('Account Name is required'),
  category: Yup.string().required('Category is required'),
  classification: Yup.string().required('Classification is required'),
  description: Yup.string().max(MAX_DESCRIPTION_LENGTH),
});

// `categoryRootMap` is { [categoryLabel]: rootNodeId } — the real
// chart_of_accounts row id for each of the 5 seeded root categories, only
// used to preview/label where the account sits; the actual create request
// sends `category`/`classification` directly, not a parent_id (detail
// accounts sit straight under their root now — see the backend's
// ChartOfAccountSeeder docblock for why there's no classification row to
// nest under any more).
const ChartOfAccountModal = ({
  open,
  onClose,
  mode,
  selectedRow,
  onSubmit,
  categoryRootMap = {},
  submitting = false,
}) => {
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      classification: '',
      description: '',
      postingAllowed: true,
      isActive: true,
    },
    validationSchema,
    onSubmit: (values) => {
      if (mode === 'edit' && selectedRow) {
        onSubmit({
          id: selectedRow.id,
          name: values.name,
          description: values.description,
          posting_allowed: values.postingAllowed,
          is_active: values.isActive,
        });
        return;
      }
      onSubmit({
        category: CATEGORY_API_VALUE[values.category],
        classification: values.classification,
        name: values.name,
        description: values.description,
        posting_allowed: values.postingAllowed,
        is_active: values.isActive,
      });
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && selectedRow) {
        formik.setValues({
          name: selectedRow.name || '',
          category: selectedRow.category || '',
          classification: selectedRow.classificationKey || '',
          description: selectedRow.description || '',
          postingAllowed: selectedRow.postingAllowed ?? true,
          isActive: selectedRow.isActive ?? true,
        });
      } else {
        formik.resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, selectedRow]);

  const categoryMeta = CATEGORY_META[formik.values.category];
  const classificationOptions = CLASSIFICATIONS_BY_CATEGORY[formik.values.category] || [];
  const previewCode =
    mode === 'edit' && selectedRow
      ? selectedRow.code
      : formik.values.category && formik.values.classification
        ? 'auto-generated on save'
        : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            px: 3,
            pt: 3,
            pb: 2,
          }}
        >
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
              <IconLayersIntersect size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {mode === 'create' ? 'Add Account' : 'Edit Account'}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
                {mode === 'create'
                  ? 'Create a new detail account under a classification in the chart of accounts.'
                  : 'Update this account in the chart of accounts.'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            {/* ===================== Left: Account Details ===================== */}
            <Grid size={{ xs: 12, md: 7.5 }}>
              <Box
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '14px',
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2.5 }}>
                  Account Details
                </Typography>

                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                    Account Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter account name (e.g., Staff Salaries)"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                      Category <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={mode === 'edit'}
                      error={formik.touched.category && Boolean(formik.errors.category)}
                    >
                      <Select
                        displayEmpty
                        name="category"
                        value={formik.values.category}
                        onChange={(e) => {
                          formik.setFieldValue('category', e.target.value);
                          formik.setFieldValue('classification', '');
                        }}
                        onBlur={formik.handleBlur}
                      >
                        <MenuItem value="" disabled>
                          Select category
                        </MenuItem>
                        {CATEGORIES.map((cat) => (
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
                      Classification <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={mode === 'edit' || !formik.values.category}
                      error={formik.touched.classification && Boolean(formik.errors.classification)}
                    >
                      <Select
                        displayEmpty
                        name="classification"
                        value={formik.values.classification}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <MenuItem value="" disabled>
                          {formik.values.category ? 'Select classification' : 'Select category first'}
                        </MenuItem>
                        {classificationOptions.map((c) => (
                          <MenuItem key={c.key} value={c.key}>
                            {c.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.classification && formik.errors.classification && (
                        <FormHelperText>{formik.errors.classification}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>Account Code</Typography>
                    <IconInfoCircle size={14} color={theme.palette.text.disabled} />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px',
                      bgcolor: theme.palette.action.hover,
                      px: 1.5,
                      height: 40,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, flexGrow: 1, color: previewCode ? 'text.primary' : 'text.disabled' }}>
                      {previewCode || '—'}
                    </Typography>
                    <Chip
                      icon={<IconBolt size={13} />}
                      label="Auto-generated"
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: 11,
                        '& .MuiChip-icon': { color: theme.palette.primary.main },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', px: 1.5, py: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>
                      Posting Allowed <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {formik.values.postingAllowed
                        ? 'Yes, allow financial transactions to be posted to this account'
                        : 'No, this account is informational only — nothing can be posted to it'}
                    </Typography>
                  </Box>
                  <Switch
                    checked={formik.values.postingAllowed}
                    onChange={(e) => formik.setFieldValue('postingAllowed', e.target.checked)}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                    Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Briefly describe the purpose of this account (e.g., Salaries and related staff costs)"
                    name="description"
                    value={formik.values.description}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                        formik.handleChange(e);
                      }
                    }}
                  />
                  <Typography sx={{ fontSize: 11.5, color: 'text.disabled', textAlign: 'right', mt: 0.5 }}>
                    {formik.values.description.length} / {MAX_DESCRIPTION_LENGTH}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                    Status <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                  <RadioGroup
                    row
                    value={formik.values.isActive ? 'active' : 'inactive'}
                    onChange={(e) => formik.setFieldValue('isActive', e.target.value === 'active')}
                  >
                    <FormControlLabel value="active" control={<Radio size="small" />} label="Active" />
                    <FormControlLabel value="inactive" control={<Radio size="small" />} label="Inactive" />
                  </RadioGroup>
                </Box>
              </Box>
            </Grid>

            {/* ===================== Right: Account Assistant ===================== */}
            <Grid size={{ xs: 12, md: 4.5 }}>
              <Box
                sx={{
                  bgcolor: theme.palette.primary.light,
                  borderRadius: '14px',
                  p: 2.5,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: theme.palette.primary.main,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconRobot size={20} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>
                      Account Assistant
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      Get intelligent guidance for creating the right account.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                  <IconBulb size={15} color={theme.palette.warning.main} />
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Smart Suggestion</Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: theme.palette.success.light,
                    border: `1px solid ${theme.palette.success.main}33`,
                    borderRadius: '10px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 2.5,
                  }}
                >
                  <IconCircleCheck size={18} color={theme.palette.success.main} style={{ flexShrink: 0, marginTop: 1 }} />
                  <Typography sx={{ fontSize: 12.5, color: theme.palette.success.dark, flexGrow: 1 }}>
                    {formik.values.category && formik.values.classification ? (
                      <>
                        This will be created under <b>{categoryMeta ? formik.values.category : ''} → {classificationOptions.find((c) => c.key === formik.values.classification)?.label}</b>.
                      </>
                    ) : (
                      'Select a category and classification to see where this account will sit.'
                    )}
                  </Typography>
                  <IconInfoCircle size={14} color={theme.palette.success.main} style={{ flexShrink: 0 }} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                  <IconBook2 size={15} color={theme.palette.primary.main} />
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Quick Guide</Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    borderRadius: '10px',
                    p: 1.5,
                  }}
                >
                  {[
                    'Use a clear and short account name.',
                    'Select the correct category (Assets, Liabilities, Equity, Income or Expenditure).',
                    'Every account also needs a classification — the two fixed options under its category.',
                    'Add a brief description for better understanding.',
                  ].map((tip) => (
                    <Box key={tip} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1, '&:last-of-type': { mb: 0 } }}>
                      <IconCircleCheck size={15} color={theme.palette.success.main} style={{ flexShrink: 0, marginTop: 2 }} />
                      <Typography sx={{ fontSize: 12.5 }}>{tip}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
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
            disabled={submitting}
            startIcon={<IconCheck size={18} />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
          >
            Save Account
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChartOfAccountModal;
