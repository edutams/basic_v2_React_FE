import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  OutlinedInput,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import PrimaryButton from '../../shared/PrimaryButton';

const SetCommissionModal = ({ onClose, selectedAgent, onSave, loading }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const validationSchema = yup.object({
    commissionPercentage: yup
      .number()
      .min(0, 'Minimum is 0%')
      .max(100, 'Maximum is 100%')
      .required('Required'),
  });

  const formik = useFormik({
    initialValues: {
      commissionPercentage: selectedAgent?.commissionPercentage || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave({
        ...selectedAgent,
        commission_percentage: values.commissionPercentage
      });
      onClose();
    },
  });

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
      formik.setFieldValue('commissionPercentage', val);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
        Editing commission for <Box component="span" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>{selectedAgent?.agentDetails || 'Adebayo Ogunlesi'}</Box>
      </Typography>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
        Commission Percentage
      </Typography>

      <FormControl fullWidth sx={{ position: 'relative', mb: 4 }}>
        <OutlinedInput
          placeholder="60"
          value={formik.values.commissionPercentage}
          onChange={handleInputChange}
          onBlur={formik.handleBlur}
          type="number"
          sx={{
            borderRadius: '12px',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
              borderWidth: '2px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : '#CBD5E1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FEC120',
            },
            height: '56px',
            fontSize: '18px',
            fontWeight: 700,
            color: theme.palette.text.primary,
          }}
        />
      </FormControl>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
        <PrimaryButton variant="secondary" onClick={onClose} sx={{ minWidth: '100px' }}>
          Cancel
        </PrimaryButton>
        <PrimaryButton 
          variant="primary" 
          onClick={formik.handleSubmit} 
          disabled={!formik.isValid || loading}
          sx={{ minWidth: '100px' }}
        >
          {loading ? 'Saving...' : 'Save'}
        </PrimaryButton>
      </Box>
    </Box>
  );
};

SetCommissionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedAgent: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default SetCommissionModal;
