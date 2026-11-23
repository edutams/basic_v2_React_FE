import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Chip,
  Switch,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
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
import { CATEGORIES, CATEGORY_META, suggestAccountCode } from '../constants';

const MAX_DESCRIPTION_LENGTH = 250;

const validationSchema = Yup.object({
  name: Yup.string().required('Account Name is required'),
  category: Yup.string().required('Category is required'),
  postingAllowed: Yup.boolean(),
  description: Yup.string().max(MAX_DESCRIPTION_LENGTH),
  status: Yup.string().required('Status is required'),
});

const ChartOfAccountModal = ({ open, onClose, mode, selectedRow, onSubmit, existingAccounts = [] }) => {
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      postingAllowed: true,
      description: '',
      status: 'Active',
    },
    validationSchema,
    onSubmit: (values) => {
      const code =
        mode === 'edit' && selectedRow
          ? selectedRow.code
          : suggestAccountCode(values.category, existingAccounts);
      onSubmit({ ...values, code });
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && selectedRow) {
        formik.setValues({
          name: selectedRow.name || '',
          category: selectedRow.category || '',
          postingAllowed: selectedRow.postingAllowed ?? true,
          description: selectedRow.description || '',
          status: selectedRow.status || 'Active',
        });
      } else {
        formik.resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, selectedRow]);

  const suggestedCode = useMemo(() => {
    if (mode === 'edit' && selectedRow) return selectedRow.code;
    return formik.values.category
      ? suggestAccountCode(formik.values.category, existingAccounts)
      : '';
  }, [formik.values.category, mode, selectedRow, existingAccounts]);

  const categoryMeta = CATEGORY_META[formik.values.category];

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
                  ? 'Create a new account in the chart of accounts.'
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
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>
                        Account Code <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                      </Typography>
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
                      <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>
                        {suggestedCode || '—'}
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 7 }}>
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
                </Grid>

                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                    Posting Allowed <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={formik.values.postingAllowed}
                      onChange={(e) => formik.setFieldValue('postingAllowed', e.target.checked)}
                    />
                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                      Yes, allow financial transactions to be posted to this account
                    </Typography>
                  </Box>
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
                    {formik.values.category ? (
                      <>
                        You are creating a{formik.values.category === 'Assets' ? 'n' : ''}{' '}
                        {formik.values.category} account. Suggested code: <b>{suggestedCode}</b>
                      </>
                    ) : (
                      'Select a category to get a suggested account code.'
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
                    'Enable posting if transactions will be recorded to this account.',
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
