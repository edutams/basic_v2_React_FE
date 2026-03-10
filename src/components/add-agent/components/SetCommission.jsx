import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Stack,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import PrimaryButton from '../../shared/PrimaryButton';
import { IconArrowUp } from '@tabler/icons-react';

const SetCommissionModal = ({ onClose, selectedAgent, onSave, loading }) => {
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
      const updatedValues = {
        ...selectedAgent,
        commissionPercentage: values.commissionPercentage,
        // Since handleUpdate in AgentModal expects certain fields, 
        // we should ensure we're passing what it needs or update the logic there.
        // For now, let's keep it consistent with how it was used.
      };
      
      // The handleUpdate expects the formik values structure if called from onSubmit
      // but here SetCommission calls onSave(handleUpdate) with values.
      // Let's refine this to match the backend expectation or the handleUpdate logic.
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
      <Typography variant="body1" sx={{ color: '#64748B', mb: 3 }}>
        Editing commission for <Box component="span" sx={{ fontWeight: 800, color: '#1E293B' }}>{selectedAgent?.agentDetails || 'Adebayo Ogunlesi'}</Box>
      </Typography>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
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
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            },
            height: '56px',
            fontSize: '18px',
            fontWeight: 700,
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
          Save
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
